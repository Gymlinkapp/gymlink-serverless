import { Params } from '@/lib/params';
import { Twilio } from 'twilio';
import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { GenericData } from '@/types/GenericData';

type Data = {} & GenericData;
type Input = {
  phoneNumber: string;
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
  const input: Input = req.body;
  console.log('input', input);

  try {
    await client.messages.create({
      body: `Your verification code is ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER as string,
      to: `+1${input.phoneNumber}`,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
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
          email: '',
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
          bio: '',
          verificationCode: code,

          authSteps: 1,
        },
      });

      console.log('saved code', newUser.verificationCode);

      return res.status(200).json({
        message: 'SMS Sent',
        authStep: newUser.authSteps,
        code: newUser.verificationCode,
      });
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

    return res.status(200).json({
      message: 'SMS Sent',
      authStep: existingUser.authSteps,
      code: existingUser.verificationCode,
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
