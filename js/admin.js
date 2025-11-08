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
        // Add Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('isAdminLoggedIn');
                location.reload();
            });
        }

        const allContentApiUrl = 'https://jsonbin-clone.bisay510.workers.dev/16f38f54-9873-45ed-8692-2ec5ea899365';
        const form = document.getElementById('content-form');
        const contentContainer = document.getElementById('current-content-container');
        const episodesContainer = document.getElementById('episodes-container');
        const addEpisodeBtn = document.getElementById('add-episode-btn');
        const formSubmitButton = form.querySelector('button[type="submit"]');

        const imageUploadInput = document.getElementById('imageUpload');
        const imageUrlInput = document.getElementById('imageUrl');
        const uploadStatus = document.getElementById('upload-status');
        const imgbbApiKey = 'fb57bbe5ce83ff20b7bd354a3b2f0735';

        imageUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                return;
            }

            if (!file.type.startsWith('image/')) {
                uploadStatus.textContent = 'Error: Please select an image file.';
                imageUploadInput.value = '';
                return;
            }

            if (file.size > 16 * 1024 * 1024) { // 16MB limit
                uploadStatus.textContent = 'Error: File is too large (max 16MB).';
                imageUploadInput.value = '';
                return;
            }

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

                    const response = await fetch('https://api.imgbb.com/1/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    
                    const result = await response.json();

                    if (response.ok && result.success) {
                        imageUrlInput.value = result.data.url;
                        uploadStatus.textContent = 'Upload successful!';
                        setTimeout(() => { uploadStatus.textContent = ''; }, 5000);
                    } else {
                        throw new Error(result.error ? result.error.message : 'Unknown API error');
                    }

                } catch (error) {
                    console.error('Image upload error:', error);
                    uploadStatus.textContent = `Error: ${error.message}`;
                } finally {
                    imageUploadInput.value = '';
                    formSubmitButton.disabled = false;
                }
            };

            reader.onerror = () => {
                uploadStatus.textContent = 'Error reading file.';
                console.error('FileReader error');
                formSubmitButton.disabled = false;
            };
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
            editState = null;
            formSubmitButton.textContent = 'Add Content';
            cancelButton.classList.add('hidden');
        }

        cancelButton.addEventListener('click', resetForm);

        const addEpisodeField = (ep = '', url = '') => {
            const div = document.createElement('div');
            div.className = 'flex items-center space-x-2 episode-field';
            div.innerHTML = `
                <input type="text" name="ep_number" placeholder="Ep Number (e.g., 1 or 'Movie')" value="${ep}" class="flex-1 bg-[#2a2a2a] border border-gray-600 rounded-md py-1 px-2 text-white text-sm" required>
                <input type="url" name="ep_url" placeholder="Video URL" value="${url}" class="flex-1 bg-[#2a2a2a] border border-gray-600 rounded-md py-1 px-2 text-white text-sm" required>
                <button type="button" class="remove-episode-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs">Remove</button>
            `;
            episodesContainer.appendChild(div);
            div.querySelector('.remove-episode-btn').addEventListener('click', () => div.remove());
        };

        addEpisodeBtn.addEventListener('click', () => addEpisodeField());

        async function saveAllContent() {
            try {
                const response = await fetch(allContentApiUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(allContent)
                });
                if (!response.ok) throw new Error(`Failed to save data. Status: ${response.status}`);
                return true;
            } catch (error) {
                console.error('Save error:', error);
                alert(`Error saving content: ${error.message}`);
                return false;
            }
        }

        async function loadContent() {
            contentContainer.innerHTML = '<p class="text-gray-400">Loading content...</p>';
            try {
                const res = await fetch(allContentApiUrl + `?v=${new Date().getTime()}`);
                if (!res.ok) throw new Error('Failed to load content');
                allContent = await res.json().catch(() => []);
                displayContent();
            } catch (error) {
                console.error("Could not load content:", error);
                contentContainer.innerHTML = `<p class="text-red-500">Failed to load content: ${error.message}.</p>`;
            }
        }

        function displayContent() {
            contentContainer.innerHTML = '';
            const sections = ['popularToday', 'latestRelease', 'movies', 'upcoming', 'dropped', 'slider'];
            const contentBySection = allContent.reduce((acc, item) => {
                item.sections.forEach(section => {
                    if (!acc[section]) acc[section] = [];
                    acc[section].push(item);
                });
                return acc;
            }, {});

            sections.forEach(sectionKey => {
                const sectionData = contentBySection[sectionKey] || [];
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'mb-8';

                const sectionTitle = document.createElement('h3');
                sectionTitle.className = 'text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2';
                sectionTitle.textContent = sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                sectionDiv.appendChild(sectionTitle);

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
                                <button class="delete-btn bg-red-600 hover:red-700 text-white text-xs font-bold py-1 px-3 rounded" data-section="${sectionKey}" data-id="${item.id}">Delete from Section</button>
                            </div>
                        `;
                        grid.appendChild(itemCard);
                    });
                }
                sectionDiv.appendChild(grid);
                contentContainer.appendChild(sectionDiv);
            });
            addEventListenersToButtons();
        }

        function addEventListenersToButtons() {
            document.querySelectorAll('.edit-btn').forEach(button => button.addEventListener('click', handleEdit));
            document.querySelectorAll('.delete-btn').forEach(button => button.addEventListener('click', handleDelete));
        }

        function handleEdit(e) {
            const { id } = e.target.dataset;
            const itemToEdit = allContent.find(i => i.id === Number(id));

            if (itemToEdit) {
                form.title.value = itemToEdit.title || '';
                form.imageUrl.value = itemToEdit.imageUrl || '';
                form.episode.value = itemToEdit.episode || '';
                form.synopsis.value = itemToEdit.synopsis || '';
                form.type.value = itemToEdit.type || 'Donghua';
                form.subbed.checked = itemToEdit.subbed || false;
                form.ongoing.checked = itemToEdit.ongoing || false;

                document.querySelectorAll('input[name="section"]').forEach(cb => {
                    cb.checked = itemToEdit.sections.includes(cb.value);
                });

                episodesContainer.innerHTML = '';
                if(itemToEdit.episodes) {
                    itemToEdit.episodes.forEach(ep => addEpisodeField(ep.ep, ep.url));
                }
                
                editState = { id: itemToEdit.id };
                formSubmitButton.textContent = 'Update Content';
                cancelButton.classList.remove('hidden');
                form.scrollIntoView({ behavior: 'smooth' });
            }
        }

        async function handleDelete(e) {
            const { section, id } = e.target.dataset;
            const numericId = Number(id);
            if (confirm(`Are you sure you want to remove item ID ${id} from the '${section}' section?`)) {
                const item = allContent.find(i => i.id === numericId);
                if (item) {
                    const originalSections = [...item.sections];
                    item.sections = item.sections.filter(s => s !== section);

                    e.target.disabled = true;
                    e.target.textContent = 'Deleting...';
                    const success = await saveAllContent();

                    if (success) {
                        alert('Item removed from section.');
                        displayContent();
                    } else {
                        alert('Failed to update. Reverting local changes.');
                        item.sections = originalSections;
                        e.target.disabled = false;
                        e.target.textContent = 'Delete from Section';
                    }
                }
            }
        }

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

            const episodes = [];
            document.querySelectorAll('.episode-field').forEach(field => {
                const epNumber = field.querySelector('input[name="ep_number"]').value.trim();
                const epUrl = field.querySelector('input[name="ep_url"]').value.trim();
                if (epNumber && epUrl) {
                    episodes.push({ ep: epNumber, url: epUrl });
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
                sections: selectedSections,
                episodes: episodes
            };

            if (editState) {
                content.id = editState.id;
                const itemIndex = allContent.findIndex(item => item.id === content.id);
                if (itemIndex > -1) {
                    allContent[itemIndex] = content;
                }
            } else {
                content.id = Date.now();
                allContent.push(content);
            }

            const success = await saveAllContent();
            if (success) {
                alert(editState ? 'Item updated successfully.' : 'Item added successfully.');
                resetForm();
                displayContent();
            } else {
                alert('An error occurred. Could not save all data. Please try again.');
            }

            formSubmitButton.disabled = false;
            formSubmitButton.textContent = editState ? 'Update Content' : 'Add Content';
        });

        loadContent();
    }
});