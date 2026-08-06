import { Router } from "express";
import prisma from "../lib/prisma.js";
import cloudinary from "../lib/cloudinary.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import mailer from "../lib/mailer.js";
import jwt from "jsonwebtoken";

const router = Router();
const itemSelect = { id: true, title: true, category: true, location: true, date: true, description: true, type: true, status: true, imageUrl: true, imagePublicId: true, createdAt: true, ownerId: true, owner: { select: { name: true } } };

router.get("/", async (req, res, next) => {
  try {
    const type = ["lost", "found"].includes(req.query.type) ? req.query.type : undefined;
    const q = (req.query.q || "").trim();
    const category = req.query.category?.trim();
    const location = req.query.location?.trim();
    const date = req.query.date?.trim();

    const where = { status: "OPEN", ...(type ? { type } : {}) };
    if (category) where.category = { contains: category, mode: "insensitive" };
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (date) where.date = { contains: date, mode: "insensitive" };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.item.findMany({ where, select: itemSelect, orderBy: { createdAt: "desc" }, take: 60 });
    res.json(items);
  } catch (error) { next(error); }
});

router.post(
  "/",
  auth,
  validate({
    title: { required: true, minLength: 3 },
    category: { required: true, minLength: 2 },
    location: { required: true, minLength: 2 },
    date: { required: true, minLength: 3 },
    description: { required: true, minLength: 10 },
    type: { required: true, enum: ["lost", "found"] },
  }),
  async (req, res, next) => {
    try {
      const { title, category, location, date, description, type, imageUrl = "", imagePublicId = null } = req.body;
      const item = await prisma.item.create({
        data: {
          title,
          category,
          categoryRel: { connectOrCreate: { where: { name: category }, create: { name: category } } },
          location,
          date,
          description,
          type,
          imageUrl,
          imagePublicId,
          ownerId: req.user.id,
        },
        select: itemSelect,
      });
      // After creating an item, run a lightweight matching to notify owners of possible matches
      try {
        const candidates = await prisma.item.findMany({ where: { type: item.type === "lost" ? "found" : "lost", status: "OPEN", NOT: { id: item.id } }, include: { owner: true }, take: 60 });
        const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
        const tokens = (t) => new Set(normalize(t).split(" ").filter((w) => w.length > 2));
        const sourceTokens = tokens(`${item.title} ${item.description} ${item.category} ${item.location}`);
        const matches = candidates.map((candidate) => {
          const candTokens = tokens(`${candidate.title} ${candidate.description} ${candidate.category} ${candidate.location}`);
          const shared = [...sourceTokens].filter((w) => candTokens.has(w)).length;
          const union = new Set([...sourceTokens, ...candTokens]).size || 1;
          const semantic = shared / union;
          let score = 0;
          if (candidate.category.toLowerCase() === item.category.toLowerCase()) score += 30;
          if (candidate.location.toLowerCase() === item.location.toLowerCase()) score += 20;
          if (semantic > 0) score += Math.round(Math.min(50, semantic * 60));
          return { candidate, score };
        }).filter((m) => m.score >= 40);

        for (const m of matches) {
          const ownerEmail = m.candidate.owner?.email;
          if (ownerEmail && process.env.EMAIL_ENABLED === "true") {
            mailer.sendMail({
              to: ownerEmail,
              subject: `Possible match for your report: ${m.candidate.title}`,
              text: `We found a possible match (${m.score}% match) for your report "${m.candidate.title}". View it: ${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`,
              html: `<p>We found a possible match (<strong>${m.score}%</strong>) for your report "${m.candidate.title}".</p><p><a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard">View it on CampusFind</a></p>`,
            }).catch(() => {});
          }
        }
      } catch (e) { /* non-fatal */ }
      res.status(201).json(item);
    } catch (error) { next(error); }
  }
);

router.get("/mine", auth, async (req, res, next) => {
  try { res.json(await prisma.item.findMany({ where: { ownerId: req.user.id }, orderBy: { createdAt: "desc" } })); } catch (error) { next(error); }
});

router.get("/mine/claims", auth, async (req, res, next) => {
  try {
    const claims = await prisma.claim.findMany({ where: { item: { ownerId: req.user.id } }, include: { item: { select: { id: true, title: true, category: true, location: true, type: true, status: true } }, claimant: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } });
    res.json(claims);
  } catch (error) { next(error); }
});

router.get("/claims/mine", auth, async (req, res, next) => {
  try {
    const claims = await prisma.claim.findMany({ where: { claimantId: req.user.id }, include: { item: { select: { id: true, title: true, category: true, location: true, type: true, status: true } } }, orderBy: { createdAt: "desc" } });
    res.json(claims);
  } catch (error) { next(error); }
});

