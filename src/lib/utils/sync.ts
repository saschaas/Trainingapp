import { exportData } from './backup';

/**
 * Sync all local IndexedDB data to the server-side database.
 * This makes data available to the Android app.
 */
export async function syncToServer(): Promise<void> {
	const data = await exportData();

	const response = await fetch('/api/import', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			exercises: data.exercises,
			exerciseDays: data.exerciseDays,
			trainings: data.trainings,
			settings: data.settings
		})
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Sync failed: ${text}`);
	}
}
