// ponytail: one file, no framework, IndexedDB only. Sync layer plugs into saveNote()/putNote() later.
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2,10);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=n=>`<span class="ms" aria-hidden="true">${n}</span>`;
const wm=s=>esc(s).replace(/Noted It/g,'<span class="wm">Noted It</span>'); // brand name is always the animated highlighter
const qb=(i,a,t)=>`<button class="qb" data-act="${a}" aria-label="New ${t.toLowerCase()}" title="New ${t.toLowerCase()}">${ic(i)}<span>${t}</span></button>`;
const ib=(icon,act,label,extra='')=>`<button class="ib" data-act="${act}" aria-label="${label}" title="${label}" ${extra}>${ic(icon)}</button>`;
const COLORS=['coral','peach','sand','mint','sage','fog','storm','dusk','blossom','clay','chalk'];
// Keys stay stable for stored notes; names and tones are Noted It's own.
const CNAMES={coral:'Rose',peach:'Apricot',sand:'Butter',mint:'Pistachio',sage:'Lagoon',fog:'Sky',storm:'Denim',dusk:'Lilac',blossom:'Peony',clay:'Oat',chalk:'Mist'};
const BGS=['dots','grid','lines','diag','circles','waves','sun','night'];
// Premium illustrated backgrounds. 320x160 scenes, anchored bottom-right.
const IL={
monsoon:['Monsoon','<g fill="#cfdbe6"><circle cx="120" cy="30" r="14"/><circle cx="140" cy="24" r="18"/><rect x="106" y="30" width="56" height="14" rx="7"/></g><g fill="#b3c6d9"><circle cx="228" cy="40" r="22"/><circle cx="258" cy="30" r="28"/><circle cx="288" cy="44" r="20"/><rect x="208" y="42" width="100" height="22" rx="11"/></g><g stroke="#7fa0c0" stroke-width="2.5" stroke-linecap="round"><path d="M226 76l-6 14M248 72l-6 14M270 78l-6 14M292 72l-6 14M236 100l-6 14M258 98l-6 14M280 102l-6 14M128 56l-5 11M148 54l-5 11"/></g><ellipse cx="206" cy="152" rx="118" ry="9" fill="#c7d8e6"/><g fill="none" stroke="#9fbad2" stroke-width="2"><ellipse cx="262" cy="150" rx="16" ry="3.5"/><ellipse cx="262" cy="150" rx="28" ry="6"/></g><path d="M112 140h58l-11 12h-36z" fill="#e8a93a"/><path d="M125 140l16-28 16 28z" fill="#f4cd6e"/>'],
chai:['Chai','<g stroke="#cdbba8" stroke-width="3" fill="none" stroke-linecap="round"><path d="M236 84c-8-10 8-16 0-28M252 80c-8-10 8-18 0-30M268 84c-8-10 8-16 0-28"/></g><ellipse cx="250" cy="150" rx="58" ry="9" fill="#a9cfdb"/><path d="M288 106c16 0 18 24 0 26" stroke="#4f93a6" stroke-width="7" fill="none"/><path d="M212 98h76v16c0 22-17 34-38 34s-38-12-38-34z" fill="#5c9ead"/><path d="M216 112c10 4 58 4 68 0" stroke="#4f93a6" stroke-width="3" fill="none"/><ellipse cx="250" cy="98" rx="38" ry="7" fill="#b07a4a"/><circle cx="150" cy="144" r="15" fill="#e3b86b"/><g fill="#c4924a"><circle cx="145" cy="139" r="1.8"/><circle cx="155" cy="141" r="1.8"/><circle cx="149" cy="149" r="1.8"/></g><ellipse cx="178" cy="150" rx="14" ry="6" fill="#d9a85a"/>'],
garden:['Garden','<path d="M102 160l6-18 6 18 6-26 6 26 6-16 6 16 6-22 6 22z" fill="#9fd08f"/><path d="M200 160c-20-18-24-46-10-64 16 16 18 44 10 64z" fill="#a8d69b"/><path d="M262 160c-44-8-66-52-44-94 32 12 54 54 44 94z" fill="#6fae73"/><path d="M262 160c-10-30-22-58-44-94" stroke="#4f8f5b" stroke-width="2.5" fill="none"/><path d="M294 160c12-42 2-84-30-106-12 42-2 84 30 106z" fill="#8cc48a"/><path d="M294 160c-4-38-14-72-30-106" stroke="#5d9d64" stroke-width="2.5" fill="none"/><path d="M168 160v-40" stroke="#6fae73" stroke-width="3"/><g fill="#f29bb0"><circle cx="168" cy="110" r="7"/><circle cx="178" cy="118" r="7"/><circle cx="174" cy="130" r="7"/><circle cx="162" cy="130" r="7"/><circle cx="158" cy="118" r="7"/></g><circle cx="168" cy="121" r="5" fill="#f6c94e"/>'],
starry:['Starry','<path d="M264 22a18 18 0 1 0 16 26 14 14 0 1 1-16-26z" fill="#f5d97a"/><g fill="#f5d97a"><circle cx="150" cy="30" r="1.8"/><circle cx="182" cy="56" r="1.5"/><circle cx="222" cy="24" r="2"/><circle cx="300" cy="72" r="1.6"/><circle cx="120" cy="62" r="1.4"/><path d="M204 70l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M300 16l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5z"/></g><path d="M0 160v-30c50-20 90-24 140-10s90 10 130-12c26-14 50-8 50-8v60z" fill="#4a5c95"/><path d="M110 160c46-32 120-42 210-20v20z" fill="#33427a"/><path d="M168 118h26v16h-26z" fill="#27335e"/><path d="M164 119l17-14 17 14z" fill="#27335e"/><rect x="176" y="122" width="8" height="7" fill="#f5d97a"/>'],
peaks:['Peaks','<circle cx="252" cy="48" r="20" fill="#f6c26b"/><path d="M150 50q5-5 10 0q5-5 10 0M180 36q4-4 8 0q4-4 8 0" stroke="#6b7f9f" stroke-width="2" fill="none"/><path d="M70 160l62-86 38 42 44-64 58 74 48-30v64z" fill="#aabdd7"/><path d="M200 54l14 18-8-2-6 6-6-6-8 2z" fill="#eef2f8"/><path d="M40 160l70-58 46 34 62-52 74 76z" fill="#7890b5"/><path d="M218 84l14 14-8-1-6 5-5-5-8 1z" fill="#dfe6f1"/>'],
ocean:['Ocean','<path d="M120 58q6-6 12 0q6-6 12 0" stroke="#4f7f99" stroke-width="2" fill="none"/><path d="M226 64v58h30z" fill="#fbfaf5"/><path d="M222 76v46h-22z" fill="#f2b24f"/><path d="M224 60v66" stroke="#3b6f8c" stroke-width="2.5"/><path d="M194 124h64l-11 13h-42z" fill="#3b6f8c"/><path d="M0 132q20-10 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0v28h-320z" fill="#9ed3e0"/><path d="M-20 144q20-10 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0v16h-340z" fill="#5fb0c8"/>'],
festive:['Festive','<path d="M0 18q80 40 160 12t160 18" stroke="#8a7a6a" stroke-width="2" fill="none"/><g><circle cx="30" cy="38" r="12" fill="#f6c14e" opacity=".25"/><ellipse cx="30" cy="38" rx="5" ry="7" fill="#f6c14e"/><circle cx="70" cy="46" r="12" fill="#f28fa6" opacity=".25"/><ellipse cx="70" cy="46" rx="5" ry="7" fill="#f28fa6"/><circle cx="110" cy="44" r="12" fill="#7cc3d6" opacity=".25"/><ellipse cx="110" cy="44" rx="5" ry="7" fill="#7cc3d6"/><circle cx="150" cy="38" r="12" fill="#9ed48a" opacity=".25"/><ellipse cx="150" cy="38" rx="5" ry="7" fill="#9ed48a"/><circle cx="190" cy="36" r="12" fill="#f6c14e" opacity=".25"/><ellipse cx="190" cy="36" rx="5" ry="7" fill="#f6c14e"/><circle cx="230" cy="40" r="12" fill="#f28fa6" opacity=".25"/><ellipse cx="230" cy="40" rx="5" ry="7" fill="#f28fa6"/><circle cx="270" cy="46" r="12" fill="#7cc3d6" opacity=".25"/><ellipse cx="270" cy="46" rx="5" ry="7" fill="#7cc3d6"/><circle cx="306" cy="50" r="12" fill="#9ed48a" opacity=".25"/><ellipse cx="306" cy="50" rx="5" ry="7" fill="#9ed48a"/></g><g><circle cx="236" cy="132" r="14" fill="#f6c14e" opacity=".22"/><path d="M236 142q-7-9 0-20q7 11 0 20z" fill="#f6b73c"/><path d="M214 144q22 18 44 0z" fill="#d8843a"/><circle cx="284" cy="132" r="14" fill="#f6c14e" opacity=".22"/><path d="M284 142q-7-9 0-20q7 11 0 20z" fill="#f6b73c"/><path d="M262 144q22 18 44 0z" fill="#c9733a"/></g>'],
voyage:['Voyage','<rect x="96" y="46" width="44" height="12" rx="6" fill="#dfe6f3"/><rect x="198" y="96" width="36" height="10" rx="5" fill="#dfe6f3"/><path d="M40 132C94 150 118 92 170 100s80-40 98-56" stroke="#9aa9c9" stroke-width="2.5" stroke-dasharray="6 6" fill="none"/><path d="M262 46l42-22-15 38-9-13z" fill="#6d86c9"/><path d="M280 49l24-25" stroke="#4f66a8" stroke-width="2"/><path d="M40 148s-15-17-15-28a15 15 0 0 1 30 0c0 11-15 28-15 28z" fill="#ef7f6b"/><circle cx="40" cy="120" r="5.5" fill="#fff"/>']};
const PREM=Object.keys(IL);
const isPrem=b=>!!IL[b]||b==='map',PNAME=b=>IL[b]?.[0]||'Places';
const bgc=b=>b?'bg-'+b+(isPrem(b)?' il':''):'';
// Places: a map-style drawing made on the device from the note's coordinates. No map tiles, no network.
function mapSVG(p){let s=(Math.round(p.lat*1e4)*73856093^Math.round(p.lng*1e4)*19349663)>>>0||1;const r=()=>(s=s*16807%2147483647)/2147483647;
 let st='';for(let x=-200;x<520;x+=26+r()*34)st+=`M${x|0} -200V400`;for(let y=-200;y<400;y+=24+r()*30)st+=`M-200 ${y|0}H520`;
 const wy=40+r()*100,h=`<rect width="320" height="160" fill="#eceee4"/><ellipse cx="${(30+r()*260)|0}" cy="${(30+r()*110)|0}" rx="${(30+r()*40)|0}" ry="${(18+r()*26)|0}" fill="#cfe5c0"/>`
 +`<path d="M-20 ${wy|0}C90 ${(wy+r()*80-40)|0} 210 ${(wy+r()*80-40)|0} 340 ${(wy+r()*60-30)|0}" stroke="#b6d6ea" stroke-width="${(12+r()*12)|0}" fill="none"/>`
 +`<g transform="rotate(${(r()*40-20)|0} 160 80)"><path d="${st}" stroke="#fff" stroke-width="5"/><path d="M-200 ${(50+r()*70)|0}H520M${(90+r()*140)|0} -200V400" stroke="#f5d88c" stroke-width="9"/></g>`
 +`<g transform="translate(222 58)"><ellipse cx="16" cy="46" rx="9" ry="3" fill="#000" opacity=".18"/><path d="M16 46s-16-17-16-29a16 16 0 0 1 32 0c0 12-16 29-16 29z" fill="#e5484d"/><circle cx="16" cy="17" r="6" fill="#fff"/></g>`;
 return`url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160"><defs><linearGradient id="f" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/></linearGradient><mask id="m"><rect width="320" height="160" fill="url(#f)"/></mask></defs><g mask="url(#m)">${h}</g></svg>`)}')`}
const pmVar=n=>n.bg==='map'&&n.place?`--pm:${mapSVG(n.place)};`:'';
function grabPlace(n,loud){if(!navigator.geolocation){if(loud)toast('Location is not available on this device.');return}
 navigator.geolocation.getCurrentPosition(p=>{n.place={lat:+p.coords.latitude.toFixed(5),lng:+p.coords.longitude.toFixed(5),name:n.place?.name||'',at:Date.now()};
  if(n===cur){renderEd();changed()}else if(byId(n.id)){saveNote(n);render()}if(loud)toast('Place added')},
  ()=>loud&&toast('Could not get your location. Allow location access for this site.'),{enableHighAccuracy:true,timeout:15000,maximumAge:60000})}
