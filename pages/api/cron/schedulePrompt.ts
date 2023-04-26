import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';

type Data = {
  error?: string;
  response?: any;
} & GenericData;

type Input = {
  token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input: Input = req.body;
  const expoPushToken = 'ExponentPushToken[32NkwKDktHSAgH5_qHW4Ei]';
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Gym question',
      body: 'What was your workout today?',
      data: { someData: 'goes here' },
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(message),
    });

    res.status(200).json({ message: 'succ', response: response });
  } catch (error) {
    console.log('error');
    res.status(500).json({ error: 'error', message: 'error' });
  }
}
