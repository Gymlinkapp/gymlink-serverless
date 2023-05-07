import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import { GenericData } from "@/types/GenericData";

type Data = {} & GenericData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // get most recent prompt 
    const prompt = await prisma.prompt.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ prompt });
  } catch (error) {
    console.log(error);
    throw new Error("error");
  }
}
