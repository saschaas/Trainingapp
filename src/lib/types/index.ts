// Exercise categories
export type ExerciseCategory = 'Brust' | 'Schulter' | 'Trizeps' | 'Bauch' | 'Rücken' | 'Bizeps' | 'Beine';

// Exercise day categories
export type ExerciseDayCategory = 'push' | 'pull' | 'legs' | 'full-body';

// Exercise definition
export interface Exercise {
	id?: number;
	name: string;
	category: ExerciseCategory;
	focus: string;
	createdAt: number;
	updatedAt: number;
}

// Exercise configuration within a day
export interface ExerciseConfig {
	exerciseId: number;
	numberOfSets: number;
	position: number;
}

// Exercise day definition
export interface ExerciseDay {
	id?: number;
	name: string;
	category: ExerciseDayCategory;
	exercises: ExerciseConfig[];
	rotationOrder: number;
	createdAt: number;
	updatedAt: number;
}

// Individual set data
export interface SetData {
	exerciseId: number;
	setNumber: number;
	weight: number | null;
	repetitions: number | null;
	skipped: boolean;
}

// Completed training session
export interface Training {
	id?: number;
	exerciseDayId: number;
	date: number;
	sets: SetData[];
	totalVolume: number;
	completed: boolean;
}

// App settings
export interface AppSettings {
	id?: number;
	lastExerciseDayId: number | null;
	theme: 'dark' | 'light';
}

// For current training state
export interface CurrentTrainingState {
	exerciseDayId: number | null;
	exerciseDay: ExerciseDay | null;
	sets: Map<string, SetData>; // key: `${exerciseId}-${setNumber}`
	startedAt: number | null;
	isActive: boolean;
}

// For statistics
export interface ExerciseStats {
	exerciseId: number;
	exerciseName: string;
	totalVolume: number;
	maxWeight: number;
	maxWeightDate: number;
	avgWeight: number;
	avgReps: number;
	sessionCount: number;
}

export interface TrainingStats {
	totalSessions: number;
	totalVolume: number;
	avgVolumePerSession: number;
	currentStreak: number;
	longestStreak: number;
	sessionsThisWeek: number;
	sessionsThisMonth: number;
}

// For averages calculation
export interface SetAverage {
	exerciseId: number;
	setNumber: number;
	avgWeight: number;
	avgReps: number;
	count: number;
}
