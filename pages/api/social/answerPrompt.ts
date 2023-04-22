import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';

type Data = {} & GenericData;

type Input = {
  userId: string;
  promptId: string;
  answer: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  console.log(input);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    if (!user) throw new Error('User not found');

    const prompt = await prisma.prompt.findUnique({
      where: {
        id: input.promptId,
      },
    });

    if (!prompt) throw new Error('Prompt not found');

    const userPrompt = await prisma.userPrompt.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        prompt: {
          connect: {
            id: prompt.id,
          },
        },
        answer: input.answer,
        hasAnswered: true,
      },
    });

    return res.status(200).json({ userPrompt });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
