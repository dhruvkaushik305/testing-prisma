import { PrismaClient } from "@prisma/client-generated";

let prisma: PrismaClient;

declare global {
  //eslint-disable-next-line no-var
  var __db__: PrismaClient;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  prisma = global.__db__;
  prisma.$connect();
}

export default prisma;
