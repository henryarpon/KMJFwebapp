document.addEventListener("DOMContentLoaded", () => {

//********************************************************************************
//// DOM Element Selection
//********************************************************************************
    const contentForm = document.querySelector('#submitContent');
    const contentModal = document.querySelector('#contentModal');
    const deleteModal = document.querySelector('#deleteModal');
    const editContent = document.querySelector('#editContent');
    const closeFormButton = document.querySelector('#closeFormButton');
    const editUserForm = document.querySelector('#editForm');

//********************************************************************************
////Quill rich text editor library configuration
//********************************************************************************
    const editorOptions = {
        theme: 'snow',
        modules: {
        toolbar: 
            [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
            ],
        },
    };


//********************************************************************************
////Function to show messages in modals
//********************************************************************************
    const submitEditor = new Quill('#submitEditor', editorOptions);
    const editEditor = new Quill('#editEditor', { ...editorOptions, readOnly: false });

    const showMessage = (container, message, className) => {

        container.innerHTML = `
            <div class="${className}">${message}</div>
            <button class="modal-close formButton">OK</button>
        `;

        const closeButton = container.querySelector('.modal-close');

        closeButton.addEventListener('click', () => {
            container.parentNode.style.display = 'none';

            if (className === 'success-message') {
                location.reload();
            }
        });
    };

//********************************************************************************
////Backend API Call handler
//********************************************************************************
    const handleApiRequest = async (url, method, data = null) => {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data ? JSON.stringify(data) : null,
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } 
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
    };

//********************************************************************************
////Content Table Updater -- update table for any changes made
//********************************************************************************
    const updateContentTable = async () => {

        try {
            const response = await fetch('/getContents');

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const contents = await response.json();
            const table = document.getElementById('table-card');
            table.innerHTML = '';

            contents.forEach(content => {
                const row = document.createElement('tr');
                row.innerHTML = 
                    `
                        <td>${content.title}</td>
                        <td class='actionColumn'>
                            <form class="edit-form">
                                <input type="hidden" name="contentId" value="${content._id}">
                                <button type="submit" class='formButton'>Edit</button>
                            </form>
                        </td>
                        <td class='actionColumn'>
                            <form class="delete-form">
                                <input type="hidden" name="contentId" value="${content._id}">
                                <button type="submit" class='formButton'>Delete</button>
                            </form>
                        </td>
                    `;
                table.appendChild(row);
            });
            attachDeleteEventListeners();
            attachEditEventListeners();
        } 
        catch (error) {
            console.error('Error:', error);
        }
    };

//********************************************************************************
////Content Deleter
//********************************************************************************
    const deleteContent = async (contentId) => {
    try {
        const message = await handleApiRequest('/deleteContent', 'POST', { contentId });
      
        showMessage(
            document.querySelector('#delete-container'),
            message.message,
            message.success ? 'delete-message' : 'error-message'
        );

        deleteModal.style.display = 'block';

        if (message.success) {
            updateContentTable();
        }
    } 
    catch (error) {
        console.error(error);
        showMessage(document.querySelector('#delete-container'), 'An error occurred', 'error-message');
        deleteModal.style.display = 'block';
    }
    };

//********************************************************************************
////Attach delete functionality to all delete button generated on the content table
//********************************************************************************
    const attachDeleteEventListeners = () => {

        const deleteForms = document.querySelectorAll('.delete-form');
        deleteForms.forEach(form => {
            form.addEventListener('submit', event => {
                event.preventDefault();
                const contentId = form.querySelector('input[name="contentId"]').value;
                deleteContent(contentId);
            });
        });
    };

//********************************************************************************
////Event listener for submitting content to the backend
//********************************************************************************
    contentForm.addEventListener('submit', async event => {

        event.preventDefault();
        const titleInput = document.querySelector('#title');
        const contentFormEditor = document.querySelector('#submitEditor');

        const content = {
            html: submitEditor.root.innerHTML,
            photoUrl: 'your-photo-url',
        };

        const formData = {
            title: titleInput.value,
            content: JSON.stringify(content),
        };

        try {
            const message = await handleApiRequest('/submitContent', 'POST', formData);

            showMessage(
                document.querySelector('#content-container'),
                message.message,
                message.success ? 'success-message' : 'error-message'
            );

            contentModal.style.display = 'block';
            console.log(message);

            if (message.success) {
                titleInput.value = '';
                contentFormEditor.innerHTML = '';
                updateContentTable();
            }
        } 
        catch (error) {
            console.error(error);
            showMessage(document.querySelector('#content-container'), 'An error occurred', 'error-message');
            contentModal.style.display = 'block';
        }
    });

//********************************************************************************
////Attached event listener to edit forms generated on the content table
//********************************************************************************
    const attachEditEventListeners = () => {

        const editForms = document.querySelectorAll('.edit-form');
        const editForm = document.getElementById('editForm');

        editForms.forEach(form => {

            form.addEventListener('submit', async event => {

                event.preventDefault();
                const contentId = form.querySelector('input[name="contentId"]').value;
                editForm.style.display = 'block';

                try {
                    const response = await fetch(`/getContent?contentId=${contentId}`);

                    console.log(response);

                    if (!response.ok) {
                        throw new Error('Failed to fetch data');
                    }

                    const data = await response.json();
                    console.log('Data:', data);
                    
                    console.log(data);

                    // Set the values in the form inputs
                    const titleInput = editForm.querySelector('#editTitle');
                    const contentIdInput = editForm.querySelector('#editContentInput');

                    titleInput.value = data.title;
                    contentIdInput.value = data._id;
                    editEditor.root.innerHTML = data.content.html;
                } 
                catch (error) {
                    console.error('Error:', error);
                }
            });
        });
    };

//********************************************************************************
////Event listener for editing content 
//********************************************************************************
    editContent.addEventListener('submit', async event => {

        event.preventDefault();
        const editTitleInput = document.querySelector('#editTitle');
        const contentIdInput = document.querySelector('#editContentInput');
        const contentFormEditor = document.querySelector('#editEditor');

        const content = {
            html: editEditor.root.innerHTML,
            photoUrl: 'your-photo-url',
        };

        const formData = {
            title: editTitleInput.value,
            contentId: contentIdInput.value,
            content: JSON.stringify(content),
        };

        try {
            const message = await handleApiRequest('/editContent', 'POST', formData);
            showMessage(
                    document.querySelector('#delete-container'),
                    message.message,
                    message.success ? 'delete-message' : 'error-message'
                );

            deleteModal.style.display = 'block';

            console.log(message);

            if (message.success) {
                updateContentTable();
                editUserForm.style.display = 'none';
            }
        } 
        catch (error) {
            console.error('Error', error);
        }
    });

//********************************************************************************
////Initial table update and close form button event listener
//********************************************************************************
    updateContentTable();

    closeFormButton.addEventListener('click', function () {
        editUserForm.style.display = 'none';
    });
});
