document.addEventListener("DOMContentLoaded", () => {
    const contentForm = document.querySelector('#submitContent');
    const contentModal = document.querySelector('#contentModal');
    const contentContainer = document.querySelector('#content-container');
    const modalCloseButton = document.querySelector('#modal-close');
  
    contentForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent the default form submission
  
      const formData = new FormData(contentForm);
  
      try {
        const response = await fetch('/submitContent', {
          method: 'POST',
          body: formData
        });
  
        if (response.ok) {
          // Display success message as a modal
          const successMessage = await response.json();
          showMessage(successMessage.message, 'success-message');
          contentModal.classList.add('modal-show');
        } else {
          // Handle the error response
          const errorMessage = await response.json();
          showMessage(errorMessage.message, 'error-message');
          contentModal.classList.add('modal-show');
        }
      } catch (error) {
        // Handle the fetch error
        console.error(error);
        showMessage('Error occurred', 'error-message');
        contentModal.classList.add('modal-show');
      }
    });
  
    // Function to display the modal with the provided message and class name
    function showMessage(message, className) {
      contentContainer.innerHTML = `
        <div class="${className}">${message}
          <button class="modal-close">Ok</button>
        </div>
      `;
    }
  
    // Close the modal when the user clicks the close button
    contentModal.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-close')) {
            event.preventDefault();
            contentModal.classList.remove('modal-show');
        }
    });

  });
  