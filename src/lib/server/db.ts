import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Ensure data directory exists
const dataDir = resolve('./data');
if (!existsSync(dataDir)) {
	mkdirSync(dataDir, { recursive: true });
}

const dbPath = resolve(dataDir, 'fitness.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
	CREATE TABLE IF NOT EXISTS exercises (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		category TEXT NOT NULL,
		focus TEXT DEFAULT '',
		createdAt INTEGER NOT NULL,
		updatedAt INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS exercise_days (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		category TEXT NOT NULL,
		exercises TEXT NOT NULL DEFAULT '[]',
		rotationOrder INTEGER DEFAULT 0,
		createdAt INTEGER NOT NULL,
		updatedAt INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS trainings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		exerciseDayId INTEGER NOT NULL,
		date INTEGER NOT NULL,
		sets TEXT NOT NULL DEFAULT '[]',
		totalVolume REAL DEFAULT 0,
		completed INTEGER DEFAULT 1
	);

	CREATE TABLE IF NOT EXISTS settings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		lastExerciseDayId INTEGER,
		theme TEXT DEFAULT 'dark',
		restTimerDuration INTEGER DEFAULT 120,
		restTimerVolume INTEGER DEFAULT 5
	);
`);

// Initialize default settings row if empty
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
	db.prepare(
		'INSERT INTO settings (lastExerciseDayId, theme, restTimerDuration, restTimerVolume) VALUES (NULL, ?, ?, ?)'
	).run('dark', 120, 5);
}

// --- Helper functions ---

// Exercises
export function getAllExercises() {
	return db.prepare('SELECT * FROM exercises ORDER BY name').all();
}

export function getExercise(id: number) {
	return db.prepare('SELECT * FROM exercises WHERE id = ?').get(id);
}

export function createExercise(name: string, category: string, focus: string = '') {
	const now = Date.now();
	const result = db.prepare(
		'INSERT INTO exercises (name, category, focus, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
	).run(name, category, focus, now, now);
	return { id: result.lastInsertRowid, name, category, focus, createdAt: now, updatedAt: now };
}

export function updateExercise(id: number, updates: Record<string, unknown>) {
	const fields: string[] = [];
	const values: unknown[] = [];
	for (const [key, value] of Object.entries(updates)) {
		if (key === 'id' || key === 'createdAt') continue;
		fields.push(`${key} = ?`);
		values.push(value);
	}
	fields.push('updatedAt = ?');
	values.push(Date.now());
	values.push(id);
	db.prepare(`UPDATE exercises SET ${fields.join(', ')} WHERE id = ?`).run(...values);
	return getExercise(id);
}

export function deleteExercise(id: number) {
	return db.prepare('DELETE FROM exercises WHERE id = ?').run(id);
}

// Exercise Days
export function getAllExerciseDays() {
	const rows = db.prepare('SELECT * FROM exercise_days ORDER BY rotationOrder').all() as Record<string, unknown>[];
	return rows.map(parseExerciseDayRow);
}

export function getExerciseDay(id: number) {
	const row = db.prepare('SELECT * FROM exercise_days WHERE id = ?').get(id) as Record<string, unknown> | undefined;
	return row ? parseExerciseDayRow(row) : undefined;
}

export function createExerciseDay(name: string, category: string, exercises: unknown[], rotationOrder?: number) {
	const now = Date.now();
	let order = rotationOrder;
	if (order === undefined) {
		const maxRow = db.prepare('SELECT MAX(rotationOrder) as maxOrder FROM exercise_days').get() as { maxOrder: number | null };
		order = maxRow.maxOrder !== null ? maxRow.maxOrder + 1 : 0;
	}
	const exercisesJson = JSON.stringify(exercises);
	const result = db.prepare(
		'INSERT INTO exercise_days (name, category, exercises, rotationOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
	).run(name, category, exercisesJson, order, now, now);
	return { id: result.lastInsertRowid, name, category, exercises, rotationOrder: order, createdAt: now, updatedAt: now };
}

export function updateExerciseDay(id: number, updates: Record<string, unknown>) {
	const fields: string[] = [];
	const values: unknown[] = [];
	for (const [key, value] of Object.entries(updates)) {
		if (key === 'id' || key === 'createdAt') continue;
		if (key === 'exercises') {
			fields.push('exercises = ?');
			values.push(JSON.stringify(value));
		} else {
			fields.push(`${key} = ?`);
			values.push(value);
		}
	}
	fields.push('updatedAt = ?');
	values.push(Date.now());
	values.push(id);
	db.prepare(`UPDATE exercise_days SET ${fields.join(', ')} WHERE id = ?`).run(...values);
	return getExerciseDay(id);
}

export function deleteExerciseDay(id: number) {
	return db.prepare('DELETE FROM exercise_days WHERE id = ?').run(id);
}

function parseExerciseDayRow(row: Record<string, unknown>) {
	return {
		...row,
		exercises: typeof row.exercises === 'string' ? JSON.parse(row.exercises) : row.exercises
	};
}

// Trainings
export function getAllTrainings(exerciseDayId?: number, limit?: number) {
	let query = 'SELECT * FROM trainings';
	const params: unknown[] = [];

	if (exerciseDayId !== undefined) {
		query += ' WHERE exerciseDayId = ?';
		params.push(exerciseDayId);
	}

	query += ' ORDER BY date DESC';

	if (limit !== undefined) {
		query += ' LIMIT ?';
		params.push(limit);
	}

	const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
	return rows.map(parseTrainingRow);
}

export function getTraining(id: number) {
	const row = db.prepare('SELECT * FROM trainings WHERE id = ?').get(id) as Record<string, unknown> | undefined;
	return row ? parseTrainingRow(row) : undefined;
}

export function createTraining(exerciseDayId: number, sets: unknown[], totalVolume: number) {
	const now = Date.now();
	const setsJson = JSON.stringify(sets);
	const result = db.prepare(
		'INSERT INTO trainings (exerciseDayId, date, sets, totalVolume, completed) VALUES (?, ?, ?, ?, 1)'
	).run(exerciseDayId, now, setsJson, totalVolume);
	return { id: result.lastInsertRowid, exerciseDayId, date: now, sets, totalVolume, completed: 1 };
}

export function updateTraining(id: number, updates: Record<string, unknown>) {
	const fields: string[] = [];
	const values: unknown[] = [];
	for (const [key, value] of Object.entries(updates)) {
		if (key === 'id') continue;
		if (key === 'sets') {
			fields.push('sets = ?');
			values.push(JSON.stringify(value));
		} else {
			fields.push(`${key} = ?`);
			values.push(value);
		}
	}
	values.push(id);
	db.prepare(`UPDATE trainings SET ${fields.join(', ')} WHERE id = ?`).run(...values);
	return getTraining(id);
}

export function deleteTraining(id: number) {
	return db.prepare('DELETE FROM trainings WHERE id = ?').run(id);
}

function parseTrainingRow(row: Record<string, unknown>) {
	return {
		...row,
		sets: typeof row.sets === 'string' ? JSON.parse(row.sets) : row.sets
	};
}

// Settings
export function getSettings() {
	return db.prepare('SELECT * FROM settings LIMIT 1').get();
}

export function updateSettings(updates: Record<string, unknown>) {
	const fields: string[] = [];
	const values: unknown[] = [];
	for (const [key, value] of Object.entries(updates)) {
		if (key === 'id') continue;
		fields.push(`${key} = ?`);
		values.push(value);
	}
	if (fields.length === 0) return getSettings();
	db.prepare(`UPDATE settings SET ${fields.join(', ')} WHERE id = 1`).run(...values);
	return getSettings();
}

export default db;
