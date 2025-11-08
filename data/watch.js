document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = 'https://ho.las635948.workers.dev/';
    const siteConfigApiUrl = 'https://ho.las635948.workers.dev/';
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');
    const episodeNumber = params.get('ep');

    const playerContainer = document.getElementById('player-container');
    const titleContainer = document.getElementById('title-container');
    const episodeListContainer = document.getElementById('episode-list-container');
    const serverSelectionContainer = document.getElementById('server-selection-container');

    if (!contentId || !episodeNumber) {
        playerContainer.innerHTML = '<p class="text-red-500 text-center">Invalid content ID or episode number.</p>';
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

    async function loadVideo() {
        try {
            const response = await fetch(`${apiEndpoint}?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load content data');
            const allContent = await response.json();
            const item = allContent.find(c => c.id.toString() === contentId);

            if (!item || !item.episodes || item.episodes.length === 0) {
                throw new Error('Content or episodes not found.');
            }

            const currentEpisode = item.episodes.find(e => e.ep == episodeNumber);
            if (!currentEpisode) {
                 throw new Error('Specific episode not found.');
            }

            document.title = `Watching ${item.title} - Ep ${currentEpisode.ep} - Donghua动画`;

            // Update Meta Tags
            const setMetaTag = (property, content) => {
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

            const description = item.synopsis ? item.synopsis.substring(0, 160) + '...' : `Watch ${item.title} Episode ${currentEpisode.ep}`;

            setMetaTag('description', description);
            setMetaTag('og:title', `${item.title} - Episode ${currentEpisode.ep}`);
            setMetaTag('og:description', description);
            setMetaTag('og:image', item.imageUrl);
            setMetaTag('og:url', window.location.href);
            setMetaTag('og:type', 'video.episode');
            setMetaTag('twitter:card', 'summary_large_image');

            // Handle both old {url} and new {servers} episode format
            const servers = currentEpisode.servers || (currentEpisode.url ? [{name: 'Default', url: currentEpisode.url}] : []);

            if (!servers || servers.length === 0) {
                throw new Error('No video sources found for this episode.');
            }

            // Set Player with the first server
            playerContainer.innerHTML = `
                <iframe src="${servers[0].url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full aspect-video"></iframe>
            `;

            // Set Title
            titleContainer.innerHTML = `
                <h1 class="text-2xl font-bold text-white">${item.title}</h1>
                <p class="text-gray-400">Episode ${currentEpisode.ep}</p>
            `;

            // Populate server selection
            if (servers.length > 1) {
                const serverButtonsHTML = servers.map((server, index) => `
                    <button class="server-btn ${index === 0 ? 'bg-red-600' : 'bg-[#2a2a2a] hover:bg-red-700'} text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors" data-url="${server.url}">
                        ${server.name}
                    </button>
                `).join('');
                serverSelectionContainer.innerHTML = `
                    <h3 class="text-lg font-bold text-white mb-3">Pilih Server:</h3>
                    <div class="flex flex-wrap gap-2">
                        ${serverButtonsHTML}
                    </div>
                `;

                // Add event listeners to server buttons
                const serverButtons = serverSelectionContainer.querySelectorAll('.server-btn');
                serverButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        // Update iframe src
                        const playerIframe = playerContainer.querySelector('iframe');
                        if (playerIframe) {
                            playerIframe.src = button.dataset.url;
                        }
                        // Update button styles
                        serverButtons.forEach(btn => {
                            btn.classList.remove('bg-red-600');
                            btn.classList.add('bg-[#2a2a2a]', 'hover:bg-red-700');
                        });
                        button.classList.add('bg-red-600');
                        button.classList.remove('bg-[#2a2a2a]', 'hover:bg-red-700');
                    });
                });
            } else {
                serverSelectionContainer.innerHTML = ''; // Hide if only one server
                serverSelectionContainer.classList.add('hidden');
            }

            // Set Episode List
            const episodeListHTML = item.episodes.map(ep => {
                const isActive = ep.ep == episodeNumber;
                return `
                    <li>
                        <a href="watch.html?id=${item.id}&ep=${ep.ep}" class="block p-3 rounded-md transition-colors ${isActive ? 'bg-red-600 text-white' : 'bg-[#2a2a2a] hover:bg-red-700'}">
                           Episode ${ep.ep}
                        </a>
                    </li>
                `;
            }).join('');
            episodeListContainer.innerHTML = episodeListHTML;

        } catch (error) {
            console.error('Error loading video:', error);
            playerContainer.innerHTML = `<p class="text-red-500 text-center">Could not load video: ${error.message}</p>`;
            titleContainer.innerHTML = '';
            episodeListContainer.innerHTML = '';
            serverSelectionContainer.innerHTML = '';
        }
    }

    loadSiteConfig();
    loadVideo();
});