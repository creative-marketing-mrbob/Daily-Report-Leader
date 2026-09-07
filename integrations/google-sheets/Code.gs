/** Paste into the Apps Script project bound to DAILY REPORT TEAM LEADER. */
const SPREADSHEET_ID='1-AhoLs-5SeP5xwnMrjAKar4-Sy3rgNVD2xcGH4lsyKo';
const MEMBERS={sosmed:['Dewi','Cindy','Zakki','Sulton','Mario'],marketing:['Ilham','Alin','Amar','Reni']};
function setup(){
 const props=PropertiesService.getScriptProperties();
 if(!props.getProperty('REPORT_SECRET'))props.setProperty('REPORT_SECRET',Utilities.getUuid()+Utilities.getUuid());
 SpreadsheetApp.getUi().alert('Penghubung siap. Salin REPORT_SECRET dari Project Settings → Script properties ke GOOGLE_SHEETS_SECRET di Vercel. Jangan bagikan secret kepada anggota tim.');
}
function output(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function doPost(e){
 const lock=LockService.getScriptLock();
 try{
  const data=JSON.parse(e.postData.contents);
  const secret=PropertiesService.getScriptProperties().getProperty('REPORT_SECRET');
  if(!secret||data.secret!==secret)return output({ok:false,error:'Akses penghubung ditolak.'});
  if(!lock.tryLock(15000))return output({ok:false,error:'Ada penyimpanan lain. Coba lagi.'});
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet=ss.getSheetByName('Report Website'),categorySheet=ss.getSheetByName('Kategori Website');
  if(!sheet||!categorySheet)throw new Error('Tab Report Website atau Kategori Website belum tersedia.');
  const reports=readReports(sheet);
  if(data.action==='list')return output({ok:true,reports,categories:readCategories(categorySheet,reports)});
  if(data.action==='category'){
   if(!Object.values(MEMBERS).flat().includes(data.member)||typeof data.category!=='string'||!data.category.trim()||data.category.length>100)throw new Error('Kategori tidak valid.');
   const value=data.category.trim(),existing=readCategories(categorySheet,reports)[data.member]||[];
   if(!existing.some(c=>c.toLowerCase()===value.toLowerCase()))categorySheet.appendRow([literal(data.member),literal(value)]);
   return output({ok:true});
  }
  if(data.action!=='save')throw new Error('Permintaan tidak valid.');
  const r=data.report;validate(r);
  const current=reports.find(x=>x.date===r.date&&x.division===r.division);
  if(current&&current.id===r.id)return output({ok:true,report:current});
  if((current?current.id:null)!==(data.expectedId||null))return output({ok:false,code:409,currentId:current?current.id:null,error:'Report tanggal ini sudah ditambahkan atau diubah oleh tim.'});
  const tasks=r.members.flatMap(m=>m.tasks.map(t=>({name:m.name,...t}))),problems=issues(r.problem);
  const followers=r.members.find(m=>m.name==='Dewi'),leads=r.members.find(m=>m.name==='Ilham');
  const row=[r.date,r.division,MEMBERS[r.division][0],tasks.map(t=>t.name+': '+t.pekerjaan).join('\n'),tasks.map(t=>t.kategori).join('\n'),tasks.map(t=>t.progress+'%').join('\n'),followers?Number(followers.metric):'',leads?Number(leads.metric):'',problems.map(p=>p.problem).join('\n'),problems.map(p=>p.solution).join('\n'),problems.map(p=>p.status).join('\n'),r.id,new Date().toISOString(),JSON.stringify(r)];
  // A single row stores the complete snapshot; revisions append without deleting history.
  sheet.appendRow(row.map(literal));
  SpreadsheetApp.flush();
  return output({ok:true,report:r});
 }catch(error){return output({ok:false,error:error.message||'Penyimpanan gagal.'});}finally{if(lock.hasLock())lock.releaseLock();}
}
function literal(value){return typeof value==='string'&&/^[=+\-@]/.test(value)?"'"+value:value;}
function issues(value){return value.problems||(value.hasProblem?[value]:[]);}
function readReports(sheet){
 if(sheet.getLastRow()<2)return [];
 const values=sheet.getRange(2,14,sheet.getLastRow()-1,1).getValues();
 const latest={};
 values.forEach(row=>{if(!row[0])return;let r;try{r=JSON.parse(row[0]);validate(r);}catch{throw new Error('Data aplikasi pada spreadsheet tidak valid. Periksa kolom N.');}latest[r.division+':'+r.date]=r;});
 return Object.values(latest);
}
function readCategories(sheet,reports){
 const result={};Object.values(MEMBERS).flat().forEach(name=>result[name]=[]);
 const add=(name,value)=>{if(result[name]&&typeof value==='string'&&value.trim()&&!result[name].some(c=>c.toLowerCase()===value.trim().toLowerCase()))result[name].push(value.trim());};
 if(sheet.getLastRow()>1)sheet.getRange(2,1,sheet.getLastRow()-1,2).getValues().forEach(row=>add(row[0],row[1]));
 reports.forEach(r=>r.members.forEach(m=>m.tasks.forEach(t=>add(m.name,t.kategori))));return result;
}
function validate(r){
 const string=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 if(!r||!MEMBERS[r.division]||!string(r.id,100)||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||new Date(r.date+'T12:00:00Z').toISOString().slice(0,10)!==r.date||JSON.stringify(r).length>40000)throw new Error('Format report tidak valid atau terlalu panjang.');
 if(!Array.isArray(r.members)||r.members.length!==MEMBERS[r.division].length||new Set(r.members.map(m=>m.name)).size!==r.members.length)throw new Error('Anggota report tidak lengkap.');
 r.members.forEach(m=>{
  if(!MEMBERS[r.division].includes(m.name)||!Array.isArray(m.tasks)||m.tasks.length>100)throw new Error('Anggota atau aktivitas tidak valid.');
  if(['Dewi','Ilham'].includes(m.name)&&(!/^\d+$/.test(m.metric)||!Number.isSafeInteger(Number(m.metric))))throw new Error('Jumlah followers / lead harus angka bulat minimal 0.');
  m.tasks.forEach(t=>{if(!string(t.id,100)||!string(t.pekerjaan,3000)||!string(t.kategori,100)||t.progress===''||!Number.isFinite(Number(t.progress))||Number(t.progress)<0||Number(t.progress)>100)throw new Error('Lengkapi aktivitas, kategori, dan progress 0–100.');});
 });
 [r.problem,...r.members].forEach(p=>{if(!p||typeof p.hasProblem!=='boolean'||!Array.isArray(issues(p))||issues(p).length>100)throw new Error('Format kendala tidak valid.');issues(p).forEach(i=>{if(!string(i.problem,3000)||!string(i.solution,3000)||!['Solved','Belum solved'].includes(i.status))throw new Error('Lengkapi kendala, solusi, dan status.');});});
}
