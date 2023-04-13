import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';

type Data = {} & GenericData;

type Input = {
  userId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  const chats = await prisma.chat.findMany({
    where: {
      participants: {
        some: {
          id: input.userId,
        },
      },
    },
    include: {
      participants: true,
    },
  });

  res.status(200).json({ chats });
}
