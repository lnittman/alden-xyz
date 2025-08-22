# Squish AI Tools

This directory contains comprehensive AI-powered tools for the Squish platform, built using the Mastra framework. These tools provide intelligent assistance for board management, asset organization, and collaboration.

## Overview

The Squish AI tools are organized into three main categories:

1. **Board Management** - Tools for creating, analyzing, and organizing boards
2. **Asset Organization** - Tools for discovering, categorizing, and organizing assets
3. **Collaboration** - Tools for team collaboration, content sharing, and community building

## Tool Categories

### Board Management Tools

#### `searchBoardsTool`
- **ID**: `search-boards`
- **Purpose**: Search boards using semantic and keyword search capabilities
- **Features**:
  - Vector embedding-based semantic search
  - Keyword and metadata filtering
  - Advanced filters (visibility, dates, tags)
  - Hybrid search combining multiple methods
  - Relevance scoring and match explanations

#### `createBoardTool`
- **ID**: `create-board`
- **Purpose**: Create new boards with AI-powered assistance
- **Features**:
  - Intelligent theme detection and suggestion
  - Smart icon selection based on content
  - Automatic tag generation
  - Organization template recommendations
  - Theme variations and color palette suggestions

#### `analyzeBoardTool`
- **ID**: `analyze-board`
- **Purpose**: Comprehensive analysis of board content and performance
- **Features**:
  - Content distribution analysis
  - Visual theme identification
  - Organizational health scoring
  - Performance metrics and insights
  - Improvement recommendations

#### `suggestBoardOrganizationTool`
- **ID**: `suggest-board-organization`
- **Purpose**: Optimize board layout and organization
- **Features**:
  - Multiple organization strategies
  - Visual flow optimization
  - User experience improvement
  - Layout comparison and recommendations
  - Implementation guidance

### Asset Organization Tools

#### `searchAssetsTool`
- **ID**: `search-assets`
- **Purpose**: Multi-modal asset search with AI-powered understanding
- **Features**:
  - Semantic similarity search using vector embeddings
  - Computer vision-based visual search
  - Metadata and content analysis
  - Advanced filtering options
  - Hybrid ranking algorithms

#### `categorizeAssetsTool`
- **ID**: `categorize-assets`
- **Purpose**: Automatic asset categorization using AI
- **Features**:
  - Multiple categorization systems
  - Computer vision analysis
  - Content understanding and tagging
  - Confidence scoring
  - Batch processing capabilities

#### `findSimilarAssetsTool`
- **ID**: `find-similar-assets`
- **Purpose**: Find visually and semantically similar assets
- **Features**:
  - Multi-dimensional similarity matching
  - Visual feature comparison
  - Semantic understanding
  - Similarity clustering
  - Match explanation and reasoning

#### `generateAssetTagsTool`
- **ID**: `generate-asset-tags`
- **Purpose**: AI-powered tag generation for improved discoverability
- **Features**:
  - Multiple tag sources (visual, metadata, content)
  - Various tag types (descriptive, emotional, stylistic)
  - Custom vocabulary integration
  - Quality scoring and filtering
  - Batch tag generation

#### `organizeAssetsByThemeTool`
- **ID**: `organize-assets-by-theme`
- **Purpose**: Automatic thematic organization of asset collections
- **Features**:
  - AI-powered theme detection
  - Multiple organization methods
  - Hierarchical theme structures
  - Quality-based filtering
  - Collection suggestions

### Collaboration Tools

#### `suggestCollaboratorsTool`
- **ID**: `suggest-collaborators`
- **Purpose**: Find and recommend potential collaborators
- **Features**:
  - Expertise matching algorithms
  - Content-based compatibility analysis
  - Collaboration history evaluation
  - Multi-factor matching criteria
  - Communication preference matching

#### `generateBoardSummaryTool`
- **ID**: `generate-board-summary`
- **Purpose**: Generate comprehensive board summaries for sharing
- **Features**:
  - Multiple summary types and formats
  - Audience-specific customization
  - AI-powered content analysis
  - Collaboration insights
  - Multi-platform sharing optimization

#### `detectDuplicatesTool`
- **ID**: `detect-duplicates`
- **Purpose**: Find and manage duplicate content across boards
- **Features**:
  - Multiple detection methods
  - Visual similarity analysis
  - Metadata comparison
  - Automated cleanup suggestions
  - Quality-based conflict resolution

#### `mergeBoardsTool`
- **ID**: `merge-boards`
- **Purpose**: Intelligently merge multiple boards
- **Features**:
  - AI-powered organization strategies
  - Conflict resolution automation
  - Quality analysis and filtering
  - Theme-based organization
  - Comprehensive merge reporting

## Usage Examples

### Basic Tool Usage

