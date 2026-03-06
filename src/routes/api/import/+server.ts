import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { exercises, exerciseDays, trainings, settings } = body;

		if (!Array.isArray(exercises) || !Array.isArray(exerciseDays) || !Array.isArray(trainings)) {
			return json({ error: 'exercises, exerciseDays, and trainings arrays are required' }, { status: 400 });
		}

		// Run everything in a transaction
		const importData = db.transaction(() => {
			// Clear existing data
			db.prepare('DELETE FROM trainings').run();
			db.prepare('DELETE FROM exercise_days').run();
			db.prepare('DELETE FROM exercises').run();

			// Map old IDs to new IDs
			const exerciseIdMap = new Map<number, number>();
			const dayIdMap = new Map<number, number>();

			// Import exercises
			const insertExercise = db.prepare(
				'INSERT INTO exercises (name, category, focus, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
			);
			for (const ex of exercises) {
				const result = insertExercise.run(
					ex.name,
					ex.category,
					ex.focus || '',
					ex.createdAt || Date.now(),
					ex.updatedAt || Date.now()
				);
				if (ex.id !== undefined) {
					exerciseIdMap.set(ex.id, Number(result.lastInsertRowid));
				}
			}

			// Import exercise days (remap exercise IDs inside exercises array)
			const insertDay = db.prepare(
				'INSERT INTO exercise_days (name, category, exercises, rotationOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
			);
			for (const day of exerciseDays) {
				const mappedExercises = (day.exercises || []).map((e: { exerciseId: number; numberOfSets: number; position: number }) => ({
					...e,
					exerciseId: exerciseIdMap.get(e.exerciseId) ?? e.exerciseId
				}));
				const result = insertDay.run(
					day.name,
					day.category,
					JSON.stringify(mappedExercises),
					day.rotationOrder ?? 0,
					day.createdAt || Date.now(),
					day.updatedAt || Date.now()
				);
				if (day.id !== undefined) {
					dayIdMap.set(day.id, Number(result.lastInsertRowid));
				}
			}

			// Import trainings (remap exerciseDayId and exerciseId in sets)
			const insertTraining = db.prepare(
				'INSERT INTO trainings (exerciseDayId, date, sets, totalVolume, completed) VALUES (?, ?, ?, ?, ?)'
			);
			for (const t of trainings) {
				const mappedDayId = dayIdMap.get(t.exerciseDayId) ?? t.exerciseDayId;
				const mappedSets = (t.sets || []).map((s: { exerciseId: number }) => ({
					...s,
					exerciseId: exerciseIdMap.get(s.exerciseId) ?? s.exerciseId
				}));
				insertTraining.run(
					mappedDayId,
					t.date || Date.now(),
					JSON.stringify(mappedSets),
					t.totalVolume || 0,
					t.completed ? 1 : 0
				);
			}

			// Update settings if provided
			if (settings && typeof settings === 'object') {
				const lastDayId = settings.lastExerciseDayId != null
					? (dayIdMap.get(settings.lastExerciseDayId) ?? settings.lastExerciseDayId)
					: null;
				db.prepare(
					'UPDATE settings SET lastExerciseDayId = ?, restTimerDuration = ?, restTimerVolume = ? WHERE id = 1'
				).run(
					lastDayId,
					settings.restTimerDuration ?? 120,
					settings.restTimerVolume ?? 5
				);
			}

			return {
				exercises: exerciseIdMap.size,
				exerciseDays: dayIdMap.size,
				trainings: trainings.length
			};
		});

		const result = importData();
		return json({
			success: true,
			imported: result
		});
	} catch (error) {
		console.error('POST /api/import error:', error);
		return json({ error: 'Failed to import data' }, { status: 500 });
	}
};
