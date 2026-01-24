# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production (outputs to /build)
npm run preview   # Preview production build locally
```

No test or lint commands are currently configured.

## Architecture Overview

This is a client-side fitness tracking PWA built with **SvelteKit 2 + Svelte 5**, using **Dexie.js** (IndexedDB wrapper) for local storage. No server required.

### Core Data Flow

```
User Input → Svelte Stores → Dexie DB → liveQuery → Store Updates → UI Re-render
```

The app uses Dexie's `liveQuery` for real-time database synchronization with Svelte stores.

### Key Directories

- `src/lib/stores/` - State management with Svelte stores + Dexie liveQuery integration
- `src/lib/db/` - Database layer with CRUD operations for each entity
- `src/lib/components/` - Organized by feature: `config/`, `layout/`, `shared/`, `statistics/`, `training/`
- `src/lib/utils/` - Business logic: volume calculations, statistics, rotation logic, backup/restore
- `src/lib/types/` - TypeScript definitions for all entities

### Data Model

- **Exercise**: Individual exercise with category (Brust/Schulter/Trizeps/Bauch/Rücken/Bizeps/Beine) and focus area
- **ExerciseDay**: Workout routine containing exercises with set counts, category (Push/Pull/Legs/Full-body)
- **Training**: Completed workout session with all set data (weight, reps, skip status)

### Store Pattern

Stores in `src/lib/stores/` follow a custom writable pattern with methods:
- `currentTraining`: Active session state (start, updateSet, skipSet, complete)
- `exercises`, `exerciseDays`, `trainingHistory`: CRUD operations with derived stores for filtering

### Statistics System

`src/lib/utils/statistics.ts` contains 20+ calculation functions for trends, PRs, volume comparisons, and frequency analysis. Statistics components in `src/lib/components/statistics/` visualize this data using Chart.js.

## Language

UI text and category names are in German (Deutsch).
