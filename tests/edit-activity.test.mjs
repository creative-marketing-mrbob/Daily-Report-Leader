import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const compile=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpile(source,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext})).toString('base64');
const helper=compile(fs.readFileSync('app/editActivity.ts','utf8'));
const {editActivity,editMetric}=await import(helper);
const data=compile(fs.readFileSync('app/reportData.ts','utf8'));
const {POST}=await import(compile(fs.readFileSync('app/api/reports/route.ts','utf8').replaceAll("'../../editActivity'",JSON.stringify(helper)).replaceAll("'../../reportData'",JSON.stringify(data))));
const record={id:'original',date:'2026-09-10',division:'marketing',problem:{hasProblem:false,problem:'',solution:'',status:'Belum solved'},members:[{name:'Amar',metric:'',tasks:[{id:'ad',pekerjaan:'Iklan',kategori:'Video Iklan',progress:'50'},{id:'other',pekerjaan:'Video',kategori:'Video Youtube',progress:'100'}]},{name:'Ilham',metric:'100',tasks:[]}]};
const patch={pekerjaan:'Iklan',kategori:'Video Iklan',progress:'80'};
test('editing preserves other activities, metrics, problems and stable task identity',()=>{
 const original=structuredClone(record),result=editActivity(record,'Amar','ad',patch,'new-version');
 assert.equal(result.members[0].tasks[0].progress,'80');
 assert.equal(result.members[0].tasks[0].id,'ad');
 assert.equal(result.id,'new-version');
 assert.deepEqual(result.members[0].tasks[1],record.members[0].tasks[1]);
 assert.deepEqual(result.members[1],record.members[1]);
 assert.deepEqual(result.problem,record.problem);
 assert.deepEqual(record,original);
 for(const progress of ['','101','-1','NaN'])assert.throws(()=>editActivity(record,'Amar','ad',{...patch,progress},'new'));
 assert.throws(()=>editActivity(record,'Amar','missing',patch,'new'));
});
test('API saves a checked revision and handles stale edits without overwriting',async()=>{
 const oldFetch=globalThis.fetch,oldUrl=process.env.GOOGLE_SHEETS_WEB_APP_URL,oldSecret=process.env.GOOGLE_SHEETS_SECRET;
 process.env.GOOGLE_SHEETS_WEB_APP_URL='https://script.google.com/macros/s/test/exec';process.env.GOOGLE_SHEETS_SECRET='test-only';
 const request=expectedId=>new Request('http://localhost/api/reports',{method:'POST',body:JSON.stringify({action:'edit',date:record.date,division:record.division,expectedId,member:'Amar',taskId:'ad',patch})});
 try{
 const calls=[];
 globalThis.fetch=async(_url,options)=>{const body=JSON.parse(options.body);calls.push(body);return Response.json(body.action==='list'?{ok:true,reports:[record]}:{ok:true,report:body.report});};
 let response=await POST(request('original'));
 assert.equal(response.status,200);
 assert.equal((await response.json()).report.members[0].tasks[0].progress,'80');
 assert.deepEqual(calls.map(c=>c.action),['list','save']);
 assert.equal(calls[1].expectedId,'original');
 assert.deepEqual(calls[1].report.members[1],record.members[1]);
 const metricSource={...record,members:[...record.members,{name:'Dewi',metric:'2001',tasks:[]}]};
 const metricRequest=expectedId=>new Request('http://localhost/api/reports',{method:'POST',body:JSON.stringify({action:'editMetric',date:record.date,division:record.division,expectedId,member:'Dewi',metric:'2101'})});
 globalThis.fetch=async(_url,options)=>{const body=JSON.parse(options.body);calls.push(body);return Response.json(body.action==='list'?{ok:true,reports:[metricSource]}:{ok:true,report:body.report});};
 response=await POST(metricRequest('original'));assert.equal(response.status,200);
 const edited=(await response.json()).report;
 assert.equal(edited.members[2].metric,'2101');assert.deepEqual(edited.members[0],record.members[0]);
 calls.length=0;response=await POST(metricRequest('stale'));assert.equal(response.status,409);assert.deepEqual(calls.map(c=>c.action),['list']);
 calls.length=0;
 response=await POST(request('stale'));
 assert.equal(response.status,409);assert.deepEqual(calls.map(c=>c.action),['list']);
 globalThis.fetch=async(_url,options)=>Response.json(JSON.parse(options.body).action==='list'?{ok:true,reports:[record]}:{ok:false,code:409,currentId:'concurrent',error:'Changed'});
 response=await POST(request('original'));assert.equal(response.status,409);
 }finally{globalThis.fetch=oldFetch;if(oldUrl===undefined)delete process.env.GOOGLE_SHEETS_WEB_APP_URL;else process.env.GOOGLE_SHEETS_WEB_APP_URL=oldUrl;if(oldSecret===undefined)delete process.env.GOOGLE_SHEETS_SECRET;else process.env.GOOGLE_SHEETS_SECRET=oldSecret;}
});

test('metric corrections preserve reports and validate whole nonnegative totals',()=>{
 const source={...structuredClone(record),division:'sosmed',members:[{...structuredClone(record.members[0]),name:'Dewi',metric:'2001'},{name:'Mario',metric:'500000',tasks:[]}]};
 const before=structuredClone(source);
 const updated=editMetric(source,'Dewi','2101','revision');
 assert.equal(updated.members[0].metric,'2101');
 assert.deepEqual(updated.members[0].tasks,source.members[0].tasks);
 assert.deepEqual(updated.members[1],source.members[1]);
 assert.deepEqual(updated.problem,source.problem);
 assert.deepEqual(source,before);
 assert.equal(editMetric(source,'Mario','0','revision').members[1].metric,'0');
 for(const invalid of ['', '-1', '1.5', 'abc','9007199254740992',null])assert.throws(()=>editMetric(source,'Dewi',invalid,'revision'));
 assert.throws(()=>editMetric(source,'Amar','100','revision'));
});
