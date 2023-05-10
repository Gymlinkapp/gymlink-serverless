import { Twilio } from 'twilio';
import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { GenericData } from '@/types/GenericData';
import { Sex, faker } from '@faker-js/faker';

type Data = {} & GenericData;
type Input = {
  phoneNumber: string;
  baseWebAccount?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

const randomVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const code = randomVerificationCode();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const input: Input = req.body;

  try {
    await client.messages.create({
      body: `Your verification code is ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER as string,
      to: `+1${input.phoneNumber}`,
    });
  } catch (error) {
    console.log(error);

    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  // if the user already exists
  try {
    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: input.phoneNumber,
      },
    });

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          phoneNumber: input.phoneNumber,
          // needs to be a random email temporarily so that the user can be created with a unique email.
          email: faker.internet.email(),
          password: '',
          images: [],
          tempJWT: '',
          age: 0,
          filterGender: [],
          filterGoals: [],
          filterSkillLevel: [],
          filterWorkout: [],
          filterGoingToday: false,
          firstName: '',
          lastName: '',
          tags: [],
          blockedUsers: [],
          bio: '',
          verificationCode: code,

          authSteps: 1,
        },
      });

      console.log('saved code', newUser.verificationCode);

      res.status(200).json({
        message: 'SMS Sent',
        authStep: newUser.authSteps,
        code: newUser.verificationCode,
      });
      return;
    }

    const existingUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationCode: code,
      },
    });

    console.log('saved code on existing user', existingUser.verificationCode);

    res.status(200).json({
      message: 'SMS Sent',
      authStep: existingUser.authSteps,
      code: existingUser.verificationCode,
    });
  } catch (error) {
    console.log(error);

    console.log(accountSid, authToken);
    throw new Error('error');
  }
}
