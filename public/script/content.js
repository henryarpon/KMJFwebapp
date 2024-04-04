document.addEventListener("DOMContentLoaded", function() {
  // Get all elements with the class "content-card"
  let contentCards = document.querySelectorAll('.content-card');

  // Iterate through each content-card element
  contentCards.forEach(contentCard => {
    // Get the title and content elements
    let title = contentCard.querySelector('.content-head h3');
    let contentBody = contentCard.querySelector('.content-body');

    // Hide the content initially
    contentBody.style.display = 'none';

    // Create "See more" link
    let seeMoreLink = document.createElement('a');
    seeMoreLink.textContent = ' See more...';
    seeMoreLink.className = 'see-more';
    seeMoreLink.href = '#';

    // Append "See more" link to the title
    title.appendChild(seeMoreLink);

    // Add click event listener to "See more" link
    seeMoreLink.addEventListener('click', function(event) {
      event.preventDefault();
      // Toggle visibility of content
      if (contentBody.style.display === 'none') {
        contentBody.style.display = 'block';
        seeMoreLink.textContent = ' See less';
      } else {
        contentBody.style.display = 'none';
        seeMoreLink.textContent = ' See more...';
      }
    });
  });
});

function jumpToSection(sectionId) {
  let section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}