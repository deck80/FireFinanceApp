<script lang="ts">
	import type { Asset } from '$lib/types';

	interface Props {
		asset: Asset;
		onedit?: (asset: Asset) => void;
		ondelete?: (asset: Asset) => void;
	}

	let { asset, onedit, ondelete }: Props = $props();

	function formatMoney(value: number, curr: string) {
		try {
			return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(value);
		} catch (e) {
			return `${curr} ${value.toFixed(2)}`;
		}
	}

	let formattedPrice = $derived(asset.price ? formatMoney(asset.price, asset.currency) : null);

	let formattedBuyPrice = $derived(
		asset.averageBuyPrice ? formatMoney(asset.averageBuyPrice, asset.currency) : null
	);

	let gainLoss = $derived.by(() => {
		if (asset.averageBuyPrice && asset.quantity && asset.value) {
			const invested = asset.quantity * asset.averageBuyPrice;
			const current = asset.value;
			const diff = current - invested;
			const percent = (diff / invested) * 100;
			return {
				diff,
				percent,
				isPositive: diff >= 0
			};
		}
		return null;
	});

	let formattedGainLoss = $derived(
		gainLoss ? (gainLoss.diff >= 0 ? '+' : '') + formatMoney(gainLoss.diff, asset.currency) : null
	);

	let formattedGainLossPercent = $derived(
		gainLoss
			? new Intl.NumberFormat('en-US', {
					style: 'percent',
					minimumFractionDigits: 2,
					signDisplay: 'always'
				}).format(gainLoss.percent / 100)
			: null
	);
</script>

<div class="asset-detail">
	<h2>{asset.name}</h2>
	<div class="detail-grid">
		<div class="detail-item">
			<span class="label">Type</span>
			<span class="value">{asset.type}</span>
		</div>
		<div class="detail-item">
			<span class="label">Value</span>
			<span class="value highlight">{formatMoney(asset.value, asset.currency)}</span>
		</div>
		{#if asset.symbol}
			<div class="detail-item">
				<span class="label">Symbol</span>
				<span class="value">{asset.symbol}</span>
			</div>
		{/if}
		{#if formattedPrice}
			<div class="detail-item">
				<span class="label">Unit Price</span>
				<span class="value">{formattedPrice}</span>
			</div>
		{/if}

		{#if formattedBuyPrice}
			<div class="detail-item">
				<span class="label">Avg. Buy Price</span>
				<span class="value">{formattedBuyPrice}</span>
			</div>
		{/if}

		{#if gainLoss}
			<div class="detail-item">
				<span class="label">Gain / Loss</span>
				<span
					class="value"
					class:positive={gainLoss.isPositive}
					class:negative={!gainLoss.isPositive}
				>
					{formattedGainLoss} <span class="percent">({formattedGainLossPercent})</span>
				</span>
			</div>
		{/if}

		{#if asset.quantity}
			<div class="detail-item">
				<span class="label">Quantity</span>
				<span class="value">{asset.quantity}</span>
			</div>
		{/if}
		{#if asset.institution}
			<div class="detail-item">
				<span class="label">Institution</span>
				<span class="value">{asset.institution}</span>
			</div>
		{/if}
		{#if asset.description}
			<div class="detail-item full-width">
				<span class="label">Description</span>
				<p class="description">{asset.description}</p>
			</div>
		{/if}
	</div>

	<div class="actions">
		{#if onedit}
			<button class="action-btn edit" onclick={() => onedit?.(asset)}>
				<span class="material-symbols-outlined">edit</span>
				Edit
			</button>
		{/if}
		{#if ondelete}
			<button class="action-btn delete" onclick={() => ondelete?.(asset)}>
				<span class="material-symbols-outlined">delete</span>
				Delete
			</button>
		{/if}
	</div>
</div>

<style>
	.asset-detail {
		background: var(--surface-color);
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		color: var(--text-primary);
	}
	.detail-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1.5rem;
	}
	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.detail-item.full-width {
		grid-column: 1 / -1;
	}
	.label {
		font-size: 0.85rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.value {
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--text-primary);
	}
	.value.highlight {
		color: var(--primary-color);
		font-weight: 700;
		font-size: 1.25rem;
	}
	.description {
		margin: 0;
		line-height: 1.5;
		color: var(--text-secondary);
	}
	.value.positive {
		color: var(--success-color, #4caf50);
	}
	.value.negative {
		color: var(--error-color, #f44336);
	}
	.percent {
		font-size: 0.9em;
		opacity: 0.9;
	}
	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
	}
	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: 8px;
		border: none;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.action-btn.edit {
		background: var(--surface-hover);
		color: var(--text-primary);
	}
	.action-btn.delete {
		background: #ffebee;
		color: #d32f2f;
	}
	.action-btn.delete:hover {
		background: #ffcdd2;
	}
	.action-btn.edit:hover {
		background: var(--border-color);
	}
</style>
