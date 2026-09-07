import {timingSafeEqual} from 'node:crypto';
import {validateReport} from '../../reportData';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const url=process.env.GOOGLE_SHEETS_WEB_APP_URL,secret=process.env.GOOGLE_SHEETS_SECRET,access=process.env.REPORT_ACCESS_CODE;
 if(!url||!secret||!access)return json({error:'Sinkronisasi belum diaktifkan. Lengkapi koneksi Google Sheets di server.'},503);
 const provided=request.headers.get('x-report-access')||'';
 if(Buffer.byteLength(provided)!==Buffer.byteLength(access)||!timingSafeEqual(Buffer.from(provided),Buffer.from(access)))return json({error:'Kode akses tim tidak sesuai.'},401);
 try{
 const raw=await request.text();if(raw.length>45000)return json({error:'Report terlalu panjang. Kurangi isi report.'},413);
 const body=JSON.parse(raw);
 if(!['list','save','category'].includes(body.action))return json({error:'Permintaan tidak valid.'},400);
 if(body.action==='save'){
   try{if(!['sosmed','marketing'].includes(body.report.division))throw Error();const error=validateReport(body.report);if(error)return json({error},400);}catch{return json({error:'Format report tidak valid.'},400);}
 }
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url))return json({error:'URL penghubung Google Sheets belum benar.'},503);
 const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,secret}),redirect:'follow',cache:'no-store',signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw Error();
 const result=await response.json() as {ok:boolean;error?:string;currentId?:string;code?:number};
 if(!result.ok)return json({error:result.error||'Google Sheets menolak penyimpanan.',currentId:result.currentId},result.code===409?409:502);
 return json(result);
 }catch{return json({error:'Google Sheets belum dapat dihubungi. Isian tetap tersedia; coba lagi.'},502);}
}
