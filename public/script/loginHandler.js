document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login');
    const modal = document.querySelector('#modal');
    const messageContainer = document.querySelector('#message-container');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const loginFormData = {
            username: loginForm.querySelector('#username').value,
            password: loginForm.querySelector('#password').value,
        };

        try {
            const response = await fetch(loginForm.action, {
            method: 'POST',
            body: JSON.stringify(loginFormData),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
                // Redirect to the provided URL
                window.location.href = responseData.redirectUrl;
            } else {
            // Show error message in modal
                messageContainer.innerHTML = `
                <div class="error-message">
                ${responseData.message}
                <button class="modal-close">OK</button>
                </div>
                `;
                modal.classList.add('modal-show');
            }
            loginForm.reset();
        } 
        else {
            console.error('Error:', response.statusText);
        }
        } 
        catch (error) {
            console.error('Error:', error);
        }
    });

    modal.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-close')) {
            event.preventDefault();
            modal.classList.remove('modal-show');
        }
    });
});
