import { createFileRoute } from '@tanstack/react-router';
import { ChatWrapper } from '@/components/ChatWrapper';

export const Route = createFileRoute('/chat/')({
  component: Chat,
});

function Chat() {
  return (
    <ChatWrapper>
      <div className="h-full flex items-center justify-center font-sans">
        <h1 className="text-2xl font-bold">Select a user to start chatting</h1>
      </div>
    </ChatWrapper>
  );
}
