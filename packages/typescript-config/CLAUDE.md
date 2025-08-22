# @repo/typescript-config Package Context

## Development Standards

### Package Context
This package provides shared TypeScript configurations for the Squish ecosystem. It includes base configs, Next.js configs, React configs, and custom type checking rules.

### Package Structure
```
base.json              # Base TypeScript config
nextjs.json            # Next.js specific config
react.json             # React specific config
node.json              # Node.js specific config
```

## Configuration Patterns
- Strict type checking
- Path mapping
- Module resolution
- Declaration generation
- Composite project support

## Files to Know
- `base.json` - Base configuration
- `nextjs.json` - Next.js overrides

## Quality Checklist
- [ ] Strict mode enabled
- [ ] No implicit any
- [ ] Path aliases correct
- [ ] Module resolution ok

---
EOF < /dev/null