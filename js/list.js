document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365';
    const siteConfigApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/0353d142-7372-443d-adb7-63bafdd0791e';

    const contentContainer = document.getElementById('list-content');
    const pageTitle = document.getElementById('page-title');
    const paginationContainer = document.getElementById('pagination-container');

    const ITEMS_PER_PAGE = 15; // 3 rows of 5 items

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

    const renderPage = (page, data, sectionName) => {
        pageTitle.textContent = sectionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        document.title = `${pageTitle.textContent} - Donghua动画`;
        
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedItems = data.slice(start, end);
        
        if (paginatedItems.length > 0) {
            contentContainer.innerHTML = paginatedItems.map(item => createCard(item)).join('');
        } else {
            contentContainer.innerHTML = `<p class="col-span-full text-center text-gray-400 mt-10">No content found.</p>`;
        }
    };

    const setupPagination = (currentPage, totalItems, section) => {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        if (totalPages <= 1) return;
        
        const createButton = (text, page, isDisabled = false, isCurrent = false) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `list.html?section=${section}&page=${page}`;
            a.innerHTML = text;
            a.className = `px-3 py-2 leading-tight border border-gray-700 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-700 hover:text-white'} ${isCurrent ? 'text-black bg-white' : 'text-gray-400 bg-[#2a2a2a]'}`;
            if (isDisabled) {
                 a.addEventListener('click', (e) => e.preventDefault());
            }
            li.appendChild(a);
            return li;
        };
        
        // Prev button
        paginationContainer.appendChild(createButton('<i class="fa-solid fa-chevron-left"></i>', currentPage - 1, currentPage === 1));

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.appendChild(createButton(i, i, false, currentPage === i));
        }

        // Next button
        paginationContainer.appendChild(createButton('<i class="fa-solid fa-chevron-right"></i>', currentPage + 1, currentPage === totalPages));
    };


    const loadListContent = async () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const section = params.get('section');
            const page = parseInt(params.get('page') || '1', 10);

            if (!section) {
                contentContainer.innerHTML = `<p class="col-span-full text-center text-red-500 mt-10">Section not specified.</p>`;
                pageTitle.textContent = "Error";
                return;
            }

            const response = await fetch(`${apiEndpoint}?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to load content');
            const allContent = await response.json();

            const sectionData = allContent.filter(item => item.sections && item.sections.includes(section));
            
            renderPage(page, sectionData, section);
            setupPagination(page, sectionData.length, section);

        } catch (error) {
            console.error('Error loading list:', error);
            contentContainer.innerHTML = `<p class="col-span-full text-center text-red-500 mt-10">Could not load content.</p>`;
        }
    };

    loadSiteConfig();
    loadListContent();
});