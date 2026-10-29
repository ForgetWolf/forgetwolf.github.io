import $ from 'jquery';
import './theme';

// Keep the theme's existing sidebar sizing behavior, including short screens.
function updateSidebar() {
  const stage = $('#stage');
  const main = $('#main-container');
  if (window.innerWidth <= 768 || window.innerHeight <= 600) {
    main.removeClass('col-sm-9');
    $('#side-bar').innerWidth(stage.width() ?? 0);
  } else {
    main.addClass('col-sm-9');
    const width = (stage.width() ?? 0) - (main.outerWidth() ?? 0) + (window.innerWidth - (stage.innerWidth() ?? 0)) / 2;
    $('#side-bar').outerWidth(width);
  }
}
updateSidebar();
window.addEventListener('resize', updateSidebar, { passive: true });
document.fonts.ready.then(updateSidebar);
document.querySelector<HTMLButtonElement>('#copy-link')?.addEventListener('click', async event => {
  const button = event.currentTarget as HTMLButtonElement;
  try { await navigator.clipboard.writeText(window.location.href); button.textContent = '已复制'; }
  catch { button.textContent = '请复制地址栏链接'; }
});
