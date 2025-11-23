<script lang="ts">
	import type { Asset } from '$lib/types';

	interface Props {
		assets?: Asset[];
		currency?: string;
		onselect?: (asset: Asset) => void;
		hideHeaders?: boolean;
	}

	let { assets = [], currency = 'EUR', onselect, hideHeaders = false }: Props = $props();

	function formatMoney(value: number, curr: string) {
		try {
			return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(value);
		} catch (e) {
			return `${curr} ${value.toFixed(2)}`;
		}
	}
</script>

<div class="asset-list">
	{#each ['ETF', 'Stock', 'Crypto', 'Bank', 'Saving', 'RealEstate', 'Watch', 'Car', 'PreciousMetal', 'Cash', 'Other'] as type}
		{@const typeAssets =
			type === 'Other'
				? assets.filter((a) => ['Other'].includes(a.type))
				: assets.filter((a) => a.type === type)}
		{#if typeAssets.length > 0}
			<div class="asset-group">
				{#if !hideHeaders}
					<h3>
						{type === 'PreciousMetal'
							? 'Precious Metals'
							: type === 'Watch'
								? 'Watches'
								: type === 'Cash'
									? 'Cash'
									: type + 's'}
					</h3>
				{/if}
				<ul>
					{#each typeAssets as asset}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<li onclick={() => onselect?.(asset)}>
							<div class="asset-info">
								<span class="name">{asset.name}</span>
								{#if asset.type === 'PreciousMetal' && asset.quantity}
									<span class="details">{asset.quantity}g</span>
								{:else if asset.type === 'Cash' && asset.currency !== currency && asset.quantity}
									<span class="details">{formatMoney(asset.quantity, asset.currency)}</span>
								{:else if asset.symbol}
									<span class="symbol">{asset.symbol}</span>
								{/if}
							</div>
							<div class="asset-value">
								{#if asset.type === 'Cash' && asset.currency !== currency}
									{formatMoney(asset.value, currency)}
								{:else}
									{formatMoney(asset.value, asset.currency)}
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	{/each}
</div>

<style>
	.asset-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.asset-group h3 {
		margin-bottom: 0.5rem;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.25rem;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: var(--surface-color);
		border-radius: 8px;
		margin-bottom: 0.5rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	li:hover {
		background: var(--surface-hover);
	}
	.asset-info {
		display: flex;
		flex-direction: column;
	}
	.name {
		font-weight: 500;
	}
	.symbol {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}
	.asset-value {
		font-weight: 600;
		color: var(--primary-color);
	}
	.details {
		font-size: 0.85rem;
		color: var(--text-secondary);
	}
</style>
