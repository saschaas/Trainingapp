<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/shared/Button.svelte';
	import Modal from '$lib/components/shared/Modal.svelte';
	import { downloadBackup, readBackupFile, validateBackup, importDataReplace, importDataMerge, type BackupData } from '$lib/utils/backup';
	import { getSettings, updateSettings } from '$lib/db';
	import { playChime } from '$lib/stores/restTimer';

	let showImportModal = $state(false);
	let restTimerDuration = $state(120);
	let restTimerVolume = $state(5);

	const presets = [60, 90, 120, 180, 300];

	function formatDuration(seconds: number): string {
		if (seconds % 60 === 0) return `${seconds / 60} min`;
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	async function setDuration(value: number) {
		restTimerDuration = Math.max(15, value);
		await updateSettings({ restTimerDuration });
	}

	async function setVolume(value: number) {
		restTimerVolume = Math.max(0, Math.min(30, value));
		await updateSettings({ restTimerVolume });
		playChime(restTimerVolume);
	}

	onMount(async () => {
		const settings = await getSettings();
		if (settings?.restTimerDuration) {
			restTimerDuration = settings.restTimerDuration;
		}
		if (settings?.restTimerVolume !== undefined) {
			restTimerVolume = settings.restTimerVolume;
		}
	});
	let importMode = $state<'replace' | 'merge'>('merge');
	let selectedFile = $state<File | null>(null);
	let importError = $state('');
	let importSuccess = $state('');
	let isImporting = $state(false);

	async function handleExport() {
		await downloadBackup();
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		selectedFile = target.files?.[0] || null;
		importError = '';
		importSuccess = '';
	}

	async function handleImport() {
		if (!selectedFile) {
			importError = 'Bitte wähle eine Datei aus.';
			return;
		}

		isImporting = true;
		importError = '';
		importSuccess = '';

		try {
			const data = await readBackupFile(selectedFile);

			if (!validateBackup(data)) {
				throw new Error('Ungültiges Backup-Format');
			}

			const backup = data as BackupData;

			if (importMode === 'replace') {
				await importDataReplace(backup);
				importSuccess = 'Daten wurden erfolgreich importiert (alle Daten ersetzt).';
			} else {
				const result = await importDataMerge(backup);
				importSuccess = `Import erfolgreich: ${result.exercisesAdded} Übungen, ${result.exerciseDaysAdded} Trainingstage, ${result.trainingsAdded} Trainings hinzugefügt.`;
			}

			selectedFile = null;
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Import fehlgeschlagen';
		} finally {
			isImporting = false;
		}
	}
</script>

<svelte:head>
	<title>Einstellungen - Fitness Tracker</title>
</svelte:head>

<div class="config-page">
	<header class="page-header">
		<a href="/" class="back-btn" aria-label="Zurück">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="19" y1="12" x2="5" y2="12"></line>
				<polyline points="12 19 5 12 12 5"></polyline>
			</svg>
		</a>
		<h1>Einstellungen</h1>
	</header>

	<main class="config-content">
		<section class="config-section">
			<h2>Übungen & Trainingstage</h2>
			<div class="config-links">
				<a href="/config/exercises" class="config-link">
					<div class="link-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
							<polyline points="14 2 14 8 20 8"></polyline>
							<line x1="12" y1="18" x2="12" y2="12"></line>
							<line x1="9" y1="15" x2="15" y2="15"></line>
						</svg>
					</div>
					<div class="link-text">
						<span class="link-title">Übungen verwalten</span>
						<span class="link-desc">Übungen hinzufügen, bearbeiten, löschen</span>
					</div>
					<svg class="link-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</a>

				<a href="/config/exercise-days" class="config-link">
					<div class="link-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
					</div>
					<div class="link-text">
						<span class="link-title">Trainingstage verwalten</span>
						<span class="link-desc">Push, Pull, Beine Tage konfigurieren</span>
					</div>
					<svg class="link-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</a>
			</div>
		</section>

		<section class="config-section">
			<h2>Daten</h2>
			<div class="config-links">
				<a href="/history" class="config-link">
					<div class="link-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"></circle>
							<polyline points="12 6 12 12 16 14"></polyline>
						</svg>
					</div>
					<div class="link-text">
						<span class="link-title">Trainingshistorie</span>
						<span class="link-desc">Vergangene Trainings ansehen</span>
					</div>
					<svg class="link-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</a>
			</div>
		</section>

		<section class="config-section">
			<h2>Pausentimer</h2>
			<div class="timer-setting">
				<div class="timer-row">
					<div class="timer-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="13" r="8"></circle>
							<path d="M12 9v4l2 2"></path>
							<path d="M5 3L2 6"></path>
							<path d="M22 6l-3-3"></path>
							<line x1="12" y1="1" x2="12" y2="3"></line>
							<line x1="10" y1="1" x2="14" y2="1"></line>
						</svg>
					</div>
					<div class="timer-info">
						<span class="timer-label">Pausendauer</span>
						<span class="timer-desc">Zeit zwischen Sätzen</span>
					</div>
					<div class="timer-stepper">
						<button class="stepper-btn" onclick={() => setDuration(restTimerDuration - 15)} disabled={restTimerDuration <= 15}>
							&minus;
						</button>
						<span class="stepper-value">{formatDuration(restTimerDuration)}</span>
						<button class="stepper-btn" onclick={() => setDuration(restTimerDuration + 15)}>
							+
						</button>
					</div>
				</div>
				<div class="timer-presets">
					{#each presets as preset}
						<button
							class="preset-btn"
							class:active={restTimerDuration === preset}
							onclick={() => setDuration(preset)}
						>
							{formatDuration(preset)}
						</button>
					{/each}
				</div>

				<div class="timer-divider"></div>

				<div class="timer-row">
					<div class="timer-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							{#if restTimerVolume === 0}
								<path d="M11 5L6 9H2v6h4l5 4V5z"></path>
								<line x1="23" y1="9" x2="17" y2="15"></line>
								<line x1="17" y1="9" x2="23" y2="15"></line>
							{:else if restTimerVolume <= 4}
								<path d="M11 5L6 9H2v6h4l5 4V5z"></path>
								<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
							{:else}
								<path d="M11 5L6 9H2v6h4l5 4V5z"></path>
								<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
								<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
							{/if}
						</svg>
					</div>
					<div class="timer-info">
						<span class="timer-label">Lautstärke</span>
						<span class="timer-desc">{restTimerVolume === 0 ? 'Stumm' : `Stufe ${restTimerVolume}`}</span>
					</div>
					<div class="timer-stepper">
						<button class="stepper-btn" onclick={() => setVolume(restTimerVolume - 1)} disabled={restTimerVolume <= 0}>
							&minus;
						</button>
						<span class="stepper-value">{restTimerVolume}</span>
						<button class="stepper-btn" onclick={() => setVolume(restTimerVolume + 1)} disabled={restTimerVolume >= 30}>
							+
						</button>
					</div>
				</div>

				<input
					type="range"
					min="0"
					max="30"
					step="1"
					value={restTimerVolume}
					oninput={(e) => setVolume(parseInt(e.currentTarget.value))}
					class="volume-slider"
				/>
			</div>
		</section>

		<section class="config-section">
			<h2>Backup</h2>
			<div class="backup-actions">
				<Button variant="secondary" onclick={handleExport}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="7 10 12 15 17 10"></polyline>
						<line x1="12" y1="15" x2="12" y2="3"></line>
					</svg>
					Daten exportieren
				</Button>
				<Button variant="secondary" onclick={() => showImportModal = true}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="17 8 12 3 7 8"></polyline>
						<line x1="12" y1="3" x2="12" y2="15"></line>
					</svg>
					Daten importieren
				</Button>
			</div>
		</section>
	</main>
</div>

<!-- Import Modal -->
<Modal
	open={showImportModal}
	title="Daten importieren"
	onclose={() => {
		showImportModal = false;
		selectedFile = null;
		importError = '';
		importSuccess = '';
	}}
>
	<div class="import-form">
		<div class="file-input-group">
			<label for="backup-file">Backup-Datei auswählen</label>
			<input
				type="file"
				id="backup-file"
				accept=".json"
				onchange={handleFileSelect}
			/>
		</div>

		<div class="import-mode">
			<label>Import-Modus:</label>
			<div class="mode-options">
				<label class="mode-option">
					<input type="radio" name="mode" value="merge" bind:group={importMode} />
					<span>Zusammenführen</span>
					<small>Nur neue Einträge hinzufügen</small>
				</label>
				<label class="mode-option">
					<input type="radio" name="mode" value="replace" bind:group={importMode} />
					<span>Ersetzen</span>
					<small>Alle vorhandenen Daten überschreiben</small>
				</label>
			</div>
		</div>

		{#if importError}
			<div class="import-message error">{importError}</div>
		{/if}

		{#if importSuccess}
			<div class="import-message success">{importSuccess}</div>
		{/if}
	</div>

	{#snippet actions()}
		<Button variant="secondary" onclick={() => showImportModal = false}>Abbrechen</Button>
		<Button variant="primary" onclick={handleImport} disabled={isImporting || !selectedFile}>
			{isImporting ? 'Importiert...' : 'Importieren'}
		</Button>
	{/snippet}
</Modal>

<style>
	.config-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.back-btn {
		color: var(--color-text-secondary);
		padding: 0.5rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.back-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.page-header h1 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.config-content {
		flex: 1;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.config-section h2 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.75rem;
	}

	.config-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.config-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-surface);
		border-radius: 12px;
		border: 1px solid var(--color-border);
		transition: all 0.2s ease;
	}

	.config-link:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-primary);
	}

	.link-icon {
		color: var(--color-primary);
	}

	.link-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.link-title {
		font-weight: 500;
		color: var(--color-text);
	}

	.link-desc {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.link-arrow {
		color: var(--color-text-muted);
	}

	.timer-setting {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.timer-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.timer-icon {
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.timer-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.timer-label {
		font-weight: 500;
		color: var(--color-text);
	}

	.timer-desc {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.timer-stepper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stepper-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		background: var(--color-surface-dark);
		color: var(--color-text);
		font-size: 1.1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.stepper-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.stepper-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.stepper-value {
		min-width: 3.5rem;
		text-align: center;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--color-text);
	}

	.timer-presets {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.preset-btn {
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		border: 1px solid var(--color-border);
		background: var(--color-surface-dark);
		color: var(--color-text-secondary);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.preset-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.preset-btn.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: #fff;
	}

	.timer-divider {
		height: 1px;
		background: var(--color-border);
	}

	.volume-slider {
		width: 100%;
		height: 6px;
		-webkit-appearance: none;
		appearance: none;
		background: var(--color-surface-dark);
		border-radius: 3px;
		outline: none;
		cursor: pointer;
	}

	.volume-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 2px solid var(--color-surface);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}

	.volume-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 2px solid var(--color-surface);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}

	.backup-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.import-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.file-input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.file-input-group label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.file-input-group input {
		padding: 0.5rem;
		background: var(--color-surface-dark);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
	}

	.import-mode {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.import-mode > label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.mode-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mode-option {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.75rem;
		background: var(--color-surface-dark);
		border-radius: 6px;
		cursor: pointer;
	}

	.mode-option input {
		margin-top: 0.25rem;
	}

	.mode-option span {
		font-weight: 500;
		color: var(--color-text);
	}

	.mode-option small {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.import-message {
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.import-message.error {
		background: rgba(239, 68, 68, 0.1);
		color: var(--color-danger);
	}

	.import-message.success {
		background: rgba(34, 197, 94, 0.1);
		color: var(--color-success);
	}
</style>
