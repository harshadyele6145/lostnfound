import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import validate from "../middleware/validate.js";

const router = Router();
const createToken = (user) => jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
const payload = (user) => ({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } });

router.post(
  "/register",
  validate({
    name: { required: true, minLength: 2 },
    email: { required: true, minLength: 5 },
    password: { required: true, minLength: 6 },
  }),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();
      if (await prisma.user.findUnique({ where: { email: normalizedEmail } })) return res.status(409).json({ message: "An account with this email already exists." });
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({ data: { name, email: normalizedEmail, password: hashedPassword } });
      res.status(201).json(payload(user));
    } catch (error) { next(error); }
  }
);

router.post(
  "/login",
  validate({
    email: { required: true, minLength: 5 },
    password: { required: true, minLength: 6 },
  }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase().trim() } });
      if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Incorrect email or password." });
      res.json(payload(user));
    } catch (error) { next(error); }
  }
);

router.post("/logout", (_req, res) => {
  return res.status(204).end();
});

export default router;
