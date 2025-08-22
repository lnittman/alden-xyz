// Define collaboration types for your application
// Following the pattern from next-forge but using Pusher instead of Liveblocks

declare global {
  interface CollaborationTypes {
    // Each user's Presence
    Presence: {
      user: {
        id: string;
        name?: string;
        avatar?: string;
        color?: string;
      };
      cursor?: { x: number; y: number };
      selection?: string;
      lastSeen: number;
      roomId: string;
    };

    // Custom user info set when authenticating
    UserMeta: {
      id: string;
      info: {
        name?: string;
        avatar?: string;
        color: string;
      };
    };

    // Custom events for real-time updates
    RoomEvent:
      | { type: 'upload-progress'; progress: number; assetId: string }
      | { type: 'board-update'; boardId: string; changes: any }
      | { type: 'asset-added'; assetId: string; boardId: string }
      | { type: 'asset-removed'; assetId: string; boardId: string }
      | { type: 'user-joined'; userId: string }
      | { type: 'user-left'; userId: string };

    // Room info
    RoomInfo: {
      id: string;
      type: 'board' | 'asset' | 'profile';
      title?: string;
    };
  }
}

export {};
