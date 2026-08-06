import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import fs from "fs/promises";
import prisma from "./lib/prisma.js";
import cloudinary from "./lib/cloudinary.js";
import logger from "./middleware/logger.js";
import auth from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();
const port = process.env.PORT || 5000;
const useCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

// Security: set security headers
app.use(helmet());

// Basic rate limiting for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Stricter limiter for authentication endpoints to mitigate brute-force
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth", authLimiter);

app.use(logger);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads",
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});
app.use("/uploads", express.static("uploads"));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

app.post("/api/uploads", auth, upload.single("image"), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Please upload an image file up to 5 MB." });

  if (useCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "campusfind" });
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(201).json({ imageUrl: result.secure_url, imagePublicId: result.public_id });
    } catch (error) {
      return next(error);
    }
  }

  res.status(201).json({ imageUrl: `/uploads/${req.file.filename}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

prisma.$connect().then(() => {
  console.log("Connected to PostgreSQL");
}).catch((error) => {
  console.warn("PostgreSQL is unavailable; starting in demo mode. Database-backed features will be unavailable.", error.message);
}).finally(() => {
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
});
