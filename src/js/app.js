const burger = document.querySelector('.burger');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.layout__overlay');
const closeBtn = document.querySelector('.sidebar__close');

function toggleSidebar() {
  burger?.classList.toggle('is-active');
  sidebar?.classList.toggle('is-open');
  overlay?.classList.toggle('is-visible');

  const expanded = burger?.getAttribute('aria-expanded') === 'true';
  burger?.setAttribute('aria-expanded', String(!expanded));
}

burger?.addEventListener('click', toggleSidebar);
overlay?.addEventListener('click', toggleSidebar);
closeBtn?.addEventListener('click', toggleSidebar);
