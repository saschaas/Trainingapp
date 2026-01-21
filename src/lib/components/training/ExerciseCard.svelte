<script lang="ts">
	import SetInput from './SetInput.svelte';
	import QuickFillButtons from './QuickFillButtons.svelte';
	import ExerciseProgressBar from './ExerciseProgressBar.svelte';
	import type { Exercise, SetData, SetAverage, Training } from '$lib/types';
	import { calculateExerciseVolume } from '$lib/utils/volume';
	import { calculateSetAverages, getLastTrainingSets, calculateExerciseAverage } from '$lib/utils/averages';

	interface Props {
		exercise: Exercise;
		sets: SetData[];
		trainings: Training[];
		onUpdateSet: (setNumber: number, updates: Partial<SetData>) => void;
		onSkipSet: (setNumber: number) => void;
		onUnskipSet: (setNumber: number) => void;
		onFillFirst: () => void;
		onFillLast: (lastSets: SetData[]) => void;
		cardIndex: number;
		isLastCard: boolean;
		nextExerciseFirstInputId?: string;
	}

	let {
		exercise,
		sets,
		trainings,
		onUpdateSet,
		onSkipSet,
		onUnskipSet,
		onFillFirst,
		onFillLast,
		cardIndex,
		isLastCard,
		nextExerciseFirstInputId
	}: Props = $props();

	// Calculate averages from past trainings
	let setAverages = $derived(calculateSetAverages(trainings, exercise.id!, 5));
	let exerciseAverage = $derived(calculateExerciseAverage(trainings, exercise.id!, 5));
	let lastSets = $derived(getLastTrainingSets(trainings, exercise.id!));

	// Calculate current volume
	let currentVolume = $derived(calculateExerciseVolume(sets, exercise.id!));

	// Get last training volume for this exercise
	let lastVolume = $derived(() => {
		if (trainings.length === 0) return 0;
		for (const training of trainings) {
			const vol = calculateExerciseVolume(training.sets, exercise.id!);
			if (vol > 0) return vol;
		}
		return 0;
	});

	function handleFillLast() {
		onFillLast(lastSets);
	}

	function getInputId(exerciseId: number, setNumber: number, field: 'weight' | 'reps'): string {
		return `input-${exerciseId}-${setNumber}-${field}`;
	}

	function getNextInputId(setIndex: number, totalSets: number): string | undefined {
		// Next set in same exercise
		if (setIndex < totalSets - 1) {
			return getInputId(exercise.id!, sets[setIndex + 1].setNumber, 'weight');
		}
		// First set of next exercise
		return nextExerciseFirstInputId;
	}
</script>

<div class="exercise-card">
	<div class="card-header">
		<div class="exercise-info">
			<h3 class="exercise-name">{exercise.name}</h3>
			<span class="exercise-focus">{exercise.focus}</span>
		</div>
		<QuickFillButtons
			onFillFirst={onFillFirst}
			onFillLast={handleFillLast}
			hasLastData={lastSets.length > 0}
		/>
	</div>

	<div class="sets-container">
		{#each sets.sort((a, b) => a.setNumber - b.setNumber) as setData, index}
			<SetInput
				{setData}
				average={setAverages.get(setData.setNumber)}
				onUpdate={(updates) => onUpdateSet(setData.setNumber, updates)}
				onSkip={() => onSkipSet(setData.setNumber)}
				onUnskip={() => onUnskipSet(setData.setNumber)}
				weightInputId={getInputId(exercise.id!, setData.setNumber, 'weight')}
				repsInputId={getInputId(exercise.id!, setData.setNumber, 'reps')}
				nextInputId={getNextInputId(index, sets.length)}
			/>
		{/each}
	</div>

	<div class="card-footer">
		<ExerciseProgressBar
			{currentVolume}
			lastVolume={lastVolume()}
			averageVolume={exerciseAverage.avgVolume}
		/>
	</div>
</div>

<style>
	.exercise-card {
		background: var(--color-surface);
		border-radius: 12px;
		border: 1px solid var(--color-border);
		overflow: hidden;
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1rem;
		gap: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.exercise-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.exercise-name {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.exercise-focus {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.sets-container {
		display: flex;
		gap: 0.5rem;
		padding: 1rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.sets-container::-webkit-scrollbar {
		height: 4px;
	}

	.sets-container::-webkit-scrollbar-track {
		background: var(--color-surface-dark);
	}

	.sets-container::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 2px;
	}

	.card-footer {
		padding: 0.75rem 1rem;
		background: var(--color-surface-dark);
	}
</style>
