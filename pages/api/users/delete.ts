import { GenericData } from "@/types/GenericData";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

type Data = {
  user?: User;
} & GenericData;

type Input = {
  userId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle the OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  const input = req.body as Input;
  console.log("input", input);
  if (!input.userId) {
    res.status(400).json({
      message: "No userId provided",
    });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: input.userId,
      },
      include: {
        posts: true,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    // Delete related records
    await prisma.message.deleteMany({ where: { senderId: user.id } });
    await prisma.chat.deleteMany({ where: { userId: user.id } });
    await prisma.userPrompt.deleteMany({ where: { userId: user.id } });

    await prisma.like.deleteMany({ where: { userId: user.id } });
    await prisma.comment.deleteMany({ where: { userId: user.id } });
    await prisma.view.deleteMany({ where: { userId: user.id } });

    // delete likes on the post, comments and posts
    // user.posts
    Promise.all(
      user.posts.map(async (post) => {
        await prisma.like.deleteMany({ where: { postId: post.id } });
        await prisma.comment.deleteMany({ where: { postId: post.id } });
        await prisma.view.deleteMany({ where: { postId: post.id } });
      })
    );
    await prisma.post.deleteMany({ where: { userId: user.id } });

    await prisma.flaggedPost.deleteMany({ where: { userId: user.id } });

    // Delete user
    await prisma.user.delete({ where: { id: user.id } });

    console.log("deleted user")

    res.status(200).json({
      message: "User and related records deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while deleting the user and related records",
    });
  }
}
