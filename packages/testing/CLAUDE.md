# @repo/testing Package Context

## Development Standards

### Package Context
This package provides testing utilities and configurations for the Squish ecosystem. It includes test helpers, fixtures, mock setups, and testing framework configurations.

### Technology Stack
- **Vitest**: Testing framework
- **Testing Library**: Component testing
- **MSW**: API mocking
- **TypeScript**: 5.7+ strict configuration

### Key Dependencies
```json
{
  "dependencies": {
    "vitest": "^3.1.4",
    "@testing-library/react": "^16.1.0",
    "msw": "^2.6.4"
  }
}
```

## Package Structure
```
src/
├── index.ts            # Main exports
├── fixtures/           # Test fixtures
├── mocks/              # Mock implementations
├── utils/              # Testing utilities
└── setup/              # Test setup files
```

## Testing Patterns
- Component testing
- API testing
- Unit testing
- Integration testing
- E2E testing support

## Files to Know
- `src/index.ts` - Test exports
- `src/utils/test-helpers.ts` - Test helpers

## Quality Checklist
- [ ] Test coverage adequate
- [ ] Mocks realistic
- [ ] Fixtures maintained
- [ ] Performance ok

---
EOF < /dev/null