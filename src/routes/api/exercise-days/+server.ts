import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllExerciseDays, createExerciseDay } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	try {
		const exerciseDays = getAllExerciseDays();
		return json(exerciseDays);
	} catch (error) {
		console.error('GET /api/exercise-days error:', error);
		return json({ error: 'Failed to fetch exercise days' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name, category, exercises, rotationOrder } = body;

		if (!name || !category) {
			return json({ error: 'name and category are required' }, { status: 400 });
		}

		const exerciseDay = createExerciseDay(name, category, exercises || [], rotationOrder);
		return json(exerciseDay, { status: 201 });
	} catch (error) {
		console.error('POST /api/exercise-days error:', error);
		return json({ error: 'Failed to create exercise day' }, { status: 500 });
	}
};
