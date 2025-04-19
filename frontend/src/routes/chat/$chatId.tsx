import { createFileRoute } from '@tanstack/react-router';
import { SendIcon } from 'lucide-react';
import React from 'react';
import { useChat } from '../../hooks/useChat'; // Import the custom hook
import { ChatWrapper } from '@/components/ChatWrapper';
import { requireAuth } from '@/lib/auth';

export const Route = createFileRoute('/chat/$chatId')({
  component: Chat,
  beforeLoad: requireAuth,
});

function Chat() {
  const { chatId } = Route.useParams(); // Get the userId from the route params
  const { messages, newMessage, setNewMessage, handleAddMessage } =
    useChat(chatId); // Use the custom hook

  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom of the chat when a new message is added
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ChatWrapper>
      <div className="h-full flex flex-col p-5 font-sans">
        <h1 className="text-2xl font-bold mb-4">Chatting with {chatId}</h1>
        <div className="flex-grow w-full overflow-y-auto space-y-3 flex flex-col justify-end">
          {messages.map((message, index) => (
            <div
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              key={index}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.sender === 'me'
                    ? 'bg-gray-300 dark:bg-gray-800 self-end text-right'
                    : 'bg-pink-300 dark:bg-pink-800 self-start text-left'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {/* Invisible div to ensure scrolling to the bottom */}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleAddMessage}
          className="mt-5 flex items-center border-t border-gray-300 pt-3"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter a new message"
            className="bg-gray-300 dark:bg-gray-800 px-3 py-2 w-full rounded-l rounded-r-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 w-auto whitespace-nowrap rounded-r rounded-l-none"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </ChatWrapper>
  );
}
