import { writable, derived } from 'svelte/store';
import { liveQuery } from 'dexie';
import { db } from '$lib/db';
import * as exerciseDb from '$lib/db/exercises';
import type { Exercise, ExerciseCategory } from '$lib/types';

// Create a store that syncs with the database using liveQuery
function createExercisesStore() {
	const { subscribe, set } = writable<Exercise[]>([]);

	// Subscribe to live database updates
	if (typeof window !== 'undefined') {
		const observable = liveQuery(() => db.exercises.orderBy('name').toArray());
		observable.subscribe({
			next: (exercises) => set(exercises),
			error: (err) => console.error('Error loading exercises:', err)
		});
	}

	return {
		subscribe,
		add: async (name: string, category: ExerciseCategory, focus: string) => {
			return exerciseDb.createExercise(name, category, focus);
		},
		update: async (id: number, updates: Partial<Omit<Exercise, 'id' | 'createdAt'>>) => {
			return exerciseDb.updateExercise(id, updates);
		},
		remove: async (id: number) => {
			return exerciseDb.deleteExercise(id);
		},
		getById: async (id: number) => {
			return exerciseDb.getExercise(id);
		},
		checkNameExists: async (name: string, excludeId?: number) => {
			return exerciseDb.exerciseNameExists(name, excludeId);
		}
	};
}

export const exercises = createExercisesStore();

// Derived store: exercises grouped by category
export const exercisesByCategory = derived(exercises, ($exercises) => {
	const grouped = new Map<ExerciseCategory, Exercise[]>();

	for (const exercise of $exercises) {
		const list = grouped.get(exercise.category) || [];
		list.push(exercise);
		grouped.set(exercise.category, list);
	}

	return grouped;
});

// Derived store: exercise lookup by ID
export const exercisesById = derived(exercises, ($exercises) => {
	return new Map($exercises.map(e => [e.id!, e]));
});
