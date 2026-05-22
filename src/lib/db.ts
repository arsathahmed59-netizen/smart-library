import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import fs from "fs";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
  const sourceDbPath = path.resolve(process.cwd(), "dev.db");
  const targetDbPath = path.resolve("/tmp", "dev.db");

  let dbPath = sourceDbPath;
  
  // On Vercel, copy the database to the writable /tmp directory to allow write operations
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    try {
      if (!fs.existsSync(targetDbPath)) {
        fs.mkdirSync(path.dirname(targetDbPath), { recursive: true });
        fs.copyFileSync(sourceDbPath, targetDbPath);
        fs.chmodSync(targetDbPath, 0o666);
      }
      dbPath = targetDbPath;
    } catch (error) {
      console.error("Failed to copy database to /tmp, falling back to source:", error);
    }
  }

  const adapter = new PrismaLibSql({
    url: `file:${dbPath}`,
  });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;




