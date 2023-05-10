import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Input = {
  commentId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input: Input = req.body;
  try {
    await prisma.comment.delete(
      {
        where: { id: input.commentId }
      }
    );

    res.status(200).json({
      success: true,
      message: 'comment deleted',
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
