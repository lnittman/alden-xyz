// Export service classes
export { UserService } from './user';
export { BoardService } from './board';
export { AssetService } from './asset';
export { UploadService } from './uploads';
export { SearchService } from './search';

// Export factory - this is the primary way to use services
export { createServices, type Services, type ServiceConfig } from './factory';

export {
  ServiceError,
  notFound,
  unauthorized,
  badRequest,
  conflict,
  internalError,
} from './lib/errors';
export type { ResourceType } from './lib/types';

// API type exports
export * from './types/api';

// Upload type exports
export type { StagedUpload } from './uploads';

// Search type exports
export type {
  SearchResult,
  SearchOptions,
  EnhancedSearchOptions,
} from './search';
