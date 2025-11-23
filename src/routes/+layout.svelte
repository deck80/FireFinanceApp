<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { auth } from '$lib/stores/auth';
	import NavigationDrawer from '$lib/components/NavigationDrawer.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { children } = $props();

	$effect(() => {
		if ($auth?.theme === 'dark') {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
	});

	onMount(() => {
		const trusted = localStorage.getItem('finance_control_trusted');
		if (trusted) {
			auth.login('user@example.com'); // Mock auto-login
		} else if (!$auth && window.location.pathname !== '/login') {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Finance Control</title>
</svelte:head>

{#if $auth}
	<NavigationDrawer />
	<main class="app-content">
		{@render children()}
	</main>
{:else}
	<main class="auth-content">
		{@render children()}
	</main>
{/if}

<style>
	.app-content {
		margin-left: 280px; /* Drawer width */
		padding: 24px;
		min-height: 100vh;
		box-sizing: border-box;
	}

	.auth-content {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background-color: var(--md-sys-color-background);
	}
</style>
