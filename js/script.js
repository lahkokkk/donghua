document.addEventListener('DOMContentLoaded', () => {

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuPanel = document.getElementById('menu-panel');
    const closeMenuBtn = document.getElementById('close-menu-btn');

    if (menuBtn && mobileMenu && menuPanel && closeMenuBtn) {
        const openMenu = () => { mobileMenu.classList.remove('hidden'); setTimeout(() => { menuPanel.classList.remove('-translate-x-full'); }, 10); };
        const closeMenu = () => { menuPanel.classList.add('-translate-x-full'); setTimeout(() => { mobileMenu.classList.add('hidden'); }, 300); };
        menuBtn.addEventListener('click', openMenu);
        closeMenuBtn.addEventListener('click', closeMenu);
        mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) { closeMenu(); } });
    }

    // =======================================================
    // PERUBAHAN KRUSIAL: Menggunakan path API lokal dari Worker
    const apiEndpoint = '/api/content';
    const siteConfigApiUrl = '/api/config';
    // =======================================================

    const sectionMappings = { popularToday: 'popular-today-container', latestRelease: 'latest-release-container', movies: 'movies-container', upcoming: 'upcoming-container', dropped: 'dropped-container' };
    let latestReleaseCurrentPage = 1;
    const LATEST_RELEASE_ITEMS_PER_PAGE = 10;

    async function loadSiteConfig() {
        try {
            const response = await fetch(`${siteConfigApiUrl}?v=${new Date().getTime()}`);
            if (!response.ok) return;
            const config = await response.json();
            if (document.getElementById('slider-container')) {
                const setMetaTag = (property, content) => { if (!content) return; let element = document.querySelector(`meta[name="${property}"], meta[property="${property}"]`); if (!element) { element = document.createElement('meta'); if (property.startsWith('og:')) { element.setAttribute('property', property); } else { element.setAttribute('name', property); } document.head.appendChild(element); } element.setAttribute('content', content); };
                const siteFullName = `${config.headerTitle || 'Donghua'}${config.headerSubtitle || '动画'}`;
                const pageTitle = `${siteFullName} - Nonton Donghua Sub Indo Gratis`;
                document.title = pageTitle;
                const description = config.announcement ? config.announcement.body : 'Jelajahi dunia Donghua dengan subtitle Indonesia kualitas terbaik.';
                const imageUrl = config.favicon || `https://picsum.photos/1200/630?v=${siteFullName}`;
                setMetaTag('description', description);
                setMetaTag('og:title', pageTitle);
                setMetaTag('og:description', description);
                setMetaTag('og:image', imageUrl);
                setMetaTag('og:type', 'website');
                setMetaTag('og:url', window.location.origin);
                setMetaTag('twitter:card', 'summary_large_image');
            }
            const favicon = document.getElementById('favicon');
            if (favicon && config.favicon) { favicon.href = config.favicon; }
            const headerTitle = document.getElementById('header-title');
            const headerSubtitle = document.getElementById('header-subtitle');
            if (headerTitle && config.headerTitle) headerTitle.textContent = config.headerTitle;
            if (headerSubtitle && config.headerSubtitle) headerSubtitle.textContent = config.headerSubtitle;
            const footerCopyright = document.getElementById('footer-copyright');
            const footerDisclaimer = document.getElementById('footer-disclaimer');
            if (footerCopyright && config.footerCopyright) footerCopyright.innerHTML = config.footerCopyright;
            if (footerDisclaimer && config.footerDisclaimer) footerDisclaimer.textContent = config.footerDisclaimer;
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
        } catch (error) { console.warn('Could not load site config.', error); }
    }

    const createCard = (item) => {
        const isMovie = item.type === 'Movie';
        const ongoingIcon = !isMovie && item.ongoing ? `<span class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"><i class="fa-solid fa-clock"></i></span>` : '';
        const subbedBadge = item.subbed ? `<div class="absolute bottom-2 right-2"><span class="bg-yellow-500 text-black text-xs px-2 py-1 rounded">Sub</span></div>` : '';
        const episodeBadge = !isMovie && item.episode ? `<div class="absolute bottom-2 left-2"><span class="text-white text-xs font-bold">${item.episode}</span></div>` : '';
        const typeBadgeColor = isMovie ? 'bg-purple-600' : 'bg-red-600';
        return `<a href="data/details.html?id=${item.id}" class="bg-[#1a1a1a] rounded-lg overflow-hidden group block"><div class="relative overflow-hidden"><img src="${item.imageUrl}" alt="${item.title}" class="w-full h-auto aspect-[2/3] object-cover transform group-hover:scale-105 transition-transform duration-300"><div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div><span class="absolute top-2 left-2 ${typeBadgeColor} text-white text-xs px-2 py-1 rounded">${item.type}</span>${ongoingIcon}${episodeBadge}${subbedBadge}</div><div class="p-2"><h3 class="font-semibold text-sm truncate group-hover:text-red-500" title="${item.title}">${item.title}</h3></div></a>`;
    };

    const displaySlider = (sliderData) => {
        const container = document.getElementById('slider-container');
        if (!container) return;
        if (sliderData && sliderData.length > 0) {
            const firstSlide = sliderData[0];
            container.innerHTML = `<a href="data/details.html?id=${firstSlide.id}" class="block relative"><img src="${firstSlide.imageUrl}" alt="${firstSlide.title}" class="w-full h-auto aspect-video object-cover rounded-lg"><div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg"></div><div class="absolute bottom-0 left-0 right-0 p-4"><h2 class="text-white text-lg font-bold">${firstSlide.title}</h2></div></a>`;
        } else { container.innerHTML = '<p class="text-center text-gray-500 p-8">No slider content available.</p>'; }
    };

    const renderLatestReleasePage = (page, data, container) => { const start = (page - 1) * LATEST_RELEASE_ITEMS_PER_PAGE; const end = start + LATEST_RELEASE_ITEMS_PER_PAGE; const paginatedItems = data.slice(start, end); container.innerHTML = paginatedItems.map(item => createCard(item)).join(''); };
    const setupPagination = (currentPage, totalItems, data) => { const paginationContainer = document.getElementById('latest-release-pagination'); if (!paginationContainer) return; const totalPages = Math.ceil(totalItems / LATEST_RELEASE_ITEMS_PER_PAGE); paginationContainer.innerHTML = ''; if (totalPages <= 1) return; const createButton = (content, newPage, isDisabled = false, isCurrent = false) => { const li = document.createElement('li'); const button = document.createElement('button'); button.innerHTML = content; button.className = `px-3 py-2 leading-tight border border-gray-700 ${isCurrent ? 'text-black bg-white' : 'text-gray-400 bg-[#2a2a2a] hover:bg-gray-700 hover:text-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`; button.disabled = isDisabled; if (!isDisabled) { button.addEventListener('click', () => { latestReleaseCurrentPage = newPage; renderLatestReleasePage(latestReleaseCurrentPage, data, document.getElementById('latest-release-container')); setupPagination(latestReleaseCurrentPage, totalItems, data); }); } li.appendChild(button); return li; }; paginationContainer.appendChild(createButton('<i class="fa-solid fa-chevron-left"></i>', currentPage - 1, currentPage === 1)); for (let i = 1; i <= totalPages; i++) { paginationContainer.appendChild(createButton(i, i, false, currentPage === i)); } paginationContainer.appendChild(createButton('<i class="fa-solid fa-chevron-right"></i>', currentPage + 1, currentPage === totalPages)); };
    const displaySections = (allContent) => {
        const latestReleaseData = allContent.filter(item => item.sections && item.sections.includes('latestRelease'));
        for (const sectionKey in sectionMappings) {
            const container = document.getElementById(sectionMappings[sectionKey]);
            if (container) {
                if (sectionKey === 'latestRelease') {
                    if (latestReleaseData.length > 0) { renderLatestReleasePage(latestReleaseCurrentPage, latestReleaseData, container); setupPagination(latestReleaseCurrentPage, latestReleaseData.length, latestReleaseData); } else { container.innerHTML = `<p