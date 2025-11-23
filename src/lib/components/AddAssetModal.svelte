<script lang="ts">
	import type { Asset, AssetType } from '$lib/types';
	import { searchAsset, fetchAssetPrice } from '$lib/services/financeService';

	interface Props {
		onclose: () => void;
		onadd: (asset: Asset) => void;
		assetToEdit?: Asset | null;
		defaultType?: AssetType;
	}

	let { onclose, onadd, assetToEdit = null, defaultType = 'ETF' }: Props = $props();

	let searchQuery = $state('');
	let searchResults = $state<Asset[]>([]);
	let isSearching = $state(false);

	// Manual Entry State
	let manualName = $state('');
	let manualSymbol = $state('');
	let manualQuantity = $state(0);
	let manualValue = $state(0);
	let manualPrice = $state(0);
	let manualAverageBuyPrice = $state(0);
	let manualCurrency = $state('EUR');
	let isAutoUpdate = $state(true);
	let manualLiquidity = $state<'available' | 'locked'>('available');
	let manualType = $state<AssetType>(defaultType || 'ETF');

	// Real Estate State
	let manualAddress = $state('');
	let manualMonthlyRent = $state(0);
	let manualMonthlyTaxes = $state(0);
	let manualMonthlyBills = $state(0);

	// P2P State
	let manualCapitalInvestedPrev = $state(0);
	let manualInvestmentThisMonth = $state(0);
	let manualMoneyReceivedThisMonth = $state(0);
	let manualCashDrag = $state(0);

	// Initialize if editing
	if (assetToEdit) {
		manualName = assetToEdit.name;
		manualSymbol = assetToEdit.symbol || '';
		manualQuantity = assetToEdit.quantity || 0;
		manualValue = assetToEdit.value;
		manualPrice =
			assetToEdit.price || (assetToEdit.quantity ? assetToEdit.value / assetToEdit.quantity : 0);
		const initialPrice =
			assetToEdit.price || (assetToEdit.quantity ? assetToEdit.value / assetToEdit.quantity : 0);
		manualAverageBuyPrice = assetToEdit.averageBuyPrice || initialPrice;
		manualCurrency = assetToEdit.currency;
		isAutoUpdate = assetToEdit.isAutoUpdate ?? false;
		manualLiquidity = assetToEdit.liquidity || 'available';
		manualType = assetToEdit.type;

		// Real Estate
		manualAddress = assetToEdit.address || '';
		manualMonthlyRent = assetToEdit.monthlyRent || 0;
		manualMonthlyTaxes = assetToEdit.monthlyTaxes || 0;
		manualMonthlyBills = assetToEdit.monthlyBills || 0;

		// P2P
		manualCapitalInvestedPrev = assetToEdit.capitalInvestedPreviousMonth || 0;
		manualInvestmentThisMonth = assetToEdit.investmentThisMonth || 0;
		manualMoneyReceivedThisMonth = assetToEdit.moneyReceivedThisMonth || 0;
		manualCashDrag = assetToEdit.cashDrag || 0;
	} else {
		manualType = defaultType || 'ETF';
	}

	// Derive activeTab based on manualType
	let activeTab = $derived(['ETF', 'Stock', 'Crypto'].includes(manualType) ? 'search' : 'manual');

	async function handleSearch() {
		if (searchQuery.length < 3) return;
		isSearching = true;
		try {
			searchResults = await searchAsset(searchQuery, defaultType);
		} catch (e) {
			console.error(e);
		} finally {
			isSearching = false;
		}
	}

	function handleAddSearchResult(asset: Asset) {
		// Pre-fill manual entry form
		manualName = asset.name;
		manualSymbol = asset.symbol || '';
		manualCurrency = asset.currency;
		manualPrice = asset.price || 0;
		manualAverageBuyPrice = manualPrice; // Default buy price to current price
		isAutoUpdate = asset.isAutoUpdate ?? true;

		// Reset values
		manualQuantity = 0;
		manualValue = 0;
		// Switch to manual tab
		activeTab = 'manual';
	}

	function handleManualAdd() {
		const newAsset: Asset = {
			id: assetToEdit?.id || crypto.randomUUID(),
			name: manualName,
			symbol: manualSymbol,
			type: manualType,
			quantity: manualQuantity,
			value: manualValue,
			currency: manualCurrency,
			price: manualPrice,
			averageBuyPrice: manualAverageBuyPrice,
			isAutoUpdate: isAutoUpdate,
			liquidity: manualType === 'Saving' ? manualLiquidity : undefined,
			// Real Estate
			address: manualType === 'RealEstate' ? manualAddress : undefined,
			monthlyRent: manualType === 'RealEstate' ? manualMonthlyRent : undefined,
			monthlyTaxes: manualType === 'RealEstate' ? manualMonthlyTaxes : undefined,
			monthlyBills: manualType === 'RealEstate' ? manualMonthlyBills : undefined,
			// P2P
			capitalInvestedPreviousMonth:
				manualType === 'P2PLending' ? manualCapitalInvestedPrev : undefined,
			investmentThisMonth: manualType === 'P2PLending' ? manualInvestmentThisMonth : undefined,
			moneyReceivedThisMonth:
				manualType === 'P2PLending' ? manualMoneyReceivedThisMonth : undefined,
			cashDrag: manualType === 'P2PLending' ? manualCashDrag : undefined
		};

		onadd(newAsset);
		onclose();
	}

	// Calculation Logic
	function handleQuantityChange(e: Event) {
		const qty = parseFloat((e.target as HTMLInputElement).value) || 0;
		manualQuantity = qty;
		if (manualPrice) {
			manualValue = parseFloat((qty * manualPrice).toFixed(2));
		}
	}

	function handlePriceChange(e: Event) {
		const price = parseFloat((e.target as HTMLInputElement).value) || 0;
		manualPrice = price;
		if (!assetToEdit) {
			manualAverageBuyPrice = price; // If adding new, assume buy price = current price initially
		}
		if (manualQuantity) {
			manualValue = parseFloat((manualQuantity * price).toFixed(2));
		}
	}

	function handleValueChange(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value) || 0;
		manualValue = val;
		if (!isAutoUpdate && manualQuantity > 0) {
			manualPrice = parseFloat((val / manualQuantity).toFixed(2));
		}
	}

	async function handleUpdatePrice() {
		if (!manualSymbol) return;
		const price = await fetchAssetPrice(manualSymbol, manualType);
		if (price !== null) {
			manualPrice = price;
			if (manualQuantity) {
				manualValue = parseFloat((manualQuantity * price).toFixed(2));
			}
		}
	}
