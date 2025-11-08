// KODE INI UNTUK movie.js
document.addEventListener('DOMContentLoaded', () => {
    // =======================================================
    // PERBAIKAN: Gunakan path API lokal dari Worker
    const apiEndpoint = '/api/content';
    const siteConfigApiUrl = '/api/config';
    // =======================================================

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
        const typeBadgeColor = isMovie ? 'bg-purple-600' : 'bg-red-600';

        return `
            <a href="data/details.html?id=${item.id}" class="bg-[#1a1a1a] rounded-lg overflow-hidden group block">
                <div class="relative overflow-hidden">
                    <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-auto aspect-[2/3] object-cover transform group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
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
            // Mengambil data dari /api/content
            const response = await fetch(apiEndpoint + `?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load content data');
            const allContent = await response.json();

            // Sort content by ID descending (newest first)
            allContent.sort((a, b) => b.id - a.id);

            const movies = allContent.filter(item => item.sections && item.sections.includes('movies'));

            // Meta tag client-side ini adalah fallback.
            const setMetaTag = (property, content) => {
                if (!content) return;
                let element = document.querySelector(`meta[name="${property}"], meta[property="${property}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    if (property.startsWith('og:')) {
                        element.setAttribute('property', property);
                    } else {
                        element.setAttribute('name', property);
                    }
                    document.head.appendChild(element);
                }
                element.setAttribute('content', content);
            };

            const siteTitle = 'Donghua动画';
            const pageTitleText = `Movies - ${siteTitle}`;
            document.title = pageTitleText;
            const description = 'Tonton film Donghua terbaru dengan subtitle Indonesia.';
            const firstMovieImage = movies.length > 0 ? movies[0].imageUrl : 'https://picsum.photos/1200/630';

            setMetaTag('description', description);
            setMetaTag('og:title', pageTitleText);
            setMetaTag('og:description', description);
            setMetaTag('og:image', firstMovieImage);
            setMetaTag('twitter:card', 'summary_large_image');
            setMetaTag('og:type', 'website');
            setMetaTag('og:url', window.location.href);
            
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
