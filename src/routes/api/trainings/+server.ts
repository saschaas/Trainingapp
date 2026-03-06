import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllTrainings, createTraining } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const exerciseDayIdParam = url.searchParams.get('exerciseDayId');
		const limitParam = url.searchParams.get('limit');

		const exerciseDayId = exerciseDayIdParam ? parseInt(exerciseDayIdParam) : undefined;
		const limit = limitParam ? parseInt(limitParam) : undefined;

		if (exerciseDayIdParam && isNaN(exerciseDayId!)) {
			return json({ error: 'Invalid exerciseDayId' }, { status: 400 });
		}
		if (limitParam && isNaN(limit!)) {
			return json({ error: 'Invalid limit' }, { status: 400 });
		}

		const trainings = getAllTrainings(exerciseDayId, limit);
		return json(trainings);
	} catch (error) {
		console.error('GET /api/trainings error:', error);
		return json({ error: 'Failed to fetch trainings' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { exerciseDayId, sets, totalVolume } = body;

		if (exerciseDayId === undefined || !sets) {
			return json({ error: 'exerciseDayId and sets are required' }, { status: 400 });
		}

		const training = createTraining(exerciseDayId, sets, totalVolume || 0);
		return json(training, { status: 201 });
	} catch (error) {
		console.error('POST /api/trainings error:', error);
		return json({ error: 'Failed to create training' }, { status: 500 });
	}
};
