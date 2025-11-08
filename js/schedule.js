document.addEventListener('DOMContentLoaded', () => {
    // Override the title and description after the global script has run.
    document.title = 'Schedule - Donghua动画';
    
    const setMetaTag = (property, content) => {
        let element = document.querySelector(`meta[name="${property}"], meta[property="${property}"]`);
        if (element) {
            element.setAttribute('content', content);
        } else { // Create it if it doesn't exist
             element = document.createElement('meta');
            if (property.startsWith('og:')) {
                element.setAttribute('property', property);
            } else {
                element.setAttribute('name', property);
            }
            document.head.appendChild(element);
            element.setAttribute('content', content);
        }
    };

    const description = "Jadwal rilis episode terbaru Donghua favoritmu. Jangan sampai ketinggalan!";
    setMetaTag('description', description);
    setMetaTag('og:title', 'Schedule - Donghua动画');
    setMetaTag('og:description', description);
});
