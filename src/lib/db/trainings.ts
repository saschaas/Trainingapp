import { db } from './index';
import type { Training, SetData } from '$lib/types';

// Create a new training session
export async function createTraining(
	exerciseDayId: number,
	sets: SetData[],
	totalVolume: number
): Promise<number> {
	return db.trainings.add({
		exerciseDayId,
		date: Date.now(),
		sets,
		totalVolume,
		completed: true
	});
}

// Get all trainings
export async function getAllTrainings(): Promise<Training[]> {
	return db.trainings.orderBy('date').reverse().toArray();
}

// Get trainings for a specific exercise day
export async function getTrainingsByExerciseDay(exerciseDayId: number): Promise<Training[]> {
	return db.trainings
		.where('exerciseDayId')
		.equals(exerciseDayId)
		.reverse()
		.sortBy('date');
}

// Get the most recent training
export async function getLastTraining(): Promise<Training | undefined> {
	return db.trainings.orderBy('date').last();
}

// Get the most recent training for a specific exercise day
export async function getLastTrainingForDay(exerciseDayId: number): Promise<Training | undefined> {
	const trainings = await db.trainings
		.where('exerciseDayId')
		.equals(exerciseDayId)
		.reverse()
		.sortBy('date');
	return trainings[0];
}

// Get trainings within a date range
export async function getTrainingsInRange(startDate: number, endDate: number): Promise<Training[]> {
	return db.trainings
		.where('date')
		.between(startDate, endDate)
		.toArray();
}

// Get the last N trainings for a specific exercise day
export async function getRecentTrainingsForDay(
	exerciseDayId: number,
	limit: number
): Promise<Training[]> {
	const trainings = await db.trainings
		.where('exerciseDayId')
		.equals(exerciseDayId)
		.reverse()
		.sortBy('date');
	return trainings.slice(0, limit);
}

// Get a single training by ID
export async function getTraining(id: number): Promise<Training | undefined> {
	return db.trainings.get(id);
}

// Update a training
export async function updateTraining(
	id: number,
	updates: Partial<Omit<Training, 'id'>>
): Promise<void> {
	await db.trainings.update(id, updates);
}

// Delete a training
export async function deleteTraining(id: number): Promise<void> {
	await db.trainings.delete(id);
}

// Get total training count
export async function getTrainingCount(): Promise<number> {
	return db.trainings.count();
}

// Get trainings containing a specific exercise
export async function getTrainingsWithExercise(exerciseId: number): Promise<Training[]> {
	const allTrainings = await db.trainings.toArray();
	return allTrainings.filter(t =>
		t.sets.some(s => s.exerciseId === exerciseId)
	);
}

// Get all sets for a specific exercise across all trainings
export async function getSetsForExercise(exerciseId: number): Promise<Array<SetData & { trainingDate: number }>> {
	const trainings = await getTrainingsWithExercise(exerciseId);
	const sets: Array<SetData & { trainingDate: number }> = [];

	for (const training of trainings) {
		for (const set of training.sets) {
			if (set.exerciseId === exerciseId) {
				sets.push({ ...set, trainingDate: training.date });
			}
		}
	}

	return sets.sort((a, b) => b.trainingDate - a.trainingDate);
}
