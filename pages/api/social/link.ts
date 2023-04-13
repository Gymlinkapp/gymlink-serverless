import { GenericData } from '@/types/GenericData';
import { JWT } from '@/types/JWT';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Data = {} & GenericData;

type Input = {
  token: string;
  fromUserId: string;
  toUserId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  console.log('input', input);
  try {
    const decoded = decode(input.token) as JWT;
    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });

    // check if the user is authorized with a token
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
      });
      return;
    }

    const fromUser = await prisma.user.findUnique({
      where: {
        id: input.fromUserId,
      },
      select: {
        feed: true,
        firstName: true,
        lastName: true,
        id: true,
        images: true,
      },
    });
    const toUser = await prisma.user.findUnique({
      where: {
        id: input.toUserId,
      },
      select: {
        feed: true,
        firstName: true,
        lastName: true,
        id: true,
        images: true,
      },
    });

    // if users have a chat already together, don't create a new one
    const chat = await prisma.chat.findFirst({
      where: {
        participants: {
          some: {
            id: input.fromUserId,
          },
        },
        AND: {
          participants: {
            some: {
              id: input.toUserId,
            },
          },
        },
      },
    });

    if (chat) {
      res.status(200).json({ chat });
      return;
    }
    if (fromUser && toUser) {
      // create a chat between the two users
      const chat = await prisma.chat.create({
        data: {
          name: `${fromUser.firstName} ${fromUser.lastName} and ${toUser.firstName} ${toUser.lastName}`,
          participants: {
            connect: [{ id: input.fromUserId }, { id: input.toUserId }],
          },
        },
        select: {
          participants: {
            select: {
              id: true,
              images: true,
              firstName: true,
              lastName: true,
            },
          },
          name: true,
          id: true,
        },
      });

      // filter the feed of the user's in the chat to not include the user
      const fromUsersFeed = fromUser.feed.filter(
        (user) => user.id !== input.toUserId
      );
      await prisma.user.update({
        where: {
          id: input.fromUserId,
        },
        data: {
          feed: {
            set: fromUsersFeed.map((user) => ({ id: user.id })),
          },
        },
      });

      const toUsersFeed = toUser.feed.filter(
        (user) => user.id !== input.fromUserId
      );
      await prisma.user.update({
        where: {
          id: input.toUserId,
        },
        data: {
          feed: {
            // filter the toUser's feed to not include the fromUser
            set: toUsersFeed.map((user) => ({ id: user.id })),
          },
        },
      });
      res.status(200).json({
        chat: {
          name: chat.name,
          id: chat.id,
          participants: {
            toUser: {
              id: toUser.id,
              firstName: toUser.firstName,
              lastName: toUser.lastName,
              images: toUser.images,
            },
          },
        },
      });

      return;
    }

    if (!fromUser || !toUser) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    if (input.fromUserId === input.toUserId) {
      res.status(400).json({ message: 'You cannot link with yourself' });
      return;
    }
  } catch (error) {
    console.log(error);
  }
}
