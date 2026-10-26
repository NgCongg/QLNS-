const sidebar = document.querySelector('#sidebar');
const overlay = document.querySelector('#overlay');
document.querySelector('#menuBtn')?.addEventListener('click', () => {
  sidebar.classList.toggle('open'); overlay.classList.toggle('show');
});
overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });
document.querySelectorAll('[data-modal-open]').forEach(button => button.addEventListener('click', () => document.querySelector(`#${button.dataset.modalOpen}`).showModal()));
document.querySelectorAll('[data-modal-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
