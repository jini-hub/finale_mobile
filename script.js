const KEY="finale_case_v2";
const today=new Date();

const defaultState={
  deceased:{name:"",deathDate:"",address:"",resident:true},
  family:[],
  assets:[],
  debts:[],
  choice:"",
  checked:{},
  notes:"",
  division:[],
  will:{exists:false,type:"",date:"",executor:""},
  settings:{disclaimerAccepted:false}
};
let state=load();

function load(){try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return structuredClone(defaultState)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));updateDrawer();toast("저장했습니다.");}
function money(n){return new Intl.NumberFormat("ko-KR").format(Math.round(Number(n)||0))+"원"}
function num(v){return Number(String(v||"").replaceAll(",",""))||0}
function fmtInput(v){return new Intl.NumberFormat("ko-KR").format(num(v))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function daysFrom(dateStr){if(!dateStr)return null; const d=new Date(dateStr+"T00:00:00"); return Math.ceil((d-new Date(today.getFullYear(),today.getMonth(),today.getDate()))/86400000)}
function addMonths(dateStr,m){if(!dateStr)return "";const d=new Date(dateStr+"T00:00:00");d.setMonth(d.getMonth()+m);return d.toISOString().slice(0,10)}
function route(){return location.hash.replace("#","")||"dashboard"}
function go(r){location.hash="#"+r}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function updateDrawer(){const el=document.querySelector("#drawerStatus");if(!el)return;el.textContent=state.deceased.deathDate?`사망일 ${state.deceased.deathDate}`:"진행 전"}
function page(title,sub,body,back="dashboard"){return `<div class="row between"><div><h1>${title}</h1>${sub?`<div class="sub">${sub}</div>`:""}</div>${back?`<button class="btn small" data-route="${back}">←</button>`:""}</div>${body}`}
function sectionTitle(t,s=""){return `<div class="row between" style="margin:18px 0 9px"><h2 style="margin:0">${t}</h2>${s?`<span class="sub">${s}</span>`:""}</div>`}

function render(){
  const r=route(); const v=document.querySelector("#view");
  const routes={dashboard,casePage:casePage,case:casePage,family,assets,decision,tax,division,will,documents,guide,expert,mypage,settings,propertyDetail:assets,legalNotice:guide};
  v.innerHTML=(routes[r]||dashboard)();
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.route===r || (r==="case"&&b.dataset.route==="case") || (["family","decision","division"].includes(r)&&b.dataset.route==="case")));
  updateDrawer();
}
window.addEventListener("hashchange",render);

function dashboard(){
 const d=state.deceased.deathDate;
 const days=daysFrom(d), totalAssets=state.assets.reduce((a,x)=>a+num(x.amount),0), totalDebt=state.debts.reduce((a,x)=>a+num(x.amount),0);
 const steps=[
  ["사망자 정보",!!d,"deceased"],
  ["상속인 확인",state.family.length>0,"family"],
  ["재산·채무 조사",state.assets.length+state.debts.length>0,"assets"],
  ["승인·포기 판단",!!state.choice,"decision"],
  ["세금·신고 검토",false,"tax"],
  ["분할·등기",false,"division"]
 ];
 const done=steps.filter(x=>x[1]).length, pct=Math.round(done/steps.length*100);
 return `
 <div class="card hero">
   <div class="sub">상속 원스톱 관리</div><h1>복잡한 상속을<br>한 곳에서 정리하세요.</h1>
   <p class="sub">가족관계 → 재산·채무 → 승인·포기 → 세금 → 분할·등기 순으로 진행합니다.</p>
   <button class="btn" data-route="${d?"case":"case"}" style="margin-top:8px">상속 사건 시작 / 계속하기 →</button>
 </div>
 <div class="card">
   <div class="row between"><b>진행률</b><b>${pct}%</b></div>
   <div class="progress" style="margin:9px 0 12px"><i style="width:${pct}%"></i></div>
   <div class="stepper">${steps.map(x=>`<div class="${x[1]?"done":""}"></div>`).join("")}</div>
   <div class="sub">${d?`사망일 ${d}${days!==null&&days>=0?` · 상속개시 후 ${Math.abs(Math.ceil((new Date(d)-new Date())/86400000))}일`:``}`:"사망자 정보를 먼저 입력하세요."}</div>
 </div>
 ${days!==null?deadlineCard(d,days):`<div class="notice info">⚠️ 실제 사건이라면 사망일을 먼저 입력하세요. 상속포기·한정승인 등에는 원칙적으로 3개월의 기간이 적용됩니다.</div>`}
 <div class="grid2">
   ${quick("👨‍👩‍👧","상속인","가족관계와 상속순위", "family")}
   ${quick("💰","재산·채무","자산과 부채 목록화","assets")}
   ${quick("⚖️","승인·포기","단순승인·한정승인·포기","decision")}
   ${quick("🧾","상속세","예상 세액 계산","tax")}
 </div>
 ${sectionTitle("현재 입력 요약")}
 <div class="grid3">
  <div class="kpi"><span>상속재산</span><b>${money(totalAssets)}</b></div>
  <div class="kpi"><span>상속채무</span><b>${money(totalDebt)}</b></div>
  <div class="kpi"><span>상속인</span><b>${state.family.length}명</b></div>
 </div>
 <div class="notice warn"><b>중요:</b> Finale는 법률·세무 정보를 정리하고 절차를 안내하는 도구입니다. 법원·등기소·국세청 신고를 자동으로 완료하거나 변호사·법무사·세무사의 법률/세무 자문을 대체하지 않습니다.</div>`;
}
function quick(ic,t,s,r){return `<button class="icon-card" data-route="${r}"><span class="emoji">${ic}</span><span><b>${t}</b><span>${s}</span></span></button>`}
function deadlineCard(d,days){
 const ren=days<0?"danger":days<=14?"warn":"ok";
 return `<div class="card"><div class="row between"><b>상속 승인·포기 기한</b><span class="badge ${ren}">${days<0?"기한 경과":days+"일 남음"}</span></div>
 <p class="sub" style="margin-top:7px">원칙적으로 상속개시 있음을 안 날부터 3개월입니다. 단순한 사망일만으로 모든 사건의 기산점을 확정할 수 있는 것은 아니므로 예외사유가 있으면 전문가 확인이 필요합니다.</p>
 <button class="btn small" data-route="decision">판단 도구 열기 →</button></div>`;
}

