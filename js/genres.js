document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365';
    const siteConfigApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/0353d142-7372-443d-adb7-63bafdd0791e';

    const genresContent = document.getElementById('genres-content');
    const pageTitle = document.getElementById('page-title');

    async function loadSiteConfig() {
        try {
            const response = await fetch(`${siteConfigApiUrl}?v=${new Date().getTime()}`);
            if (!response.ok) return; // Fail silently
            const config = await response.json();

            // Populate Header
            const headerTitle = document.getElementById('header-title');
            const headerSubtitle = document.getElementById('header-subtitle');
            if (headerTitle && config.headerTitle) headerTitle.textContent = config.headerTitle;
            if (headerSubtitle && config.headerSubtitle) headerSubtitle.textContent = config.headerSubtitle;

            // Populate Footer
            const footerCopyright = document.getElementById('footer-copyright');
            const footerDisclaimer = document.getElementById('footer-disclaimer');
            if (footerCopyright && config.footerCopyright) footerCopyright.innerHTML = config.footerCopyright;
            if (footerDisclaimer && config.footerDisclaimer) footerDisclaimer.textContent = config.footerDisclaimer;
        } catch (error) {
            console.warn('Could not load site config.', error);
        }
    }

    const createCard = (item) => {
        const isMovie = item.type === 'Movie';
        const ongoingIcon = !isMovie && item.ongoing ? `<span class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"><i class="fa-solid fa-clock"></i></span>` : '';
        const subbedBadge = item.subbed ? `<div class="absolute bottom-2 right-2"><span class="bg-yellow-500 text-black text-xs px-2 py-1 rounded">Sub</span></div>` : '';
        const episodeBadge = !isMovie && item.episode ? `<div class="absolute bottom-2 left-2"><span class="text-white text-xs font-bold">${item.episode}</span></div>` : '';
        const completedBanner = isMovie && item.status === 'Completed' ? `<div class="absolute -top-8 -left-8 w-28 h-12 bg-green-500 transform -rotate-45 flex items-end justify-center"><span class="text-white text-xs font-bold pb-1">COMPLETED</span></div>` : '';
        const typeBadgeColor = isMovie ? 'bg-purple-600' : 'bg-red-600';

        return `
            <a href="data/details.html?id=${item.id}" class="bg-[#1a1a1a] rounded-lg overflow-hidden group block">
                <div class="relative overflow-hidden">
                    <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-auto aspect-[2/3] object-cover transform group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    ${completedBanner}
                    <span class="absolute top-2 left-2 ${typeBadgeColor} text-white text-xs px-2 py-1 rounded">${item.type}</span>
                    ${ongoingIcon}
                    ${episodeBadge}
                    ${subbedBadge}
                </div>
                <div class="p-2">
                    <h3 class="font-semibold text-sm truncate group-hover:text-red-500" title="${item.title}">${item.title}</h3>
                </div>
            </a>
        `;
    };

    const loadGenres = async () => {
        try {
            const response = await fetch(`${apiEndpoint}?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load content data');
            const allContent = await response.json();

            // Sort content by ID descending (newest first)
            allContent.sort((a, b) => b.id - a.id);

            const params = new URLSearchParams(window.location.search);
            const selectedGenre = params.get('genre');

            if (selectedGenre) {
                // Display content for a specific genre
                const genreName = decodeURIComponent(selectedGenre);
                document.title = `${genreName} - Genres - Donghua动画`;
                if (pageTitle) pageTitle.textContent = genreName;
                
                const filteredContent = allContent.filter(item => item.genres && item.genres.includes(genreName));
                
                if (filteredContent.length > 0) {
                    const contentGrid = document.createElement('div');
                    contentGrid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';
                    contentGrid.innerHTML = filteredContent.map(item => createCard(item)).join('');
                    genresContent.innerHTML = ''; // Clear loading/previous state
                    genresContent.appendChild(contentGrid);
                } else {
                    genresContent.innerHTML = `<p class="text-center text-gray-400 mt-10">No content found for the genre \"${genreName}\".</p>`;
                }

            } else {
                // Display the list of all genres
                if (pageTitle) pageTitle.textContent = 'Genres';
                const allGenres = new Set();
                allContent.forEach(item => {
                    if (item.genres && Array.isArray(item.genres)) {
                        item.genres.forEach(genre => allGenres.add(genre));
                    }
                });

                if (allGenres.size > 0) {
                    const sortedGenres = [...allGenres].sort();
                    const genreList = document.createElement('div');
                    genreList.className = 'flex flex-wrap gap-3 justify-center';
                    genreList.innerHTML = sortedGenres.map(genre => 
                        `<a href="genres.html?genre=${encodeURIComponent(genre)}" class="bg-[#2a2a2a] hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                            ${genre}
                        </a>`
                    ).join('');
                    genresContent.innerHTML = '';
                    genresContent.appendChild(genreList);
                } else {
                    genresContent.innerHTML = `<p class="text-center text-gray-400 mt-10">No genres available at the moment.</p>`;
                }
            }
        } catch (error) {
            console.error('Error loading genres:', error);
            genresContent.innerHTML = `<p class="text-center text-red-500 mt-10">Could not load content.</p>`;
        }
    };

    loadSiteConfig();
    loadGenres();
});