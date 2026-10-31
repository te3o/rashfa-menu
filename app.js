const PRODUCTS = [
{id:'latte',name:'لاتيه رَشفة',en:'SIGNATURE LATTE',cat:'hot',price:1800,desc:'إسبريسو غني وحليب مخملي، بتوازن يليق بمزاجك.',badge:'اختيار رَشفة'},
{id:'espresso',name:'إسبريسو',en:'DOUBLE ESPRESSO',cat:'hot',price:1200,desc:'جرعة مزدوجة مركّزة، بقوام غني ونهاية عطرية.',badge:''},
{id:'iced',name:'آيس لاتيه',en:'ICED LATTE',cat:'cold',price:2000,desc:'قهوتك المفضلة مع الحليب البارد ومكعبات الثلج.',badge:'الأكثر انتعاشًا'},
{id:'matcha',name:'ماتشا لاتيه',en:'MATCHA LATTE',cat:'hot',price:2400,desc:'ماتشا ناعمة مع الحليب الساخن، لمذاق مختلف.',badge:''},
{id:'croissant',name:'كرواسون الزبدة',en:'BUTTER CROISSANT',cat:'sweet',price:1500,desc:'طبقات ذهبية هشّة، برائحة زبدة دافئة.',badge:'رفيق القهوة'},
{id:'cake',name:'قطعة كيك الشوكولاتة',en:'CHOCOLATE CAKE',cat:'sweet',price:2200,desc:'قطعة غنية بالشوكولاتة. الصورة للكيكة كاملة، والسعر للقطعة.',badge:''}
];
const $=id=>document.getElementById(id);
const money=n=>(n/1000).toFixed(3)+' ر.ع.';
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let cart=read('rashfa-cart',{});
if(!cart||typeof cart!=='object'||Array.isArray(cart))cart={};
for(const id of Object.keys(cart))if(!PRODUCTS.some(p=>p.id===id)||!Number.isInteger(cart[id])||cart[id]<1||cart[id]>99)delete cart[id];
const settings=window.RASHFA_CONFIG||{};
let category='all',qrBlob=null,toastTimer;
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2200)}
function renderProducts(){let items=PRODUCTS.filter(p=>(category==='all'||p.cat===category)&&p.name.includes($('search').value.trim()));$('products').innerHTML=items.map(p=>`<article class="card"><div class="photo"><img src="${p.id}.jpg" alt="${p.name} — صورة توضيحية" loading="lazy">${p.badge?`<span class="badge">${p.badge}</span>`:''}</div><div class="card-body"><h3>${p.name}</h3><span class="english" lang="en" dir="ltr">${p.en}</span><p class="desc">${p.desc}</p><div class="card-bottom"><strong class="price">${(p.price/1000).toFixed(3)} <small>ر.ع.</small></strong><button class="add" data-add="${p.id}" aria-label="إضافة ${p.name}">إضافة +</button></div></div></article>`).join('');$('emptySearch').hidden=items.length>0}
function total(){return PRODUCTS.reduce((n,p)=>n+p.price*(cart[p.id]||0),0)}
function renderCart(){const count=Object.values(cart).reduce((a,b)=>a+b,0);$('count').textContent=count;$('mobileTotal').textContent=money(total());$('total').textContent=money(total());$('checkout').disabled=!count;$('cartRows').innerHTML=count?PRODUCTS.filter(p=>cart[p.id]).map(p=>`<div class="cart-row"><img src="${p.id}.jpg" alt=""><div class="cart-info">${p.name}<small>${money(p.price*cart[p.id])}</small></div><div class="qty"><button data-change="${p.id}" data-delta="1" aria-label="زيادة ${p.name}" ${cart[p.id]>=99?'disabled':''}>+</button><span>${cart[p.id]}</span><button data-change="${p.id}" data-delta="-1" aria-label="تقليل ${p.name}">−</button></div></div>`).join(''):'<p>حقيبتك تنتظر أول اختيار جميل. أضف منتجًا من المنيو.</p>';$('checkoutHint').textContent=settings.whatsapp?'سيُفتح واتساب لمراجعة الرسالة وإرسالها بنفسك.':'الطلب عبر واتساب غير متاح حاليًا.';save('rashfa-cart',cart)}
function change(id,delta){cart[id]=Math.min(99,(cart[id]||0)+delta);if(cart[id]<=0)delete cart[id];renderCart()}
document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{category=b.dataset.cat;document.querySelectorAll('[data-cat]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});renderProducts()});
$('search').oninput=renderProducts;
$('products').onclick=e=>{let b=e.target.closest('[data-add]');if(b){change(b.dataset.add,1);toast('أُضيف إلى حقيبتك')}};
$('cartRows').onclick=e=>{let b=e.target.closest('[data-change]');if(b)change(b.dataset.change,Number(b.dataset.delta))};
function showCart(){renderCart();$('cartDialog').showModal()}
$('cartBtn').onclick=showCart;$('mobileCart').onclick=showCart;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
function validPhone(s){return /^[1-9]\d{7,14}$/.test(s)}
function orderText(){return ['طلب تجريبي من رَشفة',...PRODUCTS.filter(p=>cart[p.id]).map(p=>`${p.name} × ${cart[p.id]} — ${money(p.price*cart[p.id])}`),'الإجمالي: '+money(total()),$('notes').value.trim()?'ملاحظات: '+$('notes').value.trim():'','نموذج تجريبي، يرجى تأكيد الطلب.'].filter(Boolean).join('\n')}
$('checkout').onclick=()=>{if(!total())return;if(!validPhone(settings.whatsapp||'')){$('checkoutHint').textContent='الطلب عبر واتساب غير متاح حاليًا.';return}window.open('https://wa.me/'+settings.whatsapp+'?text='+encodeURIComponent(orderText()),'_blank','noopener,noreferrer')};
function makeQr(){if(qrBlob)URL.revokeObjectURL(qrBlob);$('qr').replaceChildren();$('downloadQr').hidden=true;if(!settings.menuUrl){$('settingsStatus').textContent='رمز المنيو غير متاح حاليًا.';return;}try{const qr=qrcode(0,'M');qr.addData(settings.menuUrl);qr.make();let svg=qr.createSvgTag({cellSize:5,margin:4,scalable:true});$('qr').innerHTML=svg;qrBlob=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));$('downloadQr').href=qrBlob;$('downloadQr').hidden=false}catch{$('settingsStatus').textContent='تعذّر عرض الرمز حاليًا. حاول مجددًا.'}}
function openQr(){$('settingsStatus').textContent='';makeQr();$('settingsDialog').showModal()}
$('settingsBtn').onclick=openQr;$('qrBtn').onclick=openQr;
renderProducts();renderCart();

