import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

type Data = {
  email?: string;
  password?: string;
  token?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  type Input = {
    email: string;
    password: string;
  };

  const input: Input = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });
    if (!user) throw new Error('User not found');

    //   const passwordsMatch = await bcrypt.compare(input.password, user.password);
    const passwordsMatch = input.password === user.password;

    if (!passwordsMatch) throw new Error('Incorrect password');

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tempJWT: token,
      },
    });

    res.status(200).json({ email: user.email, password: user.password, token });
  } catch (error) {
    console.log('error');
    res.status(500).json({ error: 'error' });
  }
}
