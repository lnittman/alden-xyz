import { Memory } from '@mastra/memory';
import { createPostgresStorage } from '../../lib/storage';

export const createSquishChatMemory = () => {
  const { storage, vectorDB } = createPostgresStorage();

  return new Memory({
    storage,
    vectorDB,
    options: {
      workingMemory: {
        use: 'tool-call',
      },
      semanticMemory: {
        enabled: true,
        graphSearch: {
          depth: 3,
          includeConcepts: true,
        },
      },
      episodicMemory: {
        enabled: true,
        retentionDays: 90,
      },
    },
  });
};
