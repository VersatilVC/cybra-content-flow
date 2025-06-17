
import React from 'react';
import { Bot, User } from 'lucide-react';
import { convertMarkdownToHtml } from '@/utils/markdownToHtml';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  created_at: string;
}

export function ChatMessage({ role, content, sources, created_at }: ChatMessageProps) {
  const isUser = role === 'user';
  
  // For AI responses, convert markdown to HTML
  const displayContent = !isUser ? convertMarkdownToHtml(content) : content;

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-purple-600" />
        </div>
      )}
      <div className={`max-w-2xl ${isUser ? 'order-first' : ''}`}>
        <div className={`p-4 rounded-lg ${
          isUser 
            ? 'bg-purple-600 text-white ml-auto' 
            : 'bg-gray-100'
        }`}>
          {!isUser ? (
            <div 
              className="prose prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-3 [&_h3]:mb-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_p]:my-2 [&_strong]:font-semibold [&_em]:italic [&_code]:bg-gray-200 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-800 [&_pre]:text-white [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-purple-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
          {sources && sources.length > 0 && (
            <div className="text-xs opacity-75 mt-2">
              <strong>Sources:</strong> {sources.join(', ')}
            </div>
          )}
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(created_at).toLocaleTimeString()}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}
