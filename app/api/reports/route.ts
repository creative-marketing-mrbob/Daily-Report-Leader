import {editActivity} from '../../editActivity';
import type {SavedReport} from '../../reportData';
import {validateReport} from '../../reportData';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const url=process.env.GOOGLE_SHEETS_WEB_APP_URL,secret=process.env.GOOGLE_SHEETS_SECRET;
 if(!url||!secret)return json({error:'Sinkronisasi belum diaktifkan. Lengkapi koneksi Google Sheets di server.'},503);
 try{
 const raw=await request.text();if(raw.length>45000)return json({error:'Report terlalu panjang. Kurangi isi report.'},413);
 const body=JSON.parse(raw);
 if(!['list','save','category','edit'].includes(body.action))return json({error:'Permintaan tidak valid.'},400);
 if(body.action==='save'){
   try{if(!['sosmed','marketing'].includes(body.report.division))throw Error();const error=validateReport(body.report);if(error)return json({error},400);}catch{return json({error:'Format report tidak valid.'},400);}
 }
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url))return json({error:'URL penghubung Google Sheets belum benar.'},503);
 async function google(payload:unknown){
 const response=await fetch(url!,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload as object,secret}),redirect:'follow',cache:'no-store',signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw Error();
 return await response.json() as {ok:boolean;error?:string;currentId?:string;code?:number;reports?:SavedReport[];report?:SavedReport};
 }
 let payload=body;
 if(body.action==='edit'){
 const snapshot=await google({action:'list'});if(!snapshot.ok||!Array.isArray(snapshot.reports))throw Error();
 const current=snapshot.reports.find(r=>r.date===body.date&&r.division===body.division);
 if(!current||current.id!==body.expectedId)return json({error:'Report sudah berubah. Muat ulang dashboard, lalu edit kembali.',currentId:current?.id},409);
 let report:SavedReport;
 try{report=editActivity(current,body.member,body.taskId,body.patch,crypto.randomUUID());}catch(error){return json({error:(error as Error).message},400);}
 payload={action:'save',report,expectedId:current.id};
 }
 const result=await google(payload);
 if(!result.ok)return json({error:result.error||'Google Sheets menolak penyimpanan.',currentId:result.currentId},result.code===409?409:502);
 return json(result);
 }catch{return json({error:'Google Sheets belum dapat dihubungi. Isian tetap tersedia; coba lagi.'},502);}
}
