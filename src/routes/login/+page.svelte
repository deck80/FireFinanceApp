<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let trustDevice = $state(false);

	function handleLogin() {
		// Mock login logic
		if (email && password) {
			auth.login(email);
			if (trustDevice) {
				localStorage.setItem('finance_control_trusted', 'true');
			}
			goto('/dashboard');
		}
	}
</script>

<div class="login-card surface-card">
	<div class="header">
		<span class="material-symbols-outlined logo">payments</span>
		<h1>Finance Control</h1>
		<p>Sign in to manage your wealth</p>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleLogin();
		}}
		class="login-form"
	>
		<div class="input-group">
			<label for="email">Email</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				class="text-field"
				placeholder="name@example.com"
				required
			/>
		</div>

		<div class="input-group">
			<label for="password">Password</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				class="text-field"
				placeholder="••••••••"
				required
			/>
		</div>

		<div class="checkbox-group">
			<input type="checkbox" id="trust" bind:checked={trustDevice} />
			<label for="trust">Trust this browser for 30 days</label>
		</div>

		<button type="submit" class="btn-primary full-width">Sign In</button>
	</form>
</div>

<style>
	.login-card {
		width: 100%;
		max-width: 400px;
		padding: 48px 32px;
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.logo {
		font-size: 48px;
		color: var(--md-sys-color-primary);
	}

	h1 {
		font: var(--md-sys-typescale-headline-large);
		margin: 0;
		color: var(--md-sys-color-on-surface);
	}

	p {
		font: var(--md-sys-typescale-body-large);
		color: var(--md-sys-color-on-surface-variant);
		margin: 0;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label {
		font: var(--md-sys-typescale-label-large);
		color: var(--md-sys-color-on-surface);
	}

	.checkbox-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.full-width {
		width: 100%;
		margin-top: 8px;
	}
</style>
