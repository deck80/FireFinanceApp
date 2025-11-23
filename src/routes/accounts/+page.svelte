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
	let addType = $state<AssetType>('Bank');

	let currency = $derived($auth?.preferredCurrency || 'EUR');

	// Filter assets
	let bankAssets = $derived($assets.filter((a) => a.type === 'Bank'));
	let savingAssets = $derived($assets.filter((a) => a.type === 'Saving'));

	let totalBankValue = $derived(bankAssets.reduce((sum, a) => sum + a.value, 0));
	let totalSavingValue = $derived(savingAssets.reduce((sum, a) => sum + a.value, 0));
	let totalValue = $derived(totalBankValue + totalSavingValue);

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

<div class="accounts-page">
	<header>
		<div class="header-content">
			<div>
				<h1>Accounts</h1>
				<p class="subtitle">Manage your Bank and Savings accounts</p>
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
			<!-- Bank Accounts Group -->
			<div class="group-header">
				<div class="group-title">
					<h2>Bank Accounts</h2>
					<span class="group-total">{formatMoney(totalBankValue, currency)}</span>
				</div>
				<button class="add-btn small" onclick={() => openAddModal('Bank')}>
					<span class="material-symbols-outlined">add</span>
				</button>
			</div>
			<AssetList assets={bankAssets} {currency} onselect={(asset) => (selectedAsset = asset)} />

			<!-- Savings Accounts Group -->
			<div class="group-header mt-4">
				<div class="group-title">
					<h2>Savings</h2>
					<span class="group-total">{formatMoney(totalSavingValue, currency)}</span>
				</div>
				<button class="add-btn small" onclick={() => openAddModal('Saving')}>
					<span class="material-symbols-outlined">add</span>
				</button>
			</div>
			<AssetList assets={savingAssets} {currency} onselect={(asset) => (selectedAsset = asset)} />
		</div>

		<div class="detail-section">
			{#if selectedAsset}
				<AssetDetail asset={selectedAsset} onedit={handleEditAsset} ondelete={handleDeleteAsset} />
				{#if selectedAsset.type === 'Saving' && selectedAsset.liquidity}
					<div class="liquidity-badge" class:locked={selectedAsset.liquidity === 'locked'}>
						{selectedAsset.liquidity === 'locked' ? 'Locked (1-5 days)' : 'Available Immediately'}
					</div>
				{/if}
			{:else}
				<div class="placeholder">
					<p>Select an account to view details</p>
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
	.accounts-page {
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
	}
	.group-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	.group-title {
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}
	.group-title h2 {
		font-size: 1.2rem;
		margin: 0;
		color: var(--text-primary);
	}
	.group-total {
		font-size: 1rem;
		color: var(--text-secondary);
		font-weight: 500;
	}
	.add-btn.small {
		background: var(--surface-hover);
		border: none;
		border-radius: 50%;
		width: 32px;
		height: 32px;
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
		margin-top: 2rem;
	}
	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-secondary);
		font-style: italic;
	}
	.liquidity-badge {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		background: #e8f5e9;
		color: #2e7d32;
		font-weight: 500;
		text-align: center;
	}
	.liquidity-badge.locked {
		background: #fff3e0;
		color: #ef6c00;
	}
	@media (max-width: 768px) {
		.content-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
