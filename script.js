function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}

function showTab(tabName) {
    const buttons = document.querySelectorAll('.check-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const contents = document.querySelectorAll('.check-content');
    contents.forEach(content => content.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
}

function formatNumber(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value) input.value = parseInt(value).toLocaleString();
}

function calculateInheritanceTax() {
    const asset = parseInt(document.getElementById('calc-asset').value.replace(/,/g, '') || 0);
    const debt = parseInt(document.getElementById('calc-debt').value.replace(/,/g, '') || 0);
    const deduction = parseInt(document.getElementById('calc-deduction').value.replace(/,/g, '') || 0);
    let taxBase = Math.max(0, asset - debt - deduction);
    let tax = 0;
    
    // 간이 세율 계산 로직
    if (taxBase <= 100000000) tax = taxBase * 0.1;
    else if (taxBase <= 500000000) tax = taxBase * 0.2 - 10000000;
    else if (taxBase <= 1000000000) tax = taxBase * 0.3 - 60000000;
    else if (taxBase <= 3000000000) tax = taxBase * 0.4 - 160000000;
    else tax = taxBase * 0.5 - 460000000;
    
    document.getElementById('calc-tax-amount').innerText = Math.floor(Math.max(0, tax)).toLocaleString() + '원';
    document.getElementById('calc-base').innerText = taxBase.toLocaleString();
    document.getElementById('calc-result').classList.add('show');
}

function sendMessage(type) {
    const input = document.getElementById('input-' + type);
    const msgArea = document.getElementById('msg-area-' + type);
    const text = input.value;
    
    if (!text.trim()) return;
    
    // 내 메시지 추가
    msgArea.insertAdjacentHTML('beforeend', `<div class="chat-bubble-row me"><div class="hstack"><div class="chat-time">방금</div><div class="chat-bubble me">${text}</div></div></div>`);
    input.value = '';
    msgArea.scrollTop = msgArea.scrollHeight;
    
    // 전문가 자동 응답 (1초 후)
    setTimeout(() => {
        const reply = type === 'lawyer' ? "등기 관련 서류는 '필요 서류 체크리스트'를 참고해주세요." : "상속세 공제 한도를 먼저 확인해보세요.";
        msgArea.insertAdjacentHTML('beforeend', `<div class="chat-bubble-row you"><div class="chat-profile">${type === 'lawyer' ? '👨‍⚖️' : '👩‍💼'}</div><div><div class="chat-name">${type === 'lawyer' ? '김법무 변호사' : '이세무 세무사'}</div><div class="hstack"><div class="chat-bubble you">${reply}</div><div class="chat-time">방금</div></div></div></div>`);
        msgArea.scrollTop = msgArea.scrollHeight;
    }, 1000);
}

function handleEnter(e, type) { 
    if(e.key === 'Enter') sendMessage(type); 
}

/* Q&A 글쓰기 관련 스크립트 */
function openQnaWrite() {
    document.getElementById('writeModal').classList.add('active');
}

function closeQnaWrite() {
    document.getElementById('writeModal').classList.remove('active');
    // 입력창 초기화
    document.getElementById('qna-title').value = '';
    document.getElementById('qna-content').value = '';
}

function submitQuestion() {
    const category = document.getElementById('qna-category').value;
    const title = document.getElementById('qna-title').value;
    const content = document.getElementById('qna-content').value;

    if(!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    // 새 질문 HTML 생성
    const newQnaHtml = `
        <div class="qna-item" style="padding:15px; background:#fffbfb;">
            <div class="hstack space-between">
                <span class="qna-tag" style="color:#5F0080; font-weight:bold;">${category} <span style="font-weight:normal; color:#888;">#신규</span></span>
                <span class="qna-status status-wait">답변대기</span>
            </div>
            <div class="bold mt-6">${title}</div>
            <div class="tiny muted mt-6">${content}</div>
            <div class="hstack gap-10 mt-6 tiny">
                <span class="muted">김○○님</span>
                <span class="muted" style="color:#e74c3c;">방금 전</span>
            </div>
        </div>
    `;

    // 리스트 맨 앞에 추가
    const container = document.getElementById('qna-container');
    container.insertAdjacentHTML('afterbegin', newQnaHtml);

    // 모달 닫기
    alert('질문이 등록되었습니다. 전문가 답변을 기다려주세요.');
    closeQnaWrite();
}
