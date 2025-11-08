document.addEventListener('DOMContentLoaded', () => {

    const apiEndpoint = 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365';
    const siteConfigApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/0353d142-7372-443d-adb7-63bafdd0791e';

    // This function can be defined globally or imported if using modules.
    // For simplicity, we'll redefine it here.
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


    async function loadMovies() {
        const container = document.getElementById('movies-grid');
        if (!container) return;

        try {
            const response = await fetch(apiEndpoint + `?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load content data');
            const allContent = await response.json();

            const movies = allContent.filter(item => item.sections && item.sections.includes('movies'));
            
            if (movies.length > 0) {
                container.innerHTML = movies.map(item => createCard(item)).join('');
            } else {
                container.innerHTML = `<p class="col-span-full text-gray-500">No movies available at the moment.</p>`;
            }

        } catch (error) {
            console.error('Error loading movies:', error);
            container.innerHTML = `<p class="col-span-full text-red-500">Could not load movies.</p>`;
        }
    }

    // Initial Load
    loadSiteConfig();
    loadMovies();

});