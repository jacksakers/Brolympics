Brolympics - System Design Document

1. Overview and Motivation

Brolympics is a self-hosted, mobile-first web application designed to facilitate friendly, multi-event competitions among friends (e.g., weekend trips, golf outings, parties). Inspired by "Hallolimpics," it provides a structured yet flexible way to track games, manage teams or individual play, record scores, assign bonus points, and view live leaderboards.

2. Core Architecture

Frontend: React (bootstrapped with Vite), Tailwind CSS for styling. Mobile-first design paradigm.

Backend: Node.js (Express or Hono) to serve as a lightweight API for database interactions.

Database: SQLite (using better-sqlite3 or Prisma) for simple, file-based, zero-configuration storage.

Hosting: Linux Mini PC, running as a background service via systemd.

Networking: Tailscale Funnel to securely expose the local port to the internet without port forwarding.

3. Authentication & Access

Passwordless Entry: When an "Event" is created, a unique 6-character alphanumeric Event Code is generated.

Session Management: Users enter the app, select "Join Event," and input the code. This code is saved in the browser's localStorage. Subsequent visits will bypass the join screen.

Trust System: There are no individual user accounts. Anyone with the code acts as an admin (can add scores, create games, revert points). Accountability is handled via the History/Audit Log.

4. Core Features & UX Flow

4.1. Landing Page

"Create New Event" button.

"Join Existing Event" input field (prompts for the Event Code).

4.2. Main Dashboard (Bottom Tab Navigation for Mobile)

Leaderboard (Default): Shows current standings (Teams or Individuals).

Games: List of all locked-in events (e.g., Golf, Jenga, Ring Toss). Tap a game to enter scores.

Bonus Points: Quick-action screen to award arbitrary points (e.g., "Drank a beer - 10 pts").

History (Audit Log): A chronological feed of every action taken. Allows users to hit an "Undo" button on any point transaction to ensure fairness.

Settings (Config): Add players, create teams, toggle turn orders, and manage CRUD operations for games.

4.3. Data Entities

Event: id, name, secret_code, created_at

Player: id, event_id, name, team_id (nullable)

Team: id, event_id, name

Game: id, event_id, name, format (team/individual), points_config

Transaction (Score/Bonus): id, event_id, player_id/team_id, game_id (nullable), points, reason, timestamp

AuditLog: Tracks creation/deletion/updates for transparency. (Often merged with Transactions).

5. Mobile-First UI Considerations

Large, tappable buttons (min 44x44px).

High contrast, dark mode support for nighttime use.

Toast notifications for successful score entries.

Pull-to-refresh capabilities.