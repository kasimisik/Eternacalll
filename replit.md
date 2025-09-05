# Overview

This is a modern full-stack React application with authentication built using TypeScript, Vite, Express.js, and Clerk for user management. The application features a clean, professional UI built with shadcn/ui components and Tailwind CSS, providing user authentication flows including sign-in, sign-up, and a protected dashboard area.

**Status**: ✅ Successfully configured for Replit environment with all API keys and deployment settings ready.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern development
- **Vite** as the build tool and development server for fast hot module replacement
- **Wouter** for lightweight client-side routing instead of React Router
- **shadcn/ui** component library built on Radix UI primitives for accessible, customizable components
- **Tailwind CSS** for utility-first styling with custom CSS variables for theming
- **TanStack Query** for server state management and data fetching

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **In-memory storage** with interface-based design allowing easy migration to database storage
- **Custom middleware** for request logging and error handling
- **Development/production environment** separation with Vite integration

## Authentication & Authorization
- **Clerk** as the primary authentication provider
- **Protected routes** using custom ProtectedRoute component
- **Session management** handled entirely by Clerk
- **User profile management** with update capabilities

## Database Design
- **Drizzle ORM** configured for PostgreSQL with schema definitions
- **User schema** with id, username, and password fields
- **Migration system** with Drizzle Kit for schema changes
- **Neon Database** serverless PostgreSQL integration

## UI/UX Architecture
- **Component-driven design** with reusable UI components
- **Responsive layout** with mobile-first approach
- **Consistent theming** using CSS custom properties
- **Toast notifications** for user feedback
- **Loading states** and error boundaries for better UX

## Development Tools
- **TypeScript** for type safety across frontend and backend
- **ESBuild** for production server bundling
- **Path mapping** for clean imports using @ aliases
- **Hot module replacement** in development mode

# External Dependencies

## Authentication Services
- **Clerk** - Complete authentication and user management platform
- **@clerk/clerk-react** - React components and hooks for Clerk integration

## Database & ORM
- **Drizzle ORM** - Type-safe SQL query builder and ORM
- **@neondatabase/serverless** - Serverless PostgreSQL database driver
- **Neon Database** - Serverless PostgreSQL hosting platform

## UI Framework & Components
- **Radix UI** - Comprehensive set of accessible UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library for consistent iconography
- **class-variance-authority** - Utility for managing component variants

## Development & Build Tools
- **Vite** - Fast build tool and development server
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing with Tailwind integration
- **ESBuild** - Fast JavaScript bundler for production

## State Management & Data Fetching
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Form state management and validation
- **Zod** - Schema validation library

## Utility Libraries
- **date-fns** - Date manipulation utilities
- **nanoid** - Unique ID generation
- **clsx** - Conditional className utility