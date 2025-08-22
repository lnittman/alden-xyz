-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector columns to existing tables (if they don't exist)
DO $$ 
BEGIN
    -- Board table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Board' AND column_name = 'embedding') THEN
        ALTER TABLE "Board" ADD COLUMN embedding vector(1408);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Board' AND column_name = 'embedding_metadata') THEN
        ALTER TABLE "Board" ADD COLUMN embedding_metadata JSONB;
    END IF;
    
    -- Asset table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Asset' AND column_name = 'embedding') THEN
        ALTER TABLE "Asset" ADD COLUMN embedding vector(1408);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Asset' AND column_name = 'embedding_metadata') THEN
        ALTER TABLE "Asset" ADD COLUMN embedding_metadata JSONB;
    END IF;
    
    -- Search table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Search' AND column_name = 'embedding') THEN
        ALTER TABLE "Search" ADD COLUMN embedding vector(1408);
    END IF;
END $$;

-- Create indexes for vector similarity search (using ivfflat)
CREATE INDEX IF NOT EXISTS board_embedding_idx ON "Board" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
CREATE INDEX IF NOT EXISTS asset_embedding_idx ON "Asset" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS search_embedding_idx ON "Search" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 200);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS board_search_idx ON "Board" USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS asset_search_idx ON "Asset" USING gin(to_tsvector('english', name));