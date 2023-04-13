import { GenericData } from '@/types/GenericData';
import { JWT } from '@/types/JWT';
import { User } from '@prisma/client';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Data = {
  authSteps?: number;
  user?: User;
} & GenericData;

type Input = {
  token: string;
  authSteps: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  console.log('input', input);

  const decoded = decode(input.token as string) as JWT;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });

    if (!user) throw new Error('User not found');

    const updatedUser = await prisma.user.update({
      where: {
        email: decoded.email,
      },
      data: {
        authSteps: input.authSteps,
      },
    });

    res.status(200).json({
      message: 'User found',
      authSteps: updatedUser.authSteps,
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'error',
    });
  }
}
