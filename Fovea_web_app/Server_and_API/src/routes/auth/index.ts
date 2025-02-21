import express from 'express';
import { PrismaClient } from '@prisma/client';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const router = express.Router();

router.post('/login', async (req, res) => {
  const identifier = req.body.identifier;
  const password = req.body.password;

  if (!identifier || !password) {
    return res.status(400).send('Missing fields');
  }

  const databaseUser = await prisma.user.findUnique({
    where: {
      email: identifier,
    },
  });

  if (!databaseUser) {
    return res.status(401).send('Invalid credentials');
  }

  const valid = bcrypt.compareSync(password, databaseUser.password);

  if (!valid) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign({ userId: databaseUser.id }, process.env.JWT_SECRET!);
  const { password: _, ...user } = databaseUser;
  res.json({ user, token });
});

export default router;
