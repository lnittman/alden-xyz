/**
 * Test Direct Mastra Integration
 *
 * This tests if we can use useChat directly with Mastra endpoints
 */

'use client';

import { useChat } from '@ai-sdk/react';

export function TestDirectMastra() {
  // Try different endpoint patterns
  const endpoints = [
    'http://localhost:9998/api/agents/squishChat',
    'http://localhost:9998/agents/squishChat',
    'http://localhost:9998/api/chat',
    'http://localhost:9998/chat',
  ];

  // Test with the most likely endpoint
  const { messages, input, handleInputChange, handleSubmit, error, isLoading } =
    useChat({
      api: endpoints[0], // Try first endpoint
      onError: (_error) => {},
    });

  return (
    <div style={{ padding: '20px' }}>
      <h2>Testing Direct Mastra Integration</h2>
      <p>Endpoint: {endpoints[0]}</p>

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      <div>
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Test message..."
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>

      <details style={{ marginTop: '20px' }}>
        <summary>Try Other Endpoints</summary>
        {endpoints.map((endpoint, i) => (
          <div key={i}>
            <code>{endpoint}</code>
          </div>
        ))}
      </details>
    </div>
  );
}
