<script lang="ts">
	import { assets } from '$lib/stores/finance';
	import { auth } from '$lib/stores/auth';
	import AssetList from '$lib/components/AssetList.svelte';
	import AssetDetail from '$lib/components/AssetDetail.svelte';
	import AddAssetModal from '$lib/components/AddAssetModal.svelte';
	import type { Asset, AssetType } from '$lib/types';

	let selectedAsset = $state<Asset | null>(null);
	let showAddModal = $state(false);
	let assetToEdit = $state<Asset | null>(null);
	let addType = $state<AssetType>('Watch');

	let currency = $derived($auth?.preferredCurrency || 'EUR');

	// Material Types
	const materialTypes: AssetType[] = ['Watch', 'Car', 'PreciousMetal', 'Cash', 'Other'];

	// Filter assets
	let materialAssets = $derived($assets.filter((a) => materialTypes.includes(a.type)));
	let totalValue = $derived(materialAssets.reduce((sum, a) => sum + a.value, 0));

	function formatMoney(value: number, curr: string) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(value);
	}

	function handleSaveAsset(asset: Asset) {
		if (assetToEdit) {
			assets.updateAsset(asset);
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
		addType = asset.type;
		showAddModal = true;
	}

	function handleCloseModal() {
		showAddModal = false;
		assetToEdit = null;
	}

	function openAddModal(type: AssetType) {
		addType = type;
		assetToEdit = null;
		showAddModal = true;
	}
</script>

<div class="material-page">
	<header>
		<div class="header-content">
			<div>
				<h1>Material Values</h1>
				<p class="subtitle">Track your physical assets</p>
			</div>
			<div class="header-actions">
				<div class="total-value">
					{formatMoney(totalValue, currency)}
				</div>
			</div>
		</div>
	</header>

	<div class="content-grid">
		<div class="list-section">
			{#each materialTypes as type}
				{@const typeAssets = materialAssets.filter((a) => a.type === type)}
				{@const typeTotal = typeAssets.reduce((sum, a) => sum + a.value, 0)}

				<div class="group-header" class:mt-4={type !== materialTypes[0]}>
					<div class="group-title">
						<h2>
							{type === 'PreciousMetal'
								? 'Precious Metals'
								: type === 'Watch'
									? 'Watches'
									: type === 'Cash'
										? 'Cash'
										: type + 's'}
						</h2>
						<span class="group-total">{formatMoney(typeTotal, currency)}</span>
					</div>
					<button class="add-btn small" onclick={() => openAddModal(type)}>
						<span class="material-symbols-outlined">add</span>
					</button>
				</div>

				{#if typeAssets.length > 0}
					<AssetList
						assets={typeAssets}
						{currency}
						onselect={(asset) => (selectedAsset = asset)}
						hideHeaders={true}
					/>
				{:else}
					<div class="empty-group">No items</div>
				{/if}
			{/each}
		</div>

		<div class="detail-section">
			{#if selectedAsset}
				<AssetDetail asset={selectedAsset} onedit={handleEditAsset} ondelete={handleDeleteAsset} />
			{:else}
				<div class="placeholder">
					<p>Select an item to view details</p>
				</div>
			{/if}
		</div>
	</div>

	{#if showAddModal}
		<AddAssetModal
			onclose={handleCloseModal}
			onadd={handleSaveAsset}
			{assetToEdit}
			defaultType={addType}
		/>
	{/if}
</div>

<style>
	.material-page {
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
	.total-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--primary-color);
	}
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}
	.list-section,
	.detail-section {
		background: var(--surface-color);
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
		max-height: 80vh;
		overflow-y: auto;
	}
	.group-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid var(--border-color);
	}
	.group-title {
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}
	.group-title h2 {
		font-size: 1.1rem;
		margin: 0;
		color: var(--text-primary);
	}
	.group-total {
		font-size: 0.9rem;
		color: var(--text-secondary);
		font-weight: 500;
	}
	.add-btn.small {
		background: var(--surface-hover);
		border: none;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--primary-color);
	}
	.add-btn.small:hover {
		background: var(--border-color);
	}
	.mt-4 {
		margin-top: 1.5rem;
	}
	.empty-group {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-style: italic;
		padding: 0.5rem;
	}
	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-secondary);
		font-style: italic;
	}
	@media (max-width: 768px) {
		.content-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
