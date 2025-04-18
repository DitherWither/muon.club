import { env } from '@/env';
import { useState, useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';

interface Message {
  text: string;
  sender: 'me' | 'other';
}

export function useChat(userId: string) {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  // Use the WebSocket URL from the environment variable
  const websocketUrl = env.VITE_WEBSOCKET_URL;

  const { sendMessage, readyState } = useWebSocket(`${websocketUrl}`, {
    onOpen: () => {
      console.log('WebSocket connection established');
    },
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message.text, sender: message.sender },
      ]);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    shouldReconnect: (_) => true,
  });

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(
        JSON.stringify({
          text: newMessage,
          sender: 'me',
        }),
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, sender: 'me' },
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
