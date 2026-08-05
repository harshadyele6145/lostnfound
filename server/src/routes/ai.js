import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";
import { createWorker } from "tesseract.js";
import OpenAI from "openai";
import prisma from "../lib/prisma.js";

const router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads",
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`),
  }),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

const openAi = process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const useOpenAI = Boolean(openAi);

const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokens = (text) => {
  const normalized = normalizeText(text || "");
  return new Set(normalized.split(" ").filter((word) => word.length > 2));
};

const intersectionSize = (a, b) => {
  let count = 0;
  a.forEach((word) => { if (b.has(word)) count += 1; });
  return count;
};

const extractTextFromImage = async (filePath) => {
  const worker = createWorker({ logger: () => {} });
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  return text.replace(/\s+/g, " ").trim();
};

const fallbackAssistantReply = (message) => {
  const normalized = normalizeText(message);
  if (normalized.includes("id") && normalized.includes("card")) {
    return "Upload your ID card image and I can help extract the text for you, so you can search for matching reports by name or details.";
  }
  if (normalized.includes("lost")) {
    return "If you lost something, use the report form and include a photo, location, and description. I can also suggest similar found items if you upload an image.";
  }
  if (normalized.includes("found")) {
    return "If you found an item, report it with a photo and location so others can claim it. I can also compare your image against reports and extract text from ID cards.";
  }
  if (normalized.includes("scan") || normalized.includes("ocr") || normalized.includes("extract")) {
    return "Use the OCR tool to scan an ID card photo. I will return any text I can read, like names, student IDs, and college details.";
  }
  if (normalized.includes("chat") || normalized.includes("assistant")) {
    return "I can help with reporting lost or found items, finding similar matches, and reading text from images. What would you like to do first?";
  }
  return "I can help you report lost or found items, compare an image against existing reports, and extract text from an ID card photo. Ask me anything about how to use CampusFind.";
};

const itemSelect = {
  id: true,
  title: true,
  category: true,
  location: true,
  date: true,
  description: true,
  type: true,
  status: true,
  imageUrl: true,
  imagePublicId: true,
  createdAt: true,
  ownerId: true,
  owner: { select: { name: true } },
};

router.post("/ocr", upload.single("image"), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Upload an image for OCR." });

  try {
    const text = await extractTextFromImage(req.file.path);
    await fs.unlink(req.file.path).catch(() => {});
    res.json({ text });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
});

router.post("/chat", async (req, res, next) => {
  try {
    const message = (req.body.message || "").trim();
    if (!message) return res.status(400).json({ message: "Please send a message to the assistant." });

    if (useOpenAI) {
      try {
        const response = await openAi.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are CampusFind, a friendly campus lost-and-found assistant. Answer succinctly and help users with reporting, matching, claiming, OCR, and searching." },
            { role: "user", content: message },
          ],
          temperature: 0.7,
        });
        const reply = response.choices?.[0]?.message?.content?.trim();
        if (reply) return res.json({ reply, source: "openai" });
      } catch (error) {
        console.warn("OpenAI assistant unavailable; using local assistant fallback.", error.message);
      }
    }

    res.json({ reply: fallbackAssistantReply(message), source: "fallback" });
  } catch (error) {
    next(error);
  }
});

router.post("/similarity", upload.single("image"), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Upload an image to find similar reports." });

  try {
    const imageText = await extractTextFromImage(req.file.path);
    await fs.unlink(req.file.path).catch(() => {});

    const type = ["lost", "found"].includes(req.body.type) ? req.body.type : null;
    const where = { status: "OPEN", ...(type ? { type: type === "lost" ? "found" : "lost" } : {}) };
    let candidates = [];
    try {
      candidates = await prisma.item.findMany({ where, select: itemSelect, take: 100 });
    } catch (error) {
      console.warn("Database unavailable; returning OCR without report matches.", error.message);
    }

    const sourceTokens = tokens(imageText || "");
    const matches = candidates
      .map((candidate) => {
        const candidateText = `${candidate.title} ${candidate.description} ${candidate.category} ${candidate.location}`;
        const candidateTokens = tokens(candidateText);
        const shared = intersectionSize(sourceTokens, candidateTokens);
        const union = new Set([...sourceTokens, ...candidateTokens]).size || 1;
        const semanticSimilarity = shared / union;

        let score = 0;
        const reasons = [];
        if (candidate.category && imageText.toLowerCase().includes(candidate.category.toLowerCase())) {
          score += 30;
          reasons.push("matching category found in image text");
        }
        if (candidate.location && imageText.toLowerCase().includes(candidate.location.toLowerCase())) {
          score += 20;
          reasons.push("matching location found in image text");
        }
        if (semanticSimilarity > 0) {
          const semanticScore = Math.round(Math.min(50, semanticSimilarity * 60));
          score += semanticScore;
          reasons.push(`image text similarity ${Math.round(semanticSimilarity * 100)}%`);
        }

        if (score > 100) score = 100;
        return { ...candidate, score, reasons };
      })
      .filter((match) => match.score >= 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    res.json({ ocrText: imageText, items: matches });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
});

export default router;
