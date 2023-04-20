import { GenericData } from '@/types/GenericData';
import { JWT } from '@/types/JWT';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { User } from '@prisma/client';

type Data = {
  authSteps?: number;
  user?: User;
} & GenericData;

type Input = {
  token: string;
  gym: {
    name: string;
    latitude: number;
    longitude: number;
  };
  authSteps: number;
  longitude: number;
  latitude: number;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  const decoded = decode(input.token as string) as JWT;

  const user = await prisma.user.findUnique({
    where: {
      email: decoded.email,
    },
  });

  if (!user) throw new Error('User not found');
  if (!input.latitude || !input.longitude) throw new Error('No location');

  console.log('input', input);

  const gym = await prisma.gym.findFirst({
    where: {
      name: input.gym.name,
    },
  });

  // if gym doesn exist, then we create a new one and connect it to the user
  if (!gym) {
    const newGym = await prisma.gym.create({
      data: {
        name: input.gym.name,

        location: {
          create: {
            radius: 5,
            lat: input.gym.longitude,
            long: input.gym.latitude,
          },
        },
      },
    });

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        longitude: input.longitude,
        latitude: input.latitude,
        gym: {
          connect: {
            id: newGym.id,
          },
        },
        authSteps: input.authSteps,
      },
    });

    res.status(200).json({
      message: 'new gym created',
      authSteps: updatedUser.authSteps,
      user: updatedUser,
    });
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      authSteps: input.authSteps,
      longitude: input.longitude,
      latitude: input.latitude,

      gym: {
        connect: {
          // @ts-expect-error - gym is not null
          id: gym.id,
        },
      },
    },
  });

  res.status(200).json({
    message: 'gym found and connected user',
    authSteps: updatedUser.authSteps,
    user: updatedUser,
  });
}
