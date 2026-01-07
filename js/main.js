const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });
}

const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      if (navLinks && navLinks.classList.contains('open')) navLinks.classList.remove('open');
    }
  });
});