function casePage(){
 return page("상속 사건 관리","처음부터 끝까지 순서대로 진행하세요.",`
 <div class="card">
  <div class="row between"><b>STEP 1 · 사망자</b><span class="badge ${state.deceased.deathDate?"ok":""}">${state.deceased.deathDate?"입력완료":"미입력"}</span></div>
  <p class="sub">사망일과 기본 정보를 입력하면 주요 기한을 계산합니다.</p><button class="btn primary full" data-route="caseInfo">사망자 정보 입력</button>
 </div>
 <div class="card">
  <div class="row between"><b>STEP 2 · 상속인</b><span class="badge ${state.family.length?"ok":""}">${state.family.length}명</span></div>
  <p class="sub">배우자·직계비속·직계존속·형제자매 등 가족관계를 입력합니다.</p><button class="btn full" data-route="family">상속인 확인</button>
 </div>
 <div class="card">
  <div class="row between"><b>STEP 3 · 재산·채무</b><span class="badge">${state.assets.length+state.debts.length}건</span></div>
  <p class="sub">부동산·예금·주식·보험·자동차와 대출·보증·세금 등으로 나누어 기록합니다.</p><button class="btn full" data-route="assets">재산·채무 입력</button>
 </div>
 <div class="card">
  <div class="row between"><b>STEP 4 · 승인·포기</b><span class="badge ${state.choice?"ok":""}">${state.choice||"판단 전"}</span></div>
  <p class="sub">상속재산과 채무를 비교하고 법정기간을 확인합니다.</p><button class="btn full" data-route="decision">판단 시작</button>
 </div>
 <div class="card">
  <div class="row between"><b>STEP 5 · 세금·분할·서류</b><span class="badge">통합</span></div>
  <div class="grid2">
   <button class="btn" data-route="tax">상속세</button><button class="btn" data-route="division">재산분할</button>
   <button class="btn" data-route="documents">서류센터</button><button class="btn" data-route="will">유언·유류분</button>
  </div>
 </div>`);
}

function caseInfo(){
 const d=state.deceased;
 return page("사망자 정보","사망일을 기준으로 절차와 기한을 계산합니다.",`
 <div class="card">
  <div class="field"><label class="required">성명</label><input class="input" id="dName" value="${esc(d.name)}" placeholder="홍길동"></div>
  <div class="field"><label class="required">사망일</label><input type="date" class="input" id="dDate" value="${esc(d.deathDate)}"></div>
  <div class="field"><label>사망 당시 주소</label><input class="input" id="dAddr" value="${esc(d.address)}" placeholder="서울특별시 ○○구"></div>
  <label class="check"><input type="checkbox" id="dResident" ${d.resident?"checked":""}><span>사망 당시 국내 거주자로 알고 있음</span></label>
  <div class="notice info">사망일은 주민등록·기본증명서 등 공적자료로 확인하세요. 실제 기산점·관할은 사건에 따라 달라질 수 있습니다.</div>
  <button class="btn primary full" data-action="save-deceased">저장</button>
 </div>`);
}