function placePop(btn,ids){const n=get(ids[0]);if(!n?.place)return;const{lat,lng,name}=n.place,q=encodeURIComponent(name||'Note');
 openPop(btn,ids,`<div class="plpop"><input id="plname" maxlength="80" placeholder="Name this place" value="${esc(name||'')}" aria-label="Place name"><p class="hint">${lat}, ${lng}</p>
 <a class="mi" href="https://maps.apple.com/?ll=${lat},${lng}&q=${q}" target="_blank" rel="noopener">Open in Apple Maps</a><a class="mi" href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener">Open in Google Maps</a>
 <button class="mi" data-act="plrm">Remove place</button></div>`)}
const APP_STORE_URL=''; // set when the iPhone app is live
// Premium styles. s = colour scheme the style runs in.
const SKINS={
ink:{n:'Ink',s:'light',font:'Newsreader',v:{bg:'#f4f3ef',surface:'#fbfbf8',field:'#eae8e1',ink:'#16181d',muted:'#5c5f66',line:'#dad7ce',hl:'#1f2a44','hl-ink':'#fff',accent:'#1f2a44'}},
midnight:{n:'Midnight',s:'dark',v:{bg:'#0f1426',surface:'#161c33',field:'#1d2440',ink:'#e6e9f5',muted:'#8f97b8',line:'#262e4f',hl:'#f2c94c','hl-ink':'#1a1400',accent:'#f2c94c','on-accent':'#1a1400'}},
matcha:{n:'Matcha',s:'light',font:'Manrope',v:{bg:'#f2f6ef',surface:'#fff',field:'#e3ecdd',ink:'#1e2a1f',muted:'#5d6b5e',line:'#d3dfcc',hl:'#9cc98a','hl-ink':'#13240f',accent:'#3f7a35'}},
terminal:{n:'Terminal',s:'dark',font:'JetBrains Mono',v:{bg:'#0c0f0c',surface:'#121712',field:'#182018',ink:'#cfe8cf',muted:'#7f9a7f',line:'#223022',hl:'#39d353','hl-ink':'#031a06',accent:'#39d353','on-accent':'#031a06'}},
blush:{n:'Blush',s:'light',font:'Lora',v:{bg:'#fbf3f4',surface:'#fff',field:'#f3e4e7',ink:'#2a1d20',muted:'#7a6166',line:'#eed8dc',hl:'#e89aab','hl-ink':'#3a0f19',accent:'#b23a5a'}}};
{const svg=b=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">${b}</svg>`)}")`,st=document.createElement('style');
 st.textContent='.bg-map::after{background-image:var(--pm)}'+PREM.map(k=>`.bg-${k}::after{background-image:${svg(IL[k][1])}}`).join('')+Object.entries(SKINS).map(([k,x])=>`:root[data-skin=${k}]{${Object.entries(x.v).map(([a,b])=>`--${a}:${b}`).join(';')}${x.font?`;--font:"${x.font}"`:''}}`).join('');
 document.head.append(st)}
const pro=()=>!!meta.settings.pro;
const skinTiles=()=>[['',{n:'Classic',v:{bg:'var(--surface)',ink:'var(--ink)',hl:'var(--accent)'}}],...Object.entries(SKINS)].map(([k,x])=>`<button class="sk ${(S().skin||'')===k&&(pro()||!k)?'on':''}" data-act="setskin" data-v="${k}" style="background:${x.v.bg};color:${x.v.ink};font-family:${x.font?`'${x.font}',`:''}Figtree,sans-serif"><i style="background:${x.v.hl}"></i><b>Aa</b><span>${x.n}</span>${k&&!pro()?ic('lock'):''}</button>`).join('');
function paintPro(){const p=pro();$('#supChip').hidden=!p;$('#packBtn').textContent=p?'Supporter Pack':'See the Supporter Pack';$('#pkBuy').hidden=p;$('#pkState').innerHTML=p?wm('Unlocked. Thank you for supporting Noted It.'):'';
 $('#setSk').innerHTML=$('#pkSk').innerHTML=skinTiles();$('[data-set=theme]').disabled=!!(p&&SKINS[S().skin])}
// Pack tiles are buttons: after unlock they set the background on the note that opened the pack, or start a new note with it.
let packFor=[];
function pkTiles(){const n=get(packFor[0]),lk=pro()?'':ic('lock');$('#pkIl').innerHTML=PREM.map(k=>`<button class="pk-t il bg-${k}" data-act="pkbg" data-v="${k}" aria-pressed="${n?.bg===k}"><span class="pk-n">${IL[k][0]}</span>${lk}</button>`).join('')+`<button class="pk-t il bg-map" data-act="pkbg" data-v="map" aria-pressed="${n?.bg==='map'}" style="--pm:${mapSVG(n?.place||{lat:22.3072,lng:73.1812})}"><span class="pk-n">Places</span><small class="pk-n">A map of where you wrote the note</small>${lk}</button>`}
function openPack(ids=[]){packFor=ids.filter(get);pkTiles();paintPro();if(!$('#pack').open)$('#pack').showModal()}
function pkBg(v){if(!pro())return toast('Unlock the Supporter Pack to use this background.');
 const ns=packFor.map(get).filter(Boolean);
 if(v==='map'&&!ns.some(n=>n.place))return toast('Places needs a note with a place. Add one from the note menu.');
 $('#pack').close();if($('#settings').open)$('#settings').close();
 if(ns.length){mut(ns.filter(n=>v!=='map'||n.place).map(n=>n.id),n=>n.bg=v);toast('Background set');return}
 const n=newNote();n.bg=v;openEd(n)}
function showOb(step){$$('#ob [data-step]').forEach(x=>x.hidden=x.dataset.step!==step);$$('#ob [data-act=obtheme]').forEach(b=>b.classList.toggle('on',b.dataset.v===S().theme));if(!$('#ob').open)$('#ob').showModal()}
const OK_TAGS=new Set(['B','I','U','STRONG','EM','H1','H2','BR','DIV','P','SPAN']);
// Whole-string match: a data URL that only starts right could still carry markup (import XSS).
const isDataImg=s=>typeof s==='string'&&/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(s);
const isDataAud=s=>typeof s==='string'&&/^data:audio\/[\w.+-]+(;[\w.=-]+)*;base64,[A-Za-z0-9+/]+={0,2}$/.test(s);
const isImg=s=>isDataImg(s)||/^f:[\w-]+$/.test(s);
const safeId=s=>/^[\w-]{1,64}$/.test(String(s))?String(s):uid();

// ---------- storage (sync-ready: uuid ids, updatedAt, deleted tombstones) ----------
let dbp;
const idb=()=>dbp??=new Promise((res,rej)=>{const o=indexedDB.open('noted-it',2);o.onupgradeneeded=()=>{const d=o.result;for(const[k,x]of[['notes',{keyPath:'id'}],['kv'],['files']])if(!d.objectStoreNames.contains(k))d.createObjectStore(k,x)};o.onsuccess=()=>res(o.result);o.onerror=()=>rej(o.error)});
async function idbDo(store,fn){try{const d=await idb();return await new Promise((res,rej)=>{const t=d.transaction(store,'readwrite'),r=fn(t.objectStore(store));t.oncomplete=()=>res(r?.result);t.onerror=()=>rej(t.error)})}catch(e){console.error(e);toast('Could not save. Storage is blocked in this browser.')}}
const putNote=async n=>{const o=await stored(n);await idbDo('notes',s=>s.put(o));if(o!==n)dropPlainFiles(n)};
// A locked note keeps its media inside the sealed data only, so its plaintext blobs leave the files store (memory copies stay for display).
const refsOf=n=>[...n.images,...n.drawings,...n.audio.map(a=>a.src)].filter(x=>x?.startsWith?.('f:')).map(x=>x.slice(2));
function dropPlainFiles(n){const keep=new Set(notes.filter(x=>!x.locked).flatMap(refsOf)),ids=refsOf(n).filter(k=>!keep.has(k));if(ids.length)idbDo('files',s=>{ids.forEach(k=>s.delete(k))})}
// ---------- files: images, drawings and voice live as Blobs; notes keep "f:<id>" refs ----------
const FURL=new Map(),FBLOB=new Map();
const fsrc=s=>typeof s==='string'&&s.startsWith('f:')?FURL.get(s.slice(2))||'':s;
const d2b=u=>{const[h,b]=u.split(','),bin=atob(b),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:h.slice(5,h.indexOf(';'))})};
const b2d=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
const addF=(id,b)=>{FBLOB.set(id,b);FURL.set(id,URL.createObjectURL(b))};
async function toRef(b){if(typeof b==='string')b=d2b(b);const id=uid();await idbDo('files',s=>s.put(b,id));addF(id,b);return'f:'+id}
async function toData(s){if(!s?.startsWith?.('f:'))return s;const b=FBLOB.get(s.slice(2));return b?b2d(b):''}
async function migrate(n){if(n.locked)return;let ch=false;const cv=async s=>isDataImg(s)||isDataAud(s)?(ch=true,await toRef(s)):s;
 n.images=await Promise.all(n.images.map(cv));n.drawings=await Promise.all(n.drawings.map(cv));for(const a of n.audio)a.src=await cv(a.src);if(ch)await putNote(n)}
async function loadFiles(){const ks=await idbDo('files',s=>s.getAllKeys())||[],vs=await idbDo('files',s=>s.getAll())||[];
 const used=new Set(notes.filter(n=>!n.locked).flatMap(n=>[...n.images,...n.drawings,...n.audio.map(a=>a.src)]).filter(x=>x?.startsWith?.('f:')).map(x=>x.slice(2)));
 const dead=ks.filter(k=>!used.has(k));ks.forEach((k,i)=>used.has(k)&&addF(k,vs[i]));
 if(dead.length)idbDo('files',s=>{dead.forEach(k=>s.delete(k))}); // ponytail: orphan sweep at start only; add per-delete cleanup if storage grows between restarts
 for(const n of notes)await migrate(n)}
// ---------- lock: one PIN. Locked notes are AES-GCM encrypted on disk. App lock only covers the screen. ----------
let LK=null,hiddenAt=0;
const b64=a=>{const u=new Uint8Array(a);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode(...u.subarray(i,i+32768));return btoa(s)},unb64=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
const pinKey=async(pin,salt)=>crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveKey']),{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
async function enc(key,bytes){const iv=crypto.getRandomValues(new Uint8Array(12));return{iv:b64(iv),ct:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes))}}
const dec=(key,o)=>crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(o.iv)},key,unb64(o.ct));
async function wrapMK(pin,raw){const salt=crypto.getRandomValues(new Uint8Array(16));meta.lock={app:false,...meta.lock,salt:b64(salt),mk:await enc(await pinKey(pin,salt),raw)};await saveMeta()}
const unwrapMK=async pin=>new Uint8Array(await dec(await pinKey(pin,unb64(meta.lock.salt)),meta.lock.mk)); // throws on a wrong PIN
const useMK=async raw=>{LK=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt'])};
async function setPin(pin){const raw=crypto.getRandomValues(new Uint8Array(32));meta.lock=null;await wrapMK(pin,raw);await useMK(raw)}
async function unlock(pin){await useMK(await unwrapMK(pin));for(const n of notes)if(n.locked&&!n._open)await openSealed(n);render()}
async function openSealed(n){try{const x=JSON.parse(new TextDecoder().decode(await dec(LK,n.sealed)));
  Object.assign(n,{title:String(x.title||''),body:clean(x.body),items:(Array.isArray(x.items)?x.items:[]).map(i=>({id:safeId(i?.id),text:String(i?.text||''),done:!!i?.done,indent:i?.indent?1:0})),place:x.place&&isFinite(+x.place.lat)&&isFinite(+x.place.lng)?{lat:+x.place.lat,lng:+x.place.lng,name:String(x.place.name||'').slice(0,80),at:+x.place.at||0}:null,images:(x.images||[]).filter(isDataImg),drawings:(x.drawings||[]).filter(isDataImg),audio:(x.audio||[]).filter(a=>isDataAud(a?.src))});n._open=true;delete n._bad}catch{n._bad=true}}
async function stored(n){if(!n.locked||!n._open)return n;
 const k=LK,t=n.title,b=n.body,it=n.items,im=n.images,dr=n.drawings,au=n.audio,pc=n.place||null;
 const pl={title:t,body:b,items:it,place:pc,images:await Promise.all(im.map(toData)),drawings:await Promise.all(dr.map(toData)),audio:await Promise.all(au.map(async a=>({...a,src:await toData(a.src)})))};
 n.sealed=await enc(k,new TextEncoder().encode(JSON.stringify(pl)));
 const o={...n,title:'',body:'',items:[],images:[],drawings:[],audio:[],versions:[],place:null};delete o._open;return o}
async function lockNow(){if(!meta.lock)return;if($('#ed').open)await new Promise(r=>{$('#ed').addEventListener('close',()=>setTimeout(r),{once:true});$('#ed').close()});LK=null;
 notes.forEach(n=>{if(n._open){Object.assign(n,{title:'',body:'',items:[],images:[],drawings:[],audio:[],place:null});delete n._open}});render();if(meta.lock.app)showLock()}
async function ensureKey(){if(LK)return true;
 return meta.lock?askPin('Enter your PIN','Your PIN opens locked notes.',false,unlock,true):askPin('Set a PIN','Use 6 or more characters. A short phrase is safest. Locked notes are encrypted with it. If you forget the PIN, locked notes cannot be opened.',true,setPin)}
async function lockToggle(n){if(!await ensureKey())return;
 if(n.locked&&!n._open)return toast(n._bad?'This note uses a different PIN. It stays locked.':'Open the note first.');
 if(n.locked){n.locked=false;delete n.sealed;delete n._open;toast('Lock removed')}else{n.locked=true;n._open=true;n.versions=[];toast('Note locked. Its version history was cleared.')}
 if(n===cur&&!byId(n.id))return;saveNote(n);render()}
function askPin(title,hint,two,fn,forgot,must){return new Promise(res=>{const d=$('#pin');
 $('#pinH').innerHTML=wm(title);$('#pinP').textContent=hint;$('#pin2').hidden=!two;$('#pin1').value=$('#pin2').value='';$('#pinE').textContent='';$('#pinForgot').hidden=!forgot;$('#pinCancel').hidden=!!must;d.classList.toggle('full',!!must);
 d.oncancel=e=>{if(must)e.preventDefault()};
 $('#pinF').onsubmit=async e=>{e.preventDefault();const a=$('#pin1').value,b=$('#pin2').value;
  if(a.length<(two?6:4))return $('#pinE').textContent=two?'Use 6 or more characters.':'Use 4 or more characters.';if(two&&a!==b)return $('#pinE').textContent='The two PINs are not the same.';
  $('#pinOk').disabled=true;const err=await fn(a).then(()=>'',()=>'Wrong PIN. Try again.');$('#pinOk').disabled=false;
  if(err){$('#pinE').textContent=err;$('#pin1').select();return}d.close('ok')};
 d.onclose=()=>{if(must&&d.returnValue!=='ok'){d.showModal();return}d.classList.remove('full');res(d.returnValue==='ok')};d.returnValue='';if(!d.open)d.showModal();$('#pin1').focus()})}
// App lock hides the whole UI (not only covers it) until the PIN is right.
const showLock=()=>{document.body.classList.add('locked');return askPin('Noted It is locked','Enter your PIN to open your notes.',false,unlock,true,true).then(ok=>{document.body.classList.remove('locked');return ok})};
function paintLock(){const L=meta.lock;$('#lockHint').textContent=L?'Locked notes are encrypted on this device with your PIN. App lock covers the screen, but notes without a lock are not encrypted. If you forget the PIN, locked notes are lost.':'Set a PIN to lock single notes, or the whole app.';
 $('#appLock').checked=!!L?.app;$('#appLock').disabled=!L;$('#pinSetBtn').textContent=L?'Change PIN':'Set a PIN';$('#lockNowBtn').hidden=!L}
document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(LK&&Date.now()-hiddenAt>5*60e3)lockNow()});
const saveNote=n=>{n.updatedAt=Date.now();return putNote(n)};
const saveMeta=()=>idbDo('kv',s=>s.put(meta,'meta'));
// ponytail: labels have no tombstones yet; add updatedAt/deleted to labels when sync lands.

let notes=[],meta={labels:[],settings:{addBottom:true,checkedBottom:true,links:true,theme:'system',view:'grid'}};
let page='notes',pageLabel=null,prevPage=null,q='',filter=null,selected=new Set(),cur=null,curOrig='',hist=[],hi=0,saveT,histT,fmtOpen=false,rec=null;
let popTargets=[],popBtn=null,remIds=[],imgFor=null,dragId=null,dragIid=null,navOpen=innerWidth>1000,toastT;
const S=()=>meta.settings;
const byId=id=>notes.find(n=>n.id===id);
const get=id=>byId(id)??(cur&&cur.id===id?cur:null);
const label=id=>meta.labels.find(l=>l.id===id);
const mk=(o={})=>{const t=Date.now();return{id:uid(),title:'',body:'',isList:false,items:[],color:'',bg:'',pinned:false,archived:false,trashedAt:0,deleted:false,labels:[],reminder:null,images:[],drawings:[],audio:[],versions:[],order:t,createdAt:t,updatedAt:t,...o}};
const plain=h=>h?new DOMParser().parseFromString(String(h).replace(/<br\s*\/?>|<\/(div|p|h[12])>/gi,'\n$&'),'text/html').body.textContent:'';
function clean(h){const b=new DOMParser().parseFromString(String(h||''),'text/html').body;for(const el of [...b.querySelectorAll('*')]){if(!el.isConnected)continue;if(/^(SCRIPT|STYLE|TEMPLATE|IFRAME|OBJECT|SVG|MATH)$/i.test(el.tagName))el.remove();else if(!OK_TAGS.has(el.tagName))el.replaceWith(...el.childNodes);else for(const a of [...el.attributes])el.removeAttribute(a.name)}return b.innerHTML}
const isEmpty=n=>!(n.locked&&!n._open)&&!n.title.trim()&&!plain(n.body).trim()&&!n.items.some(i=>i.text.trim())&&!n.images.length&&!n.drawings.length&&!n.audio.length;
const snapKey=n=>JSON.stringify({t:n.title,b:n.body,i:n.items,l:n.isList});
const noteText=n=>[n.title,n.isList?n.items.map(i=>(i.done?'[x] ':'[ ] ')+i.text).join('\n'):plain(n.body)].filter(Boolean).join('\n\n');
const links=n=>[...new Set(((n.title+' '+plain(n.body)+' '+n.items.map(i=>i.text).join(' ')).match(/https?:\/\/[^\s<>"']+/gi)||[]).map(u=>u.replace(/[.,!?)\]]+$/,'')))];
function purge(n){delete n.sealed;delete n._open;Object.assign(n,{locked:false,deleted:true,title:'',body:'',items:[],images:[],drawings:[],audio:[],versions:[],reminder:null,labels:[]});saveNote(n)}
function commitCur(){if(!cur)return;if(!byId(cur.id)){if(isEmpty(cur))return;notes.push(cur)}saveNote(cur)}

// ---------- time ----------
const dayStart=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime();
function fmtWhen(ms){const d=new Date(ms),now=new Date(),t=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}),diff=Math.round((dayStart(d)-dayStart(now))/864e5);
 if(diff===0)return'Today, '+t;if(diff===1)return'Tomorrow, '+t;if(diff===-1)return'Yesterday, '+t;
 return d.toLocaleDateString([],{day:'numeric',month:'short',...(d.getFullYear()!==now.getFullYear()&&{year:'numeric'})})+', '+t}
function fmtEdited(ms){const d=new Date(ms),now=new Date();if(dayStart(d)===dayStart(now))return d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});return d.toLocaleDateString([],{day:'numeric',month:'short',...(d.getFullYear()!==now.getFullYear()&&{year:'numeric'})})}
const fmtFull=ms=>new Date(ms).toLocaleString([],{dateStyle:'medium',timeStyle:'short'});
const at=(addDays,h)=>{const d=new Date();d.setDate(d.getDate()+addDays);d.setHours(h,0,0,0);return+d};
const laterToday=()=>{const t=at(0,20);return t>Date.now()?t:at(1,8)};
const nextWeek=()=>{const d=new Date();return at((8-d.getDay())%7||7,8)};
const toLocal=ms=>new Date(ms-new Date(ms).getTimezoneOffset()*6e4).toISOString().slice(0,16);

// ---------- rendering ----------
const matchType=(n,v)=>({reminders:!!n.reminder,lists:n.isList,images:n.images.length>0,drawings:n.drawings.length>0,urls:links(n).length>0,audio:n.audio.length>0,places:!!n.place})[v];
const textOf=n=>(n.title+' '+plain(n.body)+' '+n.items.map(i=>i.text).join(' ')+' '+n.labels.map(id=>label(id)?.name||'').join(' ')+' '+(n.place?.name||'')).toLowerCase();
function match(n){if(q&&!textOf(n).includes(q.toLowerCase()))return false;if(!filter)return true;const{k,v}=filter;if(k==='color')return(n.color||'default')===v;if(k==='label')return n.labels.includes(v);return matchType(n,v)}
function visible(){
 let L=notes.filter(n=>!n.deleted);
 if(page==='search')L=L.filter(n=>!n.trashedAt&&match(n));
 else if(page==='notes')L=L.filter(n=>!n.archived&&!n.trashedAt);
 else if(page==='reminders')return L.filter(n=>n.reminder&&!n.trashedAt).sort((a,b)=>a.reminder.at-b.reminder.at);
 else if(page==='label')L=L.filter(n=>n.labels.includes(pageLabel)&&!n.trashedAt);
 else if(page==='archive')L=L.filter(n=>n.archived&&!n.trashedAt);
 else if(page==='trash')L=L.filter(n=>n.trashedAt);
 return L.sort((a,b)=>b.order-a.order);
}
const ro=new ResizeObserver(es=>{for(const e of es){const el=e.target;el.style.gridRowEnd='span '+Math.ceil((el.getBoundingClientRect().height+(el.classList.contains('sec')?0:16))/4)}});
const linkChip=u=>{try{const x=new URL(u);if(!/^https?:$/.test(x.protocol))return'';return`<a class="link" href="${esc(x.href)}" target="_blank" rel="noopener noreferrer">${ic('link')}<span><strong>${esc(x.hostname.replace(/^www\./,''))}</strong><small>${esc(x.href)}</small></span></a>`}catch{return''}};
function chips(n){let h='';
 if(n.place)h+=`<button class="chip" data-act="place" title="Place">${ic('location_on')}${esc(n.place.name||'Place')}</button>`;
 if(n.reminder)h+=`<button class="chip ${n.reminder.done?'past':''}" data-act="rem" title="Change reminder">${ic(n.reminder.repeat?'repeat':'notifications')}${esc(fmtWhen(n.reminder.at))}</button>`;
 h+=n.labels.map(label).filter(Boolean).map(l=>`<button class="chip" data-act="golabel" data-label="${l.id}">#${esc(l.name)}</button>`).join('');
 return h?`<div class="chips">${h}</div>`:''}
