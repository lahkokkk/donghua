document.addEventListener('DOMContentLoaded', () => {

    const apiEndpoints = {
        slider: 'https://jsonbin-clone.bisay510.workers.dev/8c2c4f6a-9e6d-4eb1-8831-c9e3d626d31e',
        popularToday: 'https://jsonbin-clone.bisay510.workers.dev/2c635ddd-487d-44f3-9162-02d96640bb2f',
        latestRelease: 'https://jsonbin-clone.bisay510.workers.dev/6f5ea28f-8c0b-4c88-be70-9d8b23a58ace',
        movies: 'https://jsonbin-clone.bisay510.workers.dev/74ed9c39-a204-4af4-a06b-43b49b06d91a',
        upcoming: 'https://jsonbin-clone.bisay510.workers.dev/9a214abc-a87a-441c-bb36-050784b03a1f',
        dropped: 'https://jsonbin-clone.bisay510.workers.dev/734bc969-30c7-4c70-a308-b88e303dd7c1'
    };

    const sectionMappings = {
        popularToday: 'popular-today-container',
        latestRelease: 'latest-release-container',
        movies: 'movies-container',
        upcoming: 'upcoming-container',
        dropped: 'dropped-container'
    };

    // Card Generation Functions

    const createDonghuaCard = (item) => {
        const ongoingIcon = item.ongoing ? `<span class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"><i class="fa-solid fa-clock"></i></span>` : '';
        const subbedBadge = item.subbed ? `<div class="absolute bottom-2 right-2"><span class="bg-yellow-500 text-black text-xs px-2 py-1 rounded">Sub</span></div>` : '';
        const episodeBadge = item.episode ? `<div class="absolute bottom-2 left-2"><span class="text-white text-xs font-bold">${item.episode}</span></div>` : '';

        return `
            <div class="bg-[#1a1a1a] rounded-lg overflow-hidden group">
                <div class="relative">
                    <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-auto aspect-[2/3] object-cover transform group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <span class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">${item.type || 'Donghua'}</span>
                    ${ongoingIcon}
                    ${episodeBadge}
                    ${subbedBadge}
                </div>
                <div class="p-2">
                    <h3 class="font-semibold text-sm truncate group-hover:text-red-500" title="${item.title}">${item.title}</h3>
                </div>
            </div>
        `;
    };

    const createMovieCard = (item) => {
        const subbedBadge = item.subbed ? `<div class="absolute bottom-2 right-2"><span class="bg-yellow-500 text-black text-xs px-2 py-1 rounded">Sub</span></div>` : '';
        const completedBanner = item.status === 'Completed' ? `<div class="absolute -top-8 -left-8 w-28 h-12 bg-green-500 transform -rotate-45 flex items-end justify-center"><span class="text-white text-xs font-bold pb-1">COMPLETED</span></div>` : '';

        return `
            <div class="bg-[#1a1a1a] rounded-lg overflow-hidden group">
                <div class="relative overflow-hidden">
                    <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-auto aspect-[2/3] object-cover transform group-hover:scale-105 transition-transform duration-300">
                    ${completedBanner}
                    <span class="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">${item.type || 'Movie'}</span>
                    ${subbedBadge}
                </div>
                <div class="p-2">
                    <h3 class="font-semibold text-sm truncate group-hover:text-red-500" title="${item.title}">${item.title}</h3>
                </div>
            </div>
        `;
    };
    
    // Data Loading Functions
    
    async function loadSlider() {
        const container = document.getElementById('slider-container');
        if (!container) return;

        try {
            const response = await fetch(apiEndpoints.slider + `?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load slider data');
            const sliderData = await response.json();

            if (sliderData && sliderData.length > 0) {
                const firstSlide = sliderData[0];
                container.innerHTML = `
                    <img src="${firstSlide.imageUrl}" alt="${firstSlide.title}" class="w-full h-auto rounded-lg">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                        <h2 class="text-white text-lg font-bold">${firstSlide.title}</h2>
                    </div>
                    <div class="absolute top-1/2 -translate-y-1/2 left-2 text-white bg-black bg-opacity-50 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer text-lg">
                        <i class="fa-solid fa-chevron-left"></i>
                    </div>
                    <div class="absolute top-1/2 -translate-y-1/2 right-2 text-white bg-black bg-opacity-50 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer text-lg">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        ${sliderData.map((_, index) => `<span class="block w-2.5 h-2.5 ${index === 0 ? 'bg-white' : 'bg-white/50'} rounded-full"></span>`).join('')}
                    </div>
                `;
            } else {
                 container.innerHTML = '<p class="text-center text-gray-500 p-8">No slider content available.</p>';
            }
        } catch (error) {
            console.error('Error loading slider:', error);
            container.innerHTML = '<p class="text-center text-red-500 p-8">Could not load slider content.</p>';
        }
    }
    
    async function loadSection(sectionKey, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const response = await fetch(apiEndpoints[sectionKey] + `?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`Failed to load data for ${sectionKey}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                let contentHTML = '';
                const cardCreator = sectionKey === 'movies' ? createMovieCard : createDonghuaCard;
                data.forEach(item => {
                    contentHTML += cardCreator(item);
                });
                container.innerHTML = contentHTML;
            } else {
                container.innerHTML = `<p class="col-span-full text-gray-500">No content available in this section.</p>`;
            }
        } catch (error) {
            console.error(`Error loading section ${sectionKey}:`, error);
            container.innerHTML = `<p class="col-span-full text-red-500">Could not load content for this section.</p>`;
        }
    }

    // Initial Load
    loadSlider();
    for (const key in sectionMappings) {
        loadSection(key, sectionMappings[key]);
    }
});
