# @repo/services Package Context

## Development Standards

### Package Context
This package provides business logic services for the Squish ecosystem. It includes domain services for assets, boards, users, and other core features, maintaining separation between business logic and presentation layers.

### Technology Stack
- **TypeScript**: 5.7+ strict configuration
- **Zod**: Input validation
- **Drizzle ORM**: Data access
- Custom service architecture

### Package Structure
```
src/
├── index.ts            # Main exports
├── asset/              # Asset business logic
├── board/              # Board business logic
├── user/               # User business logic
├── search/             # Search business logic
└── common/             # Common service utilities
```

## Service Patterns
- Domain-driven design
- Input validation
- Error handling patterns
- Data transformation
- Business rule enforcement

## Files to Know
- `src/asset/index.ts` - Asset service
- `src/board/index.ts` - Board service

## Quality Checklist
- [ ] Business logic isolated
- [ ] Validation complete
- [ ] Error handling proper
- [ ] No circular dependencies

---
EOF < /dev/null