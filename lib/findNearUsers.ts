import { Gym, PrismaClient, User } from '@prisma/client';
import { haversineDistance } from './haversineDistance';

const prisma = new PrismaClient();

// find distance between each user and all gyms, then check if any gym is within the radius (50km).
export const findNearUsers = async (
  user: User,
  logs?: boolean
): Promise<User[]> => {
  const users = await prisma.user.findMany({
    include: {
      gym: {
        select: {
          name: true,
        },
      },
      userPrompts: true,
      chats: {
        select: {
          participants: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
  const gymLocations = await prisma.gym.findMany();

  async function filterUsers() {
    const filteredUsersPromises = users.map(async (user) => {
      const userLocation = {
        latitude: user.latitude as number,
        longitude: user.longitude as number,
      };

      const gymDistances = await Promise.all(
        gymLocations.map(async (gym) => {
          const gymLocation = await prisma.location.findUnique({
            where: {
              id: gym.locationId,
            },
          });
          if (!gymLocation) return Infinity;

          const distance = haversineDistance(userLocation, {
            latitude: gymLocation.lat,
            longitude: gymLocation.long,
          });

          return distance;
        })
      );

      const isWithinGymRadius = gymDistances.some((distance) => distance <= 50);

      if (!isWithinGymRadius) return null;

      return user;
    });

    const filteredUsers = (await Promise.all(filteredUsersPromises)).filter(
      (user) => user !== null
    );

    return filteredUsers.filter((u) => u?.id !== user?.id) as User[];
  }

  return filterUsers(); // Return the result of filterUsers
};
