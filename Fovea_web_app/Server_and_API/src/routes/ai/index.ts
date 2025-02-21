import express from 'express';
import { bozoCategorizeProduct, bozoTrainAI } from '../../lib/ai/bozoprovider';
import multer from 'multer';
import { adminMiddleware, securityMiddleware } from '../../middlewares/roles';

const router = express.Router();

router.post('/train', adminMiddleware, async (req, res) => {
  bozoTrainAI();
  res.send('Training AI');
});

// multer to memory storage
const upload = multer({ storage: multer.memoryStorage() });
router.post(
  '/categorize-product',
  securityMiddleware,
  upload.single('image'),
  async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    const result = await bozoCategorizeProduct(file.buffer, file.originalname);

    if (!result.predictions) {
      return res.status(404).send('No prediction found');
    }

    return res.json(result.predictions);
  }
);

export default router;
