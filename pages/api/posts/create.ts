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
