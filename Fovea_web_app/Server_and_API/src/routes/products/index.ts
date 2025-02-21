import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";

import path from "path";
import fs from "fs";

import ffmpeg from "ffmpeg";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

import { adminMiddleware, securityMiddleware } from "../../middlewares/roles";
import {
    PrismaClientUnknownRequestError,
    PrismaClientValidationError,
} from "@prisma/client/runtime/library";

import { bozoDeleteProduct, bozoPostProduct } from "../../lib/ai/bozoprovider";

import meilisearchClient from "../../lib/meilisearch";

import { createCanvas } from "canvas";
import JsBarCode from "jsbarcode";

const router = express.Router();
const prisma = new PrismaClient();

const alreadyExistsMiddleware = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const { name, reference } = req.body;
    const product = await prisma.product.findFirst({
        where: {
            OR: [
                {
                    name: name,
                },
                {
                    reference: reference,
                },
            ],
        },
    });

    if (product) {
        return res.status(409).json({ error: "Product already exists" });
    }

    next();
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = `uploads/products/${req.res?.locals.id}`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, "video.mp4");
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (file.mimetype === "video/mp4") {
            callback(null, true);
        } else {
            callback(new Error("Only mp4 files are allowed"));
        }
    },
});

router.get("/", securityMiddleware, async (req, res, next) => {
    try {
        // handle search parameters : ?limit=x & ?offset=y & ?category=z & ?tag=a & ?priceMin=b & ?priceMax=c & ?dateMin=d & ?dateMax=e & ?dateSort=ASC/DESC
        const {
            limit,
            offset,
            category,
            tag,
            priceMin,
            priceMax,
            dateMin,
            dateMax,
            dateSort,
        } = req.query;

        const searchParams: any = {};

        if (limit) {
            searchParams.take = parseInt(limit as string);
        }

        if (offset) {
            searchParams.skip = parseInt(offset as string);
        }

        if (category) {
            searchParams.where = {
                category: {
                    id: category,
                },
            };
        }

        // search the tag by names instead of ids
        if (tag) {
            searchParams.where = {
                tag: {
                    some: {
                        name: tag,
                    },
                },
            };
        }

        // make price min or max optional for search
        if (priceMin || priceMax) {
            searchParams.where = {
                ...searchParams.where,
                price: {
                    ...searchParams.where?.price,
                    ...(priceMin && { gte: parseFloat(priceMin as string) }),
                    ...(priceMax && { lte: parseFloat(priceMax as string) }),
                },
            };
        }

        // make date min or max optional for search
        if (dateMin || dateMax) {
            searchParams.where = {
                ...searchParams.where,
                createdAt: {
                    ...searchParams.where?.createdAt,
                    ...(dateMin && { gte: new Date(dateMin as string) }),
                    ...(dateMax && { lte: new Date(dateMax as string) }),
                },
            };
        }

        if (dateSort) {
            searchParams.orderBy = {
                createdAt: dateSort as "asc" | "desc",
            };
        }

        const products = await prisma.product.findMany({
            include: {
                pictures: true,
                category: true,
                tag: true,
                barCode: true,
            },
            ...searchParams,
        });
        res.json(products);
    } catch (error) {
        next(error);
    }
});

function ffmpegSync(
    videoPath: string,
    framesDestinationFolder: string
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        new ffmpeg(videoPath).then((video) => {
            let image;
            video.fnExtractFrameToJPG(
                framesDestinationFolder,
                {
                    file_name: "%d",
                    frame_rate: 10,
                },
                (error, files) => {
                    if (error) {
                        reject(error);
                    } else if (files) {
                        resolve(files);
                    }
                }
            );
        });
    });
}

router.get("/:id", securityMiddleware, async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
        where: {
            id: id,
        },
        include: {
            pictures: true,
            category: true,
            tag: true,
            barCode: true,
        },
    });

    res.json(product);
});

