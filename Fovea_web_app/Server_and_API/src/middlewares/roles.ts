// middlewares.ts
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const jwtSecret = process.env.JWT_SECRET;

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload: any = jwt.verify(token, jwtSecret!);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const vendorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload: any = jwt.verify(token, jwtSecret!);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // this should work for either admin or vendor but not for user
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload: any = jwt.verify(token, jwtSecret!);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'VENDOR')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
