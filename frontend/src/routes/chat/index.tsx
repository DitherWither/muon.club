import { createFileRoute } from '@tanstack/react-router';
import { ChatWrapper } from '@/components/ChatWrapper';
import { requireAuth } from '@/lib/auth';
import { useChat } from '@/hooks/useChat';

export const Route = createFileRoute('/chat/')({
  component: Chat,
  beforeLoad: requireAuth,
});

function Chat() {
  // We pass -1 to useChat because we just want a websocket to be opened
  // We don't care who it is
  const _ = useChat(-1);
  return (
    <ChatWrapper>
      <div className="h-full flex items-center justify-center font-sans">
        <h1 className="text-2xl font-bold">Select a user to start chatting</h1>
      </div>
    </ChatWrapper>
  );
}
