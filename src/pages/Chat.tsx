
import { MessageSquare, Send, Bot, User } from "lucide-react";

const Chat = () => {
  const messages = [
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your AI assistant with access to all your knowledge bases. How can I help you today?",
      timestamp: "10:30 AM"
    },
    {
      id: 2,
      role: "user",
      content: "What's the latest information about our competitor analysis?",
      timestamp: "10:32 AM"
    },
    {
      id: 3,
      role: "assistant",
      content: "Based on the competitor knowledge base, I found several recent updates about market positioning and competitive strategies. Would you like me to provide a detailed breakdown?",
      timestamp: "10:33 AM",
      sources: ["Competitor Knowledge Base", "Industry Knowledge Base"]
    }
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Chat</h1>
            <p className="text-gray-600">Chat with all your knowledge bases</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
            )}
            <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
              <div className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-purple-600 text-white ml-auto' : 'bg-gray-100'}`}>
                <p className="mb-2">{message.content}</p>
                {message.sources && (
                  <div className="text-xs opacity-75 mt-2">
                    Sources: {message.sources.join(', ')}
                  </div>
                )}
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                {message.timestamp}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 p-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Ask anything about your knowledge bases..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
