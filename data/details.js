document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = 'https://ho.las635948.workers.dev/';
    const siteConfigApiUrl = 'https://ho.las635948.workers.dev/';
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');

    const contentArea = document.getElementById('content-area');

    if (!contentId) {
        contentArea.innerHTML = '<p class="text-red-500 text-center">Invalid content ID.</p>';
        return;
    }

    async function loadSiteConfig() {
        try {
            const response = await fetch(`${siteConfigApiUrl}?v=${new Date().getTime()}`);
            if (!response.ok) return; // Fail silently
            const config = await response.json();

            // Set Favicon
            const favicon = document.getElementById('favicon');
            if (favicon && config.favicon) {
                favicon.href = config.favicon;
            }

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

    async function loadContentDetails() {
        try {
            const response = await fetch(`${apiEndpoint}?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load content data');
            const allContent = await response.json();
            const item = allContent.find(c => c.id.toString() === contentId);

            if (!item) {
                contentArea.innerHTML = '<p class="text-red-500 text-center">Content not found.</p>';
                return;
            }

            document.title = `${item.title} - Donghua动画`;

            // Helper function to set meta tags
            const setMetaTag = (property, content) => {
                if (!content) return; // Don't set empty tags
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

            // Update Meta Tags
            const description = item.synopsis ? item.synopsis.substring(0, 160).trim() + '...' : `Details for ${item.title}`;
            const title = `${item.title} - Donghua动画`;

            setMetaTag('description', description);
            setMetaTag('keywords', item.metaTags);
            setMetaTag('og:title', title);
            setMetaTag('og:description', description);
            setMetaTag('og:image', item.imageUrl);
            setMetaTag('og:type', 'video.tv_show');
            setMetaTag('og:url', window.location.href);
            setMetaTag('twitter:card', 'summary_large_image');

            const episodeListHTML = item.episodes && item.episodes.length > 0 
                ? item.episodes.map(ep => 
                    `<li><a href="watch.html?id=${item.id}&ep=${ep.ep}" class="block bg-[#2a2a2a] hover:bg-red-600 p-3 rounded-md transition-colors">Episode ${ep.ep}</a></li>`
                  ).join('')
                : '<li><p class="text-gray-500">No episodes available yet.</p></li>';

            const genreListHTML = item.genres && item.genres.length > 0
                ? item.genres.map(genre => 
                    `<a href="../genres.html?genre=${encodeURIComponent(genre)}" class="bg-[#2a2a2a] hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-full transition-colors">${genre}</a>`
                  ).join('')
                : '';

            contentArea.innerHTML = `
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="md:w-1/3 flex-shrink-0">
                        <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-auto rounded-lg shadow-lg">
                    </div>
                    <div class="md:w-2/3">
                        <h1 class="text-3xl font-bold text-white mb-2">${item.title}</h1>
                        <div class="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                            <span>${item.type}</span>
                            ${item.subbed ? '<span><i class="fa-solid fa-closed-captioning"></i> Subbed</span>' : ''}
                            ${item.ongoing ? '<span><i class="fa-solid fa-clock"></i> Ongoing</span>' : ''}
                        </div>
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${genreListHTML}
                        </div>
                        
                        <div class="bg-[#1a1a1a] p-4 rounded-lg">
                            <!-- Tabs -->
                            <div class="border-b border-gray-700 mb-4">
                                <nav class="-mb-px flex space-x-6" id="tabs">
                                    <button class="tab-btn active text-white border-b-2 border-red-500 py-2 px-1 text-sm font-medium">Synopsis</button>
                                    <button class="tab-btn text-gray-400 hover:text-white hover:border-gray-500 py-2 px-1 text-sm font-medium border-b-2 border-transparent">Episodes</button>
                                </nav>
                            </div>
                            <!-- Tab Content -->
                            <div id="tab-content">
                                <div class="tab-pane active">
                                    <h2 class="text-lg font-semibold text-white mb-2">Synopsis</h2>
                                    <p class="text-gray-400 leading-relaxed">${item.synopsis || 'No synopsis available.'}</p>
                                </div>
                                <div class="tab-pane hidden">
                                    <h2 class="text-lg font-semibold text-white mb-2">Episode List</h2>
                                    <ul class="space-y-2 max-h-96 overflow-y-auto pr-2">
                                        ${episodeListHTML}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Tab switching logic
            const tabs = contentArea.querySelectorAll('.tab-btn');
            const panes = contentArea.querySelectorAll('.tab-pane');
            tabs.forEach((tab, index) => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active', 'text-white', 'border-red-500'));
                    tab.classList.add('active', 'text-white', 'border-red-500');
                    panes.forEach(p => p.classList.add('hidden'));
                    panes[index].classList.remove('hidden');
                });
            });

        } catch (error) {
            console.error('Error loading content details:', error);
            contentArea.innerHTML = '<p class="text-red-500 text-center">Could not load content details.</p>';
        }
    }

    loadSiteConfig();
    loadContentDetails();
});