import { GenericData } from '@/types/GenericData';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Data = {} & GenericData;

type Input = {
  gymId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  const gym = await prisma.gym.findFirst({
    where: {
      id: input.gymId,
    },
  });

  if (!gym) {
    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  res.status(200).json({ gym });
}
