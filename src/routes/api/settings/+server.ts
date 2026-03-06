import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSettings, updateSettings } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	try {
		const settings = getSettings();
		return json(settings);
	} catch (error) {
		console.error('GET /api/settings error:', error);
		return json({ error: 'Failed to fetch settings' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const updated = updateSettings(body);
		return json(updated);
	} catch (error) {
		console.error('PUT /api/settings error:', error);
		return json({ error: 'Failed to update settings' }, { status: 500 });
	}
};
