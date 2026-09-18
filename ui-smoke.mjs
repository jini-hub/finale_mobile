import assert from 'node:assert/strict';

const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
globalThis.structuredClone ??= x=>JSON.parse(JSON.stringify(x));
let _hash=''; globalThis.location={get hash(){return _hash},set hash(v){_hash=String(v).startsWith('#')?String(v):'#'+String(v)}};
let hashHandler=null;
globalThis.addEventListener=(name,fn)=>{if(name==='hashchange')hashHandler=fn};
globalThis.scrollTo=()=>{};
globalThis.requestAnimationFrame=(fn)=>fn();
globalThis.URL={createObjectURL:()=> 'blob:test',revokeObjectURL:()=>{}};
globalThis.Blob=class {constructor(parts,opts){this.parts=parts;this.opts=opts}};
const appNode={innerHTML:''};
const bodyNode={insertAdjacentHTML:()=>{}};
let chatInput={value:''};
let aiInput={value:''};
const nullNode={remove:()=>{},scrollTop:0,scrollHeight:0};
globalThis.document={
 body:bodyNode,
 querySelector(sel){
   if(sel==='#app') return appNode;
   if(sel==='#chat-input') return chatInput;
   if(sel==='#ai-input') return aiInput;
   if(sel==='#chat-body,#ai-body') return nullNode;
   return null;
 },
 createElement(){return {click(){},set href(v){},set download(v){}}}
};
globalThis.window=globalThis;

await import('./app.js');
assert.match(appNode.innerHTML,/Finale/);
assert.match(appNode.innerHTML,/상속 Case OS/);

location.hash='#experts'; hashHandler();
assert.match(appNode.innerHTML,/전문가 상담/);
assert.match(appNode.innerHTML,/채팅 상담/);

window.payAndOpen('tax1');
hashHandler();
assert.match(appNode.innerHTML,/김○○ 세무사/);
assert.match(appNode.innerHTML,/상담 진행 중/);
chatInput={value:'상속세 사전증여가 궁금합니다.'};
window.sendChat(JSON.parse(store.get('finaleCaseOS_v5')).cases[0].chats[0].id);
await new Promise(r=>setTimeout(r,850));
const saved=JSON.parse(store.get('finaleCaseOS_v5'));
assert.equal(saved.cases[0].chats.length,1);
assert(saved.cases[0].chats[0].messages.some(m=>m.text==='상속세 사전증여가 궁금합니다.'));
assert(saved.cases[0].chats[0].messages.some(m=>m.role==='expert' && m.text.includes('DEMO 답변')));

location.hash='#experts'; hashHandler();
assert.match(appNode.innerHTML,/진행 중 상담/);
window.openChat(saved.cases[0].chats[0].id); hashHandler();
assert.match(appNode.innerHTML,/상속세 사전증여가 궁금합니다/);

location.hash='#tax'; hashHandler();
assert.match(appNode.innerHTML,/상속세 예상계산/);
assert.match(appNode.innerHTML,/예상 산출세액/);

console.log('Finale UI smoke test: PASS');