const itemPrev=i=>`<div class="it ${i.done?'done':''}" style="--ind:${i.indent||0}"><button class="cb" data-act="citem" data-item="${i.id}" aria-label="${i.done?'Uncheck':'Check'} item">${ic(i.done?'check_box':'check_box_outline_blank')}</button><span>${esc(i.text)}</span></div>`;
function listPrev(n){const bottom=S().checkedBottom,dn=n.items.filter(i=>i.done),seq=bottom?n.items.filter(i=>!i.done):n.items,show=seq.slice(0,10);
 let h=show.map(itemPrev).join('');if(seq.length>show.length)h+=`<p class="more">…</p>`;if(bottom&&dn.length)h+=`<p class="more">+ ${dn.length} checked item${dn.length>1?'s':''}</p>`;return`<div class="items">${h}</div>`}
function card(n){
 const t=!!n.trashedAt,media=[...n.images,...n.drawings].filter(isImg).slice(0,6);
 const body=!n.isList&&plain(n.body).trim()?`<div class="txt">${clean(n.body)}</div>`:'',items=n.isList&&n.items.length?listPrev(n):'';
 return`<article class="card ${bgc(n.bg)} ${selected.has(n.id)?'sel':''}" style="${n.color?`--nc:var(--${n.color});`:''}${pmVar(n)}" data-id="${n.id}" tabindex="0" draggable="${!t}" aria-label="${esc(n.title||'Note')}">
 ${media.length?`<div class="media">${media.map(s=>`<img src="${esc(fsrc(s))}" alt="" loading="lazy" draggable="false">`).join('')}</div>`:''}
 <div class="cin">${n.title?`<h3>${esc(n.title)}</h3>`:''}${body}${items}
 ${n.audio.length?`<div class="aud">${ic('mic')}Voice note</div>`:''}
 ${n.locked&&!n._open?`<p class="empty-note lk">${ic('lock')}${n._bad?'Locked with another PIN':'Locked note'}</p>`:!n.title&&!body&&!items&&!media.length&&!n.audio.length?'<p class="empty-note">Empty note</p>':''}
 ${S().links?links(n).slice(0,3).map(linkChip).join(''):''}${chips(n)}</div>
 ${t?'':`<button class="ib pinbtn ${n.pinned?'on':''}" data-act="pin" aria-label="${n.pinned?'Unpin':'Pin'} note" title="${n.pinned?'Unpin':'Pin'} note">${ic('push_pin')}</button>`}
 <div class="tools"><button class="selbtn" data-act="sel" aria-label="Select note" title="Select">${ic('check')}</button>${t?ib('restore_from_trash','restore','Restore')+ib('delete_forever','forever','Delete now'):ib('more_vert','more','More actions')}</div>
 </article>`}
