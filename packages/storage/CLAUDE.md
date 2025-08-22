# @repo/storage Package Context

## Development Standards

### Package Context
This package provides file storage utilities for the Squish ecosystem. It offers a unified API for multiple storage providers including Google Cloud Storage, Cloudflare R2, and Amazon S3.

### Technology Stack
- **@google-cloud/storage**: GCS client
- **@aws-sdk/client-s3**: S3 client
- **Cloudflare R2**: R2 client
- **TypeScript**: 5.7+ strict configuration

### Key Dependencies
```json
{
  "dependencies": {
    "@google-cloud/storage": "^7.14.0",
    "@aws-sdk/client-s3": "^3.700.0",
    "@cloudflare/r2": "^1.0.0"
  }
}
```

## Package Structure
```
src/
├── index.ts            # Main exports
├── providers/          # Storage providers
│   ├── gcs.ts          # Google Cloud Storage
│   ├── r2.ts           # Cloudflare R2
│   └── s3.ts           # Amazon S3
├── types/              # Storage types
├── utils/              # Storage utilities
└── client/             # Unified storage client
```

## Storage Patterns
- Provider abstraction
- Upload/download flows
- URL generation
- File metadata
- Error handling

## Files to Know
- `src/index.ts` - Unified storage API
- `src/client/index.ts` - Storage client facade

## Quality Checklist
- [ ] Security headers set
- [ ] File size limits
- [ ] Error handling
- [ ] Performance optimized

---
EOF < /dev/null