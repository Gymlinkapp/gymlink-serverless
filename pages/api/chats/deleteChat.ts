import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';

type Data = {} & GenericData;

type Input = {
  chatId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  const chat = await prisma.chat.findUnique({
    where: {
      id: input.chatId,
    },
    include: {
      user: true,
      participants: true,
    },
  });

  if (!chat) {
    res.status(404).json({
      message: 'Chat not found',
    });

    return;
  }

  // delete all messages in the chat
  await prisma.message.deleteMany({
    where: {
      chatId: input.chatId,
    },
  });

  // delete the chat
  await prisma.chat.delete({
    where: {
      id: input.chatId,
    },
  });

  // reconnect the user on the feed
  const userAId = chat.participants[0].id;
  const userBId = chat.participants[1].id;

  await prisma.user.update({
    where: {
      id: userAId,
    },
    data: {
      feed: {
        connect: {
          id: userBId,
        },
      },
    },
  });

  await prisma.user.update({
    where: {
      id: userBId,
    },
    data: {
      feed: {
        connect: {
          id: userAId,
        },
      },
    },
  });

  res.status(200).json({ message: 'Chat deleted' });
}
