document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoints = {
        slider: 'https://jsonbin-clone.bisay510.workers.dev/8c2c4f6a-9e6d-4eb1-8831-c9e3d626d31e',
        popularToday: 'https://jsonbin-clone.bisay510.workers.dev/2c635ddd-487d-44f3-9162-02d96640bb2f',
        latestRelease: 'https://jsonbin-clone.bisay510.workers.dev/6f5ea28f-8c0b-4c88-be70-9d8b23a58ace',
        movies: 'https://jsonbin-clone.bisay510.workers.dev/74ed9c39-a204-4af4-a06b-43b49b06d91a',
        upcoming: 'https://jsonbin-clone.bisay510.workers.dev/9a214abc-a87a-441c-bb36-050784b03a1f',
        dropped: 'https://jsonbin-clone.bisay510.workers.dev/734bc969-30c7-4c70-a308-b88e303dd7c1'
    };

    const form = document.getElementById('content-form');
    const contentContainer = document.getElementById('current-content-container');
    const submitButton = form.querySelector('button[type="submit"]');
    
    let currentData = {};
    let editState = null; // Will store { section, id } when editing

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel Edit';
    cancelButton.className = 'w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 focus:ring-offset-gray-800 mt-2 hidden';
    submitButton.parentElement.appendChild(cancelButton);

    cancelButton.addEventListener('click', () => {
        form.reset();
        editState = null;
        submitButton.textContent = 'Add Content';
        cancelButton.classList.add('hidden');
    });

    async function saveSectionData(section, data) {
        const url = apiEndpoints[section];
        if (!url) {
            alert(`Error: No API endpoint defined for section '${section}'.`);
            return false;
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`Failed to save data for ${section}. Status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('Save error:', error);
            alert(`Error saving content: ${error.message}`);
            return false;
        }
    }

    async function loadContent() {
        const sections = Object.keys(apiEndpoints);
        contentContainer.innerHTML = '<p class="text-gray-400">Loading content...</p>';
        
        try {
            const fetchPromises = sections.map(section => 
                fetch(apiEndpoints[section] + `?v=${new Date().getTime()}`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to load ${section}`);
                        return res.json().catch(() => []); // Return empty array on JSON parse error
                    })
            );

            const results = await Promise.all(fetchPromises);
            
            currentData = sections.reduce((acc, section, index) => {
                acc[section] = results[index] || []; // Ensure it's an array
                return acc;
            }, {});

            displayContent(currentData);
        } catch (error) {
            console.error("Could not load content:", error);
            contentContainer.innerHTML = `<p class="text-red-500">Failed to load content: ${error.message}.</p>`;
        }
    }

    function displayContent(data) {
        contentContainer.innerHTML = '';
        for (const sectionKey in data) {
            if (Object.hasOwnProperty.call(data, sectionKey) && Array.isArray(data[sectionKey])) {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'mb-8';
                
                const sectionTitle = document.createElement('h3');
                sectionTitle.className = 'text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2';
                sectionTitle.textContent = sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                sectionDiv.appendChild(sectionTitle);

                const grid = document.createElement('div');
                grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
                
                if (data[sectionKey].length === 0) {
                    grid.innerHTML = '<p class="text-gray-500 col-span-full">No content in this section.</p>';
                } else {
                    data[sectionKey].forEach(item => {
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
                                <button class="edit-btn bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded" data-section="${sectionKey}" data-id="${item.id}">Edit</button>
                                <button class="delete-btn bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded" data-section="${sectionKey}" data-id="${item.id}">Delete</button>
                            </div>
                        `;
                        grid.appendChild(itemCard);
                    });
                }
                
                sectionDiv.appendChild(grid);
                contentContainer.appendChild(sectionDiv);
            }
        }
        addEventListenersToButtons();
    }

    function addEventListenersToButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEdit);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    }

    function handleEdit(e) {
        const { section, id } = e.target.dataset;
        const item = currentData[section].find(i => i.id == id);
        if (item) {
            form.title.value = item.title || '';
            form.imageUrl.value = item.imageUrl || '';
            form.episode.value = item.episode || '';
            form.type.value = item.type || 'Donghua';
            form.section.value = section;
            form.subbed.checked = item.subbed || false;
            form.ongoing.checked = item.ongoing || false;
            
            editState = { section, id: Number(id) };
            submitButton.textContent = 'Update Content';
            cancelButton.classList.remove('hidden');
            form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async function handleDelete(e) {
        const { section, id } = e.target.dataset;
        if (confirm(`Are you sure you want to delete item with ID ${id} from ${section}? This will be saved to the database.`)) {
            const originalData = [...currentData[section]];
            currentData[section] = currentData[section].filter(item => item.id != id);

            e.target.disabled = true;
            e.target.textContent = 'Deleting...';

            const success = await saveSectionData(section, currentData[section]);

            if (success) {
                alert('Item deleted successfully.');
                displayContent(currentData);
            } else {
                alert('Failed to delete item. Reverting changes.');
                currentData[section] = originalData;
                e.target.disabled = false;
                e.target.textContent = 'Delete';
            }
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';
        
        const formData = new FormData(form);
        const newSection = formData.get('section');
        const content = {
            title: formData.get('title'),
            imageUrl: formData.get('imageUrl'),
            episode: formData.get('episode'),
            type: formData.get('type'),
            subbed: formData.has('subbed'),
            ongoing: formData.has('ongoing')
        };
        
        let success = false;

        if (editState) {
            // UPDATE LOGIC
            content.id = editState.id;
            const originalSection = editState.section;

            if (originalSection !== newSection) {
                const oldSectionData = currentData[originalSection].filter(item => item.id !== editState.id);
                const newSectionData = [...(currentData[newSection] || []), content];

                const success1 = await saveSectionData(originalSection, oldSectionData);
                const success2 = await saveSectionData(newSection, newSectionData);
                success = success1 && success2;

            } else {
                const updatedSectionData = currentData[newSection].map(item => item.id === editState.id ? content : item);
                success = await saveSectionData(newSection, updatedSectionData);
            }
            
        } else {
            // ADD LOGIC
            content.id = Date.now();
            const updatedSectionData = [...(currentData[newSection] || []), content];
            success = await saveSectionData(newSection, updatedSectionData);
        }

        if (success) {
            alert(editState ? 'Item updated successfully.' : 'Item added successfully.');
            form.reset();
            cancelButton.click();
            await loadContent(); // Reload everything from the server
        } else {
            alert('An error occurred. Could not save the data to the server.');
        }

        submitButton.disabled = false;
        submitButton.textContent = editState ? 'Update Content' : 'Add Content';
    });

    loadContent();
});
