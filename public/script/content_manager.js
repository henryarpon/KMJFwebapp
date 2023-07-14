document.addEventListener("DOMContentLoaded", async () => {
    const contentForm = document.querySelector('#submitContent');
    const contentModal = document.querySelector('#contentModal');

    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
            ]
        }
    });

    // Updating the edit/delete table
    async function updateContentTable() {
        try {
            const response = await fetch('/getContents');

            if (response.ok) {
                const contents = await response.json();
                const table = document.getElementById('table-card');

                // Clear existing table rows
                table.innerHTML = '';

                // Add new rows for each content
                contents.forEach(content => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${content.title}</td>
                        <td>
                            <form action="/editContent" method="POST">
                                <input type="hidden" name="contentId" value="${content._id}">
                                <button type="submit">Edit</button>
                            </form>
                        </td>
                        <td>
                            <form action="/deleteContent" method="POST">
                                <input type="hidden" name="contentId" value="${content._id}">
                                <button type="submit">Delete</button>
                            </form>
                        </td>
                    `;
                    table.appendChild(row);
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
      
    function showMessage(message, className) {
        const contentContainer = document.querySelector('#content-container');
        contentContainer.innerHTML = `
            <div class="${className}">${message}</div>
            <button class="modal-close">Ok</button>
        `;

        const closeButton = contentContainer.querySelector('.modal-close');
        closeButton.addEventListener('click', () => {
            updateContentTable();
            contentModal.style.display = 'none';
        });
    }

    contentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const content = {
            html: quill.root.innerHTML,
            photoUrl: 'your-photo-url'
        };
    
        const titleInput = document.querySelector('#title');
        const contentEditor = document.querySelector('#editor');
    
        const formData = {
            title: titleInput.value,
            content: JSON.stringify(content)
        };
    
        try {
            const response = await fetch('/submitContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            if (response.ok) {
                const successMessage = await response.json();
                showMessage(successMessage.message, 'success-message');
                contentModal.style.display = 'block';
                titleInput.value = ''; 
                contentEditor.innerHTML = '';
            } else {
                const errorMessage = await response.json();
                showMessage(errorMessage.message, 'error-message');
                contentModal.style.display = 'block';
            }
        } 
        catch (error) {
            console.error(error);
            showMessage('Error occurred', 'error-message');
            contentModal.style.display = 'block';
        }
    });  
});
