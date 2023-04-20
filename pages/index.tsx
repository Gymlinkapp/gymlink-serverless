import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  password?: string;
  isBot: boolean;
  images: string[];
  authSteps: number;
  longitude?: number;
  latitude?: number;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    // if localstorage password === env password
    const isAuthorized =
      localStorage.getItem('password') === process.env.NEXT_PUBLIC_PASSWORD;
    if (isAuthorized) {
      fetch(`${process.env.NEXT_PUBLIC_URL}/users/allUsers`).then((res) =>
        res.json().then((data) => setUsers(data.users))
      );

      // const interval = setInterval(() => {
      //   setImageIndex((prev) => (prev + 1) % 3);
      // }, 5000);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='max-w-5xl mx-auto'>
        <h1>Users</h1>
        <div>
          <button
            onClick={() => {
              const filteredUsers = users.filter(
                (user) => user.password === null || !user.isBot
              );
              setUsers(filteredUsers);
            }}
          >
            Users
          </button>
        </div>
        <ul className='grid grid-cols-3 gap-4'>
          {users &&
            users?.map((user) => (
              <li
                key={user.id}
                className='flex flex-col bg-slate-800 rounded-2xl overflow-auto shadow-sm'
              >
                <div className='relative w-full h-48'>
                  <Image
                    src={user.images[imageIndex]}
                    className=' object-cover'
                    fill
                    sizes='50%'
                    alt='user image'
                  />

                  <div className='absolute bottom-0 left-1/2 flex items-end justify-center z-50 gap-2 rounded-full px-8 py-4 bg-slate-50/25 -translate-x-1/2'>
                    {user.images.map((_, index) => (
                      <span
                        key={index}
                        className='w-2 h-2 rounded-full bg-slate-100'
                      />
                    ))}
                  </div>
                  <div className='absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-800/75 to-transparent'></div>
                </div>
                <div className='flex flex-col text-md font-medium gap-2 p-4'>
                  <h4>
                    {user.firstName} {user.lastName}
                  </h4>
                  {!user.password && (
                    <div className='flex gap-1'>
                      <p className='bg-slate-700 text-xs py-2 px-3 w-fit rounded-full'>
                        {user.authSteps}
                      </p>
                      {user.longitude && user.latitude && (
                        <p className='bg-slate-700 text-xs py-2 px-3 w-fit rounded-full'>
                          Has location
                        </p>
                      )}
                    </div>
                  )}
                  {user.password && (
                    <p className='bg-slate-700 max-w-fit text-xs px-8 py-2 rounded-full'>
                      Bot
                    </p>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </main>
    </>
  );
}
