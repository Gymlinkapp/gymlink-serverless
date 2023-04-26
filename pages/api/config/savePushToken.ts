import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';

type Data = {
  error?: string;
  token?: string;
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
    console.log('token', input.token);
    res.status(200).json({ message: 'success', token: input.token });
  } catch (error) {
    console.log('error');
    res.status(500).json({ error: 'error', message: 'error' });
  }
}
