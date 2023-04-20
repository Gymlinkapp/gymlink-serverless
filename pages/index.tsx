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
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // if localstorage password === env password
    if (localStorage.getItem('password') === process.env.NEXT_PUBLIC_PASSWORD) {
      console.log('true');
      fetch('http://localhost:3000/api/users/allUsers').then((res) =>
        res.json().then((data) => setUsers(data.users))
      );
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
                className='flex flex-col p-8 bg-slate-800 rounded-2xl shadow-sm'
              >
                <div className='flex gap-2'>
                  <div className='relative w-16 h-16'>
                    <Image
                      src={user.images[0]}
                      className='rounded-full object-cover'
                      fill
                      sizes='50%'
                      alt='user image'
                    />
                  </div>
                  <div className='flex flex-col text-md font-medium gap-2'>
                    <h4>
                      {user.firstName} {user.lastName}
                    </h4>
                    {user.password && (
                      <p className='bg-slate-700 max-w-fit text-xs px-8 py-2 rounded-full'>
                        Bot
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </main>
    </>
  );
}
