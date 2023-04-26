import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Input = {
  postId: string;
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
      include: {
        likes: true,
        views: true,
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                images: true,
              },
            },
          },
        },

        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gym: true,
            images: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return res.status(200).json({
      success: true,
      post: post,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
