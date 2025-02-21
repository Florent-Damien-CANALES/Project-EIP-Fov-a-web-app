import { seed as accountsSeed } from "./accounts/";
import { seed as categoriesSeed } from "./categories/";

import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

import dotenv from "dotenv";
dotenv.config();

export async function seed() {
  console.log("---");
  console.log("Seeding categories...");
  await categoriesSeed();
  console.log("---");
  console.log("Seeding accounts...");
  await accountsSeed();
  console.log("---");
}
