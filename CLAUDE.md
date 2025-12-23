# IndieSaasDeals - Design Review Workflow

This file contains design principles, development guidelines, and automated review workflows for the IndieSaasDeals platform - a Next.js-based deals aggregation platform.

## Project Overview

IndieSaasDeals is a comprehensive deals platform built with Next.js, TypeScript, Tailwind CSS, and Supabase. The platform aggregates and curates startup deals, lifetime deals, and software promotions for entrepreneurs and small businesses.

## Visual Development

### Design Principles

- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`  
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check

IMMEDIATELY after implementing any front-end change:

- **Identify what changed** - Review the modified components/pages
- **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
- **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
- **Validate feature implementation** - Ensure the change fulfills the user's specific request
- **Check acceptance criteria** - Review any provided context files or requirements
- **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
- **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

Invoke the `@agent-design-review` subagent for thorough design validation when:

- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

## S-Tier SaaS Design Standards (Inspired by Stripe, Airbnb, Linear)

### Core Design Philosophy

- **Users First**: Prioritize user needs, workflows, and ease of use in every design decision
- **Meticulous Craft**: Aim for precision, polish, and high quality in every UI element and interaction
- **Speed & Performance**: Design for fast load times and snappy, responsive interactions
- **Simplicity & Clarity**: Strive for a clean, uncluttered interface with unambiguous labels and instructions
- **Focus & Efficiency**: Help users achieve their goals quickly with minimal friction
- **Consistency**: Maintain uniform design language (colors, typography, components, patterns) across the entire platform
- **Accessibility (WCAG AA+)**: Design for inclusivity with sufficient color contrast, keyboard navigability, and screen reader compatibility
- **Opinionated Design**: Establish clear, efficient default workflows and settings, reducing decision fatigue

### Design System Foundation

#### Color Palette
- **Primary Brand Color**: User-specified, used strategically
- **Neutrals**: Scale of grays (5-7 steps) for text, backgrounds, borders
- **Semantic Colors**: Success (green), Error/Destructive (red), Warning (yellow/amber), Informational (blue)
- **Dark Mode Palette**: Accessible dark mode variants
- **Accessibility**: All color combinations meet WCAG AA contrast ratios

#### Typography Scale
- **Primary Font Family**: Inter (clean, legible sans-serif)
- **Modular Scale**: H1: 32px, H2: 24px, H3: 20px, H4: 18px, Body: 16px, Small: 14px
- **Font Weights**: Regular, Medium, SemiBold, Bold
- **Line Height**: 1.5-1.7 for body text

#### Spacing System
- **Base Unit**: 8px
- **Spacing Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

#### Border Radii
- **Small**: 4-6px for inputs/buttons
- **Medium**: 8-12px for cards/modals
- **Large**: 16px for major containers

### Layout & Visual Hierarchy

- **Responsive Grid**: 12-column grid system for consistent layout
- **Strategic White Space**: Ample negative space for clarity and reduced cognitive load
- **Clear Visual Hierarchy**: Guide users using typography, spacing, and element positioning
- **Consistent Alignment**: Maintain consistent alignment of all elements

### Component Standards

All components must have consistent states: default, hover, active, focus, disabled

#### Core Components
- **Buttons**: Primary, secondary, tertiary/ghost, destructive, link-style (with icon options)
- **Input Fields**: Text, textarea, select, date picker (with clear labels, placeholders, helper text, error messages)
- **Form Controls**: Checkboxes, radio buttons, toggles/switches
- **Cards**: Content blocks, deal cards, dashboard widgets
- **Tables**: Data display with headers, sorting, filtering capabilities
- **Modals/Dialogs**: Confirmations, forms, detailed views
- **Navigation**: Sidebar, tabs, breadcrumbs
- **Indicators**: Badges/tags for status, tooltips for help, progress indicators
- **Media**: Icons (single SVG set), avatars, image containers

### Interaction Design

- **Micro-interactions**: Subtle animations for user feedback (150-300ms with ease-in-out)
- **Loading States**: Skeleton screens for page loads, spinners for component actions
- **Smooth Transitions**: State changes, modal appearances, section expansions
- **Keyboard Navigation**: All interactive elements keyboard accessible with clear focus states

## Platform-Specific Design Guidelines

### Deal Card Design
- **Clear Deal Display**: Prominent product imagery and pricing
- **Obvious Actions**: Clearly labeled CTAs (View Deal, Claim Offer, Save)
- **Status Indicators**: Color-coded badges for deal status (Active, Ending Soon, Expired)
- **Contextual Information**: Vendor, discount percentage, time remaining
- **Trust Signals**: Ratings, reviews, verified badges

### Category Pages
- **Efficient Filtering**: Accessible filter controls (price range, category, vendor)
- **Sort Options**: By popularity, price, ending date, newest
- **Grid/List Toggle**: User preference for deal display
- **Load More/Pagination**: For large deal sets

### Deal Detail Pages
- **Hero Section**: Large product image, key details, primary CTA
- **Information Hierarchy**: Description, features, terms, reviews
- **Social Proof**: User reviews, ratings, share buttons
- **Related Deals**: Contextual recommendations

### Admin Dashboard
- **Deal Management**: Bulk approval/rejection actions
- **Analytics Display**: Clear metrics with appropriate chart types
- **User Management**: Efficient table with search/filter
- **Content Moderation**: Clear status indicators and quick actions

## Development Guidelines

### Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with design tokens
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Payments**: Stripe
- **Analytics**: Google Analytics, Facebook Pixel

### Code Quality
- **TypeScript**: Strict mode enabled, proper type definitions
- **Component Architecture**: Reusable, composable components
- **State Management**: React hooks, Zustand for complex state
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Image optimization, lazy loading, code splitting

### Testing & Quality Assurance
- **Visual Testing**: Screenshot comparison after UI changes
- **Accessibility Testing**: ARIA labels, keyboard navigation, color contrast
- **Performance Testing**: Core Web Vitals, mobile optimization
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge

### Deployment & Monitoring
- **Environment**: Vercel with preview deployments
- **Monitoring**: Error tracking, performance monitoring
- **SEO**: Meta tags, structured data, sitemap generation
- **Security**: Input validation, CSRF protection, rate limiting

## Workflow Commands

### Design Review Slash Commands
- `/design-review` - Trigger comprehensive design review of current changes
- `/accessibility-check` - Validate WCAG compliance
- `/performance-check` - Analyze Core Web Vitals and optimization opportunities

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm test` - Run test suite

## Context Files

Refer to these files for specific guidance:
- `/context/design-principles.md` - Detailed design standards
- `/context/style-guide.md` - Brand guidelines and visual identity
- `/context/component-library.md` - Component specifications
- `/context/accessibility-guidelines.md` - WCAG compliance standards

## Quick Reference

### Breakpoints
- Mobile: 0-767px
- Tablet: 768-1023px  
- Desktop: 1024px+
- Large Desktop: 1440px+

### Common Patterns
- **Card Hover**: Subtle elevation (shadow-md to shadow-lg)
- **Button Hover**: Slight opacity change (0.9) or background darkening
- **Input Focus**: Border color change with subtle shadow
- **Loading**: Skeleton placeholders, not just spinners
- **Empty States**: Helpful illustrations with clear next actions

This workflow ensures consistent, high-quality design implementation across the IndieSaasDeals platform while maintaining development efficiency and user experience standards.