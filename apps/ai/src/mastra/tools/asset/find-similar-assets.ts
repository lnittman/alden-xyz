import { createTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Find visually and semantically similar assets using AI-powered similarity matching
 */
export const findSimilarAssetsTool = createTool({
  id: 'find-similar-assets',
  description: 'Find assets similar to a given asset using visual features, semantic meaning, metadata, and content analysis',
  inputSchema: z.object({
    sourceAssetId: z.string().describe('ID of the asset to find similar items for'),
    userId: z.string().describe('User ID requesting the similarity search'),
    similarityTypes: z.object({
      visual: z.boolean().default(true).describe('Match visual features like colors, composition, style'),
      semantic: z.boolean().default(true).describe('Match semantic meaning and conceptual similarity'),
      contextual: z.boolean().default(false).describe('Match contextual information like location, time, event'),
      stylistic: z.boolean().default(true).describe('Match artistic/photographic style and techniques'),
      technical: z.boolean().default(false).describe('Match technical attributes like camera settings, quality'),
    }).default({}),
    searchScope: z.object({
      userAssets: z.boolean().default(true).describe('Search within user\'s own assets'),
      publicBoards: z.boolean().default(false).describe('Search public boards'),
      specificBoards: z.array(z.string()).optional().describe('Search within specific board IDs'),
      excludeAssets: z.array(z.string()).default([]).describe('Asset IDs to exclude from results'),
    }).default({}),
    filters: z.object({
      assetTypes: z.array(z.enum(['image', 'video', 'audio', 'document', 'gif'])).optional(),
      minSimilarity: z.number().min(0).max(1).default(0.7).describe('Minimum similarity threshold'),
      maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of similar assets to return'),
      includeVariations: z.boolean().default(false).describe('Include different crops/edits of the same asset'),
      recencyBias: z.number().min(0).max(1).default(0.1).describe('Boost score for more recent assets'),
    }).default({}),
    analysisDepth: z.enum(['fast', 'detailed', 'comprehensive']).default('detailed').describe('Depth of similarity analysis'),
    groupResults: z.boolean().default(false).describe('Group results by similarity clusters'),
  }),
  outputSchema: z.object({
    sourceAsset: z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      url: z.string(),
      analysisFeatures: z.object({
        dominantColors: z.array(z.string()),
        composition: z.string(),
        style: z.array(z.string()),
        semanticTags: z.array(z.string()),
        technicalAttributes: z.record(z.unknown()).optional(),
      }),
    }),
    similarAssets: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      url: z.string(),
      thumbnailUrl: z.string().optional(),
      overallSimilarity: z.number(),
      similarityScores: z.object({
        visual: z.number().optional(),
        semantic: z.number().optional(),
        contextual: z.number().optional(),
        stylistic: z.number().optional(),
        technical: z.number().optional(),
      }),
      matchReasons: z.array(z.object({
        type: z.string(),
        description: z.string(),
        confidence: z.number(),
      })),
      sharedFeatures: z.array(z.string()),
      differences: z.array(z.string()).optional(),
      boardContext: z.array(z.object({
        boardId: z.string(),
        boardName: z.string(),
      })).optional(),
      createdAt: z.string(),
    })),
    clusters: z.array(z.object({
      id: z.string(),
      theme: z.string(),
      description: z.string(),
      assetIds: z.array(z.string()),
      averageSimilarity: z.number(),
      keyFeatures: z.array(z.string()),
    })).optional(),
    insights: z.object({
      primarySimilarityFactors: z.array(z.string()),
      patternAnalysis: z.array(z.string()),
      recommendations: z.array(z.object({
        type: z.string(),
        title: z.string(),
        description: z.string(),
      })),
    }),
    searchMetadata: z.object({
      totalCandidates: z.number(),
      filteredResults: z.number(),
      processingTime: z.number(),
      algorithmsUsed: z.array(z.string()),
      searchScope: z.object({
        assetsSearched: z.number(),
        boardsSearched: z.number(),
      }),
    }),
  }),
  execute: async ({ context }) => {
    const { 
      sourceAssetId, 
      userId, 
      similarityTypes, 
      searchScope, 
      filters, 
      analysisDepth, 
      groupResults 
    } = context;
    try {
      const startTime = Date.now();
      
      // Mock source asset analysis - in production this would:
      // 1. Load source asset and extract features
      // 2. Generate visual embeddings using computer vision models
      // 3. Create semantic embeddings from metadata and context
      // 4. Search for similar assets using vector similarity
      // 5. Rank results by combined similarity scores

      const sourceAsset = {
        id: sourceAssetId,
        name: 'Urban Street Scene.jpg',
        type: 'image',
        url: 'https://example.com/assets/urban-street-scene.jpg',
        analysisFeatures: {
          dominantColors: ['#2C3E50', '#34495E', '#E67E22', '#F39C12'],
          composition: 'rule_of_thirds',
          style: ['street_photography', 'documentary', 'urban'],
          semanticTags: ['city', 'street', 'people', 'architecture', 'urban_life'],
          technicalAttributes: analysisDepth !== 'fast' ? {
            exposure: 'well_exposed',
            contrast: 'high',
            saturation: 'moderate',
            sharpness: 'high',
            colorGrading: 'warm_tones',
          } : undefined,
        },
      };

      // Generate mock similar assets
      const similarAssets = generateSimilarAssets(sourceAsset, filters.maxResults, similarityTypes);

      // Create similarity clusters if requested
      const clusters = groupResults ? [
        {
          id: 'cluster-1',
          theme: 'Urban Street Photography',
          description: 'Street-level photography with architectural elements and human activity',
          assetIds: similarAssets.slice(0, 4).map(a => a.id),
          averageSimilarity: 0.87,
          keyFeatures: ['street_level_perspective', 'urban_architecture', 'documentary_style'],
        },
        {
          id: 'cluster-2',
          theme: 'Warm-Toned Cityscapes',
          description: 'Urban scenes with warm color grading and golden hour lighting',
          assetIds: similarAssets.slice(4, 7).map(a => a.id),
          averageSimilarity: 0.82,
          keyFeatures: ['warm_color_palette', 'golden_lighting', 'urban_environment'],
        },
      ] : undefined;

      // Generate insights based on similarity analysis
      const insights = {
        primarySimilarityFactors: [
          'Visual composition and perspective',
          'Color palette and lighting',
          'Urban photography style',
          'Documentary approach to street scenes',
        ],
        patternAnalysis: [
          '73% of similar assets share warm color grading',
          'Street-level perspective is the strongest visual similarity factor',
          'Urban architecture elements appear in 89% of matches',
          'Documentary photography style dominates similar content',
        ],
        recommendations: [
          {
            type: 'collection_expansion',
            title: 'Expand Urban Photography Collection',
            description: 'Create a dedicated board for street photography with similar aesthetic',
          },
          {
            type: 'style_development',
            title: 'Develop Signature Style',
            description: 'Your urban photography shows consistent warm tones and composition - consider making this your signature style',
          },
          {
            type: 'content_discovery',
            title: 'Explore Related Themes',
            description: 'Consider adding architectural details and urban portraits to complement your street scenes',
          },
        ],
      };

      const searchMetadata = {
        totalCandidates: 2847,
        filteredResults: similarAssets.length,
        processingTime: Date.now() - startTime,
        algorithmsUsed: [
          ...(similarityTypes.visual ? ['visual_feature_matching', 'color_histogram_comparison'] : []),
          ...(similarityTypes.semantic ? ['semantic_embedding_similarity'] : []),
          ...(similarityTypes.stylistic ? ['style_transfer_analysis'] : []),
          ...(similarityTypes.contextual ? ['metadata_correlation'] : []),
        ],
        searchScope: {
          assetsSearched: searchScope.userAssets ? 1247 : 0 + (searchScope.publicBoards ? 1600 : 0),
          boardsSearched: searchScope.specificBoards?.length || (searchScope.userAssets ? 23 : 0),
        },
      };

      return {
        sourceAsset,
        similarAssets,
        clusters,
        insights,
        searchMetadata,
      };
    } catch (error) {
      throw new Error(`Failed to find similar assets: ${error}`);
    }
  },
});

