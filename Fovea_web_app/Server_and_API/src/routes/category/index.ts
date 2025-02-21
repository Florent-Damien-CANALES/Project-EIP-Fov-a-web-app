import express, { response } from 'express';

import { PrismaClient } from '@prisma/client';
import { adminMiddleware, securityMiddleware } from '../../middlewares/roles';

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

import meilisearchClient from '../../lib/meilisearch';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/categoriesPictures/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const prisma = new PrismaClient();

const router = express.Router();

router.get('/', securityMiddleware, async (req, res) => {
  const categories = await prisma.category.findMany({
    include: {
      coverPicture: true,
      products: {
        include: {
          barCode: true,
          pictures: true,
        },
      },
    },
  });
  res.json(categories);
});

router.post(
  '/',
  upload.single('picture'),
  adminMiddleware,
  async (req, res, next) => {
    const { name } = req.body;

    const picture = req.file! as Express.Multer.File;
    try {
      const coverPictureMedia = await prisma.categoryPicture.create({
        data: {
          url: `/uploads/categoriesPictures/${picture.originalname}`,
        },
      });

      const category = await prisma.category.create({
        data: {
          name: name,
          coverPicture: {
            connect: {
              id: coverPictureMedia.id,
            },
          },
        },
        include: {
          coverPicture: true,
          products: true,
        },
      });

      meilisearchClient.index('categories').addDocuments([category]);

      res.json(category);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', securityMiddleware, async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: {
      id: id,
    },
    include: {
      coverPicture: true,
      products: {
        include: {
          barCode: true,
          pictures: true,
        },
      },
    },
  });
  res.json(category);
});

router.put(
  '/:id',
  upload.single('picture'),
  adminMiddleware,
  async (req, res, next) => {
    const { id } = req.params;
    const { name, products } = req.body;

    try {
      const category = await prisma.category.findUnique({
        where: {
          id: id,
        },
      });

      const previousPicture = await prisma.categoryPicture.findUnique({
        where: {
          categoryId: id,
        },
      });

      const picture = req.file as Express.Multer.File | undefined;
      const coverPicture = picture
        ? `/uploads/categoriesPictures/${picture?.originalname}`
        : previousPicture?.url;

      if (previousPicture && picture) {
        fs.unlinkSync(
          path.join(__dirname, '..', '..', '..', previousPicture.url)
        );
      }

      const coverPictureId =
        (
          await prisma.categoryPicture.update({
            where: {
              categoryId: id,
            },
            data: {
              url: coverPicture,
            },
          })
        ).id ||
        (
          await prisma.categoryPicture.create({
            data: {
              url: coverPicture!,
            },
          })
        ).id;

      const newCategory = await prisma.category.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          coverPicture: {
            connect: {
              id: coverPictureId,
            },
          },
          products: {
            create: products,
          },
        },
      });

      meilisearchClient.index('categories').updateDocuments([newCategory]);

      res.json(newCategory);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', adminMiddleware, async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.delete({
      where: {
        id: id,
      },
    });

    const media = await prisma.categoryPicture.findUnique({
      where: {
        categoryId: id,
      },
    });

    await prisma.categoryPicture.delete({
      where: {
        categoryId: id,
      },
    });

    meilisearchClient.index('categories').deleteDocument(category.id);

    fs.unlinkSync(path.join(__dirname, '..', '..', '..', media!.url));
    res.json(category);
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
    } else {
      res.status(500).json({ error: 'An error occurred' });
    }
  }
);

export default router;
