const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => `${Number(n).toLocaleString('fr-FR')} DT`;
const starterProducts = [
 {id:'p1',name:'Adidas Samba OG',brand:'Adidas',price:140,colors:'White / Black',sizes:'36, 37, 38, 39, 40, 41, 42, 43, 44',stock:5,description:'Un classique streetwear facile à porter au quotidien.',image:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85'},
 {id:'p2',name:'Adidas Campus 00s',brand:'Adidas',price:140,colors:'Black / White',sizes:'36, 37, 38, 39, 40, 41, 42, 43',stock:4,description:'Une silhouette inspirée du skate et du streetwear.',image:'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85'},
 {id:'p3',name:'Nike Dunk Low',brand:'Nike',price:150,colors:'White / Grey',sizes:'36, 37, 38, 39, 40, 41, 42, 43',stock:3,description:'Un modèle iconique pour compléter ton look.',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85'},
 {id:'p4',name:'Adidas Gazelle',brand:'Adidas',price:135,colors:'Navy / White',sizes:'36, 37, 38, 39, 40, 41, 42',stock:2,description:'Style rétro, détails simples et look intemporel.',image:'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=85'}
];
let products = JSON.parse(localStorage.getItem('nc-products') || 'null') || starterProducts;
let cart = JSON.parse(localStorage.getItem('nc-cart') || '[]');
let orders = JSON.parse(localStorage.getItem('nc-orders') || '[]');
let currentFilter = 'all';
const save = () => {localStorage.setItem('nc-products',JSON.stringify(products));localStorage.setItem('nc-cart',JSON.stringify(cart));localStorage.setItem('nc-orders',JSON.stringify(orders));};
const safe = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderProducts(){
 const term=$('#search').value.trim().toLowerCase();
 const list=products.filter(p=>(currentFilter==='all'||p.brand===currentFilter)&&(`${p.name} ${p.brand}`.toLowerCase().includes(term)));
 $('#product-grid').innerHTML=list.length?list.map(p=>`<article class="product-card" data-detail="${safe(p.id)}"><div class="product-image"><img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy"><span class="product-tag">${safe(p.brand)}</span><span class="quick-view">VOIR LES DÉTAILS ↗</span></div><div class="product-info"><div><h3>${safe(p.name)}</h3><p>${safe(p.colors||'Couleurs à confirmer')}</p></div><span class="product-price">${money(p.price)}</span></div></article>`).join(''):'<div class="empty-state">Aucun produit trouvé pour cette recherche.</div>';
 $$('#product-grid [data-detail]').forEach(el=>el.addEventListener('click',()=>showProduct(el.dataset.detail)));
}
function updateCart(){
 $('#cart-count').textContent=cart.reduce((n,x)=>n+x.qty,0);$('#drawer-count').textContent='('+cart.reduce((n,x)=>n+x.qty,0)+')';
 $('#cart-total').textContent=money(cart.reduce((n,x)=>n+x.price*x.qty,0));$('#checkout-total').textContent=$('#cart-total').textContent;
 $('#cart-items').innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><img src="${safe(x.image)}" alt=""><div><h4>${safe(x.name)}</h4><p>Pointure : ${safe(x.size)} · ${money(x.price)}</p><div class="qty-controls"><button data-qty="${x.key}" data-delta="-1">−</button><span>${x.qty}</span><button data-qty="${x.key}" data-delta="1">+</button></div></div><button class="remove-item" data-remove="${x.key}">Retirer</button></div>`).join(''):'<div class="empty-state">Ton panier est encore vide.</div>';
 $$('[data-qty]').forEach(b=>b.onclick=()=>{const item=cart.find(x=>x.key===b.dataset.qty);item.qty+=Number(b.dataset.delta);if(item.qty<1)cart=cart.filter(x=>x!==item);save();updateCart();});
 $$('[data-remove]').forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.key!==b.dataset.remove);save();updateCart();});
}
function showProduct(id){
 const p=products.find(x=>x.id===id);if(!p)return;
 const sizes=String(p.sizes||'').split(',').map(x=>x.trim()).filter(Boolean);
 $('#product-detail').innerHTML=`<div class="modal-heading"><div><p class="eyebrow">${safe(p.brand)}</p><h2>Détails du produit</h2></div><button class="close-button" data-close="product">×</button></div><div class="detail-layout"><img src="${safe(p.image)}" alt="${safe(p.name)}"><div><h2>${safe(p.name)}</h2><div class="detail-price">${money(p.price)}</div><p>${safe(p.description||'')}</p><p>Couleurs : ${safe(p.colors||'À confirmer')}</p><p>Stock : ${Number(p.stock)||0} paire(s)</p><label>Choisir une pointure<select id="detail-size">${sizes.map(s=>`<option value="${safe(s)}">${safe(s)}</option>`).join('')||'<option value="">À confirmer</option>'}</select></label><label>Quantité<input id="detail-qty" type="number" min="1" max="${Math.max(1,Number(p.stock)||1)}" value="1"></label><button class="primary-button full" id="detail-add" ${Number(p.stock)<=0?'disabled':''}>Ajouter au panier <span>+</span></button></div></div>`;
 openModal('product-modal');
 $('#detail-add').onclick=()=>{const size=$('#detail-size').value;if(!size){alert('Ajoute les pointures depuis ton espace admin.');return;}const qty=Math.max(1,Math.min(Number($('#detail-qty').value)||1,Number(p.stock)||1));const key=p.id+'-'+size;const found=cart.find(x=>x.key===key);if(found)found.qty=Math.min(found.qty+qty,Number(p.stock)||qty);else cart.push({key,id:p.id,name:p.name,price:Number(p.price),image:p.image,size,qty});save();updateCart();closeModal('product-modal');openCart();};
}
function openModal(id){$('#'+id).classList.add('show')}function closeModal(id){$('#'+id).classList.remove('show')}
function openCart(){$('#cart-overlay').classList.add('show');$('#cart-drawer').classList.add('open')}function closeCart(){$('#cart-overlay').classList.remove('show');$('#cart-drawer').classList.remove('open')}
$('#cart-open').onclick=openCart;$('#cart-overlay').onclick=closeCart;$$('[data-close="cart"]').forEach(b=>b.onclick=closeCart);
$('#checkout-open').onclick=()=>{if(!cart.length){alert('Ton panier est vide.');return;}closeCart();openModal('checkout-modal')};
$$('[data-close="checkout"]').forEach(b=>b.onclick=()=>closeModal('checkout-modal'));$$('[data-close="product"]').forEach(b=>b.onclick=()=>closeModal('product-modal'));
$$('[data-close="product-form"]').forEach(b=>b.onclick=()=>closeModal('product-form-modal'));
$$('.modal-wrap').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));
$('#checkout-form').onsubmit=e=>{e.preventDefault();if(!cart.length)return;const f=new FormData(e.target);const order={id:'NC-'+Date.now().toString().slice(-7),date:new Date().toLocaleString('fr-FR'),customer:f.get('customer'),phone:f.get('phone'),city:f.get('city'),address:f.get('address'),note:f.get('note'),items:cart.map(x=>({...x})),total:cart.reduce((n,x)=>n+x.price*x.qty,0),status:'À confirmer'};orders.unshift(order);save();cart=[];updateCart();e.target.reset();closeModal('checkout-modal');alert('Commande enregistrée dans cette démo. Le vrai envoi sera activé après connexion au backend.');renderAdmin();};
$('#search').addEventListener('input',renderProducts);
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentFilter=b.dataset.filter;renderProducts();});
$('#menu-toggle').onclick=()=>$('.main-nav').classList.toggle('show');
function showAdmin(){closeCart();$('#admin-screen').classList.add('show');window.scrollTo(0,0);renderAdmin()}function hideAdmin(){$('#admin-screen').classList.remove('show');window.scrollTo(0,0)}
$('#admin-open').onclick=showAdmin;$('#admin-close').onclick=hideAdmin;
$$('.admin-tab').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));$$('[data-goto]').forEach(b=>b.onclick=()=>switchTab(b.dataset.goto));
function switchTab(tab){$$('.admin-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$$('.admin-panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+tab));renderAdmin();}
function renderAdmin(){
 $('#stat-products').textContent=products.length;$('#stat-orders').textContent=orders.length;$('#stat-revenue').textContent=money(orders.reduce((n,o)=>n+o.total,0));
 $('#admin-products').innerHTML=products.length?`<table class="admin-table"><thead><tr><th>Produit</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead><tbody>${products.map(p=>`<tr><td><div class="table-product"><img src="${safe(p.image)}" alt=""><span>${safe(p.name)}</span></div></td><td>${money(p.price)}</td><td>${Number(p.stock)||0}</td><td><div class="table-actions"><button data-edit="${p.id}">Modifier</button><button class="delete" data-delete="${p.id}">Supprimer</button></div></td></tr>`).join('')}</tbody></table>`:'<p class="fine-print">Aucun produit pour le moment. Ajoute ton premier modèle.</p>';
 const orderMarkup=orders.length?`<table class="admin-table"><thead><tr><th>Commande</th><th>Client</th><th>Ville</th><th>Total</th><th>Statut</th></tr></thead><tbody>${orders.map(o=>`<tr><td>${safe(o.id)}<br><small>${safe(o.date)}</small></td><td>${safe(o.customer)}<br><small>${safe(o.phone)}</small></td><td>${safe(o.city)}</td><td>${money(o.total)}</td><td><span class="status-pill">${safe(o.status)}</span></td></tr>`).join('')}</tbody></table>`:'<p class="fine-print">Aucune commande enregistrée.</p>';
 $('#admin-orders').innerHTML=orderMarkup;$('#recent-orders').innerHTML=orders.length?orderMarkup:'<p class="fine-print">Tes commandes apparaîtront ici.</p>';
 $$('[data-edit]').forEach(b=>b.onclick=()=>editProduct(b.dataset.edit));$$('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('Supprimer ce produit ?')){products=products.filter(p=>p.id!==b.dataset.delete);save();renderProducts();renderAdmin();}});
}
function editProduct(id){const p=products.find(x=>x.id===id);if(!p)return;const f=$('#product-form');f.reset();f.elements.id.value=p.id;f.elements.name.value=p.name;f.elements.brand.value=p.brand;f.elements.price.value=p.price;f.elements.colors.value=p.colors||'';f.elements.sizes.value=p.sizes||'';f.elements.stock.value=p.stock||0;f.elements.description.value=p.description||'';f.elements.imageUrl.value=p.image||'';$('#product-form-title').textContent='Modifier le produit';openModal('product-form-modal');}
$('#add-product').onclick=()=>{$('#product-form').reset();$('#product-form').elements.id.value='';$('#product-form-title').textContent='Ajouter un produit';openModal('product-form-modal')};
$('#product-form').onsubmit=async e=>{e.preventDefault();const f=e.target;const old=products.find(p=>p.id===f.elements.id.value);let image=f.elements.imageUrl.value.trim()||old?.image||'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85';const file=f.elements.image.files[0];if(file){if(file.size>900000){alert('Choisis une image de moins de 900 Ko pour cette version de démonstration.');return;}image=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
const p={id:old?.id||'p'+Date.now(),name:f.elements.name.value.trim(),brand:f.elements.brand.value,price:Number(f.elements.price.value),colors:f.elements.colors.value.trim(),sizes:f.elements.sizes.value.trim(),stock:Number(f.elements.stock.value)||0,description:f.elements.description.value.trim(),image};
if(old)products=products.map(x=>x.id===old.id?p:x);else products.unshift(p);save();closeModal('product-form-modal');renderProducts();renderAdmin();};
$('#year').textContent=new Date().getFullYear();
renderProducts();updateCart();renderAdmin();