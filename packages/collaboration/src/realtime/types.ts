// Realtime event types
export const RealtimeEventType = {
  UPLOAD_PROGRESS: 'upload-progress',
  BOARD_UPDATE: 'board-update',
  ASSET_ADDED: 'asset-added',
  ASSET_REMOVED: 'asset-removed',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
} as const;

export type RealtimeEventType =
  (typeof RealtimeEventType)[keyof typeof RealtimeEventType];

export interface RealtimeEvent {
  type: RealtimeEventType;
  data: any;
  timestamp: number;
  userId: string;
}
