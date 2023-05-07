import { GenericData } from "@/types/GenericData";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

type Data = {
  user?: User;
} & GenericData;

type Input = {
  email: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle the OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  const input = req.body as Input;
  console.log("input", input);
  if (!input.email) {
    res.status(400).json({
      message: "No email provided",
    });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
      include: {
        userPrompts: true,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      message: "User found",
      user
    });
  } catch (error) {
    console.log(error);
    throw new Error("error");
  }
}
