import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
dotenv.config();

const BOZO_API_URL = process.env.BOZO_AI_URL;

const bozoPostProduct = async (id: string) => {
  await axios.post(`${BOZO_API_URL}/fetch_product`, {
    id,
  });
};

const bozoDeleteProduct = async (id: string) => {
  await axios.post(`${BOZO_API_URL}/delete`, {
    id,
  });
};

const bozoTrainAI = async () => {
  await axios.post(`${BOZO_API_URL}/train`);
};

const bozoCategorizeProduct = async (fileBuffer: Buffer, fileName: string) => {
  const formData = new FormData();
  console.log(Readable.from(fileBuffer));
  formData.append('file', Readable.from(fileBuffer), {
    filename: fileName,
  });
  const response = await axios.post(`${BOZO_API_URL}/upload`, formData, {
    headers: {
      'Content-Type': `multipart/form-data`,
    },
  });
  return response.data;
};

export {
  bozoPostProduct,
  bozoDeleteProduct,
  bozoTrainAI,
  bozoCategorizeProduct,
};
