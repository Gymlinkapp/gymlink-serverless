import { GenericData } from "@/types/GenericData";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

type Data = {} & GenericData;

type Input = {
  blockedUserId: string;
  blockingUserId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const input = req.body as Input;
  try {
    const blockingUser = await prisma.user.findUnique({
      where: {
        id: input.blockingUserId,
      },
    });

    if (!blockingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const blockedUser = await prisma.user.findUnique({
      where: {
        id: input.blockedUserId,
      },
    });

    if (!blockedUser) {
      return res.status(404).json({
        message: "Blocked user not found",
      });
    }
    // Add the blocked user's id to the blockedUserIds array, if not already present
    await prisma.user.update({
      where: { id: blockingUser.id},
      data: { blockedUsers: [...(blockingUser.blockedUsers as string[]), blockedUser.id]},
    });

    console.log('blocking user: ', blockingUser.blockedUsers)

    res.status(200).json({
      message: "User blocked",
    });
  } catch (error) {
    console.log(error);
    throw new Error("error");
  }
}
