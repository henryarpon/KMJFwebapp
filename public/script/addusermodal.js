document.addEventListener("DOMContentLoaded", () => {
    const addUserForm = document.querySelector('#addUser');
    const modal = document.getElementById('modal');

    addUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {
            username: addUserForm.querySelector('#username').value,
            email: addUserForm.querySelector('#email').value,
            userType: addUserForm.querySelector('#userType').value,
            password: addUserForm.querySelector('#password').value,
            confirmPassword: addUserForm.querySelector('#confirmPassword').value,
        };

        try {
            const response = await fetch(addUserForm.action, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const responseData = await response.json();
                const messageContainer = document.getElementById('message-container');
                
                if (responseData.success) {
                    messageContainer.innerHTML = `<div class="success-message">${responseData.message}
                        <button class="modal-close">OK</button>
                    </div>`;
                } else {
                    messageContainer.innerHTML = `<div class="error-message">${responseData.message}
                        <button class="modal-close">OK</button>
                    </div>`;
                }

                modal.classList.add('modal-show');
                addUserForm.reset();
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
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
