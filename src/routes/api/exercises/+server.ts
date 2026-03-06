import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllExercises, createExercise } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	try {
		const exercises = getAllExercises();
		return json(exercises);
	} catch (error) {
		console.error('GET /api/exercises error:', error);
		return json({ error: 'Failed to fetch exercises' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name, category, focus } = body;

		if (!name || !category) {
			return json({ error: 'name and category are required' }, { status: 400 });
		}

		const exercise = createExercise(name, category, focus || '');
		return json(exercise, { status: 201 });
	} catch (error) {
		console.error('POST /api/exercises error:', error);
		return json({ error: 'Failed to create exercise' }, { status: 500 });
	}
};
