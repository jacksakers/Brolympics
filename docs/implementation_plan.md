Implementation Plan

This plan breaks down the development of the Brolympics app into manageable phases to ensure a logical progression from setup to deployment.

Phase 1: Environment & Scaffolding

Initialize a monorepo or standard directory structure (e.g., /client for React/Vite, /server for Node.js).

Setup Vite with React and Tailwind CSS.

Setup Node.js server with Express/Hono and SQLite connection.

Configure CORS so the Vite frontend can talk to the Node backend during development.

Phase 2: Database & API Foundation (The Backend)

Define the SQLite schema (Events, Players, Teams, Games, Transactions).

Build API endpoints for Event creation and validation (generating the secret code).

Build full CRUD API routes for Players, Teams, and Games.

Build transactional API routes for Scoring (Add points, Revert points).

Phase 3: Frontend Routing & Auth (The Gateway)

Install React Router.

Create the Landing Page (Create/Join UI).

Implement localStorage logic for the Event Code.

Create a layout wrapper for the Main Dashboard that checks for a valid code before rendering children.

Phase 4: Core Management UI (Settings Tab)

Build the UI to add/edit/delete Players.

Build the UI to group Players into Teams (or toggle Individual mode).

Build the UI to create Games, assign point values, and generate random Turn Orders.

Phase 5: Scoring, Leaderboard & History

Games Tab: UI to select a game and input scores for each player/team.

Bonus Tab: Simple form to select a player/team, input a reason, and add +/- points.

History Tab: Fetch all transactions, display them chronologically, and add an "Undo" button that creates a compensating transaction in the database.

Leaderboard Tab: Calculate total points dynamically from the transactions table and display rankings with animations.

Phase 6: Deployment & Self-Hosting

Build the Vite frontend (npm run build).

Configure the Node server to serve the static Vite files in production.

Deploy to the Linux Mini PC.

Setup the systemd service (using the provided file).

Start Tailscale and run the Tailscale Funnel command to expose the local port.