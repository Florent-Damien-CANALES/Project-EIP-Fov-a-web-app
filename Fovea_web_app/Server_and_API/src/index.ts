// base express project setup
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import path from 'path';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

import category from './routes/category';
import products from './routes/products';
import auth from './routes/auth';
import search from './routes/search';
import barcode from './routes/barcode';
import invoices from './routes/invoices';
import ai from './routes/ai';
import database from './routes/database';

import { seed } from './seeds';
import meilisearchClient from './lib/meilisearch';
import { securityMiddleware } from './middlewares/roles';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/categories', category);
try {
  meilisearchClient.createIndex('categories', {
    primaryKey: 'id',
  });
  meilisearchClient.createIndex('products', {
    primaryKey: 'id',
  });
} catch (error) {
  console.log(error);
}
app.use('/auth', auth);
app.use('/products', products);
app.use('/search', search);
app.use('/barcode', barcode);
app.use('/invoices', invoices);
app.use('/ai', ai);
app.use('/database', database);

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const categoriesPicturesDir = path.join(uploadDir, 'categoriesPictures');
if (!fs.existsSync(categoriesPicturesDir)) {
  fs.mkdirSync(categoriesPicturesDir, { recursive: true });
}

const productsDir = path.join(uploadDir, 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

app.use(
  '/uploads',
  securityMiddleware,
  express.static(path.join(__dirname, '..', 'uploads'))
);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  seed();
});
