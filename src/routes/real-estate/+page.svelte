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

	let currency = $derived($auth?.preferredCurrency || 'EUR');

	// Filter assets
	let realEstateAssets = $derived($assets.filter((a) => a.type === 'RealEstate'));
	let totalValue = $derived(realEstateAssets.reduce((sum, a) => sum + a.value, 0));

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
		showAddModal = true;
	}

	function handleCloseModal() {
		showAddModal = false;
		assetToEdit = null;
	}

	function openAddModal() {
		assetToEdit = null;
		showAddModal = true;
	}
</script>

<div class="page-container">
	<header>
		<div class="header-content">
			<div>
				<h1>Real Estate</h1>
				<p class="subtitle">Manage your properties</p>
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
			<div class="group-header">
				<div class="group-title">
					<h2>Properties</h2>
					<span class="group-total">{formatMoney(totalValue, currency)}</span>
				</div>
				<button class="add-btn small" onclick={openAddModal}>
					<span class="material-symbols-outlined">add</span>
				</button>
			</div>

			{#if realEstateAssets.length > 0}
				<div class="assets-grid">
					{#each realEstateAssets as asset}
						<div
							class="asset-card"
							role="button"
							tabindex="0"
							onclick={() => (selectedAsset = asset)}
							onkeydown={(e) => e.key === 'Enter' && (selectedAsset = asset)}
							class:selected={selectedAsset?.id === asset.id}
						>
							<div class="card-header">
								<h3>{asset.name}</h3>
								<span class="value">{formatMoney(asset.value, currency)}</span>
							</div>
							{#if asset.address}
								<a
									href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(asset.address)}`}
									target="_blank"
									rel="noopener noreferrer"
									class="address-link"
									onclick={(e) => e.stopPropagation()}
								>
									<span class="material-symbols-outlined icon">location_on</span>
									{asset.address}
								</a>
							{/if}
							<div class="financials">
								{#if asset.monthlyRent}
									<div class="stat">
										<span class="label">Rent</span>
										<span class="val income">+{formatMoney(asset.monthlyRent, currency)}</span>
									</div>
								{/if}
								{#if asset.monthlyTaxes || asset.monthlyBills}
									<div class="stat">
										<span class="label">Expenses</span>
										<span class="val expense"
											>-{formatMoney(
												(asset.monthlyTaxes || 0) + (asset.monthlyBills || 0),
												currency
											)}</span
										>
									</div>
								{/if}
								{#if asset.monthlyRent}
									<div class="stat net">
										<span class="label">Net</span>
										<span
											class="val"
											class:positive={asset.monthlyRent -
												(asset.monthlyTaxes || 0) -
												(asset.monthlyBills || 0) >
												0}
										>
											{formatMoney(
												asset.monthlyRent - (asset.monthlyTaxes || 0) - (asset.monthlyBills || 0),
												currency
											)}
										</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-group">No properties added yet</div>
			{/if}
		</div>

		<div class="detail-section">
			{#if selectedAsset}
				<AssetDetail asset={selectedAsset} onedit={handleEditAsset} ondelete={handleDeleteAsset} />
			{:else}
				<div class="placeholder">
					<p>Select a property to view details</p>
				</div>
			{/if}
		</div>
	</div>

	{#if showAddModal}
		<AddAssetModal
			onclose={handleCloseModal}
			onadd={handleSaveAsset}
			{assetToEdit}
			defaultType="RealEstate"
		/>
	{/if}
</div>

<style>
	.page-container {
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
	.assets-grid {
		display: grid;
		gap: 1rem;
	}
	.asset-card {
		background: var(--surface-color);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	.asset-card:hover {
		border-color: var(--primary-color);
		background: var(--surface-hover);
	}
	.asset-card.selected {
		border-color: var(--primary-color);
		background: var(--primary-container);
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.card-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: var(--text-primary);
	}
	.card-header .value {
		font-weight: 600;
		color: var(--primary-color);
	}
	.address-link {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--text-secondary);
		font-size: 0.9rem;
		text-decoration: none;
		margin-bottom: 0.75rem;
	}
	.address-link:hover {
		color: var(--primary-color);
		text-decoration: underline;
	}
	.address-link .icon {
		font-size: 1rem;
	}
	.financials {
		display: flex;
		gap: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-color);
		font-size: 0.85rem;
	}
	.stat {
		display: flex;
		flex-direction: column;
	}
	.stat .label {
		color: var(--text-secondary);
		font-size: 0.75rem;
	}
	.stat .val {
		font-weight: 500;
	}
	.val.income {
		color: var(--success-color, #4caf50);
	}
	.val.expense {
		color: var(--error-color, #f44336);
	}
	.val.positive {
		color: var(--success-color, #4caf50);
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
