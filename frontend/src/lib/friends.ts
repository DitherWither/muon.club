import { fetchBackendData } from './auth';

export async function getFriendsList() {
  const response = await fetchBackendData<{
    friends: Array<{
      id: number;
      displayName: string;
      username: string;
      pronouns: string | null;
      bio: string | null;
    }>;
    friendRequests: Array<{
      id: number;
      displayName: string;
      username: string;
      pronouns: string | null;
      bio: string | null;
    }>;
  }>('/api/v1/friends');

  return response;
}

export async function makeFriendRequest(username: string) {
  const response = await fetchBackendData<{
    message: string;
    dm: { id: string; name: string; isDm: boolean };
  }>('/api/v1/friends', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  return response.dm;
}

export async function acceptFriendRequest(friendId: number) {
  console.log(friendId);
  const response = await fetchBackendData<{
    message: string;
    dm: { id: string; name: string; isDm: boolean };
  }>('/api/v1/friends/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ friendId }),
  });

  return response.dm;
}

export async function randomFriend() {
  const response = await fetchBackendData<{
    message: string;
    dm: { id: string; name: string; isDm: boolean };
  }>('/api/v1/friends/random', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // refresh page
  window.location.reload();

  return response.dm;
}

export async function removeFriend(friendId: number) {
  const response = await fetchBackendData<{
    message: string;
    dm: { id: string; name: string; isDm: boolean };
  }>(`/api/v1/friends/${friendId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}
