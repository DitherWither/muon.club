import React from 'react';
import { Link } from '@tanstack/react-router';
import Header from './Header';

export const ChatWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [users] = React.useState([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ]); // Example user list

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="w-sm bg-gray-100 dark:bg-gray-800 p-4">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
            Users
          </h2>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  to={`/chat/$userId`}
                  params={{ userId: user.id.toString() }}
                  className="w-full block text-left px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-blue-400 hover:text-white"
                  activeProps={{
                    className: 'bg-blue-500 text-white',
                  }}
                >
                  {user.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col">{children}</div>
      </div>
    </div>
  );
};
