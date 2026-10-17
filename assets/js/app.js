/* HayMint — vanilla JS. Renders only "published" items. Never injects HTML from data. */
(() => {
'use strict';
const root = new URL('../../', document.currentScript.src);   // site root, works on github.io and custom domains
const local = p => new URL(p, root).href;
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const demo = document.body.dataset.demo === 'true';
const slug = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const norm = v => slug(v).replace(/-/g, ' ');
const safeURL = v => { try { const u = new URL(v); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
const imageURL = v => typeof v === 'string' && /^assets\/img\/[a-zA-Z0-9_./-]+\.(jpe?g|png|webp|avif|gif)$/i.test(v) && !v.includes('..') ? local(v) : '';
let taxonomy = [], config = {}, all = [];

function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function anchor(text, href, cls, external = false, affiliate = false) {
  const a = el('a', cls, text); a.href = href;
  if (external) { a.target = '_blank'; a.rel = affiliate ? 'sponsored nofollow noopener' : 'noopener noreferrer'; }
  return a;
}
function svg(d, cls, vb = '0 0 20 12', fill = false) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', vb); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(s.namespaceURI, 'path'); p.setAttribute('d', d);
  if (fill) p.setAttribute('fill', 'currentColor');
  else { p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.6'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); }
  s.append(p); return s;
}
const arrow = () => svg('M1 6h17m-5-5 5 5-5 5', 'arrow');
const bag = () => svg('M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2', 'bag', '0 0 24 24');
const ICONS = { living: 'M4 13 16 4l12 9v15H4V13Zm8 15v-9h8v9', desk: 'M3 5h26v17H3V5Zm13 17v6m-7 0h14', finds: 'm16 3 3.9 8 8.6 1.2-6.3 6 1.6 8.6L16 22.7l-7.8 4.1 1.6-8.6-6.3-6L12.1 11 16 3Z' };
const catIcon = k => svg(ICONS[k] || ICONS.finds, 'category-icon', '0 0 32 32');

/* Menu */
const menu = $('#menu-toggle');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); $('#main-nav').classList.toggle('open', open); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { menu.setAttribute('aria-expanded', 'false'); $('#main-nav').classList.remove('open'); document.querySelectorAll('details[open]').forEach(d => d.open = false); } });

/* Filters & chips */
const category = s => taxonomy.find(c => c.slug === s);
function filterURL(values, path = 'category.html') {
  const q = new URLSearchParams();
  if (page === 'category' && path === 'category.html' && params.get('type') && !values.slug) q.set('type', params.get('type'));
  Object.entries(values).forEach(([k, v]) => { if (v) q.set(k, v); });
  return local(path) + (q.size ? '?' + q : '');
}
function chip(text, values, active = false, path) { const a = anchor(text, filterURL(values, path), 'chip' + (active ? ' active' : '')); if (active) a.setAttribute('aria-current', 'true'); return a; }
function chips(item) {
  const box = el('div', 'chips card-chips'); const c = category(item.category); const sub = c?.subcategories.find(s => s.slug === item.subcategory);
  if (c) box.append(chip(c.name || c.label, { cat: c.slug }));
  if (sub) box.append(chip(sub.label, { cat: c.slug, sub: sub.slug }));
  (Array.isArray(item.tags) ? item.tags : []).slice(0, 2).forEach(t => box.append(chip(t, { tag: slug(t) })));
  return box;
}

/* Cards */
function card(item) {
  const node = el('article', 'card card-' + item.kind); const name = item.name || item.title; const body = el('div', 'card-body');
  const c = category(item.category); const sub = c?.subcategories.find(s => s.slug === item.subcategory);
  if (item.kind !== 'guide') {
    const media = el('div', 'card-media'); const src = imageURL(item.image || item.thumbnail);
    if (src) { const img = el('img'); img.src = src; img.alt = name; img.loading = 'lazy'; img.width = 640; img.height = 480;
      img.addEventListener('error', () => { img.remove(); media.prepend(el('span', 'media-placeholder', 'Hình ảnh đang được cập nhật')); }, { once: true }); media.append(img); }
    else media.append(el('span', 'media-placeholder', 'Hình ảnh đang được cập nhật'));
    if (sub) { const t = chip(sub.label, { cat: c.slug, sub: sub.slug }); t.classList.add('media-tag'); media.append(t); }   // a filter tag, not a verdict
    const video = safeURL(item.kind === 'video' ? item.url : item.videoUrl);
    if (video) { const p = anchor('', video, 'play-overlay', true); p.setAttribute('aria-label', 'Xem video: ' + name); p.append(svg('M8 5v14l11-7Z', 'play-icon', '0 0 24 24', true)); media.append(p);
      if (item.duration) media.append(el('span', 'duration', item.duration)); }
    node.append(media);
  } else node.append(el('div', 'guide-symbol', 'HAYMINT / HƯỚNG DẪN'));
  const h = el('h3'); if (item.kind === 'guide') h.append(anchor(name, filterURL({ slug: item.slug }, 'guides/guide.html'))); else h.textContent = name; body.append(h);
  if (item.kind !== 'video' && (item.description || item.intro)) body.append(el('p', 'card-desc', item.description || item.intro));
  body.append(chips(item));
  const actions = el('div', 'card-actions');
  if (item.kind === 'product') {
    const shop = safeURL(item.shopeeUrl);
    if (shop) { const a = anchor('Xem trên Shopee', shop, 'button shop', true, true); a.prepend(bag()); a.append(arrow()); actions.append(a); }
    else if (demo) { const a = el('span', 'button shop is-demo', 'Xem trên Shopee'); a.prepend(bag()); a.append(arrow()); actions.append(a); }
    else { const v = safeURL(item.videoUrl); if (v) actions.append(anchor('Xem video', v, 'button shop', true)); }
  } else if (item.kind === 'video') { const v = safeURL(item.url); if (v) { const a = anchor('Xem video', v, 'button shop', true); actions.append(a); } }
  else actions.append(anchor('Đọc hướng dẫn', filterURL({ slug: item.slug }, 'guides/guide.html'), 'button shop'));
  if (page !== 'home' || item.kind === 'product') if (actions.childElementCount) body.append(actions);
  node.append(body); return node;
}
const grid = (sel, items) => { const t = $(sel); if (t) t.replaceChildren(...items.map(card)); };
const hasAffiliate = items => items.some(i => i.kind === 'product' && safeURL(i.shopeeUrl));
function note(container, items) { const n = container?.querySelector('.affiliate-note'); if (n) n.hidden = !hasAffiliate(items); }

/* Social + SEO */
function setupSocial() {
  const cfg = demo ? { ...config, facebookPageUrl: config.facebookPageUrl || 'https://www.facebook.com/', youtubeUrl: config.youtubeUrl || 'https://www.youtube.com/', tiktokUrl: config.tiktokUrl || 'https://www.tiktok.com/', instagramUrl: config.instagramUrl || 'https://www.instagram.com/' } : config;
  const fb = safeURL(cfg.facebookPageUrl);
  document.querySelectorAll('[data-facebook]').forEach(a => { a.hidden = !fb; if (fb) { a.href = fb; a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
  const P = { facebookPageUrl: ['Facebook', 'M14 22v-8h3l.5-4H14V8c0-1 .4-2 2-2h2V2h-3c-4 0-5 2-5 5v3H7v4h3v8Z'],
    youtubeUrl: ['YouTube', 'M22 7c0-2-1-3-3-3H5C3 4 2 5 2 7v10c0 2 1 3 3 3h14c2 0 3-1 3-3V7ZM10 8.5v7l6-3.5-6-3.5Z'],
    tiktokUrl: ['TikTok', 'M14 2h3.5c.3 2.4 2 4 4.5 4.2v3.6c-1.7 0-3.2-.5-4.5-1.4v7.1a6.5 6.5 0 1 1-6.5-6.5v3.6a2.9 2.9 0 1 0 3 2.9V2Z'],
    instagramUrl: ['Instagram', 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.3 5.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z'] };
  const box = $('#social-links');
  Object.entries(P).forEach(([k, [label, d]]) => { const u = safeURL(cfg[k]); if (!u || !box) return; const a = anchor('', u, '', true); a.setAttribute('aria-label', label); const s = svg(d, '', '0 0 24 24', true); s.setAttribute('fill-rule', 'evenodd'); a.append(s); box.append(a); });
}
function seo(title, description) {
  if (title) { document.title = title + ' | ' + (config.siteName || 'HayMint'); document.querySelectorAll('[property="og:title"],[name="twitter:title"]').forEach(m => m.content = document.title); }
  if (description) document.querySelectorAll('meta[name="description"],[property="og:description"],[name="twitter:description"]').forEach(m => m.content = description);
  const base = safeURL(config.baseUrl) || root.href;
  const rel = location.pathname.slice(root.pathname.length) || 'index.html';
  const q = page === 'guide' && params.get('slug') ? '?slug=' + encodeURIComponent(params.get('slug')) : page === 'category' && params.get('cat') ? '?cat=' + encodeURIComponent(params.get('cat')) : '';
  const url = new URL(rel + q, base.replace(/\/?$/, '/')).href;
  const c = $('link[rel="canonical"]'); if (c) c.href = url; const o = $('meta[property="og:url"]'); if (o) o.content = url;
}

/* Pages */
function home() {
  if (demo) $('#demo-banner').hidden = false;
  const g = $('#category-grid');
  taxonomy.forEach(c => {
    const href = filterURL({ cat: c.slug }); const n = el('article', 'category-card');
    const v = el('a', 'category-visual'); v.href = href; v.tabIndex = -1; v.setAttribute('aria-hidden', 'true');
    const src = imageURL(c.image); if (src) { const img = el('img'); img.src = src; img.alt = ''; img.loading = 'lazy'; v.append(img); } else v.append(catIcon(c.slug));
    const copy = el('div', 'category-copy'); copy.append(catIcon(c.slug));
    const h = el('h3'); h.append(anchor('HayMint ' + (c.name || c.label), href));
    const more = anchor('Khám phá ', href, 'category-explore'); more.append(arrow()); more.setAttribute('aria-label', 'Khám phá HayMint ' + (c.name || c.label));
    copy.append(h, el('p', '', c.description || ''), more); n.append(v, copy); g.append(n);
  });
  ['product', 'video', 'guide'].forEach(k => { const items = all.filter(i => i.kind === k).slice(0, 4); const s = $('#' + k + 's-section'); s.hidden = !items.length; grid('#' + k + 's-grid', items); note(s, items); });
  $('#empty-state').hidden = !!all.length;
  $('#explore').addEventListener('click', () => $('#categories').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  if (!demo) { const ld = el('script'); ld.type = 'application/ld+json'; ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: config.siteName || 'HayMint', url: safeURL(config.baseUrl) || root.href, sameAs: [config.facebookPageUrl, config.tiktokUrl, config.youtubeUrl, config.instagramUrl].map(safeURL).filter(Boolean) }); document.head.append(ld); }
}
const matches = i => (!params.get('type') || i.kind === params.get('type')) && (!params.get('cat') || i.category === params.get('cat')) && (!params.get('sub') || i.subcategory === params.get('sub')) && (!params.get('tag') || (i.tags || []).some(t => slug(t) === params.get('tag')));
function listing() {
  const path = page === 'category' ? 'category.html' : page === 'reels' ? 'reels.html' : 'guides/index.html';
  const c = category(params.get('cat')); const bar = $('#filters');
  bar.append(chip('Tất cả', c ? { cat: c.slug } : {}, !params.get('sub') && !params.get('tag') && (c ? true : !params.get('cat')), path));
  taxonomy.forEach(t => bar.append(chip(t.name || t.label, { cat: t.slug }, params.get('cat') === t.slug && !params.get('sub'), path)));
  if (c) c.subcategories.forEach(s => bar.append(chip(s.label, { cat: c.slug, sub: s.slug }, params.get('sub') === s.slug, path)));
  if (params.get('tag')) bar.append(chip('Thẻ: ' + params.get('tag'), { cat: params.get('cat'), sub: params.get('sub'), tag: params.get('tag') }, true, path));
  if (page === 'category') {
    if (c) { $('#listing-title').textContent = 'HayMint ' + (c.name || c.label); $('#listing-description').textContent = c.description || c.label; seo('HayMint ' + (c.name || c.label), c.description); }
    else if (params.get('type') === 'product') { $('#listing-title').textContent = 'Sản phẩm'; seo('Sản phẩm'); }
  }
  const items = all.filter(i => (page === 'category' || i.kind === (page === 'reels' ? 'video' : 'guide')) && matches(i));
  grid('#listing-grid', items); $('#listing-count').textContent = items.length ? items.length + ' nội dung' : '';
  $('#listing-empty').hidden = !!items.length; note($('#listing-section'), items);
}
function guide() {
  const item = all.find(i => i.kind === 'guide' && i.slug === params.get('slug')); const t = $('#guide-content'); t.replaceChildren();
  if (!item) { t.append(el('h1', '', 'Chưa tìm thấy hướng dẫn'), el('p', '', 'Nội dung này chưa được xuất bản hoặc không còn tồn tại.'), anchor('Xem các hướng dẫn khác', local('guides/index.html'))); const m = el('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.append(m); return; }
  seo(item.title, item.intro);
  const chipBox = chips(item); chipBox.classList.remove('card-chips');
  t.append(el('p', 'eyebrow', 'HAYMINT / HƯỚNG DẪN'), el('h1', '', item.title), chipBox);
  if (item.updatedAt) { const d = el('time', 'updated', 'Cập nhật: ' + item.updatedAt); d.dateTime = item.updatedAt; t.append(d); }
  t.append(el('p', 'lead', item.intro || ''));
  (item.sections || []).forEach(s => { if (s.heading) t.append(el('h2', '', s.heading)); (s.paragraphs || []).forEach(p => t.append(el('p', '', p))); });
  const rel = all.filter(i => i.kind === 'product' && (item.relatedProductIds || []).includes(i.id));
  $('#related-section').hidden = !rel.length; grid('#related-grid', rel); note($('#related-section'), rel);
}
function search() {
  $('#site-search').addEventListener('input', e => {
    const q = norm(e.target.value.trim()); $('#search-results').hidden = !q; $('#page-content').hidden = !!q; if (!q) return;
    const items = all.filter(i => norm([i.name || i.title, ...(i.tags || [])].join(' ')).includes(q));
    grid('#search-grid', items); $('#search-count').textContent = items.length ? items.length + ' nội dung phù hợp' : 'Chưa có nội dung phù hợp. Bạn thử từ khóa khác nhé.'; note($('#search-results'), items);
  });
}

/* Load */
async function load(name) {
  const dir = demo && ['products', 'videos', 'guides'].includes(name) ? 'data/demo/' : 'data/';
  const r = await fetch(local(dir + name + '.json'), { cache: 'no-cache' }); if (!r.ok) throw new Error(name + ': HTTP ' + r.status); return r.json();
}
async function start() {
  const names = ['config', 'taxonomy', 'products', 'videos', 'guides']; const kinds = { products: 'product', videos: 'video', guides: 'guide' };
  const res = await Promise.allSettled(names.map(load)); let failed = false;
  res.forEach((r, i) => { if (r.status === 'rejected') { failed = true; console.warn('HayMint:', r.reason); } });
  config = res[0].status === 'fulfilled' ? res[0].value : {};
  taxonomy = res[1].status === 'fulfilled' && Array.isArray(res[1].value) ? res[1].value : [];
  names.slice(2).forEach((n, j) => {
    const r = res[j + 2]; if (r.status !== 'fulfilled' || !Array.isArray(r.value)) return;
    r.value.forEach(item => {
      const c = category(item.category);
      if (!c || !c.subcategories.some(s => s.slug === item.subcategory)) console.warn('HayMint: danh mục không hợp lệ →', item.id || item.slug, item.category, item.subcategory);
      if (item.status === 'published') all.push({ ...item, kind: kinds[n] });
    });
  });
  all.sort((a, b) => String(b.publishedAt || b.updatedAt || '').localeCompare(String(a.publishedAt || a.updatedAt || '')));
  setupSocial(); seo();
  if (page === 'home') home();
  if (['category', 'reels', 'guides'].includes(page)) listing();
  if (page === 'guide') guide();
  search();
  if (failed) { const n = $('#load-error'); n.hidden = false; n.textContent = 'Chưa tải được một phần nội dung. Bạn thử tải lại trang sau nhé.'; }
  document.body.dataset.ready = 'true';
}
start().catch(err => { console.error(err); const n = $('#load-error'); if (n) { n.hidden = false; n.textContent = 'Chưa tải được nội dung. Bạn thử tải lại trang sau nhé.'; } document.body.dataset.ready = 'error'; });
})();
