import { GenericData } from '@/types/GenericData';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

type Data = {
  authStep?: number;
  token?: string;
} & GenericData;

type Input = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  age: number;
  gender: string;
  race: string;
  longitude: number;
  latitude: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  try {
    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: input.phoneNumber,
      },
    });

    console.log('user', user);

    if (!user) throw new Error('User not found');
    if (!user.verified) throw new Error('User not verified');

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      }
    );

    const updatedUser = await prisma.user.update({
      where: {
        phoneNumber: input.phoneNumber,
      },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        bio: input.bio,
        age: input.age,
        gender: input.gender,
        race: input.race,
        longitude: input.longitude,
        authSteps: 3,
        latitude: input.latitude,
        tempJWT: token,
      },
    });

    console.log('updatedUser', updatedUser);

    res.status(200).json({
      message: 'User details updated',
      authStep: updatedUser.authSteps,
      token: user.tempJWT as string,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: 'error',
      error: 'error',
    });
  }
}