router.get("/search", async (req, res, next) => {
  try {
    const type = ["lost", "found"].includes(req.query.type) ? req.query.type : undefined;
    const q = (req.query.q || "").trim();
    const category = req.query.category?.trim();
    const location = req.query.location?.trim();
    const date = req.query.date?.trim();

    const where = { status: "OPEN", ...(type ? { type } : {}) };
    if (category) where.category = { contains: category, mode: "insensitive" };
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (date) where.date = { contains: date, mode: "insensitive" };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.item.findMany({ where, select: itemSelect, orderBy: { createdAt: "desc" }, take: 60 });
    res.json(items);
  } catch (error) { next(error); }
});

router.get("/:id/matches", auth, async (req, res, next) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: "Item report not found." });

    const normalize = (text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const tokens = (text) => new Set(normalize(text).split(" ").filter((word) => word.length > 2));
    const intersectionSize = (a, b) => {
      let count = 0;
      a.forEach((word) => { if (b.has(word)) count += 1; });
      return count;
    };

    const sourceText = `${item.title} ${item.description} ${item.category} ${item.location}`;
    const sourceTokens = tokens(sourceText);

    const candidates = await prisma.item.findMany({
      where: { type: item.type === "lost" ? "found" : "lost", status: "OPEN", NOT: { id: item.id } },
      select: itemSelect,
      take: 100,
    });

    const matches = candidates
      .map((candidate) => {
        const candidateText = `${candidate.title} ${candidate.description} ${candidate.category} ${candidate.location}`;
        const candidateTokens = tokens(candidateText);
        const sharedTokens = intersectionSize(sourceTokens, candidateTokens);
        const unionSize = new Set([...sourceTokens, ...candidateTokens]).size || 1;
        const semanticSimilarity = sharedTokens / unionSize;

        let score = 0;
        const reasons = [];

        if (candidate.category.toLowerCase() === item.category.toLowerCase()) {
          score += 30;
          reasons.push("same category");
        }

        if (candidate.location.toLowerCase() === item.location.toLowerCase()) {
          score += 20;
          reasons.push("same location");
        }

        if (candidate.title.toLowerCase() === item.title.toLowerCase()) {
          score += 10;
          reasons.push("same title");
        }

        if (semanticSimilarity > 0) {
          const semanticScore = Math.round(Math.min(40, semanticSimilarity * 40));
          score += semanticScore;
          reasons.push(`AI description similarity ${Math.round(semanticSimilarity * 100)}%`);
        }

        if (score > 100) score = 100;
        return { ...candidate, score, reasons };
      })
      .filter((match) => match.score >= 30)
      .sort((a, b) => b.score - a.score);

    res.json(matches);
  } catch (error) { next(error); }
});

router.post("/:id/claims", auth, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Please explain why this item may be yours." });
    const item = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: "Item report not found." });
    if (item.status !== "OPEN") return res.status(400).json({ message: "This report has already been resolved." });
    if (item.ownerId === req.user.id) return res.status(400).json({ message: "You cannot claim your own report." });
    const claim = await prisma.claim.create({ data: { itemId: item.id, claimantId: req.user.id, message } });
    // Notify report owner about the new claim
    try {
      const owner = await prisma.user.findUnique({ where: { id: item.ownerId } });
      if (owner?.email && process.env.EMAIL_ENABLED === "true") {
        mailer.sendMail({
          to: owner.email,
          subject: `New claim for your report: ${item.title}`,
          text: `${req.user.name || req.user.email} submitted a claim: "${message}". Review it on the dashboard.`,
          html: `<p><strong>${req.user.name || req.user.email}</strong> submitted a claim for your report "${item.title}".</p><p>Message: ${message}</p><p><a href="${process.env.CLIENT_URL || "http://localhost:5173"}/my-reports">Review claims</a></p>`,
        }).catch(() => {});
      }
    } catch (e) { /* ignore email errors */ }
    res.status(201).json(claim);
  } catch (error) { if (error.code === "P2002") return res.status(409).json({ message: "You already submitted a claim for this item." }); next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: req.params.id }, select: itemSelect });
    if (!item) return res.status(404).json({ message: "Item report not found." });
    res.json(item);
  } catch (error) { next(error); }
});

