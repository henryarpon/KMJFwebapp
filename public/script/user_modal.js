document.addEventListener("DOMContentLoaded", () => {
    const addUserForm = document.querySelector('#addUser');
    const editUserForm = document.querySelector('#editUser');
    const deleteUserForm = document.querySelector('#deleteUser');
    const addModal = document.querySelector('#addModal');
    const editModal = document.querySelector('#editModal');
    const deleteModal = document.querySelector('#deleteModal');

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
                    updateSelectOptions(); // Call the function to update the user list
                }
            } else {

                console.error('Error:', response.statusText);
            }
        } 
        catch (error) {

            console.error('Error:', error);
        }
    };

    // Function to update the user list in the edit user form and delete user dropdown
    const updateSelectOptions = async () => {
        try {
        const response = await fetch('/getUsers'); // Create a new route to fetch the updated user list

        if (response.ok) {

            const users = await response.json();
            const selectUserEdit = document.getElementById('selectUser');
            const selectUserDelete = document.getElementById('selectUserDelete');

            // Clear existing options
            selectUserEdit.innerHTML = '';
            selectUserDelete.innerHTML = '';

            // Add new options for each user
            users.forEach((user) => {
                const option = document.createElement('option');
                option.value = user.username;
                option.textContent = user.username;
                selectUserEdit.appendChild(option);

                const deleteOption = document.createElement('option');
                deleteOption.value = user.username;
                deleteOption.textContent = user.username;
                selectUserDelete.appendChild(deleteOption);
            });
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

    deleteUserForm.addEventListener('submit', (event) => {
        handleSubmit(event, deleteUserForm, document.querySelector('#delete-container'), deleteModal);
    })

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

    deleteModal.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-close')) {
            event.preventDefault();
            closeModal(deleteModal);
        }
    });
});
