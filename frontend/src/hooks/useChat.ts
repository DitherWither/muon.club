import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/lib/messages';
import { env } from '@/env';
import { createMessage, getMessages } from '@/lib/messages';

export function useChat(userId: number) {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (userId === -1) {
      return;
    }
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
      const message = JSON.parse(event.data) as
        | {
            type: 'message';
            message: Message;
          }
        | {
            type: 'friendRequest';
            message: {
              id: number;
              username: string;
            };
          }
        | {
            type: 'friendRequestAccepted';
            message: {
              id: number;
            };
          }
        | {
            type: 'friendDeleted';
            message: {
              id: number;
            };
          };

      if (message.type === 'message') {
        if (message.message.senderId !== userId) {
          return;
        }
        setMessages((prevMessages) => [...prevMessages, message.message]);
      }
      if (
        message.type === 'friendRequest' ||
        message.type === 'friendDeleted' ||
        message.type === 'friendRequestAccepted'
      ) {
        queryClient.invalidateQueries({ queryKey: ['friends'] }); // Refresh the chats list
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
