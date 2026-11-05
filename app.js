const translated = [...document.querySelectorAll('[data-es]')];
translated.forEach(element => { element.dataset.en = element.innerHTML; });
const languageButton = document.querySelector('#lang');
function setLanguage(language) {
  document.documentElement.lang = language;
  // Metadata mirrors the visible language. Separate /es/ URLs are needed before hreflang.
  const isChefPage = location.pathname.startsWith('/for-chefs');
  const isEventsPage = location.pathname.startsWith('/events');
  const seoText = isEventsPage ? {
    en: {title: 'Food Events, Supper Clubs & Pop-Ups in Barcelona | SíChef', description: 'Discover chef-led dinners, supper clubs and food pop-ups in Barcelona. Explore local experiences or host your own event with SíChef.'},
    es: {title: 'Eventos gastronómicos, supper clubs y pop-ups en Barcelona | SíChef', description: 'Descubre cenas de chefs, supper clubs y pop-ups en Barcelona. Explora experiencias locales u organiza tu propio evento con SíChef.'}
  } : isChefPage ? {
    en: {title: 'Sell Your Food in Barcelona | Join SíChef as a Chef', description: 'Are you an independent chef in Barcelona? Join SíChef to showcase your cooking, manage menus, pickup hours and customer orders.'},
    es: {title: 'Vende tu comida en Barcelona | Únete a SíChef como chef', description: '¿Cocinas en Barcelona? Únete a SíChef para compartir tus platos, gestionar tu menú, horarios de recogida y pedidos.'}
  } : {
    en: {title: 'Home-Cooked Food & Local Chefs in Barcelona | SíChef', description: 'Discover independent local chefs in Barcelona, explore homemade meals and arrange convenient pickup through SíChef.'},
    es: {title: 'Comida casera y chefs locales en Barcelona | SíChef', description: 'Descubre chefs independientes en Barcelona, explora sus platos caseros y organiza la recogida de tu comida con SíChef.'}
  };
  const currentSeo = seoText[language];
  document.title = currentSeo.title;
  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) descriptionTag.setAttribute('content', currentSeo.description);
  for (const [selector, value] of [
    ['meta[property="og:title"]', currentSeo.title],
    ['meta[property="og:description"]', currentSeo.description],
    ['meta[name="twitter:title"]', currentSeo.title],
    ['meta[name="twitter:description"]', currentSeo.description],
    ['meta[property="og:locale"]', language === 'es' ? 'es_ES' : 'en_GB']
  ]) {
    const tag = document.querySelector(selector);
    if (tag) tag.setAttribute('content', value);
  }
  translated.forEach(element => { element.innerHTML = element.dataset[language]; });
  languageButton.textContent = language === 'es' ? 'EN' : 'ES';
  languageButton.setAttribute('aria-label', language === 'es' ? 'Switch to English' : 'Cambiar a español');
  try { localStorage.setItem('lang', language); } catch {}
}
let language = 'en';
try { language = localStorage.getItem('lang') === 'es' ? 'es' : 'en'; } catch {}
setLanguage(language);
languageButton.addEventListener('click', () => setLanguage(document.documentElement.lang === 'es' ? 'en' : 'es'));
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('open', expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('.showcase').forEach(showcase => {
  const tabs = [...showcase.querySelectorAll('[role=tab]')];
  function selectTab(selected) {
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[next]);
      tabs[next].focus();
    });
  });
});

const carousel = document.querySelector('.cpc-carousel');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.cpc-slide')];
  const dots = [...carousel.querySelectorAll('.cpc-dot')];
  const counter = carousel.querySelector('.cpc-counter');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let hovered = false;
  let visible = false;
  let timer;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    dots.forEach((dot, i) => { dot.setAttribute('aria-current', String(i === current)); });
    counter.textContent = (current + 1) + ' / ' + slides.length;
  }

  function updatePlayback() {
    clearInterval(timer);
    const interacting = hovered || carousel.contains(document.activeElement);
    const running = !reducedMotion.matches && !interacting && visible && !document.hidden;
    counter.setAttribute('aria-live', running ? 'off' : 'polite');
    if (running) timer = setInterval(() => showSlide(current + 1), 5000);
  }

  function navigate(index) {
    showSlide(index);
    updatePlayback();
  }
  carousel.querySelector('.cpc-prev').addEventListener('click', () => navigate(current - 1));
  carousel.querySelector('.cpc-next').addEventListener('click', () => navigate(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => navigate(index)));
  carousel.addEventListener('mouseenter', () => { hovered = true; updatePlayback(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; updatePlayback(); });
  carousel.addEventListener('focusin', updatePlayback);
  carousel.addEventListener('focusout', () => setTimeout(updatePlayback, 0));
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    navigate(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    updatePlayback();
  }, { threshold: 0.2 }).observe(carousel);
  updatePlayback();
}
