import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getExercise, updateExercise, deleteExercise } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const exercise = getExercise(id);
		if (!exercise) {
			return json({ error: 'Exercise not found' }, { status: 404 });
		}

		return json(exercise);
	} catch (error) {
		console.error('GET /api/exercises/[id] error:', error);
		return json({ error: 'Failed to fetch exercise' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const existing = getExercise(id);
		if (!existing) {
			return json({ error: 'Exercise not found' }, { status: 404 });
		}

		const body = await request.json();
		const updated = updateExercise(id, body);
		return json(updated);
	} catch (error) {
		console.error('PUT /api/exercises/[id] error:', error);
		return json({ error: 'Failed to update exercise' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const existing = getExercise(id);
		if (!existing) {
			return json({ error: 'Exercise not found' }, { status: 404 });
		}

		deleteExercise(id);
		return json({ success: true });
	} catch (error) {
		console.error('DELETE /api/exercises/[id] error:', error);
		return json({ error: 'Failed to delete exercise' }, { status: 500 });
	}
};
