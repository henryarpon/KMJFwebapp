document.addEventListener("DOMContentLoaded", () => {
    const contentForm = document.querySelector('#submitContent');
    const contentModal = document.querySelector('#contentModal');
    const contentContainer = document.querySelector('#content-container');

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
      

    function showMessage(message, className) {
        const contentContainer = document.querySelector('#content-container');
        contentContainer.innerHTML = `
            <div class="${className}">${message}</div>
            <button class="modal-close">Ok</button>
        `;

        const closeButton = contentContainer.querySelector('.modal-close');
        closeButton.addEventListener('click', () => {
            contentModal.style.display = 'none';
        });
    }

    contentForm.addEventListener('submit', async (event) => {

        event.preventDefault();
        const content = quill.root.innerHTML;
        const formData = new FormData(contentForm);
        formData.set('content', content);

        try {
            const response = await fetch('/submitContent', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const successMessage = await response.json();
                showMessage(successMessage.message, 'success-message');
                contentModal.style.display = 'block';
            } 
            else {
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
