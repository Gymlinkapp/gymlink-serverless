import { NextApiRequest, NextApiResponse } from 'next';
import { decode } from 'jsonwebtoken';
import { GenericData } from '@/types/GenericData';
import { JWT } from '@/types/JWT';
import prisma from '@/lib/prisma';
import { Split } from '@prisma/client';

type Data = {
  split?: Split;
} & GenericData;

type Input = {
  split: any[];
  token: string;
};
export default async function handlder(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  if (!input.split) {
    console.log('No split provided');
    throw new Error('No split provided');
  }
  const decoded = decode(input.token as string) as JWT;

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

    const split = await prisma.split.create({
      data: {
        users: {
          connect: {
            id: user.id,
          },
        },
        monday: input.split[0].exercises,
        tuesday: input.split[1].exercises,
        wednesday: input.split[2].exercises,
        thursday: input.split[3].exercises,
        friday: input.split[4].exercises,
        saturday: input.split[5].exercises,
        sunday: input.split[6].exercises,
      },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        authSteps: 6,
      },
    });

    res.status(200).json({
      message: 'Split created',
      split: split,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
