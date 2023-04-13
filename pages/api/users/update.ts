import { JWT } from '@/types/JWT';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';
import { User } from '@prisma/client';

type Data = {
  user?: User;
} & GenericData;

type Input = {
  token: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags?: string[];
  authSteps?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  const decoded = decode(input.token as string) as JWT;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });

    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName: input.firstName || user.firstName,
        lastName: input.lastName || user.lastName,
        email: input.email || user.email,
        tags: [input.tags || user.tags],
        authSteps:
          input.authSteps !== undefined ? input.authSteps : user.authSteps,
      },
    });

    res.status(200).json({
      message: 'User found',
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
