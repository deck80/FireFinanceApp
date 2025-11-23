<script lang="ts">
	import { assets } from '$lib/stores/finance';
	import { auth } from '$lib/stores/auth';
	import AssetList from '$lib/components/AssetList.svelte';
	import AssetDetail from '$lib/components/AssetDetail.svelte';
	import AddAssetModal from '$lib/components/AddAssetModal.svelte';
	import RefreshButton from '$lib/components/RefreshButton.svelte';
	import type { Asset } from '$lib/types';

	let selectedAsset = $state<Asset | null>(null);
	let showAddModal = $state(false);
	let assetToEdit = $state<Asset | null>(null);

	let currency = $derived($auth?.preferredCurrency || 'EUR');

	// Filter only ETF assets
	let etfAssets = $derived($assets.filter((a) => a.type === 'ETF'));

	let totalEtfValue = $derived(etfAssets.reduce((sum, a) => sum + a.value, 0));

	function formatMoney(value: number, curr: string) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(value);
	}

	function handleSaveAsset(asset: Asset) {
		if (assetToEdit) {
			assets.updateAsset(asset);
			// Update selected asset if it was the one edited
			if (selectedAsset?.id === asset.id) {
				selectedAsset = asset;
			}
		} else {
			assets.addAsset(asset);
		}
		assetToEdit = null;
	}

	function handleDeleteAsset(asset: Asset) {
		if (confirm(`Are you sure you want to delete ${asset.name}?`)) {
			assets.removeAsset(asset.id);
			if (selectedAsset?.id === asset.id) {
				selectedAsset = null;
			}
		}
	}

	function handleEditAsset(asset: Asset) {
		assetToEdit = asset;
		showAddModal = true;
	}

	function handleCloseModal() {
		showAddModal = false;
		assetToEdit = null;
	}
</script>

<div class="etf-page">
	<header>
		<div class="header-content">
			<div>
				<h1>ETF Portfolio</h1>
				<p class="subtitle">Exchange Traded Funds</p>
			</div>
			<div class="header-actions">
				<div class="total-value">
					{formatMoney(totalEtfValue, currency)}
				</div>
				<div class="action-buttons">
					<RefreshButton />
					<button
						class="add-btn"
						onclick={() => {
							assetToEdit = null;
							showAddModal = true;
						}}
					>
						<span class="material-symbols-outlined">add</span>
						Add ETF
					</button>
				</div>
			</div>
		</div>
	</header>

	<div class="content-grid">
		<div class="list-section">
			<AssetList assets={etfAssets} {currency} onselect={(asset) => (selectedAsset = asset)} />
		</div>

		<div class="detail-section">
			{#if selectedAsset}
				<AssetDetail asset={selectedAsset} onedit={handleEditAsset} ondelete={handleDeleteAsset} />
			{:else}
				<div class="placeholder">
					<p>Select an ETF to view details</p>
				</div>
			{/if}
		</div>
	</div>

	{#if showAddModal}
		<AddAssetModal
			onclose={handleCloseModal}
			onadd={handleSaveAsset}
			{assetToEdit}
			defaultType="ETF"
		/>
	{/if}
</div>

<style>
	.etf-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	header {
		margin-bottom: 2rem;
	}
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}
	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: var(--text-secondary);
	}
	.header-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1rem;
	}
	.total-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--primary-color);
	}
	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}
	.add-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--primary-color);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 24px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.add-btn:hover {
		background: var(--primary-hover);
	}
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}
	@media (max-width: 768px) {
		.content-grid {
			grid-template-columns: 1fr;
		}
		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
		.header-actions {
			align-items: flex-start;
			width: 100%;
		}
		.add-btn {
			width: 100%;
			justify-content: center;
		}
	}
	.list-section,
	.detail-section {
		background: var(--surface-color);
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
	}
	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-secondary);
		font-style: italic;
	}
</style>
