import { createTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Automatically categorize assets using AI-powered content analysis
 */
export const categorizeAssetsTool = createTool({
  id: 'categorize-assets',
  description: 'Analyze and automatically categorize assets using computer vision, content analysis, and machine learning',
  inputSchema: z.object({
    assetIds: z.array(z.string()).min(1).max(100).describe('Array of asset IDs to categorize'),
    userId: z.string().describe('User ID requesting the categorization'),
    categorySystem: z.enum(['smart', 'thematic', 'technical', 'custom']).default('smart').describe('Categorization approach to use'),
    customCategories: z.array(z.object({
      name: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
      visualFeatures: z.array(z.string()).optional(),
    })).optional().describe('Custom category definitions for custom system'),
    analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed').describe('Depth of analysis to perform'),
    confidence: z.object({
      minimum: z.number().min(0).max(1).default(0.6).describe('Minimum confidence threshold for categorization'),
      requireManualReview: z.number().min(0).max(1).default(0.8).describe('Confidence threshold requiring manual review'),
    }).default({}),
    options: z.object({
      allowMultipleCategories: z.boolean().default(true).describe('Allow assets to belong to multiple categories'),
      generateSubcategories: z.boolean().default(false).describe('Create hierarchical subcategories'),
      updateExistingTags: z.boolean().default(true).describe('Update asset tags based on categorization'),
      createNewBoards: z.boolean().default(false).describe('Suggest creating new boards for discovered categories'),
    }).default({}),
  }),
  outputSchema: z.object({
    categorization: z.array(z.object({
      assetId: z.string(),
      categories: z.array(z.object({
        name: z.string(),
        confidence: z.number(),
        subcategory: z.string().optional(),
        reasoning: z.string(),
        suggestedTags: z.array(z.string()),
        visualFeatures: z.array(z.string()).optional(),
        metadata: z.record(z.unknown()).optional(),
      })),
      overallConfidence: z.number(),
      requiresReview: z.boolean(),
      analysisDetails: z.object({
        contentType: z.string(),
        visualComplexity: z.number(),
        technicalQuality: z.number(),
        uniquenessScore: z.number(),
      }).optional(),
    })),
    categoryStats: z.object({
      totalAssets: z.number(),
      categorized: z.number(),
      requireReview: z.number(),
      averageConfidence: z.number(),
      categoriesFound: z.array(z.object({
        name: z.string(),
        count: z.number(),
        averageConfidence: z.number(),
        description: z.string(),
      })),
    }),
    suggestions: z.object({
      newCategories: z.array(z.object({
        name: z.string(),
        description: z.string(),
        assetCount: z.number(),
        confidence: z.number(),
      })),
      boardCreation: z.array(z.object({
        suggestedName: z.string(),
        description: z.string(),
        assetIds: z.array(z.string()),
        reasoning: z.string(),
      })).optional(),
      tagOptimization: z.array(z.object({
        currentTag: z.string(),
        suggestedTag: z.string(),
        affectedAssets: z.number(),
        reason: z.string(),
      })),
    }),
    executionMetadata: z.object({
      processingTime: z.number(),
      modelsUsed: z.array(z.string()),
      analysisDepth: z.string(),
      batchProcessed: z.boolean(),
    }),
  }),
  execute: async ({ context }) => {
    const { assetIds, userId, categorySystem, customCategories, analysisDepth, confidence, options } = context;
    try {
      const startTime = Date.now();
      
      // Mock categorization results - in production this would:
      // 1. Load assets and their metadata
      // 2. Run computer vision analysis for visual features
      // 3. Analyze content with AI models
      // 4. Apply categorization rules based on system type
      // 5. Return categorized results with confidence scores

      const categorization = assetIds.map((assetId, index) => {
        // Simulate different asset types and categories
        const mockCategories = generateMockCategories(categorySystem, index);
        
        return {
          assetId,
          categories: mockCategories,
          overallConfidence: Math.max(...mockCategories.map(c => c.confidence)),
          requiresReview: mockCategories.some(c => c.confidence < confidence.requireManualReview),
          analysisDetails: analysisDepth !== 'basic' ? {
            contentType: ['photography', 'digital_art', 'document', 'video'][index % 4],
            visualComplexity: Math.random() * 0.5 + 0.5,
            technicalQuality: Math.random() * 0.3 + 0.7,
            uniquenessScore: Math.random() * 0.4 + 0.6,
          } : undefined,
        };
      });

      // Calculate category statistics
      const allCategories = categorization.flatMap(item => item.categories);
      const categoryMap = new Map<string, { count: number; confidences: number[] }>();
      
      allCategories.forEach(cat => {
        const existing = categoryMap.get(cat.name) || { count: 0, confidences: [] };
        existing.count++;
        existing.confidences.push(cat.confidence);
        categoryMap.set(cat.name, existing);
      });

      const categoriesFound = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        averageConfidence: data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length,
        description: getCategoryDescription(name),
      }));

      const categoryStats = {
        totalAssets: assetIds.length,
        categorized: categorization.filter(item => item.categories.length > 0).length,
        requireReview: categorization.filter(item => item.requiresReview).length,
        averageConfidence: allCategories.length > 0 
          ? allCategories.reduce((sum, cat) => sum + cat.confidence, 0) / allCategories.length 
          : 0,
        categoriesFound,
      };

      // Generate suggestions based on categorization results
      const suggestions = {
        newCategories: [
          {
            name: 'Architectural Details',
            description: 'Close-up shots of building elements and structural features',
            assetCount: 3,
            confidence: 0.84,
          },
          {
            name: 'Urban Landscapes',
            description: 'Wide shots of city environments and skylines',
            assetCount: 5,
            confidence: 0.91,
          },
        ],
        boardCreation: options.createNewBoards ? [
          {
            suggestedName: 'Street Photography Collection',
            description: 'Curated collection of urban street photography',
            assetIds: assetIds.slice(0, 3),
            reasoning: 'High concentration of street photography content with similar aesthetic',
          },
        ] : undefined,
        tagOptimization: [
          {
            currentTag: 'photo',
            suggestedTag: 'photography',
            affectedAssets: 8,
            reason: 'More specific and searchable tag',
          },
          {
            currentTag: 'city',
            suggestedTag: 'urban',
            affectedAssets: 12,
            reason: 'Better aligns with photography terminology',
          },
        ],
      };

      const executionMetadata = {
        processingTime: Date.now() - startTime,
        modelsUsed: ['vision-transformer', 'content-classifier', 'semantic-analyzer'],
        analysisDepth,
        batchProcessed: assetIds.length > 1,
      };

      return {
        categorization,
        categoryStats,
        suggestions,
        executionMetadata,
      };
    } catch (error) {
      throw new Error(`Failed to categorize assets: ${error}`);
    }
  },
});

