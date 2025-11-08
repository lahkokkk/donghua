// KODE INI UNTUK search.js
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results');

    if (!searchBtn || !searchModal || !closeSearchBtn || !searchInput || !searchResultsContainer) {
        console.warn('Search elements not found. Search functionality disabled.');
        return;
    }
    
    // =======================================================
    // PERBAIKAN: Gunakan path API lokal dari Worker
    const apiEndpoint = '/api/content';
    // =======================================================
    
    let allContent = [];
    let isFetched = false;

    const openModal = () => {
        searchModal.classList.remove('hidden');
        searchModal.classList.add('flex');
        searchInput.focus();
        if (!isFetched) {
            fetchAllContent();
        }
    };

    const closeModal = () => {
        searchModal.classList.add('hidden');
        searchModal.classList.remove('flex');
        searchInput.value = '';
        searchResultsContainer.innerHTML = '';
    };

    const fetchAllContent = async () => {
        searchResultsContainer.innerHTML = '<p class="text-gray-400 p-4">Loading data...</p>';
        try {
            // Mengambil data dari /api/content
            const res = await fetch(`${apiEndpoint}?v=${new Date().getTime()}`);
            if (!res.ok) throw new Error('Network response was not ok');
            allContent = await res.json();
            isFetched = true;
            searchResultsContainer.innerHTML = '<p class="text-gray-500 p-4">Start typing to search.</p>';
        } catch (error) {
            console.error('Failed to fetch search data:', error);
            searchResultsContainer.innerHTML = '<p class="text-red-500 p-4">Could not load search data.</p>';
        }
    };

    const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            searchResultsContainer.innerHTML = '<p class="text-gray-500 p-4">Start typing to search.</p>';
            return;
        }

        if (!isFetched) {
             searchResultsContainer.innerHTML = '<p class="text-gray-400 p-4">Still loading data, please wait...</p>';
             return;
        }

        const results = allContent.filter(item => item.title.toLowerCase().includes(query));

        if (results.length > 0) {
            // Determine correct path for details.html
            // This logic dynamically adjusts the link path based on the current page.
            let detailPathPrefix = '';
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/data/')) {
                detailPathPrefix = 'data/';
            }

            searchResultsContainer.innerHTML = results.map(item => `
                <a href="${detailPathPrefix}details.html?id=${item.id}" class="block p-3 hover:bg-[#2a2a2a] rounded-md transition-colors">
                    <div class="flex items-center gap-4">
                        <img src="${item.imageUrl}" alt="${item.title}" class="w-12 h-16 object-cover rounded-md flex-shrink-0">
                        <div>
                            <h4 class="font-semibold text-white">${item.title}</h4>
                            <p class="text-sm text-gray-400">${item.type}</p>
                        </div>
                    </div>
                </a>
            `).join('');
        } else {
            searchResultsContainer.innerHTML = `<p class="text-gray-500 p-4">No results found for \"${searchInput.value}\".</p>`;
        }
    };
    
    // Simple debounce to prevent searching on every key press
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300);
    });

    searchBtn.addEventListener('click', openModal);
    closeSearchBtn.addEventListener('click', closeModal);
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !searchModal.classList.contains('hidden')) {
            closeModal();
        }
    });
});
