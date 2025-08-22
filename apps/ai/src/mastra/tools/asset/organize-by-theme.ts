import { createTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Organize assets by automatically detected themes using AI-powered content analysis
 */
export const organizeAssetsByThemeTool = createTool({
  id: 'organize-assets-by-theme',
  description: 'Automatically group assets into thematic collections using visual similarity, semantic analysis, and content understanding',
  inputSchema: z.object({
    assetIds: z.array(z.string()).min(2).max(200).describe('Array of asset IDs to organize thematically'),
    userId: z.string().describe('User ID requesting the organization'),
    organizationMethod: z.enum(['visual', 'semantic', 'hybrid', 'temporal', 'contextual']).default('hybrid').describe('Primary method for theme detection'),
    themeParameters: z.object({
      minThemeSize: z.number().min(2).max(20).default(3).describe('Minimum number of assets required to form a theme'),
      maxThemes: z.number().min(2).max(50).default(10).describe('Maximum number of themes to create'),
      themeOverlap: z.boolean().default(false).describe('Allow assets to belong to multiple themes'),
      hierarchicalThemes: z.boolean().default(false).describe('Create nested theme hierarchies'),
      confidenceThreshold: z.number().min(0).max(1).default(0.7).describe('Minimum confidence for theme assignment'),
    }).default({}),
    analysisFeatures: z.object({
      visualFeatures: z.boolean().default(true).describe('Use color, composition, and visual elements'),
      contentAnalysis: z.boolean().default(true).describe('Analyze semantic content and meaning'),
      metadataAnalysis: z.boolean().default(true).describe('Use existing metadata and tags'),
      temporalPatterns: z.boolean().default(false).describe('Consider creation time and temporal patterns'),
      geographicData: z.boolean().default(false).describe('Use location data if available'),
      styleAnalysis: z.boolean().default(true).describe('Analyze artistic and photographic style'),
    }).default({}),
    outputFormat: z.object({
      createCollections: z.boolean().default(false).describe('Create suggested board collections for themes'),
      generateTitles: z.boolean().default(true).describe('Generate descriptive titles for each theme'),
      includeAnalysis: z.boolean().default(true).describe('Include detailed analysis of each theme'),
      suggestTags: z.boolean().default(true).describe('Suggest tags for each thematic group'),
    }).default({}),
  }),
  outputSchema: z.object({
    themes: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      assetIds: z.array(z.string()),
      confidence: z.number(),
      characteristics: z.object({
        visualStyle: z.array(z.string()),
        colorPalette: z.array(z.string()),
        subjects: z.array(z.string()),
        mood: z.string(),
        photographyStyle: z.string().optional(),
        technicalAttributes: z.array(z.string()).optional(),
      }),
      suggestedTags: z.array(z.string()),
      representativeAsset: z.string().describe('Asset ID that best represents this theme'),
      subthemes: z.array(z.object({
        name: z.string(),
        assetIds: z.array(z.string()),
        distinctiveFeature: z.string(),
      })).optional(),
      relationships: z.array(z.object({
        relatedThemeId: z.string(),
        relationship: z.string(),
        strength: z.number(),
      })).optional(),
    })),
    unorganized: z.object({
      assetIds: z.array(z.string()),
      reasons: z.array(z.object({
        assetId: z.string(),
        reason: z.string(),
        suggestions: z.array(z.string()),
      })),
    }),
    organizationInsights: z.object({
      totalAssets: z.number(),
      organizedAssets: z.number(),
      organizationRate: z.number(),
      dominantThemes: z.array(z.string()),
      styleConsistency: z.number(),
      thematicDiversity: z.number(),
      recommendations: z.array(z.object({
        type: z.string(),
        title: z.string(),
        description: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
      })),
    }),
    collections: z.array(z.object({
      suggestedName: z.string(),
      description: z.string(),
      themeIds: z.array(z.string()),
      assetCount: z.number(),
      rationale: z.string(),
    })).optional(),
    executionMetadata: z.object({
      processingTime: z.number(),
      algorithmsUsed: z.array(z.string()),
      themeDetectionMethod: z.string(),
      clusteringAccuracy: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    const { 
      assetIds, 
      userId, 
      organizationMethod, 
      themeParameters, 
      analysisFeatures, 
      outputFormat 
    } = context;
    try {
      const startTime = Date.now();
      
      // Mock thematic organization - in production this would:
      // 1. Load all assets and extract features (visual, semantic, metadata)
      // 2. Generate embeddings for visual and semantic similarity
      // 3. Apply clustering algorithms to group similar assets
      // 4. Analyze clusters to identify themes and characteristics
      // 5. Generate titles, descriptions, and tags for each theme
      // 6. Suggest board organizations and collections

      const themes = generateMockThemes(assetIds, themeParameters, analysisFeatures);
      
      // Determine which assets couldn't be organized into themes
      const organizedAssetIds = new Set(themes.flatMap(theme => theme.assetIds));
      const unorganizedAssetIds = assetIds.filter(id => !organizedAssetIds.has(id));
      
      const unorganized = {
        assetIds: unorganizedAssetIds,
        reasons: unorganizedAssetIds.map(assetId => ({
          assetId,
          reason: 'Insufficient similarity to other assets to form a cohesive theme',
          suggestions: [
            'Consider manual categorization',
            'Add more descriptive metadata',
            'Include in a miscellaneous collection',
          ],
        })),
      };

      // Calculate organization insights
      const organizationInsights = {
        totalAssets: assetIds.length,
        organizedAssets: assetIds.length - unorganizedAssetIds.length,
        organizationRate: (assetIds.length - unorganizedAssetIds.length) / assetIds.length,
        dominantThemes: themes
          .sort((a, b) => b.assetIds.length - a.assetIds.length)
          .slice(0, 3)
          .map(theme => theme.title),
        styleConsistency: calculateStyleConsistency(themes),
        thematicDiversity: calculateThematicDiversity(themes),
        recommendations: generateOrganizationRecommendations(themes, unorganized),
      };

      // Generate collection suggestions if requested
      const collections = outputFormat.createCollections ? [
        {
          suggestedName: 'Urban Photography Collection',
          description: 'A curated selection of street and architectural photography',
          themeIds: themes.filter(t => 
            t.title.includes('Street') || t.title.includes('Architecture')
          ).map(t => t.id),
          assetCount: themes
            .filter(t => t.title.includes('Street') || t.title.includes('Architecture'))
            .reduce((sum, t) => sum + t.assetIds.length, 0),
          rationale: 'Strong thematic coherence in urban photography styles',
        },
        {
          suggestedName: 'Portrait & People',
          description: 'Human-focused photography and portraiture',
          themeIds: themes.filter(t => t.title.includes('Portrait')).map(t => t.id),
          assetCount: themes
            .filter(t => t.title.includes('Portrait'))
            .reduce((sum, t) => sum + t.assetIds.length, 0),
          rationale: 'Distinct portrait photography style with consistent approach',
        },
      ] : undefined;

      const executionMetadata = {
        processingTime: Date.now() - startTime,
        algorithmsUsed: [
          ...(analysisFeatures.visualFeatures ? ['visual-clustering', 'color-analysis'] : []),
          ...(analysisFeatures.contentAnalysis ? ['semantic-clustering', 'content-analysis'] : []),
          ...(analysisFeatures.styleAnalysis ? ['style-recognition', 'technique-analysis'] : []),
          'theme-detection', 'similarity-matching',
        ],
        themeDetectionMethod: organizationMethod,
        clusteringAccuracy: 0.87, // Mock accuracy score
      };

      return {
        themes,
        unorganized,
        organizationInsights,
        collections,
        executionMetadata,
      };
    } catch (error) {
      throw new Error(`Failed to organize assets by theme: ${error}`);
    }
  },
});

// Helper function to generate mock themes
function generateMockThemes(assetIds: string[], themeParams: any, features: any) {
  const themeTemplates = [
    {
      title: 'Urban Street Photography',
      description: 'Candid street scenes capturing city life and urban culture',
      colorPalette: ['#2C3E50', '#34495E', '#E67E22'],
      mood: 'documentary',
      subjects: ['people', 'streets', 'buildings', 'urban_life'],
      visualStyle: ['high_contrast', 'documentary', 'candid'],
      tags: ['street', 'urban', 'documentary', 'city', 'people'],
    },
    {
      title: 'Architectural Details',
      description: 'Close-up and detailed views of building elements and structures',
      colorPalette: ['#95A5A6', '#BDC3C7', '#ECF0F1'],
      mood: 'minimalist',
      subjects: ['architecture', 'buildings', 'details', 'structures'],
      visualStyle: ['geometric', 'minimalist', 'structured'],
      tags: ['architecture', 'building', 'detail', 'geometric', 'structure'],
    },
    {
      title: 'Natural Landscapes',
      description: 'Scenic outdoor environments and natural beauty',
      colorPalette: ['#27AE60', '#2ECC71', '#3498DB'],
      mood: 'peaceful',
      subjects: ['nature', 'landscapes', 'outdoors', 'scenery'],
      visualStyle: ['wide_angle', 'natural', 'scenic'],
      tags: ['nature', 'landscape', 'outdoor', 'scenic', 'natural'],
    },
    {
      title: 'Portrait Photography',
      description: 'Human subjects with focus on expression and character',
      colorPalette: ['#E74C3C', '#C0392B', '#F39C12'],
      mood: 'intimate',
      subjects: ['people', 'faces', 'portraits', 'expressions'],
      visualStyle: ['shallow_depth', 'portrait', 'personal'],
      tags: ['portrait', 'person', 'face', 'expression', 'human'],
    },
    {
      title: 'Abstract Compositions',
      description: 'Creative and artistic interpretations with abstract elements',
      colorPalette: ['#9B59B6', '#8E44AD', '#E91E63'],
      mood: 'artistic',
      subjects: ['abstract', 'artistic', 'creative', 'experimental'],
      visualStyle: ['abstract', 'artistic', 'experimental'],
      tags: ['abstract', 'artistic', 'creative', 'experimental', 'composition'],
    },
  ];

  const themes = [];
  const usedAssets = new Set<string>();
  
  // Distribute assets across themes
  let currentThemeIndex = 0;
  const assetsPerTheme = Math.max(
    themeParams.minThemeSize, 
    Math.floor(assetIds.length / Math.min(themeParams.maxThemes, themeTemplates.length))
  );

  for (let i = 0; i < Math.min(themeParams.maxThemes, themeTemplates.length); i++) {
    const template = themeTemplates[i];
    const themeAssets = [];
    
    // Assign assets to this theme
    for (let j = 0; j < assetsPerTheme && usedAssets.size < assetIds.length; j++) {
      let assetIndex = (currentThemeIndex * assetsPerTheme + j) % assetIds.length;
      let attempts = 0;
      
      // Find an unused asset (unless overlap is allowed)
      while (usedAssets.has(assetIds[assetIndex]) && !themeParams.themeOverlap && attempts < assetIds.length) {
        assetIndex = (assetIndex + 1) % assetIds.length;
        attempts++;
      }
      
      if (attempts < assetIds.length) {
        themeAssets.push(assetIds[assetIndex]);
        if (!themeParams.themeOverlap) {
          usedAssets.add(assetIds[assetIndex]);
        }
      }
    }

    if (themeAssets.length >= themeParams.minThemeSize) {
      const theme = {
        id: `theme-${i + 1}`,
        title: template.title,
        description: template.description,
        assetIds: themeAssets,
        confidence: Math.random() * 0.2 + 0.8, // Random confidence between 0.8-1.0
        characteristics: {
          visualStyle: template.visualStyle,
          colorPalette: template.colorPalette,
          subjects: template.subjects,
          mood: template.mood,
          photographyStyle: features.styleAnalysis ? getPhotographyStyle(template.mood) : undefined,
          technicalAttributes: features.styleAnalysis ? getTechnicalAttributes(template.visualStyle) : undefined,
        },
        suggestedTags: template.tags,
        representativeAsset: themeAssets[0], // First asset as representative
        subthemes: themeParams.hierarchicalThemes ? generateSubthemes(themeAssets, template) : undefined,
        relationships: generateThemeRelationships(i, themes.length),
      };
      
      themes.push(theme);
      currentThemeIndex++;
    }
  }

  return themes;
}

// Helper function to get photography style based on mood
function getPhotographyStyle(mood: string): string {
  const styleMap: Record<string, string> = {
    documentary: 'Documentary Photography',
    minimalist: 'Minimalist Photography',
    peaceful: 'Landscape Photography',
    intimate: 'Portrait Photography',
    artistic: 'Fine Art Photography',
  };
  
  return styleMap[mood] || 'Contemporary Photography';
}

// Helper function to get technical attributes
function getTechnicalAttributes(visualStyles: string[]): string[] {
  const attributeMap: Record<string, string[]> = {
    high_contrast: ['high_contrast', 'dramatic_lighting'],
    documentary: ['natural_lighting', 'fast_shutter'],
    candid: ['available_light', 'handheld'],
    geometric: ['sharp_focus', 'wide_angle'],
    minimalist: ['clean_composition', 'negative_space'],
    structured: ['tripod_stable', 'precise_framing'],
  };
  
  const attributes = new Set<string>();
  visualStyles.forEach(style => {
    (attributeMap[style] || []).forEach(attr => attributes.add(attr));
  });
  
  return Array.from(attributes);
}

// Helper function to generate subthemes
function generateSubthemes(assetIds: string[], template: any) {
  if (assetIds.length < 6) return undefined;
  
  const midpoint = Math.floor(assetIds.length / 2);
  return [
    {
      name: `${template.title} - Style A`,
      assetIds: assetIds.slice(0, midpoint),
      distinctiveFeature: 'Color-focused composition',
    },
    {
      name: `${template.title} - Style B`,
      assetIds: assetIds.slice(midpoint),
      distinctiveFeature: 'Light and shadow emphasis',
    },
  ];
}

// Helper function to generate theme relationships
function generateThemeRelationships(currentIndex: number, totalThemes: number) {
  if (totalThemes < 2) return undefined;
  
  const relationships = [];
  
  // Create relationship with previous theme if exists
  if (currentIndex > 0) {
    relationships.push({
      relatedThemeId: `theme-${currentIndex}`,
      relationship: 'complementary_style',
      strength: Math.random() * 0.4 + 0.4, // 0.4-0.8
    });
  }
  
  return relationships.length > 0 ? relationships : undefined;
}

// Helper function to calculate style consistency across themes
function calculateStyleConsistency(themes: any[]): number {
  // Mock calculation - in reality this would analyze visual consistency
  const totalAssets = themes.reduce((sum, theme) => sum + theme.assetIds.length, 0);
  const avgConfidence = themes.reduce((sum, theme) => sum + theme.confidence, 0) / themes.length;
  
  return Math.min(avgConfidence + (themes.length > 2 ? 0.1 : 0), 1);
}

// Helper function to calculate thematic diversity
function calculateThematicDiversity(themes: any[]): number {
  // Mock calculation - more themes with varied subjects = higher diversity
  const uniqueSubjects = new Set();
  themes.forEach(theme => {
    theme.characteristics.subjects.forEach((subject: string) => uniqueSubjects.add(subject));
  });
  
  return Math.min(uniqueSubjects.size / 10, 1); // Normalize to 0-1
}

// Helper function to generate organization recommendations
function generateOrganizationRecommendations(themes: any[], unorganized: any) {
  const recommendations = [];
  
  if (unorganized.assetIds.length > 0) {
    recommendations.push({
      type: 'completion',
      title: 'Organize Remaining Assets',
      description: `${unorganized.assetIds.length} assets couldn't be automatically organized. Consider manual review.`,
      priority: 'medium' as const,
    });
  }
  
  if (themes.length > 8) {
    recommendations.push({
      type: 'consolidation',
      title: 'Consider Theme Consolidation',
      description: 'You have many small themes. Consider merging similar ones for better organization.',
      priority: 'low' as const,
    });
  }
  
  const largeThemes = themes.filter(theme => theme.assetIds.length > 10);
  if (largeThemes.length > 0) {
    recommendations.push({
      type: 'subdivision',
      title: 'Consider Subdividing Large Themes',
      description: `Themes like "${largeThemes[0].title}" could be split into more specific subcategories.`,
      priority: 'medium' as const,
    });
  }
  
  return recommendations;
}