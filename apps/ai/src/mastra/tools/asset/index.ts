// Asset Organization Tools
// These tools provide AI-powered assistance for asset discovery, categorization, and organization

export { searchAssetsTool } from './search-assets';
export { categorizeAssetsTool } from './categorize-assets';
export { findSimilarAssetsTool } from './find-similar-assets';
export { generateAssetTagsTool } from './generate-asset-tags';
export { organizeAssetsByThemeTool } from './organize-by-theme';

// Re-export types and utilities
export type SearchMethod = 'semantic' | 'visual' | 'metadata' | 'content';
export type CategorySystem = 'smart' | 'thematic' | 'technical' | 'custom';
export type SimilarityType = 'visual' | 'semantic' | 'contextual' | 'stylistic' | 'technical';
export type TagSource = 'visual' | 'metadata' | 'content' | 'context' | 'semantic';
export type TagType = 'descriptive' | 'emotional' | 'stylistic' | 'technical' | 'thematic' | 'categorical';
export type OrganizationMethod = 'visual' | 'semantic' | 'hybrid' | 'temporal' | 'contextual';

// Asset search filters interface
export interface AssetSearchFilters {
  assetTypes?: ('image' | 'video' | 'audio' | 'document' | 'gif')[];
  boardIds?: string[];
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  visualAttributes?: {
    dominantColors?: string[];
    brightness?: 'dark' | 'medium' | 'bright';
    saturation?: 'low' | 'medium' | 'high';
    composition?: 'portrait' | 'landscape' | 'square';
  };
  minWidth?: number;
  minHeight?: number;
  maxFileSize?: number;
}

// Similarity search scope interface
export interface SimilaritySearchScope {
  userAssets?: boolean;
  publicBoards?: boolean;
  specificBoards?: string[];
  excludeAssets?: string[];
}

// Theme organization parameters interface
export interface ThemeParameters {
  minThemeSize?: number;
  maxThemes?: number;
  themeOverlap?: boolean;
  hierarchicalThemes?: boolean;
  confidenceThreshold?: number;
}