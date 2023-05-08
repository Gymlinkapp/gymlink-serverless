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
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle the OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
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
