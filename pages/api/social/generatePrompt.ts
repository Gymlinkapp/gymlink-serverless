import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';
import { User } from '@prisma/client';

type Data = {} & GenericData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = {
    role: 'assistant',
    content:
      'create one random prompt for a gym goer to answer to express their mood/vibe/what their doing. This prompt will allow users to quickly find connections by similarities? ',
  };

  try {
    const result = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_TOKEN}`,
      },
      body: JSON.stringify({
        messages: [prompt],
        model: 'gpt-3.5-turbo',
        max_tokens: 25,
      }),
    });

    const data = await result.json();

    return res
      .status(200)
      .json({ data, message: data.choices[0].message.content });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
