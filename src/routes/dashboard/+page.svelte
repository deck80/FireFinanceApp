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

	// Month selection state
	let selectedDate = $state(new Date());

	function formatMonthYear(date: Date) {
		return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
	}

	function previousMonth() {
		const newDate = new Date(selectedDate);
		newDate.setMonth(newDate.getMonth() - 1);
		selectedDate = newDate;
	}

	function nextMonth() {
		const newDate = new Date(selectedDate);
		newDate.setMonth(newDate.getMonth() + 1);
		selectedDate = newDate;
	}

	onMount(() => {
		if ($assets.length === 0) {
			const mockAssets = generateMockData();
			assets.setAssets(mockAssets);
		}
	});

	let currency = $derived($auth?.preferredCurrency || 'EUR');
	let showMaterial = $derived($auth?.showMaterialValues ?? true);

	// Filter assets for the selected month/year
	let visibleAssets = $derived.by(() => {
		const month = selectedDate.getMonth();
		const year = selectedDate.getFullYear();
		return $assets.filter((a) => {
			if (!a.date) return true; // include assets without a date
			const d = new Date(a.date);
			return d.getMonth() === month && d.getFullYear() === year;
		});
	});

	// Material asset types
	const materialTypes = ['Watch', 'Car', 'PreciousMetal', 'Cash', 'Other'];

	let chartData = $derived.by(() => {
		const baseLabels = ['ETF', 'Stock', 'Crypto', 'Bank', 'Saving', 'Real Estate', 'P2P Lending'];
		if (showMaterial) baseLabels.push('Material Values');
		const data = [];
		data.push(visibleAssets.filter((a) => a.type === 'ETF').reduce((s, a) => s + a.value, 0));
		data.push(visibleAssets.filter((a) => a.type === 'Stock').reduce((s, a) => s + a.value, 0));
		data.push(visibleAssets.filter((a) => a.type === 'Crypto').reduce((s, a) => s + a.value, 0));
		data.push(visibleAssets.filter((a) => a.type === 'Bank').reduce((s, a) => s + a.value, 0));
		data.push(visibleAssets.filter((a) => a.type === 'Saving').reduce((s, a) => s + a.value, 0));
		data.push(
			visibleAssets.filter((a) => a.type === 'RealEstate').reduce((s, a) => s + a.value, 0)
		);
		data.push(
			visibleAssets.filter((a) => a.type === 'P2PLending').reduce((s, a) => s + a.value, 0)
		);
		if (showMaterial) {
			const materialSum = visibleAssets
				.filter((a) => materialTypes.includes(a.type))
				.reduce((s, a) => s + a.value, 0);
			data.push(materialSum);
		}
		return {
			labels: baseLabels,
			datasets: [
				{
					data,
					backgroundColor: [
						'#FF6384', // ETF
						'#36A2EB', // Stock
						'#F7931A', // Crypto
						'#FFCE56', // Bank
						'#4BC0C0', // Saving
						'#9966FF', // Real Estate
						'#FF9F40', // P2P Lending
						...(showMaterial ? ['#C9CBCF'] : []) // Material Values
					]
				}
			]
		};
	});

	function formatMoney(value: number, curr: string) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(value);
	}
</script>

<div class="dashboard">
	<header>
		<div class="month-selector">
			<button class="month-nav" onclick={previousMonth} title="Previous Month">
				<span class="material-symbols-outlined">chevron_left</span>
			</button>
			<div class="month-display">
				{formatMonthYear(selectedDate)}
			</div>
			<button class="month-nav" onclick={nextMonth} title="Next Month">
				<span class="material-symbols-outlined">chevron_right</span>
			</button>
		</div>

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
	.month-selector {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}
	.month-nav {
		background: var(--surface-color);
		border: 1px solid var(--border-color);
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}
	.month-nav:hover {
		background: var(--surface-hover);
		border-color: var(--primary-color);
	}
	.month-nav .material-symbols-outlined {
		font-size: 24px;
		color: var(--text-primary);
	}
	.month-display {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--primary-color);
		min-width: 200px;
		text-align: center;
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
