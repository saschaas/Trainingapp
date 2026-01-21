import { db } from './index';
import type { Exercise, ExerciseCategory } from '$lib/types';

// Create a new exercise
export async function createExercise(
	name: string,
	category: ExerciseCategory,
	focus: string
): Promise<number> {
	const now = Date.now();
	return db.exercises.add({
		name,
		category,
		focus,
		createdAt: now,
		updatedAt: now
	});
}

// Get all exercises
export async function getAllExercises(): Promise<Exercise[]> {
	return db.exercises.orderBy('name').toArray();
}

// Get exercises by category
export async function getExercisesByCategory(category: ExerciseCategory): Promise<Exercise[]> {
	return db.exercises.where('category').equals(category).toArray();
}

// Get a single exercise by ID
export async function getExercise(id: number): Promise<Exercise | undefined> {
	return db.exercises.get(id);
}

// Update an exercise
export async function updateExercise(
	id: number,
	updates: Partial<Omit<Exercise, 'id' | 'createdAt'>>
): Promise<void> {
	await db.exercises.update(id, {
		...updates,
		updatedAt: Date.now()
	});
}

// Delete an exercise
export async function deleteExercise(id: number): Promise<void> {
	await db.exercises.delete(id);
}

// Check if exercise name exists
export async function exerciseNameExists(name: string, excludeId?: number): Promise<boolean> {
	const exercise = await db.exercises.where('name').equalsIgnoreCase(name).first();
	if (!exercise) return false;
	if (excludeId && exercise.id === excludeId) return false;
	return true;
}