function filtersHTML(){
 const live=notes.filter(n=>!n.deleted&&!n.trashedAt);
 const types=[['reminders','notifications','Reminders'],['lists','check_box','Lists'],['images','image','Images'],['drawings','brush','Drawings'],['urls','link','URLs'],['audio','mic','Audio'],['places','location_on','Places']].filter(([v])=>live.some(n=>matchType(n,v)));
 const labs=meta.labels.filter(l=>live.some(n=>n.labels.includes(l.id))),cols=['default',...COLORS].filter(c=>live.some(n=>(n.color||'default')===c));
 if(!live.length)return`<div class="empty">${ic('search')}<p>Nothing to search yet</p></div>`;
 const tile=(k,v,icon,t)=>`<button class="ftile" data-act="filter" data-k="${k}" data-v="${v}">${ic(icon)}${esc(t)}</button>`;
 return`<section class="filters">${types.length?`<h2 class="sec">Kinds</h2><div class="fgrid">${types.map(([v,i,t])=>tile('type',v,i,t)).join('')}</div>`:''}${labs.length?`<h2 class="sec">Tags</h2><div class="fgrid">${labs.map(l=>tile('label',l.id,'label',l.name)).join('')}</div>`:''}<h2 class="sec">Colours</h2><div class="swatches big">${cols.map(c=>`<button class="sw" data-act="filter" data-k="color" data-v="${c}" ${c!=='default'?`style="background:var(--${c})"`:''} aria-label="${c==='default'?'Default':CNAMES[c]}" title="${c==='default'?'Default':CNAMES[c]}"></button>`).join('')}</div></section>`}
function emptyHTML(){const m={notes:['ink_highlighter','Your first note is one tap away'],reminders:['notifications','Notes with a reminder show up here'],label:['label','No notes with this tag yet'],archive:['archive','Archived notes rest here'],trash:['delete','Nothing was deleted recently'],search:['search','No notes match']}[page];return`<div class="empty">${ic(m[0])}<p>${m[1]}</p></div>`}
function renderNav(){
 const it=(act,icon,text,on,extra='')=>`<button class="nv ${on?'on':''}" data-act="${act}" ${extra} title="${esc(text)}">${ic(icon)}<span class="t">${esc(text)}</span></button>`;
 $('#nav').innerHTML=it('go','ink_highlighter','Notes',page==='notes','data-page="notes"')+it('go','notifications','Reminders',page==='reminders','data-page="reminders"')
 +it('go','archive','Archive',page==='archive','data-page="archive"')+it('go','delete','Recently deleted',page==='trash','data-page="trash"')
 +'<p class="nh"><span class="t">Tags</span></p>'+meta.labels.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(l=>it('golabel','label_outline','#'+l.name,page==='label'&&pageLabel===l.id,`data-label="${l.id}"`)).join('')
 +it('editlabels','add','Manage tags',false);
 document.body.classList.toggle('nav-open',navOpen);$('[data-act=menu]').ariaExpanded=navOpen;$('#nav').inert=innerWidth<=700&&!navOpen}
function renderSel(){
 const b=$('#selbar');b.hidden=!selected.size;if(!selected.size)return;
 const ns=[...selected].map(get).filter(Boolean),allPin=ns.every(n=>n.pinned),allArch=ns.every(n=>n.archived);
 b.innerHTML=ib('close','selclear','Clear selection')+`<span class="count">${selected.size} selected</span><span class="grow"></span>`+(page==='trash'?ib('restore_from_trash','restore','Restore')+ib('delete_forever','forever','Delete forever'):ib('push_pin',allPin?'unpinsel':'pinsel',allPin?'Unpin':'Pin')+ib('add_alert','rem','Set reminder')+ib('palette','color','Colour and style')+ib(allArch?'unarchive':'archive','arch',allArch?'Unarchive':'Archive')+ib('more_vert','more','More'))}
function render(){
 document.body.classList.toggle('list-view',S().view==='list');document.body.classList.toggle('searching',page==='search');
 const vb=$('#viewBtn');vb.innerHTML=ic(S().view==='list'?'grid_view':'view_agenda');vb.title=vb.ariaLabel=S().view==='list'?'Grid view':'List view';
 renderNav();renderSel();
 {const t=$('#pageTitle'),v=page==='label'?(label(pageLabel)?.name||''):{notes:'Noted It',reminders:'Reminders',archive:'Archive',trash:'Recently deleted',search:'Search'}[page];if(t.textContent!==v){t.textContent=v;t.classList.toggle('wm',page==='notes')}}
 const L=visible(),m=$('#main');let h='';
 if(['notes','reminders','label'].includes(page))h+=`<div class="composer"><button class="take" data-act="new">${ic('add')}<span>New note</span></button><span class="cq">${qb('check_box','newlist','Checklist')}${qb('brush','newdraw','Sketch')}${qb('image','newimg','Photo')}</span></div>`;
 if(page==='trash')h+=`<div class="trashbar">Notes here are deleted for good after 7 days.${L.length?' <button class="txtbtn" data-act="emptytrash">Delete all now</button>':''}</div>`;
 if(page==='search'&&filter){const f=filter,n=f.k==='label'?label(f.v)?.name:f.k==='color'?(CNAMES[f.v]||'Default')+' notes':{reminders:'Reminders',lists:'Lists',images:'Images',drawings:'Drawings',urls:'URLs',audio:'Audio',places:'Places'}[f.v];h+=`<div class="fbar">${ic('search')}<span>${esc(n)}</span><button class="txtbtn" data-act="clearfilter">Clear filter</button></div>`}
 if(page==='search'&&!q&&!filter)h+=filtersHTML();
 else if(!L.length)h+=emptyHTML();
 else{const grp=['notes','label'].includes(page),P=grp?L.filter(n=>n.pinned):[],O=grp?L.filter(n=>!n.pinned):L;
  if(P.length)h+=`<div class="grid"><h2 class="sec">Pinned</h2>${P.map(card).join('')}</div>`;
  if(O.length)h+=`<div class="grid">${P.length?'<h2 class="sec">Notes</h2>':''}${O.map(card).join('')}</div>`}
 const fid=document.activeElement?.closest?.('#main .card')?.dataset.id;
 ro.disconnect();m.innerHTML=h;$$('.grid>*',m).forEach(c=>ro.observe(c));if(fid&&!topDlg())$(`#main .card[data-id="${fid}"]`)?.focus({preventScroll:true})}

// ---------- mutations ----------
function mut(ids,fn,msg){
 const ns=ids.map(get).filter(Boolean),snap=ns.map(n=>structuredClone(n));
 ns.forEach(n=>{fn(n);if(n===cur){cur.updatedAt=Date.now();commitCur()}else saveNote(n)});
 if(msg)toast(msg,()=>{snap.forEach(s=>{const i=notes.findIndex(n=>n.id===s.id);if(i>=0)notes[i]=s;saveNote(s)});render()});
 render();if(cur&&ns.includes(cur)&&$('#ed').open)renderEd()}
function toggleItem(n,it){const v=!it.done;it.done=v;if(!it.indent){let k=n.items.indexOf(it)+1;while(n.items[k]?.indent){n.items[k].done=v;k++}}}
function toggleChecks(n){
 if(n.isList){n.body=n.items.map(i=>esc(i.text)).join('<br>');n.items=[];n.isList=false}
 else{n.items=plain(n.body).split('\n').filter(s=>s.trim()).map(text=>({id:uid(),text,done:false,indent:0}));n.body='';n.isList=true}}
function moveNote(id,toId){
 if(id===toId)return;const V=visible(),a=byId(id),from=V.findIndex(n=>n.id===id),to=V.findIndex(n=>n.id===toId);if(from<0||to<0)return;
 const L=V.filter(n=>n.id!==id),t=L.findIndex(n=>n.id===toId),above=from<to?L[t]:L[t-1],below=from<to?L[t+1]:L[t];
 a.order=above&&below?(above.order+below.order)/2:above?above.order-1:below.order+1;
 if(['notes','label'].includes(page))a.pinned=byId(toId).pinned;
 saveNote(a);render()}
function createLabel(name){name=String(name||'').trim().slice(0,50);if(!name)return null;const ex=meta.labels.find(l=>l.name.toLowerCase()===name.toLowerCase());if(ex)return ex.id;const l={id:uid(),name};meta.labels.push(l);saveMeta();renderNav();return l.id}
function copyNotes(ids){ids.map(get).filter(Boolean).forEach(s=>{const t=Date.now(),n={...structuredClone(s),id:uid(),order:t,createdAt:t,versions:[],pinned:false,trashedAt:0};n.items=n.items.map(i=>({...i,id:uid()}));notes.push(n);saveNote(n)});render();toast('Duplicated')}

// ---------- editor ----------
function openEd(n,focus='body'){
 if(!n)return;if(n.locked&&!n._open){if(n._bad)toast('This note uses a different PIN. It stays locked.');else ensureKey().then(ok=>ok&&n._open&&openEd(n,focus));return}cur=n;curOrig=snapKey(n);hist=[curOrig];hi=0;fmtOpen=false;
 const d=$('#ed');if(!d.open)d.showModal();renderEd(true);
 if(n.trashedAt)return;
 if(focus==='title')$('#edTitle').focus();else if(n.isList)($('#edList .add input')||$('#edList textarea'))?.focus();else placeEnd($('#edBody'))}
function placeEnd(el){el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}
function edMedia(n){
 const im=n.images.filter(isImg).map((s,i)=>`<div class="mw"><img src="${esc(fsrc(s))}" alt="Image ${i+1}" data-act="imgview" data-i="${i}">${ib('delete','imgdel','Delete image',`data-i="${i}"`)}</div>`).join('');
 const dr=n.drawings.filter(isImg).map((s,i)=>`<div class="mw"><img src="${esc(fsrc(s))}" alt="Drawing ${i+1}" data-act="drawedit" data-i="${i}">${ib('delete','drawdel','Delete drawing',`data-i="${i}"`)}</div>`).join('');
 return(im||dr?`<div class="media ed-m">${im}${dr}</div>`:'')+n.audio.map((a,i)=>`<div class="aw"><audio controls src="${esc(fsrc(a.src))}"></audio>${ib('delete','audiodel','Delete recording',`data-i="${i}"`)}</div>`).join('')}
function renderEd(force){
 const n=cur;if(!n)return;const roNote=!!n.trashedAt,box=$('#edBox');
 box.style.cssText=(n.color?`--nc:var(--${n.color});`:'')+pmVar(n);box.className='ed '+bgc(n.bg)+(roNote?' ro':'');
 $('#edMedia').innerHTML=edMedia(n);
 const t=$('#edTitle');if(t.value!==n.title)t.value=n.title;t.readOnly=roNote;
 const b=$('#edBody');b.hidden=n.isList;b.contentEditable=roNote?'false':'true';if(force||document.activeElement!==b)b.innerHTML=clean(n.body);
 $('#edList').hidden=!n.isList;if(n.isList&&(force||!$('#edList').contains(document.activeElement)))renderEdList();
 $('#edChips').innerHTML=chips(n)+(S().links?links(n).map(linkChip).join(''):'');
 $('#edMeta').textContent=byId(n.id)?'Edited '+fmtEdited(n.updatedAt):'';$('#edMeta').title='Created '+fmtFull(n.createdAt);
 const p=$('#edPin');p.hidden=roNote;p.classList.toggle('on',n.pinned);p.title=p.ariaLabel=n.pinned?'Unpin note':'Pin note';
 $('#edFmt').hidden=n.isList||!fmtOpen;
 $('#edTools').innerHTML=roNote?ib('delete_forever','forever','Delete forever')+ib('restore_from_trash','restore','Restore')+'<span class="grow"></span><span class="hint">Deleted notes are read-only</span><button class="txtbtn" data-act="close">Close</button>'
 :(n.isList?'':ib('text_format','fmt','Text style'))+ib('add_alert','rem','Set reminder')+ib('palette','color','Colour and style')+ib('image','img','Add image')+ib('brush','drawadd','Add sketch')+ib(rec?'stop':'mic',rec?'stoprec':'rec',rec?'Stop recording':'Record voice note')+ib(n.archived?'unarchive':'archive','arch',n.archived?'Unarchive':'Archive')+ib('more_vert','more','More')+ib('undo','undo','Undo')+ib('redo','redo','Redo')+'<span class="grow"></span><button class="txtbtn" data-act="close">Close</button>';
 undoBtns()}
