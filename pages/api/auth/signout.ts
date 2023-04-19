import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';

type Data = {
  error?: string;
} & GenericData;

type Input = {
  token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input: Input = req.body;

  try {
    await prisma.user.update({
      where: {
        id: input.token,
      },
      data: {
        tempJWT: null,
      },
    });

    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.log('error');
    res.status(500).json({ error: 'error', message: 'error' });
  }
}
