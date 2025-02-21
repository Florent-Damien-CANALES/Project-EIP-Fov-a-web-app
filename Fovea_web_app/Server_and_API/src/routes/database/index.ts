import express from "express";
import { adminMiddleware } from "../../middlewares/roles";

import fs from "fs";
import path from "path";

import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/truncate", adminMiddleware, async (req, res) => {
    await prisma.barCode.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.shipping.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.productInvoice.deleteMany({});
    await prisma.productPicture.deleteMany({});
    const uploadsDir = path.join(__dirname, "../../../uploads/products/");
    // remove every folder inside uploadsDir
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        for (const file of files) {
            fs.rm(path.join(uploadsDir, file), { recursive: true }, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        }
    });
    res.send("Database truncated");
});

export default router;
