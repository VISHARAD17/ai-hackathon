# Insurance Claim Copilot Frontend - Code Review Graph

## Project Overview
A Next.js frontend application for an AI-powered insurance claim filing assistant using CopilotKit for generative UI.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│                      (Port 3000/3001)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Structure                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  frontend/                                                   │
│  ├── src/                                                    │
│  │   ├── app/                                               │
│  │   │   ├── layout.tsx          [Root Layout + Providers] │
│  │   │   ├── page.tsx             [Landing Page]           │
│  │   │   ├── globals.css          [Global Styles]          │
│  │   │   └── api/                                           │
│  │   │       └── copilotkit/                                │
│  │   │           └── route.ts     [API Route Handler]      │
│  │   │                                                       │
│  │   ├── components/                                        │
│  │   │   └── generative-ui/                                 │
│  │   │       ├── claim-form.tsx                             │
│  │   │       ├── damage-assessment.tsx                      │
│  │   │       └── coverage-analysis.tsx                      │
│  │   │                                                       │
│  │   └── hooks/                                             │
│  │       └── use-copilot-actions.tsx                        │
│  │                                                           │
│  ├── .env.local                   [Environment Variables]   │
│  ├── package.json                 [Dependencies]            │
│  └── next.config.ts               [Next.js Config]          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      User Interaction Flow                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  1. layout.tsx (Root)                                         │
│     - Wraps app with CopilotKit provider                     │
│     - Configures CopilotSidebar                              │
│     - Sets runtime URL: /api/copilotkit                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  2. page.tsx (Landing)                                        │
│     - Registers copilot actions via useCopilotActions()      │
│     - Displays welcome screen                                │
│     - Shows example prompts                                  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  3. use-copilot-actions.tsx (Hook)                           │
│     - Registers 3 actions:                                   │
│       • showClaimForm                                        │
│       • showDamageAssessment                                 │
│       • showCoverageAnalysis                                 │
│     - Each action renders corresponding component            │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  4. User types in CopilotSidebar                             │
│     Example: "I was in a car accident"                       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  5. Request flows to /api/copilotkit/route.ts               │
│     - Uses OpenAI adapter                                    │
│     - Processes with CopilotRuntime                          │
│     - Returns action to execute                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  6. Action renders appropriate component                     │
│     - ClaimForm: Pre-filled form fields                     │
│     - DamageAssessment: Visual damage breakdown             │
│     - CoverageAnalysis: Policy coverage table               │
└──────────────────────────────────────────────────────────────┘
```

## Key Files & Responsibilities

### 1. **layout.tsx** (Root Layout)
```typescript
Purpose: Application shell with CopilotKit integration
Dependencies:
  - @copilotkit/react-core (CopilotKit)
  - @copilotkit/react-ui (CopilotSidebar)
Key Features:
  - Wraps entire app with CopilotKit provider
  - Configures sidebar with custom labels
  - Sets runtime URL for API communication
```

### 2. **page.tsx** (Landing Page)
```typescript
Purpose: Main landing page with welcome UI
Dependencies:
  - use-copilot-actions hook
Key Features:
  - Registers all copilot actions
  - Displays welcome message
  - Shows example prompts for users
  - Gradient background with feature cards
```

### 3. **api/copilotkit/route.ts** (API Handler)
```typescript
Purpose: Backend API route for CopilotKit
Dependencies:
  - @copilotkit/runtime
  - openai
Key Features:
  - Creates CopilotRuntime instance
  - Uses OpenAI adapter for LLM
  - Handles POST requests from frontend
  - Returns AI-generated actions
```

### 4. **use-copilot-actions.tsx** (Hook)
```typescript
Purpose: Registers all copilot actions
Dependencies:
  - @copilotkit/react-core
  - All generative UI components
Actions Registered:
  1. showClaimForm
     - Parameters: claimType, date, location, description
     - Renders: ClaimForm component
  
  2. showDamageAssessment
     - Parameters: damages[], totalMin, totalMax, verdict
     - Renders: DamageAssessment component
  
  3. showCoverageAnalysis
     - Parameters: policyNumber, coverages[], estimates, deductible
     - Renders: CoverageAnalysis component
```

### 5. **Generative UI Components**

#### **claim-form.tsx**
```typescript
Purpose: Dynamic claim intake form
Props:
  - claimType: string (default: "Auto Collision")
  - date: string
  - location: string
  - description: string
  - loading: boolean
Features:
  - Pre-filled form fields from conversation
  - Disabled state during loading
  - Save & Continue button
```

#### **damage-assessment.tsx**
```typescript
Purpose: Visual damage breakdown with cost estimates
Props:
  - damages: Array<{component, severity, cost}>
  - totalMin: number
  - totalMax: number
  - verdict: string
  - loading: boolean
Features:
  - Progress bars for severity visualization
  - Cost breakdown per component
  - Total estimate range
  - Action buttons (Check Coverage, Find Shops)
```

#### **coverage-analysis.tsx**
```typescript
Purpose: Policy coverage table with claim calculation
Props:
  - policyNumber: string
  - coverages: Array<{name, covered, limit, deductible}>
  - estimateMin: number
  - estimateMax: number
  - deductible: number
  - loading: boolean
Features:
  - Coverage table with status indicators
  - Claim cost calculation
  - Deductible breakdown
  - Action buttons (File Claim, Estimate Breakdown)
