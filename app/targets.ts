import type {SavedReport} from './reportData';
// Monthly targets retained from MARKETING AI INTELEGENCE/src/data/initialData.ts.
export const monthlyTargets = [
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
export function targetResults(name:string,reports:SavedReport[],month:string){
 const monthly=reports.filter(r=>r.date.startsWith(month));
 return monthlyTargets.filter(t=>t.name===name).map(t=>{
 const sourceName=t.title==='Jumlah ide kreatif team (campaign)'&&name==='Cindy'?'Dewi':name;
 const entries=monthly.flatMap(r=>r.members.filter(m=>m.name===sourceName));
 // The existing form has no likes or explicit follower-growth field.
 if(t.title==='Total pertumbuhan followers'||t.title==='Total penambahan likes TikTok'||t.title==='Total lead yang dihasilkan')return {...t,actual:null,score:null};
 const names=[t.title,...(aliases[t.title]||[])].map(normalize);
 const actual=entries.flatMap(m=>m.tasks).filter(task=>Number(task.progress)===100&&names.includes(normalize(task.kategori))).length;
 return {...t,actual,score:actual/t.target*100};
 });
}
export function achievement(actual:number,target:number){return target>0?actual/target*100:null;}
