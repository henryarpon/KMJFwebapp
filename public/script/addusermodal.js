document.addEventListener("DOMContentLoaded", () => {
    const addUserForm = document.querySelector('#addUser');
    const editUserForm = document.querySelector('#editUser');
    const addModal = document.querySelector('#addModal');
    const editModal = document.querySelector('#editModal');

    const closeModal = (modal) => {
        modal.classList.remove('modal-show');
    };

    const showMessage = (container, message, className) => {
        container.innerHTML = `
            <div class="${className}">${message}
                <button class="modal-close">OK</button>
            </div>`;
    };

    const handleSubmit = async (event, form, container, modal) => {
        event.preventDefault();

        const formData = Object.fromEntries(new FormData(form));

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const responseData = await response.json();
                showMessage(container, responseData.message, responseData.success ? 'success-message' : 'error-message');
                modal.classList.add('modal-show');

                if (responseData.success) {
                    form.reset();
                }
            } 
            else {
                console.error('Error:', response.statusText);
            }
        } 
        catch (error) {
            console.error('Error:', error);
        }
    };

    addUserForm.addEventListener('submit', (event) => {
        handleSubmit(event, addUserForm, document.querySelector('#add-container'), addModal);
    });

    editUserForm.addEventListener('submit', (event) => {
        handleSubmit(event, editUserForm, document.querySelector('#edit-container'), editModal);
    });

    addModal.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-close')) {
            event.preventDefault();
            closeModal(addModal);
        }
    });

    editModal.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-close')) {
            event.preventDefault();
            closeModal(editModal);
        }
    });
});