```

## Data Flow

```
User Input (Chat)
      │
      ▼
CopilotSidebar
      │
      ▼
/api/copilotkit (POST)
      │
      ▼
CopilotRuntime + OpenAI
      │
      ▼
Action Decision
      │
      ▼
useCopilotAction (render callback)
      │
      ▼
Generative UI Component
      │
      ▼
Rendered in Sidebar
```

## Dependencies

### Core Framework
- **next**: 16.2.6 - React framework
- **react**: Latest - UI library
- **react-dom**: Latest - React DOM renderer

### CopilotKit
- **@copilotkit/react-core**: Core CopilotKit functionality
- **@copilotkit/react-ui**: UI components (CopilotSidebar)
- **@copilotkit/runtime**: Runtime for handling AI interactions

### AI/LLM
- **openai**: OpenAI API client

### Styling
- **tailwindcss**: Utility-first CSS framework
- **@tailwindcss/postcss**: PostCSS plugin

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## API Routes

### POST /api/copilotkit
```
Purpose: Handle CopilotKit requests
Request: CopilotKit protocol messages
Response: AI-generated actions with parameters
Authentication: None (uses OPENAI_API_KEY server-side)
```

## State Management

- **No global state management** (Redux, Zustand, etc.)
- State managed locally in components
- CopilotKit handles conversation state internally
- Action parameters passed as props to components

## Styling Approach

- **Tailwind CSS** for all styling
- Utility classes directly in components
- No separate CSS modules
- Responsive design with Tailwind breakpoints
- Custom color scheme: blue/indigo gradient

## Key Design Patterns

1. **Composition Pattern**: Components composed in layout hierarchy
2. **Render Props**: CopilotKit actions use render callbacks
3. **Hook Pattern**: Custom hook for action registration
4. **Server Components**: Next.js App Router with server/client split
5. **API Routes**: Next.js API routes for backend logic

## Error Handling

- **Action Parameters**: All parameters marked as `required: false`
- **Loading States**: Components accept `loading` prop
- **Default Values**: All components have sensible defaults
- **Handler Functions**: Empty async handlers prevent errors

## Performance Considerations

- **Client Components**: Marked with "use client" where needed
- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Components loaded on-demand
- **No Heavy Dependencies**: Minimal external libraries

## Security Considerations

- **API Key**: Stored in .env.local (server-side only)
- **No Client Secrets**: OpenAI key never exposed to client
- **CORS**: Handled by Next.js API routes
- **Input Validation**: Handled by CopilotKit runtime

## Testing Strategy

- **No tests currently implemented**
- Recommended: Jest + React Testing Library
- Test coverage needed for:
  - Component rendering
  - Action registration
  - API route handling

## Deployment Considerations

1. **Environment Variables**: Set OPENAI_API_KEY in production
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Port**: Default 3000 (configurable)
5. **Node Version**: Compatible with Next.js 16.2.6

## Future Enhancements

1. Add more generative UI components (timeline, settlement, etc.)
2. Implement error boundaries
3. Add loading skeletons
4. Implement form submission logic
5. Add backend API integration
6. Implement authentication
7. Add analytics tracking
8. Improve accessibility (ARIA labels, keyboard navigation)

## Known Issues

1. **Port Conflict**: May use port 3001 if 3000 is occupied
2. **API Key Required**: App won't function without OPENAI_API_KEY
3. **No Backend**: Components are UI-only, no actual claim processing
4. **No Persistence**: No database, all data is ephemeral

## Development Workflow

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## File Size Summary

- **Total Components**: 3 generative UI components
- **Total Hooks**: 1 custom hook
- **Total API Routes**: 1 route
- **Total Pages**: 1 landing page
- **Lines of Code**: ~400 lines (excluding node_modules)

## Component Interaction Matrix

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│                 │ layout   │ page     │ hook     │ API      │
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ layout.tsx      │    -     │ wraps    │    -     │ config   │
│ page.tsx        │ child    │    -     │ uses     │    -     │
│ use-copilot-... │    -     │ used by  │    -     │ triggers │
│ api/route.ts    │ config   │    -     │ responds │    -     │
│ claim-form      │    -     │    -     │ rendered │    -     │
│ damage-assess   │    -     │    -     │ rendered │    -     │
│ coverage-anal   │    -     │    -     │ rendered │    -     │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘
```

## Summary for AI/LLM Understanding

This is a **minimal Next.js frontend** for an insurance claim copilot using **CopilotKit**. The architecture follows a simple pattern:

1. **User types in chat sidebar** → 
2. **Request goes to API route** → 
3. **OpenAI processes with CopilotKit** → 
4. **Action is returned** → 
5. **Component renders in sidebar**

The app has **3 main UI components** (ClaimForm, DamageAssessment, CoverageAnalysis) that are dynamically rendered based on user conversation. All components are **stateless and receive props** from the AI agent. The **hook registers actions** that tell the AI what components are available to render.

**Key Technologies**: Next.js 16, React, CopilotKit, OpenAI, Tailwind CSS
**Architecture**: Server-side API route + Client-side components
**State**: No global state, all local to components
**Styling**: Tailwind utility classes
**AI Integration**: CopilotKit handles conversation, OpenAI generates responses
