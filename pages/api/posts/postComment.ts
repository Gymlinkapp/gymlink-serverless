import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Input = {
  postId: string;
  userId: string;
  comment: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const input = req.body as Input;

    const updatedPost = await prisma.post.update({
      where: {
        id: input.postId,
      },
      data: {
        comments: {
          create: {
            content: input.comment,
            user: {
              connect: {
                id: input.userId,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
