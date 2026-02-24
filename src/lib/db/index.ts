import Dexie, { type EntityTable } from 'dexie';
import type { Exercise, ExerciseDay, Training, AppSettings } from '$lib/types';

// Define the database
class FitnessDB extends Dexie {
	exercises!: EntityTable<Exercise, 'id'>;
	exerciseDays!: EntityTable<ExerciseDay, 'id'>;
	trainings!: EntityTable<Training, 'id'>;
	settings!: EntityTable<AppSettings, 'id'>;

	constructor() {
		super('FitnessDB');

		this.version(1).stores({
			exercises: '++id, name, category, createdAt',
			exerciseDays: '++id, name, category, rotationOrder, createdAt',
			trainings: '++id, exerciseDayId, date, completed',
			settings: '++id'
		});

		this.version(2).stores({
			exercises: '++id, name, category, createdAt',
			exerciseDays: '++id, name, category, rotationOrder, createdAt',
			trainings: '++id, exerciseDayId, date, completed',
			settings: '++id'
		}).upgrade(tx => {
			return tx.table('settings').toCollection().modify(settings => {
				settings.restTimerDuration = 120;
			});
		});

		this.version(3).stores({
			exercises: '++id, name, category, createdAt',
			exerciseDays: '++id, name, category, rotationOrder, createdAt',
			trainings: '++id, exerciseDayId, date, completed',
			settings: '++id'
		}).upgrade(tx => {
			return tx.table('settings').toCollection().modify(settings => {
				settings.restTimerVolume = 5;
			});
		});
	}
}

export const db = new FitnessDB();

// Initialize default settings if not exists
export async function initializeSettings(): Promise<AppSettings> {
	const existing = await db.settings.toCollection().first();
	if (existing) {
		return existing;
	}

	const defaultSettings: AppSettings = {
		lastExerciseDayId: null,
		theme: 'dark',
		restTimerDuration: 120,
		restTimerVolume: 5
	};

	const id = await db.settings.add(defaultSettings);
	return { ...defaultSettings, id };
}

// Get current settings
export async function getSettings(): Promise<AppSettings | undefined> {
	return db.settings.toCollection().first();
}

// Update settings
export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
	const settings = await db.settings.toCollection().first();
	if (settings?.id) {
		await db.settings.update(settings.id, updates);
	}
}
