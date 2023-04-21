import { JWT } from '@/types/JWT';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';
import { Chat, User } from '@prisma/client';

type Data = {
  users?: User[];
  chats?: Chat[];
} & GenericData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const users = await prisma.user.findMany();

    const chats = await prisma.chat.findMany();

    if (!users) {
      console.log('Users not found');
      throw new Error('Users not found');
    }

    res.status(200).json({
      message: 'Users found',
      users: users,
      chats: chats,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
