import { Sex, faker } from '@faker-js/faker';
import { Prisma, PrismaClient, User } from '@prisma/client';
export type Filter = {
  filter: string;
  value: string | boolean;
};
const prisma = new PrismaClient();

function randomGender(): Sex {
  const genders = ['male', 'female'];
  return genders[Math.floor(Math.random() * genders.length)] as Sex;
}

const generateEmail = (firstName: string, lastName: string) => {
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}@gmail.com`;
};

const generateRandomFilters = (filterType: string) => {
  const filterTypes = [
    {
      name: 'goingToday',
      values: [true, false],
    },
    {
      name: 'workoutType',
      values: ['cardio', 'bench', 'squat'],
    },
    {
      name: 'skillLevel',
      values: ['low', 'medium', 'high'],
    },
    {
      name: 'goals',
      values: ['weightLoss', 'muscleGain', 'toning'],
    },
  ];
  // generate random filters
  const filters: Filter[] = [];

  filterTypes.forEach((ft) => {
    if (ft.name === filterType) {
      const randomIndex = Math.floor(Math.random() * filterTypes.values.length);
      if (typeof ft.values[randomIndex] === 'boolean') {
        filters.push({
          filter: ft.name,
          value: ft.values[randomIndex] as boolean,
        });
      } else {
        filters.push({
          filter: ft.name,
          value: ft.values[randomIndex] as string,
        });
      }
    }
  });

  return filters;
};

const generateRandomLocation = () => {
  type Coords = {
    lat: number;
    long: number;
  };

  const coords: Coords[] = [
    {
      long: -82.963905,
      lat: 42.308211,
    },
    {
      long: -83.284158,
      lat: 42.694791,
    },
    {
      long: -97.74306,
      lat: 30.26715,
    },
    {
      long: -0.127758,
      lat: 51.507351,
    },
    {
      long: -82.95850771080275,
      lat: 42.29926426331974,
    },
    {
      long: -82.97250771080274,
      lat: 42.29926426331974,
    },
    {
      long: -82.96550771080275,
      lat: 42.29326426331974,
    },
  ];

  const randomIndex = Math.floor(Math.random() * coords.length);
  return coords[randomIndex] as Coords;
};

const generateRandomPhoneNumber = () => {
  const randomId = Math.floor(Math.random() * 1000000000);
  return `+1${randomId}`;
};

function getRandomProfilePicture() {
  const randomId = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 1000
  return `https://source.unsplash.com/random/1200x1200?sig=${randomId}&portrait`;
}

function generateRandomUserData(): Prisma.UserCreateInput {
  // random gender
  const gender = randomGender();
  const firstName = faker.name.firstName(gender);
  const lastName = faker.name.lastName();

  return {
    email: generateEmail(firstName, lastName),
    firstName,
    lastName,
    password: 'password',
    bio: faker.lorem.sentence(),
    gender,
    age: Number(faker.random.numeric(2)),
    tags: [
      faker.lorem.word(),
      faker.lorem.word(),
      faker.lorem.word(),
      faker.lorem.word(),
    ],
    authSteps: 7,
    phoneNumber: generateRandomPhoneNumber(),
    verified: true,
    isBot: true,
    images: [
      getRandomProfilePicture(),
      getRandomProfilePicture(),
      getRandomProfilePicture(),
    ],
    split: {
      create: {
        monday: ['chest', 'back'],
        tuesday: ['legs'],
        wednesday: ['chest', 'back'],
        thursday: ['legs'],
        friday: ['chest', 'back'],
        saturday: ['legs'],
        sunday: ['chest', 'back'],
      },
    },
    filterGender: [],
    filterGoals: generateRandomFilters('goals').map((f) => f.value),
    filterSkillLevel: generateRandomFilters('skillLevel').map((f) => f.value),
    filterWorkout: generateRandomFilters('workoutType').map((f) => f.value),
    filterGoingToday: false,
    longitude: generateRandomLocation().long,
    latitude: generateRandomLocation().lat,
    gym: {
      create: {
        name: 'Fit4Less',
        location: {
          create: {
            radius: 5,
            lat: generateRandomLocation().lat,
            long: generateRandomLocation().long,
          },
        },
      },
    },
  };
}

async function createUser(prisma: any, userData: Prisma.UserCreateInput) {
  return await prisma.user.upsert({
    where: { email: userData.email },
    update: {},
    create: userData,
  });
}

async function main() {
  const numberOfUsers = 20; // Change this value to create more or fewer users

  for (let i = 0; i < numberOfUsers; i++) {
    const randomUserData = generateRandomUserData();
    const newUser = await createUser(prisma, randomUserData);
    console.log(`Created user: ${newUser.firstName} ${newUser.lastName}`);
  }

  const barbraJanson = await prisma.user.upsert({
    where: { email: 'barbrajanson@gmail.com' },
    update: {},
    create: {
      email: 'barbrajanson@gmail.com',
      firstName: 'Barbra',
      lastName: 'Janson',
      password: 'password',
      bio: faker.lorem.sentence(),
      age: 21,
      filterGoingToday: false,
      filterGender: [],
      filterGoals: ['weightLoss', 'muscleGain', 'toning'],
      filterSkillLevel: ['beginner', 'intermediate', 'advanced'],
      filterWorkout: ['cardio', 'strength', 'flexibility'],
      longitude: generateRandomLocation().long,
      latitude: generateRandomLocation().lat,
      images: [
        getRandomProfilePicture(),
        getRandomProfilePicture(),
        getRandomProfilePicture(),
      ],
      gym: {
        create: {
          name: 'Fit4Less',
          location: {
            create: {
              radius: 5,
              lat: 42.300916870848894,
              long: -82.97919754434378,
            },
          },
        },
      },

      tags: [
        { name: 'Shoulder Press' },
        { name: 'Gobblin Squats' },
        { name: 'Dips' },
      ],
      split: {
        create: {
          monday: ['chest', 'back'],
          tuesday: ['legs'],
          wednesday: ['chest', 'back'],
          thursday: ['legs'],
          friday: ['chest', 'back'],
          saturday: ['legs'],
          sunday: ['chest', 'back'],
        },
      },
      authSteps: 7,
      phoneNumber: generateRandomPhoneNumber(),
      verified: true,
      isBot: true,
    },
  });
}

main()
  .then(() => {
    prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();

    process.exit(1);
  });
