import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';
import { Post } from '@prisma/client';

type Data = {} & GenericData;

type Input = {
  token: string;
  page?: number;
  limit?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  try {
    const page = input.page || 1;
    const limit = input.limit || 10;
    const offset = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        likes: true,
        views: true,
        comments: {
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

    const paginatedPostsFeed = posts.slice(offset, offset + limit);

    console.log(paginatedPostsFeed);
    res.status(200).json({
      success: true,
      posts: paginatedPostsFeed,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
