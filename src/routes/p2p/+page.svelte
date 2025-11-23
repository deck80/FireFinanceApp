<script lang="ts">
	import { assets } from '$lib/stores/finance';
	import { auth } from '$lib/stores/auth';
	import AssetList from '$lib/components/AssetList.svelte';
	import AssetDetail from '$lib/components/AssetDetail.svelte';
	import AddAssetModal from '$lib/components/AddAssetModal.svelte';
	import type { Asset } from '$lib/types';
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';

	let selectedAsset = $state<Asset | null>(null);
	let showAddModal = $state(false);
	let assetToEdit = $state<Asset | null>(null);

	let currency = $derived($auth?.preferredCurrency || 'EUR');

	// Filter assets
	let p2pAssets = $derived($assets.filter((a) => a.type === 'P2PLending'));
	let totalValue = $derived(p2pAssets.reduce((sum, a) => sum + a.value, 0));

	// Aggregated Metrics
	let totalInvested = $derived(p2pAssets.reduce((sum, a) => sum + (a.averageBuyPrice || 0), 0)); // Using avgBuyPrice as Invested Amount
	let totalReceived = $derived(
		p2pAssets.reduce((sum, a) => sum + (a.moneyReceivedThisMonth || 0), 0)
	);
	let totalCashDrag = $derived(p2pAssets.reduce((sum, a) => sum + (a.cashDrag || 0), 0));

	let totalReturn = $derived(totalInvested > 0 ? (totalReceived / totalInvested) * 100 : 0);
	let cashDragPercentage = $derived(totalValue > 0 ? (totalCashDrag / totalValue) * 100 : 0);

	let compositionChartCanvas: HTMLCanvasElement;
	let compositionChart: Chart;

	function formatMoney(value: number, curr: string) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(value);
	}

	function formatPercent(value: number) {
		return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(
			value / 100
		);
	}

	function updateCharts() {
		if (compositionChart) compositionChart.destroy();

		if (compositionChartCanvas && p2pAssets.length > 0) {
			const invested = totalValue - totalCashDrag;
			compositionChart = new Chart(compositionChartCanvas, {
				type: 'doughnut',
				data: {
					labels: ['Invested', 'Cash Drag'],
					datasets: [
						{
							data: [invested, totalCashDrag],
							backgroundColor: ['#4caf50', '#ff9800'],
							borderWidth: 0
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { position: 'right' }
					}
				}
			});
		}
	}

	$effect(() => {
		if (p2pAssets.length >= 0) {
			// Small timeout to ensure canvas is ready
			setTimeout(updateCharts, 0);
		}
	});

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
				<h1>P2P Lending</h1>
				<p class="subtitle">Track your peer-to-peer investments</p>
			</div>
			<div class="header-actions">
				<div class="total-value">
					{formatMoney(totalValue, currency)}
				</div>
			</div>
		</div>
	</header>

	<div class="dashboard-grid">
		<!-- Metrics Cards -->
		<div class="metric-card">
			<h3>Total Invested</h3>
			<div class="metric-value">{formatMoney(totalInvested, currency)}</div>
		</div>
		<div class="metric-card">
			<h3>Received (Mo)</h3>
			<div class="metric-value income">+{formatMoney(totalReceived, currency)}</div>
			<div class="metric-sub">{formatPercent(totalReturn)} Return</div>
		</div>
		<div class="metric-card">
			<h3>Cash Drag</h3>
			<div class="metric-value warning">{formatMoney(totalCashDrag, currency)}</div>
			<div class="metric-sub">{formatPercent(cashDragPercentage)} of Total</div>
		</div>

		<!-- Chart -->
		<div class="chart-card">
			<h3>Composition</h3>
			<div class="chart-container">
				<canvas bind:this={compositionChartCanvas}></canvas>
			</div>
		</div>
	</div>

	<div class="content-grid">
		<div class="list-section">
			<div class="group-header">
				<div class="group-title">
					<h2>Platforms</h2>
					<span class="group-total">{formatMoney(totalValue, currency)}</span>
				</div>
				<button class="add-btn small" onclick={openAddModal}>
					<span class="material-symbols-outlined">add</span>
				</button>
			</div>

			{#if p2pAssets.length > 0}
				<div class="assets-grid">
					{#each p2pAssets as asset}
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
							<div class="financials">
								<div class="stat">
									<span class="label">Invested</span>
									<span class="val">{formatMoney(asset.averageBuyPrice || 0, currency)}</span>
								</div>
								<div class="stat">
									<span class="label">Received</span>
									<span class="val income"
										>+{formatMoney(asset.moneyReceivedThisMonth || 0, currency)}</span
									>
								</div>
								<div class="stat">
									<span class="label">Return</span>
									<span class="val positive">
										{formatPercent(
											asset.averageBuyPrice && asset.averageBuyPrice > 0
												? ((asset.moneyReceivedThisMonth || 0) / asset.averageBuyPrice) * 100
												: 0
										)}
									</span>
								</div>
							</div>
							{#if asset.cashDrag && asset.cashDrag > 0}
								<div class="cash-drag-bar">
									<div class="drag-label">Cash Drag: {formatMoney(asset.cashDrag, currency)}</div>
									<div class="progress-bg">
										<div
											class="progress-fill"
											style={`width: ${(asset.cashDrag / asset.value) * 100}%`}
										></div>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-group">No P2P investments added yet</div>
			{/if}
		</div>

		<div class="detail-section">
			{#if selectedAsset}
				<AssetDetail asset={selectedAsset} onedit={handleEditAsset} ondelete={handleDeleteAsset} />
			{:else}
				<div class="placeholder">
					<p>Select a platform to view details</p>
				</div>
			{/if}
		</div>
	</div>

	{#if showAddModal}
		<AddAssetModal
			onclose={handleCloseModal}
			onadd={handleSaveAsset}
			{assetToEdit}
			defaultType="P2PLending"
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

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	.metric-card {
		background: var(--surface-color);
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
	}
	.metric-card h3 {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0 0 0.5rem 0;
	}
	.metric-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
	}
	.metric-value.income {
		color: var(--success-color, #4caf50);
	}
	.metric-value.warning {
		color: var(--warning-color, #ff9800);
	}
	.metric-sub {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin-top: 0.25rem;
	}

	.chart-card {
		background: var(--surface-color);
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
		grid-column: span 2;
	}
	.chart-container {
		height: 150px;
		position: relative;
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
	.financials {
		display: flex;
		gap: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-color);
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
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
	.val.positive {
		color: var(--success-color, #4caf50);
	}

	.cash-drag-bar {
		margin-top: 0.5rem;
	}
	.drag-label {
		font-size: 0.75rem;
		color: var(--warning-color, #ff9800);
		margin-bottom: 0.25rem;
	}
	.progress-bg {
		background: var(--border-color);
		height: 4px;
		border-radius: 2px;
		overflow: hidden;
	}
	.progress-fill {
		background: var(--warning-color, #ff9800);
		height: 100%;
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
		.chart-card {
			grid-column: span 1;
		}
	}
</style>
