import type { DatabaseClient } from '@repo/database';
import { UserService } from './user';
import { BoardService } from './board';
import { AssetService } from './asset';
import { UploadService } from './uploads';
import { SearchService } from './search';

export interface ServiceConfig {
  db: DatabaseClient;
  env: {
    AI_SERVICE_URL?: string;
    STORAGE_PROVIDER?: string;
    R2_BUCKET_NAME?: string;
    [key: string]: any;
  };
}

export function createServices(config: ServiceConfig) {
  return {
    userService: new UserService(config.db),
    boardService: new BoardService(config.db),
    assetService: new AssetService(config.db),
    uploadService: new UploadService(config.db, config.env),
    searchService: new SearchService(config.db, config.env),
  };
}

export type Services = ReturnType<typeof createServices>;