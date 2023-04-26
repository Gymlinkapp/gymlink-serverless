import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Input = {
  postId: string;
  userId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const input = req.body as Input;

    const post = await prisma.post.findUnique({
      where: {
        id: input.postId,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // if the user has already viewed the post, don't increment the view count
    const view = await prisma.view.findFirst({
      where: {
        postId: input.postId,
        userId: input.userId,
      },
    });

    if (view) {
      return res.status(200).json({
        success: true,
        message: 'View already exists',
      });
    }

    // increment the view count
    await prisma.view.create({
      data: {
        postId: input.postId,
        userId: input.userId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'All views deleted',
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