function undoBtns(){const u=$('#edTools [data-act=undo]'),r=$('#edTools [data-act=redo]');if(u)u.disabled=!(hi>0||snapKey(cur)!==hist[hi]);if(r)r.disabled=hi>=hist.length-1}
function renderEdList(focusId,caret){
 const n=cur,bottom=S().checkedBottom,un=bottom?n.items.filter(i=>!i.done):n.items,dn=bottom?n.items.filter(i=>i.done):[],open=n.checkedOpen!==false;
 const row=i=>`<div class="li ${i.done?'done':''}" data-iid="${i.id}" style="--ind:${i.indent||0}"><span class="ms drag" aria-hidden="true">drag_indicator</span><button class="cb" data-act="eitem" aria-label="${i.done?'Uncheck':'Check'} item">${ic(i.done?'check_box':'check_box_outline_blank')}</button><textarea rows="1" aria-label="List item" ${cur.trashedAt?'readonly':''}>${esc(i.text)}</textarea>${ib('close','edel','Delete item')}</div>`;
 const add=`<div class="li add">${ic('add')}<input placeholder="List item" aria-label="New list item"></div>`;
 $('#edList').innerHTML=(S().addBottom?'':add)+un.map(row).join('')+(S().addBottom?add:'')+(dn.length?`<button class="ctog" data-act="ctoggle">${ic(open?'expand_less':'expand_more')}${dn.length} checked item${dn.length>1?'s':''}</button>${open?dn.map(row).join(''):''}`:'');
 $$('#edList textarea').forEach(grow);
 if(focusId){const ta=$(`#edList .li[data-iid="${focusId}"] textarea`);if(ta){ta.focus();const p=caret??ta.value.length;ta.setSelectionRange(p,p)}}}
function grow(ta){if(!CSS.supports('field-sizing','content')){ta.style.height='auto';ta.style.height=ta.scrollHeight+'px'}}
function changed(){
 cur.updatedAt=Date.now();clearTimeout(saveT);saveT=setTimeout(()=>{commitCur();render()},400);
 clearTimeout(histT);histT=setTimeout(pushHist,700);$('#edMeta').textContent='Edited '+fmtEdited(Date.now());undoBtns()}
function pushHist(){if(!cur)return;const k=snapKey(cur);if(k===hist[hi])return;hist=hist.slice(0,hi+1);hist.push(k);hi=hist.length-1;if(hist.length>100){hist.shift();hi--}undoBtns()}
function applyHist(k){const s=JSON.parse(k);Object.assign(cur,{title:s.t,body:s.b,items:s.i,isList:s.l});renderEd(true);clearTimeout(histT);cur.updatedAt=Date.now();commitCur();render()}
function onEdClose(){
 stopRec();clearTimeout(saveT);clearTimeout(histT);popHide();
 const n=cur;cur=null;if(!n)return;
 if(n.deleted){render();return}
 const inList=byId(n.id);
 if(isEmpty(n)){if(inList){n.deleted=true;saveNote(n);toast('Empty note discarded')}}
 else{if(inList&&snapKey(n)!==curOrig){const o=JSON.parse(curOrig);if(o.t||plain(o.b).trim()||o.i.length)n.versions=[{at:Date.now(),...o},...(n.versions||[])].slice(0,20)}
  if(!inList)notes.push(n);saveNote(n)}
 render()}
function addText(n,t){if(!t)return;if(n.isList)n.items.push({id:uid(),text:t,done:false,indent:0});else n.body+=(plain(n.body).trim()?'<br>':'')+esc(t).replace(/\n/g,'<br>');if(n===cur){renderEd(true);changed()}else{if(!byId(n.id))notes.push(n);saveNote(n);render()}}

// ---------- images, audio, text grab ----------
function shrink(f){return new Promise((res,rej)=>{const url=URL.createObjectURL(f),img=new Image();img.onload=()=>{const s=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(b=>b?res(b):rej(new Error('bad image')),f.type==='image/png'?'image/png':'image/jpeg',.85)};img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('bad image'))};img.src=url})}
async function addImages(files,n){
 const srcs=(await Promise.allSettled(files.filter(f=>f.type.startsWith('image/')).map(shrink))).filter(r=>r.status==='fulfilled').map(r=>r.value);
 if(!srcs.length)return toast('Could not read the image.');
 n.images.push(...await Promise.all(srcs.map(toRef)));if(n===cur){renderEd();changed()}else{if(!byId(n.id))notes.push(n);saveNote(n);render()}}
async function startRec(){
 const n=cur;
 try{const stream=await navigator.mediaDevices.getUserMedia({audio:true}),mr=new MediaRecorder(stream),chunks=[];
  mr.ondataavailable=e=>chunks.push(e.data);
  mr.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());{n.audio.push({src:await toRef(new Blob(chunks,{type:mr.mimeType})),at:Date.now()});if(n===cur){renderEd();changed()}else{if(!byId(n.id))notes.push(n);saveNote(n);render()}}};
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let sr=null;
  if(SR){sr=new SR();sr.continuous=true;sr.interimResults=false;sr.lang=navigator.language||'en-US';sr.onresult=ev=>{for(let i=ev.resultIndex;i<ev.results.length;i++)if(ev.results[i].isFinal)addText(n,ev.results[i][0].transcript.trim())};sr.onerror=()=>{};try{sr.start()}catch{}}
  mr.start();rec={mr,sr};renderEd()}
 catch(e){console.error(e);toast('Microphone is not available. Allow microphone access in your browser.')}}
