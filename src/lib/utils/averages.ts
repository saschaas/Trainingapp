import type { Training, SetData, SetAverage } from '$lib/types';

/**
 * Calculate average weight and reps for each set number of an exercise
 * across the last N trainings
 */
export function calculateSetAverages(
	trainings: Training[],
	exerciseId: number,
	limit: number = 5
): Map<number, SetAverage> {
	const averages = new Map<number, SetAverage>();

	// Take only the most recent trainings
	const recentTrainings = trainings.slice(0, limit);

	// Collect all sets for this exercise
	const setsByNumber = new Map<number, { weights: number[]; reps: number[] }>();

	for (const training of recentTrainings) {
		for (const set of training.sets) {
			if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null && set.repetitions !== null) {
				if (!setsByNumber.has(set.setNumber)) {
					setsByNumber.set(set.setNumber, { weights: [], reps: [] });
				}
				const data = setsByNumber.get(set.setNumber)!;
				data.weights.push(set.weight);
				data.reps.push(set.repetitions);
			}
		}
	}

	// Calculate averages
	for (const [setNumber, data] of setsByNumber) {
		const avgWeight = data.weights.length > 0
			? Math.round(data.weights.reduce((a, b) => a + b, 0) / data.weights.length * 10) / 10
			: 0;
		const avgReps = data.reps.length > 0
			? Math.round(data.reps.reduce((a, b) => a + b, 0) / data.reps.length * 10) / 10
			: 0;

		averages.set(setNumber, {
			exerciseId,
			setNumber,
			avgWeight,
			avgReps,
			count: data.weights.length
		});
	}

	return averages;
}

/**
 * Calculate overall average for an exercise (total volume / sessions)
 */
export function calculateExerciseAverage(
	trainings: Training[],
	exerciseId: number,
	limit: number = 5
): { avgVolume: number; avgWeight: number; avgReps: number; sessionCount: number } {
	const recentTrainings = trainings.slice(0, limit);

	let totalVolume = 0;
	let totalWeight = 0;
	let totalReps = 0;
	let setCount = 0;

	for (const training of recentTrainings) {
		for (const set of training.sets) {
			if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null && set.repetitions !== null) {
				totalVolume += set.weight * set.repetitions;
				totalWeight += set.weight;
				totalReps += set.repetitions;
				setCount++;
			}
		}
	}

	return {
		avgVolume: recentTrainings.length > 0 ? Math.round(totalVolume / recentTrainings.length) : 0,
		avgWeight: setCount > 0 ? Math.round(totalWeight / setCount * 10) / 10 : 0,
		avgReps: setCount > 0 ? Math.round(totalReps / setCount * 10) / 10 : 0,
		sessionCount: recentTrainings.length
	};
}

/**
 * Get the last training's sets for an exercise
 * Used for "Letzte Werte" quick fill
 */
export function getLastTrainingSets(
	trainings: Training[],
	exerciseId: number
): SetData[] {
	for (const training of trainings) {
		const exerciseSets = training.sets.filter(s => s.exerciseId === exerciseId);
		if (exerciseSets.length > 0) {
			return exerciseSets.sort((a, b) => a.setNumber - b.setNumber);
		}
	}
	return [];
}

/**
 * Format average display (current / average)
 */
export function formatWithAverage(current: number | null, average: number): string {
	const currentStr = current !== null ? current.toString() : '-';
	if (average === 0) return currentStr;
	return `${currentStr} / ${average}`;
}

/**
 * Get placeholder text with average
 */
export function getAveragePlaceholder(average: number): string {
	if (average === 0) return '';
	return `~${average}`;
}

/**
 * Calculate max values for an exercise across all trainings
 */
export function calculateMaxValues(
	trainings: Training[],
	exerciseId: number
): { maxWeight: number; maxReps: number; maxVolume: number; maxWeightDate: number | null } {
	let maxWeight = 0;
	let maxReps = 0;
	let maxVolume = 0;
	let maxWeightDate: number | null = null;

	for (const training of trainings) {
		let exerciseVolume = 0;

		for (const set of training.sets) {
			if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null && set.repetitions !== null) {
				if (set.weight > maxWeight) {
					maxWeight = set.weight;
					maxWeightDate = training.date;
				}
				if (set.repetitions > maxReps) {
					maxReps = set.repetitions;
				}
				exerciseVolume += set.weight * set.repetitions;
			}
		}

		if (exerciseVolume > maxVolume) {
			maxVolume = exerciseVolume;
		}
	}

	return { maxWeight, maxReps, maxVolume, maxWeightDate };
}