// Helper function to generate mock similar assets
function generateSimilarAssets(sourceAsset: any, maxResults: number, similarityTypes: any) {
  const mockSimilarAssets = [
    {
      id: 'asset-sim-1',
      name: 'City Corner at Sunset.jpg',
      type: 'image',
      url: 'https://example.com/assets/city-corner-sunset.jpg',
      thumbnailUrl: 'https://example.com/thumbs/city-corner-sunset.jpg',
      overallSimilarity: 0.94,
      similarityScores: {
        visual: similarityTypes.visual ? 0.91 : undefined,
        semantic: similarityTypes.semantic ? 0.89 : undefined,
        stylistic: similarityTypes.stylistic ? 0.95 : undefined,
        contextual: similarityTypes.contextual ? 0.87 : undefined,
      },
      matchReasons: [
        {
          type: 'visual',
          description: 'Similar warm color palette and urban composition',
          confidence: 0.91,
        },
        {
          type: 'stylistic',
          description: 'Matching documentary street photography style',
          confidence: 0.95,
        },
        {
          type: 'semantic',
          description: 'Urban environment with architectural elements',
          confidence: 0.89,
        },
      ],
      sharedFeatures: ['warm_tones', 'urban_architecture', 'street_level', 'documentary_style'],
      differences: ['different_time_of_day', 'more_pedestrian_activity'],
      boardContext: [
        { boardId: 'board-1', boardName: 'Urban Photography Collection' },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'asset-sim-2',
      name: 'Downtown Architecture Detail.jpg',
      type: 'image',
      url: 'https://example.com/assets/downtown-architecture.jpg',
      thumbnailUrl: 'https://example.com/thumbs/downtown-architecture.jpg',
      overallSimilarity: 0.88,
      similarityScores: {
        visual: similarityTypes.visual ? 0.85 : undefined,
        semantic: similarityTypes.semantic ? 0.92 : undefined,
        stylistic: similarityTypes.stylistic ? 0.86 : undefined,
      },
      matchReasons: [
        {
          type: 'semantic',
          description: 'Strong thematic match in urban architecture focus',
          confidence: 0.92,
        },
        {
          type: 'visual',
          description: 'Similar geometric patterns and urban textures',
          confidence: 0.85,
        },
      ],
      sharedFeatures: ['architectural_focus', 'urban_setting', 'geometric_composition'],
      differences: ['closer_framing', 'different_architectural_style'],
      boardContext: [
        { boardId: 'board-3', boardName: 'Architecture & Design' },
      ],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'asset-sim-3',
      name: 'Street Life Documentary.jpg',
      type: 'image',
      url: 'https://example.com/assets/street-life-doc.jpg',
      thumbnailUrl: 'https://example.com/thumbs/street-life-doc.jpg',
      overallSimilarity: 0.85,
      similarityScores: {
        visual: similarityTypes.visual ? 0.82 : undefined,
        semantic: similarityTypes.semantic ? 0.91 : undefined,
        stylistic: similarityTypes.stylistic ? 0.88 : undefined,
      },
      matchReasons: [
        {
          type: 'stylistic',
          description: 'Similar documentary photography approach',
          confidence: 0.88,
        },
        {
          type: 'semantic',
          description: 'Captures urban life and street activity',
          confidence: 0.91,
        },
      ],
      sharedFeatures: ['documentary_style', 'street_photography', 'urban_life', 'candid_moments'],
      differences: ['more_people_focused', 'different_lighting_conditions'],
      boardContext: [
        { boardId: 'board-2', boardName: 'Street Photography' },
      ],
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  // Filter and limit results
  return mockSimilarAssets
    .filter(asset => asset.overallSimilarity >= 0.7) // Apply minimum similarity filter
    .slice(0, maxResults);
}