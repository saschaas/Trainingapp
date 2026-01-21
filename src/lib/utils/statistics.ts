import type {
	Training,
	TrainingStats,
	ExerciseStats,
	Exercise,
	ExerciseDay,
	ExerciseDayVolumeData,
	ExerciseVolumeBreakdown,
	ProgressTrend,
	NextSessionRecommendation,
	SetProgressionData
} from '$lib/types';
import { calculateExerciseVolume, calculateSetVolume } from './volume';
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

/**
 * Calculate volume history for an exercise-day
 */
export function calculateExerciseDayVolumeHistory(
	trainings: Training[],
	exerciseDayId: number,
	limit: number = 30
): ExerciseDayVolumeData[] {
	const dayTrainings = trainings
		.filter(t => t.exerciseDayId === exerciseDayId)
		.sort((a, b) => a.date - b.date)
		.slice(-limit);

	// Track PRs for counting
	const exerciseMaxWeights = new Map<number, number>();

	return dayTrainings.map(training => {
		let prCount = 0;

		for (const set of training.sets) {
			if (!set.skipped && set.weight !== null && set.repetitions !== null) {
				const currentMax = exerciseMaxWeights.get(set.exerciseId) || 0;
				if (set.weight > currentMax) {
					exerciseMaxWeights.set(set.exerciseId, set.weight);
					prCount++;
				}
			}
		}

		return {
			date: training.date,
			volume: training.totalVolume,
			prCount
		};
	});
}

/**
 * Get top exercises by volume within an exercise-day
 */
export function getTopExercisesByVolume(
	trainings: Training[],
	exerciseDayId: number,
	exercisesById: Map<number, Exercise>,
	limit: number = 10
): ExerciseVolumeBreakdown[] {
	const dayTrainings = trainings.filter(t => t.exerciseDayId === exerciseDayId);

	const volumeByExercise = new Map<number, number>();

	for (const training of dayTrainings) {
		for (const set of training.sets) {
			if (!set.skipped && set.weight !== null && set.repetitions !== null) {
				const volume = set.weight * set.repetitions;
				volumeByExercise.set(
					set.exerciseId,
					(volumeByExercise.get(set.exerciseId) || 0) + volume
				);
			}
		}
	}

	const totalVolume = Array.from(volumeByExercise.values()).reduce((sum, v) => sum + v, 0);

	const results: ExerciseVolumeBreakdown[] = [];

	for (const [exerciseId, volume] of volumeByExercise) {
		const exercise = exercisesById.get(exerciseId);
		if (exercise) {
			results.push({
				exerciseId,
				exerciseName: exercise.name,
				category: exercise.category,
				totalVolume: volume,
				percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0
			});
		}
	}

	return results
		.sort((a, b) => b.totalVolume - a.totalVolume)
		.slice(0, limit);
}

/**
 * Calculate progress trend for an exercise
 */
export function calculateExerciseProgressTrend(
	trainings: Training[],
	exerciseId: number,
	exerciseName: string,
	windowSize: number = 5
): ProgressTrend {
	const relevantTrainings = trainings
		.filter(t => t.sets.some(s => s.exerciseId === exerciseId))
		.sort((a, b) => b.date - a.date);

	if (relevantTrainings.length < 2) {
		return {
			exerciseId,
			exerciseName,
			trend: 'stable',
			percentageChange: 0,
			lastPRDate: null,
			sessionCount: relevantTrainings.length
		};
	}

	// Calculate max weights for recent vs older window
	const recentTrainings = relevantTrainings.slice(0, Math.min(windowSize, relevantTrainings.length));
	const olderTrainings = relevantTrainings.slice(windowSize, windowSize * 2);

	const getMaxWeight = (trainings: Training[]): number => {
		let max = 0;
		for (const training of trainings) {
			for (const set of training.sets) {
				if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null) {
					max = Math.max(max, set.weight);
				}
			}
		}
		return max;
	};

	const recentMax = getMaxWeight(recentTrainings);
	const olderMax = olderTrainings.length > 0 ? getMaxWeight(olderTrainings) : recentMax;

	const percentageChange = olderMax > 0 ? ((recentMax - olderMax) / olderMax) * 100 : 0;

	let trend: 'improving' | 'stable' | 'declining';
	if (percentageChange > 3) {
		trend = 'improving';
	} else if (percentageChange < -3) {
		trend = 'declining';
	} else {
		trend = 'stable';
	}

	// Find last PR date
	let lastPRDate: number | null = null;
	let runningMax = 0;
	const sortedAsc = [...relevantTrainings].sort((a, b) => a.date - b.date);

	for (const training of sortedAsc) {
		for (const set of training.sets) {
			if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null) {
				if (set.weight > runningMax) {
					runningMax = set.weight;
					lastPRDate = training.date;
				}
			}
		}
	}

	return {
		exerciseId,
		exerciseName,
		trend,
		percentageChange,
		lastPRDate,
		sessionCount: relevantTrainings.length
	};
}

/**
 * Get exercises that need attention (plateaued or declining)
 */
export function getExercisesNeedingAttention(
	trainings: Training[],
	exercises: Exercise[],
	threshold: number = -3
): ProgressTrend[] {
	const needsAttention: ProgressTrend[] = [];

	for (const exercise of exercises) {
		if (!exercise.id) continue;

		const trend = calculateExerciseProgressTrend(trainings, exercise.id, exercise.name);

		if (trend.sessionCount >= 3 && (trend.trend === 'declining' || trend.percentageChange <= threshold)) {
			needsAttention.push(trend);
		}
	}

	return needsAttention.sort((a, b) => a.percentageChange - b.percentageChange);
}

