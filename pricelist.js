jQuery(document).ready(function( $ ){
	const vanitySizeFilterContainer = document.querySelector("#price-list-vanity-size-filter");
	let collectionTitle = document.querySelector("#collection-name h1").innerText;
	
	//================================Adding auto scroll when user clicks on accordion filters==================================//
	const accordions = document.querySelectorAll(".eael-accordion-header");
// 	if(collectionTitle !== "OPERA COLLECTION"){
// 		accordions.forEach(function(accordion){
// 			//creating id selector.
// 			const text = accordion.id;
// 			const item = text.split("-filter")[0];
// 			const id = "#" + item + "-section";
					
// 			//adding event listener to each accordion to scroll to corresponding section.
// 			const parentElement = accordion.parentElement;
// 			parentElement.addEventListener("click",()=>{
// 				document.querySelector(id).scrollIntoView({behavior: 'smooth'});
// 			})
// 		})	
// 	}
	
	
	
	//================================adding loading spinner on ajax call (listing grid and filters)=================================//
	
	let isFirstRender = true;
	let resetFiltersQueue = [];
	let currentFilteredListings = [];
	const NumOfActiveListingFilters = {};
	const listingContainers = document.querySelectorAll("#listing-templates-container > .elementor-widget-template");	
	
	//----------HELPER FUNCTIONS-----------------//
	function addOverlayWithLoadingSpinnerToFilter(item,loadingSpinner){
		let filterName = item + "-filter";
		let filterContainer = document.querySelector(`[aria-labelledby="${filterName}"]`);
		
		let overlayLoadingSpinner = loadingSpinner.cloneNode(true);
		overlayLoadingSpinner.id = "loading-spiner-overlay-" + item;
		
		let overlay = document.createElement("div");
		overlay.id = "loading-overlay";
		overlay.append(overlayLoadingSpinner);
		overlay.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			background-color: #ffffffbf;
			height: 100%;
			width: 100%;
			text-align: center;
			display: flex;
  			align-items: center;
			justify-content: center;
			color: #D1AA68;
			font-weight: 600;
		`;
		
		filterContainer.style.position = "relative";
		filterContainer.append(overlay);
		overlayLoadingSpinner.style.display = "flex";
	}
	
	function hideUnfilteredListingContainers(){
		listingContainers.forEach((listingContainer)=>{
			const listingContainerClass = listingContainer.classList[2];
			if(!currentFilteredListings.includes(listingContainerClass) || resetFiltersQueue.includes(listingContainerClass) || NumOfActiveListingFilters[listingContainerClass] === 0){
				listingContainer.style.display = "none";
				const index = currentFilteredListings.indexOf(listingContainerClass);
				if(index >= 0) currentFilteredListings.splice(index,1);
			}else{
				listingContainer.style.display = "";
			}
		})
	}
	
	function showAllListingContainers(){
		listingContainers.forEach((listingContainer)=>{
			listingContainer.style.display = "";
		})
	}
	
	//-------------------FILTER EVENTS---------------------//
	
	window.JetSmartFilters.events.subscribe('fiters/remove',(resetButton)=>{
		let filter = resetButton.queryId;
		let item = filter.split("-")[2];
		resetFiltersQueue.push(`${item}-container`);
	})
	
	window.JetSmartFilters.events.subscribe('activeItems/change',(activedFilters,type,listingSelector)=>{
		let item = listingSelector.split("-")[2];
		NumOfActiveListingFilters[`${item}-container`] = activedFilters.length;
	})
	
	window.JetSmartFilters.events.subscribe('ajaxFilters/start-loading', (type,listingSelector)=>{
		const listing = document.querySelector("#" + listingSelector);
		const item = listingSelector.split("-")[2];
		const loadingSpinner = document.querySelector(`#loading-spinner-${item}`);			
		
		addOverlayWithLoadingSpinnerToFilter(item,loadingSpinner);

		
		//----adds class of filtered container to current filtered container array.
		if(!currentFilteredListings.includes(`${item}-container`)) currentFilteredListings.push(`${item}-container`);
		hideUnfilteredListingContainers();
		console.log("num of active filter by item:",NumOfActiveListingFilters)
		console.log("current filters items:",currentFilteredListings)
		
		//-----------------------------------
		listing.style.display = "none";
		loadingSpinner.style.display = "flex";
	})
	
	window.JetSmartFilters.events.subscribe('ajaxFilters/end-loading', (type,listingSelector)=>{
		let listing = document.querySelector("#" + listingSelector);
		let item = listingSelector.split("-")[2];
		let loadingSpinner = document.querySelector(`#loading-spinner-${item}`);

		//-----------------------------
		let overlay = document.querySelector("#loading-overlay");
		overlay.remove();
		//-----------------------------
		
		listing.style.display = "";
		loadingSpinner.style.display = "none";
		
		//---change order of container
		if(resetFiltersQueue.length !== 0){
			let containerSelectorResetButton = document.querySelector(`.${resetFiltersQueue.shift()}`);
			containerSelectorResetButton.style.order = 1;
		}else if(NumOfActiveListingFilters[`${item}-container`] === 0){
			let containerSelectorResetButton = document.querySelector(`.${item}-container`);
			containerSelectorResetButton.style.order = 1;	 
		}else{
			let itemContainer = document.querySelector(`.${item}-container`);
			itemContainer.style.order = 0;	
		}
		
		if(currentFilteredListings.length === 0) showAllListingContainers();
		
	})
	
	
	//=====================================toggle buttons for filters and menu collection (responsive)===============================//
	
	const toggleButtonContainerFilter = document.querySelector(".toggle-filters");
    const toggleButtonContainerMenu = document.querySelector(".toggle-menu");
	
	const filtersContainer = document.querySelector(".main-filter-container");
	const menuCollections = document.querySelector(".menu-price-list-container");
	const toggleButton = document.querySelector(".toggle-filters [role=\"button\"]");

	
	toggleButtonContainerFilter.addEventListener("click",(e)=>{
		filtersContainer.classList.toggle("active");
		toggleButton.classList.contains("active-button") ? toggleButton.innerText = "show\nfilters" : toggleButton.innerText = "hide\nfilters";
		toggleButton.classList.toggle("active-button");
	})
	
	toggleButtonContainerMenu.addEventListener("click",(e)=>{
		menuCollections.classList.toggle("menu-active");
	})
	
	
	//==============================removing empty filter from wall units, addons=====================================================//
	setTimeout(()=>{
		const counters = document.querySelectorAll(`[data-query-id="listing-grid-addons"] .jet-filter-row`);
		counters.forEach((counter)=>{
			console.log(counter.querySelector(".value").innerText)
			const count = Number(counter.querySelector(".value").innerText);
			if(count === 0){
				counter.classList.add('empty-filter');
			}else{
				counter.querySelector(".jet-filters-counter").style.display = "none";
			}
		})
	},6000)
	
	setTimeout(()=>{
		const counters = document.querySelectorAll(`[data-query-id="listing-grid-wallunits"] .jet-filter-row`);
		counters.forEach((counter)=>{
			const count = Number(counter.querySelector(".value").innerText);
			if(count === 0){
				counter.classList.add('empty-filter');
			}else{
				counter.querySelector(".jet-filters-counter").style.display = "none";
			}
		})
	},9000)
	
	//================================================printing TEST!!!!=================================================//
	const printButton = document.querySelector("#print-button");
	printButton.addEventListener("click",(e)=>{
		window.print();
	})
	
});






