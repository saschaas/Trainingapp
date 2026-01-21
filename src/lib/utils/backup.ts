import { db } from '$lib/db';
import type { Exercise, ExerciseDay, Training, AppSettings } from '$lib/types';

export interface BackupData {
	version: number;
	exportDate: number;
	exercises: Exercise[];
	exerciseDays: ExerciseDay[];
	trainings: Training[];
	settings: AppSettings | null;
}

const CURRENT_VERSION = 1;

/**
 * Export all data to a backup object
 */
export async function exportData(): Promise<BackupData> {
	const [exercises, exerciseDays, trainings, settings] = await Promise.all([
		db.exercises.toArray(),
		db.exerciseDays.toArray(),
		db.trainings.toArray(),
		db.settings.toCollection().first()
	]);

	return {
		version: CURRENT_VERSION,
		exportDate: Date.now(),
		exercises,
		exerciseDays,
		trainings,
		settings: settings || null
	};
}

/**
 * Export data and trigger file download
 */
export async function downloadBackup(): Promise<void> {
	const data = await exportData();
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json' });

	const date = new Date().toISOString().split('T')[0];
	const filename = `fitness-backup-${date}.json`;

	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Validate backup data structure
 */
export function validateBackup(data: unknown): data is BackupData {
	if (!data || typeof data !== 'object') return false;

	const backup = data as Record<string, unknown>;

	if (typeof backup.version !== 'number') return false;
	if (typeof backup.exportDate !== 'number') return false;
	if (!Array.isArray(backup.exercises)) return false;
	if (!Array.isArray(backup.exerciseDays)) return false;
	if (!Array.isArray(backup.trainings)) return false;

	// Basic validation of array contents
	for (const exercise of backup.exercises) {
		if (typeof exercise !== 'object' || exercise === null) return false;
		const e = exercise as Record<string, unknown>;
		if (typeof e.name !== 'string') return false;
		if (typeof e.category !== 'string') return false;
	}

	for (const day of backup.exerciseDays) {
		if (typeof day !== 'object' || day === null) return false;
		const d = day as Record<string, unknown>;
		if (typeof d.name !== 'string') return false;
		if (typeof d.category !== 'string') return false;
		if (!Array.isArray(d.exercises)) return false;
	}

	for (const training of backup.trainings) {
		if (typeof training !== 'object' || training === null) return false;
		const t = training as Record<string, unknown>;
		if (typeof t.exerciseDayId !== 'number') return false;
		if (typeof t.date !== 'number') return false;
		if (!Array.isArray(t.sets)) return false;
	}

	return true;
}

/**
 * Import data from backup (replace mode)
 */
export async function importDataReplace(backup: BackupData): Promise<void> {
	await db.transaction('rw', [db.exercises, db.exerciseDays, db.trainings, db.settings], async () => {
		// Clear all existing data
		await Promise.all([
			db.exercises.clear(),
			db.exerciseDays.clear(),
			db.trainings.clear(),
			db.settings.clear()
		]);

		// Import new data
		if (backup.exercises.length > 0) {
			await db.exercises.bulkAdd(backup.exercises);
		}
		if (backup.exerciseDays.length > 0) {
			await db.exerciseDays.bulkAdd(backup.exerciseDays);
		}
		if (backup.trainings.length > 0) {
			await db.trainings.bulkAdd(backup.trainings);
		}
		if (backup.settings) {
			await db.settings.add(backup.settings);
		}
	});
}

/**
 * Import data from backup (merge mode)
 * Existing data is kept, only new items are added
 */
export async function importDataMerge(backup: BackupData): Promise<{
	exercisesAdded: number;
	exerciseDaysAdded: number;
	trainingsAdded: number;
}> {
	let exercisesAdded = 0;
	let exerciseDaysAdded = 0;
	let trainingsAdded = 0;

	await db.transaction('rw', [db.exercises, db.exerciseDays, db.trainings], async () => {
		// Get existing names/ids
		const existingExercises = await db.exercises.toArray();
		const existingExerciseNames = new Set(existingExercises.map(e => e.name.toLowerCase()));

		const existingDays = await db.exerciseDays.toArray();
		const existingDayNames = new Set(existingDays.map(d => d.name.toLowerCase()));

		const existingTrainings = await db.trainings.toArray();
		const existingTrainingKeys = new Set(
			existingTrainings.map(t => `${t.exerciseDayId}-${t.date}`)
		);

		// Map old exercise IDs to new ones
		const exerciseIdMap = new Map<number, number>();

		// Import exercises that don't exist
		for (const exercise of backup.exercises) {
			if (!existingExerciseNames.has(exercise.name.toLowerCase())) {
				const oldId = exercise.id;
				const { id, ...exerciseData } = exercise;
				const newId = await db.exercises.add(exerciseData as Exercise);
				if (oldId !== undefined) {
					exerciseIdMap.set(oldId, newId);
				}
				exercisesAdded++;
			} else {
				// Map to existing exercise
				const existing = existingExercises.find(
					e => e.name.toLowerCase() === exercise.name.toLowerCase()
				);
				if (existing?.id !== undefined && exercise.id !== undefined) {
					exerciseIdMap.set(exercise.id, existing.id);
				}
			}
		}

		// Map old exercise day IDs to new ones
		const dayIdMap = new Map<number, number>();

		// Import exercise days that don't exist
		for (const day of backup.exerciseDays) {
			if (!existingDayNames.has(day.name.toLowerCase())) {
				const oldId = day.id;
				const { id, ...dayData } = day;

				// Update exercise IDs in the day's exercises
				const updatedExercises = dayData.exercises.map(e => ({
					...e,
					exerciseId: exerciseIdMap.get(e.exerciseId) || e.exerciseId
				}));

				const newId = await db.exerciseDays.add({
					...dayData,
					exercises: updatedExercises
				} as ExerciseDay);

				if (oldId !== undefined) {
					dayIdMap.set(oldId, newId);
				}
				exerciseDaysAdded++;
			} else {
				// Map to existing day
				const existing = existingDays.find(
					d => d.name.toLowerCase() === day.name.toLowerCase()
				);
				if (existing?.id !== undefined && day.id !== undefined) {
					dayIdMap.set(day.id, existing.id);
				}
			}
		}

		// Import trainings that don't exist
		for (const training of backup.trainings) {
			const newDayId = dayIdMap.get(training.exerciseDayId) || training.exerciseDayId;
			const key = `${newDayId}-${training.date}`;

			if (!existingTrainingKeys.has(key)) {
				const { id, ...trainingData } = training;

				// Update IDs in training
				const updatedSets = trainingData.sets.map(s => ({
					...s,
					exerciseId: exerciseIdMap.get(s.exerciseId) || s.exerciseId
				}));

				await db.trainings.add({
					...trainingData,
					exerciseDayId: newDayId,
					sets: updatedSets
				} as Training);

				trainingsAdded++;
			}
		}
	});

	return { exercisesAdded, exerciseDaysAdded, trainingsAdded };
}

/**
 * Read file and parse JSON
 */
export function readBackupFile(file: File): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse(reader.result as string);
				resolve(data);
			} catch (e) {
				reject(new Error('Invalid JSON file'));
			}
		};
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsText(file);
	});
}
