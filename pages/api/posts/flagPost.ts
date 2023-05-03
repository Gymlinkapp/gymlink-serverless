import { NextApiRequest, NextApiResponse } from "next";
import {Post} from '@prisma/client'
import prisma from "@/lib/prisma";

type Input = {
  postId: string;
  userId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const MAX_FLAGS = 5
  try {
    const input = req.body as Input;

    const post = await prisma.post.findUnique({
      where: {
        id: input.postId,
      },
      include: {
        flaggedByUsers: true
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }


    if (post.flaggedByUsers.length > MAX_FLAGS) {
      await prisma.post.delete({
        where: {
          id: input.postId
        }
      })
    }

    const newFlaggedPost = await prisma.flaggedPost.create({
      data: {
        user: {
          connect: {
            id: input.userId,
          },
        },
        post: {
          connect: {
            id: input.postId,
          },
        },
      },
    });
    return res.status(200).json({
      success: true,
      flaggedPost: newFlaggedPost,
    });
  } catch (error) {
    console.log(error);
    throw new Error("error");
  }
}
