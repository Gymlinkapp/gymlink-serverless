import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { GenericData } from '@/types/GenericData';
import { User } from '@prisma/client';

type Data = {} & GenericData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const gptPrompt = {
    role: 'assistant',
    content:
      'create one random prompt for a gym goer to answer to express their mood/vibe/what their doing. This prompt will allow users to quickly find connections by similarities? This could include questions to gain insight about their gym goals, what they are doing at the gym, or what they are doing after the gym, music they are listening to before, after, during their workouts. etc. I want to aim for a new and random prompt everyday. The question/prompt should be short and sweet and a good way to start a conversation and connect with someone.',
  };

  try {
    const result = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_TOKEN}`,
      },
      body: JSON.stringify({
        messages: [gptPrompt],
        model: 'gpt-3.5-turbo',
        max_tokens: 25,
      }),
    });

    const data = await result.json();
    const prompt = data.choices[0].message.content;
    const users = await prisma.user.findMany({
      where: {
        isBot: false,
      },
    });
    // const prompt = "What's your gym goal this week?"; // test
    const createdPrompt = await prisma.prompt.create({
      data: {
        prompt,
      },
    });

    await Promise.all(
      users.map((user: User) =>
        prisma.userPrompt.create({
          data: {
            userId: user.id,
            promptId: createdPrompt.id,
            hasAnswered: false,
            answer: '',
          },
        })
      )
    );
    return res.status(200).json({ data, prompt });
    // return res.status(200).json({ prompt }); // test
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
