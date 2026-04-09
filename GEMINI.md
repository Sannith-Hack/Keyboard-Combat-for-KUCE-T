# Keyboard Combat - Project Context

## 🎯 Project Overview
**Keyboard Combat** is a scalable typing competition web application designed for high-stakes events (e.g., college fests). It features a gamified multi-level typing experience, real-time leaderboards, and a comprehensive admin dashboard for competition management.

### 🚀 Tech Stack
- **Frontend:** React (Vite) + TypeScript
- **Styling:** Tailwind CSS (v4) + PostCSS
- **State Management:** Zustand (with persistence)
- **Routing:** React Router DOM
- **Backend/DB:** Supabase (Database + Realtime)
- **Icons:** Lucide React

---

## 🏗️ Architecture & Core Logic

### Competition Flow
The application follows a structured 7-level flow managed in `src/App.tsx`:
0. **Entry:** Participant registration (requires a live competition).
1. **Warmup:** Practice text (no scoring).
2. **Level 1 (Paragraphs):** Natural language typing.
3. **Break:** 10-second intermission.
4. **Level 2 (Code):** C/C++ snippet typing (strict character comparison).
5. **Break:** 10-second intermission.
6. **Level 3 (Precision):** High-precision special characters and symbols.
7. **Results:** Final performance breakdown and submission.

### 🧠 Scoring Schema (Combat Points)
The application uses a weighted scoring formula to prioritize accuracy over raw speed:
`Combat Score = rawWpm * (Accuracy / 100)^2`
- **WPM:** Words Per Minute calculated as `(TypedChars / 5) / Minutes`.
- **Accuracy:** Percentage of correct characters.
- **Precision:** All stats are tracked to 2 decimal places.

### 🛡️ Anti-Cheat Mechanisms
- **Tab Switching:** Detects `visibilitychange` and alerts the user (potential for auto-disqualification).
- **Clipboard Lock:** Disables copy, paste, and right-click context menus.
- **Focus Guard:** Text input is hidden; users type into a transparent textarea over the rendered text.

---

## 📊 Database Schema (Supabase)
The project uses four primary tables:
1. **`competitions`**: Manages event slots (id, name, status [draft/live/ended], scheduled_start).
2. **`participants`**: Stores student details (id, name, roll_number, email, college, competition_id).
3. **`attempts`**: Level-by-level performance (id, participant_id, level, wpm, accuracy, time_taken, combat_score).
4. **`results`**: Final aggregated scores for the leaderboard.

---

## ⚙️ Development Workflows

### Environment Variables
Required variables in `.env`:
- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous API key.
- `VITE_ADMIN_USER`: Username for admin dashboard.
- `VITE_ADMIN_PASS`: Password for admin dashboard.

### Commands
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the production bundle.
- `npm run preview`: Locally previews the production build.

### Admin Dashboard
Access via `/login` or `/admin`.
- **Schedule:** Create and manage competition slots.
- **Live Control:** "GO LIVE" toggles active submission window.
- **Monitoring:** Real-time leaderboard updates via Supabase Realtime subscriptions.

---

## 📝 Conventions
- **State:** Use `src/store/useGameStore.ts` for all shared application state.
- **Components:** Modularize UI in `src/components/`.
- **Data:** Typing texts are stored in `src/data/content.ts`.
- **Types:** Strictly type all Supabase responses and store actions.
