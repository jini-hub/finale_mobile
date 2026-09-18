import assert from 'node:assert/strict';
import {calcNetEstate,progressiveInheritanceTax,decisionAssessment,caseProgress} from './core.mjs';
const x=calcNetEstate({assets:900000000,debts:200000000,funeral:5000000,priorGifts:50000000,deductions:500000000});
assert.equal(x.taxableBase,245000000);
assert.equal(progressiveInheritanceTax(245000000),39000000);
assert.equal(decisionAssessment({assets:300000000,debts:500000000}).level,'expert');
assert.equal(decisionAssessment({assets:800000000,debts:100000000}).level,'standard');
assert.equal(caseProgress({decedent:{name:'A'},heirs:[{}],assets:[{}],decision:{selected:'단순승인'},documents:[{status:'ready'}],registry:{status:'x'},tax:{status:'x'},completion:true}),100);
console.log('Finale core tests: PASS');
