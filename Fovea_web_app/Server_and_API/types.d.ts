// types.d.ts
import { Request } from 'express';
import { User } from '@prisma/client';
import { File } from 'multer';

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
