import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./lib/prisma.js";

async function seed() {
  const email = "demo@campusfind.edu";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) user = await prisma.user.create({ data: { name: "CampusFind Demo", email, password: await bcrypt.hash("Demo123!", 12) } });
  const existing = await prisma.item.count({ where: { ownerId: user.id } });
  if (existing) { console.log("Demo reports already exist; no data was changed."); return; }
  const categories = ["Bags", "Electronics", "Cards", "Personal items", "Keys"];
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  await prisma.item.createMany({ data: [
    { title: "Navy blue student backpack", category: "Bags", location: "Central Library", date: "4 August", description: "Navy backpack with a laptop sleeve and a small silver keyring on the front zip.", type: "lost", ownerId: user.id, imageUrl: "/uploads/navy-backpack.png" },
    { title: "Black wireless earbuds case", category: "Electronics", location: "Engineering Block", date: "3 August", description: "Small black charging case found close to Lab 204. No engraving.", type: "found", ownerId: user.id },
    { title: "Student ID card", category: "Cards", location: "Main Cafeteria", date: "2 August", description: "ID card found by the beverage counter. Initials are A.K.", type: "found", ownerId: user.id },
    { title: "Silver metal water bottle", category: "Personal items", location: "Sports Complex", date: "1 August", description: "Stainless bottle with blue stickers and a black carry loop.", type: "lost", ownerId: user.id },
    { title: "Blue keychain with three keys", category: "Keys", location: "Hostel Block B", date: "31 July", description: "Found near the reception desk. Has a small round blue tag.", type: "found", ownerId: user.id },
  ] });
  console.log("Demo reports created. Sign in with demo@campusfind.edu / Demo123!");
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
