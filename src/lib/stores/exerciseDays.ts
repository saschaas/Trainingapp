import { writable, derived } from 'svelte/store';
import { liveQuery } from 'dexie';
import { db } from '$lib/db';
import * as exerciseDayDb from '$lib/db/exerciseDays';
import type { ExerciseDay, ExerciseDayCategory, ExerciseConfig } from '$lib/types';

// Create a store that syncs with the database using liveQuery
function createExerciseDaysStore() {
	const { subscribe, set } = writable<ExerciseDay[]>([]);

	// Subscribe to live database updates
	if (typeof window !== 'undefined') {
		const observable = liveQuery(() => db.exerciseDays.orderBy('rotationOrder').toArray());
		observable.subscribe({
			next: (days) => set(days),
			error: (err) => console.error('Error loading exercise days:', err)
		});
	}

	return {
		subscribe,
		add: async (name: string, category: ExerciseDayCategory, exercises: ExerciseConfig[], rotationOrder?: number) => {
			return exerciseDayDb.createExerciseDay(name, category, exercises, rotationOrder);
		},
		update: async (id: number, updates: Partial<Omit<ExerciseDay, 'id' | 'createdAt'>>) => {
			return exerciseDayDb.updateExerciseDay(id, updates);
		},
		remove: async (id: number) => {
			return exerciseDayDb.deleteExerciseDay(id);
		},
		getById: async (id: number) => {
			return exerciseDayDb.getExerciseDay(id);
		},
		updateRotationOrder: async (orderedIds: number[]) => {
			return exerciseDayDb.updateRotationOrder(orderedIds);
		},
		addExercise: async (dayId: number, exerciseId: number, numberOfSets: number) => {
			return exerciseDayDb.addExerciseToDay(dayId, exerciseId, numberOfSets);
		},
		removeExercise: async (dayId: number, exerciseId: number) => {
			return exerciseDayDb.removeExerciseFromDay(dayId, exerciseId);
		},
		updateExerciseSets: async (dayId: number, exerciseId: number, numberOfSets: number) => {
			return exerciseDayDb.updateExerciseSets(dayId, exerciseId, numberOfSets);
		},
		reorderExercises: async (dayId: number, orderedExerciseIds: number[]) => {
			return exerciseDayDb.reorderExercisesInDay(dayId, orderedExerciseIds);
		}
	};
}

export const exerciseDays = createExerciseDaysStore();

// Derived store: exercise days grouped by category
export const exerciseDaysByCategory = derived(exerciseDays, ($exerciseDays) => {
	const grouped = new Map<ExerciseDayCategory, ExerciseDay[]>();

	for (const day of $exerciseDays) {
		const list = grouped.get(day.category) || [];
		list.push(day);
		grouped.set(day.category, list);
	}

	return grouped;
});

// Derived store: exercise day lookup by ID
export const exerciseDaysById = derived(exerciseDays, ($exerciseDays) => {
	return new Map($exerciseDays.map(d => [d.id!, d]));
});
