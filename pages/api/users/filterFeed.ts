import { GenericData } from '@/types/GenericData';
import { JWT } from '@/types/JWT';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { FilterType } from '@/lib/filters';
import { filterFeedHelper } from '@/lib/filterFeedHelper';
import { User } from '@prisma/client';

type Data = {
  feed: User[];
} & GenericData;

export type Filter = {
  filter: string;
  value: string | boolean;
};

type Input = {
  token: string;
  filters: Filter[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  const decoded = decode(input.token as string) as JWT;
  console.log('htting', input.filters);

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
      include: {
        feed: true,
      },
    });

    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    }

    const findFilterValue = (filterName: FilterType) => {
      return input.filters.find((filter) => filter.filter === filterName)
        ?.value as string[] | boolean;
    };

    // apply filters to user
    const userWithFilters = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        // @ts-expect-error - it is a boolean in an array
        filterGoingToday: findFilterValue(
          FilterType.GOING_TODAY
        )?.[0] as boolean,
        filterWorkout: findFilterValue(FilterType.WORKOUT_TYPE) as string[],
        filterSkillLevel: findFilterValue(FilterType.SKILL_LEVEL) as string[],
        filterGender: findFilterValue(FilterType.GENDER) as string[],
        filterGoals: findFilterValue(FilterType.GOALS) as string[],
      },
    });

    const filteredFeed = filterFeedHelper(user.feed, userWithFilters);

    console.log(filteredFeed.map((user) => user.firstName));

    res.status(200).json({
      feed: filteredFeed.filter((user) => user.id !== userWithFilters.id),
      message: 'Feed filtered',
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
