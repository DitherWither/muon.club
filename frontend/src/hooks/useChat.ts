import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import type { Message } from '@/lib/messages';
import { env } from '@/env';
import { createMessage, getMessages } from '@/lib/messages';

export function useChat(userId: number) {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    getMessages(userId).then((history) => setMessages(history));
  }, []);

  const { sendJsonMessage, readyState } = useWebSocket(env.VITE_WEBSOCKET_URL, {
    onOpen: () => {
      sendJsonMessage({
        type: 'authenticate',
        token: localStorage.getItem('token'),
      });
    },
    onMessage: (event) => {
      const message = JSON.parse(event.data) as {
        type: 'message';
        message: Message;
      };
      if (typeof message !== 'object') {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (message.type === 'message') {
        setMessages((prevMessages) => [...prevMessages, message.message]);
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    shouldReconnect: (_) => true,
  });

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = await createMessage(userId, newMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: message.id,
          senderId: +localStorage.getItem('userId')!,
          recipientId: userId,
          content: newMessage,
          createdAt: new Date().toString(),
        },
      ]);
      setNewMessage('');
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    handleAddMessage,
    readyState,
  };
}