function stopRec(){if(!rec)return;const r=rec;rec=null;if(r.mr.state!=='inactive')r.mr.stop();try{r.sr?.stop()}catch{}if(cur)renderEd()}
async function ocr(){
 const n=cur;toast('Reading text from the image…');
 try{if(!window.Tesseract)await new Promise((r,j)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.integrity='sha384-GJqSu7vueQ9qN0E9yLPb3Wtpd7OrgK8KmYzC8T1IysG1bcvxvIO4qtYR/D3A991F';s.crossOrigin='anonymous';s.onload=r;s.onerror=j;document.head.append(s)});
  const out=[];for(const src of n.images){const{data}=await Tesseract.recognize(FBLOB.get(src.slice(2))||src,'eng',{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',langPath:'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int'});out.push(data.text.trim())}
  const t=out.filter(Boolean).join('\n\n');if(!t)return toast('No text found in the image.');
  if(n.isList)t.split('\n').filter(s=>s.trim()).forEach(text=>n.items.push({id:uid(),text,done:false,indent:0}));else n.body+=(plain(n.body).trim()?'<br>':'')+esc(t).replace(/\n/g,'<br>');
  if(n===cur){renderEd(true);changed()}else saveNote(n);toast('Text added to the note')}
 catch(e){console.error(e);toast('Could not read text from the image. Check the connection and try again.')}}

// ---------- drawing ----------
const W=1200,H=800,cv=$('#cv'),tc=$('#tc'),ctx=cv.getContext('2d'),tctx=tc.getContext('2d');
const TOOL={pen:{w:1,a:1},marker:{w:2.5,a:1},hl:{w:6,a:.35},eraser:{w:4,a:1}};
const DCOL=['#1d1f23','#e53935','#f4511e','#f6bf26','#33b679','#039be5','#7986cb','#8e24aa'];
let tool='pen',dcolor=DCOL[0],pts=null,dirty=false,ustack=[],dn=null,di=-1;
$('#dcolors').innerHTML=DCOL.map((c,i)=>`<button class="dc ${i?'':'on'}" data-col="${c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('');
function openDraw(n,i=-1){dn=n;di=i;dirty=false;ustack=[];ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);tctx.clearRect(0,0,W,H);if(i>=0){const im=new Image();im.onload=()=>ctx.drawImage(im,0,0,W,H);im.src=fsrc(n.drawings[i])}$('#draw').showModal()}
const P=e=>{const r=tc.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
// ponytail: redraws the whole stroke each move (O(n²) per stroke); fine for hand drawing, switch to incremental segments if long strokes lag.
function stroke(){tctx.clearRect(0,0,W,H);tctx.strokeStyle=tool==='eraser'?'#fff':dcolor;tctx.lineWidth=+$('#dsize').value*TOOL[tool].w;tctx.lineCap=tctx.lineJoin='round';tctx.beginPath();pts.forEach((p,i)=>i?tctx.lineTo(p.x,p.y):tctx.moveTo(p.x,p.y));if(pts.length===1)tctx.lineTo(pts[0].x+.1,pts[0].y);tctx.stroke()}
tc.onpointerdown=e=>{tc.setPointerCapture(e.pointerId);pts=[P(e)];tc.style.opacity=TOOL[tool].a;stroke()};
tc.onpointermove=e=>{if(!pts)return;pts.push(P(e));stroke()};
tc.onpointerup=tc.onpointercancel=()=>{if(!pts)return;ustack.push(ctx.getImageData(0,0,W,H));if(ustack.length>15)ustack.shift();ctx.globalAlpha=TOOL[tool].a;ctx.drawImage(tc,0,0);ctx.globalAlpha=1;tctx.clearRect(0,0,W,H);pts=null;dirty=true};
$('#draw').addEventListener('click',e=>{const t=e.target.closest('[data-tool]'),c=e.target.closest('[data-col]');
 if(t){tool=t.dataset.tool;$$('#draw [data-tool]').forEach(b=>b.classList.toggle('on',b===t))}
 if(c){dcolor=c.dataset.col;$$('#draw [data-col]').forEach(b=>b.classList.toggle('on',b===c));if(tool==='eraser'){tool='pen';$$('#draw [data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool==='pen'))}}});
$('#draw').addEventListener('close',async()=>{const n=dn;dn=null;if(!dirty||!n)return;const src=await toRef(await new Promise(r=>cv.toBlob(r,'image/png')));if(di>=0)n.drawings[di]=src;else n.drawings.push(src);
 if(n===cur){renderEd();changed()}else{const isNew=!byId(n.id);if(isNew)notes.push(n);saveNote(n);render();if(isNew)openEd(n)}});

// ---------- popover, toast, reminders ----------
const topDlg=()=>$$('dialog[open]').pop()||null;
let previewing=false;
function previewBg(b){previewing=true;const cls=e=>{e.className=e.className.replace(/\b(bg-\w+|il)\b/g,'').trim()+' '+bgc(b)};popTargets.forEach(id=>{const n=get(id),c=$(`#main .card[data-id="${id}"]`),pm=b==='map'&&n?.place?mapSVG(n.place):'';for(const e of [c,cur?.id===id&&$('#edBox')])if(e){cls(e);if(pm)e.style.setProperty('--pm',pm)}})}
function popHide(){try{$('#pop').hidePopover()}catch{}}
function openPop(btn,ids,html,fill){
 const p=$('#pop');popHide();popTargets=ids;popBtn=btn;(topDlg()||document.body).append(p);p.innerHTML=html;fill?.();p.showPopover();p.querySelector('button.on,button')?.focus({preventScroll:true});
 const r=btn.getBoundingClientRect(),w=p.offsetWidth,h=p.offsetHeight;
 p.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';p.style.top=(r.bottom+h+8>innerHeight?Math.max(8,r.top-h-4):r.bottom+4)+'px'}
function colorPop(btn,ids){const n=get(ids[0]);if(!n)return;
 openPop(btn,ids,`<div class="swatches">${['',...COLORS].map(c=>`<button class="sw ${(n.color||'')===c?'on':''}" data-act="setcolor" data-v="${c}" ${c?`style="background:var(--${c})"`:''} title="${c?CNAMES[c]:'Default'}" aria-label="${c?CNAMES[c]:'Default color'}">${c?'':ic('format_clear')}</button>`).join('')}</div><div class="swatches">${['',...BGS].map(b=>`<button class="sw ${b?'bg-'+b:''} ${(n.bg||'')===b?'on':''}" data-act="setbg" data-v="${b}" title="${b?b[0].toUpperCase()+b.slice(1):'No background'}" aria-label="${b?b+' background':'No background'}">${b?'':ic('format_clear')}</button>`).join('')}</div><div class="swatches prem">${[...PREM,...(n.place&&ids.length===1?['map']:[])].map(b=>`<button class="sw il bg-${b} ${pro()?'':'lk'} ${(n.bg||'')===b?'on':''}" data-act="setbg" data-v="${b}" title="${PNAME(b)}${pro()?'':' (Supporter Pack)'}" aria-label="${PNAME(b)} background">${b?'':ic('format_clear')}</button>`).join('')}</div>`)}
function morePop(btn,ids,inEd){const n=get(ids[0]);if(!n)return;const one=ids.length===1,shut=n.locked&&!n._open,row=(a,t,i)=>`<button class="mi" role="menuitem" data-act="${a}"><span>${t}</span>${ic(i)}</button>`,sep='<hr class="msep">';
 let h='';
 if(btn.closest?.('.card'))h+=row('rem','Set reminder','add_alert')+row('color','Colour and style','palette')+(shut?'':row('img','Add image','image'))+row('arch',n.archived?'Unarchive':'Archive',n.archived?'unarchive':'archive')+sep;
 h+=row('labels',n.labels.length?'Edit tags':'Add tags','label')+row('copy','Duplicate','add');
 if(inEd)h+=row('drawadd','Add sketch','brush');
 if(one&&!shut)h+=row('placeadd',n.place?'Update place':'Add place','location_on');
 if(one&&!shut)h+=row('checks',n.isList?'Turn into text':'Turn into checklist','check_box');
 if(one&&inEd&&n.isList)h+=row('uncheck','Uncheck all','check_box_outline_blank')+row('delchecked','Remove checked items','delete_outline');
 if(one&&inEd&&n.images.length)h+=row('ocr','Copy text from image','image');
 if(one&&inEd)h+=row('versions','Earlier versions','undo');
 if(one&&!shut)h+=sep+row('lockn',n.locked?'Remove lock':'Lock','lock')+row('send','Share','mail_outline')+row('copytext','Copy text','text_format');
 h+=sep+row('trash','Delete','delete');
 openPop(btn,ids,`<div class="menu" role="menu">${h}</div>`)}
function labelPop(btn,ids){openPop(btn,ids,`<div class="lp"><p class="lp-h">Tags</p><label class="lps"><input id="lpq" maxlength="50" placeholder="Find or create a tag" aria-label="Tag name">${ic('search')}</label><div id="lpl"></div></div>`,lpList);$('#lpq').focus()}
function lpList(){const v=$('#lpq').value.trim(),ns=popTargets.map(get).filter(Boolean);
 const L=meta.labels.filter(l=>l.name.toLowerCase().includes(v.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));
 $('#lpl').innerHTML=L.map(l=>{const c=ns.filter(n=>n.labels.includes(l.id)).length;return`<label class="lrow"><input type="checkbox" data-lid="${l.id}" ${c&&c===ns.length?'checked':''} ${c&&c<ns.length?'data-mixed':''}>${esc(l.name)}</label>`}).join('')+(v&&!meta.labels.some(l=>l.name.toLowerCase()===v.toLowerCase())?`<button class="mi" data-act="mklabel">${ic('add')}<span class="grow">Create "${esc(v)}"</span></button>`:'');
 $$('#lpl [data-mixed]').forEach(i=>i.indeterminate=true)}
// In-app confirm (no native confirm()). Resolves true on the red button.
const ask=(t,ok)=>new Promise(r=>{const d=$('#ask');$('#askT').textContent=t;$('#askOk').textContent=ok;d.returnValue='';d.onclose=()=>r(d.returnValue==='ok');d.showModal();$('#ask [value=""]').focus()});
function toast(msg,undo,label='Undo'){
 const t=$('#toast');try{t.hidePopover()}catch{}(topDlg()||document.body).append(t);
 t.innerHTML=`<span>${esc(msg)}</span>${undo?`<button class="txtbtn" id="undoBtn">${label}</button>`:''}<button class="ib" id="toastX" aria-label="Dismiss">${ic('close')}</button>`;
 try{t.showPopover()}catch{}
 t.querySelector('#undoBtn')?.addEventListener('click',()=>{undo();try{t.hidePopover()}catch{}});
 t.querySelector('#toastX').onclick=()=>{try{t.hidePopover()}catch{}};
 clearTimeout(toastT);toastT=setTimeout(()=>{try{t.hidePopover()}catch{}},undo?7000:4000)}
function openRem(ids){remIds=ids;const n=get(ids[0]);if(!n)return;
 const pre=[[laterToday(),dayStart(new Date(laterToday()))===dayStart(new Date())?'Later today':'Tomorrow'],[at(1,8),'Tomorrow'],[nextWeek(),'Next week']].filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i);
 $('#remPre').innerHTML=pre.map(([t,l])=>`<button type="button" class="mi" data-act="remat" data-at="${t}"><span>${l}</span><span class="muted">${esc(fmtWhen(t))}</span></button>`).join('');
 $('#remAt').value=toLocal(n.reminder?.at||at(1,8));$('#remRep').value=n.reminder?.repeat||'';$('#remDel').hidden=!n.reminder;$('#rem').showModal()}
function setRem(t,repeat){if(!(t>0))return toast('Pick a date and time.');mut(remIds,n=>n.reminder={at:t,repeat,done:false});$('#rem').close();try{if(Notification.permission==='default')Notification.requestPermission()}catch{}}
function fire(n){const hush=document.body.classList.contains('locked');if(n.locked||hush)n={title:'Reminder for a locked note',body:'',isList:false,items:[],id:n.id};const t=n.title||plain(n.body).slice(0,60)||'Reminder';try{if(Notification.permission==='granted'){new Notification(t,{body:n.isList?n.items.slice(0,3).map(i=>i.text).join(', '):plain(n.body).slice(0,120),tag:n.id});return}}catch{}if(!hush)toast('Reminder: '+t)}
const STEP={daily:d=>d.setDate(d.getDate()+1),weekly:d=>d.setDate(d.getDate()+7),monthly:d=>d.setMonth(d.getMonth()+1),yearly:d=>d.setFullYear(d.getFullYear()+1)};
function tick(){if(document.body.classList.contains('locked'))return; // due reminders wait until unlock
 const now=Date.now();let any=false;
 notes.forEach(n=>{const r=n.reminder;if(!r||r.done||n.deleted||n.trashedAt||r.at>now)return;fire(n);any=true;
  if(STEP[r.repeat]){const d=new Date(r.at);do STEP[r.repeat](d);while(d.getTime()<=now);r.at=d.getTime()}else r.done=true;saveNote(n)});
 if(any)render()}

// ---------- import / export ----------
const TK={RED:'coral',ORANGE:'peach',YELLOW:'sand',GREEN:'mint',TEAL:'sage',BLUE:'fog',CERULEAN:'storm',GRAY:'chalk',PURPLE:'dusk',PINK:'blossom',BROWN:'clay'};
function normalize(x,map){const n=mk();
 for(const k of ['title','body','isList','pinned','archived','trashedAt','order','createdAt','updatedAt','checkedOpen'])if(x[k]!==undefined&&typeof x[k]===typeof(n[k]??x[k]))n[k]=x[k];
 n.id=safeId(x.id);n.body=clean(n.body);n.title=String(n.title);
 n.items=(Array.isArray(x.items)?x.items:[]).map(i=>({id:safeId(i?.id),text:String(i?.text||''),done:!!i?.done,indent:i?.indent?1:0}));
 n.images=(x.images||[]).filter(isDataImg);n.drawings=(x.drawings||[]).filter(isDataImg);
 if(x.locked&&typeof x.sealed?.iv==='string'&&typeof x.sealed?.ct==='string'){n.locked=true;n.sealed={iv:x.sealed.iv,ct:x.sealed.ct}}n.audio=(x.audio||[]).filter(a=>isDataAud(a?.src)).map(a=>({src:a.src,at:+a.at||Date.now()}));
 n.labels=(x.labels||[]).map(id=>map[id]).filter(Boolean);n.color=COLORS.includes(x.color)?x.color:'';n.bg=[...BGS,...PREM,'map'].includes(x.bg)?x.bg:'';
 if(x.place&&isFinite(+x.place.lat)&&isFinite(+x.place.lng))n.place={lat:+x.place.lat,lng:+x.place.lng,name:String(x.place.name||'').slice(0,80),at:+x.place.at||0};
 n.reminder=x.reminder&&+x.reminder.at>0?{at:+x.reminder.at,repeat:STEP[x.reminder.repeat]?x.reminder.repeat:'',done:!!x.reminder.done}:null;
 n.deleted=!!x.deleted;
 if(n.locked)Object.assign(n,{title:'',body:'',items:[],images:[],drawings:[],audio:[],place:null,versions:[]}); // content lives only in sealed
 return n}
async function fromTakeout(d,files){
 const t=+d.createdTimestampUsec/1000||Date.now(),u=+d.userEditedTimestampUsec/1000||t,imgs=[];
 for(const a of d.attachments||[]){const nm=String(a.filePath||''),f=files[nm]||files[nm.replace(/\.jpeg$/i,'.jpg')]||files[nm.replace(/\.jpg$/i,'.jpeg')];if(f)try{imgs.push(await toRef(await shrink(f)))}catch{}}
 return mk({title:String(d.title||''),body:d.textContentHtml?clean(d.textContentHtml):esc(d.textContent||'').replace(/\n/g,'<br>'),isList:Array.isArray(d.listContent),
  items:(d.listContent||[]).map(i=>({id:uid(),text:String(i.text||''),done:!!i.isChecked,indent:0})),color:TK[d.color]||'',pinned:!!d.isPinned,archived:!!d.isArchived,
  labels:(d.labels||[]).map(l=>createLabel(l.name)).filter(Boolean),images:imgs,order:t,createdAt:t,updatedAt:u})}
async function importFiles(list){
 const files=Object.fromEntries(list.filter(f=>f.type.startsWith('image/')).map(f=>[f.name,f]));let added=0,skipped=0,adopted=false;
 for(const f of list.filter(f=>/\.json$/i.test(f.name)||f.type==='application/json')){
  let d;try{d=JSON.parse(await f.text())}catch{skipped++;continue}
  if(d?.app==='noted-it'){const map={};if(!meta.lock&&d.lock?.salt&&d.lock?.mk?.iv&&(d.notes||[]).some(x=>x?.locked)){meta.lock={app:false,salt:String(d.lock.salt),mk:{iv:String(d.lock.mk.iv),ct:String(d.lock.mk.ct)}};adopted=true}(d.labels||[]).forEach(l=>map[l.id]=createLabel(l.name));
   for(const x of d.notes||[])try{const n=normalize(x,map),ex=byId(n.id);if(ex&&ex.updatedAt>=n.updatedAt)continue;if(n.locked&&LK)await openSealed(n);else await migrate(n);if(ex)Object.assign(ex,n);else notes.push(n);await putNote(ex||n);added++}catch(e){console.error(e);skipped++}}
  else if(d&&('textContent' in d||'listContent' in d||'textContentHtml' in d)){if(d.isTrashed){skipped++;continue}try{const n=await fromTakeout(d,files);await migrate(n);notes.push(n);await putNote(n);added++}catch(e){console.error(e);skipped++}}
  else skipped++}
 saveMeta();render();toast(`${added} note${added===1?'':'s'} imported${skipped?`. ${skipped} skipped`:''}.${adopted?' Locked notes use the PIN from the backup.':''}`)}
async function exportData(){
 const out=await Promise.all(notes.filter(n=>!n.deleted).map(async n=>n.locked?stored(n):{...n,images:await Promise.all(n.images.map(toData)),drawings:await Promise.all(n.drawings.map(toData)),audio:await Promise.all(n.audio.map(async a=>({...a,src:await toData(a.src)})))}));
 const data=JSON.stringify({app:'noted-it',version:1,exportedAt:new Date().toISOString(),labels:meta.labels,lock:meta.lock||undefined,notes:out}),filename=`noted-it-backup-${new Date().toISOString().slice(0,10)}.json`;
 try{const dl=window.claude?.use?await claude.use('downloads'):null;if(dl){await dl.save({filename,data});return}}catch(e){if(e?.code==='declined')return}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
async function copyText(t){try{await navigator.clipboard.writeText(t);toast('Note text copied')}catch{toast('Could not copy. The browser blocked the clipboard.')}}
function applyTheme(){const r=document.documentElement,k=pro()&&SKINS[S().skin]?S().skin:'',t=k?SKINS[k].s:S().theme;if(k){r.dataset.skin=k;}else delete r.dataset.skin;if(t==='system')delete r.dataset.theme;else r.dataset.theme=t}

// ---------- actions ----------
function targets(el){if(el.closest('#selbar'))return[...selected];const c=el.closest('.card');if(c)return[c.dataset.id];if(el.closest('#ed')&&!el.closest('#pop'))return cur?[cur.id]:[];return popTargets}
function leaveSearch(){q='';filter=null;prevPage=null;$('#q').value='';selected.clear();if($('#ed').open)$('#ed').close();if(innerWidth<=700)navOpen=false;render();scrollTo(0,0)}
function act(k,el){
 const ids=targets(el),fromEd=!!el.closest('#ed'),closeEd=()=>{if(fromEd&&$('#ed').open)$('#ed').close()};
 if(el.closest('#pop')&&!['setcolor','setbg','mklabel','plrm'].includes(k))popHide();
 const n1=get(ids[0]),plural=ids.length>1?ids.length+' notes':'Note';
 switch(k){
 case'menu':navOpen=!navOpen;renderNav();break;
 case'go':page=el.dataset.page;pageLabel=null;leaveSearch();break;
 case'golabel':page='label';pageLabel=el.dataset.label;leaveSearch();break;
 case'editlabels':renderLabels();$('#labels').showModal();break;
 case'view':S().view=S().view==='list'?'grid':'list';saveMeta();render();break;
 case'settings':$$('#settings [data-set]').forEach(i=>i.type==='checkbox'?i.checked=!!S()[i.dataset.set]:i.value=S()[i.dataset.set]);paintPro();paintLock();{const a=$('#storeBtn');if(APP_STORE_URL){a.href=APP_STORE_URL;a.removeAttribute('aria-disabled')}else{a.removeAttribute('href');a.setAttribute('aria-disabled','true')}$('#storeTxt').textContent=APP_STORE_URL?'Get it on the App Store':'Coming soon to the App Store'}$('#settings').showModal();break;
 case'pack':openPack();break;
 case'pkbg':pkBg(el.dataset.v);break;
 case'placeadd':grabPlace(get(ids[0])||get(popTargets[0]),true);break;
 case'place':placePop(el,ids);break;
 case'plrm':mut(popTargets,n=>{n.place=null;if(n.bg==='map')n.bg=''});popHide();break;
 case'lockn':lockToggle(get(ids[0])||get(popTargets[0]));break;
 case'pinset':if(!meta.lock)askPin('Set a PIN','Use 6 or more characters. A short phrase is safest. If you forget the PIN, locked notes cannot be opened.',true,setPin).then(paintLock);
  else{let raw;askPin('Enter your current PIN','',false,async x=>{raw=await unwrapMK(x)}).then(ok=>ok&&askPin('Choose a new PIN','',true,async x=>{await wrapMK(x,raw);await useMK(raw)})).then(ok=>ok&&toast('PIN changed'))}break;
 case'locknow':$('#settings').close();lockNow();if(!meta.lock.app)toast('Locked notes are closed');break;
 case'pincancel':$('#pin').close('');break;
 case'pinforgot':$('#pinE').innerHTML=($('#pin').classList.contains('full')?'Reset removes the PIN and deletes every note on this device.':'Reset removes the PIN and deletes every locked note.')+' <button type="button" class="txtbtn" data-act="pinreset">Delete and reset</button>';break;
 case'pinreset':{const all=$('#pin').classList.contains('full');notes.filter(n=>!n.deleted&&(all||n.locked)).forEach(purge);meta.lock=null;LK=null;saveMeta();$('#pin').close('ok');render();toast(all?'PIN removed. All notes were deleted.':'PIN removed. Locked notes were deleted.');break}
 case'unlock':S().pro=true;saveMeta();paintPro();pkTiles();toast('Supporter Pack unlocked. Thank you.');break; // ponytail: payment stub. Wire StoreKit (iPhone) or a license key (web) here.
 case'setskin':if(el.dataset.v&&!pro()){openPack();break}S().skin=el.dataset.v;saveMeta();applyTheme();paintPro();break;
 case'signin':$('#settings').close();showOb('2');break;
 case'ob':showOb(el.dataset.v);break;
 case'obtheme':S().theme=el.dataset.v;saveMeta();applyTheme();showOb('3');break;
 case'obdone':S().onboarded=true;saveMeta();$('#ob').close();break;
 case'keys':$('#keys').showModal();break;
 case'clearq':[page,pageLabel]=prevPage||['notes',null];leaveSearch();break;
 case'filter':filter={k:el.dataset.k,v:el.dataset.v};render();break;
 case'clearfilter':filter=null;render();break;
 case'new':openEd(newNote());break;
 case'newlist':openEd(newNote(true));break;
 case'newdraw':openDraw(newNote());break;
 case'newimg':imgFor='new';$('#imgIn').click();break;
 case'sel':{const id=el.closest('.card').dataset.id;selected.has(id)?selected.delete(id):selected.add(id);render();break}
 case'selclear':selected.clear();render();break;
 case'pin':mut(ids,n=>{n.pinned=!n.pinned;if(n.pinned)n.archived=false});break;
 case'pinsel':case'unpinsel':mut(ids,n=>{n.pinned=k==='pinsel';if(n.pinned)n.archived=false});break;
 case'edpin':cur.pinned=!cur.pinned;if(cur.pinned)cur.archived=false;renderEd();changed();break;
 case'arch':{const un=ids.map(get).filter(Boolean).every(n=>n.archived);closeEd();mut(ids,n=>{n.archived=!un;if(!un)n.pinned=false},`${plural} ${un?'unarchived':'archived'}`);selected.clear();render();break}
 case'trash':closeEd();mut(ids,n=>{n.trashedAt=Date.now();n.pinned=false},`${plural} deleted`);selected.clear();render();break;
 case'restore':closeEd();mut(ids,n=>n.trashedAt=0,`${plural} restored`);selected.clear();render();break;
 case'forever':ask(ids.length>1?`Delete ${ids.length} notes now? You can't undo this.`:'Delete this note now? You can\'t undo this.','Delete').then(ok=>{if(!ok)return;ids.map(get).filter(Boolean).forEach(purge);closeEd();selected.clear();render();toast(`${plural} deleted for good`)});break;
 case'emptytrash':ask('Delete all recently deleted notes now? You can\'t undo this.','Delete all').then(ok=>{if(ok){notes.filter(n=>n.trashedAt&&!n.deleted).forEach(purge);render()}});break;
 case'copy':copyNotes(ids);selected.clear();render();break;
 case'rem':openRem(ids);break;
 case'remat':setRem(+el.dataset.at,$('#remRep').value);break;
 case'remsave':setRem(new Date($('#remAt').value).getTime(),$('#remRep').value);break;
 case'remdel':mut(remIds,n=>n.reminder=null);$('#rem').close();break;
 case'color':colorPop(el.closest('#pop')&&popBtn?.isConnected?popBtn:el,ids);break;
 case'setcolor':mut(popTargets,n=>n.color=el.dataset.v);$$('#pop [data-act=setcolor]').forEach(b=>b.classList.toggle('on',b===el));break;
 case'setbg':if(isPrem(el.dataset.v)&&!pro()){previewBg(el.dataset.v);$$('#pop [data-act=setbg]').forEach(b=>b.classList.toggle('on',b===el));{const ids=[...popTargets];toast('Preview only. Get the Supporter Pack to keep it.',()=>{popHide();openPack(ids)},'Unlock')};break}mut(popTargets,n=>n.bg=el.dataset.v);$$('#pop [data-act=setbg]').forEach(b=>b.classList.toggle('on',b===el));break;
 case'more':morePop(el,ids,fromEd);break;
 case'labels':labelPop(popBtn&&popBtn.isConnected?popBtn:el,ids);break;
 case'mklabel':{const id=createLabel($('#lpq').value);if(id)mut(popTargets,n=>{if(!n.labels.includes(id))n.labels.push(id)});$('#lpq').value='';lpList();break}
 case'lnew':{const i=$('#lnew');if(i.value.trim()&&meta.labels.some(l=>l.name.toLowerCase()===i.value.trim().toLowerCase()))toast('That tag already exists.');else createLabel(i.value);i.value='';renderLabels();render();break}
 case'dellabel':{const id=el.dataset.label;ask('Delete this tag? It comes off every note. The notes stay.','Delete tag').then(ok=>{if(!ok)return;meta.labels=meta.labels.filter(l=>l.id!==id);notes.forEach(n=>{if(n.labels.includes(id)){n.labels=n.labels.filter(x=>x!==id);saveNote(n)}});saveMeta();if(pageLabel===id)page='notes';renderLabels();render()});break}
 case'checks':ids.map(get).filter(Boolean).forEach(n=>{toggleChecks(n);if(n===cur){renderEd(true);changed()}else saveNote(n)});render();break;
 case'uncheck':cur.items.forEach(i=>i.done=false);renderEdList();changed();break;
 case'delchecked':cur.items=cur.items.filter(i=>!i.done);renderEdList();changed();break;
 case'send':(async()=>{const t=noteText(n1);try{if(navigator.share)return await navigator.share({title:n1.title,text:t})}catch(e){if(e.name==='AbortError')return}copyText(t)})();break;
 case'copytext':copyText(noteText(n1));break;
 case'img':imgFor=fromEd?cur:n1;$('#imgIn').click();break;
 case'imgview':$('#lbImg').src=fsrc(cur.images[+el.dataset.i]);$('#lb').showModal();break;
 case'imgdel':cur.images.splice(+el.dataset.i,1);renderEd();changed();break;
 case'drawadd':openDraw(fromEd?cur:n1);break;
 case'drawedit':openDraw(cur,+el.dataset.i);break;
 case'drawdel':cur.drawings.splice(+el.dataset.i,1);renderEd();changed();break;
 case'drawdone':$('#draw').close();break;
 case'drawundo':if(ustack.length){ctx.putImageData(ustack.pop(),0,0);dirty=true}break;
 case'drawclear':ustack.push(ctx.getImageData(0,0,W,H));ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);dirty=true;break;
 case'audiodel':cur.audio.splice(+el.dataset.i,1);renderEd();changed();break;
 case'rec':startRec();break;
 case'stoprec':stopRec();break;
 case'ocr':ocr();break;
 case'versions':{const v=cur.versions||[];$('#verList').innerHTML=v.length?v.map((x,i)=>`<button class="ver" data-act="verrestore" data-i="${i}"><strong>${esc(fmtFull(x.at))}</strong><span>${esc(((x.t?x.t+': ':'')+(x.l?x.i.map(i=>i.text).join(', '):plain(x.b))).slice(0,140))}</span></button>`).join(''):'<p class="hint">No earlier versions yet. A version is kept each time you close a changed note.</p>';$('#versions').showModal();break}
 case'verrestore':{const x=cur.versions[+el.dataset.i];pushHist();cur.versions.unshift({at:Date.now(),...JSON.parse(snapKey(cur))});Object.assign(cur,{title:x.t,body:x.b,items:x.i,isList:x.l});curOrig=snapKey(cur);renderEd(true);changed();$('#versions').close();toast('Version restored');break}
 case'undo':pushHist();if(hi>0)applyHist(hist[--hi]);break;
 case'redo':if(hi<hist.length-1)applyHist(hist[++hi]);break;
 case'fmt':fmtOpen=!fmtOpen;$('#edFmt').hidden=!fmtOpen;break;
 case'fmtc':{const b=$('#edBody'),c=el.dataset.c;if(document.activeElement!==b&&!b.contains(getSelection().anchorNode))placeEnd(b);
  if(c==='h1'||c==='h2'||c==='p')document.execCommand('formatBlock',false,c==='p'?'div':c);else if(c==='clear'){document.execCommand('removeFormat');document.execCommand('formatBlock',false,'div')}else document.execCommand(c);
  b.dispatchEvent(new Event('input'));break}
 case'close':$('#ed').close();break;
 case'citem':{const n=byId(el.closest('.card').dataset.id);if(!n||n.trashedAt)break;toggleItem(n,n.items.find(i=>i.id===el.dataset.item));saveNote(n);render();break}
 case'eitem':{if(cur.trashedAt)break;const it=itemOf(el);toggleItem(cur,it);renderEdList();changed();$(`#edList .li[data-iid="${it.id}"] .cb`)?.focus();break}
 case'edel':{if(cur.trashedAt)break;const it=itemOf(el);cur.items=cur.items.filter(i=>i!==it);renderEdList();changed();break}
 case'ctoggle':cur.checkedOpen=cur.checkedOpen===false;renderEdList();changed();break;
 case'notif':if(!('Notification' in window)){toast('This browser does not support notifications.');break}Notification.requestPermission().then(p=>toast(p==='granted'?'Notifications are on.':'Notifications are blocked. Allow them in your browser settings.'));break;
 case'export':exportData();break;
 case'import':$('#impIn').click();break;
 }}
const itemOf=el=>cur.items.find(i=>i.id===el.closest('.li').dataset.iid);
function newNote(list=false){const n=mk({isList:list,labels:page==='label'&&pageLabel?[pageLabel]:[],reminder:page==='reminders'?{at:laterToday(),repeat:'',done:false}:null});if(S().places)grabPlace(n);return n}
function renderLabels(){$('#llist').innerHTML=meta.labels.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(l=>`<div class="lrow2">${ic('label')}<input value="${esc(l.name)}" data-rename="${l.id}" maxlength="50" aria-label="Label name">${ib('delete','dellabel','Delete tag',`data-label="${l.id}"`)}</div>`).join('')}

// ---------- events ----------
document.addEventListener('click',e=>{
 if(e.target.tagName==='DIALOG'&&!['draw','pin','ob'].includes(e.target.id)){e.target.close();return}
 if(navOpen&&innerWidth<=700&&!e.target.closest('nav,[data-act=menu]')){navOpen=false;renderNav()}
 const a=e.target.closest('[data-act]');if(a){act(a.dataset.act,a);return}
 const c=e.target.closest('#main .card');if(c&&!e.target.closest('a')){if(selected.size)act('sel',c);else openEd(byId(c.dataset.id))}});
document.addEventListener('mousedown',e=>{if(e.target.closest('#edFmt button'))e.preventDefault()});
document.addEventListener('change',e=>{const t=e.target;
 if(t.id==='plname'){mut(popTargets,n=>{if(n.place)n.place.name=t.value.trim().slice(0,80)})}
 else if(t.id==='appLock'){meta.lock.app=t.checked;saveMeta()}
 else if(t.dataset.set){S()[t.dataset.set]=t.type==='checkbox'?t.checked:t.value;if(t.dataset.set==='places'&&t.checked)navigator.geolocation?.getCurrentPosition(()=>{},()=>toast('Location access is blocked. Allow it for this site.'));saveMeta();applyTheme();render();if(cur)renderEd(true)}
 else if(t.dataset.lid){const v=t.checked,id=t.dataset.lid;mut(popTargets,n=>{n.labels=n.labels.filter(x=>x!==id);if(v)n.labels.push(id)})}
 else if(t.dataset.rename){const l=label(t.dataset.rename),v=t.value.trim().slice(0,50);if(!l)return;if(!v||meta.labels.some(x=>x!==l&&x.name.toLowerCase()===v.toLowerCase())){toast(v?'That tag already exists.':'A tag needs a name.');t.value=l.name;return}l.name=v;saveMeta();render()}});
document.addEventListener('input',e=>{if(e.target.id==='lpq')lpList()});
document.addEventListener('keydown',e=>{
 if(e.target.id==='lpq'&&e.key==='Enter'){e.preventDefault();$('#pop [data-act=mklabel]')?.click();return}
 if(e.target.id==='lnew'&&e.key==='Enter'){e.preventDefault();act('lnew',e.target);return}
 if(e.key==='Escape'&&navOpen&&innerWidth<=700&&!topDlg()){navOpen=false;renderNav();$('[data-act=menu]').focus();return}
 if(e.target.closest?.('#pop')&&/^Arrow(Up|Down)$/.test(e.key)){const b=$$('#pop button'),i=b.indexOf(e.target);if(i>=0){e.preventDefault();b[(i+(e.key==='ArrowDown'?1:-1)+b.length)%b.length].focus()}return}
 const dlg=topDlg();
 if(dlg){if(dlg.id==='ed'&&(e.ctrlKey||e.metaKey)&&e.shiftKey&&e.code==='Digit8'&&!cur.trashedAt){e.preventDefault();toggleChecks(cur);renderEd(true);changed()}return}
 if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
 if(e.target.closest?.('#main .card button,#main .card a'))return;
 const c=document.activeElement?.closest?.('#main .card'),cards=$$('#main .card'),i=cards.indexOf(c),k=e.key,refocus=()=>c&&requestAnimationFrame(()=>$(`.card[data-id="${c.dataset.id}"]`)?.focus());
 if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==='g'){e.preventDefault();act('view',$('#viewBtn'));return}
 if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==='a'){e.preventDefault();visible().forEach(n=>selected.add(n.id));render();return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 switch(k){
  case'n':e.preventDefault();if(page!=='archive'&&page!=='trash')act('new',$('#main'));break;
  case't':e.preventDefault();if(page!=='archive'&&page!=='trash')act('newlist',$('#main'));break;
  case'/':e.preventDefault();$('#q').focus();break;
  case'?':act('keys',document.body);break;
  case'j':case'k':cards[i<0?0:Math.max(0,Math.min(cards.length-1,i+(k==='j'?1:-1)))]?.focus();break;
  case'J':case'K':{const nb=c&&cards[i+(k==='J'?1:-1)];if(nb){moveNote(c.dataset.id,nb.dataset.id);refocus()}break}
  case'Enter':case'o':if(c){e.preventDefault();openEd(byId(c.dataset.id))}break;
  case'e':if(c&&page!=='trash')act('arch',c);break;
  case'#':if(c)act(page==='trash'?'forever':'trash',c);break;
  case'f':if(c&&page!=='trash'){act('pin',c);refocus()}break;
  case'x':if(c){act('sel',c);refocus()}break;
  case'Escape':if(selected.size&&!$('#pop').matches(':popover-open')){selected.clear();render();refocus()}break}});
$('#q').addEventListener('focus',()=>{if(page!=='search'){prevPage=[page,pageLabel];page='search';selected.clear();render()}});
$('#q').addEventListener('input',e=>{q=e.target.value.trim();render()});
$('#q').addEventListener('keydown',e=>{if(e.key==='Escape'){act('clearq',e.target);e.target.blur()}});
$('#ed').addEventListener('close',onEdClose);
$('#edTitle').addEventListener('input',e=>{cur.title=e.target.value;changed()});
$('#edTitle').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();cur.isList?($('#edList textarea')||$('#edList .add input'))?.focus():$('#edBody').focus()}});
$('#edBody').addEventListener('input',()=>{const b=$('#edBody');if(b.innerHTML==='<br>')b.innerHTML='';cur.body=clean(b.innerHTML);changed()});
$('#edBox').addEventListener('paste',e=>{if(!cur||cur.trashedAt)return;const f=[...e.clipboardData.files].filter(f=>f.type.startsWith('image/'));if(f.length){e.preventDefault();addImages(f,cur);return}
 if(e.target.id==='edBody'){e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))}});
