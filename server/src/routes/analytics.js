import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// Summary: totals and recovery rate
router.get("/summary", async (req, res, next) => {
  try {
    const { from, to, location } = req.query;
    const whereBase = {};
    if (location) whereBase.location = { contains: location, mode: "insensitive" };
    if (from || to) whereBase.createdAt = {};
    if (from) whereBase.createdAt.gte = new Date(from);
    if (to) whereBase.createdAt.lte = new Date(to);

    const totalLost = await prisma.item.count({ where: { ...whereBase, type: "lost" } });
    const totalFound = await prisma.item.count({ where: { ...whereBase, type: "found" } });
    const totalUsers = await prisma.user.count();
    const resolved = await prisma.item.count({ where: { ...whereBase, status: "RESOLVED" } });
    const totalReports = await prisma.item.count({ where: whereBase });
    const recoveryRate = totalReports === 0 ? 0 : Math.round((resolved / totalReports) * 10000) / 100; // percent with 2 decimals

    res.json({ totalLost, totalFound, totalUsers, totalReports, resolved, recoveryRate });
  } catch (error) { next(error); }
});

// Monthly reports (last 12 months) grouped by month for lost/found
router.get("/monthly", async (req, res, next) => {
  try {
    const { from: qFrom, to: qTo, location } = req.query;
    const now = new Date();
    let from;
    let to;
    if (qFrom || qTo) {
      from = qFrom ? new Date(qFrom) : new Date(qTo ? new Date(qTo).getFullYear() - 1 : new Date(now.getFullYear(), now.getMonth() - 11, 1));
      to = qTo ? new Date(qTo) : new Date();
    } else {
      from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      to = now;
    }

    // build where
    const where = { createdAt: { gte: from, lte: to } };
    if (location) where.location = { contains: location, mode: "insensitive" };

    const reports = await prisma.item.findMany({ where, select: { id: true, type: true, createdAt: true } });

    // build months between from and to
    const months = [];
    const startMonth = new Date(from.getFullYear(), from.getMonth(), 1);
    const endMonth = new Date(to.getFullYear(), to.getMonth(), 1);
    for (let d = new Date(startMonth); d <= endMonth; d.setMonth(d.getMonth() + 1)) {
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString("default", { month: "short", year: "numeric" }) });
    }

    const data = months.map((m) => {
      const start = new Date(m.year, m.month - 1, 1);
      const end = new Date(m.year, m.month, 1);
      const monthItems = reports.filter((r) => new Date(r.createdAt) >= start && new Date(r.createdAt) < end);
      return { label: m.label, lost: monthItems.filter((i) => i.type === "lost").length, found: monthItems.filter((i) => i.type === "found").length };
    });

    res.json({ data });
  } catch (error) { next(error); }
});

// Charts-friendly endpoint: returns arrays of labels and datasets
router.get("/charts", async (req, res, next) => {
  try {
    // reuse monthly logic to build charts
    const { from, to, location } = req.query;
    const q = { query: { from, to, location } };
    // call monthly logic by replicating behavior
    const now = new Date();
    let mFrom;
    let mTo;
    if (from || to) {
      mFrom = from ? new Date(from) : new Date(to ? new Date(to).getFullYear() - 1 : new Date(now.getFullYear(), now.getMonth() - 11, 1));
      mTo = to ? new Date(to) : new Date();
    } else {
      mFrom = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      mTo = now;
    }
    const where = { createdAt: { gte: mFrom, lte: mTo } };
    if (location) where.location = { contains: location, mode: "insensitive" };
    const reports = await prisma.item.findMany({ where, select: { id: true, type: true, createdAt: true } });
    const months = [];
    const startMonth = new Date(mFrom.getFullYear(), mFrom.getMonth(), 1);
    const endMonth = new Date(mTo.getFullYear(), mTo.getMonth(), 1);
    for (let d = new Date(startMonth); d <= endMonth; d.setMonth(d.getMonth() + 1)) months.push(d.toLocaleString("default", { month: "short", year: "numeric" }));
    const labels = months;
    const map = {};
    for (const label of labels) map[label] = { lost: 0, found: 0 };
    for (const r of reports) {
      const label = new Date(r.createdAt).toLocaleString("default", { month: "short", year: "numeric" });
      if (!map[label]) map[label] = { lost: 0, found: 0 };
      map[label][r.type] = (map[label][r.type] || 0) + 1;
    }
    const lost = labels.map((l) => map[l]?.lost || 0);
    const found = labels.map((l) => map[l]?.found || 0);
    res.json({ labels, datasets: { lost, found } });
  } catch (error) { next(error); }
});

export default router;
