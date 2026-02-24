import { writable, derived } from 'svelte/store';
import { getSettings } from '$lib/db';

interface RestTimerState {
	isRunning: boolean;
	isFinished: boolean;
	timeLeft: number;
	duration: number;
}

const initialState: RestTimerState = {
	isRunning: false,
	isFinished: false,
	timeLeft: 0,
	duration: 0
};

let intervalId: ReturnType<typeof setInterval> | null = null;

// Reuse a single AudioContext to avoid browser inconsistencies with rapid create/close cycles
let sharedCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
	if (!AudioCtx) return null;

	if (!sharedCtx || sharedCtx.state === 'closed') {
		sharedCtx = new AudioCtx();
	}
	return sharedCtx;
}

// Must be called during a user gesture (click, keydown) to unlock audio for later playback
export function warmUpAudio() {
	const ctx = getAudioContext();
	if (ctx && ctx.state === 'suspended') {
		ctx.resume();
	}
}

export function playChime(volume: number) {
	if (volume <= 0) return;

	const ctx = getAudioContext();
	if (!ctx) return;

	// Disconnect previous master gain to immediately silence any in-progress chime
	if (masterGain) {
		masterGain.disconnect();
	}

	const schedule = () => {
		const mg = ctx.createGain();
		mg.gain.value = 1;
		mg.connect(ctx.destination);
		masterGain = mg;

		const gain = (volume / 30) * 2.1;

		const notes = [
			{ freq: 523.25, start: 0, dur: 0.45 },
			{ freq: 659.25, start: 0.18, dur: 0.5 }
		];

		for (const note of notes) {
			const osc = ctx.createOscillator();
			const vol = ctx.createGain();

			osc.type = 'sine';
			osc.frequency.value = note.freq;

			vol.gain.setValueAtTime(0, ctx.currentTime + note.start);
			vol.gain.linearRampToValueAtTime(gain, ctx.currentTime + note.start + 0.02);
			vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.start + note.dur);

			osc.connect(vol);
			vol.connect(mg);

			osc.start(ctx.currentTime + note.start);
			osc.stop(ctx.currentTime + note.start + note.dur);
		}
	};

	if (ctx.state === 'suspended') {
		ctx.resume().then(schedule);
	} else {
		schedule();
	}
}

function createRestTimerStore() {
	const { subscribe, set, update } = writable<RestTimerState>(initialState);

	function clearTimer() {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	return {
		subscribe,

		start(duration: number) {
			clearTimer();
			set({
				isRunning: true,
				isFinished: false,
				timeLeft: duration,
				duration
			});

			intervalId = setInterval(() => {
				let shouldNotify = false;

				update(state => {
					const newTimeLeft = state.timeLeft - 1;
					if (newTimeLeft <= 0) {
						shouldNotify = true;
						return { ...state, isRunning: false, isFinished: true, timeLeft: 0 };
					}
					return { ...state, timeLeft: newTimeLeft };
				});

				if (shouldNotify) {
					clearTimer();
					// Read volume fresh from DB so it always reflects the latest setting
					getSettings().then(settings => {
						const vol = settings?.restTimerVolume ?? 5;
						playChime(vol);
					});
					if (typeof navigator !== 'undefined' && navigator.vibrate) {
						navigator.vibrate([200, 100, 200]);
					}
				}
			}, 1000);
		},

		dismiss() {
			clearTimer();
			set(initialState);
		}
	};
}

export const restTimer = createRestTimerStore();

export const timerProgress = derived(restTimer, ($timer) =>
	$timer.duration > 0 ? 1 - $timer.timeLeft / $timer.duration : 0
);

export const formattedTime = derived(restTimer, ($timer) => {
	const minutes = Math.floor($timer.timeLeft / 60);
	const seconds = $timer.timeLeft % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});
