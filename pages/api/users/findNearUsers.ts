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
  const limit = input.limit || 10;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
      include: {
        chats: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        feed: true,
      },
    });

    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    }
    const users = await findNearUsers(user);

    // remove users that are already in the user's chat list
    let usersToAdd = users.filter(
      (u) => !user.chats.some((c) => c.user?.id === u.id)
    );

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

    const loadMoreFeed = usersToAdd.slice(offset, offset + limit);

    console.log(
      loadMoreFeed.map((u) => u.firstName),
      offset,
      limit
    );

    res.status(200).json({
      message: 'Users found',
      users: loadMoreFeed,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'error',
    });
  }
}
