document.addEventListener('DOMContentLoaded', () => {

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const generateJsonBtn = document.getElementById('generate-json');
    const outputEl = document.getElementById('json-output');

    // Helper function for SHA-256 Hashing using Web Crypto API
    async function sha256(message) {
        // encode as UTF-8
        const msgBuffer = new TextEncoder().encode(message);
        // hash the message
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // convert bytes to hex string
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Function to generate a random salt
    function generateRandomSalt(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let salt = '';
        for (let i = 0; i < length; i++) {
            salt += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return salt;
    }
    
    generateJsonBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            alert('Please enter both an email and a password.');
            return;
        }

        outputEl.textContent = 'Generating...';
        
        try {
            const emailSalt = generateRandomSalt();
            const passwordSalt = generateRandomSalt();

            const hashedEmail = await sha256(email.toLowerCase() + emailSalt);
            const hashedPassword = await sha256(password + passwordSalt);

            const credentials = {
                email: hashedEmail,
                password: hashedPassword,
                email_salt: emailSalt,
                password_salt: passwordSalt
            };

            outputEl.textContent = JSON.stringify(credentials, null, 2);

        } catch (error) {
            console.error('Hashing error:', error);
            outputEl.textContent = 'Error generating JSON. Check console.';
            alert('Error: This tool requires a secure connection (HTTPS) to function correctly.');
        }
    });

});