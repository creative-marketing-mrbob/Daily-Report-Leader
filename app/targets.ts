import {inPeriod} from './periods';
import type {SavedReport} from './reportData';
// Monthly targets retained from MARKETING AI INTELEGENCE/src/data/initialData.ts.
export const periodTargets = [
  {
    "name": "Dewi",
    "title": "Total pertumbuhan followers",
    "target": 2000
  },
  {
    "name": "Dewi",
    "title": "Jumlah ide kreatif team (campaign)",
    "target": 2
  },
  {
    "name": "Zakki",
    "title": "Total desain grafis",
    "target": 22
  },
  {
    "name": "Zakki",
    "title": "Total desain thumbnail IG",
    "target": 12
  },
  {
    "name": "Zakki",
    "title": "Ide visual konten baru",
    "target": 2
  },
  {
    "name": "Mario",
    "title": "Total pertumbuhan followers",
    "target": 2000
  },
  {
    "name": "Mario",
    "title": "Total penambahan likes TikTok",
    "target": 100000
  },
  {
    "name": "Cindy",
    "title": "Total naskah konten Instagram grafis",
    "target": 22
  },
  {
    "name": "Cindy",
    "title": "Total naskah konten Instagram reels",
    "target": 12
  },
  {
    "name": "Cindy",
    "title": "Total naskah konten TikTok",
    "target": 18
  },
  {
    "name": "Cindy",
    "title": "Jumlah ide kreatif team (campaign)",
    "target": 2
  },
  {
    "name": "Sulton",
    "title": "Total video Instagram",
    "target": 12
  },
  {
    "name": "Sulton",
    "title": "Total video TikTok",
    "target": 18
  },
  {
    "name": "Sulton",
    "title": "Ide konten baru",
    "target": 2
  },
  {
    "name": "Ilham",
    "title": "Jumlah konten dealdone",
    "target": 6
  },
  {
    "name": "Ilham",
    "title": "Winning content iklan",
    "target": 1
  },
  {
    "name": "Ilham",
    "title": "Jumlah campaign yang dieksekusi",
    "target": 2
  },
  {
    "name": "Ilham",
    "title": "Total lead yang dihasilkan",
    "target": 200
  },
  {
    "name": "Reni",
    "title": "Total naskah iklan",
    "target": 6
  },
  {
    "name": "Reni",
    "title": "Total naskah YouTube",
    "target": 4
  },
  {
    "name": "Reni",
    "title": "Ide marketing baru",
    "target": 2
  },
  {
    "name": "Alin",
    "title": "Total konten grafis",
    "target": 30
  },
  {
    "name": "Alin",
    "title": "Total thumbnail YouTube",
    "target": 4
  },
  {
    "name": "Alin",
    "title": "Ide visual konten baru",
    "target": 2
  },
  {
    "name": "Amar",
    "title": "Total konten iklan",
    "target": 6
  },
  {
    "name": "Amar",
    "title": "Total konten YouTube",
    "target": 4
  },
  {
    "name": "Amar",
    "title": "Ide konten baru",
    "target": 2
  }
] as const;
const aliases:Record<string,string[]>={
 'Total desain grafis':['Desain grafis'], 'Total desain thumbnail IG':['Thumbnail'],
 'Total naskah konten Instagram grafis':['Naskah Instagram'], 'Total naskah konten Instagram reels':['Naskah Reels'], 'Total naskah konten TikTok':['Naskah Tiktok'],
 'Total video Instagram':['Video instagram'], 'Total video TikTok':['Video tiktok'],
 'Total naskah iklan':['Naskah iklan'], 'Total naskah YouTube':['Naskah youtube'],
 'Total thumbnail YouTube':['Thumbnail Youtube'], 'Total konten iklan':['Video Iklan'], 'Total konten YouTube':['Video Youtube'],
 'Jumlah ide kreatif team (campaign)':['Ide campaign'], 'Ide marketing baru':['Ide campaign'],
 'Jumlah konten dealdone':['Konten dealdone'], 'Winning content iklan':['Winning content iklan'], 'Jumlah campaign yang dieksekusi':['Campaign dieksekusi'],
 'Total konten grafis':['Desain grafis']
};
const normalize=(s:string)=>s.trim().toLowerCase();
export function targetResults(name:string,reports:SavedReport[],period:number){
 const periodReports=reports.filter(r=>inPeriod(r.date,period));
 return periodTargets.filter(t=>t.name===name).map(t=>{
 const sourceName=(t.title==='Jumlah ide kreatif team (campaign)'&&name==='Cindy')||(t.title==='Total pertumbuhan followers'&&name==='Mario')?'Dewi':name;
 const entries=periodReports.flatMap(r=>r.members.filter(m=>m.name===sourceName).map(m=>({...m,date:r.date}))).sort((a,b)=>b.date.localeCompare(a.date));
 // Each metric is a cumulative result for the selected 28-day reporting period.
 if(['Total pertumbuhan followers','Total penambahan likes TikTok','Total lead yang dihasilkan'].includes(t.title)){
 const latest=entries.find(m=>m.metric!==''&&m.metric!==undefined&&Number.isFinite(Number(m.metric)));
 const actual=latest?Number(latest.metric):null;
 return {...t,actual,score:actual===null?null:actual/t.target*100};
 }
 const names=[t.title,...(aliases[t.title]||[])].map(normalize);
 const actual=entries.flatMap(m=>m.tasks).filter(task=>Number(task.progress)===100&&names.includes(normalize(task.kategori))).length;
 return {...t,actual,score:actual/t.target*100};
 });
}
export function achievement(actual:number,target:number){return target>0?actual/target*100:null;}

export function overallScore(results:{target:number;actual:number|null;score:number|null;title:string}[]){
 if(!results.length||results.some(r=>r.actual===null))return null;
 const mixed=results.some(r=>['Total pertumbuhan followers','Total penambahan likes TikTok','Total lead yang dihasilkan'].includes(r.title));
 // Normalize unlike units (followers, likes, leads, activities) before combining.
 return Math.round(mixed?results.reduce((sum,r)=>sum+(r.score||0),0)/results.length:results.reduce((sum,r)=>sum+(r.actual||0),0)/results.reduce((sum,r)=>sum+r.target,0)*100);
}
