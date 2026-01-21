import type { ExerciseCategory, ExerciseDayCategory } from '$lib/types';

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
	'Brust',
	'Schulter',
	'Trizeps',
	'Bauch',
	'Rücken',
	'Bizeps',
	'Beine'
];

export const EXERCISE_DAY_CATEGORIES: ExerciseDayCategory[] = [
	'push',
	'pull',
	'legs',
	'full-body'
];

export const EXERCISE_DAY_LABELS: Record<ExerciseDayCategory, string> = {
	'push': 'PUSH',
	'pull': 'PULL',
	'legs': 'BEINE',
	'full-body': 'GANZKÖRPER'
};

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
	'Brust': '#ef4444',
	'Schulter': '#f97316',
	'Trizeps': '#eab308',
	'Bauch': '#22c55e',
	'Rücken': '#3b82f6',
	'Bizeps': '#8b5cf6',
	'Beine': '#ec4899'
};

// Common focus areas per category
export const FOCUS_OPTIONS: Record<ExerciseCategory, string[]> = {
	'Brust': ['Brust-komplett', 'Obere Brust', 'Untere Brust', 'Innere Brust'],
	'Schulter': ['Vordere Schulter', 'Seitliche Schulter', 'Hintere Schulter', 'Schulter-komplett'],
	'Trizeps': ['Langer Kopf', 'Lateraler Kopf', 'Medialer Kopf', 'Trizeps-komplett'],
	'Bauch': ['Obere Bauchmuskeln', 'Untere Bauchmuskeln', 'Seitliche Bauchmuskeln', 'Core'],
	'Rücken': ['Lat', 'Mittlerer-Rücken', 'Unterer-Rücken', 'Trapez', 'Rücken-komplett'],
	'Bizeps': ['Langer Kopf', 'Kurzer Kopf', 'Brachialis', 'Bizeps-komplett'],
	'Beine': ['Quadrizeps', 'Beinbizeps', 'Waden', 'Gesäß', 'Beine-komplett']
};
