# @repo/notifications Package Context

## Development Standards

### Package Context
This package provides notification system utilities for the Squish ecosystem. It includes toast notifications, push notifications, in-app notifications, and notification management hooks.

### Technology Stack
- **React**: 19+ compatibility
- **TypeScript**: 5.7+ strict configuration
- **Radix UI**: Toast primitives
- ** Zustand**: State management

### Key Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-toast": "^1.2.2",
    "zustand": "^5.0.2",
    "react-hot-toast": "^2.4.1"
  }
}
```

## Package Structure
```
src/
├── index.ts            # Main exports
├── hooks/             # Notification hooks
├── components/        # Notification components
├── stores/            # State management
└── utils/             # Notification utilities
```

## Notification Patterns
- Toast notifications
- In-app notifications
- Push notification setup
- Notification dismissal
- Notification persistence

## Files to Know
- `src/hooks/useToast.ts` - Toast hook
- `src/components/Toast.tsx` - Toast component

## Quality Checklist
- [ ] Accessible notifications
- [ ] Queue management
- [ ] Dismiss handling
- [ ] Performance optimized

---
EOF < /dev/null