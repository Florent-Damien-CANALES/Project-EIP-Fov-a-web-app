import { PrismaClient } from "@prisma/client";
import data from "./data.json";
import fs from "fs";
import path from "path";

import meilisearchClient from "../../lib/meilisearch";

type category = {
  id: string;
  picture: string;
};

export async function seed() {
  const prisma = new PrismaClient();

  const iterator = Object.keys(data);

  for (const category of iterator) {
    // get the account from the data
    console.log(category);
    const categoryData = data[category as keyof typeof data] as category;

    const categoryExists = await prisma.category.findUnique({
      where: {
        id: categoryData.id,
      },
    });
    // Read the image file from /categories/images
    const imagePath = path.join(__dirname, categoryData.picture);
    const newImagePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "/uploads/categoriesPictures",
      categoryData.picture
    );

    // Copy the image file to /uploads/categoriesPictures
    fs.copyFileSync(imagePath, newImagePath);
    if (categoryExists) {
      continue;
    }

    const categoryObject = await prisma.category.create({
      data: {
        id: categoryData.id,
        name: category,
        coverPicture: {
          create: {
            url: "/uploads/categoriesPictures/" + categoryData.picture, // Update the URL to point to the new location
          },
        },
      },
    });
    meilisearchClient.index("categories").addDocuments([categoryObject]);
  }

  await prisma.$disconnect();
}
