import { JWT } from '@/types/JWT';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { findNearUsers } from '@/lib/findNearUsers';
import { GenericData } from '@/types/GenericData';
import { filterFeedHelper } from '@/lib/filterFeedHelper';
import { User } from '@prisma/client';

type Data = {
  users?: User[];
  totalUsers?: number;
} & GenericData;

type Input = {
  token: string;
  offset?: number;
  limit?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  const decoded = decode(input.token as string) as JWT;

  const offset = input.offset || 0;
  const limit = input.limit || 9;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });

    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    }

    const users = await findNearUsers(user);

    // if the user has a chat with the user, remove the user from the feed
    let usersToAdd = users.filter((u) => {
      // @ts-expect-error -- actually has chats accessible.
      const hasChatWithUser = u.chats.some((chat) =>
        chat.participants.some(
          (participants: { id: string }) => participants.id === user.id
        )
      );

      return !hasChatWithUser;
    });

    let loadedMoreFeed: User[];

    // Paginate users by slicing the array based on the offset and limit
    loadedMoreFeed = usersToAdd.slice(offset, offset + limit);

    res.status(200).json({
      message: 'Users found',
      users: loadedMoreFeed,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'error',
    });
  }
}
