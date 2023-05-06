import { GenericData } from "@/types/GenericData";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/lib/prisma';
type Data = {} & GenericData;
type Input = {
  baseWebAccount?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
};

const generateRandomPhoneNumber = () => {
  const randomId = Math.floor(Math.random() * 1000000000);
  return `+1${randomId}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.body as Input;
  res.setHeader('Access-Control-Allow-Origin', 'localhost:3000');
  if (input.baseWebAccount && input.email && input.firstName && input.lastName) {
    // if the user already exists
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        const newUser = await prisma.user.create({
          data: {
            phoneNumber: generateRandomPhoneNumber(),
            email: input.email,
            password: '',
            images: [],
            tempJWT: '',
            age: 0,
            filterGender: [],
            filterGoals: [],
            filterSkillLevel: [],
            filterWorkout: [],
            filterGoingToday: false,
            firstName: input.firstName,
            lastName: input.lastName,
            tags: [],
            bio: '',

            authSteps: 1,
          },
        });

        console.log('saved code', newUser.verificationCode);

        res.status(200).json({
          message: 'base user created',
          code: newUser.verificationCode,
        });
        return;
      }
      res.status(200).json({
        message: 'base user already exists',
      });
    } catch(
      error
    ) {
      console.log(error);

      res.status(401).json({
        error: 'Unauthorized',
      });
      return;
    }
  }

  res.status(401).json({
    error: 'Unauthorized',
  });
}
