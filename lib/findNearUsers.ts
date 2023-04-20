import { Gym, PrismaClient, User } from '@prisma/client';
import { haversineDistance } from './haversineDistance';

const prisma = new PrismaClient();
/**
 * This TypeScript function finds users who are near the current user's gym location using the
 * haversine distance formula.
 * @param {User[]} feed - An array of `User` objects representing all the users in the system.
 * @param {User} user - The `user` parameter is an object representing the current user for whom we
 * want to find nearby users. It should have properties such as `id`, `latitude`, and `longitude`.
 * @param {boolean} [logs] - `logs` is an optional boolean parameter that determines whether or not to
 * log information about the distance calculations between users and gyms. If `logs` is set to `true`,
 * the function will log the user's coordinates, the gym's coordinates, and the distance between them
 * for each user. If
 * @returns The function `findNearUsers` is returning a Promise that resolves to an array of `User`
 * objects that are within the radius of the nearest gym, and are not the same as the current user. If
 * there are no such users, an empty array is returned.
 */
export const findNearUsers = async (
  feed: User[],
  user: User,
  logs?: boolean
): Promise<User[]> => {
  // get user's current gym
  const users = await prisma.user.findMany({
    include: {
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

  type Coords = {
    latitude: number;
    longitude: number;
  };

  /**
   * This function finds the nearest gym to a user's location using haversine distance formula.
   * @param {Coords} userLocation - The current location of the user, represented as a Coords object
   * with latitude and longitude properties.
   * @param {Gym[]} gymLocations - An array of objects representing gym locations. Each object should
   * have a `locationId` property that corresponds to the ID of the location in the database.
   * @returns an object with two properties: `nearestGym` and `distance`. `nearestGym` is the gym
   * object from the `gymLocations` array that is closest to the `userLocation`, and `distance` is the
   * distance in kilometers between the `userLocation` and the nearest gym.
   */
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

  /**
   * This function filters a list of users based on their proximity to the nearest gym location.
   * @returns The function `filterUsers` returns an array of `User` objects that are within the radius
   * of the nearest gym, and are not the same as the current user. If there are no such users, an empty
   * array is returned.
   */
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
