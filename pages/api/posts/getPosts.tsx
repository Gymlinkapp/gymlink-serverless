import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { GenericData } from "@/types/GenericData";

type Data = {} & GenericData;

type Input = {
  userId: string;
  cursor?: number;
  limit?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cursor = input.cursor || 0;
    const limit = input.limit || 10;

    const posts = await prisma.post.findMany({
      where: {
        NOT: {
          flaggedByUsers: {
            some: { userId: input.userId },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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

    const paginatedPostsFeed = posts.slice(cursor, cursor + limit);

    console.log(paginatedPostsFeed);
    res.status(200).json({
      success: true,
      posts: paginatedPostsFeed,
    });
  } catch (error) {
    console.log(error);
    throw new Error("error");
  }
}
