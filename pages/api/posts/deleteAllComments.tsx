import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await prisma.comment.deleteMany();

    res.status(200).json({
      success: true,
      message: 'All comments deleted',
    });
  } catch (error) {
    console.log(error);
    throw new Error('error');
  }
}
