import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Header from './Header';
import { getCurrentUser, logoutFromBackend } from '@/lib/auth';
import {
  acceptFriendRequest,
  getFriendsList,
  makeFriendRequest,
  randomFriend,
  removeFriend,
} from '@/lib/friends';

export const ChatWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [newUserId, setNewUserId] = useState('');
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: getFriendsList,
  });

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  // Mutation to add a user to a chat
  const makeFriendRequestMutation = useMutation({
    mutationFn: makeFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] }); // Refresh the chats list
    },
  });

  const randomFriendMutation = useMutation({
    mutationFn: randomFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] }); // Refresh the chats list
    },
  });

  // Mutation to remove a friend
  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] }); // Refresh the chats list
    },
  });

  // Mutation to accept a friend request
  const acceptFriendRequestMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] }); // Refresh the chats list
    },
  });

  const handleAddUser = () => {
    if (!newUserId.trim()) return;
    makeFriendRequestMutation.mutate(newUserId);
    setNewUserId(''); // Clear the input field
  };

  // Logout function
  const handleLogout = () => {
    logoutFromBackend(queryClient);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="w-sm bg-gray-100 dark:bg-gray-800 p-4">
          {/* User Profile Section */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
            {isUserLoading ? (
              <p className="text-gray-500 dark:text-gray-400">
                Loading user info...
              </p>
            ) : userError ? (
              <p className="text-red-500">Error loading user information</p>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-medium w-full text-gray-900 dark:text-white">
                      {user.displayName || user.username}
                    </h3>
                    <div className="flex gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        @{user.username}
                      </p>
                      {user.pronouns && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ({user.pronouns})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {user.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {user.bio}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No user data available
              </p>
            )}
          </div>

          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
            Users
          </h2>
          <ul className="space-y-2">
            {isLoading && <li>Loading...</li>}
            {error && <li>Error: {error.message}</li>}
            {data && data.friends.length === 0 && (
              <li className="text-gray-500 dark:text-gray-400">
                No chats available.
              </li>
            )}
            {data &&
              data.friends.map((friend) => (
                <li key={friend.id} className="flex justify-between gap-3">
                  <Link
                    to="/chat/$chatId"
                    params={{ chatId: `${friend.id}` }}
                    className="text-gray-900 dark:text-white hover:underline"
                  >
                    {friend.displayName || friend.username}
                    {friend.pronouns && <span> ({friend.pronouns})</span>}
                  </Link>

                  <button
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                    onClick={() => {
                      removeFriendMutation.mutate(friend.id);
                    }}
                    disabled={removeFriendMutation.isPending}
                  >
                    {removeFriendMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </li>
              ))}
          </ul>
          <h2 className="text-lg font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            Friend Requests
          </h2>
          <ul className="space-y-2">
            {isLoading && <li>Loading...</li>}
            {error && <li>Error: {error.message}</li>}
            {data && data.friendRequests.length === 0 && (
              <li className="text-gray-500 dark:text-gray-400">
                No friend requests.
              </li>
            )}
            {data &&
              data.friendRequests.map((friendRequest) => (
                <li key={friendRequest.id}>
                  <p className="text-gray-900 dark:text-white">
                    {friendRequest.username}
                    <br />
                    <span className="text-gray-500 dark:text-gray-400">
                      Requested you to chat
                      <br />
                      <button
                        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                        onClick={() => {
                          console.log(friendRequest);
                          acceptFriendRequestMutation.mutate(friendRequest.id);
                        }}
                        disabled={makeFriendRequestMutation.isPending}
                      >
                        {makeFriendRequestMutation.isPending
                          ? 'Accepting...'
                          : 'Accept'}
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        onClick={() => {
                          removeFriendMutation.mutate(friendRequest.id);
                        }}
                        disabled={removeFriendMutation.isPending}
                      >
                        {removeFriendMutation.isPending
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </span>
                  </p>
                </li>
              ))}
          </ul>

          {/* Add User Input */}
          <div className="mt-4">
            <input
              type="text"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="Enter user ID"
              autoComplete="off"
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleAddUser}
              className="mt-2 w-full px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              disabled={makeFriendRequestMutation.isPending}
            >
              {makeFriendRequestMutation.isPending ? 'Adding...' : 'Add User'}
            </button>
            <button
              onClick={() => randomFriendMutation.mutate()}
              className="mt-2 w-full px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              disabled={randomFriendMutation.isPending}
            >
              {randomFriendMutation.isPending
                ? 'Adding...'
                : 'Add random friend'}
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-8 w-full px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col">{children}</div>
      </div>
    </div>
  );
};
