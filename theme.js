/* Shared tokens for React and CSS. Runs before the first paint. */
(function () {
  const themes = {
    Claro: { bg: '#f5f7f8', card: '#ffffff', accent: '#087f6d', onAccent: '#ffffff', text: '#182b31', muted: '#60747c', border: '#dce5e8', input: '#f3f6f7', danger: '#b4233b', warning: '#946200', info: '#245ec2', success: '#087f5b', mode: 'light' },
    Escuro: { bg: '#0c141a', card: '#141f27', accent: '#5ee0c4', onAccent: '#092b24', text: '#e5eef2', muted: '#9aadb8', border: '#2a3b45', input: '#1b2933', danger: '#ff8e9f', warning: '#f5c76b', info: '#91b7ff', success: '#6edbb1', mode: 'dark' },
    Colorido: { bg: '#faf7fc', card: '#ffffff', accent: '#7350b5', onAccent: '#ffffff', text: '#322841', muted: '#70617e', border: '#e6ddef', input: '#f5f0fa', danger: '#b4233b', warning: '#946200', info: '#6550b7', success: '#087f73', mode: 'light' }
  };
  function normalize(name) {
    if (themes[name]) return name;
    if (name === 'Ártico') return 'Claro';
    if (['Obsidiana', 'Oceano', 'Floresta', 'Ametista', 'Vulcão', 'Ouro Negro', 'Rosa Neon'].includes(name)) return 'Escuro';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Escuro' : 'Claro';
  }
  function read() {
    try { return normalize(localStorage.getItem('aso_theme')); } catch (_) { return normalize(null); }
  }
  function apply(name, persist = false) {
    name = normalize(name);
    const theme = themes[name];
    const root = document.documentElement;
    root.dataset.theme = theme.mode;
    root.dataset.palette = name.toLowerCase();
    root.style.colorScheme = theme.mode;
    Object.entries(theme).forEach(([key, value]) => {
      if (key !== 'mode') root.style.setProperty('--' + key, value);
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.bg);
    if (persist) { try { localStorage.setItem('aso_theme', name); } catch (_) {} }
    return name;
  }
  window.ASOTheme = { themes, normalize, read, apply };
  apply(read());
})();