router.post(
    "/",
    securityMiddleware,
    alreadyExistsMiddleware,
    (req, res, next) => {
        res.locals.id = uuidv4();
        next();
    },
    upload.single("video"),
    async (req, res, next) => {
        try {
            const id = res.locals.id;
            console.log(id);
            const { name, description, price, category, reference } = req.body;
            // save video
            const videoPath = path.join(
                __dirname,
                "..",
                "..",
                "..",
                "uploads",
                "products",
                id,
                "video.mp4"
            );

            const framesDestinationFolder = path.join(
                __dirname,
                "..",
                "..",
                "..",
                "uploads",
                "products",
                id
            );

            const images = await ffmpegSync(videoPath, framesDestinationFolder);

            // construct a metadata file
            const productData: {
                id: string;
                name: string;
                category: string;
                frames: {
                    url: string;
                }[];
            } = {
                id,
                name,
                category,
                frames: [],
            };

            const frames = fs
                .readdirSync(framesDestinationFolder)
                .filter((file) => path.extname(file) === ".jpg")
                .sort(
                    (a, b) =>
                        parseInt(a.split("_")[1]) - parseInt(b.split("_")[1])
                )
                .map((frame) => {
                    return {
                        url: `/uploads/products/${id}/${frame}`,
                    };
                });

            productData.frames = frames;

            // save productData as productData.json
            fs.writeFileSync(
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "uploads",
                    "products",
                    id,
                    "productData.json"
                ),
                JSON.stringify(productData, null, 2)
            );

            const product = await prisma.product.create({
                data: {
                    id: id,
                    name,
                    description,
                    price: parseFloat(price),
                    category: {
                        connect: {
                            id: category,
                        },
                    },
                    pictures: {
                        create: frames.map((frame) => {
                            return {
                                url: frame.url,
                            };
                        }),
                    },
                    reference,
                },
                include: {
                    pictures: true,
                    category: true,
                },
            });

            meilisearchClient.index("products").addDocuments([product]);

            // Generate the barcode
            const barCodeCanvas = createCanvas(100, 100);
            JsBarCode(barCodeCanvas, reference, {
                width: 2,
                height: 70,
                lineColor: "#1E293B",
                displayValue: false,
            });

            const barCodeImage = barCodeCanvas.toBuffer("image/png");

            fs.writeFileSync(
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "uploads",
                    "products",
                    id,
                    `barcode.png`
                ),
                barCodeImage
            );
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    barCode: {
                        create: {
                            pictureUrl: `/uploads/products/${id}/barcode.png`,
                            code: reference,
                        },
                    },
                },
            });

            try {
              bozoPostProduct(product.id);
            } catch (error) {
                console.error("Failed to post product to AI", error);
            }

            res.json(product);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/:id",
    securityMiddleware,
    (req, res, next) => {
        res.locals.id = req.params.id;
        next();
    },
    upload.single("video"),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            // Fetch the existing product with its pictures
            const existingProduct = await prisma.product.findUnique({
                where: { id: id },
                include: { pictures: true },
            });

            if (!existingProduct) {
                return res.status(404).json({ error: "Product not found" });
            }

            let { name, description, price, category, reference } = req.body;
            // if not all the fields are provided, use the existing ones
            name = name || existingProduct.name;
            description = description || existingProduct.description;
            price = price || existingProduct.price;
            category = category || existingProduct.categoryId;
            reference = reference || existingProduct.reference;

            const productData: {
                id: string;
                name: string;
                category: string;
                frames: {
                    url: string;
                }[];
            } = {
                id,
                name,
                category,
                frames: [],
            };

            const framesDestinationFolder = path.join(
                __dirname,
                "..",
                "..",
                "..",
                "uploads",
                "products",
                id
            );

            console.log(framesDestinationFolder);

            if (req.file) {
                // remove *.jpg files from the product folder
                fs.readdirSync(framesDestinationFolder)
                    .filter((file) => path.extname(file) === ".jpg")
                    .map((file) =>
                        fs.unlinkSync(path.join(framesDestinationFolder, file))
                    );
                const videoPath = path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "uploads",
                    "products",
                    id,
                    "video.mp4"
                );
                const images = await ffmpegSync(
                    videoPath,
                    framesDestinationFolder
                );
                const frames = fs
                    .readdirSync(framesDestinationFolder)
                    .filter((file) => path.extname(file) === ".jpg")
                    .sort(
                        (a, b) =>
                            parseInt(a.split("_")[1]) -
                            parseInt(b.split("_")[1])
                    )
                    .map((frame) => {
                        return {
                            url: `/uploads/products/${id}/${frame}`,
                        };
                    });
                productData.frames = frames;
            } else {
                const productDataPath = path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "uploads",
                    "products",
                    id,
                    "productData.json"
                );
                const productDataContent = fs.readFileSync(
                    productDataPath,
                    "utf-8"
                );
                const productDataObject = JSON.parse(productDataContent);
                productData.frames = productDataObject.frames;
            }

            // save productData as productData.json
            fs.writeFileSync(
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "uploads",
                    "products",
                    id,
                    "productData.json"
                ),
                JSON.stringify(productData, null, 2)
            );

            //barcode
            const barCodeCanvas = createCanvas(100, 100);
            JsBarCode(barCodeCanvas, reference, {
                width: 2,
                height: 70,
                lineColor: "#1E293B",
                displayValue: false,
            });

            const barCodeImage = barCodeCanvas.toBuffer("image/png");

            fs.writeFileSync(
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "uploads",
                    "products",
                    id,
                    `barcode.png`
                ),
                barCodeImage
            );

            let product;

            // Update the product in the database
            if (req.file) {
                product = await prisma.product.update({
                    where: { id: id },
                    data: {
                        name,
                        description,
                        price: parseFloat(price),
                        category: {
                            connect: {
                                id: category,
                            },
                        },
                        barCode: {
                            delete: {},
                            create: {
                                pictureUrl: `/uploads/products/${id}/barcode.png`,
                                code: reference,
                            },
                        },
                        pictures: {
                            deleteMany: {},
                            create: productData.frames.map((frame) => {
                                return {
                                    url: frame.url,
                                };
                            }),
                        },
                        reference,
                    },
                    include: {
                        pictures: true,
                        category: true,
                    },
                });
            } else {
                product = await prisma.product.update({
                    where: { id: id },
                    data: {
                        name,
                        description,
                        price: parseFloat(price),
                        barCode: {
                            delete: {},
                            create: {
                                pictureUrl: `/uploads/products/${id}/barcode.png`,
                                code: reference,
                            },
                        },
                        category: {
                            connect: {
                                id: category,
                            },
                        },
                        reference,
                    },
                    include: {
                        pictures: true,
                        category: true,
                    },
                });
            }

            meilisearchClient.index("products").updateDocuments([product]);

            return res.json(product);
        } catch (error) {
            next(error);
        }
    }
);

