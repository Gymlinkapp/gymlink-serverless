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
      include: {
        feed: {
          include: {
            chats: {
              select: {
                participants: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    }

    if (!user.feed) {
      console.log('User feed not found');
      throw new Error('User feed not found');
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

    const userGenderFilers = user.filterGender as string[];
    const userGoalFilters = user.filterGoals as string[];
    const userSkillLevelFilters = user.filterSkillLevel as string[];
    const userWorkoutFilters = user.filterWorkout as string[];
    const userGoingTodayFilters = user.filterGoingToday as boolean;

    if (
      userGenderFilers.length > 0 ||
      userGoalFilters.length > 0 ||
      userSkillLevelFilters.length > 0 ||
      userWorkoutFilters.length > 0 ||
      userGoingTodayFilters === true ||
      userGoingTodayFilters === false
    ) {
      usersToAdd = filterFeedHelper(usersToAdd, user);
    }
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        feed: {
          connect: usersToAdd.map((user) => ({
            id: user.id,
          })),
        },
      },
      include: {
        feed: true,
        split: true,
      },
    });

    let loadedMoreFeed: User[];

    const totalUsers = usersToAdd.length;

    // if offset is less than total users, we can load more
    if (offset < totalUsers) {
      console.log('we good');
      loadedMoreFeed = usersToAdd.slice(offset, offset + limit);
    } else {
      console.log('we not good');
      loadedMoreFeed = usersToAdd;
    }

    console.log(
      loadedMoreFeed.map((u) => u.firstName),
      offset,
      limit,
      totalUsers
    );

    res.status(200).json({
      message: 'Users found',
      users: loadedMoreFeed,
      totalUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'error',
    });
  }
}
