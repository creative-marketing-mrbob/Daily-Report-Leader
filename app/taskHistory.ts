import type {DivisionKey,MemberReport,SavedReport,Task} from './reportData';
export type TrackedTask=Task&{member:string;date:string;completedOn:string|null};
/** Stable task IDs follow an activity across daily snapshots. */
export function taskHistory(reports:SavedReport[],through='9999-12-31'):TrackedTask[]{
 const latest=new Map<string,TrackedTask>();
 for(const report of [...reports].filter(r=>r.date<=through).sort((a,b)=>a.date.localeCompare(b.date))){
  for(const member of report.members)for(const task of member.tasks){
   const key=JSON.stringify([report.division,member.name,task.id]);
   const previous=latest.get(key);
   latest.set(key,{...task,member:member.name,date:report.date,completedOn:previous?.completedOn||(Number(task.progress)===100?report.date:null)});
  }
 }
 return [...latest.values()];
}
export function prepareDay(reports:SavedReport[],division:DivisionKey,date:string,names:string[]){
 const existing=reports.find(r=>r.division===division&&r.date===date);
 if(existing)return {members:structuredClone(existing.members),problem:structuredClone(existing.problem),carried:{} as Record<string,string>};
 const pending=taskHistory(reports.filter(r=>r.division===division&&r.date<date)).filter(t=>Number(t.progress)<100);
 const carried:Record<string,string>={};
 const members:MemberReport[]=names.map(name=>({name,metric:'',hasProblem:false,problem:'',solution:'',status:'Belum solved',tasks:pending.filter(t=>t.member===name).map(t=>{carried[t.id]=t.date;return {id:t.id,pekerjaan:t.pekerjaan,kategori:t.kategori,progress:t.progress};})}));
 return {members,problem:{hasProblem:false,problem:'',solution:'',status:'Belum solved' as const},carried};
}
