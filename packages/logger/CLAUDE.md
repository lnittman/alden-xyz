# @repo/logger Package Context

## Development Standards

### Package Context
This package provides logging utilities for the Squish ecosystem. It offers structured logging, log levels, output formatting, and integration with various logging providers.

### Technology Stack
- **TypeScript**: 5.7+ strict configuration
- **Winston**: Structured logging
- **Pino**: High-performance logging alternative

### Key Dependencies
```json
{
  "dependencies": {
    "winston": "^3.15.0",
    "pino": "^9.4.0",
    "pino-pretty": "^11.3.0"
  }
}
```

## Package Structure
```
src/
├── index.ts            # Main logger exports
├── logger.ts           # Logger configuration
├── handlers/           # Log handlers
├── formats/           # Log formatters
└── utils/             # Logging utilities
```

## Logger Patterns
- Structured JSON logging
- Multiple log levels
- Environment-specific output
- Request correlation IDs
- Error stack preservation

## Files to Know
- `src/logger.ts` - Main logger configuration
- `src/handlers/console.ts` - Console handler

## Quality Checklist
- [ ] No sensitive data logged
- [ ] Structured format
- [ ] Performance optimized
- [ ] Error context preserved

---
EOF < /dev/null