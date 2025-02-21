import express from 'express';
import meilisearchClient from '../../lib/meilisearch';
import { MeiliSearchApiError } from 'meilisearch';
import { securityMiddleware } from '../../middlewares/roles';

const router = express.Router();

router.get('/', securityMiddleware, async (req, res, next) => {
  const { query, index } = req.query;

  try {
    const result = await meilisearchClient.multiSearch({
      queries: [
        {
          q: query as string,
          indexUid: index as 'products' | 'categories',
          attributesToSearchOn:
            index == 'products' ? ['name', 'reference'] : ['name'],
        },
      ],
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (error instanceof MeiliSearchApiError) {
      return res.status(error.httpStatus).json({
        error: error.name,
        message: error.message,
      });
    }

    return res.status(500).json({ error: 'An error occurred' });
  }
);

export default router;
