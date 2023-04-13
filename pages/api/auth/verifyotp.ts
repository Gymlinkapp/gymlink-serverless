import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { GenericData } from '@/types/GenericData';

type Data = {
  token?: string;
  authStep?: number;
} & GenericData;
type Input = {
  phoneNumber: string;
  verificationCode: string;
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

    if (!user) throw new Error('User not found');
    if (user.verificationCode !== input.verificationCode) {
      console.log('wrong');
      throw new Error('Incorrect verification code');
    }
    if (!user.verified || !user.email) {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          authSteps: 2,
          verified: true,
        },
      });

      res.status(200).json({
        message: 'User verified',
        authStep: updatedUser.authSteps,
      });

      return;
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      }
    );
    const signedInUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tempJWT: token,
      },
    });

    res.status(200).json({
      token: signedInUser.tempJWT as string,
      message: 'User signed in',
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({ error: 'error', message: 'error' });
  }
}
