import { FilterType } from '../lib/filters';
import { Sex, faker } from '@faker-js/faker';
import { PostTag, Prisma, PrismaClient, User } from '@prisma/client';
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

const generateRandomImages = (
  gender: Sex
): { url: string; gender: string }[] => {
  type Image = {
    url: string;
    gender: string;
  };

  const images: Image[] = [
    {
      url: 'https://images.unsplash.com/photo-1632781297772-1d68f375d878?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=627&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1614367674345-f414b2be3e5b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1823&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1677280953786-456bb8a71038?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1679553621986-698f4d8b8e16?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2127&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1613686955273-4ac02632ae12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1593476123435-4dbefa591fca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1659350776600-704fbc39036a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1584863265045-f9d10ca7fa61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1541694458248-5aa2101c77df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1609899464726-209befaac5bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1584464367415-2e7ff6482b54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1579758682665-53a1a614eea6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      gender: 'male',
    },
    {
      url: 'https://images.unsplash.com/photo-1571103774228-4525b17eb389?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1888&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1567013275689-c179a874478f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1662045010187-80bf72e85eee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1641808887202-3fea3721dc7f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
      gender: 'female',
    },
    {
      url: 'https://images.unsplash.com/photo-1651577348901-eb4272b4d79b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
      gender: 'female',
    },
  ];

  const genderImages = images.filter((image) => image.gender === gender);
  const numImages = Math.floor(Math.random() * 4) + 1; // Generate a random number between 1 and 4
  const userImages = [];

  for (let i = 0; i < numImages; i++) {
    const imageUrl =
      i === 0
        ? genderImages[Math.floor(Math.random() * genderImages.length)].url
        : getRandomProfilePicture();

    userImages.push({
      url: imageUrl,
      gender: gender,
    });
  }

  return userImages;
};

const generateRandomFilters = (filterType: FilterType): string[] => {
  const filterTypes = [
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
      const randomIndex = Math.floor(Math.random() * ft.values.length); // Fixed line
      filters.push({
        filter: ft.name,
        value: ft.values[randomIndex] as string,
      });
    }
  });

  return filters.map((f) => f.value) as string[];
};

const generateIsGoingToday = () => {
  const randomIndex = Math.floor(Math.random() * 2);
  return [true, false][randomIndex] as boolean;
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

  const images = generateRandomImages(gender);

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
    images: images.map((image) => image.url),
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
    filterGoals: generateRandomFilters(FilterType.GOALS),
    filterSkillLevel: generateRandomFilters(FilterType.SKILL_LEVEL),
    filterWorkout: generateRandomFilters(FilterType.WORKOUT_TYPE),
    filterGoingToday: generateIsGoingToday(),
    longitude: generateRandomLocation().long,
    latitude: generateRandomLocation().lat,
    gym: {
      create: {
        name: 'Fit4Less',
        location: {
          create: {
            lat: generateRandomLocation().lat,
            long: generateRandomLocation().long,
          },
        },
      },
    },
  };
}

async function generatePosts(
  prisma: PrismaClient,
  user: Prisma.UserCreateInput
) {
  const postCount = Math.floor(Math.random() * 5) + 1; // Generate a random number between 1 and 5
  const tags = ['ADVICE', 'QUESTION', 'GENERAL'];
  const posts = [];

  for (let i = 0; i < postCount; i++) {
    const post = await prisma.post.create({
      data: {
        content: faker.lorem.paragraph(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        tags: tags[Math.floor(Math.random() * tags.length)] as PostTag,
        user: {
          connect: {
            email: user.email,
          },
        },
      },
    });

    const likeCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < likeCount; j++) {
      await prisma.like.create({
        data: {
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          user: {
            connect: {
              email: user.email,
            },
          },
          post: {
            connect: {
              id: post.id,
            },
          },
        },
      });
    }

    const commentCount = Math.floor(Math.random() * 3) + 1;
    for (let k = 0; k < commentCount; k++) {
      await prisma.comment.create({
        data: {
          content: faker.lorem.sentence(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          user: {
            connect: {
              email: user.email,
            },
          },
          post: {
            connect: {
              id: post.id,
            },
          },
        },
      });
    }

    const viewCount = Math.floor(Math.random() * 10) + 1;
    for (let l = 0; l < viewCount; l++) {
      await prisma.view.create({
        data: {
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          user: {
            connect: {
              email: user.email,
            },
          },
          post: {
            connect: {
              id: post.id,
            },
          },
        },
      });
    }

    posts.push(post);
  }

  return posts;
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

    await generatePosts(prisma, newUser);
    console.log(`Created user: ${newUser.firstName} ${newUser.lastName}`);
  }

  const images = generateRandomImages(Sex.Female);

  await prisma.user.upsert({
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
      images: images.map((image) => image.url),
      gym: {
        create: {
          name: 'Fit4Less',
          location: {
            create: {
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
