/**
 * Example: Squish Chat with AI SDK v5 Tools
 *
 * This example demonstrates how to use the Squish Chat with tool invocations
 * for searching boards, creating boards, and organizing assets.
 */

'use client';

import { useSquishChat } from '../hooks/use-squish-chat';
import type { SquishUIMessage } from '../types/squish-chat';

export function SquishChatWithTools() {
  const {
    messages,
    input,
    setInput,
    append,
    isLoading,
    error,
    // Squish-specific
    isOpen,
    toggleChat,
    data,
  } = useSquishChat({
    api: '/api/ai/chat',
    userId: 'user-123',
    boardId: 'board-456',
    onFinish: (_message) => {},
    onError: (_error) => {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    // Append user message - the server will handle tools
    await append({
      role: 'user',
      content: input,
    });

    setInput('');
  };

  // Render message parts including tool invocations
  const renderMessage = (message: SquishUIMessage) => {
    return (
      <div className={`message ${message.role}`}>
        {message.role === 'user' ? (
          <div className="content">{message.content}</div>
        ) : (
          <div className="assistant-message">
            {/* Render each part of the assistant message */}
            {message.parts?.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return (
                    <div key={i} className="text-part">
                      {part.content}
                    </div>
                  );

                case 'tool-call':
                  return (
                    <div key={i} className="tool-call">
                      <div className="tool-name">🔧 {part.toolName}</div>
                      <pre className="tool-args">
                        {JSON.stringify(part.args, null, 2)}
                      </pre>
                    </div>
                  );

                case 'tool-result':
                  return (
                    <div key={i} className="tool-result">
                      <div className="tool-name">✅ {part.toolName} result</div>
                      <pre className="tool-output">
                        {JSON.stringify(part.result, null, 2)}
                      </pre>
                    </div>
                  );

                // Custom data parts
                case 'data-board-update':
                  return (
                    <div key={i} className="board-update">
                      <div className="update-icon">📋</div>
                      <div className="update-text">
                        Board "{part.data.board?.name}" was {part.data.action}
                      </div>
                    </div>
                  );

                case 'data-asset-update':
                  return (
                    <div key={i} className="asset-update">
                      <div className="update-icon">🖼️</div>
                      <div className="update-text">
                        Asset "{part.data.asset?.name}" was {part.data.action}
                      </div>
                    </div>
                  );

                case 'data-status':
                  return (
                    <div key={i} className="status-update">
                      <div className="status-icon">
                        {part.data.status === 'searching' && '🔍'}
                        {part.data.status === 'analyzing' && '🔬'}
                        {part.data.status === 'organizing' && '📊'}
                        {part.data.status === 'completed' && '✨'}
                        {part.data.status === 'error' && '❌'}
                      </div>
                      <div className="status-text">
                        {part.data.message || part.data.status}
                      </div>
                      {part.data.progress && (
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${part.data.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="chat-toggle"
        aria-label="Toggle chat"
      >
        💬 {isOpen ? 'Close' : 'Open'} Squish Chat
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>Squish AI Assistant</h3>
            <div className="context-info">
              {data.boardId && <span>Board: {data.boardId}</span>}
              {data.userId && <span>User: {data.userId}</span>}
            </div>
          </div>

          <div className="messages-container">
            {messages.map((message, i) => (
              <div key={message.id || i}>{renderMessage(message)}</div>
            ))}

            {isLoading && (
              <div className="loading-indicator">
                <span className="spinner">⚪</span>
                AI is thinking...
              </div>
            )}

            {error && (
              <div className="error-message">❌ Error: {error.message}</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to search boards, organize assets..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-button"
            >
              Send
            </button>
          </form>

          {/* Suggested Prompts */}
          <div className="suggested-prompts">
            <button
              onClick={() => setInput('Search for design inspiration boards')}
            >
              🔍 Search boards
            </button>
            <button
              onClick={() => setInput('Create a new mood board for my project')}
            >
              ➕ Create board
            </button>
            <button
              onClick={() =>
                setInput('Analyze my recent assets for color themes')
              }
            >
              🎨 Analyze assets
            </button>
            <button onClick={() => setInput('Organize my assets by theme')}>
              📊 Organize assets
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Example CSS (add to your global styles):
 *
 * .chat-container {
 *   position: fixed;
 *   bottom: 20px;
 *   right: 20px;
 *   width: 400px;
 *   height: 600px;
 *   background: white;
 *   border-radius: 12px;
 *   box-shadow: 0 4px 20px rgba(0,0,0,0.1);
 *   display: flex;
 *   flex-direction: column;
 * }
 *
 * .tool-call, .tool-result {
 *   background: #f3f4f6;
 *   padding: 8px;
 *   margin: 4px 0;
 *   border-radius: 6px;
 *   font-size: 12px;
 * }
 *
 * .board-update, .asset-update, .status-update {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 *   padding: 8px;
 *   background: #e0f2fe;
 *   border-radius: 6px;
 *   margin: 4px 0;
 * }
 */
