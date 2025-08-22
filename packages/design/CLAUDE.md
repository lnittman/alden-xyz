# @repo/design Package Context

## Development Standards

### Package Context
This package provides the design system and UI components for the Squish ecosystem. It includes shadcn/ui components, custom components, theme management, and design tokens built with Tailwind CSS v4.

### Technology Stack
- **shadcn/ui**: Latest - Component library foundation
- **Tailwind CSS**: v4.1.11 - Utility-first CSS framework
- **React**: 19+ compatibility
- **TypeScript**: 5.7+ strict configuration

### Key Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "react": "^19.1.0"
  }
}
```

## Package Structure
```
src/
├── components/           # UI Components
│   ├── ui/              # Base shadcn/ui components
│   ├── common/          # Shared app components
│   └── modules/         # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
└── styles/              # Style definitions
```

## Component Patterns
- Use shadcn/ui as base
- Follow consistent naming
- Implement with accessibility
- Support theme variants
- Export clean interfaces

## Files to Know
- `src/components/ui/index.ts` - UI component exports
- `src/lib/utils.ts` - Core utility functions
- `src/styles/theme.css` - Theme configuration

## Quality Checklist
- [ ] Components accessible
- [ ] Responsive design
- [ ] Theme variants work
- [ ] TypeScript complete
- [ ] No hardcoded styles

---
EOF < /dev/null