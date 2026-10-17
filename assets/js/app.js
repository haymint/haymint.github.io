/* HayMint: no dependencies, no HTML injected from content, only published items. */
(() => {
'use strict';
const script = document.currentScript;
const root = new URL('../../', script.src);
const local = path => new URL(path, root).href;
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const slug = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const normalized = value => slug(value).replace(/-/g,' ');
const safeURL = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
const imageURL = value => typeof value === 'string' && /^assets\/img\/[a-zA-Z0-9_./-]+\.(jpe?g|png|webp|avif|gif)$/i.test(value) && !value.includes('..') ? local(value) : '';
function el(tag, cls, text) { const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n; }
function anchor(text,href,cls,external=false,affiliate=false){ const a=el('a',cls,text);a.href=href;if(external){a.target='_blank';a.rel=affiliate?'sponsored nofollow noopener':'noopener noreferrer';}return a; }
const menu=$('#menu-toggle');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('#main-nav').classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');$('#main-nav').classList.remove('open');document.querySelectorAll('details[open]').forEach(d=>d.open=false);}});
let taxonomy=[], config={}, all=[];
function category(sl){return taxonomy.find(c=>c.slug===sl);}
function filterURL(values,path='category.html'){const q=new URLSearchParams();if(page==='category'&&path==='category.html'&&params.get('type')&&!values.slug)q.set('type',params.get('type'));Object.entries(values).forEach(([k,v])=>{if(v)q.set(k,v);});return local(path)+(q.size?'?'+q.toString():'');}
function chip(text,values,active=false,path){const a=anchor(text,filterURL(values,path),'chip'+(active?' active':''));if(active)a.setAttribute('aria-current','true');return a;}
function chips(item){const box=el('div','chips');const c=category(item.category);const sub=c?.subcategories.find(s=>s.slug===item.subcategory);if(c)box.append(chip(c.name||c.label,{cat:c.slug}));if(sub)box.append(chip(sub.label,{cat:c.slug,sub:sub.slug}));(Array.isArray(item.tags)?item.tags:[]).slice(0,2).forEach(t=>box.append(chip(t,{tag:slug(t)})));return box;}
function bag(){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('class','bag');s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d','M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2');p.setAttribute('fill','none');p.setAttribute('stroke','currentColor');p.setAttribute('stroke-width','1.6');s.append(p);return s;}
const ARROW='M1 6h17m-5-5 5 5-5 5';
function svgIcon(d,cls,vb){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox',vb||'0 0 20 12');s.setAttribute('class',cls);s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke','currentColor');p.setAttribute('stroke-width','1.6');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');s.append(p);return s;}
function card(item){
 const node=el('article','card card-'+item.kind);const name=item.name||item.title;const body=el('div','card-body');
 const c=category(item.category);const sub=c?.subcategories.find(x=>x.slug===item.subcategory);
 if(item.kind!=='guide'){
  const media=el('div','card-media');const src=imageURL(item.image||item.thumbnail);
  if(src){const img=el('img');img.src=src;img.alt=name;img.loading='lazy';img.width=640;img.height=480;img.addEventListener('error',()=>{img.remove();media.prepend(el('span','media-placeholder','Hình ảnh đang được cập nhật'));},{once:true});media.append(img);}else media.append(el('span','media-placeholder','Hình ảnh đang được cập nhật'));
  // Tag pill sits where a badge would be: it is a filter link, never a verdict.
  if(sub){const t=chip(sub.label,{cat:c.slug,sub:sub.slug});t.classList.add('media-tag');media.append(t);}
  const video=safeURL(item.kind==='video'?item.url:item.videoUrl);
  if(video){const play=anchor('',video,'play-overlay',true);play.setAttribute('aria-label','Xem video: '+name);play.append(svgIcon('M8 5v14l11-7Z','play-icon','0 0 24 24'));media.append(play);}
  if(item.duration&&video)media.append(el('span','duration',item.duration));
  node.append(media);
 }else node.append(el('div','guide-symbol','HAYMINT / HƯỚNG DẪN'));
 const h=el('h3');if(item.kind==='guide')h.append(anchor(name,filterURL({slug:item.slug},'guides/guide.html')));else h.textContent=name;body.append(h);
 if(item.kind!=='video'&&(item.description||item.intro))body.append(el('p','card-desc',item.description||item.intro));
 const tags=chips(item);tags.classList.add('card-chips');body.append(tags);
 const actions=el('div','card-actions');
 if(item.kind==='product'){
  const shop=safeURL(item.shopeeUrl);
  if(shop){const a=anchor('Xem trên Shopee',shop,'button shop',true,true);a.prepend(bag());a.append(svgIcon(ARROW,'arrow'));actions.append(a);}
  else if(demo){const a=el('span','button shop is-demo','Xem trên Shopee');a.setAttribute('aria-disabled','true');a.title='Bản xem trước: chưa có link';a.prepend(bag());a.append(svgIcon(ARROW,'arrow'));actions.append(a);}
 }else if(item.kind==='guide')actions.append(anchor('Đọc hướng dẫn',filterURL({slug:item.slug},'guides/guide.html'),'button shop'));
 if(actions.childElementCount)body.append(actions);
 node.append(body);return node;
}
function grid(selector,items){const target=$(selector);if(target)target.replaceChildren(...items.map(card));}
function note(container,items){const n=container?.querySelector('.affiliate-note');if(n)n.hidden=!items.some(i=>i.kind==='product'&&safeURL(i.shopeeUrl));}
function setupSocial(){if(demo)config={...config,facebookPageUrl:config.facebookPageUrl||'https://www.facebook.com/',youtubeUrl:config.youtubeUrl||'https://www.youtube.com/',tiktokUrl:config.tiktokUrl||'https://www.tiktok.com/',instagramUrl:config.instagramUrl||'https://www.instagram.com/'};document.querySelectorAll('[data-facebook]').forEach(a=>{const u=safeURL(config.facebookPageUrl);a.hidden=!u;if(u){a.href=u;a.target='_blank';a.rel='noopener noreferrer';}});const paths={facebookPageUrl:['Facebook','M14 22v-8h3l.5-4H14V8c0-1 .4-2 2-2h2V2h-3c-4 0-5 2-5 5v3H7v4h3v8Z'],tiktokUrl:['TikTok','M14 2h4c0 3 2 4 4 4v4c-2 0-4-1-4-2v8a6 6 0 1 1-6-6v4a2 2 0 1 0 2 2Z'],youtubeUrl:['YouTube','M22 7c0-2-1-3-3-3H5C3 4 2 5 2 7v10c0 2 1 3 3 3h14c2 0 3-1 3-3ZM10 8l6 4-6 4Z'],instagramUrl:['Instagram','M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5-3h2v2h-2Z']};Object.entries(paths).forEach(([key,[name,path]])=>{const u=safeURL(config[key]);if(!u)return;const a=anchor('',u,'',true);a.setAttribute('aria-label',name);const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',path);p.setAttribute('fill-rule','evenodd');s.append(p);a.append(s);$('#social-links').append(a);});}
function seo(title,description){if(title){document.title=title+' | '+config.siteName;['og:title','twitter:title'].forEach(k=>document.querySelector(`[property="${k}"], [name="${k}"]`)?.setAttribute('content',document.title));}if(description){document.querySelector('meta[name="description"]').content=description;['og:description','twitter:description'].forEach(k=>document.querySelector(`[property="${k}"], [name="${k}"]`)?.setAttribute('content',description));}const path=location.pathname.slice(root.pathname.length);const query=page==='guide'&&params.get('slug')?'?slug='+encodeURIComponent(params.get('slug')):'';const base=safeURL(config.baseUrl)||root.href;const url=new URL(path+query,base.replace(/\/?$/,'/')).href;document.querySelector('link[rel="canonical"]').href=url;document.querySelector('meta[property="og:url"]').content=url;}
function categoryIcon(kind){
 const paths={living:'M4 11 16 2l12 9v17H4V11Zm8 17V16h8v12',desk:'M3 4h26v18H3V4Zm13 18v7m-7 0h14',finds:'m16 2 4.3 8.7 9.6 1.4-7 6.8 1.7 9.6-8.6-4.6-8.6 4.6 1.7-9.6-7-6.8 9.6-1.4L16 2Z'};
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','category-icon');const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',paths[kind]||paths.finds);p.setAttribute('fill','none');p.setAttribute('stroke','currentColor');p.setAttribute('stroke-width','1.7');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');svg.append(p);return svg;
}
function home(){
 if(demo)$('#demo-banner').hidden=false;
 const catGrid=$('#category-grid');
 taxonomy.forEach(c=>{
  const href=filterURL({cat:c.slug});const n=el('article','category-card');
  const visual=el('a','category-visual');visual.href=href;visual.tabIndex=-1;visual.setAttribute('aria-hidden','true');
  const src=imageURL(c.image);if(src){const img=el('img');img.src=src;img.alt='';img.loading='lazy';visual.append(img);}else visual.append(categoryIcon(c.slug));
  const copy=el('div','category-copy');copy.append(categoryIcon(c.slug));
  const h=el('h3');h.append(anchor('HayMint '+(c.name||c.label),href));
  const more=anchor('Khám phá ',href,'category-explore');more.append(svgIcon(ARROW,'arrow'));more.setAttribute('aria-label','Khám phá HayMint '+(c.name||c.label));
  copy.append(h,el('p','',c.description||''),more);n.append(visual,copy);catGrid.append(n);
 });
 ['product','video','guide'].forEach(kind=>{const items=all.filter(i=>i.kind===kind).slice(0,4);const section=$('#'+kind+'s-section');section.hidden=!items.length;grid('#'+kind+'s-grid',items);note(section,items);});
 $('#empty-state').hidden=!!all.length;
 $('#explore').addEventListener('click',()=>{$('#categories').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
 if(!demo){const ld=$('#organization-schema')||el('script');ld.id='organization-schema';ld.type='application/ld+json';ld.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:config.siteName,url:safeURL(config.baseUrl)||root.href,sameAs:[config.facebookPageUrl,config.tiktokUrl,config.youtubeUrl,config.instagramUrl].map(safeURL).filter(Boolean)});document.head.append(ld);}
}
function matches(i){return (!params.get('type')||i.kind===params.get('type'))&&(!params.get('cat')||i.category===params.get('cat'))&&(!params.get('sub')||i.subcategory===params.get('sub'))&&(!params.get('tag')||(i.tags||[]).some(t=>slug(t)===params.get('tag')));}
function listing(){const path=page==='category'?'category.html':page==='reels'?'reels.html':'guides/index.html';const c=category(params.get('cat'));const bar=$('#filters');bar.append(chip('Tất cả',c?{cat:c.slug}:{},!params.get('sub')&&!params.get('tag'),path));taxonomy.forEach(t=>bar.append(chip(t.name||t.label,{cat:t.slug},params.get('cat')===t.slug&&!params.get('sub'),path)));if(c)c.subcategories.forEach(s=>bar.append(chip(s.label,{cat:c.slug,sub:s.slug},params.get('sub')===s.slug,path)));if(params.get('tag'))bar.append(chip('Thẻ: '+params.get('tag'),{cat:params.get('cat'),sub:params.get('sub'),tag:params.get('tag')},true,path));if(page==='category'&&c){$('#listing-title').textContent='HayMint '+(c.name||c.label);$('#listing-description').textContent=c.description||c.label;seo('HayMint '+(c.name||c.label),c.description||c.label);}const items=all.filter(i=>(page==='category'||i.kind===(page==='reels'?'video':'guide'))&&matches(i));grid('#listing-grid',items);$('#listing-count').textContent=items.length+' nội dung';$('#listing-empty').hidden=!!items.length;note($('#listing-section'),items);}
function guide(){const item=all.find(i=>i.kind==='guide'&&i.slug===params.get('slug'));const target=$('#guide-content');target.replaceChildren();if(!item){target.append(el('h1','','Chưa tìm thấy hướng dẫn'),el('p','','Nội dung này chưa được xuất bản hoặc không còn tồn tại.'),anchor('Xem các hướng dẫn khác',local('guides/index.html')));const m=el('meta');m.name='robots';m.content='noindex';document.head.append(m);return;}seo(item.title,item.intro);target.append(el('p','eyebrow','HAYMINT / HƯỚNG DẪN'),el('h1','',item.title),chips(item));if(item.updatedAt){const date=el('time','updated','Cập nhật: '+item.updatedAt);date.dateTime=item.updatedAt;target.append(date);}target.append(el('p','lead',item.intro));(item.sections||[]).forEach(s=>{if(s.heading)target.append(el('h2','',s.heading));(s.paragraphs||[]).forEach(p=>target.append(el('p','',p)));});const related=all.filter(i=>i.kind==='product'&&(item.relatedProductIds||[]).includes(i.id));$('#related-section').hidden=!related.length;grid('#related-grid',related);note($('#related-section'),related);}
const demo=document.body.dataset.demo==='true';
async function load(name){const dir=demo&&['products','videos','guides'].includes(name)?'data/demo/':'data/';const response=await fetch(local(dir+name+'.json'));if(!response.ok)throw new Error(name+': HTTP '+response.status);return response.json();}
async function start(){try{const results=await Promise.allSettled(['config','taxonomy','products','videos','guides'].map(load));const failures=[];results.forEach((v,i)=>{if(v.status==='rejected')failures.push(['config','taxonomy','products','videos','guides'][i]);});config=results[0].status==='fulfilled'?results[0].value:{};taxonomy=results[1].status==='fulfilled'&&Array.isArray(results[1].value)?results[1].value:[];for(let j=2;j<5;j++){if(results[j].status!=='fulfilled')continue;const rows=results[j].value;if(!Array.isArray(rows))throw new Error('Dữ liệu phải là danh sách.');rows.forEach(item=>{const c=category(item.category);if(!c||!c.subcategories.some(s=>s.slug===item.subcategory))console.warn('HayMint: danh mục không hợp lệ',item.id||item.slug);if(item.status==='published')all.push({...item,kind:['product','video','guide'][j-2]});});}all.sort((a,b)=>String(b.publishedAt||b.updatedAt||'').localeCompare(String(a.publishedAt||a.updatedAt||'')));setupSocial();seo();if(page==='home')home();if(['category','reels','guides'].includes(page))listing();if(page==='guide')guide();if(failures.length){const n=$('#load-error');n.hidden=false;n.textContent='Chưa tải được một phần nội dung. Bạn thử tải lại trang sau nhé.';}$('#site-search').addEventListener('input',e=>{const q=normalized(e.target.value.trim());$('#search-results').hidden=!q;$('#page-content').hidden=!!q;if(!q)return;const items=all.filter(i=>normalized([i.name||i.title,...(i.tags||[])].join(' ')).includes(q));grid('#search-grid',items);$('#search-count').textContent=items.length?items.length+' nội dung phù hợp':'Chưa có nội dung phù hợp. Bạn thử từ khóa khác nhé.';note($('#search-results'),items);});document.body.dataset.ready='true';}catch(error){const n=$('#load-error');n.hidden=false;n.textContent='Chưa tải được nội dung. Bạn thử tải lại trang sau nhé.';document.body.dataset.ready='error';}}
start();
})();
