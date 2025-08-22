import { createTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Generate relevant tags for assets using AI-powered content analysis
 */
export const generateAssetTagsTool = createTool({
  id: 'generate-asset-tags',
  description: 'Automatically generate relevant, searchable tags for assets using computer vision, semantic analysis, and content understanding',
  inputSchema: z.object({
    assetIds: z.array(z.string()).min(1).max(50).describe('Array of asset IDs to generate tags for'),
    userId: z.string().describe('User ID requesting tag generation'),
    tagSources: z.object({
      visual: z.boolean().default(true).describe('Generate tags from visual content analysis'),
      metadata: z.boolean().default(true).describe('Generate tags from existing metadata'),
      content: z.boolean().default(false).describe('Generate tags from text content within assets (OCR/ASR)'),
      context: z.boolean().default(true).describe('Generate tags from contextual information (location, time, etc.)'),
      semantic: z.boolean().default(true).describe('Generate tags from semantic understanding of content'),
    }).default({}),
    tagTypes: z.object({
      descriptive: z.boolean().default(true).describe('Descriptive tags (colors, objects, scenes)'),
      emotional: z.boolean().default(true).describe('Emotional or mood-based tags'),
      stylistic: z.boolean().default(true).describe('Artistic style and technique tags'),
      technical: z.boolean().default(false).describe('Technical photography/media tags'),
      thematic: z.boolean().default(true).describe('High-level theme and concept tags'),
      categorical: z.boolean().default(true).describe('Category and classification tags'),
    }).default({}),
    preferences: z.object({
      maxTagsPerAsset: z.number().min(1).max(30).default(10).describe('Maximum tags to generate per asset'),
      minConfidence: z.number().min(0).max(1).default(0.6).describe('Minimum confidence threshold for tag inclusion'),
      languageStyle: z.enum(['casual', 'professional', 'artistic', 'technical']).default('casual').describe('Style of language for generated tags'),
      includeHierarchy: z.boolean().default(false).describe('Include hierarchical tags (broad to specific)'),
      excludeCommon: z.boolean().default(true).describe('Exclude overly common or generic tags'),
    }).default({}),
    existingTags: z.record(z.array(z.string())).optional().describe('Existing tags for each asset (assetId -> tags[])'),
    customVocabulary: z.array(z.string()).optional().describe('Custom vocabulary to prefer in tag generation'),
  }),
  outputSchema: z.object({
    tagResults: z.array(z.object({
      assetId: z.string(),
      generatedTags: z.array(z.object({
        tag: z.string(),
        confidence: z.number(),
        source: z.array(z.string()),
        category: z.string(),
        reasoning: z.string(),
        isNew: z.boolean(),
      })),
      existingTags: z.array(z.string()).optional(),
      tagSummary: z.object({
        totalGenerated: z.number(),
        newTags: z.number(),
        enhancedTags: z.number(),
        averageConfidence: z.number(),
        primaryCategories: z.array(z.string()),
      }),
      recommendations: z.array(z.object({
        type: z.string(),
        suggestion: z.string(),
        reason: z.string(),
      })),
    })),
    overallInsights: z.object({
      mostCommonTags: z.array(z.object({
        tag: z.string(),
        frequency: z.number(),
        category: z.string(),
      })),
      tagDistribution: z.object({
        descriptive: z.number(),
        emotional: z.number(),
        stylistic: z.number(),
        technical: z.number(),
        thematic: z.number(),
        categorical: z.number(),
      }),
      vocabularyAnalysis: z.object({
        uniqueTags: z.number(),
        averageTagsPerAsset: z.number(),
        tagConsistency: z.number(),
        languageQuality: z.number(),
      }),
      suggestions: z.array(z.object({
        type: z.string(),
        title: z.string(),
        description: z.string(),
        impact: z.string(),
      })),
    }),
    executionMetadata: z.object({
      processingTime: z.number(),
      modelsUsed: z.array(z.string()),
      assetsProcessed: z.number(),
      totalTagsGenerated: z.number(),
      batchProcessed: z.boolean(),
    }),
  }),
  execute: async ({ context }) => {
    const { 
      assetIds, 
      userId, 
      tagSources, 
      tagTypes, 
      preferences, 
      existingTags, 
      customVocabulary 
    } = context;
    try {
      const startTime = Date.now();
      
      // Mock tag generation - in production this would:
      // 1. Load asset data and analyze visual content with computer vision
      // 2. Extract metadata and contextual information
      // 3. Generate semantic embeddings and analyze content meaning
      // 4. Apply NLP for text content extraction (OCR/ASR)
      // 5. Generate tags based on configured sources and types
      // 6. Filter and rank tags by confidence and relevance

      const tagResults = assetIds.map((assetId, index) => {
        const mockTags = generateMockTags(assetId, index, tagTypes, preferences, customVocabulary);
        const existingAssetTags = existingTags?.[assetId] || [];
        
        // Determine which tags are new
        const enrichedTags = mockTags.map(tag => ({
          ...tag,
          isNew: !existingAssetTags.includes(tag.tag),
        }));

        const newTagsCount = enrichedTags.filter(t => t.isNew).length;
        const enhancedTagsCount = enrichedTags.length - newTagsCount;

        return {
          assetId,
          generatedTags: enrichedTags,
          existingTags: existingAssetTags.length > 0 ? existingAssetTags : undefined,
          tagSummary: {
            totalGenerated: enrichedTags.length,
            newTags: newTagsCount,
            enhancedTags: enhancedTagsCount,
            averageConfidence: enrichedTags.reduce((sum, tag) => sum + tag.confidence, 0) / enrichedTags.length,
            primaryCategories: Array.from(new Set(enrichedTags.map(tag => tag.category))),
          },
          recommendations: generateTagRecommendations(assetId, enrichedTags, index),
        };
      });

      // Calculate overall insights
      const allGeneratedTags = tagResults.flatMap(result => result.generatedTags);
      const tagFrequency = new Map<string, number>();
      const categoryDistribution: Record<string, number> = {
        descriptive: 0,
        emotional: 0,
        stylistic: 0,
        technical: 0,
        thematic: 0,
        categorical: 0,
      };

      allGeneratedTags.forEach(tag => {
        tagFrequency.set(tag.tag, (tagFrequency.get(tag.tag) || 0) + 1);
        categoryDistribution[tag.category] = (categoryDistribution[tag.category] || 0) + 1;
      });

      const mostCommonTags = Array.from(tagFrequency.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, frequency]) => {
          const tagObj = allGeneratedTags.find(t => t.tag === tag);
          return {
            tag,
            frequency,
            category: tagObj?.category || 'unknown',
          };
        });

      const overallInsights = {
        mostCommonTags,
        tagDistribution: categoryDistribution,
        vocabularyAnalysis: {
          uniqueTags: tagFrequency.size,
          averageTagsPerAsset: allGeneratedTags.length / assetIds.length,
          tagConsistency: calculateTagConsistency(tagResults),
          languageQuality: calculateLanguageQuality(allGeneratedTags),
        },
        suggestions: generateOverallSuggestions(tagResults, mostCommonTags),
      };

      const executionMetadata = {
        processingTime: Date.now() - startTime,
        modelsUsed: [
          ...(tagSources.visual ? ['vision-transformer', 'object-detection'] : []),
          ...(tagSources.semantic ? ['semantic-analyzer', 'concept-recognition'] : []),
          ...(tagSources.content ? ['ocr-engine', 'speech-to-text'] : []),
          'tag-ranker', 'confidence-scorer'
        ],
        assetsProcessed: assetIds.length,
        totalTagsGenerated: allGeneratedTags.length,
        batchProcessed: assetIds.length > 1,
      };

      return {
        tagResults,
        overallInsights,
        executionMetadata,
      };
    } catch (error) {
      throw new Error(`Failed to generate asset tags: ${error}`);
    }
  },
});

