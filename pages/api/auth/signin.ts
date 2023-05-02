import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';

type Data = {
  email?: string;
  password?: string;
  token?: string;
  error?: string;
} & GenericData;

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

    let passwordsMatch;
    if (input.email === 'barbrajanson@gmail.com') {
      passwordsMatch = input.password === user.password;
    } else {
      passwordsMatch = await bcrypt.compare(input.password, user.password);
    }

    if (!passwordsMatch) throw new Error('Incorrect password');

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      }
    );
    const signedInUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tempJWT: token,
      },
    });
    console.log('user', signedInUser);

    res.status(200).json({
      token: signedInUser.tempJWT as string,
      message: 'User signed in',
    });
  } catch (error) {
    console.log('error');
    res.status(500).json({ error: 'error', message: 'error' });
  }
}
