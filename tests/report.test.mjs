import {strict as assert} from 'node:assert';
import {blankProblem,blankTask,divisions,categories,validateReport} from '../app/reportData.ts';
const report={id:'test',date:'2026-09-07',division:'sosmed',problem:blankProblem(),members:[{name:'Dewi',metric:'0',...blankProblem(),tasks:[{...blankTask(),pekerjaan:'Review konten',kategori:'Review',progress:'100'}]}]};
assert.equal(validateReport(report),'');
for(const value of ['', '-1','101','NaN']){report.members[0].tasks[0].progress=value;assert.notEqual(validateReport(report),'');}
report.members[0].tasks[0].progress='45.5';assert.equal(validateReport(report),'');
for(const name of ['Dewi','Ilham']){report.members[0].name=name;for(const value of ['', '-1','1.5','abc']){report.members[0].metric=value;assert.notEqual(validateReport(report),'');}report.members[0].metric='120';assert.equal(validateReport(report),'');}
report.problem={hasProblem:true,problem:'Kendala',solution:'',status:'Belum solved'};assert.notEqual(validateReport(report),'');report.problem.solution='Follow up';assert.equal(validateReport(report),'');
assert.equal(divisions.flatMap(d=>d.members).length,9);assert.equal(categories.Reni.length,5);assert.deepEqual(categories.Dewi,[]);assert.deepEqual(categories.Ilham,[]);
console.log('PASS: progress, required numeric metrics, problems, and member categories');