/**
 * Get recommendation for next session
 */
export function getNextSessionRecommendation(
	trainings: Training[],
	exerciseDays: ExerciseDay[],
	exercises: Exercise[],
	exercisesById: Map<number, Exercise>
): NextSessionRecommendation {
	if (exerciseDays.length === 0) {
		return {
			exerciseDay: null,
			focusExercises: [],
			reason: 'Keine Trainingstage konfiguriert'
		};
	}

	// Find next exercise day in rotation (based on last training)
	const lastTraining = trainings[0];
	let nextDayIndex = 0;

	if (lastTraining) {
		const lastDayIndex = exerciseDays.findIndex(d => d.id === lastTraining.exerciseDayId);
		if (lastDayIndex >= 0) {
			nextDayIndex = (lastDayIndex + 1) % exerciseDays.length;
		}
	}

	const nextDay = exerciseDays[nextDayIndex];

	// Find exercises that need focus in this day
	const dayTrainings = trainings.filter(t => t.exerciseDayId === nextDay.id);
	const focusExercises: Array<{ exerciseId: number; exerciseName: string; reason: string }> = [];

	for (const config of nextDay.exercises) {
		const exercise = exercisesById.get(config.exerciseId);
		if (!exercise) continue;

		const trend = calculateExerciseProgressTrend(dayTrainings, config.exerciseId, exercise.name);

		if (trend.trend === 'declining') {
			focusExercises.push({
				exerciseId: config.exerciseId,
				exerciseName: exercise.name,
				reason: 'Rückläufige Leistung'
			});
		} else if (trend.trend === 'stable' && trend.sessionCount >= 5) {
			focusExercises.push({
				exerciseId: config.exerciseId,
				exerciseName: exercise.name,
				reason: 'Plateau erreicht'
			});
		}
	}

	return {
		exerciseDay: nextDay,
		focusExercises: focusExercises.slice(0, 3),
		reason: lastTraining
			? `Nächster Tag in der Rotation nach ${exerciseDays.find(d => d.id === lastTraining.exerciseDayId)?.name || 'letztem Training'}`
			: 'Erster Tag in der Rotation'
	};
}

/**
 * Calculate set-by-set progression for an exercise
 */
export function calculateSetProgression(
	trainings: Training[],
	exerciseId: number,
	setNumber: number,
	limit: number = 20
): SetProgressionData[] {
	const relevantTrainings = trainings
		.filter(t => t.sets.some(s => s.exerciseId === exerciseId && s.setNumber === setNumber))
		.sort((a, b) => a.date - b.date)
		.slice(-limit);

	const results: SetProgressionData[] = [];

	for (const training of relevantTrainings) {
		const set = training.sets.find(
			s => s.exerciseId === exerciseId && s.setNumber === setNumber
		);

		if (set && !set.skipped && set.weight !== null && set.repetitions !== null) {
			results.push({
				date: training.date,
				weight: set.weight,
				reps: set.repetitions,
				volume: set.weight * set.repetitions
			});
		}
	}

	return results;
}

/**
 * Get unique set numbers for an exercise across all trainings
 */
export function getExerciseSetNumbers(trainings: Training[], exerciseId: number): number[] {
	const setNumbers = new Set<number>();

	for (const training of trainings) {
		for (const set of training.sets) {
			if (set.exerciseId === exerciseId && !set.skipped) {
				setNumbers.add(set.setNumber);
			}
		}
	}

	return Array.from(setNumbers).sort((a, b) => a - b);
}

/**
 * Get exercises with improving trends (top performers)
 */
export function getTopImprovers(
	trainings: Training[],
	exercises: Exercise[],
	limit: number = 5
): ProgressTrend[] {
	const improvers: ProgressTrend[] = [];

	for (const exercise of exercises) {
		if (!exercise.id) continue;

		const trend = calculateExerciseProgressTrend(trainings, exercise.id, exercise.name);

		if (trend.sessionCount >= 3 && trend.trend === 'improving') {
			improvers.push(trend);
		}
	}

	return improvers.sort((a, b) => b.percentageChange - a.percentageChange).slice(0, limit);
}

/**
 * Count personal records in a time period
 */
export function countPRsInPeriod(
	trainings: Training[],
	exerciseDayId: number | null,
	startDate: number
): number {
	let filteredTrainings = trainings.filter(t => t.date >= startDate);
	if (exerciseDayId !== null) {
		filteredTrainings = filteredTrainings.filter(t => t.exerciseDayId === exerciseDayId);
	}

	// Sort by date ascending
	filteredTrainings.sort((a, b) => a.date - b.date);

	const exerciseMaxWeights = new Map<number, number>();
	let prCount = 0;

	// First, build up max weights from trainings before the start date
	const olderTrainings = trainings
		.filter(t => t.date < startDate)
		.filter(t => exerciseDayId === null || t.exerciseDayId === exerciseDayId);

	for (const training of olderTrainings) {
		for (const set of training.sets) {
			if (!set.skipped && set.weight !== null) {
				const currentMax = exerciseMaxWeights.get(set.exerciseId) || 0;
				if (set.weight > currentMax) {
					exerciseMaxWeights.set(set.exerciseId, set.weight);
				}
			}
		}
	}

	// Now count PRs in the period
	for (const training of filteredTrainings) {
		for (const set of training.sets) {
			if (!set.skipped && set.weight !== null) {
				const currentMax = exerciseMaxWeights.get(set.exerciseId) || 0;
				if (set.weight > currentMax) {
					exerciseMaxWeights.set(set.exerciseId, set.weight);
					prCount++;
				}
			}
		}
	}

	return prCount;
}
