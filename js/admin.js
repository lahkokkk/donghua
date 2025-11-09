// KODE INI UNTUK ADMIN.JS (VERSI MULTI-BIN DENGAN DISTRIBUSI ACAK)
document.addEventListener('DOMContentLoaded', () => {

    // Helper function for SHA-256 Hashing using Web Crypto API
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    const loginModal = document.getElementById('login-modal');
    const mainContent = document.getElementById('main-content');
    
    // --- AUTHENTICATION CHECK ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        loginModal.classList.add('hidden');
        mainContent.classList.remove('hidden');
        initializeAdminPanel();
    } else {
        // --- LOGIN LOGIC ---
        const loginForm = document.getElementById('login-form');
        const loginApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/c2174c60-6862-474b-9310-5a9b73cc4b47';
        const submitButton = loginForm.querySelector('button[type="submit"]');

        if (!window.crypto || !window.crypto.subtle) {
            const errorEl = document.getElementById('login-error');
            if (errorEl) errorEl.textContent = 'Crypto API not supported. Use HTTPS.';
            if (submitButton) submitButton.disabled = true;
            alert('Error: This page requires a secure connection (HTTPS) to function correctly.');
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value.trim().toLowerCase();
            const password = e.target.password.value.trim();
            const errorEl = document.getElementById('login-error');

            errorEl.textContent = '';
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';

            try {
                const res = await fetch(loginApiUrl + `?v=${new Date().getTime()}`);
                if (!res.ok) throw new Error('Could not fetch credentials.');
                const credentials = await res.json();

                const hashedEmail = await sha256(email + credentials.email_salt);
                const hashedPassword = await sha256(password + credentials.password_salt);

                if (hashedEmail === credentials.email && hashedPassword === credentials.password) {
                    sessionStorage.setItem('isAdminLoggedIn', 'true');
                    loginModal.classList.add('hidden');
                    mainContent.classList.remove('hidden');
                    initializeAdminPanel();
                } else {
                    errorEl.textContent = 'Invalid email or password.';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorEl.textContent = 'An error occurred during login.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Login';
            }
        });
    }


    // --- MAIN ADMIN PANEL LOGIC ---
    function initializeAdminPanel() {
        
        // =======================================================
        // PERUBAHAN KRUSIAL #1: DEFINISIKAN SEMUA URL BIN ANDA
        // GANTI DENGAN 5 URL JSONBIN-CLONE ANDA YANG SEBENARNYA
        // =======================================================
        const contentApiEndpoints = [
            "https://jsonbin-clone.bisay510.workers.dev/7ca09da7-cdd3-4d52-8fba-8823386a5de8",
            "https://jsonbin-clone.bisay510.workers.dev/f41b1d5e-af6d-41a8-bed0-c5140ab7eb3d",
            "https://jsonbin-clone.bisay510.workers.dev/7032de1c-8246-4e7e-a9bc-166c196af58d",
            "https://jsonbin-clone.bisay510.workers.dev/7ac5f798-da1d-4b51-97ef-d36410fd02a6",
            "https://jsonbin-clone.bisay510.workers.dev/e5812847-96b4-4076-8f81-b4202e6cd1eb"
        ];
        // =======================================================

        const siteConfigApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/0353d142-7372-443d-adb7-63bafdd0791e';
        
        // Add Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('isAdminLoggedIn');
                location.reload();
            });
        }

        // --- Site Configuration Handling --- (Tidak ada perubahan di bagian ini)
        const siteConfigForm = document.getElementById('site-config-form');
        const configSaveStatus = document.getElementById('config-save-status');
        const faviconUploadInput = document.getElementById('faviconUpload');
        const faviconStatus = document.getElementById('favicon-upload-status');
        const faviconPreview = document.getElementById('favicon-preview');
        let newFaviconDataUrl = null;

        faviconUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            faviconStatus.textContent = '';
            if (!['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/svg+xml'].includes(file.type)) {
                 faviconStatus.textContent = 'Error: Invalid file type.';
                 faviconUploadInput.value = '';
                 return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                newFaviconDataUrl = reader.result;
                faviconPreview.src = newFaviconDataUrl;
                faviconPreview.classList.remove('hidden');
                faviconStatus.textContent = `Ready to save '${file.name}'.`;
                faviconStatus.classList.remove('text-red-500');
                faviconStatus.classList.add('text-green-500');
            };
            reader.onerror = () => {
                faviconStatus.textContent = 'Error reading file.';
                faviconStatus.classList.add('text-red-500');
            }
        });

        async function loadAndDisplaySiteConfig() {
            try {
                const res = await fetch(`${siteConfigApiUrl}?v=${new Date().getTime()}`);
                if (!res.ok) throw new Error('Failed to load site config');
                const config = await res.json();
                siteConfigForm.headerTitle.value = config.headerTitle || '';
                siteConfigForm.headerSubtitle.value = config.headerSubtitle || '';
                siteConfigForm.footerCopyright.value = config.footerCopyright || '';
                siteConfigForm.footerDisclaimer.value = config.footerDisclaimer || '';
                if (config.announcement) {
                    siteConfigForm.announcementTitle.value = config.announcement.title || '';
                    siteConfigForm.announcementBody.value = config.announcement.body || '';
                    siteConfigForm.announcementHighlight.value = config.announcement.highlight || '';
                    siteConfigForm.announcementClosing.value = config.announcement.closing || '';
                }
                if (config.favicon) {
                    faviconPreview.src = config.favicon;
                    faviconPreview.classList.remove('hidden');
                } else {
                    faviconPreview.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error loading site config:', error);
                configSaveStatus.textContent = 'Could not load site config.';
                configSaveStatus.classList.add('text-red-500');
            }
        }

        siteConfigForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';
            configSaveStatus.textContent = '';
            try {
                const currentConfigRes = await fetch(`${siteConfigApiUrl}?v=${new Date().getTime()}`);
                if (!currentConfigRes.ok) throw new Error('Could not fetch current config to update.');
                const currentConfig = await currentConfigRes.json();
                const updatedConfig = { ...currentConfig, headerTitle: siteConfigForm.headerTitle.value, headerSubtitle: siteConfigForm.headerSubtitle.value, footerCopyright: siteConfigForm.footerCopyright.value, footerDisclaimer: siteConfigForm.footerDisclaimer.value, announcement: { title: siteConfigForm.announcementTitle.value, body: siteConfigForm.announcementBody.value, highlight: siteConfigForm.announcementHighlight.value, closing: siteConfigForm.announcementClosing.value } };
                if (newFaviconDataUrl) { updatedConfig.favicon = newFaviconDataUrl; }
                const response = await fetch(siteConfigApiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedConfig) });
                if (!response.ok) throw new Error('Failed to save configuration');
                configSaveStatus.textContent = 'Configuration saved successfully!';
                configSaveStatus.classList.add('text-green-500');
                newFaviconDataUrl = null;
                faviconUploadInput.value = '';
                faviconStatus.textContent = '';
            } catch (error) {
                console.error('Error saving site config:', error);
                configSaveStatus.textContent = `Error saving configuration: ${error.message}`;
                configSaveStatus.classList.add('text-red-500');
            } finally {
                 setTimeout(() => { configSaveStatus.textContent = ''; configSaveStatus.className = 'text-sm text-center h-4 mt-2'; }, 5000);
                submitButton.disabled = false;
                submitButton.textContent = 'Save Site Configuration';
            }
        });

        // --- Content Management Handling ---
        const form = document.getElementById('content-form');
        const contentManagerContainer = document.getElementById('current-content-manager');
        const episodesContainer = document.getElementById('episodes-container');
        const addEpisodeBtn = document.getElementById('add-episode-btn');
        const formSubmitButton = form.querySelector('button[type="submit"]');
        const imageUploadInput = document.getElementById('imageUpload');
        const imageUrlInput = document.getElementById('imageUrl');
        const uploadStatus = document.getElementById('upload-status');
        const imgbbApiKey = 'fb57bbe5ce83ff20b7bd354a3b2f0735';

        imageUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { uploadStatus.textContent = 'Error: Please select an image file.'; imageUploadInput.value = ''; return; }
            if (file.size > 16 * 1024 * 1024) { uploadStatus.textContent = 'Error: File is too large (max 16MB).'; imageUploadInput.value = ''; return; }
            uploadStatus.textContent = 'Reading file...';
            formSubmitButton.disabled = true;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64String = reader.result.split(',')[1];
                    uploadStatus.textContent = 'Uploading... This may take a moment.';
                    const formData = new FormData();
                    formData.append('key', imgbbApiKey);
                    formData.append('image', base64String);
                    const response = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData, });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        imageUrlInput.value = result.data.url;
                        uploadStatus.textContent = 'Upload successful!';
                        setTimeout(() => { uploadStatus.textContent = ''; }, 5000);
                    } else { throw new Error(result.error ? result.error.message : 'Unknown API error'); }
                } catch (error) {
                    console.error('Image upload error:', error);
                    uploadStatus.textContent = `Error: ${error.message}`;
                } finally {
                    imageUploadInput.value = '';
                    formSubmitButton.disabled = false;
                }
            };
            reader.onerror = () => { uploadStatus.textContent = 'Error reading file.'; console.error('FileReader error'); formSubmitButton.disabled = false; };
        });

        let allContent = [];
        let editState = null;

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancel Edit';
        cancelButton.className = 'w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 focus:ring-offset-gray-800 mt-2 hidden';
        formSubmitButton.parentElement.appendChild(cancelButton);

        const resetForm = () => {
            form.reset();
            episodesContainer.innerHTML = '';
            document.querySelectorAll('input[name="genre_checkbox"]').forEach(cb => cb.checked = false);
            form.other_genres.value = '';
            form.metaTags.value = '';
            editState = null;
            formSubmitButton.textContent = 'Add Content';
            cancelButton.classList.add('hidden');
        }

        cancelButton.addEventListener('click', resetForm);

        const addServerField = (container, name = '', url = '') => {
            const div = document.createElement('div');
            div.className = 'flex items-center space-x-2 server-field ml-8 mt-2';
            div.innerHTML = `
                <input type="text" name="server_name" placeholder="Server Name (e.g., HD)" value="${name}" class="flex-1 bg-[#3a3a3a] border border-gray-500 rounded-md py-1 px-2 text-white text-xs" required>
                <input type="url" name="server_url" placeholder="Video URL" value="${url}" class="flex-1 bg-[#3a3a3a] border border-gray-500 rounded-md py-1 px-2 text-white text-xs" required>
                <button type="button" class="remove-server-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded-md text-xs">X</button>
            `;
            container.appendChild(div);
            div.querySelector('.remove-server-btn').addEventListener('click', () => div.remove());
        };

        const addEpisodeField = (ep = '', servers = []) => {
            const episodeDiv = document.createElement('div');
            episodeDiv.className = 'episode-field bg-[#2a2a2a] p-3 rounded-md border border-gray-700';
            const serversContainer = document.createElement('div');
            serversContainer.className = 'servers-container space-y-2';
            episodeDiv.innerHTML = `
                <div class="flex flex-wrap items-center gap-2">
                    <input type="text" name="ep_number" placeholder="Ep Number (e.g., 1)" value="${ep}" class="w-full sm:w-1/4 bg-[#3a3a3a] border border-gray-500 rounded-md py-1 px-2 text-white text-sm" required>
                    <button type="button" class="add-server-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-md text-xs">+ Add Server</button>
                    <div class="flex-grow"></div>
                    <button type="button" class="remove-episode-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs">Remove Episode</button>
                </div>
            `;
            episodeDiv.appendChild(serversContainer);
            episodesContainer.appendChild(episodeDiv);
            episodeDiv.querySelector('.add-server-btn').addEventListener('click', () => addServerField(serversContainer));
            episodeDiv.querySelector('.remove-episode-btn').addEventListener('click', () => episodeDiv.remove());
            if (servers.length > 0) {
                servers.forEach(server => addServerField(serversContainer, server.name, server.url));
            } else {
                addServerField(serversContainer); // Add one default server field
            }
        };

        addEpisodeBtn.addEventListener('click', () => addEpisodeField());

        // =======================================================
        // PERUBAHAN KRUSIAL #2: FUNGSI UNTUK MENYIMPAN KE BIN YANG BENAR
        // =======================================================
        async function saveContentToBin(contentToSave, targetBinUrl) {
            try {
                // Hapus properti _sourceBinUrl sebelum menyimpan agar tidak mengotori data
                const cleanedContent = contentToSave.map(({ _sourceBinUrl, ...rest }) => rest);
                
                const response = await fetch(targetBinUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanedContent)
                });
                if (!response.ok) throw new Error(`Failed to save data to ${targetBinUrl}. Status: ${response.status}`);
                return true;
            } catch (error) {
                console.error('Save error:', error);
                alert(`Error saving content: ${error.message}`);
                return false;
            }
        }
        
        // =======================================================
        // PERUBAHAN KRUSIAL #3: MEMUAT DATA DARI SEMUA BIN
        // =======================================================
        async function loadContent() {
            contentManagerContainer.innerHTML = '<p class="text-gray-400">Loading content from all sources...</p>';
            try {
                const fetchPromises = contentApiEndpoints.map(url => fetch(url + `?v=${new Date().getTime()}`));
                const responses = await Promise.all(fetchPromises);

                const jsonPromises = responses.map((res, index) => {
                    if (!res.ok) throw new Error(`Failed to load from ${contentApiEndpoints[index]}`);
                    return res.json().then(data => {
                        // Tambahkan properti untuk melacak asal data
                        data.forEach(item => item._sourceBinUrl = contentApiEndpoints[index]);
                        return data;
                    });
                });
                
                const jsonArrays = await Promise.all(jsonPromises);
                allContent = [].concat(...jsonArrays); // Gabungkan semua data
                
                displayContent();
            } catch (error) {
                console.error("Could not load content:", error);
                contentManagerContainer.innerHTML = `<p class="text-red-500">Failed to load content: ${error.message}.</p>`;
            }
        }

        function displayContent() {
            if (!contentManagerContainer) return;
        
            contentManagerContainer.innerHTML = '';
            const sections = ['slider', 'popularToday', 'latestRelease', 'movies', 'upcoming', 'dropped'];
            const contentBySection = allContent.reduce((acc, item) => {
                if (!item.sections) item.sections = [];
                item.sections.forEach(section => {
                    if (!acc[section]) acc[section] = [];
                    acc[section].push(item);
                });
                return acc;
            }, {});
        
            const tabNav = document.createElement('nav');
            tabNav.className = 'border-b border-gray-700 mb-4 -mb-px flex space-x-6 overflow-x-auto';
            
            const tabPanesContainer = document.createElement('div');
        
            sections.forEach((sectionKey, index) => {
                const isActive = index === 0;
                const sectionData = contentBySection[sectionKey] || [];
                
                const tabButton = document.createElement('button');
                const sectionName = sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                tabButton.textContent = `${sectionName} (${sectionData.length})`;
                tabButton.dataset.target = `#pane-${sectionKey}`;
                tabButton.className = `admin-tab-btn whitespace-nowrap py-2 px-1 text-sm font-medium border-b-2 ${isActive ? 'text-white border-red-500' : 'text-gray-400 hover:text-white hover:border-gray-500 border-transparent'}`;
                tabNav.appendChild(tabButton);
        
                const paneDiv = document.createElement('div');
                paneDiv.id = `pane-${sectionKey}`;
                paneDiv.className = `admin-tab-pane ${isActive ? '' : 'hidden'}`;
        
                const grid = document.createElement('div');
                grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
        
                if (sectionData.length === 0) {
                    grid.innerHTML = '<p class="text-gray-500 col-span-full">No content in this section.</p>';
                } else {
                    sectionData.forEach(item => {
                        const itemCard = document.createElement('div');
                        itemCard.className = 'bg-[#2a2a2a] rounded-lg p-3 flex flex-col justify-between';
                        itemCard.innerHTML = `
                            <div>
                                <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-40 object-cover rounded-md mb-2">
                                <h4 class="font-bold text-white truncate" title="${item.title}">${item.title}</h4>
                                <p class="text-sm text-gray-400">ID: ${item.id}</p>
                                ${item.episode ? `<p class="text-sm text-gray-400">Episode: ${item.episode}</p>` : ''}
                            </div>
                            <div class="mt-3 flex justify-end space-x-2">
                                <button class="edit-btn bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded" data-id="${item.id}">Edit</button>
                                <button class="delete-btn bg-red-600 hover:red-700 text-white text-xs font-bold py-1 px-3 rounded" data-id="${item.id}">Delete Item</button>
                            </div>
                        `;
                        grid.appendChild(itemCard);
                    });
                }
                paneDiv.appendChild(grid);
                tabPanesContainer.appendChild(paneDiv);
            });
            
            contentManagerContainer.appendChild(tabNav);
            contentManagerContainer.appendChild(tabPanesContainer);
        
            tabNav.addEventListener('click', (e) => {
                if (e.target.matches('.admin-tab-btn')) {
                    const targetPaneId = e.target.dataset.target;
                    
                    tabNav.querySelectorAll('.admin-tab-btn').forEach(btn => {
                        btn.className = 'admin-tab-btn whitespace-nowrap py-2 px-1 text-sm font-medium border-b-2 text-gray-400 hover:text-white hover:border-gray-500 border-transparent';
                    });
                    e.target.className = 'admin-tab-btn whitespace-nowrap py-2 px-1 text-sm font-medium border-b-2 text-white border-red-500';
        
                    tabPanesContainer.querySelectorAll('.admin-tab-pane').forEach(pane => {
                        pane.classList.add('hidden');
                    });
                    document.querySelector(targetPaneId).classList.remove('hidden');
                }
            });
        
            addEventListenersToButtons();
        }

        function addEventListenersToButtons() {
            document.querySelectorAll('.edit-btn').forEach(button => button.addEventListener('click', handleEdit));
            document.querySelectorAll('.delete-btn').forEach(button => button.addEventListener('click', handleDelete));
        }

        function handleEdit(e) {
            const { id } = e.target.dataset;
            const itemToEdit = allContent.find(i => i.id == Number(id));

            if (itemToEdit) {
                form.title.value = itemToEdit.title || '';
                form.imageUrl.value = itemToEdit.imageUrl || '';
                form.episode.value = itemToEdit.episode || '';
                form.synopsis.value = itemToEdit.synopsis || '';
                form.metaTags.value = itemToEdit.metaTags || '';
                form.type.value = itemToEdit.type || 'Donghua';
                form.subbed.checked = itemToEdit.subbed || false;
                form.ongoing.checked = itemToEdit.ongoing || false;

                document.querySelectorAll('input[name="section"]').forEach(cb => {
                    cb.checked = itemToEdit.sections.includes(cb.value);
                });

                document.querySelectorAll('input[name="genre_checkbox"]').forEach(cb => cb.checked = false);
                form.other_genres.value = '';
                if (itemToEdit.genres && Array.isArray(itemToEdit.genres)) {
                    const standardGenres = Array.from(document.querySelectorAll('input[name="genre_checkbox"]')).map(cb => cb.value);
                    const customGenres = [];
                    itemToEdit.genres.forEach(genre => {
                        const checkbox = document.querySelector(`input[name="genre_checkbox"][value="${genre}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        } else {
                            customGenres.push(genre);
                        }
                    });
                    form.other_genres.value = customGenres.join(', ');
                }

                episodesContainer.innerHTML = '';
                if(itemToEdit.episodes) {
                    itemToEdit.episodes.forEach(ep => {
                        const servers = ep.servers || (ep.url ? [{name: 'Default', url: ep.url}] : []);
                        addEpisodeField(ep.ep, servers);
});
                }
                
                editState = { id: itemToEdit.id, _sourceBinUrl: itemToEdit._sourceBinUrl };
                formSubmitButton.textContent = 'Update Content';
                cancelButton.classList.remove('hidden');
                form.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // =======================================================
        // PERUBAHAN KRUSIAL #4: LOGIKA HAPUS YANG BARU
        // =======================================================
        async function handleDelete(e) {
            const { id } = e.target.dataset;
            const numericId = Number(id);
            if (confirm(`Are you sure you want to PERMANENTLY DELETE item ID ${id}? This cannot be undone.`)) {
                const itemToDelete = allContent.find(i => i.id === numericId);
                if (!itemToDelete || !itemToDelete._sourceBinUrl) {
                    alert('Error: Could not find item or its source bin.');
                    return;
                }
                
                const targetBinUrl = itemToDelete._sourceBinUrl;
                
                const contentForTargetBin = allContent.filter(item => item._sourceBinUrl === targetBinUrl && item.id !== numericId);
                
                e.target.disabled = true;
                e.target.textContent = 'Deleting...';
                
                const success = await saveContentToBin(contentForTargetBin, targetBinUrl);

                if (success) {
                    alert('Item deleted successfully.');
                    loadContent(); // Muat ulang semua konten
                } else {
                    alert('Failed to delete. Please check the console and try again.');
                    e.target.disabled = false;
                    e.target.textContent = 'Delete Item';
                }
            }
        }

        // =======================================================
        // PERUBAHAN KRUSIAL #5: LOGIKA SUBMIT YANG BARU
        // =======================================================
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formSubmitButton.disabled = true;
            formSubmitButton.textContent = 'Saving...';

            const formData = new FormData(form);
            const selectedSections = formData.getAll('section');
            if (selectedSections.length === 0) {
                alert('Please select at least one section.');
                formSubmitButton.disabled = false;
                formSubmitButton.textContent = editState ? 'Update Content' : 'Add Content';
                return;
            }
            const selectedGenres = Array.from(document.querySelectorAll('input[name="genre_checkbox"]:checked')).map(cb => cb.value);
            const otherGenres = formData.get('other_genres').split(',').map(g => g.trim()).filter(g => g);
            const allGenres = [...new Set([...selectedGenres, ...otherGenres])];
            const episodes = [];
            document.querySelectorAll('.episode-field').forEach(field => {
                const epNumber = field.querySelector('input[name="ep_number"]').value.trim();
                if (epNumber) {
                    const servers = [];
                    field.querySelectorAll('.server-field').forEach(serverField => {
                        const serverName = serverField.querySelector('input[name="server_name"]').value.trim();
                        const serverUrl = serverField.querySelector('input[name="server_url"]').value.trim();
                        if (serverName && serverUrl) {
                            servers.push({ name: serverName, url: serverUrl });
                        }
                    });
                    if (servers.length > 0) {
                        episodes.push({ ep: epNumber, servers: servers });
                    }
                }
            });
            const content = {
                title: formData.get('title'),
                imageUrl: formData.get('imageUrl'),
                episode: formData.get('episode'),
                type: formData.get('type'),
                subbed: formData.has('subbed'),
                ongoing: formData.has('ongoing'),
                synopsis: formData.get('synopsis'),
                metaTags: formData.get('metaTags'),
                genres: allGenres,
                sections: selectedSections,
                episodes: episodes
            };
            
            let targetBinUrl;
            let contentForTargetBin;
            let success = false;

            if (editState) {
                // UPDATE: Simpan ke bin yang sama
                targetBinUrl = editState._sourceBinUrl;
                content.id = editState.id;
                content._sourceBinUrl = targetBinUrl; // Pastikan properti ini tetap ada
                contentForTargetBin = allContent.filter(item => item._sourceBinUrl === targetBinUrl);
                const itemIndex = contentForTargetBin.findIndex(item => item.id === content.id);
                if (itemIndex > -1) {
                    contentForTargetBin[itemIndex] = content;
                }
            } else {
                // ADD NEW: Simpan ke bin secara acak
                const randomIndex = Math.floor(Math.random() * contentApiEndpoints.length);
                targetBinUrl = contentApiEndpoints[randomIndex];
                content.id = Date.now();
                content._sourceBinUrl = targetBinUrl; // Tandai asal bin
                contentForTargetBin = allContent.filter(item => item._sourceBinUrl === targetBinUrl);
                contentForTargetBin.unshift(content);
            }
            
            success = await saveContentToBin(contentForTargetBin, targetBinUrl);

            if (success) {
                alert(editState ? 'Item updated successfully.' : 'Item added successfully.');
                resetForm();
                loadContent();
            } else {
                alert('An error occurred. Could not save data. Please try again.');
            }

            formSubmitButton.disabled = false;
            formSubmitButton.textContent = editState ? 'Update Content' : 'Add Content';
        });

        loadAndDisplaySiteConfig();
        loadContent();
    }
});

Setelah ini, Admin Panel Anda akan berfungsi dengan benar, dan yang terpenting, setiap kali Anda **menambahkan item baru**, item tersebut akan disimpan ke salah satu dari lima bin Anda secara acak, mendistribusikan beban secara merata.
