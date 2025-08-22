# @repo/orpc Package Context

## Development Standards

### Package Context
This package provides RPC (Remote Procedure Call) client and server utilities for the Squish ecosystem. Built on ORPC, it offers type-safe API communication, real-time data sync, and efficient request handling.

### Technology Stack
- **ORPC**: 1.7.5 - Type-safe RPC framework
- **TypeScript**: 5.7+ strict configuration
- **Zod**: Request/response validation
- **Hono**: Server integration

### Key Dependencies
```json
{
  "dependencies": {
    "@orpc/server": "^1.7.5",
    "@orpc/client": "^1.7.5",
    "@orpc/react": "^1.7.5",
    "zod": "^3.25.28"
  }
}
```

## Package Structure
```
src/
├── index.ts            # Main exports
├── client/             # ORPC client setup
├── server/             # ORPC server setup
├── procedures/         # RPC procedures
├── types/              # Type definitions
└── utils/              # RPC utilities
```

## RPC Patterns
- Type-safe endpoints
- Request/response validation
- Error handling
- Streaming support
- Client reconnection

## Files to Know
- `src/client/index.ts` - Client configuration
- `src/server/index.ts` - Server configuration

## Quality Checklist
- [ ] Type safety guaranteed
- [ ] Error handling complete
- [ ] Validation schemas
- [ ] Performance optimized

---
EOF < /dev/null