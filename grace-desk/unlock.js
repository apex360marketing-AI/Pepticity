'use strict';
(async function unlock(){
 const invite=new URLSearchParams(location.hash.slice(1)).get('invite');
 if(!invite||!/^[A-Za-z0-9_-]{43}$/.test(invite)){document.getElementById('notice').textContent='Open the complete invitation link to view the collection.';return;}
 try{
  const bytes=Uint8Array.from(atob(invite.replace(/-/g,'+').replace(/_/g,'/')+'='),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['decrypt']);
  async function decrypt(file){
   const response=await fetch(file);if(!response.ok)throw Error('Unavailable');
   const bytes=new Uint8Array(await response.arrayBuffer());
   return crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12));
  }
  const pack=JSON.parse(new TextDecoder().decode(await decrypt('catalog.bin')));
  const page=new DOMParser().parseFromString(pack.html,'text/html');
  document.title=page.title;document.body.replaceChildren(...page.body.childNodes);
  for(const code of pack.styles){const tag=document.createElement('style');tag.textContent=code;document.head.append(tag);}
  const cache=new Map(), requests=new WeakMap();
  async function show(el){
   const file=requests.get(el);if(!file||!pack.files[file])return;
   if(!cache.has(file))cache.set(file,decrypt('assets/'+pack.files[file]).then(data=>URL.createObjectURL(new Blob([data],{type:file.endsWith('.svg')?'image/svg+xml':'image/webp'}))).catch(error=>{cache.delete(file);throw error}));
   try{const url=await cache.get(file);if(requests.get(el)===file)el.src=url;}
   catch{el.alt='Image unavailable. Open it again to retry.';}
  }
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);show(e.target);}}, {rootMargin:'300px'});
  window.setPickerImage=(el,file,lazy=false)=>{requests.set(el,file);if(lazy)observer.observe(el);else show(el);};
  window.privatePickerCatalog=pack.catalog;
  for(const im of document.querySelectorAll('img[data-hero]'))window.setPickerImage(im,im.dataset.hero);
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link){event.preventDefault();document.getElementById(link.getAttribute('href').slice(1))?.scrollIntoView();}});
  for(const code of pack.scripts){const tag=document.createElement('script');tag.textContent=code;document.body.append(tag);}
 }catch{const n=document.getElementById('notice');if(n)n.textContent='This invitation could not be opened. Refresh, or ask for the full link again.';}
})();
