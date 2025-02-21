import { Meilisearch } from 'meilisearch';

import dotenv from 'dotenv';
dotenv.config();

const host = process.env.MEILISEARCH_HOST;
const masterKey = process.env.MEILISEARCH_MASTER_KEY;

const meilisearchClient = new Meilisearch({
  host: host!,
  apiKey: masterKey,
});

export default meilisearchClient;