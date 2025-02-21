import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import data from './data.json';

type account = {
  id: string;
  email: string;
  password: string;
  role: string;
};

export async function seed() {
  const prisma = new PrismaClient();

  const iterator = Object.keys(data);

  for (const account of iterator) {
    // get the account from the data
    console.log(account);
    const accountData = data[account as keyof typeof data] as account;

    const hashedPassword = await bcrypt.hash(accountData.password, 10);

    const user = await prisma.user.findUnique({
      where: {
        id: accountData.id,
      },
    });

    if (user) {
      continue;
    }

    await prisma.user.create({
      data: {
        id: accountData.id,
        name: account,
        email: accountData.email,
        password: hashedPassword,
        role: accountData.role as 'ADMIN' | 'VENDOR' | 'USER',
      },
    });
  }

  await prisma.$disconnect();
}