// Helper function to generate mock tags for an asset
function generateMockTags(
  assetId: string, 
  index: number, 
  tagTypes: any, 
  preferences: any, 
  customVocabulary?: string[]
) {
  const tagPools = {
    descriptive: ['urban', 'colorful', 'architectural', 'people', 'street', 'building', 'window', 'shadow', 'light'],
    emotional: ['inspiring', 'energetic', 'calm', 'dramatic', 'peaceful', 'vibrant', 'moody', 'uplifting'],
    stylistic: ['documentary', 'minimalist', 'contemporary', 'artistic', 'professional', 'candid', 'composed'],
    technical: ['high-resolution', 'sharp', 'well-exposed', 'natural-lighting', 'handheld', 'wide-angle'],
    thematic: ['city-life', 'urban-exploration', 'architecture', 'street-photography', 'lifestyle', 'culture'],
    categorical: ['photography', 'urban', 'architectural', 'lifestyle', 'documentary', 'street-art'],
  };

  const tags: Array<{
    tag: string;
    confidence: number;
    source: string[];
    category: string;
    reasoning: string;
    isNew: boolean;
  }> = [];

  // Generate tags for each enabled type
  Object.entries(tagTypes).forEach(([category, enabled]) => {
    if (enabled && tagPools[category as keyof typeof tagPools]) {
      const pool = tagPools[category as keyof typeof tagPools];
      const numTags = Math.min(Math.ceil(preferences.maxTagsPerAsset / Object.keys(tagTypes).length), 3);
      
      for (let i = 0; i < numTags; i++) {
        const tagIndex = (index + i) % pool.length;
        const tag = pool[tagIndex];
        const confidence = Math.random() * 0.3 + 0.7; // Random confidence between 0.7-1.0
        
        if (confidence >= preferences.minConfidence) {
          tags.push({
            tag,
            confidence,
            source: getSourcesToGenerateTag(category),
            category,
            reasoning: generateTagReasoning(tag, category),
            isNew: false, // Will be determined later
          });
        }
      }
    }
  });

  // Add custom vocabulary tags if provided
  if (customVocabulary && customVocabulary.length > 0) {
    const customTag = customVocabulary[index % customVocabulary.length];
    tags.push({
      tag: customTag,
      confidence: 0.85,
      source: ['custom-vocabulary'],
      category: 'custom',
      reasoning: 'Added from custom vocabulary preferences',
      isNew: false,
    });
  }

  // Sort by confidence and limit to max tags
  return tags
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, preferences.maxTagsPerAsset);
}

