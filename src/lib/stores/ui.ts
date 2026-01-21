import { writable } from 'svelte/store';
import type { ExerciseDayCategory } from '$lib/types';

export type TabId = 'push' | 'pull' | 'legs' | 'statistics';

interface UIState {
	activeTab: TabId;
	showConfigModal: boolean;
	showExerciseForm: boolean;
	showExerciseDayForm: boolean;
	editingExerciseId: number | null;
	editingExerciseDayId: number | null;
	showDeleteConfirm: boolean;
	deleteTarget: { type: 'exercise' | 'exerciseDay' | 'training'; id: number } | null;
}

const initialState: UIState = {
	activeTab: 'push',
	showConfigModal: false,
	showExerciseForm: false,
	showExerciseDayForm: false,
	editingExerciseId: null,
	editingExerciseDayId: null,
	showDeleteConfirm: false,
	deleteTarget: null
};

function createUIStore() {
	const { subscribe, set, update } = writable<UIState>(initialState);

	return {
		subscribe,

		setActiveTab: (tab: TabId) => {
			update(state => ({ ...state, activeTab: tab }));
		},

		openConfigModal: () => {
			update(state => ({ ...state, showConfigModal: true }));
		},

		closeConfigModal: () => {
			update(state => ({ ...state, showConfigModal: false }));
		},

		openExerciseForm: (exerciseId?: number) => {
			update(state => ({
				...state,
				showExerciseForm: true,
				editingExerciseId: exerciseId ?? null
			}));
		},

		closeExerciseForm: () => {
			update(state => ({
				...state,
				showExerciseForm: false,
				editingExerciseId: null
			}));
		},

		openExerciseDayForm: (exerciseDayId?: number) => {
			update(state => ({
				...state,
				showExerciseDayForm: true,
				editingExerciseDayId: exerciseDayId ?? null
			}));
		},

		closeExerciseDayForm: () => {
			update(state => ({
				...state,
				showExerciseDayForm: false,
				editingExerciseDayId: null
			}));
		},

		showDeleteConfirmation: (type: 'exercise' | 'exerciseDay' | 'training', id: number) => {
			update(state => ({
				...state,
				showDeleteConfirm: true,
				deleteTarget: { type, id }
			}));
		},

		hideDeleteConfirmation: () => {
			update(state => ({
				...state,
				showDeleteConfirm: false,
				deleteTarget: null
			}));
		},

		reset: () => set(initialState)
	};
}

export const ui = createUIStore();

// Map from category to tab
export function categoryToTab(category: ExerciseDayCategory): TabId {
	switch (category) {
		case 'push': return 'push';
		case 'pull': return 'pull';
		case 'legs': return 'legs';
		case 'full-body': return 'push'; // Default full-body to push tab
		default: return 'push';
	}
}
