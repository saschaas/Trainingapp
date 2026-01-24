import type { ExerciseDay, ExerciseDayCategory, Training } from '$lib/types';

// The fixed rotation cycle
const CATEGORY_CYCLE: ExerciseDayCategory[] = ['push', 'pull', 'legs'];

/**
 * Get the next category in the PUSH → PULL → LEGS rotation
 */
export function getNextCategory(lastCategory: ExerciseDayCategory | null): ExerciseDayCategory {
	if (!lastCategory) {
		return 'push';
	}

	const currentIndex = CATEGORY_CYCLE.indexOf(lastCategory);
	if (currentIndex === -1) {
		// Unknown category (e.g., full-body), default to push
		return 'push';
	}

	const nextIndex = (currentIndex + 1) % CATEGORY_CYCLE.length;
	return CATEGORY_CYCLE[nextIndex];
}

/**
 * Get the next exercise day in rotation
 * Algorithm:
 * 1. If no previous training: return first exercise-day (lowest rotationOrder)
 * 2. Find last completed training's exercise-day
 * 3. Return next in rotation order (wrap to first if at end)
 */
export function getNextExerciseDay(
	exerciseDays: ExerciseDay[],
	lastTraining: Training | null
): ExerciseDay | null {
	if (exerciseDays.length === 0) {
		return null;
	}

	// Sort by rotation order
	const sorted = [...exerciseDays].sort((a, b) => a.rotationOrder - b.rotationOrder);

	// If no last training, return the first in rotation
	if (!lastTraining) {
		return sorted[0];
	}

	// Find the index of the last used exercise day
	const lastIndex = sorted.findIndex(day => day.id === lastTraining.exerciseDayId);

	// If not found (exercise day was deleted), return first
	if (lastIndex === -1) {
		return sorted[0];
	}

	// Return next in rotation (wrap around)
	const nextIndex = (lastIndex + 1) % sorted.length;
	return sorted[nextIndex];
}

/**
 * Get exercise day by category for tab navigation
 */
export function getExerciseDayForCategory(
	exerciseDays: ExerciseDay[],
	category: 'push' | 'pull' | 'legs' | 'full-body'
): ExerciseDay | null {
	const matching = exerciseDays.filter(day => day.category === category);
	if (matching.length === 0) return null;

	// Return the one with lowest rotation order
	return matching.sort((a, b) => a.rotationOrder - b.rotationOrder)[0];
}

export interface LastTrainedDay {
	exerciseDay: ExerciseDay;
	daysAgo: number;
}

/**
 * Get the last N exercise days that were trained (for header display)
 */
export function getLastTrainedDays(
	trainings: Training[],
	exerciseDays: ExerciseDay[],
	count: number
): LastTrainedDay[] {
	const dayMap = new Map(exerciseDays.map(d => [d.id!, d]));
	const result: LastTrainedDay[] = [];
	const seen = new Set<number>();
	const now = Date.now();

	// Trainings should already be sorted by date descending
	for (const training of trainings) {
		if (result.length >= count) break;

		const dayId = training.exerciseDayId;
		if (!seen.has(dayId)) {
			const day = dayMap.get(dayId);
			if (day) {
				const daysAgo = Math.floor((now - training.date) / (1000 * 60 * 60 * 24));
				result.push({ exerciseDay: day, daysAgo });
				seen.add(dayId);
			}
		}
	}

	return result;
}

/**
 * Check if an exercise day is next in rotation
 */
export function isNextInRotation(
	exerciseDay: ExerciseDay,
	exerciseDays: ExerciseDay[],
	lastTraining: Training | null
): boolean {
	const next = getNextExerciseDay(exerciseDays, lastTraining);
	return next?.id === exerciseDay.id;
}

/**
 * Get days since last training of a specific exercise day
 */
export function getDaysSinceLastTraining(
	exerciseDayId: number,
	trainings: Training[]
): number | null {
	const lastTraining = trainings.find(t => t.exerciseDayId === exerciseDayId);
	if (!lastTraining) return null;

	const now = Date.now();
	const diffMs = now - lastTraining.date;
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
