import { GenericData } from '@/types/GenericData';
import { JWT } from '@/types/JWT';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { User } from '@prisma/client';

type Data = {
  authStep?: number;
  token?: string;
  user?: User;
} & GenericData;

type Input = {
  token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  console.log('input', input);
  if (!input.token) {
    res.status(400).json({
      message: 'No token provided',
    });
    return;
  }
  try {
    const decoded = decode(input.token as string) as JWT;
    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
      include: {
        split: true,
        feed: true,
        userPrompts: true,
      },
    });

    if (!user) {
      if (!user) {
        res.status(404).json({
          message: 'User not found',
        });

        return;
      }
    }

    res.status(200).json({
      message: 'User found',
      authStep: user.authSteps,
      token: input.token,
      user: user,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
