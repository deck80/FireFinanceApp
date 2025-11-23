<script lang="ts">
	import { auth } from '$lib/stores/auth';

	function handleCurrencyChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		auth.updateCurrency(select.value as 'EUR' | 'USD');
	}

	function handleMaterialToggle() {
		auth.toggleMaterialValues();
	}

	function handleThemeToggle() {
		auth.toggleTheme();
	}
</script>

<div class="settings-page">
	<h1>Settings</h1>

	<div class="setting-group">
		<h2>Appearance</h2>
		<div class="setting-item">
			<div class="setting-label">
				<span>Dark Mode</span>
				<p class="setting-description">Switch between light and dark themes</p>
			</div>
			<label class="switch">
				<input type="checkbox" checked={$auth?.theme === 'dark'} onchange={handleThemeToggle} />
				<span class="slider round"></span>
			</label>
		</div>
	</div>

	<div class="setting-group">
		<h2>Preferences</h2>
		<div class="setting-item">
			<div class="setting-label">
				<label for="currency">Preferred Currency</label>
				<p class="help-text">This will update the display currency for your total wealth.</p>
			</div>
			<select id="currency" value={$auth?.preferredCurrency} onchange={handleCurrencyChange}>
				<option value="EUR">EUR (€)</option>
				<option value="USD">USD ($)</option>
			</select>
		</div>
	</div>

	<div class="setting-group">
		<label class="checkbox-label">
			<input type="checkbox" checked={$auth?.showMaterialValues} onchange={handleMaterialToggle} />
			Show Material Values
		</label>
		<p class="help-text">
			Enable to track physical assets like watches, cars, and precious metals.
		</p>
	</div>
</div>

<style>
	.settings-page {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}
	h1 {
		margin-bottom: 2rem;
	}
	.setting-group {
		background: var(--surface-color);
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
		margin-bottom: 2rem;
	}
	h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-size: 1.2rem;
		color: var(--text-primary);
	}
	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.setting-item:last-child {
		margin-bottom: 0;
	}
	.setting-label {
		display: flex;
		flex-direction: column;
	}
	.setting-description {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}
	label {
		display: block;
		margin-bottom: 0.25rem;
		font-weight: 500;
	}
	select {
		padding: 0.5rem;
		border-radius: 8px;
		border: 1px solid var(--border-color);
		background: var(--background-color);
		color: var(--text-primary);
		font-size: 1rem;
	}
	.help-text {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}
	input[type='checkbox'] {
		width: 1.2rem;
		height: 1.2rem;
	}
	/* Switch Styles */
	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: 0.4s;
	}
	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: 0.4s;
	}
	input:checked + .slider {
		background-color: var(--primary-color);
	}
	input:focus + .slider {
		box-shadow: 0 0 1px var(--primary-color);
	}
	input:checked + .slider:before {
		transform: translateX(26px);
	}
	.slider.round {
		border-radius: 34px;
	}
	.slider.round:before {
		border-radius: 50%;
	}
</style>
