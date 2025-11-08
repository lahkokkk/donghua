document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365';
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');

    const contentArea = document.getElementById('content-area');

    if (!contentId) {
        contentArea.innerHTML = '<p class="text-red-500 text-center">Invalid content ID.</p>';
        return;
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

            const episodeListHTML = item.episodes && item.episodes.length > 0 
                ? item.episodes.map(ep => 
                    `<li><a href="watch.html?id=${item.id}&ep=${ep.ep}" class="block bg-[#2a2a2a] hover:bg-red-600 p-3 rounded-md transition-colors">Episode ${ep.ep}</a></li>`
                  ).join('')
                : '<li><p class="text-gray-500">No episodes available yet.</p></li>';

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

    loadContentDetails();
});