</script>

<div
	class="modal-backdrop"
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Escape' && onclose()}
>
	<div
		class="modal-content"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<div class="modal-header">
			<h2>{assetToEdit ? 'Edit Asset' : `Add New ${defaultType}`}</h2>
			<button class="close-btn" onclick={onclose}>&times;</button>
		</div>

		{#if !assetToEdit && ['ETF', 'Stock', 'Crypto'].includes(defaultType || '')}
			<div class="tabs">
				<button
					class="tab-btn"
					class:active={activeTab === 'search'}
					onclick={() => (activeTab = 'search')}
				>
					Search
				</button>
				<button
					class="tab-btn"
					class:active={activeTab === 'manual'}
					onclick={() => (activeTab = 'manual')}
				>
					Manual Entry
				</button>
			</div>
		{/if}

		<div class="modal-body">
			{#if activeTab === 'search' && !assetToEdit}
				<div class="search-section">
					<div class="search-bar">
						<input
							type="text"
							placeholder={`Search ${defaultType} (min 3 chars)...`}
							bind:value={searchQuery}
							oninput={() => {
								if (searchQuery.length >= 3) handleSearch();
							}}
						/>
					</div>

					{#if isSearching}
						<div class="loading">Searching...</div>
					{:else if searchResults.length > 0}
						<ul class="results-list">
							{#each searchResults as result}
								<li>
									<div class="result-info">
										<span class="name">{result.name}</span>
										<span class="symbol">{result.symbol}</span>
										{#if result.price}
											<span class="price">
												{new Intl.NumberFormat('en-US', {
													style: 'currency',
													currency: result.currency
												}).format(result.price)}
											</span>
										{/if}
									</div>
									<button class="add-btn" onclick={() => handleAddSearchResult(result)}
										>Select</button
									>
								</li>
							{/each}
						</ul>
					{:else if searchQuery.length >= 3}
						<div class="no-results">No results found. Try manual entry.</div>
					{/if}
				</div>
			{:else}
				<div class="manual-form">
					<div class="form-group">
						<label for="name">Name</label>
						<input
							id="name"
							type="text"
							bind:value={manualName}
							placeholder={`e.g. ${defaultType === 'Crypto' ? 'Bitcoin' : defaultType === 'Stock' ? 'Apple Inc.' : defaultType === 'RealEstate' ? 'Milan Apartment' : defaultType === 'P2PLending' ? 'Mintos' : 'Vanguard S&P 500'}`}
						/>
					</div>

					{#if ['ETF', 'Stock', 'Crypto', 'Cash', 'PreciousMetal'].includes(manualType)}
						<div class="form-group">
							<label for="symbol">Symbol</label>
							<div class="input-group">
								<input
									id="symbol"
									type="text"
									bind:value={manualSymbol}
									placeholder={`e.g. ${manualType === 'Crypto' ? 'BTC' : manualType === 'Stock' ? 'AAPL' : manualType === 'Cash' ? 'USD' : manualType === 'PreciousMetal' ? 'XAU' : 'VOO'}`}
									onblur={() => isAutoUpdate && handleUpdatePrice()}
								/>
								{#if isAutoUpdate}
									<button class="icon-btn" onclick={handleUpdatePrice} title="Update Price">
										&#x21bb;
									</button>
								{/if}
							</div>
						</div>

						<div class="form-group checkbox-group">
							<input type="checkbox" id="autoUpdate" bind:checked={isAutoUpdate} />
							<label for="autoUpdate">Auto-update price from market</label>
						</div>
					{/if}

					{#if manualType === 'Saving'}
						<div class="form-group">
							<label for="liquidity">Liquidity</label>
							<select id="liquidity" bind:value={manualLiquidity}>
								<option value="available">Available Immediately</option>
								<option value="locked">Locked (1-5 days)</option>
							</select>
						</div>
					{/if}

					{#if ['ETF', 'Stock', 'Crypto', 'Cash', 'PreciousMetal'].includes(manualType)}
						<div class="form-row">
							<div class="form-group">
								<label for="quantity">Quantity</label>
								<input
									id="quantity"
									type="number"
									step="any"
									value={manualQuantity}
									oninput={handleQuantityChange}
								/>
							</div>
							<div class="form-group">
								<label for="price">Unit Price (Current)</label>
								<input
									id="price"
									type="number"
									step="0.01"
									value={manualPrice}
									oninput={handlePriceChange}
									disabled={isAutoUpdate}
								/>
							</div>
						</div>

						<div class="form-row">
							<div class="form-group">
								<label for="avgPrice">Avg. Buy Price</label>
								<input id="avgPrice" type="number" step="0.01" bind:value={manualAverageBuyPrice} />
							</div>
							<div class="form-group">
								<label for="currency">Currency</label>
								<input list="currency-options" id="currency" bind:value={manualCurrency} />
								<datalist id="currency-options">
									<option value="EUR"></option>
									<option value="USD"></option>
									<option value="GBP"></option>
									<option value="CHF"></option>
									<option value="JPY"></option>
									<option value="CAD"></option>
									<option value="AUD"></option>
								</datalist>
							</div>
						</div>
					{:else if ['RealEstate', 'P2PLending'].includes(manualType)}
						<div class="form-row">
							<div class="form-group">
								<label for="value">Current Value</label>
								<input id="value" type="number" step="0.01" bind:value={manualValue} />
							</div>
							<div class="form-group">
								<label for="avgPrice"
									>{manualType === 'RealEstate' ? 'Purchase Price' : 'Invested Amount'}</label
								>
								<input id="avgPrice" type="number" step="0.01" bind:value={manualAverageBuyPrice} />
							</div>
						</div>
						<div class="form-group">
							<label for="currency">Currency</label>
							<input list="currency-options-simple" id="currency" bind:value={manualCurrency} />
							<datalist id="currency-options-simple">
								<option value="EUR"></option>
								<option value="USD"></option>
								<option value="GBP"></option>
								<option value="CHF"></option>
								<option value="JPY"></option>
								<option value="CAD"></option>
								<option value="AUD"></option>
							</datalist>
						</div>

						{#if manualType === 'RealEstate'}
							<div class="form-group">
								<label for="address">Address (Google Maps Link)</label>
								<input
									id="address"
									type="text"
									bind:value={manualAddress}
									placeholder="e.g. Via Roma 1, Milano"
								/>
							</div>
							<div class="form-row">
								<div class="form-group">
									<label for="rent">Monthly Rent</label>
									<input id="rent" type="number" step="0.01" bind:value={manualMonthlyRent} />
								</div>
								<div class="form-group">
									<label for="taxes">Monthly Taxes</label>
									<input id="taxes" type="number" step="0.01" bind:value={manualMonthlyTaxes} />
								</div>
								<div class="form-group">
									<label for="bills">Monthly Bills</label>
									<input id="bills" type="number" step="0.01" bind:value={manualMonthlyBills} />
								</div>
							</div>
						{/if}

						{#if manualType === 'P2PLending'}
							<div class="form-row">
								<div class="form-group">
									<label for="capPrev">Capital Invested (Prev Month)</label>
									<input
										id="capPrev"
										type="number"
										step="0.01"
										bind:value={manualCapitalInvestedPrev}
									/>
								</div>
								<div class="form-group">
									<label for="invThis">Investment This Month</label>
									<input
										id="invThis"
										type="number"
										step="0.01"
										bind:value={manualInvestmentThisMonth}
									/>
								</div>
							</div>
							<div class="form-row">
								<div class="form-group">
									<label for="moneyRec">Money Received (This Month)</label>
									<input
										id="moneyRec"
										type="number"
										step="0.01"
										bind:value={manualMoneyReceivedThisMonth}
									/>
								</div>
								<div class="form-group">
									<label for="cashDrag">Cash Drag</label>
									<input id="cashDrag" type="number" step="0.01" bind:value={manualCashDrag} />
								</div>
							</div>
						{/if}
					{:else}
						<!-- Simple Value Input for Accounts/Material -->
						<div class="form-row">
							<div class="form-group">
								<label for="value">Value</label>
								<input id="value" type="number" step="0.01" bind:value={manualValue} />
							</div>
							<div class="form-group">
								<label for="currency">Currency</label>
								<input list="currency-options-simple" id="currency" bind:value={manualCurrency} />
								<datalist id="currency-options-simple">
									<option value="EUR"></option>
									<option value="USD"></option>
									<option value="GBP"></option>
									<option value="CHF"></option>
									<option value="JPY"></option>
									<option value="CAD"></option>
									<option value="AUD"></option>
								</datalist>
							</div>
						</div>
					{/if}

					{#if ['ETF', 'Stock', 'Crypto', 'Cash', 'PreciousMetal'].includes(manualType)}
						<div class="form-row">
							<div class="form-group">
								<label for="value">Total Value (Current)</label>
								<input
									id="value"
									type="number"
									step="0.01"
									value={manualValue}
									oninput={handleValueChange}
								/>
							</div>
						</div>
					{/if}

					<div class="modal-actions">
						<button class="cancel-btn" onclick={onclose}>Cancel</button>
						<button class="submit-btn" onclick={handleManualAdd}>
							{assetToEdit ? 'Save Changes' : 'Add Asset'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	.modal-content {
		background: var(--surface-color, white);
		border-radius: 16px;
		width: 90%;
		max-width: 500px;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		max-height: 90vh;
		overflow-y: auto;
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		color: var(--text-primary, #000);
	}
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--text-secondary);
	}
	.tabs {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	.tab-btn {
		background: none;
		border: none;
		padding: 0.5rem 1rem;
		cursor: pointer;
		font-weight: 500;
		color: var(--text-secondary);
		border-bottom: 2px solid transparent;
	}
	.tab-btn.active {
		color: var(--primary-color);
		border-bottom-color: var(--primary-color);
	}
	.search-bar input,
	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		font-size: 1rem;
	}
	.results-list {
		list-style: none;
		padding: 0;
		margin-top: 1rem;
		max-height: 300px;
		overflow-y: auto;
	}
	.results-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border-bottom: 1px solid var(--border-color);
	}
	.result-info {
		display: flex;
		flex-direction: column;
	}
	.symbol {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}
	.price {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--primary-color);
	}
	.add-btn {
		background: var(--primary-color);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
	}
	.modal-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}
	.submit-btn,
	.cancel-btn {
		flex: 1;
		padding: 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		font-size: 1rem;
		border: none;
	}
	.submit-btn {
		background: var(--primary-color);
		color: white;
	}
	.cancel-btn {
		background: var(--surface-hover, #f0f0f0);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
	}
	.cancel-btn:hover {
		background: var(--border-color);
	}
	.manual-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.form-row {
		display: flex;
		gap: 1rem;
	}
	.form-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.checkbox-group {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
	.checkbox-group input {
		width: auto;
	}
	label {
		font-size: 0.9rem;
		color: var(--text-primary, #333);
		font-weight: 500;
	}
	.input-group {
		display: flex;
		gap: 0.5rem;
	}
	.icon-btn {
		background: var(--surface-hover, #f0f0f0);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		cursor: pointer;
		padding: 0 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
	}
	.icon-btn:hover {
		background: var(--border-color);
	}
</style>
