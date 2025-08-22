/**
 * Complete Squish AI Integration Example
 *
 * This example demonstrates:
 * - AI SDK v5 with streaming
 * - Mastra memory for chat persistence
 * - Cloudflare KV rate limiting
 * - Thread management
 * - Tool invocations
 * - Data parts for real-time updates
 */

'use client';

import { useChatThreads, useSquishChat } from '@repo/ai/react';
import type { SquishUIMessage } from '@repo/ai/types/squish-chat';
import { useState } from 'react';

export function CompleteSquishAIIntegration() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Thread management
  const {
    threads,
    isLoading: threadsLoading,
    createThread,
    deleteThread,
  } = useChatThreads({
    onError: (_error) => {},
  });

  // Chat functionality with persistence
  const {
    messages,
    input,
    setInput,
    append,
    isLoading,
    error,
    isOpen,
    toggleChat,
    threadId,
    setThreadId,
  } = useSquishChat({
    threadId: selectedThreadId || undefined,
    onFinish: (_message) => {},
    onError: (error) => {
      if (error.message?.includes('429')) {
        alert('Rate limit exceeded. Please wait a moment.');
      }
    },
  });

  // Handle thread selection
  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    setThreadId(threadId);
  };

  // Create new thread
  const handleNewThread = async () => {
    const thread = await createThread({
      title: `Chat ${new Date().toLocaleDateString()}`,
    });
    handleThreadSelect(thread.id);
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    await append({
      role: 'user',
      content: input,
    });

    setInput('');
  };

  // Render message with all AI SDK v5 features
  const renderMessage = (message: SquishUIMessage) => {
    // For user messages, just show content
    if (message.role === 'user') {
      return (
        <div className="user-message">
          <div className="message-header">
            <span className="role">You</span>
            <span className="time">
              {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
            </span>
          </div>
          <div className="content">{message.content}</div>
        </div>
      );
    }

    // For assistant messages, handle parts
    return (
      <div className="assistant-message">
        <div className="message-header">
          <span className="role">Squish AI</span>
          <span className="time">
            {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
          </span>
          {message.metadata?.totalTokens && (
            <span className="tokens">
              {message.metadata.totalTokens} tokens
            </span>
          )}
        </div>

        <div className="message-parts">
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
                  <div key={i} className="tool-call-part">
                    <div className="tool-header">
                      <span className="tool-icon">🔧</span>
                      <span className="tool-name">{part.toolName}</span>
                      <span className="tool-status">Calling...</span>
                    </div>
                    <pre className="tool-args">
                      {JSON.stringify(part.args, null, 2)}
                    </pre>
                  </div>
                );

              case 'tool-result':
                return (
                  <div key={i} className="tool-result-part">
                    <div className="tool-header">
                      <span className="tool-icon">✅</span>
                      <span className="tool-name">{part.toolName}</span>
                      <span className="tool-status">Complete</span>
                    </div>
                    <div className="tool-result">
                      {renderToolResult(part.toolName, part.result)}
                    </div>
                  </div>
                );

              // Custom data parts for Squish
              case 'data-board-update':
                return (
                  <div key={i} className="data-part board-update">
                    <div className="update-header">
                      <span className="icon">📋</span>
                      <span className="action">{part.data.action}</span>
                    </div>
                    {part.data.board && (
                      <div className="board-info">
                        <span className="emoji">{part.data.board.emoji}</span>
                        <span className="name">{part.data.board.name}</span>
                      </div>
                    )}
                  </div>
                );

              case 'data-asset-update':
                return (
                  <div key={i} className="data-part asset-update">
                    <div className="update-header">
                      <span className="icon">🖼️</span>
                      <span className="action">{part.data.action}</span>
                    </div>
                    {part.data.asset && (
                      <div className="asset-info">
                        <span className="type">{part.data.asset.type}</span>
                        <span className="name">{part.data.asset.name}</span>
                      </div>
                    )}
                  </div>
                );

              case 'data-status':
                return (
                  <div key={i} className="data-part status-update">
                    <div className="status-content">
                      <span className="status-icon">
                        {getStatusIcon(part.data.status)}
                      </span>
                      <span className="status-text">
                        {part.data.message || part.data.status}
                      </span>
                    </div>
                    {part.data.progress !== undefined && (
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
      </div>
    );
  };

  // Helper to render tool results nicely
  const renderToolResult = (toolName: string, result: any) => {
    switch (toolName) {
      case 'tool-searchBoards':
        return (
          <div className="boards-list">
            {result.boards?.map((board: any) => (
              <div key={board.id} className="board-item">
                <span className="emoji">{board.emoji}</span>
                <span className="name">{board.name}</span>
                <span className="count">{board.assetCount} assets</span>
              </div>
            ))}
          </div>
        );

      case 'tool-searchAssets':
        return (
          <div className="assets-list">
            {result.assets?.map((asset: any) => (
              <div key={asset.id} className="asset-item">
                <span className="type-badge">{asset.type}</span>
                <span className="name">{asset.name}</span>
                <span className="board">{asset.boardName}</span>
              </div>
            ))}
          </div>
        );

      default:
        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'searching':
        return '🔍';
      case 'analyzing':
        return '🔬';
      case 'organizing':
        return '📊';
      case 'completed':
        return '✨';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="squish-ai-container">
      {/* Thread Sidebar */}
      <div className={`thread-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Chat History</h3>
          <button onClick={handleNewThread} className="new-thread-btn">
            + New Chat
          </button>
        </div>

        <div className="threads-list">
          {threadsLoading ? (
            <div className="loading">Loading threads...</div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`thread-item ${thread.id === threadId ? 'active' : ''}`}
                onClick={() => handleThreadSelect(thread.id)}
              >
                <div className="thread-title">
                  {thread.title || 'Untitled Chat'}
                </div>
                <div className="thread-meta">
                  <span className="message-count">
                    {thread.metadata?.messageCount || 0} messages
                  </span>
                  <span className="last-activity">
                    {thread.metadata?.lastActivity
                      ? new Date(
                          thread.metadata.lastActivity
                        ).toLocaleDateString()
                      : 'No activity'}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(thread.id);
                  }}
                  className="delete-thread"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <button onClick={toggleChat} className="toggle-sidebar">
            ☰
          </button>
          <h2>Squish AI Assistant</h2>
          <div className="header-info">
            {threadId && <span className="thread-id">Thread: {threadId}</span>}
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h3>Welcome to Squish AI!</h3>
              <p>I can help you:</p>
              <ul>
                <li>🔍 Search and organize your boards</li>
                <li>🖼️ Analyze and organize assets</li>
                <li>🎨 Discover patterns in your collections</li>
                <li>📊 Create smart groupings</li>
              </ul>
              <p>Try asking me something!</p>
            </div>
          ) : (
            messages.map((message, i) => (
              <div key={message.id || i} className="message-wrapper">
                {renderMessage(message)}
              </div>
            ))
          )}

          {isLoading && (
            <div className="loading-message">
              <div className="typing-indicator">
                <span />
                <span />
                <span />
              </div>
              <span>AI is thinking...</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error.message}</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your boards and assets..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-button"
            >
              <span className="send-icon">→</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              type="button"
              onClick={() => setInput('Search my design inspiration boards')}
              className="quick-action"
            >
              🔍 Search Boards
            </button>
            <button
              type="button"
              onClick={() => setInput('Create a mood board for my new project')}
              className="quick-action"
            >
              ➕ Create Board
            </button>
            <button
              type="button"
              onClick={() =>
                setInput('Analyze color themes in my recent assets')
              }
              className="quick-action"
            >
              🎨 Analyze Colors
            </button>
            <button
              type="button"
              onClick={() => setInput('Organize my assets by similarity')}
              className="quick-action"
            >
              📊 Organize Assets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * CSS Styles (add to your global styles or CSS-in-JS)
 *
 * .squish-ai-container {
 *   display: flex;
 *   height: 100vh;
 *   background: #f9fafb;
 * }
 *
 * .thread-sidebar {
 *   width: 300px;
 *   background: white;
 *   border-right: 1px solid #e5e7eb;
 *   display: flex;
 *   flex-direction: column;
 *   transition: transform 0.3s ease;
 * }
 *
 * .thread-sidebar:not(.open) {
 *   transform: translateX(-100%);
 *   margin-left: -300px;
 * }
 *
 * .chat-main {
 *   flex: 1;
 *   display: flex;
 *   flex-direction: column;
 *   overflow: hidden;
 * }
 *
 * .messages-container {
 *   flex: 1;
 *   overflow-y: auto;
 *   padding: 20px;
 * }
 *
 * .message-wrapper {
 *   margin-bottom: 20px;
 * }
 *
 * .tool-call-part, .tool-result-part {
 *   background: #f3f4f6;
 *   border-radius: 8px;
 *   padding: 12px;
 *   margin: 8px 0;
 * }
 *
 * .data-part {
 *   background: #e0f2fe;
 *   border-radius: 8px;
 *   padding: 12px;
 *   margin: 8px 0;
 * }
 *
 * .typing-indicator span {
 *   display: inline-block;
 *   width: 8px;
 *   height: 8px;
 *   border-radius: 50%;
 *   background: #6b7280;
 *   margin: 0 2px;
 *   animation: typing 1.4s infinite;
 * }
 */
