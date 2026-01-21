import { writable, derived, get } from 'svelte/store';
import type { ExerciseDay, SetData, Training } from '$lib/types';
import { trainingHistory } from './trainingHistory';
import { calculateTotalVolume } from '$lib/utils/volume';

export interface CurrentTrainingState {
	exerciseDayId: number | null;
	exerciseDay: ExerciseDay | null;
	sets: Map<string, SetData>;
	startedAt: number | null;
	isActive: boolean;
}

function createSetKey(exerciseId: number, setNumber: number): string {
	return `${exerciseId}-${setNumber}`;
}

function createCurrentTrainingStore() {
	const initialState: CurrentTrainingState = {
		exerciseDayId: null,
		exerciseDay: null,
		sets: new Map(),
		startedAt: null,
		isActive: false
	};

	const { subscribe, set, update } = writable<CurrentTrainingState>(initialState);

	return {
		subscribe,

		// Start a new training session
		start: (exerciseDay: ExerciseDay) => {
			const sets = new Map<string, SetData>();

			// Initialize all sets from exercise day configuration
			for (const config of exerciseDay.exercises) {
				for (let i = 1; i <= config.numberOfSets; i++) {
					const key = createSetKey(config.exerciseId, i);
					sets.set(key, {
						exerciseId: config.exerciseId,
						setNumber: i,
						weight: null,
						repetitions: null,
						skipped: false
					});
				}
			}

			set({
				exerciseDayId: exerciseDay.id!,
				exerciseDay,
				sets,
				startedAt: Date.now(),
				isActive: true
			});
		},

		// Update a single set
		updateSet: (exerciseId: number, setNumber: number, updates: Partial<SetData>) => {
			update(state => {
				const key = createSetKey(exerciseId, setNumber);
				const existing = state.sets.get(key);
				if (existing) {
					state.sets.set(key, { ...existing, ...updates });
				}
				return { ...state, sets: new Map(state.sets) };
			});
		},

		// Skip a set
		skipSet: (exerciseId: number, setNumber: number) => {
			update(state => {
				const key = createSetKey(exerciseId, setNumber);
				const existing = state.sets.get(key);
				if (existing) {
					state.sets.set(key, { ...existing, skipped: true, weight: null, repetitions: null });
				}
				return { ...state, sets: new Map(state.sets) };
			});
		},

		// Unskip a set
		unskipSet: (exerciseId: number, setNumber: number) => {
			update(state => {
				const key = createSetKey(exerciseId, setNumber);
				const existing = state.sets.get(key);
				if (existing) {
					state.sets.set(key, { ...existing, skipped: false });
				}
				return { ...state, sets: new Map(state.sets) };
			});
		},

		// Skip all sets for an exercise
		skipExercise: (exerciseId: number) => {
			update(state => {
				for (const [key, setData] of state.sets) {
					if (setData.exerciseId === exerciseId) {
						state.sets.set(key, { ...setData, skipped: true, weight: null, repetitions: null });
					}
				}
				return { ...state, sets: new Map(state.sets) };
			});
		},

		// Fill first values (copy from first set of each exercise to all sets)
		fillFirstValues: (exerciseId: number) => {
			update(state => {
				const firstSetKey = createSetKey(exerciseId, 1);
				const firstSet = state.sets.get(firstSetKey);
				if (!firstSet || firstSet.weight === null || firstSet.repetitions === null) {
					return state;
				}

				for (const [key, setData] of state.sets) {
					if (setData.exerciseId === exerciseId && setData.setNumber > 1 && !setData.skipped) {
						state.sets.set(key, {
							...setData,
							weight: firstSet.weight,
							repetitions: firstSet.repetitions
						});
					}
				}
				return { ...state, sets: new Map(state.sets) };
			});
		},

		// Fill with last training values
		fillLastValues: (exerciseId: number, lastSets: SetData[]) => {
			update(state => {
				for (const lastSet of lastSets) {
					if (lastSet.exerciseId === exerciseId && !lastSet.skipped) {
						const key = createSetKey(lastSet.exerciseId, lastSet.setNumber);
						const existing = state.sets.get(key);
						if (existing && !existing.skipped) {
							state.sets.set(key, {
								...existing,
								weight: lastSet.weight,
								repetitions: lastSet.repetitions
							});
						}
					}
				}
				return { ...state, sets: new Map(state.sets) };
			});
		},

		// Get sets for a specific exercise
		getSetsForExercise: (state: CurrentTrainingState, exerciseId: number): SetData[] => {
			const sets: SetData[] = [];
			for (const setData of state.sets.values()) {
				if (setData.exerciseId === exerciseId) {
					sets.push(setData);
				}
			}
			return sets.sort((a, b) => a.setNumber - b.setNumber);
		},

		// Reset all inputs
		reset: () => {
			update(state => {
				for (const [key, setData] of state.sets) {
					state.sets.set(key, {
						...setData,
						weight: null,
						repetitions: null,
						skipped: false
					});
				}
				return { ...state, sets: new Map(state.sets) };
			});
		},

		// Complete and save the training
		complete: async (): Promise<number | null> => {
			const state = get({ subscribe });
			if (!state.isActive || !state.exerciseDayId) {
				return null;
			}

			const setsArray = Array.from(state.sets.values());
			const totalVolume = calculateTotalVolume(setsArray);

			const id = await trainingHistory.add(state.exerciseDayId, setsArray, totalVolume);

			// Reset to initial state
			set(initialState);

			return id;
		},

		// Cancel without saving
		cancel: () => {
			set(initialState);
		}
	};
}

export const currentTraining = createCurrentTrainingStore();

// Derived store: current total volume
export const currentVolume = derived(currentTraining, ($training) => {
	if (!$training.isActive) return 0;
	return calculateTotalVolume(Array.from($training.sets.values()));
});

// Derived store: completion percentage
export const completionPercentage = derived(currentTraining, ($training) => {
	if (!$training.isActive) return 0;

	const sets = Array.from($training.sets.values());
	const totalSets = sets.length;
	if (totalSets === 0) return 0;

	const completedSets = sets.filter(s =>
		s.skipped || (s.weight !== null && s.repetitions !== null)
	).length;

	return Math.round((completedSets / totalSets) * 100);
});
