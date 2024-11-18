// Select all dropdown toggles
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

dropdownToggles.forEach(toggle => {
  toggle.addEventListener('click', function (e) {
    e.preventDefault();

    // Access parent dropdown and submenu
    const parentDropdown = this.parentElement;
    const submenu = this.nextElementSibling;

    // Toggle open state
    const isOpen = parentDropdown.classList.toggle('open');
    this.setAttribute('aria-expanded', isOpen);

    // Update max-height for submenu smooth transition
    submenu.style.maxHeight = isOpen ? `${submenu.scrollHeight}px` : '0px';

    // Close other open submenus
    dropdownToggles.forEach(otherToggle => {
      if (otherToggle !== this) {
        const otherParent = otherToggle.parentElement;
        otherParent.classList.remove('open');
        otherToggle.setAttribute('aria-expanded', 'false');
        otherToggle.nextElementSibling.style.maxHeight = '0px';
      }
    });
  });
});
