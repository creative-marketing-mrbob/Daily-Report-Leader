export type DivisionKey = 'sosmed' | 'marketing';
export type ProblemEntry = {id:string; problem:string; solution:string; status:'Belum solved'|'Solved'};
export type ProblemFields = {problems?:ProblemEntry[]; hasProblem:boolean; problem:string; solution:string; status:'Belum solved'|'Solved'};
export type Task = {id:string; pekerjaan:string; kategori:string; progress:string};
export type MemberReport = ProblemFields & {name:string; tasks:Task[]; metric:string};
export type SavedReport = {id:string; date:string; division:DivisionKey; members:MemberReport[]; problem:ProblemFields};
export const storageKey = 'daily-report-leader-simple-v1';
export const categoryKey = 'daily-report-leader-categories-v1';
export const divisions = [
 {id:'sosmed' as const,name:'Sosmed',leader:'Dewi',members:['Dewi','Cindy','Zakki','Sulton','Mario']},
 {id:'marketing' as const,name:'Marketing',leader:'Ilham',members:['Ilham','Alin','Amar','Reni']}
];
export const categories:Record<string,string[]> = {
 Cindy:['Naskah Instagram','Naskah Tiktok','Naskah Reels','Request'],
 Zakki:['Thumbnail','Desain grafis','Desain request'],
 Sulton:['Video tiktok','Video instagram','Video Request'],
 Mario:['Instastory','Upload Instagram','Upload Tiktok','Reply DM','Rely Komen'],
 Alin:['Thumbnail Youtube','Desain Request'],
 Amar:['Video Iklan','Video Youtube','Video Request'],
 Reni:['Naskah iklan','Naskah youtube','Naskah request','Naskah campaign','Ide campaign'],
 Ilham:[],Dewi:[]
};
export const blankProblem = ():ProblemFields => ({hasProblem:false,problem:'',solution:'',status:'Belum solved'});
export const blankTask = ():Task => ({id:crypto.randomUUID(),pekerjaan:'',kategori:'',progress:''});
export function getToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function validateReport(r:SavedReport){
 if(!r.date || !r.members.length) return 'Lengkapi tanggal dan anggota.';
 for(const m of r.members){
 if(['Dewi','Ilham'].includes(m.name) && (!/^\d+$/.test(m.metric)||!Number.isSafeInteger(Number(m.metric)))) return `Jumlah ${m.name==='Dewi'?'followers':'lead'} wajib diisi angka bulat, minimal 0.`;
 for(const t of m.tasks){if(!t.pekerjaan.trim()||!t.kategori.trim()||t.progress===''||!Number.isFinite(Number(t.progress))||Number(t.progress)<0||Number(t.progress)>100) return `Lengkapi pekerjaan, kategori, dan progress 0–100% untuk ${m.name}.`;}
 }
 for(const p of [r.problem,...r.members].flatMap(getProblems)) if(!p.problem.trim()||!p.solution.trim()) return 'Lengkapi problem dan solusi.';
 return '';
}

export function getProblems(value:ProblemFields):ProblemEntry[]{return value.problems ?? (value.hasProblem?[{id:'legacy',problem:value.problem,solution:value.solution,status:value.status}]:[]);}
