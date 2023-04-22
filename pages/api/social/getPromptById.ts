import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';
import { User } from '@prisma/client';

type Data = {} & GenericData;

type Input = {
  promptId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  try {
    const prompt = await prisma.prompt.findUnique({
      where: {
        id: input.promptId,
      },
    });

    if (!prompt) throw new Error('Prompt not found');

    res.status(200).json({ prompt });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
