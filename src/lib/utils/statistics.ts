import type { Training, TrainingStats, ExerciseStats, Exercise } from '$lib/types';
import { calculateExerciseVolume } from './volume';
import { calculateMaxValues } from './averages';

/**
 * Calculate overall training statistics
 */
export function calculateTrainingStats(trainings: Training[]): TrainingStats {
	const now = Date.now();
	const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
	const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

	const totalSessions = trainings.length;
	const totalVolume = trainings.reduce((sum, t) => sum + t.totalVolume, 0);
	const avgVolumePerSession = totalSessions > 0 ? Math.round(totalVolume / totalSessions) : 0;

	const sessionsThisWeek = trainings.filter(t => t.date >= oneWeekAgo).length;
	const sessionsThisMonth = trainings.filter(t => t.date >= oneMonthAgo).length;

	const { currentStreak, longestStreak } = calculateStreaks(trainings);

	return {
		totalSessions,
		totalVolume,
		avgVolumePerSession,
		currentStreak,
		longestStreak,
		sessionsThisWeek,
		sessionsThisMonth
	};
}

/**
 * Calculate workout streaks (consecutive days with at least one workout)
 */
function calculateStreaks(trainings: Training[]): { currentStreak: number; longestStreak: number } {
	if (trainings.length === 0) {
		return { currentStreak: 0, longestStreak: 0 };
	}

	// Get unique training dates (start of day)
	const trainingDates = [...new Set(
		trainings.map(t => {
			const date = new Date(t.date);
			date.setHours(0, 0, 0, 0);
			return date.getTime();
		})
	)].sort((a, b) => b - a); // Sort descending

	if (trainingDates.length === 0) {
		return { currentStreak: 0, longestStreak: 0 };
	}

	const oneDay = 24 * 60 * 60 * 1000;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayTime = today.getTime();

	// Calculate current streak
	let currentStreak = 0;
	const mostRecentTraining = trainingDates[0];

	// Check if most recent training is today or yesterday
	if (mostRecentTraining >= todayTime - oneDay) {
		currentStreak = 1;
		for (let i = 1; i < trainingDates.length; i++) {
			const expectedDate = trainingDates[i - 1] - oneDay;
			if (trainingDates[i] === expectedDate) {
				currentStreak++;
			} else {
				break;
			}
		}
	}

	// Calculate longest streak
	let longestStreak = trainingDates.length > 0 ? 1 : 0;
	let currentRun = 1;

	for (let i = 1; i < trainingDates.length; i++) {
		const diff = trainingDates[i - 1] - trainingDates[i];
		if (diff === oneDay) {
			currentRun++;
			longestStreak = Math.max(longestStreak, currentRun);
		} else {
			currentRun = 1;
		}
	}

	return { currentStreak, longestStreak };
}

/**
 * Calculate statistics for a specific exercise
 */
export function calculateExerciseStats(
	trainings: Training[],
	exercise: Exercise
): ExerciseStats {
	const exerciseId = exercise.id!;

	// Filter trainings that contain this exercise
	const relevantTrainings = trainings.filter(t =>
		t.sets.some(s => s.exerciseId === exerciseId)
	);

	const totalVolume = relevantTrainings.reduce((sum, t) =>
		sum + calculateExerciseVolume(t.sets, exerciseId), 0
	);

	const { maxWeight, maxWeightDate } = calculateMaxValues(trainings, exerciseId);

	// Calculate average weight and reps
	let totalWeight = 0;
	let totalReps = 0;
	let setCount = 0;

	for (const training of relevantTrainings) {
		for (const set of training.sets) {
			if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null && set.repetitions !== null) {
				totalWeight += set.weight;
				totalReps += set.repetitions;
				setCount++;
			}
		}
	}

	return {
		exerciseId,
		exerciseName: exercise.name,
		totalVolume,
		maxWeight,
		maxWeightDate: maxWeightDate || 0,
		avgWeight: setCount > 0 ? Math.round(totalWeight / setCount * 10) / 10 : 0,
		avgReps: setCount > 0 ? Math.round(totalReps / setCount * 10) / 10 : 0,
		sessionCount: relevantTrainings.length
	};
}

/**
 * Calculate volume over time for charting
 */
export function calculateVolumeOverTime(
	trainings: Training[],
	limit: number = 30
): Array<{ date: number; volume: number; exerciseDayId: number }> {
	const sorted = [...trainings].sort((a, b) => a.date - b.date);
	return sorted.slice(-limit).map(t => ({
		date: t.date,
		volume: t.totalVolume,
		exerciseDayId: t.exerciseDayId
	}));
}

/**
 * Calculate volume by muscle category
 */
export function calculateVolumeByCategory(
	trainings: Training[],
	exercisesById: Map<number, Exercise>
): Map<string, number> {
	const volumeByCategory = new Map<string, number>();

	for (const training of trainings) {
		for (const set of training.sets) {
			if (!set.skipped && set.weight !== null && set.repetitions !== null) {
				const exercise = exercisesById.get(set.exerciseId);
				if (exercise) {
					const volume = set.weight * set.repetitions;
					volumeByCategory.set(
						exercise.category,
						(volumeByCategory.get(exercise.category) || 0) + volume
					);
				}
			}
		}
	}

	return volumeByCategory;
}

/**
 * Get personal records for an exercise
 */
export function getPersonalRecords(
	trainings: Training[],
	exerciseId: number
): { weight: { value: number; date: number } | null; volume: { value: number; date: number } | null } {
	let maxWeight: { value: number; date: number } | null = null;
	let maxVolume: { value: number; date: number } | null = null;

	for (const training of trainings) {
		let exerciseVolume = 0;

		for (const set of training.sets) {
			if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null && set.repetitions !== null) {
				if (!maxWeight || set.weight > maxWeight.value) {
					maxWeight = { value: set.weight, date: training.date };
				}
				exerciseVolume += set.weight * set.repetitions;
			}
		}

		if (exerciseVolume > 0 && (!maxVolume || exerciseVolume > maxVolume.value)) {
			maxVolume = { value: exerciseVolume, date: training.date };
		}
	}

	return { weight: maxWeight, volume: maxVolume };
}
