<script lang="ts">
	import { refreshAssetPrices } from '$lib/services/financeService';

	let isLoading = $state(false);

	async function handleRefresh() {
		isLoading = true;
		try {
			await refreshAssetPrices();
		} finally {
			isLoading = false;
		}
	}
</script>

<button class="refresh-btn" onclick={handleRefresh} disabled={isLoading} title="Refresh Prices">
	<span class="material-symbols-outlined icon" class:spinning={isLoading}> refresh </span>
	<span class="label">Refresh</span>
</button>

<style>
	.refresh-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--surface-color);
		border: 1px solid var(--border-color);
		padding: 0.5rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		color: var(--text-primary);
		font-weight: 500;
		transition: all 0.2s;
	}
	.refresh-btn:hover:not(:disabled) {
		background: var(--surface-hover);
		border-color: var(--primary-color);
		color: var(--primary-color);
	}
	.refresh-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	.icon {
		font-size: 1.2rem;
	}
	.spinning {
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	@media (max-width: 600px) {
		.label {
			display: none;
		}
		.refresh-btn {
			padding: 0.5rem;
		}
	}
</style>
