import { GenericData } from "@/types/GenericData";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
type Data = {} & GenericData;
type Input = {
  baseWebAccount?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
};

const generateRandomPhoneNumber = () => {
  const randomId = Math.floor(Math.random() * 1000000000);
  return `+1${randomId}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
  if (
    input.baseWebAccount &&
    input.email &&
    input.firstName &&
    input.lastName
  ) {
    // if the user already exists
    try {
      // if a user exists dont create a new one
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        const newUser = await prisma.user.create({
          data: {
            phoneNumber: generateRandomPhoneNumber(),
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            password: "",
            images: [],
            tempJWT: "",
            age: 0,
            filterGender: [],
            filterGoals: [],
            filterSkillLevel: [],
            filterWorkout: [],
            filterGoingToday: false,
            tags: [],
            bio: "",
          },
        });
        res.status(200).json(newUser);
        return;
      }

      res.status(200).json(user);
      return;
    } catch (error) {
      console.log(error);

      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }
  }

  res.status(401).json({
    error: "Unauthorized",
  });
}
