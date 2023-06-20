document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login");
    const modal = document.getElementById("modal");
    const messageContainer = document.getElementById("message-container");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        const loginFormData = {
            username: loginForm.querySelector('#username').value,
            password: loginForm.querySelector('#password').value
        }

        try {
            const response = await fetch(loginForm.action, {
                method: 'POST',
                body: JSON.stringify(loginFormData),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                console.log(response);
                const responseData = await response.json();
                messageContainer.innerHTML = `  <div class="success-message">
                                                    ${responseData.message}
                                                    <button class="modal-close">OK</button>
                                                </div>`;

               modal.classList.add('modal-show');
                loginForm.reset();
            } else {
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
