import { Gym, PrismaClient, User } from '@prisma/client';
import { haversineDistance } from './haversineDistance';

const prisma = new PrismaClient();
export const findNearUsers = async (
  user: User,
  logs?: boolean
): Promise<User[]> => {
  // get user's current gym
  const users = await prisma.user.findMany();
  const gymLocations = await prisma.gym.findMany();

  type Coords = {
    latitude: number;
    longitude: number;
  };

  // Function to find the nearest gym for a user
  async function findNearestGym(userLocation: Coords, gymLocations: Gym[]) {
    let nearestGym: Gym | null = null;
    let minDistance = Infinity;

    for (const gym of gymLocations) {
      const gymLocation = await prisma.location.findUnique({
        where: {
          id: gym.locationId,
        },
      });
      if (!gymLocation) continue;
      const distance = haversineDistance(userLocation, {
        latitude: gymLocation.lat,
        longitude: gymLocation.long,
      });

      if (distance < minDistance) {
        minDistance = distance;
        nearestGym = gym;
      }
    }

    return { nearestGym, distance: minDistance };
  }

  async function filterUsers() {
    const filteredUsersPromises = users.map(async (user) => {
      const userLocation = {
        latitude: user.latitude as number,
        longitude: user.longitude as number,
      };

      const { nearestGym, distance } = await findNearestGym(
        userLocation,
        gymLocations
      );
      if (!nearestGym) return null;

      const nearestGymLocation = await prisma.location.findUnique({
        where: {
          id: nearestGym.locationId,
        },
      });

      if (!nearestGymLocation) return null;

      if (logs) {
        console.log('User coordinates:', user.latitude, user.longitude);
        console.log(
          'Gym coordinates:',
          nearestGymLocation.lat,
          nearestGymLocation.long
        );
        console.log('Distance:', distance);
      }

      return distance <= nearestGym.radius ? user : null;
    });

    const filteredUsers = (await Promise.all(filteredUsersPromises)).filter(
      (user) => user !== null
    );

    return filteredUsers.filter((u) => u?.id !== user?.id) as User[];
  }

  return filterUsers(); // Return the result of filterUsers
};
