# Storage Package Migration to Convex

## 🎯 Decision: REMOVE @repo/storage

The **@repo/storage** package is **NOT NEEDED** with Convex. Convex has comprehensive built-in file storage that replaces all functionality.

## Current Storage Package Features vs Convex

### @repo/storage Features
- ✅ Multiple providers (S3, R2, GCS, Vercel Blob)
- ✅ Upload/download files
- ✅ Generate URLs
- ✅ File metadata
- ✅ Presigned URLs
- ✅ Progress tracking

### Convex Storage Features
- ✅ Built-in file storage (no external providers needed)
- ✅ Upload/download files
- ✅ Generate URLs
- ✅ File metadata
- ✅ Temporary upload URLs
- ✅ Real-time updates
- ✅ Integrated with database
- ✅ Automatic CDN delivery
- ✅ No configuration needed

## Migration Examples

### 1. File Upload

#### OLD: Using @repo/storage
```typescript
import { storage } from '@repo/storage';

// Complex multi-provider setup
const file = await storage.upload(blob, {
  provider: 'r2', // or 's3', 'gcs'
  bucket: 'my-bucket',
  path: 'uploads/',
});
const url = storage.getUrl(file.key);
```

#### NEW: Using Convex
```typescript
// In a Convex mutation
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// In your React component
const generateUploadUrl = useMutation(api.files.generateUploadUrl);
const uploadUrl = await generateUploadUrl();

// Upload the file
const response = await fetch(uploadUrl, {
  method: "POST",
  body: file,
});
const { storageId } = await response.json();
```

### 2. Store Files from Actions

#### OLD: Using @repo/storage
```typescript
// Fetch and store an image
const response = await fetch(imageUrl);
const blob = await response.blob();
const stored = await storage.upload(blob, {
  provider: 's3',
  contentType: 'image/png',
});
```

#### NEW: Using Convex
```typescript
// In a Convex action
export const storeImage = action({
  handler: async (ctx, { imageUrl }) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Direct storage in Convex
    const storageId = await ctx.storage.store(blob);
    
    // Save reference in database
    await ctx.runMutation(internal.images.save, {
      storageId,
      url: await ctx.storage.getUrl(storageId),
    });
    
    return storageId;
  },
});
```

### 3. Serve Files

#### OLD: Using @repo/storage
```typescript
// Generate presigned URL
const url = await storage.createPresignedUrl(fileKey, {
  expiresIn: 3600,
});
```

#### NEW: Using Convex
```typescript
// In a Convex query
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// Or via HTTP action for direct serving
http.route({
  path: "/file/:storageId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const storageId = request.params.storageId;
    const blob = await ctx.storage.get(storageId);
    return new Response(blob);
  }),
});
```

### 4. File Metadata

#### OLD: Using @repo/storage
```typescript
const metadata = await storage.get(fileKey);
// { size, contentType, lastModified, ... }
```

#### NEW: Using Convex
```typescript
// In a Convex query/action
const metadata = await ctx.storage.getMetadata(storageId);
// { storageId, sha256, size, contentType }

// Or query the _storage system table
const files = await ctx.db.system.query("_storage").collect();
```

### 5. Delete Files

#### OLD: Using @repo/storage
```typescript
await storage.delete(fileKey);
```

#### NEW: Using Convex
```typescript
// In a Convex mutation
await ctx.storage.delete(storageId);
```

## Key Advantages of Convex Storage

1. **No Configuration**: Works out of the box
2. **Integrated**: Files are part of your Convex deployment
3. **Type-Safe**: Storage IDs are typed as `Id<"_storage">`
4. **Real-time**: File changes can trigger subscriptions
5. **Transactional**: File operations part of database transactions
6. **Global CDN**: Automatic edge delivery
7. **No Vendor Lock-in**: Export all data anytime

## Migration Steps

### 1. Remove Storage Package
```bash
rm -rf packages/storage
```

### 2. Update Asset Schema
```typescript
// packages/backend/convex/schema.ts
assets: defineTable({
  // Change from external URL to Convex storage
  storageId: v.id("_storage"),  // NEW: Convex storage
  // url: v.string(),            // OLD: External URL
  
  name: v.string(),
  type: v.string(),
  size: v.number(),
  mimeType: v.string(),
  // ... other fields
})
```

### 3. Create Upload Functions
```typescript
// packages/backend/convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    
    return await ctx.db.insert("assets", {
      ...args,
      url,
      createdAt: Date.now(),
    });
  },
});
```

### 4. Update React Components
```typescript
// components/FileUpload.tsx
import { useMutation } from "convex/react";
import { api } from "@repo/backend";

export function FileUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);
  
  const handleUpload = async (file: File) => {
    // Step 1: Get upload URL
    const uploadUrl = await generateUploadUrl();
    
    // Step 2: Upload file
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: file,
    });
    const { storageId } = await response.json();
    
    // Step 3: Save to database
    await saveFile({
      storageId,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  };
  
  return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

## File Storage Limits

### Convex Storage Limits
- **Free/Starter**: 1 GiB storage, 1 GiB/month bandwidth
- **Professional**: 100 GiB storage, 50 GiB/month bandwidth
- **File Size**: No hard limit (reasonable use)
- **File Types**: All types supported

## Environment Variables to Remove

Remove these from your `.env` files:
```env
# Remove all of these
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
GCS_BUCKET=...
GOOGLE_APPLICATION_CREDENTIALS=...
```

## Summary

✅ **Convex Storage replaces @repo/storage completely**
- Simpler API
- No configuration
- Better integration
- Real-time updates
- Type safety
- Lower cost (included in Convex pricing)

❌ **Remove @repo/storage package**
- Not needed with Convex
- Adds unnecessary complexity
- External dependencies
- Configuration overhead