export const money = (n=0) => new Intl.NumberFormat('ko-KR').format(Math.round(Number(n)||0)) + '원';
export const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

export function calcNetEstate({assets=0, debts=0, funeral=0, priorGifts=0, deductions=0}={}){
  return {
    gross: Number(assets)||0,
    deductionsBeforeTax: (Number(debts)||0)+(Number(funeral)||0),
    priorGifts: Number(priorGifts)||0,
    deductions: Number(deductions)||0,
    taxableBase: Math.max(0,(Number(assets)||0)-(Number(debts)||0)-(Number(funeral)||0)+(Number(priorGifts)||0)-(Number(deductions)||0))
  };
}

export function progressiveInheritanceTax(base=0){
  base = Math.max(0,Number(base)||0);
  if(base<=100_000_000) return base*0.10;
  if(base<=500_000_000) return base*0.20-10_000_000;
  if(base<=1_000_000_000) return base*0.30-60_000_000;
  if(base<=3_000_000_000) return base*0.40-160_000_000;
  return base*0.50-460_000_000;
}

export function decisionAssessment({assets=0,debts=0,unknownDebt=false,daysLeft=90}={}){
  assets=Number(assets)||0; debts=Number(debts)||0; daysLeft=Number(daysLeft)||0;
  let level='standard', label='일반 검토', routes=['단순승인'];
  if(unknownDebt || debts>assets*0.7){ level='review'; label='추가 확인 필요'; routes=['한정승인','상속포기','전문가 검토']; }
  if(debts>assets || daysLeft<=14){ level='expert'; label='전문가 우선 검토'; routes=['한정승인','상속포기','전문가 상담']; }
  return {level,label,routes,net:assets-debts,warning: debts>assets ? '현재 입력 기준 채무가 재산을 초과합니다.' : unknownDebt ? '확인되지 않은 채무 가능성이 있어 추가 조회가 필요합니다.' : '현재 입력 기준 채무초과 징후는 확인되지 않았습니다.'};
}

export function caseProgress(c){
  const checks = [
    !!c?.decedent?.name,
    (c?.heirs||[]).length>0,
    (c?.assets||[]).length>0,
    !!c?.decision?.selected,
    (c?.documents||[]).some(d=>d.status==='ready'),
    !!c?.registry?.status,
    !!c?.tax?.status,
    !!c?.completion
  ];
  return Math.round(checks.filter(Boolean).length/checks.length*100);
}