function family(){
 const rows=state.family.map((x,i)=>`<li><div class="row between"><div><b>${esc(x.name)}</b> <span class="badge">${esc(x.rel)}</span><div class="sub">${esc(x.birth||"")} · ${x.alive?"생존":"사망"}${x.children?" · 자녀 있음":""}</div></div><button class="btn small danger" data-action="remove-family" data-index="${i}">삭제</button></div></li>`).join("");
 return page("상속인·가족관계","상속순위 판단의 기초자료입니다.",`
 <div class="notice warn"><b>주의:</b> 가족관계만 입력했다고 법적 상속인이 확정되는 것은 아닙니다. 배우자의 법률상 혼인관계, 대습상속, 입양·친양자, 상속결격·상속권상실 등 예외를 확인해야 합니다.</div>
 <div class="card">
  <h3>가족 구성원 추가</h3>
  <div class="field"><label>성명</label><input id="fName" class="input" placeholder="홍○○"></div>
  <div class="field"><label>관계</label><select id="fRel" class="select">${["배우자","자녀","손자녀","부","모","조부모","형제자매","4촌 이내 방계혈족","기타"].map(x=>`<option>${x}</option>`).join("")}</select></div>
  <div class="field"><label>생년월일(선택)</label><input id="fBirth" type="date" class="input"></div>
  <label class="check"><input id="fAlive" type="checkbox" checked><span>생존</span></label>
  <label class="check" style="margin-top:8px"><input id="fChildren" type="checkbox"><span>사망한 경우 직계비속(자녀 등)이 있음</span></label>
  <button class="btn primary full" style="margin-top:12px" data-action="add-family">추가</button>
 </div>
 <div class="card"><h3>입력된 가족</h3><ul class="list">${rows||`<li class="empty">아직 입력된 가족이 없습니다.</li>`}</ul></div>
 <div class="card"><h3>법정 상속순위</h3><ol class="sub"><li>직계비속</li><li>직계존속</li><li>형제자매</li><li>4촌 이내 방계혈족</li></ol><p class="sub">배우자는 직계비속 또는 직계존속이 있는 경우 공동상속인이고, 없는 경우 단독상속인이 되는 구조입니다.</p></div>
 `);
}

