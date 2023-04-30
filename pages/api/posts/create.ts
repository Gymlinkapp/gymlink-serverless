import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Input = {
  userId: string;
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const input = req.body as Input;

    const post = await prisma.post.create({
      data: {
        content: input.content,
        tags: 'GENERAL',
        user: {
          connect: {
            id: input.userId,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
