import express from 'express';

const router = express.Router();

import { createCanvas } from 'canvas';
import JsBarCode from 'jsbarcode';
import { adminMiddleware } from '../../middlewares/roles';

router.get('/', adminMiddleware,(req, res) => {
  const { code } = req.query;
  const canvas = createCanvas(100, 100);
  JsBarCode(canvas, code as string, {
    width: 3,
    height: 70,
    lineColor: '#1E293B',
    displayValue: false,
  });
  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer());
});

export default router;
