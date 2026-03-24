import { contexts, type Message } from "@/data/mockData";

interface MessageBubbleProps {
  message: Message;
  showContextDot?: boolean;
}

const MessageBubble = ({ message, showContextDot }: MessageBubbleProps) => {
  const isMe = message.sender === 'me';
  const context = contexts.find(c => c.id === message.contextId);

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-xl ${
          isMe
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card text-card-foreground shadow-card rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          {showContextDot && context && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: context.color }}
            />
          )}
          <span className={`text-tabular ${isMe ? 'opacity-70' : 'text-muted-foreground'}`}>
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
