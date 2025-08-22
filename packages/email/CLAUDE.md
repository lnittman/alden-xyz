# @repo/email Package Context

## Development Standards

### Package Context
This package provides email templates and utilities for the Squish ecosystem. Built with React Email, it offers reusable email components, transactional email templates, and email sending utilities.

### Technology Stack
- **React Email**: Latest - Email template builder
- **Resend**: 4.0.1 - Email delivery API
- **Tailwind CSS**: Email styling support
- **TypeScript**: 5.7+ strict configuration

### Key Dependencies
```json
{
  "dependencies": {
    "@react-email/components": "^0.0.26",
    "@react-email/render": "^1.0.2",
    "@react-email/tailwind": "^0.0.19",
    "resend": "^4.0.1"
  }
}
```

## Package Structure
```
src/
├── emails/              # Email templates
│   ├── welcome/        # Welcome emails
│   ├── notifications/   # Notification emails
│   └── auth/           # Authentication emails
├── components/          # Reusable email components
├── layouts/            # Email layouts
└── lib/                # Email utilities
```

## Email Template Patterns
- Use React Email components
- Support mobile responsive design
- Implement fallback styles
- Use semantic HTML
- Test across email clients

## Files to Know
- `src/emails/layouts/BaseLayout.tsx` - Base email layout
- `src/lib/email-client.ts` - Email sending client

## Quality Checklist
- [ ] Mobile responsive
- [ ] Client compatibility
- [ ] No inline styles
- [ ] Accessibility compliant
- [ ] Test with sample data

---
EOF < /dev/null