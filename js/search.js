document.addEventListener('DOMContentLoaded', async function() {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('q') || '').trim();
  const label = document.getElementById('searchQueryLabel');
  const input = document.getElementById('searchInput');
  const container = document.getElementById('resultsContainer');

  if (input) input.value = q;
  if (label) label.textContent = q ? `Showing results for: "${q}"` : 'Type a search above';

  if (!q) return;

  const term = q.toLowerCase();
  const results = [];

  // 1) Search drinks via getAllDrinks from script.js
  if (typeof getAllDrinks === 'function') {
    try {
      const drinks = getAllDrinks();
      drinks.forEach(d => {
        const hay = `${d.name} ${d.category} ${d.description || ''}`.toLowerCase();
        if (hay.includes(term)) {
          results.push({
            type: 'drink',
            title: d.name,
            subtitle: `Category: ${d.category} • Ksh ${d.price}`,
            link: `menu.html?category=${encodeURIComponent(d.category)}`
          });
        }
      });
    } catch(e) {
      console.warn('Drink search failed:', e);
    }
  }

  // 2) Search static pages text
  const pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'menu.html', title: 'Menu' },
    { url: 'about.html', title: 'About' },
    { url: 'contact.html', title: 'Contact' },
    { url: 'cart.html', title: 'Cart' }
  ];

  for (const p of pages) {
    try {
      const res = await fetch(p.url);
      const text = await res.text();
      const plain = text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ');
      const idx = plain.toLowerCase().indexOf(term);
      if (idx !== -1) {
        const start = Math.max(0, idx - 60);
        const end = Math.min(plain.length, idx + 60);
        const snippet = plain.substring(start, end).replace(/\s+/g, ' ');
        results.push({ type: 'page', title: p.title, subtitle: snippet + '...', link: p.url });
      }
    } catch(e) {
      console.warn('Page search failed for', p.url, e);
    }
  }

  // Render results
  if (container) {
    container.innerHTML = '';
    if (results.length === 0) {
      container.innerHTML = '<p>No results found. Try a different keyword.</p>';
      return;
    }

    results.forEach(r => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.style.border = '1px solid #eee';
      item.style.borderRadius = '8px';
      item.style.padding = '12px';
      item.style.display = 'grid';
      item.style.gap = '4px';

      const icon = r.type === 'drink' ? '<i class="fas fa-cocktail"></i>' : '<i class="fas fa-file-alt"></i>';
      item.innerHTML = `
        <div style="font-weight:600; display:flex; align-items:center; gap:8px;">${icon} ${r.title}</div>
        <div style="color:#666; font-size:0.9rem;">${r.subtitle}</div>
        <div>
          <a href="${r.link}" class="btn" style="display:inline-block; margin-top:6px;">Open</a>
        </div>
      `;
      container.appendChild(item);
    });
  }
});