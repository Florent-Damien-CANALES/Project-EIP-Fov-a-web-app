import express from 'express';
import { securityMiddleware } from '../../middlewares/roles';
import dir from 'path';
import fs from 'fs';
import createInvoice from '../../lib/invoice';

import { PrismaClient, Product } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

type BodyProductsType = {
  id: string;
  quantity: number;
};

type ProductAndQuantity = {
  product: Product;
  quantity: number;
};

router.post('/', securityMiddleware, async (req, res) => {
  const productsArray: ProductAndQuantity[] = [];

  const { invoiceNumber, paid, shipping, products } = req.body;

  for (const product of products) {
    const { id, quantity } = product as BodyProductsType;
    const productExists = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!productExists) {
      return res.status(400).json({ error: 'Product does not exist' });
    }

    productsArray.push({
      product: productExists,
      quantity,
    });
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      paid,
      shipping: {
        create: {
          name: shipping.name,
          address: shipping.address,
          city: shipping.city,
          postalCode: shipping.postalCode.toString(),
          country: shipping.country,
        },
      },
      products: {
        create: productsArray.map((product) => {
          return {
            product: {
              connect: {
                id: product.product.id,
              },
            },
            quantity: product.quantity,
          };
        }),
      },
    },
  });

  const invoiceDir = dir.join(__dirname, '../../../uploads/invoices/');
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

  createInvoice(invoice, invoiceDir + `${invoice.id}.pdf`);

  await prisma.invoice.update({
    where: {
      id: invoice.id,
    },
    data: {
      pdfUrl: `/uploads/invoices/${invoice.id}.pdf`,
    },
  });

  return res.json(invoice);

  // const shipping = await prisma.shipping.create({
  //   data: {
  //     name,
  //     address,
  //     city,
  //     postalCode,
  //     country,
  //   },
  // });

  // const invoice = await prisma.invoice.create({
  //   data: {
  //     invoiceNumber,
  //     paid,
  //     shipping,
  //     products,
  //   },
  // });
});

router.post('/:id/download', securityMiddleware, async (req, res, next) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
      shipping: true,
    },
  });

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const invoiceDir = dir.join(__dirname, '../../../uploads/invoices/');

  return res.download(invoiceDir + `${id}.pdf`);
});

router.get('/', securityMiddleware, async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    include: {
      products: {
        include: {
          product: true,
        },
      },
      shipping: true,
    },
  });

  return res.json(invoices);
});

router.get('/:id', securityMiddleware, async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
      shipping: true,
    },
  });

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  return res.json(invoice);
});

router.delete('/:id', securityMiddleware, async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
  });

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  await prisma.productInvoice.deleteMany({
    where: {
      invoiceId: id,
    },
  });

  
  await prisma.invoice.delete({
    where: {
      id,
    },
  });
  
  await prisma.shipping.delete({
    where: {
      id: invoice.shippingId,
    },
  });
  
  fs.unlinkSync(
    dir.join(__dirname, '../../../uploads/invoices/') + `${id}.pdf`
  );

  return res.json({ message: 'Invoice deleted' });
});

export default router;