router.delete("/:id", adminMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: id },
            include: { pictures: true },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Delete the product pictures
        for (const picture of product.pictures) {
            // before deleting, verify if the file is not used by another product
            const pictureUsage = await prisma.product.count({
                where: {
                    pictures: {
                        some: {
                            id: picture.id,
                        },
                    },
                },
            });

            if (pictureUsage > 1) {
                continue;
            }

            await prisma.productPicture.delete({
                where: { id: picture.id },
            });
        }

        await prisma.barCode.delete({
            where: { productId: id },
        });

        // Delete the product from the database
        await prisma.product.delete({
            where: { id: id },
        });

        meilisearchClient.index("products").deleteDocument(id);

        // unlink /uploads/products/{id} folder
        const productFolder = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "uploads",
            "products",
            id
        );

        fs.rmdirSync(productFolder, { recursive: true });

        try {
            bozoDeleteProduct(product.id);
        } catch (error) {
            console.error("Failed to delete product from AI", error);
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
});

router.use(
    (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error(error);
        if (error instanceof PrismaClientValidationError) {
            res.status(500).json({
                error: error.name,
                message: error.message,
            });
        }
        if (error instanceof PrismaClientUnknownRequestError) {
            res.status(500).json({
                error: error.name,
                message: error.message,
            });
        } else {
            res.status(500).json({ error: "An error occurred" });
        }
    }
);

export default router;
