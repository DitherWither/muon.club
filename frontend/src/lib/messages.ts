import { fetchBackendData } from './auth';

export type Message = {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: string;
};

export async function getMessages(userId: number) {
  const response = await fetchBackendData<Array<Message>>(
    `/api/v1/messages/${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response;
}

export async function createMessage(userId: number, content: string) {
  const response = await fetchBackendData<{
    message: string;
    dm: { id: number; name: string; isDm: boolean };
  }>(`/api/v1/messages/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  return response.dm;
}
