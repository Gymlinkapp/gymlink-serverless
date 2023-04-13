import { GenericData } from '@/types/GenericData';
import { JWT } from '@/types/JWT';
import { createClient } from '@supabase/supabase-js';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { User } from '@prisma/client';

export const supabase = createClient(
  `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
  process.env.SUPABASE_API_KEY || ''
);

type Data = {
  authStep?: number;
  user?: User;
} & GenericData;

type Input = {
  image: any;
  token: string;
  authStep: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  const decoded = decode(input.token) as JWT;
  const user = await prisma.user.findFirst({
    where: {
      email: decoded.email,
    },
  });
  console.log(input);

  if (!user) {
    console.log('User not found');
    throw new Error('User not found');
  }
  const userImages = user.images as string[];
  if (userImages.length > 5) {
    console.log('You can only have 5 images');
    throw new Error('You can only have 5 images');
  }

  const buffer = Buffer.from(input.image, 'base64');
  const bucketPath = `user-${user.id}-${Math.random()}`;
  try {
    const { data, error } = await supabase.storage
      .from('user-images/public')
      .upload(bucketPath, buffer);
    if (error) {
      console.log(error);
    }
    if (data) {
      const url = supabase.storage
        .from('user-images/public')
        .getPublicUrl(bucketPath);

      const updatedImages = [...userImages, url.data.publicUrl];

      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          authSteps: input.authStep,
          images: updatedImages,
        },
      });

      console.log(updatedUser);

      res.status(200).json({
        message: 'Image uploaded',
        authStep: updatedUser.authSteps,
        user: updatedUser,
      });
    }
  } catch (error) {
    console.log(error);
  }
}
