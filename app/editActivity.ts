import type {SavedReport,Task} from './reportData';
export function editActivity(report:SavedReport,memberName:string,taskId:string,patch:Pick<Task,'pekerjaan'|'kategori'|'progress'>,id:string):SavedReport{
 if(!patch||typeof patch.pekerjaan!=='string'||!patch.pekerjaan.trim()||patch.pekerjaan.length>3000||typeof patch.kategori!=='string'||!patch.kategori.trim()||patch.kategori.length>100||typeof patch.progress!=='string'||patch.progress.trim()===''||!Number.isFinite(Number(patch.progress))||Number(patch.progress)<0||Number(patch.progress)>100)throw new Error('Isi aktivitas, kategori, dan progress antara 0–100%.');
 const member=report.members.find(m=>m.name===memberName);
 if(!member?.tasks.some(t=>t.id===taskId))throw new Error('Aktivitas tidak ditemukan. Muat ulang dashboard.');
 return {...report,id,members:report.members.map(m=>m.name!==memberName?m:{...m,tasks:m.tasks.map(t=>t.id!==taskId?t:{...t,pekerjaan:patch.pekerjaan.trim(),kategori:patch.kategori.trim(),progress:String(Number(patch.progress))})})};
}