// Helper function to get sources that would generate a tag
function getSourcesToGenerateTag(category: string): string[] {
  const sourceMap: Record<string, string[]> = {
    descriptive: ['visual', 'metadata'],
    emotional: ['semantic', 'visual'],
    stylistic: ['visual', 'semantic'],
    technical: ['metadata', 'content'],
    thematic: ['semantic', 'context'],
    categorical: ['semantic', 'visual'],
  };
  
  return sourceMap[category] || ['visual'];
}

// Helper function to generate reasoning for a tag
function generateTagReasoning(tag: string, category: string): string {
  const reasoningTemplates: Record<string, string[]> = {
    descriptive: [
      `Visual analysis detected ${tag} elements in the image`,
      `Object recognition identified ${tag} features prominently`,
      `Color and composition analysis suggests ${tag} characteristics`,
    ],
    emotional: [
      `Visual mood analysis indicates ${tag} emotional qualities`,
      `Color palette and composition convey ${tag} feelings`,
      `Overall aesthetic creates ${tag} atmosphere`,
    ],
    stylistic: [
      `Photography style analysis identifies ${tag} techniques`,
      `Composition and framing suggest ${tag} approach`,
      `Visual characteristics align with ${tag} aesthetic`,
    ],
    thematic: [
      `Content analysis reveals ${tag} thematic elements`,
      `Semantic understanding identifies ${tag} conceptual focus`,
      `Context and subject matter suggest ${tag} themes`,
    ],
  };
  
  const templates = reasoningTemplates[category] || [`Generated based on ${category} analysis`];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Helper function to generate recommendations for an asset's tags
function generateTagRecommendations(assetId: string, tags: any[], index: number) {
  const recommendations = [
    {
      type: 'optimization',
      suggestion: 'Add location-specific tags for better discoverability',
      reason: 'Geographic tags improve search relevance for location-based queries',
    },
    {
      type: 'consistency',
      suggestion: 'Use consistent terminology across similar assets',
      reason: 'Standardized vocabulary improves collection organization',
    },
    {
      type: 'enhancement',
      suggestion: 'Consider adding more specific descriptive tags',
      reason: 'Detailed tags help users find exactly what they\'re looking for',
    },
  ];
  
  return recommendations.slice(0, 2); // Return subset for each asset
}

// Helper function to calculate tag consistency across assets
function calculateTagConsistency(tagResults: any[]): number {
  // Mock calculation - in reality this would analyze tag vocabulary consistency
  const allTags = tagResults.flatMap(result => result.generatedTags.map((t: any) => t.tag));
  const uniqueTags = new Set(allTags);
  
  // Higher ratio of reused tags indicates better consistency
  return Math.min(allTags.length / uniqueTags.size / 2, 1);
}

// Helper function to calculate language quality of generated tags
function calculateLanguageQuality(tags: any[]): number {
  // Mock calculation - in reality this would analyze tag quality, spelling, relevance
  const avgConfidence = tags.reduce((sum, tag) => sum + tag.confidence, 0) / tags.length;
  const hasVariedCategories = new Set(tags.map(tag => tag.category)).size > 3;
  
  return (avgConfidence + (hasVariedCategories ? 0.1 : 0));
}

// Helper function to generate overall suggestions for the tag generation process
function generateOverallSuggestions(tagResults: any[], mostCommonTags: any[]) {
  return [
    {
      type: 'vocabulary',
      title: 'Standardize Tag Vocabulary',
      description: 'Consider creating a custom vocabulary list to ensure consistent terminology across your collection',
      impact: 'Improved searchability and organization',
    },
    {
      type: 'automation',
      title: 'Enable Automatic Tagging',
      description: 'Set up automatic tag generation for new assets to maintain consistent metadata',
      impact: 'Reduced manual effort and consistent tagging',
    },
    {
      type: 'curation',
      title: 'Review and Refine Common Tags',
      description: `Your most common tags (${mostCommonTags.slice(0, 3).map(t => t.tag).join(', ')}) could be refined for better specificity`,
      impact: 'More precise asset discovery and categorization',
    },
  ];
}