<script lang="ts">
	import { onMount } from 'svelte';
	import { assets, totalWealth } from '$lib/stores/finance';
	import { auth } from '$lib/stores/auth';
	import { generateMockData } from '$lib/services/financeService';
	import Chart from '$lib/components/Chart.svelte';
	import AssetList from '$lib/components/AssetList.svelte';
	import AssetDetail from '$lib/components/AssetDetail.svelte';
	import RefreshButton from '$lib/components/RefreshButton.svelte';
	import type { Asset } from '$lib/types';

	let selectedAsset = $state<Asset | null>(null);

	onMount(() => {
		if ($assets.length === 0) {
			const mockAssets = generateMockData();
			assets.setAssets(mockAssets);
		}
	});

	let currency = $derived($auth?.preferredCurrency || 'EUR');
	let showMaterial = $derived($auth?.showMaterialValues ?? false);

	let visibleAssets = $derived(
		$assets.filter((a) => {
			if (!showMaterial && ['Watch', 'Car', 'PreciousMetal', 'Cash'].includes(a.type)) {
				return false;
			}
			return true;
		})
	);

	let chartData = $derived({
		labels: [
			'ETF',
			'Stock',
			'Crypto',
			'Bank',
			'Saving',
			'RealEstate',
			'Watch',
			'Car',
			'PreciousMetal',
			'Cash',
			'Other'
		].filter((type) => {
			if (!showMaterial && ['Watch', 'Car', 'PreciousMetal', 'Cash'].includes(type)) return false;
			return true;
		}),
		datasets: [
			{
				data: [
					'ETF',
					'Stock',
					'Crypto',
					'Bank',
					'Saving',
					'RealEstate',
					'Watch',
					'Car',
					'PreciousMetal',
					'Cash',
					'Other'
				]
					.filter((type) => {
						if (!showMaterial && ['Watch', 'Car', 'PreciousMetal', 'Cash'].includes(type))
							return false;
						return true;
					})
					.map((type) =>
						visibleAssets.filter((a) => a.type === type).reduce((sum, a) => sum + a.value, 0)
					),
				backgroundColor: [
					'#FF6384',
					'#36A2EB',
					'#F7931A', // Crypto
					'#FFCE56',
					'#4BC0C0',
					'#9966FF',
					'#C9CBCF', // Watch
					'#FF9F40', // Car
					'#E7E9ED', // Metal
					'#4D5360', // Cash
					'#7AC142' // Other
				]
			}
		]
	});

	function formatMoney(value: number, curr: string) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(value);
	}
</script>

<div class="dashboard">
	<header>
		<h1>Total Wealth</h1>
		<div class="total-wealth">
			{formatMoney($totalWealth, currency)}
		</div>
		<div class="actions">
			<RefreshButton />
		</div>
	</header>

	<div class="content-grid">
		<div class="chart-section">
			<Chart data={chartData} title="Asset Allocation" />
		</div>

		<div class="list-section">
			<AssetList assets={visibleAssets} {currency} onselect={(asset) => (selectedAsset = asset)} />
		</div>

		<div class="detail-section">
			{#if selectedAsset}
				<AssetDetail asset={selectedAsset} />
			{:else}
				<div class="placeholder">
					<p>Select an asset to view details</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.dashboard {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	header {
		text-align: center;
		margin-bottom: 3rem;
	}
	h1 {
		font-size: 1.5rem;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}
	.total-wealth {
		font-size: 3rem;
		font-weight: 700;
		color: var(--primary-color);
		margin-bottom: 1rem;
	}
	.actions {
		display: flex;
		justify-content: center;
	}
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 2rem;
	}
	@media (max-width: 1024px) {
		.content-grid {
			grid-template-columns: 1fr;
		}
	}
	.chart-section,
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
