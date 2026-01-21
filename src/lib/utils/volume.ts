import type { SetData, Training } from '$lib/types';

/**
 * Calculate volume for a single set
 * Volume = weight * repetitions (skipped sets = 0)
 */
export function calculateSetVolume(set: SetData): number {
	if (set.skipped || set.weight === null || set.repetitions === null) {
		return 0;
	}
	return set.weight * set.repetitions;
}

/**
 * Calculate total volume for multiple sets
 */
export function calculateTotalVolume(sets: SetData[]): number {
	return sets.reduce((total, set) => total + calculateSetVolume(set), 0);
}

/**
 * Calculate volume for a specific exercise from a list of sets
 */
export function calculateExerciseVolume(sets: SetData[], exerciseId: number): number {
	return sets
		.filter(set => set.exerciseId === exerciseId)
		.reduce((total, set) => total + calculateSetVolume(set), 0);
}

/**
 * Calculate volume breakdown by exercise
 */
export function calculateVolumeByExercise(sets: SetData[]): Map<number, number> {
	const volumeByExercise = new Map<number, number>();

	for (const set of sets) {
		const exerciseId = set.exerciseId;
		const setVolume = calculateSetVolume(set);
		volumeByExercise.set(
			exerciseId,
			(volumeByExercise.get(exerciseId) || 0) + setVolume
		);
	}

	return volumeByExercise;
}

/**
 * Calculate average volume per training for a specific exercise day
 */
export function calculateAverageVolume(trainings: Training[]): number {
	if (trainings.length === 0) return 0;

	const totalVolume = trainings.reduce((sum, t) => sum + t.totalVolume, 0);
	return Math.round(totalVolume / trainings.length);
}

/**
 * Format volume number with thousand separators
 */
export function formatVolume(volume: number): string {
	return volume.toLocaleString('de-DE');
}

/**
 * Calculate volume comparison (current vs reference)
 * Returns percentage difference
 */
export function calculateVolumeComparison(current: number, reference: number): number {
	if (reference === 0) return 0;
	return Math.round(((current - reference) / reference) * 100);
}

/**
 * Get volume comparison text
 */
export function getVolumeComparisonText(current: number, reference: number): string {
	const diff = current - reference;
	const percentage = calculateVolumeComparison(current, reference);

	if (diff === 0) return 'gleich';
	if (diff > 0) return `+${formatVolume(diff)} (+${percentage}%)`;
	return `${formatVolume(diff)} (${percentage}%)`;
}
