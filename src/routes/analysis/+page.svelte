<script lang="ts">
	import { assets, totalWealth } from '$lib/stores/finance';
	import { auth } from '$lib/stores/auth';
	import Chart from '$lib/components/Chart.svelte';
	import type { Asset } from '$lib/types';

	let currency = $derived($auth?.preferredCurrency || 'EUR');
	let showMaterial = $derived($auth?.showMaterialValues || false);

	// --- Mock Historical Data (Since we don't have a backend) ---
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	// Mock Portfolio Value History (Linear growth + some volatility)
	const portfolioHistoryData = {
		labels: months,
		datasets: [
			{
				label: 'Portfolio Value',
				data: [
					120000, 125000, 123000, 130000, 135000, 134000, 140000, 145000, 142000, 150000, 155000,
					160000
				], // Mock data
				borderColor: '#4caf50',
				backgroundColor: 'rgba(76, 175, 80, 0.1)',
				tension: 0.4,
				fill: true
			}
		]
	};

	// Mock Monthly Income (Dividends, Interest, etc.)
	const monthlyIncomeData = {
		labels: months,
		datasets: [
			{
				label: 'Monthly Income',
				data: [150, 120, 400, 160, 140, 450, 180, 150, 420, 170, 160, 500], // Mock data (peaks in Mar, Jun, Sep, Dec for dividends)
				backgroundColor: '#2196f3',
				borderRadius: 4
			}
		]
	};

	// --- Real Data for Allocation ---

	// Allocation by Asset Type
	let allocationByTypeData = $derived.by(() => {
		const typeMap = new Map<string, number>();
		$assets.forEach((asset) => {
			if (!showMaterial && ['Watch', 'Car', 'PreciousMetal', 'Cash'].includes(asset.type)) return;
			const currentVal = typeMap.get(asset.type) || 0;
			typeMap.set(asset.type, currentVal + asset.value);
		});

		return {
			labels: Array.from(typeMap.keys()),
			datasets: [
				{
					data: Array.from(typeMap.values()),
					backgroundColor: [
						'#FF6384',
						'#36A2EB',
						'#FFCE56',
						'#4BC0C0',
						'#9966FF',
						'#FF9F40',
						'#E7E9ED',
						'#76A346'
					]
				}
			]
		};
	});

	// Allocation by Currency
	let allocationByCurrencyData = $derived.by(() => {
		const currMap = new Map<string, number>();
		$assets.forEach((asset) => {
			if (!showMaterial && ['Watch', 'Car', 'PreciousMetal', 'Cash'].includes(asset.type)) return;
			const currentVal = currMap.get(asset.currency) || 0;
			currMap.set(asset.currency, currentVal + asset.value);
		});

		return {
			labels: Array.from(currMap.keys()),
			datasets: [
				{
					data: Array.from(currMap.values()),
					backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
				}
			]
		};
	});

	function formatMoney(value: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value);
	}

	// Calculate Total Gain/Loss (Simple approximation based on current assets)
	let totalGainLoss = $derived.by(() => {
		let totalInvested = 0;
		let totalCurrent = 0;
		$assets.forEach((a) => {
			if (a.averageBuyPrice && a.quantity) {
				totalInvested += a.averageBuyPrice * a.quantity;
				totalCurrent += a.value;
			}
		});
		return totalCurrent - totalInvested;
	});
</script>

<div class="analysis-page">
	<header>
		<div>
			<h1>Portfolio Analysis</h1>
			<p class="subtitle">Deep dive into your financial performance</p>
		</div>
	</header>

	<!-- Key Metrics Row -->
	<div class="metrics-row">
		<div class="metric-card">
			<span class="metric-label">Total Portfolio Value</span>
			<span class="metric-value">{formatMoney($totalWealth)}</span>
		</div>
		<div class="metric-card">
			<span class="metric-label">Total Gain/Loss (Tracked)</span>
			<span
				class="metric-value"
				class:positive={totalGainLoss >= 0}
				class:negative={totalGainLoss < 0}
			>
				{totalGainLoss >= 0 ? '+' : ''}{formatMoney(totalGainLoss)}
			</span>
		</div>
		<div class="metric-card">
			<span class="metric-label">Est. Annual Income</span>
			<span class="metric-value">{formatMoney(3200)}</span>
			<!-- Mocked -->
		</div>
	</div>

	<!-- Charts Grid -->
	<div class="charts-grid">
		<!-- Top Row: History -->
		<div class="chart-card full-width">
			<h3>Portfolio Value History</h3>
			<div class="chart-wrapper">
				<Chart type="line" data={portfolioHistoryData} />
			</div>
		</div>

		<!-- Middle Row: Income & Allocation -->
		<div class="chart-card">
			<h3>Monthly Income</h3>
			<div class="chart-wrapper">
				<Chart type="bar" data={monthlyIncomeData} />
			</div>
		</div>

		<div class="chart-card">
			<h3>Allocation by Asset Type</h3>
			<div class="chart-wrapper">
				<Chart type="doughnut" data={allocationByTypeData} />
			</div>
		</div>

		<!-- Bottom Row: More Allocation -->
		<div class="chart-card">
			<h3>Allocation by Currency</h3>
			<div class="chart-wrapper">
				<Chart type="pie" data={allocationByCurrencyData} />
			</div>
		</div>

		<div class="chart-card placeholder-card">
			<h3>Future Projections</h3>
			<p>Coming soon...</p>
		</div>
	</div>
</div>

<style>
	.analysis-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	header {
		margin-bottom: 2rem;
	}
	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}
	.subtitle {
		color: var(--text-secondary);
	}

	.metrics-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	.metric-card {
		background: var(--surface-color);
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border: 1px solid var(--border-color);
	}
	.metric-label {
		font-size: 0.9rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.metric-value {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--text-primary);
	}
	.metric-value.positive {
		color: var(--success-color, #4caf50);
	}
	.metric-value.negative {
		color: var(--error-color, #f44336);
	}

	.charts-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}
	.chart-card {
		background: var(--surface-color);
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}
	.chart-card.full-width {
		grid-column: 1 / -1;
	}
	.chart-card h3 {
		margin-bottom: 1rem;
		color: var(--text-primary);
		font-size: 1.1rem;
	}
	.chart-wrapper {
		height: 300px;
		width: 100%;
	}
	.placeholder-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		font-style: italic;
	}

	@media (max-width: 768px) {
		.charts-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
