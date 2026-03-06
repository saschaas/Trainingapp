import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTraining, updateTraining, deleteTraining } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const training = getTraining(id);
		if (!training) {
			return json({ error: 'Training not found' }, { status: 404 });
		}

		return json(training);
	} catch (error) {
		console.error('GET /api/trainings/[id] error:', error);
		return json({ error: 'Failed to fetch training' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const existing = getTraining(id);
		if (!existing) {
			return json({ error: 'Training not found' }, { status: 404 });
		}

		const body = await request.json();
		const updated = updateTraining(id, body);
		return json(updated);
	} catch (error) {
		console.error('PUT /api/trainings/[id] error:', error);
		return json({ error: 'Failed to update training' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid id' }, { status: 400 });
		}

		const existing = getTraining(id);
		if (!existing) {
			return json({ error: 'Training not found' }, { status: 404 });
		}

		deleteTraining(id);
		return json({ success: true });
	} catch (error) {
		console.error('DELETE /api/trainings/[id] error:', error);
		return json({ error: 'Failed to delete training' }, { status: 500 });
	}
};
