import { writable, derived } from 'svelte/store';
import { liveQuery } from 'dexie';
import { db } from '$lib/db';
import * as trainingDb from '$lib/db/trainings';
import type { Training } from '$lib/types';

// Create a store that syncs with the database using liveQuery
function createTrainingHistoryStore() {
	const { subscribe, set } = writable<Training[]>([]);

	// Subscribe to live database updates
	if (typeof window !== 'undefined') {
		const observable = liveQuery(() => db.trainings.orderBy('date').reverse().toArray());
		observable.subscribe({
			next: (trainings) => set(trainings),
			error: (err) => console.error('Error loading training history:', err)
		});
	}

	return {
		subscribe,
		add: async (exerciseDayId: number, sets: Training['sets'], totalVolume: number) => {
			return trainingDb.createTraining(exerciseDayId, sets, totalVolume);
		},
		getById: async (id: number) => {
			return trainingDb.getTraining(id);
		},
		getByExerciseDay: async (exerciseDayId: number) => {
			return trainingDb.getTrainingsByExerciseDay(exerciseDayId);
		},
		getRecent: async (exerciseDayId: number, limit: number) => {
			return trainingDb.getRecentTrainingsForDay(exerciseDayId, limit);
		},
		getLast: async () => {
			return trainingDb.getLastTraining();
		},
		getLastForDay: async (exerciseDayId: number) => {
			return trainingDb.getLastTrainingForDay(exerciseDayId);
		},
		remove: async (id: number) => {
			return trainingDb.deleteTraining(id);
		},
		getCount: async () => {
			return trainingDb.getTrainingCount();
		}
	};
}

export const trainingHistory = createTrainingHistoryStore();

// Derived store: trainings grouped by exercise day
export const trainingsByExerciseDay = derived(trainingHistory, ($trainings) => {
	const grouped = new Map<number, Training[]>();

	for (const training of $trainings) {
		const list = grouped.get(training.exerciseDayId) || [];
		list.push(training);
		grouped.set(training.exerciseDayId, list);
	}

	return grouped;
});

// Derived store: most recent training per exercise day
export const lastTrainingByDay = derived(trainingHistory, ($trainings) => {
	const lastByDay = new Map<number, Training>();

	// Trainings are already sorted by date descending, so first one is most recent
	for (const training of $trainings) {
		if (!lastByDay.has(training.exerciseDayId)) {
			lastByDay.set(training.exerciseDayId, training);
		}
	}

	return lastByDay;
});