// Helper function to generate mock categories based on system type
function generateMockCategories(system: string, index: number) {
  const baseSystems = {
    smart: [
      ['Street Photography', 'Documentary photography capturing urban life and culture'],
      ['Architecture', 'Structural and design elements of buildings and spaces'],
      ['Portrait', 'Human subjects and character studies'],
      ['Landscape', 'Natural and urban environmental scenes'],
    ],
    thematic: [
      ['Urban Life', 'City environments and metropolitan themes'],
      ['Cultural Expression', 'Art, music, and cultural activities'],
      ['Natural World', 'Nature, wildlife, and outdoor environments'],
      ['Human Connection', 'Relationships and social interactions'],
    ],
    technical: [
      ['High Resolution', 'Images with high pixel density and detail'],
      ['Professional Quality', 'Well-composed and technically excellent shots'],
      ['Mobile Photography', 'Photos taken with mobile devices'],
      ['Post-Processed', 'Images with significant digital editing'],
    ],
  };

  const categories = baseSystems[system as keyof typeof baseSystems] || baseSystems.smart;
  const selectedCategory = categories[index % categories.length];
  
  const confidence = Math.random() * 0.3 + 0.7; // Random confidence between 0.7-1.0
  
  return [
    {
      name: selectedCategory[0],
      confidence,
      reasoning: selectedCategory[1],
      suggestedTags: generateTagsForCategory(selectedCategory[0]),
      visualFeatures: generateVisualFeatures(selectedCategory[0]),
    },
  ];
}

// Helper function to get category description
function getCategoryDescription(categoryName: string): string {
  const descriptions: Record<string, string> = {
    'Street Photography': 'Documentary-style photography capturing candid moments in urban environments',
    'Architecture': 'Photography focusing on building design, structural elements, and spatial composition',
    'Portrait': 'Images featuring human subjects with emphasis on expression and character',
    'Landscape': 'Wide-angle photography of natural or urban environments and scenic vistas',
    'Urban Life': 'Scenes depicting city culture, metropolitan activities, and urban lifestyle',
    'Cultural Expression': 'Documentation of artistic, musical, and cultural activities and expressions',
    'Natural World': 'Photography of nature, wildlife, outdoor environments, and natural phenomena',
    'Human Connection': 'Images capturing relationships, interactions, and social dynamics between people',
  };
  
  return descriptions[categoryName] || 'Automatically categorized content based on AI analysis';
}

// Helper function to generate relevant tags for a category
function generateTagsForCategory(categoryName: string): string[] {
  const tagMap: Record<string, string[]> = {
    'Street Photography': ['street', 'urban', 'candid', 'documentary', 'city'],
    'Architecture': ['building', 'design', 'structure', 'geometric', 'architectural'],
    'Portrait': ['person', 'face', 'expression', 'character', 'human'],
    'Landscape': ['scenery', 'vista', 'horizon', 'natural', 'environmental'],
    'Urban Life': ['metropolitan', 'lifestyle', 'culture', 'community', 'social'],
    'Cultural Expression': ['art', 'creative', 'cultural', 'performance', 'artistic'],
    'Natural World': ['nature', 'outdoor', 'wildlife', 'natural', 'environmental'],
    'Human Connection': ['relationship', 'interaction', 'social', 'community', 'togetherness'],
  };
  
  return tagMap[categoryName] || ['general', 'uncategorized'];
}

// Helper function to generate visual features
function generateVisualFeatures(categoryName: string): string[] {
  const featureMap: Record<string, string[]> = {
    'Street Photography': ['high_contrast', 'documentary_style', 'urban_textures'],
    'Architecture': ['geometric_patterns', 'structural_lines', 'perspective_depth'],
    'Portrait': ['human_features', 'facial_composition', 'shallow_depth'],
    'Landscape': ['wide_composition', 'natural_lighting', 'horizon_lines'],
    'Urban Life': ['crowd_scenes', 'city_activity', 'environmental_context'],
    'Cultural Expression': ['artistic_elements', 'creative_composition', 'expressive_content'],
    'Natural World': ['organic_shapes', 'natural_textures', 'environmental_lighting'],
    'Human Connection': ['multiple_subjects', 'interaction_dynamics', 'emotional_content'],
  };
  
  return featureMap[categoryName] || ['general_composition'];
}