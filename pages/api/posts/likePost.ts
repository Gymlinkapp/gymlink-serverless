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

    // if user has already liked the post, don't increment the like count
    const like = await prisma.like.findFirst({
      where: {
        postId: input.postId,
        userId: input.userId,
      },
    });

    if (like) {
      return res.status(200).json({
        success: true,
        message: 'Like already exists',
      });
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: input.postId,
      },
      data: {
        likes: {
          create: {
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
