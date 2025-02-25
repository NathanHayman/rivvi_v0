# RIVVI-MVP Project Guidelines

## Commands
- **Development**: `pnpm dev` - Start development server
- **Build**: `pnpm build` - Build for production
- **Lint**: `pnpm lint` - Run ESLint
- **Database**: 
  - `pnpm db:push` - Push schema to database
  - `pnpm db:generate` - Generate migrations
  - `pnpm db:migrate` - Apply migrations
  - `pnpm db:studio` - Open Drizzle Studio

## Code Style
- **Imports**: Group by source (React first, then components, lib, third-party)
- **Components**: PascalCase names, kebab-case files, "use client" directive at top
- **Types**: Props interfaces, Zod schemas, TypeScript throughout
- **Naming**: camelCase variables/functions, `use` prefix for hooks
- **Error Handling**: Try/catch blocks, toast notifications, meaningful messages
- **State Management**: React Query for fetching, Server Actions for mutations
- **Component Structure**: Separate UI from logic, use composition
- **Data Fetching**: Use `useQuery` and `useMutation` for client components

Follow existing patterns when adding new code. Use the UI component library for consistent interfaces.