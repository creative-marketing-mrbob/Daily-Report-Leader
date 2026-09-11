import {inPeriod,getPeriod} from './periods';
import {taskHistory} from './taskHistory';
import {targetResults,overallScore} from './targets';
import {categories,SavedReport} from './reportData';

const shortTitles:Record<string,string>={
 'Total desain grafis':'Grafis Instagram','Total desain thumbnail IG':'Thumbnail','Total naskah konten Instagram grafis':'Naskah Instagram','Total naskah konten Instagram reels':'Naskah Reels','Total naskah konten TikTok':'Naskah TikTok','Total video Instagram':'Video Instagram','Total video TikTok':'Video TikTok','Total naskah iklan':'Naskah iklan','Total naskah YouTube':'Naskah YouTube','Total thumbnail YouTube':'Thumbnail YouTube','Total konten iklan':'Video iklan','Total konten YouTube':'Video YouTube','Total konten grafis':'Desain grafis','Total pertumbuhan followers':'Followers','Total penambahan likes TikTok':'Likes TikTok','Total lead yang dihasilkan':'Lead','Jumlah ide kreatif team (campaign)':'Ide campaign','Jumlah konten dealdone':'Konten dealdone','Jumlah campaign yang dieksekusi':'Campaign','Ide visual konten baru':'Ide visual','Ide konten baru':'Ide konten','Ide marketing baru':'Ide marketing'
};
export default function MemberReportPanels({names,reports,scoreReports,period}:{names:string[];reports:SavedReport[];scoreReports:SavedReport[];period:number}){
 return <div className="member-report-panels">{names.map(name=>{
 const targets=targetResults(name,scoreReports,period);
 const score=overallScore(targets);
 const entries=reports.flatMap(r=>r.members.filter(m=>m.name===name).map(m=>({...m,date:r.date}))).sort((a,b)=>b.date.localeCompare(a.date));
 const monthlyTasks=taskHistory(scoreReports,getPeriod(period).end).filter(t=>t.member===name&&inPeriod(t.date,period));
 const requests=Array.from(new Set([...(categories[name]||[]),...monthlyTasks.map(t=>t.kategori)])).filter(label=>/request/i.test(label)&&!targets.some(t=>t.title.trim().toLowerCase()===label.trim().toLowerCase()));
 const summaries=[...targets.map(t=>({label:shortTitles[t.title]||t.title,value:`${t.actual===null?'—':t.actual.toLocaleString('id-ID')} / ${t.target.toLocaleString('id-ID')}`,title:`${t.title}: hasil / target 28 hari`})),...requests.map(label=>({label,value:`${monthlyTasks.filter(t=>t.kategori===label&&Number(t.progress)===100&&t.completedOn!==null&&inPeriod(t.completedOn,period)).length} / ${monthlyTasks.filter(t=>t.kategori===label).length}`,title:'Request: selesai / jumlah request dilaporkan; tidak termasuk skor target'}))];
 return <section className="member-report-panel" key={name}><header className="member-panel-heading"><h3>{name}</h3><span>Skor <strong>{score===null?'—':`${score}%`}</strong></span></header><div className="member-inner-section"><h4>Target</h4><div className="member-target-strip" aria-label={`Target ${name}`}>{summaries.map(s=><div className="member-target-item" key={s.label} title={s.title}><span>{s.label}</span><strong>{s.value}</strong></div>)}</div></div><div className="member-inner-section"><h4>Aktivitas</h4><div className="member-activities-scroll"><table className="member-activities-table"><caption className="sr-only">Aktivitas harian {name} dari report leader</caption><thead><tr><th scope="col">Aktivitas</th><th scope="col">Kategori</th><th scope="col">Progress</th></tr></thead><tbody>{entries.length?entries.map(entry=><DayRows key={entry.date} entry={entry}/>):<tr><td colSpan={3} className="member-empty">Belum ada aktivitas dari report leader pada periode ini.</td></tr>}</tbody></table></div></div></section>;
 })}</div>;
}
function DayRows({entry}:{entry:SavedReport['members'][number]&{date:string}}){
 return <><tr className="activity-date"><th colSpan={3} scope="rowgroup">{new Date(entry.date+'T12:00:00').toLocaleDateString('id-ID',{dateStyle:'long'})}</th></tr>{entry.tasks.length?entry.tasks.map(t=><tr key={t.id}><td>{t.pekerjaan}</td><td>{t.kategori}</td><td><span className={Number(t.progress)===100?'activity-done':'activity-progress'}>{t.progress}%{Number(t.progress)===100?' · Done':''}</span></td></tr>):<tr><td colSpan={3} className="member-empty">Tidak ada aktivitas dilaporkan.</td></tr>}</>;
}
