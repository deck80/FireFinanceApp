<script lang="ts">
	import { page } from '$app/stores';

	const menuItems = [
		{ label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
		{ label: 'Stocks', icon: 'show_chart', href: '/stocks' },
		{ label: 'ETFs', icon: 'pie_chart', href: '/etfs' },
		{ label: 'Accounts', icon: 'account_balance', href: '/accounts' },
		{ label: 'Real Estate', icon: 'home', href: '/real-estate' },
		{ label: 'P2P Lending', icon: 'diversity_3', href: '/p2p' },
		{ label: 'Crypto', icon: 'currency_bitcoin', href: '/crypto' },
		{ label: 'Analysis', icon: 'analytics', href: '/analysis' },
		{ label: 'Material Values', icon: 'diamond', href: '/material' },
		{ label: 'Settings', icon: 'settings', href: '/settings' }
	];
</script>

<nav class="drawer">
	<div class="drawer-header">
		<span class="material-symbols-outlined logo-icon">payments</span>
		<span class="app-title">Finance Control</span>
	</div>
	<div class="drawer-content">
		{#each menuItems as item}
			<a href={item.href} class="nav-item" class:active={$page.url.pathname === item.href}>
				<span class="material-symbols-outlined">{item.icon}</span>
				<span class="label">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	.drawer {
		width: 280px;
		background-color: var(--md-sys-color-surface);
		border-right: 1px solid var(--md-sys-color-outline-variant);
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 100;
	}

	.drawer-header {
		padding: 24px;
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--md-sys-color-primary);
	}

	.logo-icon {
		font-size: 32px;
	}

	.app-title {
		font: var(--md-sys-typescale-title-medium);
		font-weight: 700;
	}

	.drawer-content {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 28px;
		color: var(--md-sys-color-on-surface-variant);
		font: var(--md-sys-typescale-label-large);
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.nav-item:hover {
		background-color: rgba(208, 188, 255, 0.08); /* Primary with opacity */
		color: var(--md-sys-color-on-surface);
	}

	.nav-item.active {
		background-color: var(--md-sys-color-secondary-container);
		color: var(--md-sys-color-on-secondary-container);
	}

	.nav-item.active .material-symbols-outlined {
		font-variation-settings: 'FILL' 1;
	}
</style>
