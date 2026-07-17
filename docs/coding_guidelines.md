Brolympics Coding Guidelines

To keep this project maintainable, fun to work on, and easy to extend for future parties, adhere to the following strict guidelines.

1. Documentation Requirement (Strict Rule)

READMEs: Every major directory (e.g., /client, /server, /server/db) must contain a README.md explaining its purpose and how to run it.

JSDoc/Comments: Complex scoring logic, turn-order generation, and API routes must be documented with JSDoc comments explaining parameters and return types.

Inline Context: Leave comments explaining why a decision was made, not just what the code does.

2. React Architecture & Component Design

Small, Single-Purpose Files: No file should exceed 150-200 lines. If a component gets too large, break it down.

Bad: Dashboard.jsx (contains leaderboard logic, game lists, and settings).

Good: Dashboard.jsx (imports Leaderboard.jsx, GameList.jsx, Settings.jsx).

Separation of Logic and UI:

Use Custom Hooks (useLeaderboard.js, useAuth.js) to handle data fetching, state management, and localStorage interactions.

React Components should primarily be "dumb" presentation layers that consume custom hooks.

Prop Drilling: Avoid it. For global state (like the current Event Code or the active Event Details), use React Context or a lightweight library like Zustand.

3. Tailwind CSS & Styling

Utility-First: Write all styles using Tailwind utility classes. Avoid creating custom CSS files unless absolutely necessary for complex animations.

Consistency: Rely on Tailwind's default spacing and color palette to maintain a cohesive UI. Use clsx or tailwind-merge if dynamic class names are needed.

Mobile-First: Always style for mobile screens first (e.g., p-4 flex-col), then use breakpoints for desktop if necessary (e.g., md:flex-row md:p-8).

4. API & Data Handling

Stateless Frontend: The frontend should treat the SQLite database as the source of truth. After any CRUD operation, refetch or optimistically update the state.

Immutability in History: Never actually DELETE a score transaction. To revert points, create a new transaction with a negative value and a reason of "Reverted: [Original Reason]". This maintains the audit log.

5. File Naming Conventions

Components: PascalCase.jsx (e.g., PlayerCard.jsx)

Hooks: camelCase.js (e.g., useEventCode.js)

Utils/Helpers: camelCase.js (e.g., calculateScores.js)