const L=$('#edList');
L.addEventListener('input',e=>{const t=e.target;if(cur.trashedAt)return;
 if(t.matches('.add input')){const it={id:uid(),text:t.value,done:false,indent:0};t.value='';S().addBottom?cur.items.push(it):cur.items.unshift(it);renderEdList(it.id);changed();return}
 if(t.tagName!=='TEXTAREA')return;const it=itemOf(t);
 if(t.value.includes('\n')){const [first,...rest]=t.value.split('\n');it.text=first;const idx=cur.items.indexOf(it),nu=rest.filter(s=>s.trim()).map(text=>({id:uid(),text,done:false,indent:it.indent}));cur.items.splice(idx+1,0,...nu);renderEdList((nu.at(-1)||it).id)}
 else{it.text=t.value;grow(t)}changed()});
L.addEventListener('keydown',e=>{const ta=e.target;if(ta.tagName!=='TEXTAREA'||cur.trashedAt)return;const it=itemOf(ta),idx=cur.items.indexOf(it),mod=e.ctrlKey||e.metaKey;
 if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const p=ta.selectionStart,ni={id:uid(),text:it.text.slice(p),done:false,indent:it.indent};it.text=it.text.slice(0,p);cur.items.splice(idx+1,0,ni);renderEdList(ni.id,0);changed()}
 else if(e.key==='Backspace'&&ta.selectionStart===0&&ta.selectionEnd===0){
  if(it.indent){e.preventDefault();it.indent=0;renderEdList(it.id,0);changed();return}
  const prevEl=ta.closest('.li').previousElementSibling,prev=prevEl?.dataset.iid&&cur.items.find(i=>i.id===prevEl.dataset.iid);if(!prev)return;
  e.preventDefault();const p=prev.text.length;prev.text+=it.text;cur.items.splice(idx,1);renderEdList(prev.id,p);changed()}
 else if(mod&&e.key===']'){e.preventDefault();if(idx>0){it.indent=1;renderEdList(it.id,ta.selectionStart);changed()}}
 else if(mod&&e.key==='['){e.preventDefault();it.indent=0;renderEdList(it.id,ta.selectionStart);changed()}
 else if(e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();const j=idx+(e.key==='ArrowUp'?-1:1);if(j<0||j>=cur.items.length)return;[cur.items[idx],cur.items[j]]=[cur.items[j],cur.items[idx]];renderEdList(it.id,ta.selectionStart);changed()}});
