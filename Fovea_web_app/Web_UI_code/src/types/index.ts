export type Category = {
  id: string;
  name: string;
  coverPictureId: string;
  coverPicture: CoverPicture;
};

export type CoverPicture = {
  id: string;
  url: string;
};

export type Product = {
  id?: string;
  name: string;
  reference: string;
  pictures: Picture[];
  price: number;
  description: string;
  category?: {
    id?: string;
    name?: string;
  };
  barCode?: BarCode;
  createdAt?: Date;
};

export type Picture = {
  id: string;
  url: string;
  productId: string;
};

export type BarCode = {
  id: string;
  pictureUrl: string;
  code: string;
  productId: string;
};

export type ProductScan = {
  id: string;
  name: string;
  percentage: number;
  imageUrl: string;
  price: number;
  category: string;
};

export type Prediction = {
  class: string;
  confidence: number;
};
