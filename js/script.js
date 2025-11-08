document.addEventListener('DOMContentLoaded', () => {

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuPanel = document.getElementById('menu-panel');
    const closeMenuBtn = document.getElementById('close-menu-btn');

    if (menuBtn && mobileMenu && menuPanel && closeMenuBtn) {
        const openMenu = () => {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                menuPanel.classList.remove('-translate-x-full');
            }, 10);
        };

        const closeMenu = () => {
            menuPanel.classList.add('-translate-x-full');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        };

        menuBtn.addEventListener('click', openMenu);
        closeMenuBtn.addEventListener('click', closeMenu);

        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMenu();
            }
        });
    }

    const apiEndpoint = 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365';
    const siteConfigApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/0353d142-7372-443d-adb7-63bafdd0791e';

    const sectionMappings = {
        popularToday: 'popular-today-container',
        latestRelease: 'latest-release-container',
        movies: 'movies-container',
        upcoming: 'upcoming-container',
        dropped: 'dropped-container'
    };

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

            // Populate Announcement
            if (config.announcement) {
                const announcementTitle = document.getElementById('announcement-title');
                if (announcementTitle && config.announcement.title) announcementTitle.textContent = config.announcement.title;
                const announcementBody = document.getElementById('announcement-body');
                if (announcementBody && config.announcement.body) announcementBody.textContent = config.announcement.body;
                const announcementHighlight = document.getElementById('announcement-highlight');
                if (announcementHighlight && config.announcement.highlight) announcementHighlight.textContent = config.announcement.highlight;
                const announcementClosing = document.getElementById('announcement-closing');
                if (announcementClosing && config.announcement.closing) announcementClosing.textContent = config.announcement.closing;
            }
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

    const displaySlider = (sliderData) => {
        const container = document.getElementById('slider-container');
        if (!container) return;

        if (sliderData && sliderData.length > 0) {
            const firstSlide = sliderData[0];
            container.innerHTML = `
                <a href="data/details.html?id=${firstSlide.id}" class="block relative">
                    <img src="${firstSlide.imageUrl}" alt="${firstSlide.title}" class="w-full h-auto aspect-video object-cover rounded-lg">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                        <h2 class="text-white text-lg font-bold">${firstSlide.title}</h2>
                    </div>
                </a>
            `;
        } else {
             container.innerHTML = '<p class="text-center text-gray-500 p-8">No slider content available.</p>';
        }
    };

    const displaySections = (allContent) => {
         for (const sectionKey in sectionMappings) {
            const container = document.getElementById(sectionMappings[sectionKey]);
            if (container) {
                const sectionData = allContent.filter(item => item.sections && item.sections.includes(sectionKey));
                if (sectionData.length > 0) {
                    container.innerHTML = sectionData.map(item => createCard(item)).join('');
                } else {
                    container.innerHTML = `<p class="col-span-full text-gray-500">No content available in this section.</p>`;
                }
            }
        }
    };
    
    async function loadAllContent() {
        try {
            const response = await fetch(apiEndpoint + `?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load content data');
            const allContent = await response.json();

            const sliderItems = allContent.filter(item => item.sections && item.sections.includes('slider'));
            displaySlider(sliderItems);
            displaySections(allContent);

        } catch (error) {
            console.error('Error loading content:', error);
            const sliderContainer = document.getElementById('slider-container');
            if (sliderContainer) {
                sliderContainer.innerHTML = `<p class="text-center text-red-500 p-8">Could not load slider content.</p>`;
            }
            for (const sectionKey in sectionMappings) {
                 const container = document.getElementById(sectionMappings[sectionKey]);
                 if(container) container.innerHTML = `<p class="col-span-full text-red-500">Could not load content.</p>`;
            }
        }
    }

    // Initial Load
    loadSiteConfig();
    loadAllContent();
});