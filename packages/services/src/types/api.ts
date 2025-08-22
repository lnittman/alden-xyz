// API Response and Request types
export type BoardAccessLevel = 'read' | 'write' | 'admin';

export interface CreateAssetBody {
  boardId: string;
  name: string;
  type: string;
  url: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  blurhash?: string;
  metadata?: Record<string, unknown>;
}

export interface StageAssetBody {
  boardId: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface AddBoardCollaboratorRequest {
  access_level?: BoardAccessLevel;
  board_id: string;
  user_id: string;
}

export interface AssetListResponse {
  items: any[]; // Will be replaced with database Asset type
  limit: number;
  offset: number;
  sort_by: string;
  sort_order: string;
}

export interface AssetResponse {
  id: string;
  type: string;
  created: string;
  updated: string;
  created_by?: any;
  name: string;
  url: string;
  height?: any;
  thumbnail_url?: any;
  width?: any;
  boards?: any[];
  asset_metadata?: any;
}

export interface BoardCollaboratorsResponse {
  collaborators: Record<string, any>[];
}

export interface BoardListResponse {
  boards: any[]; // Will be replaced with database Board type
  total: number;
  limit: number;
  offset: number;
  sort_by: string;
  sort_order: string;
}

export interface BoardResponse {
  id: string;
  created: string;
  updated: string;
  name: string;
  emoji: string;
  color: string;
  created_by: string;
  collaborators?: any[];
  assets?: AssetResponse[];
  description?: string;
  visibility?: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  is_private?: boolean;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  emoji?: string;
  color?: string;
  is_private?: boolean;
}

export interface UpdateBoardIconRequest {
  emoji: string;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  name?: string;
  pfp?: string;
  bio?: string;
  pronouns?: string[];
  show_pronouns?: boolean;
  gender?: string;
  email?: string;
  phone?: string;
  country?: string;
  created: string;
  updated: string;
  pinned_columns?: any[];
  selected_profile_stat?: string;
}

export interface UserProfileUpdateRequest {
  username?: string;
  name?: string;
  bio?: string;
  pfp?: string;
  pronouns?: string[];
  show_pronouns?: boolean;
  gender?: string;
  country?: string;
  pinned_columns?: any[];
  selected_profile_stat?: string;
}

export interface SearchBody {
  query: string;
  filters?: {
    type?: string[];
    board_id?: string[];
    user_id?: string[];
    date_range?: {
      start?: string;
      end?: string;
    };
  };
  limit?: number;
  offset?: number;
}
