# enso Design System

## Core Influences & Philosophy

Our design system is primarily influenced by:
- **Stable Audio's Async UX**: Elegant handling of background tasks and credit consumption
- **ChatGPT's Intelligence**: Subtle indicators of AI processing
- **Cursor's Reference System**: Seamless code and context integration

## Async UI/UX Patterns

### Credit System
```typescript
interface CreditUI {
  // Visual representation
  indicators: {
    balance: string
    cost: string
    pending: string
  }
  
  // States
  states: {
    available: 'Ready to use'
    consuming: 'Using credit...'
    consumed: 'Credit used'
    refunded: 'Credit refunded'
    error: 'Failed - credit returned'
  }
  
  // Animations
  animations: {
    consume: 'fade-scale'
    refund: 'slide-fade'
    error: 'shake'
  }
}
```

### Background Tasks
```typescript
interface TaskUI {
  // Task states
  states: {
    queued: 'Starting soon...'
    running: 'Processing in background'
    paused: 'Paused - resume?'
    completed: 'Ready for review'
    failed: 'Task failed'
  }
  
  // Progress indicators
  progress: {
    type: 'determinate' | 'indeterminate'
    position: 'inline' | 'floating'
    showPercentage: boolean
  }
  
  // Controls
  controls: {
    pause: boolean
    cancel: boolean
    background: boolean
  }
}
```

### Notification System
```typescript
interface NotificationUI {
  // Types
  types: {
    credit: 'Credit update'
    task: 'Task status'
    result: 'Result ready'
    error: 'Task failed'
  }
  
  // Positions
  positions: {
    task: 'inline'
    credit: 'top-right'
    result: 'bottom-right'
  }
  
  // Persistence
  persistence: {
    credit: '3s'
    task: 'until-dismissed'
    result: '5s'
  }
}
```

## Design Tokens

### Typography
```typescript
interface Typography {
  fonts: {
    sans: 'Inter var'
    mono: 'JetBrains Mono'
  }
  weights: {
    normal: 400
    medium: 500
    semibold: 600
  }
  sizes: {
    xs: '0.75rem'
    sm: '0.875rem'
    base: '1rem'
    lg: '1.125rem'
  }
}
```

### Colors
```typescript
interface Colors {
  // Brand colors
  brand: {
    blue: '#178bf1'
    indigo: '#4f46e5'
  }
  
  // Task states
  task: {
    queued: '#9ca3af'
    running: '#3b82f6'
    completed: '#10b981'
    failed: '#ef4444'
  }
  
  // Credit states
  credit: {
    available: '#10b981'
    consuming: '#3b82f6'
    consumed: '#6b7280'
    refunded: '#f59e0b'
  }
  
  // UI colors
  ui: {
    background: '#000000'
    foreground: '#ffffff'
    muted: 'rgba(255, 255, 255, 0.1)'
    border: 'rgba(255, 255, 255, 0.05)'
  }
}
```

### Animation
```typescript
interface Animation {
  durations: {
    instant: '100ms'
    fast: '200ms'
    normal: '300ms'
    slow: '500ms'
  }
  
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)'
    in: 'cubic-bezier(0.4, 0, 1, 1)'
    out: 'cubic-bezier(0, 0, 0.2, 1)'
  }
  
  patterns: {
    taskStart: {
      opacity: [0, 1],
      scale: [0.95, 1]
    },
    creditConsume: {
      opacity: [1, 0],
      translateY: [0, -10]
    },
    resultAppear: {
      opacity: [0, 1],
      translateY: [10, 0]
    }
  }
}
```

## Components

### TaskCard
```typescript
interface TaskCard {
  // Visual properties
  variant: 'inline' | 'floating'
  size: 'sm' | 'md' | 'lg'
  
  // Content
  title: string
  description: string
  progress: number
  
  // Interaction
  onBackground: () => void
  onCancel: () => void
  onResume: () => void
}
```

### CreditBadge
```typescript
interface CreditBadge {
  // Display
  value: number
  size: 'sm' | 'md'
  variant: 'balance' | 'cost'
  
  // States
  loading: boolean
  error: boolean
  
  // Animation
  animate: boolean
  onComplete: () => void
}
```

### TaskProgress
```typescript
interface TaskProgress {
  // Progress
  value: number
  indeterminate: boolean
  
  // Display
  showLabel: boolean
  size: 'sm' | 'md' | 'lg'
  
  // States
  state: TaskState
  error?: string
}
```

## Implementation

### Task Container
```typescript
function TaskContainer({ task, onBackground }: TaskContainerProps) {
  return (
    <div className="task-card">
      <div className="task-header">
        <TaskTitle>{task.title}</TaskTitle>
        <CreditBadge value={task.creditCost} />
      </div>
      
      <TaskProgress
        value={task.progress}
        state={task.state}
      />
      
      <TaskControls
        onBackground={onBackground}
        onCancel={task.cancel}
      />
    </div>
  )
}
```

### Credit System
```typescript
function CreditSystem() {
  return (
    <div className="credit-container">
      <CreditBalance value={balance} />
      <CreditHistory items={history} />
      <PendingCredits tasks={pendingTasks} />
    </div>
  )
}
```

## Usage Guidelines

### Task Management
- Show clear progress indicators
- Allow immediate backgrounding
- Provide cancel option
- Show credit cost upfront

### Credit Handling
- Abstract complexity
- Show clear feedback
- Handle errors gracefully
- Provide usage history

### Notifications
- Keep non-intrusive
- Show important updates
- Allow quick actions
- Clear automatically

### Animation
- Keep subtle
- Indicate state changes
- Show progress clearly
- Maintain smoothness 
