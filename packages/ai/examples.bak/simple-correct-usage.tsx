/**
 * Simple, Correct Squish AI Integration
 *
 * This example shows the proper way to integrate AI:
 * - Let Mastra handle all persistence
 * - Keep the web app focused on UI
 * - Use AI SDK v5 for streaming
 */

'use client';

import { useSquishChat } from '@repo/ai/react';

export function SimpleSquishChat() {
  const {
    messages,
    input,
    setInput,
    append,
    isLoading,
    error,
    isOpen,
    toggleChat,
  } = useSquishChat({
    // Just pass context, no thread management needed
    boardId: 'current-board-id',
    onError: (error) => {
      if (error.message?.includes('429')) {
        alert('Too many messages. Please wait a moment.');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    // Simply append the message - Mastra handles everything else
    await append({
      role: 'user',
      content: input,
    });

    setInput('');
  };

  return (
    <>
      <button onClick={toggleChat} className="chat-toggle">
        💬 {isOpen ? 'Close' : 'Open'} Chat
      </button>

      {isOpen && (
        <div className="chat-container">
          <div className="messages">
            {messages.map((message, i) => (
              <div key={message.id || i} className={`message ${message.role}`}>
                {message.role === 'user' ? (
                  <div>{message.content}</div>
                ) : (
                  <div>
                    {/* Render assistant message parts */}
                    {message.parts?.map((part, j) => {
                      if (part.type === 'text') {
                        return <div key={j}>{part.content}</div>;
                      }
                      if (part.type === 'tool-call') {
                        return (
                          <div key={j} className="tool-call">
                            🔧 Calling {part.toolName}...
                          </div>
                        );
                      }
                      if (part.type === 'tool-result') {
                        return (
                          <div key={j} className="tool-result">
                            ✅ {part.toolName} complete
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading && <div className="loading">AI is thinking...</div>}
            {error && <div className="error">Error: {error.message}</div>}
          </div>

          <form onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/**
 * That's it! No thread management, no manual persistence.
 * Mastra handles all of that automatically.
 *
 * If you need to display chat history later, you can:
 * 1. Use Mastra's client SDK directly
 * 2. Or add a separate "history" feature that queries Mastra
 *
 * But for the chat itself, keep it simple!
 */
