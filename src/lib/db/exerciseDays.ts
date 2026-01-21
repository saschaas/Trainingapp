import { db } from './index';
import type { ExerciseDay, ExerciseDayCategory, ExerciseConfig } from '$lib/types';

// Create a new exercise day
export async function createExerciseDay(
	name: string,
	category: ExerciseDayCategory,
	exercises: ExerciseConfig[],
	rotationOrder?: number
): Promise<number> {
	const now = Date.now();

	// Auto-assign rotation order if not provided
	let order = rotationOrder;
	if (order === undefined) {
		const maxOrder = await db.exerciseDays.orderBy('rotationOrder').last();
		order = maxOrder ? maxOrder.rotationOrder + 1 : 0;
	}

	// Deep clone exercises to plain objects (removes Svelte reactivity proxies)
	const plainExercises = exercises.map(e => ({
		exerciseId: e.exerciseId,
		numberOfSets: e.numberOfSets,
		position: e.position
	}));

	return db.exerciseDays.add({
		name,
		category,
		exercises: plainExercises,
		rotationOrder: order,
		createdAt: now,
		updatedAt: now
	});
}

// Get all exercise days
export async function getAllExerciseDays(): Promise<ExerciseDay[]> {
	return db.exerciseDays.orderBy('rotationOrder').toArray();
}

// Get exercise days by category
export async function getExerciseDaysByCategory(category: ExerciseDayCategory): Promise<ExerciseDay[]> {
	return db.exerciseDays.where('category').equals(category).toArray();
}

// Get a single exercise day by ID
export async function getExerciseDay(id: number): Promise<ExerciseDay | undefined> {
	return db.exerciseDays.get(id);
}

// Update an exercise day
export async function updateExerciseDay(
	id: number,
	updates: Partial<Omit<ExerciseDay, 'id' | 'createdAt'>>
): Promise<void> {
	// Deep clone exercises if present to remove Svelte reactivity proxies
	const plainUpdates = { ...updates };
	if (plainUpdates.exercises) {
		plainUpdates.exercises = plainUpdates.exercises.map(e => ({
			exerciseId: e.exerciseId,
			numberOfSets: e.numberOfSets,
			position: e.position
		}));
	}

	await db.exerciseDays.update(id, {
		...plainUpdates,
		updatedAt: Date.now()
	});
}

// Delete an exercise day
export async function deleteExerciseDay(id: number): Promise<void> {
	await db.exerciseDays.delete(id);
}

// Update rotation order for multiple exercise days
export async function updateRotationOrder(orderedIds: number[]): Promise<void> {
	await db.transaction('rw', db.exerciseDays, async () => {
		for (let i = 0; i < orderedIds.length; i++) {
			await db.exerciseDays.update(orderedIds[i], {
				rotationOrder: i,
				updatedAt: Date.now()
			});
		}
	});
}

// Add exercise to a day
export async function addExerciseToDay(
	dayId: number,
	exerciseId: number,
	numberOfSets: number
): Promise<void> {
	const day = await db.exerciseDays.get(dayId);
	if (!day) return;

	const maxPosition = day.exercises.reduce((max, e) => Math.max(max, e.position), -1);

	const newExercises: ExerciseConfig[] = [
		...day.exercises,
		{
			exerciseId,
			numberOfSets,
			position: maxPosition + 1
		}
	];

	await db.exerciseDays.update(dayId, {
		exercises: newExercises,
		updatedAt: Date.now()
	});
}

// Remove exercise from a day
export async function removeExerciseFromDay(dayId: number, exerciseId: number): Promise<void> {
	const day = await db.exerciseDays.get(dayId);
	if (!day) return;

	const newExercises = day.exercises
		.filter(e => e.exerciseId !== exerciseId)
		.map((e, i) => ({ ...e, position: i }));

	await db.exerciseDays.update(dayId, {
		exercises: newExercises,
		updatedAt: Date.now()
	});
}

// Update exercise sets in a day
export async function updateExerciseSets(
	dayId: number,
	exerciseId: number,
	numberOfSets: number
): Promise<void> {
	const day = await db.exerciseDays.get(dayId);
	if (!day) return;

	const newExercises = day.exercises.map(e =>
		e.exerciseId === exerciseId ? { ...e, numberOfSets } : e
	);

	await db.exerciseDays.update(dayId, {
		exercises: newExercises,
		updatedAt: Date.now()
	});
}

// Reorder exercises within a day
export async function reorderExercisesInDay(dayId: number, orderedExerciseIds: number[]): Promise<void> {
	const day = await db.exerciseDays.get(dayId);
	if (!day) return;

	const exerciseMap = new Map(day.exercises.map(e => [e.exerciseId, e]));
	const newExercises: ExerciseConfig[] = orderedExerciseIds
		.map((id, i) => {
			const existing = exerciseMap.get(id);
			if (!existing) return null;
			return { ...existing, position: i };
		})
		.filter((e): e is ExerciseConfig => e !== null);

	await db.exerciseDays.update(dayId, {
		exercises: newExercises,
		updatedAt: Date.now()
	});
}