router.patch("/:id", auth, async (req, res, next) => {
  try {
    const { title, category, location, date, description, imageUrl, imagePublicId, type, status } = req.body;
    const item = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: "Item report not found." });
    if (item.ownerId !== req.user.id) return res.status(403).json({ message: "You can only update your own report." });
    const data = {};
    if (title) data.title = title;
    if (category) {
      data.category = category;
      data.categoryRel = { connectOrCreate: { where: { name: category }, create: { name: category } } };
    }
    if (location) data.location = location;
    if (date) data.date = date;
    if (description) data.description = description;
    if (typeof imageUrl === "string") {
      if (imageUrl === "" && item.imagePublicId) {
        await cloudinary.uploader.destroy(item.imagePublicId).catch(() => {});
      }
      data.imageUrl = imageUrl;
      data.imagePublicId = imagePublicId || null;
    }
    if (imagePublicId && imageUrl) {
      if (item.imagePublicId && item.imagePublicId !== imagePublicId) {
        await cloudinary.uploader.destroy(item.imagePublicId).catch(() => {});
      }
      data.imagePublicId = imagePublicId;
    }
    if (type) {
      if (!["lost", "found"].includes(type)) return res.status(400).json({ message: "Type must be lost or found." });
      data.type = type;
    }
    if (status) {
      if (!["OPEN", "RESOLVED"].includes(status)) return res.status(400).json({ message: "Status must be OPEN or RESOLVED." });
      data.status = status;
    }
    if (!Object.keys(data).length) return res.status(400).json({ message: "No changes provided." });
    const updated = await prisma.item.update({ where: { id: item.id }, data, select: itemSelect });
    res.json(updated);
  } catch (error) { next(error); }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: "Item report not found." });
    if (item.ownerId !== req.user.id) return res.status(403).json({ message: "You can only delete your own report." });
    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId).catch(() => {});
    }
    await prisma.item.delete({ where: { id: item.id } });
    res.status(204).end();
  } catch (error) { next(error); }
});

// Owner generates a short-lived QR token to verify a return with a claimant
router.get("/:id/qr-token", auth, async (req, res, next) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: "Item report not found." });
    if (item.ownerId !== req.user.id) return res.status(403).json({ message: "Only the report owner can generate a QR token." });

    const payload = { itemId: item.id, purpose: "verify_return" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } catch (error) { next(error); }
});

// Claimant posts a scanned token to verify they are the claimant and mark item returned
router.post("/verify-qr", auth, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required." });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
    if (payload.purpose !== "verify_return") return res.status(400).json({ message: "Invalid token purpose." });

    const item = await prisma.item.findUnique({ where: { id: payload.itemId }, include: { claims: true } });
    if (!item) return res.status(404).json({ message: "Item report not found." });

    // Check if the authenticated user has a pending claim for this item
    const claimantClaim = item.claims.find((c) => c.claimantId === req.user.id && c.status === "PENDING");
    if (!claimantClaim) return res.status(403).json({ message: "You do not have a pending claim for this item." });

    // Approve the claimant's claim and mark item resolved
    await prisma.$transaction([
      prisma.claim.update({ where: { id: claimantClaim.id }, data: { status: "APPROVED" } }),
      prisma.item.update({ where: { id: item.id }, data: { status: "RESOLVED" } }),
      prisma.claim.updateMany({ where: { itemId: item.id, id: { not: claimantClaim.id }, status: "PENDING" }, data: { status: "REJECTED" } }),
    ]);

    res.json({ message: "Claim verified and item marked returned." });
  } catch (error) { next(error); }
});

router.patch("/claims/:claimId", auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Choose approved or rejected." });
    const claim = await prisma.claim.findUnique({ where: { id: req.params.claimId }, include: { item: true } });
    if (!claim) return res.status(404).json({ message: "Claim not found." });
    if (claim.item.ownerId !== req.user.id) return res.status(403).json({ message: "You can only review claims for your own reports." });
    if (claim.status !== "PENDING") return res.status(400).json({ message: "This claim has already been reviewed." });
    const reviewedClaim = await prisma.claim.update({ where: { id: claim.id }, data: { status: status === "approved" ? "APPROVED" : "REJECTED" } });
    if (status === "approved") await prisma.$transaction([prisma.item.update({ where: { id: claim.itemId }, data: { status: "RESOLVED" } }), prisma.claim.updateMany({ where: { itemId: claim.itemId, id: { not: claim.id }, status: "PENDING" }, data: { status: "REJECTED" } })]);
    // Notify claimant of the review result
    try {
      const claimant = await prisma.user.findUnique({ where: { id: reviewedClaim.claimantId } });
      if (claimant?.email && process.env.EMAIL_ENABLED === "true") {
        const subject = status === "approved" ? `Your claim was approved for ${claim.item.title}` : `Your claim was rejected for ${claim.item.title}`;
        mailer.sendMail({
          to: claimant.email,
          subject,
          text: `Your claim for \"${claim.item.title}\" was ${status}.`,
          html: `<p>Your claim for <strong>${claim.item.title}</strong> was <strong>${status}</strong>.</p>`,
        }).catch(() => {});
      }
    } catch (e) { /* ignore */ }

    res.json(reviewedClaim);
  } catch (error) { next(error); }
});

export default router;