```typescript
import { searchBoardsTool } from '@ai/mastra/tools/board';

// Search boards semantically
const searchResult = await searchBoardsTool.handler({
  query: 'urban photography collections',
  userId: 'user-123',
  searchType: 'semantic',
  limit: 10
});
```

### Advanced Asset Search

```typescript
import { searchAssetsTool } from '@ai/mastra/tools/asset';

// Multi-modal asset search with filters
const assets = await searchAssetsTool.handler({
  query: 'street photography with warm colors',
  userId: 'user-123',
  searchMethods: {
    semantic: true,
    visual: true,
    metadata: true
  },
  filters: {
    assetTypes: ['image'],
    visualAttributes: {
      brightness: 'medium',
      saturation: 'high'
    }
  }
});
```

### Collaboration Workflow

```typescript
import { 
  analyzeBoardTool,
  suggestCollaboratorsTool,
  generateBoardSummaryTool 
} from '@ai/mastra/tools';

// Analyze board and suggest collaborations
const analysis = await analyzeBoardTool.handler({
  boardId: 'board-123',
  userId: 'user-123',
  analysisDepth: 'comprehensive'
});

const collaborators = await suggestCollaboratorsTool.handler({
  boardId: 'board-123',
  userId: 'user-123',
  collaborationType: 'creative'
});

const summary = await generateBoardSummaryTool.handler({
  boardId: 'board-123',
  userId: 'user-123',
  summaryType: 'collaborative',
  audience: 'collaborator'
});
```

## Configuration

### Tool Registry

All tools are registered in the main index file and can be accessed via the `availableTools` registry:

```typescript
import { availableTools, toolCategories } from '@ai/mastra/tools';

// Access tool IDs
const searchBoardId = availableTools.searchBoards; // 'search-boards'

// Access tools by category
const boardTools = toolCategories.boardManagement;
const assetTools = toolCategories.assetOrganization;
const collabTools = toolCategories.collaboration;
```

### Integration with Agents

Tools can be integrated with Mastra agents:

```typescript
import { Agent } from '@mastra/core';
import { 
  searchBoardsTool, 
  searchAssetsTool, 
  suggestCollaboratorsTool 
} from '@ai/mastra/tools';

const squishAgent = new Agent({
  name: 'Squish Assistant',
  instructions: 'Help users manage their creative collections...',
  model: 'gpt-4',
  tools: [
    searchBoardsTool,
    searchAssetsTool,
    suggestCollaboratorsTool
  ]
});
```

## Development

### Adding New Tools

1. Create tool file in appropriate category directory
2. Follow the established patterns for input/output schemas
3. Implement comprehensive error handling
4. Add tool to category index file
5. Update main tools index
6. Add documentation

### Tool Structure

Each tool follows this structure:

```typescript
import { tool } from '@mastra/core/tool';
import { z } from 'zod';

export const myTool = tool({
  id: 'my-tool-id',
  description: 'Clear description of tool purpose and capabilities',
  inputSchema: z.object({
    // Define input parameters with descriptions
  }),
  outputSchema: z.object({
    // Define output structure with detailed schemas
  }),
  handler: async (input) => {
    try {
      // Implementation logic
      return result;
    } catch (error) {
      throw new Error(`Failed to execute tool: ${error}`);
    }
  },
});
```

### Best Practices

1. **Comprehensive Input Validation**: Use Zod schemas to validate all inputs
2. **Detailed Output Schemas**: Provide complete type definitions for outputs
3. **Error Handling**: Always wrap handler logic in try-catch blocks
4. **Documentation**: Include clear descriptions for all parameters
5. **Mock Data**: Provide realistic mock data for development and testing
6. **Performance**: Consider performance implications for large datasets
7. **Extensibility**: Design tools to be easily extended and modified

## Production Considerations

### Database Integration

In production, these tools would integrate with:

- PostgreSQL database via Drizzle ORM
- Vector embeddings stored in database
- File metadata and storage references
- User authentication and permissions

### AI Model Integration

Production implementation would include:

- Computer vision models for visual analysis
- Large language models for semantic understanding
- Vector embedding generation and similarity search
- Content analysis and natural language processing

### Performance Optimization

- Implement caching for frequently accessed data
- Use batch processing for large operations
- Optimize database queries with proper indexing
- Consider rate limiting for API endpoints

### Security and Privacy

- Implement proper user authorization
- Respect privacy settings for content analysis
- Secure handling of user data and metadata
- Audit logging for sensitive operations

## API Reference

For detailed API documentation including all input/output schemas, parameter descriptions, and usage examples, refer to the individual tool files in their respective directories:

- `./board/` - Board management tools
- `./asset/` - Asset organization tools  
- `./collaboration/` - Collaboration tools

Each tool file contains comprehensive JSDoc comments and TypeScript type definitions for full API documentation.