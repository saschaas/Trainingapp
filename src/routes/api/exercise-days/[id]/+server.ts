import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getExerciseDay, updateExerciseDay, deleteExerciseDay } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const exerciseDay = getExerciseDay(id);
		if (!exerciseDay) {
			return json({ error: 'Exercise day not found' }, { status: 404 });
		}

		return json(exerciseDay);
	} catch (error) {
		console.error('GET /api/exercise-days/[id] error:', error);
		return json({ error: 'Failed to fetch exercise day' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const existing = getExerciseDay(id);
		if (!existing) {
			return json({ error: 'Exercise day not found' }, { status: 404 });
		}

		const body = await request.json();
		const updated = updateExerciseDay(id, body);
		return json(updated);
	} catch (error) {
		console.error('PUT /api/exercise-days/[id] error:', error);
		return json({ error: 'Failed to update exercise day' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const existing = getExerciseDay(id);
		if (!existing) {
			return json({ error: 'Exercise day not found' }, { status: 404 });
		}

		deleteExerciseDay(id);
		return json({ success: true });
	} catch (error) {
		console.error('DELETE /api/exercise-days/[id] error:', error);
		return json({ error: 'Failed to delete exercise day' }, { status: 500 });
	}
};