function assets(){
 const totalA=state.assets.reduce((a,x)=>a+num(x.amount),0),totalD=state.debts.reduce((a,x)=>a+num(x.amount),0);
 return page("상속재산·채무","누락을 줄이기 위해 자산과 채무를 각각 기록하세요.",`
 <div class="grid2">
  <div class="kpi"><span>재산 합계</span><b>${money(totalA)}</b></div><div class="kpi"><span>채무 합계</span><b>${money(totalD)}</b></div>
 </div>
 ${assetForm("재산","asset")}
 ${assetList("재산",state.assets,"asset")}
 ${assetForm("채무","debt")}
 ${assetList("채무",state.debts,"debt")}
 <div class="notice info">재산가액은 상속세 평가와 민사상 분할에서 기준이 달라질 수 있습니다. 부동산·비상장주식·보험·퇴직금 등은 별도 평가가 필요할 수 있습니다.</div>`);
}
function assetForm(title,type){
 const cats=type==="asset"?["부동산","예금·현금","주식·펀드","보험","자동차","보증금·임차권","사업체","기타"]:["대출","카드·미지급금","세금·공과금","보증채무","소송·손해배상","기타"];
 return `<div class="card"><h3>${title} 추가</h3><div class="field"><label>분류</label><select id="${type}Cat" class="select">${cats.map(x=>`<option>${x}</option>`).join("")}</select></div><div class="field"><label>명칭/기관</label><input id="${type}Name" class="input" placeholder="${type==="asset"?"아파트·은행·주식 등":"은행·카드사·채권자 등"}"></div><div class="field"><label>금액</label><input id="${type}Amount" class="input" inputmode="numeric" placeholder="0"></div><button class="btn primary full" data-action="add-${type}">추가</button></div>`;
}
function assetList(title,arr,type){
 return `<div class="card"><h3>${title} 목록</h3>${arr.length?`<div class="table-wrap"><table class="table"><thead><tr><th>분류</th><th>명칭</th><th>금액</th><th></th></tr></thead><tbody>${arr.map((x,i)=>`<tr><td>${esc(x.cat)}</td><td>${esc(x.name)}</td><td>${money(x.amount)}</td><td><button class="btn small" data-action="remove-${type}" data-index="${i}">삭제</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">${title}가 없습니다.</div>`}</div>`;
}

function decision(){
 const A=state.assets.reduce((a,x)=>a+num(x.amount),0),D=state.debts.reduce((a,x)=>a+num(x.amount),0),net=A-D;
 const days=daysFrom(state.deceased.deathDate);
 return page("승인·포기 판단","재산보다 채무가 큰지, 기한이 남았는지를 먼저 확인합니다.",`
 ${!state.deceased.deathDate?`<div class="notice danger"><b>사망일 미입력</b><br>3개월 관련 기한을 계산할 수 없습니다. 사망자 정보를 먼저 입력하세요.</div>`:""}
 <div class="grid3"><div class="kpi"><span>재산</span><b>${money(A)}</b></div><div class="kpi"><span>채무</span><b>${money(D)}</b></div><div class="kpi"><span>차액</span><b>${money(net)}</b></div></div>
 ${days!==null?`<div class="notice ${days<0?"danger":days<=14?"warn":"info"}"><b>현재 계산상 남은 일수: ${days<0?"기한 경과":days+"일"}</b><br>민법상 원칙은 상속개시 있음을 안 날부터 3개월입니다. 사망일과 항상 동일하다고 단정하지 마세요.</div>`:""}
 <div class="card"><h3>선택지</h3>
  ${decisionOption("단순승인","상속재산뿐 아니라 상속채무도 승계합니다.","accept",net>=0)}
  ${decisionOption("한정승인","상속으로 취득할 재산의 한도에서 피상속인의 채무와 유증을 변제하는 방식입니다.","limited",true)}
  ${decisionOption("상속포기","상속을 받지 않겠다는 의사표시입니다. 다른 상속인에게 영향이 생길 수 있습니다.","renounce",true)}
 </div>
 <div class="notice danger"><b>자동 추천 금지 영역</b><br>이 화면은 판단자료를 정리할 뿐 최종 법률판단을 자동 결정하지 않습니다. 특히 상속포기 후 다음 순위 상속인 문제, 이미 재산을 처분한 경우, 채무를 뒤늦게 발견한 경우, 미성년 상속인, 대습상속은 전문가 확인이 필요합니다.</div>`);
}
function decisionOption(t,desc,key,enabled){
 return `<div class="card" style="box-shadow:none;margin:8px 0;border:1px solid ${state.choice===t?"#1769d1":"#e5e9ef"}"><div class="row between"><div><b>${t}</b><p class="sub" style="margin:5px 0 0">${desc}</p></div><button class="btn small ${state.choice===t?"primary":""}" ${enabled?"":"disabled"} data-action="choose" data-choice="${t}">${state.choice===t?"선택됨":"선택"}</button></div></div>`;
}

function tax(){
 const A=state.assets.reduce((a,x)=>a+num(x.amount),0),D=state.debts.reduce((a,x)=>a+num(x.amount),0);
 return page("상속세 예상 계산","세법상 평가·공제·사전증여 등을 모두 반영한 신고세액과는 다를 수 있습니다.",`
 <div class="card">
  <div class="field"><label>상속재산 총액</label><input id="taxA" class="input" inputmode="numeric" value="${A?fmtInput(A):""}" placeholder="0"></div>
  <div class="field"><label>공제 가능한 채무·장례비 등(예상)</label><input id="taxD" class="input" inputmode="numeric" value="${D?fmtInput(D):""}" placeholder="0"></div>
  <div class="field"><label>기타 공제·사전증여 등 조정액</label><input id="taxAdj" class="input" inputmode="numeric" value="0"></div>
  <button class="btn primary full" data-action="calc-tax">간이 계산</button>
  <div id="taxResult" class="notice info" style="display:none"></div>
 </div>
 <div class="card"><h3>신고기한</h3><p class="sub">국세청 안내 기준 일반적인 경우 상속개시일이 속하는 달의 말일부터 6개월 이내, 피상속인이나 상속인이 외국에 주소를 둔 경우 등은 9개월 이내입니다.</p><button class="btn small" data-route="documents">신고 관련 서류 보기 →</button></div>
 <div class="notice warn"><b>주의:</b> 현재 계산기는 교육·사전검토용입니다. 배우자공제, 일괄공제, 금융재산공제, 가업상속공제, 사전증여재산, 보험금·퇴직금, 평가방법, 세대생략 등 실제 신고요건을 모두 반영하지 않습니다.</div>
 `);
}

function division(){
 const people=state.family.filter(x=>x.alive);
 const rows=state.division.map((x,i)=>`<tr><td>${esc(x.name)}</td><td>${money(x.amount)}</td><td><button class="btn small" data-action="remove-division" data-index="${i}">삭제</button></td></tr>`).join("");
 return page("상속재산분할","공동상속인 간 협의 내용을 기록하는 작업공간입니다.",`
 <div class="notice info">공동상속인은 협의로 상속재산을 분할할 수 있지만, 협의가 성립하지 않거나 특별수익·기여분·유언·유류분 등이 문제되면 별도 법률검토가 필요합니다.</div>
 <div class="card"><h3>분할안 작성</h3><div class="field"><label>상속인</label><input id="divName" class="input" placeholder="홍○○"></div><div class="field"><label>배분 금액</label><input id="divAmount" class="input" inputmode="numeric" placeholder="0"></div><button class="btn primary full" data-action="add-division">배분안 추가</button></div>
 <div class="card"><h3>현재 배분안</h3>${rows?`<table class="table"><thead><tr><th>상속인</th><th>배분</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:`<div class="empty">아직 분할안이 없습니다.</div>`}
 ${state.division.length?`<button class="btn blue full" style="margin-top:12px" data-action="division-draft">협의분할 초안 보기</button>`:""}</div>
 <div class="card"><h3>검토해야 할 쟁점</h3><ul class="sub"><li>유언 또는 유증 존재 여부</li><li>특별수익(생전 증여 등)</li><li>기여분</li><li>유류분 침해 여부</li><li>부동산·주식 등 평가방법</li><li>공동상속인 전원의 의사·서명</li></ul></div>
 `);
}

function will(){
 return page("유언·유류분","유언의 존재와 법정상속인의 권리를 함께 검토합니다.",`
 <div class="card">
  <h3>유언 정보</h3>
  <label class="check"><input id="wExists" type="checkbox" ${state.will.exists?"checked":""}><span>유언이 있다고 알고 있음</span></label>
  <div class="field" style="margin-top:10px"><label>유언 방식</label><select id="wType" class="select"><option value="">선택</option>${["자필증서","공정증서","비밀증서","구수증서","기타"].map(x=>`<option ${state.will.type===x?"selected":""}>${x}</option>`).join("")}</select></div>
  <div class="field"><label>작성일</label><input id="wDate" type="date" class="input" value="${state.will.date||""}"></div>
  <div class="field"><label>유언집행자(알고 있는 경우)</label><input id="wExec" class="input" value="${esc(state.will.executor||"")}"></div>
  <button class="btn primary full" data-action="save-will">저장</button>
 </div>
 <div class="card"><h3>2026년 유류분 핵심</h3>
  <p class="sub">현재 시행 민법 제1112조 기준 유류분 권리자는 직계비속·배우자·직계존속이며, 형제자매에 대한 제4호는 삭제되었습니다. 직계비속과 배우자는 법정상속분의 1/2, 직계존속은 1/3입니다.</p>
  <button class="btn small" data-action="reserved-calc">간이 유류분 계산</button>
 </div>
 <div class="notice danger">유류분은 생전증여, 유증, 특별수익, 상속채무, 기여분 등 여러 요소가 결합될 수 있습니다. 앱의 단순 계산만으로 청구 가능 여부를 확정하지 마세요.</div>
 `);
}

function documents(){
 const docs=[
 ["가족관계","기본증명서(상세)","피상속인·상속인 관계 확인","family"],
 ["가족관계","가족관계증명서(상세)","배우자·직계비속 등 확인","family"],
 ["부동산","등기사항증명서","부동산 권리관계 확인","assets"],
 ["금융","금융재산·채무 조회자료","예금·대출 등 확인","assets"],
 ["세무","상속재산 평가자료","상속세 신고용 자료","tax"],
 ["법원","상속포기/한정승인 관련 서류","관할 가정법원 절차용","decision"],
 ["분할","상속재산분할협의서","공동상속인 협의 내용","division"],
 ["유언","유언 원본/공정증서 등","유언 존재 및 방식 확인","will"]
 ];
 return page("서류센터","사건 단계별로 준비할 자료를 관리하세요.",`
 <div class="notice info">기관별 발급서류와 제출요건은 사건·관할에 따라 달라질 수 있습니다. 앱은 체크리스트를 제공하며 실제 제출 전 기관 안내를 재확인하세요.</div>
 <div class="card"><ul class="list">${docs.map((d,i)=>`<li><label class="check"><input type="checkbox" ${state.checked["doc"+i]?"checked":""} data-doc="${i}"><span><b>${d[1]}</b><br><span class="sub">${d[0]} · ${d[2]}</span></span></label></li>`).join("")}</ul></div>
 <div class="card"><h3>서류 진행률</h3><div class="progress"><i style="width:${Math.round(Object.values(state.checked).filter(Boolean).length/docs.length*100)}%"></i></div><p class="sub" style="margin:7px 0">${Object.values(state.checked).filter(Boolean).length}/${docs.length} 완료</p></div>
 `);
}

function guide(){
 return page("상속 법률 가이드","대한민국 상속 절차를 앱에서 이해하기 쉽게 정리합니다.",`
 <div class="card"><h3>① 상속은 언제 시작되나요?</h3><p class="sub">피상속인의 사망으로 상속이 개시합니다. 법정상속인은 민법상 순위와 배우자 규정에 따라 판단합니다.</p></div>
 <div class="card"><h3>② 승인·포기는 언제까지?</h3><p class="sub">원칙적으로 상속인은 상속개시 있음을 안 날부터 3개월 내 단순승인·한정승인·포기를 할 수 있습니다. 법원이 기간을 연장할 수 있고, 특별한 구제 규정도 있으므로 기간을 놓쳤다면 즉시 전문가 확인이 필요합니다.</p></div>
 <div class="card"><h3>③ 상속세는?</h3><p class="sub">국세청 안내상 일반적인 경우 상속개시일이 속하는 달의 말일부터 6개월 이내 신고합니다. 외국 주소 등 특별한 경우 9개월 규정이 적용될 수 있습니다.</p></div>
 <div class="card"><h3>④ 유류분은?</h3><p class="sub">2026년 3월 17일 시행 민법 기준 직계비속·배우자·직계존속이 권리자이며 형제자매는 제외됩니다. 구체적인 반환범위는 별도 산정이 필요합니다.</p></div>
 <div class="card"><h3>⑤ 상속재산분할</h3><p class="sub">공동상속인이 협의하여 분할할 수 있습니다. 협의가 되지 않거나 특별수익·기여분 등 쟁점이 있으면 가정법원 절차를 검토해야 합니다.</p></div>
 <div class="notice warn"><b>법률 업데이트 원칙</b><br>이 앱은 법령 변경에 따라 콘텐츠를 갱신할 수 있도록 설계해야 합니다. 법률 텍스트를 하드코딩한 채 장기간 방치하지 말고 법제처·국세청 등 공식 출처의 최신 시행법령을 기준으로 검수하세요.</div>
 <p class="footer-note">본 가이드는 일반적인 정보 제공용이며 개별 사건에 대한 법률의견이 아닙니다.</p>
 `);
}

function expert(){
 return page("전문가 연결","분쟁 가능성이 높은 사건은 전문가 검토를 권장합니다.",`
 <div class="card"><h3>변호사</h3><p class="sub">상속재산분할, 유류분, 상속회복, 유언무효 등 분쟁·소송이 예상되는 경우</p><button class="btn primary full" data-action="expert-request" data-type="변호사">상담 요청 정보 만들기</button></div>
 <div class="card"><h3>법무사</h3><p class="sub">상속등기, 법원 제출서류 작성·절차 지원이 필요한 경우</p><button class="btn full" data-action="expert-request" data-type="법무사">상담 요청 정보 만들기</button></div>
 <div class="card"><h3>세무사</h3><p class="sub">상속세 신고, 재산 평가, 공제·사전증여 등 세무검토가 필요한 경우</p><button class="btn full" data-action="expert-request" data-type="세무사">상담 요청 정보 만들기</button></div>
 <div class="notice danger">Finale가 전문가를 사칭하거나 법률·세무 대행을 직접 제공하는 형태로 운영되어서는 안 됩니다. 실제 서비스화 시 전문가 자격·광고·중개 관련 법령과 개인정보 처리체계를 별도 검토해야 합니다.</div>
 `);
}

function mypage(){
 return page("내 정보","사건 데이터는 이 기기의 브라우저 저장소에 보관됩니다.",`
 <div class="card"><b>로컬 데이터</b><p class="sub">현재 버전은 서버 없이 localStorage에 저장합니다. 브라우저 삭제·기기 변경 시 데이터가 사라질 수 있습니다.</p><button class="btn small" data-action="export">내 데이터 백업(JSON)</button></div>
 <div class="card"><h3>개인정보 최소수집 원칙</h3><p class="sub">주민등록번호, 계좌 비밀번호, 인증서 비밀번호 등 불필요한 고위험 정보는 입력하지 마세요.</p><button class="btn small" data-route="settings">개인정보 설정 →</button></div>
 <div class="card"><h3>서비스 고지</h3><p class="sub">Finale는 법률·세무 정보관리 도구입니다. 실제 신고·소송·등기 결과를 보증하지 않습니다.</p></div>
 `);
}

function settings(){
 return page("설정","서비스 안전장치를 관리합니다.",`
 <div class="card">
  <label class="check"><input type="checkbox" id="sDisclaimer" ${state.settings.disclaimerAccepted?"checked":""}><span>법률·세무 정보는 일반 정보이며 개별 자문이 아니라는 점을 확인했습니다.</span></label>
  <button class="btn primary full" style="margin-top:12px" data-action="save-settings">저장</button>
 </div>
 <div class="card"><h3>데이터 초기화</h3><p class="sub">모든 사건 입력값을 삭제합니다. 실행 전 JSON 백업을 권장합니다.</p><button class="btn danger full" data-action="reset">전체 데이터 삭제</button></div>
 `);
}

function searchModal(){
 openModal(`<div class="modal-box"><div class="row between"><h2>기능 검색</h2><button class="icon-btn" data-action="close-modal">×</button></div><input id="searchInput" class="input" placeholder="예: 상속포기, 상속세, 유류분"><div id="searchResults"></div></div>`);
 const input=document.querySelector("#searchInput"); input.focus(); input.oninput=()=>{
  const q=input.value.trim(); const items=[["상속인·가족관계","family"],["재산·채무","assets"],["승인·포기","decision"],["상속세","tax"],["상속재산분할","division"],["유언·유류분","will"],["서류센터","documents"],["법률 가이드","guide"],["전문가 연결","expert"]];
  document.querySelector("#searchResults").innerHTML=q?items.filter(x=>x[0].includes(q)).map(x=>`<button class="icon-card" style="width:100%;margin:6px 0" data-route="${x[1]}" data-action="close-modal">${x[0]}</button>`).join("")||`<div class="empty">검색 결과가 없습니다.</div>`:"";
 };
}
function openModal(html){document.querySelector("#modal").innerHTML=html;document.querySelector("#modal").classList.remove("hidden")}
function closeModal(){document.querySelector("#modal").classList.add("hidden");document.querySelector("#modal").innerHTML=""}

document.addEventListener("click",e=>{
 const r=e.target.closest("[data-route]"); if(r){const route=r.dataset.route;if(route==="caseInfo"){go("caseInfo");}else{go(route)}closeModal();return}
 const a=e.target.closest("[data-action]"); if(!a)return;
 const act=a.dataset.action;
 if(act==="menu")document.querySelector("#drawer").classList.remove("hidden");
 if(act==="close-menu")document.querySelector("#drawer").classList.add("hidden");
 if(act==="search")searchModal();
 if(act==="alerts")openModal(`<div class="modal-box"><div class="row between"><h2>알림</h2><button class="icon-btn" data-action="close-modal">×</button></div><div class="notice info">현재 입력된 사건에서 자동 알림이 필요한 항목을 이곳에 표시합니다.</div>${state.deceased.deathDate?`<p class="sub">상속 승인·포기 기한을 확인하세요.</p>`:"<p class=\"sub\">사망일을 입력하면 기한 알림을 계산합니다.</p>"}</div>`);
 if(act==="close-modal")closeModal();
 if(act==="save-deceased"){
  state.deceased={name:document.querySelector("#dName").value.trim(),deathDate:document.querySelector("#dDate").value,address:document.querySelector("#dAddr").value.trim(),resident:document.querySelector("#dResident").checked};
  if(!state.deceased.name||!state.deceased.deathDate)return toast("성명과 사망일은 필수입니다.");
  save();go("case");
 }
 if(act==="add-family"){
  const name=document.querySelector("#fName").value.trim(); if(!name)return toast("성명을 입력하세요.");
  state.family.push({name,rel:document.querySelector("#fRel").value,birth:document.querySelector("#fBirth").value,alive:document.querySelector("#fAlive").checked,children:document.querySelector("#fChildren").checked});save();render();
 }
 if(act==="remove-family"){state.family.splice(+a.dataset.index,1);save();render()}
 if(act==="add-asset"||act==="add-debt"){
  const type=act==="add-asset"?"asset":"debt", cat=document.querySelector("#"+type+"Cat").value,name=document.querySelector("#"+type+"Name").value.trim(),amount=num(document.querySelector("#"+type+"Amount").value);
  if(!name||amount<=0)return toast("명칭과 금액을 입력하세요.");
  state[type==="asset"?"assets":"debts"].push({cat,name,amount});save();render();
 }
 if(act==="remove-asset"){state.assets.splice(+a.dataset.index,1);save();render()}
 if(act==="remove-debt"){state.debts.splice(+a.dataset.index,1);save();render()}
 if(act==="choose"){state.choice=a.dataset.choice==="accept"?"단순승인":a.dataset.choice==="limited"?"한정승인":"상속포기";save();render()}
 if(act==="calc-tax"){
  const A=num(document.querySelector("#taxA").value),D=num(document.querySelector("#taxD").value),adj=num(document.querySelector("#taxAdj").value);
  const base=Math.max(0,A-D-adj);
  // 단순 누진세율 참고 계산: 실제 과세표준·공제 구조를 대체하지 않음.
  let tax=0;
  if(base<=100000000)tax=base*.1;
  else if(base<=500000000)tax=base*.2-10000000;
  else if(base<=1000000000)tax=base*.3-60000000;
  else if(base<=3000000000)tax=base*.4-160000000;
  else tax=base*.5-460000000;
  const el=document.querySelector("#taxResult");el.style.display="block";el.innerHTML=`<b>간이 과세표준: ${money(base)}</b><br>참고 계산세액: <b>${money(Math.max(0,tax))}</b><br><span class="sub">실제 상속세 신고세액은 각종 공제·평가·사전증여·세액공제 등을 반영해야 하므로 이 숫자를 신고세액으로 사용하면 안 됩니다.</span>`;
 }
 if(act==="add-division"){
  const name=document.querySelector("#divName").value.trim(),amount=num(document.querySelector("#divAmount").value);if(!name||amount<=0)return toast("상속인과 금액을 입력하세요.");
  state.division.push({name,amount});save();render();
 }
 if(act==="remove-division"){state.division.splice(+a.dataset.index,1);save();render()}
 if(act==="division-draft"){
  const total=state.division.reduce((s,x)=>s+x.amount,0);
  openModal(`<div class="modal-box"><div class="row between"><h2>상속재산분할 협의 초안</h2><button class="icon-btn" data-action="close-modal">×</button></div><p class="sub">아래 내용은 서식 초안일 뿐, 최종 계약서·등기서류로 바로 사용해서는 안 됩니다.</p><div class="card"><b>피상속인</b><p>${esc(state.deceased.name||"미입력")} / ${esc(state.deceased.deathDate||"미입력")}</p><b>분할 총액</b><p>${money(total)}</p>${state.division.map(x=>`<p>${esc(x.name)} : ${money(x.amount)}</p>`).join("")}</div><div class="notice warn">공동상속인 전원의 의사와 서명·인감·첨부서류 등 실제 제출요건은 등기·법원 절차에 맞춰 확인하세요.</div></div>`);
 }
 if(act==="save-will"){
  state.will={exists:document.querySelector("#wExists").checked,type:document.querySelector("#wType").value,date:document.querySelector("#wDate").value,executor:document.querySelector("#wExec").value.trim()};save();render()
 }
 if(act==="reserved-calc"){
  const eligible=state.family.filter(x=>["배우자","자녀","손자녀","부","모","조부모"].includes(x.rel)&&x.alive);
  openModal(`<div class="modal-box"><div class="row between"><h2>유류분 간이 안내</h2><button class="icon-btn" data-action="close-modal">×</button></div><p class="sub">2026년 시행 민법 제1112조 기준 권리자 후보를 표시합니다.</p>${eligible.length?eligible.map(x=>`<div class="icon-card" style="margin:6px 0"><b>${esc(x.name)}</b><span>${esc(x.rel)} · ${["배우자","자녀","손자녀"].includes(x.rel)?"법정상속분의 1/2":"법정상속분의 1/3"}</span></div>`).join(""):`<div class="empty">현재 입력된 유류분 권리자 후보가 없습니다.</div>`}<div class="notice danger">구체적인 유류분 부족액은 법정상속분, 증여·유증, 채무 및 기타 법정요소를 반영해야 합니다.</div></div>`);
 }
 if(act==="expert-request"){
  const type=a.dataset.type;
  openModal(`<div class="modal-box"><div class="row between"><h2>${type} 상담용 요약</h2><button class="icon-btn" data-action="close-modal">×</button></div><p class="sub">아래 내용을 복사해 전문가에게 전달할 수 있습니다.</p><textarea class="textarea" readonly>피상속인: ${state.deceased.name||"미입력"}
사망일: ${state.deceased.deathDate||"미입력"}
상속인: ${state.family.map(x=>x.name+"("+x.rel+")").join(", ")||"미입력"}
상속재산: ${money(state.assets.reduce((a,x)=>a+num(x.amount),0))}
상속채무: ${money(state.debts.reduce((a,x)=>a+num(x.amount),0))}
승인/포기 선택: ${state.choice||"미정"}
유언: ${state.will.exists?"있음":"없음/미확인"}

상담 요청 분야: ${type}</textarea><button class="btn primary full" style="margin-top:10px" data-action="copy-summary">복사</button></div>`);
 }
 if(act==="copy-summary"){const t=document.querySelector(".modal-box textarea");navigator.clipboard?.writeText(t.value);toast("복사했습니다.")}
 if(act==="export"){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="finale-inheritance-backup.json";link.click();URL.revokeObjectURL(url)
 }
 if(act==="reset"){if(confirm("모든 입력 데이터를 삭제할까요?")){localStorage.removeItem(KEY);state=load();toast("삭제했습니다.");render()}}
 if(act==="save-settings"){state.settings.disclaimerAccepted=document.querySelector("#sDisclaimer").checked;save();render()}
});
document.addEventListener("change",e=>{
 if(e.target.matches("[data-doc]")){state.checked["doc"+e.target.dataset.doc]=e.target.checked;localStorage.setItem(KEY,JSON.stringify(state));render()}
});
render();
