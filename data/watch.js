document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365';
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');
    const episodeNumber = params.get('ep');

    const playerContainer = document.getElementById('player-container');
    const titleContainer = document.getElementById('title-container');
    const episodeListContainer = document.getElementById('episode-list-container');

    if (!contentId || !episodeNumber) {
        playerContainer.innerHTML = '<p class="text-red-500 text-center">Invalid content ID or episode number.</p>';
        return;
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

            document.title = `Watching ${item.title} - Ep ${currentEpisode.ep} - Anichin`;

            // Set Player
            playerContainer.innerHTML = `
                <iframe src="${currentEpisode.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full aspect-video"></iframe>
            `;

            // Set Title
            titleContainer.innerHTML = `
                <h1 class="text-2xl font-bold text-white">${item.title}</h1>
                <p class="text-gray-400">Episode ${currentEpisode.ep}</p>
            `;

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
        }
    }

    loadVideo();
});