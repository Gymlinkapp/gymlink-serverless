import { GenericData } from '@/types/GenericData';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

type Data = {
  authStep?: number;
  token?: string;
} & GenericData;

type Input = {
  password: string;
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

const generateRandomPhoneNumber = () => {
  const randomId = Math.floor(Math.random() * 1000000000);
  return `+1${randomId}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  try {
    // if a user is signing up with their phone number, they won't have an account password:
    if (!input.password) {
      const user = await prisma.user.findUnique({
        where: {
          phoneNumber: input.phoneNumber,
        },
      });

      console.log('user', user);

      if (!user) throw new Error('User not found');

      if (!input.email) throw new Error('Email required');

      if (!user.verified) throw new Error('User not verified');

      const token = jwt.sign(
        { email: input.email },
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
        token: token as string,
      });

      return;
    }

    // if a user is signing up with their email, they will have an account password:
    const token = jwt.sign(
      { email: input.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      }
    );

    const hashedPassword = await bcrypt.hash(input.password, 10);

    // create a new user with no phone number
    const newUser = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        bio: input.bio,
        phoneNumber: generateRandomPhoneNumber(),
        email: input.email,
        password: hashedPassword,
        images: [],
        tempJWT: token,
        age: input.age,
        filterGender: [],
        filterGoals: [],
        filterSkillLevel: [],
        filterWorkout: [],
        filterGoingToday: false,
        tags: [],

        authSteps: 3,
      },
    });

    res.status(200).json({
      message: 'User created',
      authStep: newUser.authSteps,
      token: token as string,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: 'error',
      error: 'error',
    });
  }
}
