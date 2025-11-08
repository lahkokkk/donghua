document.addEventListener('DOMContentLoaded', () => {

    const apiEndpoints = {
        slider: 'https://jsonbin-clone.bisay510.workers.dev/8c2c4f6a-9e6d-4eb1-8831-c9e3d626d31e',
        allContent: 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365'
    };

    const sectionMappings = {
        popularToday: 'popular-today-container',
        latestRelease: 'latest-release-container',
        movies: 'movies-container',
        upcoming: 'upcoming-container',
        dropped: 'dropped-container'
    };

    const createCard = (item) => {
        const isMovie = item.type === 'Movie';
        const ongoingIcon = !isMovie && item.ongoing ? `<span class=\"absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs\"><i class=\"fa-solid fa-clock\"></i></span>` : '';
        const subbedBadge = item.subbed ? `<div class=\"absolute bottom-2 right-2\"><span class=\"bg-yellow-500 text-black text-xs px-2 py-1 rounded\">Sub</span></div>` : '';
        const episodeBadge = !isMovie && item.episode ? `<div class=\"absolute bottom-2 left-2\"><span class=\"text-white text-xs font-bold\">${item.episode}</span></div>` : '';
        const completedBanner = isMovie && item.status === 'Completed' ? `<div class=\"absolute -top-8 -left-8 w-28 h-12 bg-green-500 transform -rotate-45 flex items-end justify-center\"><span class=\"text-white text-xs font-bold pb-1\">COMPLETED</span></div>` : '';
        const typeBadgeColor = isMovie ? 'bg-purple-600' : 'bg-red-600';

        return `
            <a href=\"data/details.html?id=${item.id}\" class=\"bg-[#1a1a1a] rounded-lg overflow-hidden group block\">
                <div class=\"relative overflow-hidden\">
                    <img src=\"${item.imageUrl}\" alt=\"${item.title}\" class=\"w-full h-auto aspect-[2/3] object-cover transform group-hover:scale-105 transition-transform duration-300\">
                    <div class=\"absolute inset-0 bg-gradient-to-t from-black/70 to-transparent\"></div>
                    ${completedBanner}
                    <span class=\"absolute top-2 left-2 ${typeBadgeColor} text-white text-xs px-2 py-1 rounded\">${item.type}</span>
                    ${ongoingIcon}
                    ${episodeBadge}
                    ${subbedBadge}
                </div>
                <div class=\"p-2\">
                    <h3 class=\"font-semibold text-sm truncate group-hover:text-red-500\" title=\"${item.title}\">${item.title}</h3>
                </div>
            </a>
        `;
    };
    
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
                    <img src=\"${firstSlide.imageUrl}\" alt=\"${firstSlide.title}\" class=\"w-full h-auto rounded-lg\">
                    <div class=\"absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg\"></div>
                    <div class=\"absolute bottom-0 left-0 right-0 p-4\">
                        <h2 class=\"text-white text-lg font-bold\">${firstSlide.title}</h2>
                    </div>
                `;
            } else {
                 container.innerHTML = '<p class=\"text-center text-gray-500 p-8\">No slider content available.</p>';
            }
        } catch (error) {
            console.error('Error loading slider:', error);
            container.innerHTML = '<p class=\"text-center text-red-500 p-8\">Could not load slider content.</p>';
        }
    }
    
    async function loadAllSections() {
        try {
            const response = await fetch(apiEndpoints.allContent + `?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load content data');
            const allContent = await response.json();

            for (const sectionKey in sectionMappings) {
                const container = document.getElementById(sectionMappings[sectionKey]);
                if (container) {
                    const sectionData = allContent.filter(item => item.sections && item.sections.includes(sectionKey));
                    if (sectionData.length > 0) {
                        container.innerHTML = sectionData.map(item => createCard(item)).join('');
                    } else {
                        container.innerHTML = `<p class=\"col-span-full text-gray-500\">No content available in this section.</p>`;
                    }
                }
            }

        } catch (error) {
            console.error('Error loading sections:', error);
            for (const sectionKey in sectionMappings) {
                 const container = document.getElementById(sectionMappings[sectionKey]);
                 if(container) container.innerHTML = `<p class=\"col-span-full text-red-500\">Could not load content.</p>`;
            }
        }
    }

    // Initial Load
    loadSlider();
    loadAllSections();
});