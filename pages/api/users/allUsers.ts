import { JWT } from '@/types/JWT';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';
import { User } from '@prisma/client';

type Data = {
  users?: User[];
} & GenericData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const users = await prisma.user.findMany();

    if (!users) {
      console.log('Users not found');
      throw new Error('Users not found');
    }

    res.status(200).json({
      message: 'Users found',
      users: users,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