L.addEventListener('pointerdown',e=>{const d=e.target.closest('.drag');if(d)d.closest('.li').draggable=true});
L.addEventListener('dragstart',e=>{const li=e.target.closest?.('.li[data-iid]');if(li){dragIid=li.dataset.iid;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','')}});
L.addEventListener('dragover',e=>{if(dragIid&&e.target.closest('.li[data-iid]'))e.preventDefault()});
L.addEventListener('drop',e=>{const t=e.target.closest('.li[data-iid]');if(!dragIid||!t)return;e.preventDefault();const a=cur.items.findIndex(i=>i.id===dragIid),[it]=cur.items.splice(a,1),b=cur.items.findIndex(i=>i.id===t.dataset.iid);cur.items.splice(b+(a<=b?1:0),0,it);dragIid=null;renderEdList();changed()});
L.addEventListener('dragend',()=>{dragIid=null;$$('#edList .li').forEach(l=>l.draggable=false)});
const M=$('#main');
M.addEventListener('dragstart',e=>{const c=e.target.closest?.('.card');if(c){dragId=c.dataset.id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','');c.classList.add('dragging')}});
M.addEventListener('dragover',e=>{if(dragId&&e.target.closest('.card'))e.preventDefault()});
M.addEventListener('drop',e=>{const t=e.target.closest('.card');if(!dragId||!t)return;e.preventDefault();moveNote(dragId,t.dataset.id)});
M.addEventListener('dragend',()=>{dragId=null;$$('.card.dragging').forEach(c=>c.classList.remove('dragging'))});
M.addEventListener('contextmenu',e=>{const c=e.target.closest('.card');if(c&&matchMedia('(hover:none)').matches){e.preventDefault();act('sel',c)}});
document.addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files'))e.preventDefault()});
document.addEventListener('drop',e=>{const f=[...(e.dataTransfer?.files||[])].filter(f=>f.type.startsWith('image/'));if(!f.length)return;e.preventDefault();
 if($('#ed').open&&cur&&!cur.trashedAt)addImages(f,cur);else if(!topDlg()){const n=newNote();addImages(f,n).then(()=>byId(n.id)&&openEd(n))}});
$('#imgIn').addEventListener('change',async e=>{const f=[...e.target.files];e.target.value='';if(!f.length)return;
 if(imgFor==='new'){const n=newNote();await addImages(f,n);if(byId(n.id))openEd(n)}else if(imgFor)addImages(f,imgFor)});
$('#ob').addEventListener('cancel',e=>e.preventDefault());
$('#pop').addEventListener('toggle',e=>{if(e.newState!=='closed')return;if(previewing){previewing=false;render();if(cur)renderEd()}
 if(!$('#pop').matches(':popover-open')&&(document.activeElement===document.body||!document.activeElement)&&popBtn?.isConnected)popBtn.focus({preventScroll:true})});
matchMedia('(max-width:1000px)').addEventListener('change',e=>{navOpen=!e.matches;renderNav()});
$('#impIn').addEventListener('change',e=>{const f=[...e.target.files];e.target.value='';if(f.length)importFiles(f)});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>render());

// ---------- start ----------
(async()=>{
 notes=(await idbDo('notes',s=>s.getAll()))||[];
 const m=await idbDo('kv',s=>s.get('meta'));if(m)meta={...meta,...m,settings:{...meta.settings,...m.settings}};
 notes.forEach(n=>{n.versions??=[];n.audio??=[];n.drawings??=[];n.images??=[]});
 notes.filter(n=>n.trashedAt&&!n.deleted&&Date.now()-n.trashedAt>7*864e5).forEach(purge);
 await loadFiles();
 if(!S().onboarded){if(notes.length){S().onboarded=true;saveMeta()}else showOb('1')}
 applyTheme();render();tick();
 if(meta.lock?.app)await showLock();
 const u=new URLSearchParams(location.search);if(u.has('shared'))try{const c=await caches.open('share'),r=await c.match('shared');if(r){for(const[k,v]of Object.entries(await r.json()))u.set(k,v);if(S().onboarded)await c.delete('shared')}}catch{}
 const txt=[u.get('text'),u.get('url')].filter(Boolean).join('\n');
 if(u.size)history.replaceState(null,'',location.pathname);
 if(S().onboarded&&(u.has('new')||u.has('title')||txt)){const n=newNote(u.get('new')==='list');n.title=(u.get('title')||'').slice(0,200);openEd(n);addText(n,txt);history.replaceState(null,'',location.pathname)}
 if(!window.claude&&isSecureContext&&location.protocol!=='file:'){document.head.insertAdjacentHTML('beforeend','<link rel="manifest" href="manifest.webmanifest">');navigator.serviceWorker?.register('sw.js').catch(()=>{})}setInterval(tick,20000);
})();
