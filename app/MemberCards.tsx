import {targetResults} from './targets';
import {categories,divisions,SavedReport} from './reportData';

export default function MemberCards({names,reports,scoreReports,month}:{names:string[];reports:SavedReport[];scoreReports:SavedReport[];month:string}){
 return <div className="team-card-grid">{names.map(name=>{
 const entries=reports.flatMap(r=>r.members.filter(m=>m.name===name).map(m=>({...m,date:r.date})));
 const tasks=entries.flatMap(m=>m.tasks);
 const labels=Array.from(new Set([...(categories[name]||[]),...tasks.map(t=>t.kategori)]));
 const completed=tasks.filter(t=>Number(t.progress)===100).length;
 const progress=tasks.length?Math.round(tasks.reduce((sum,t)=>sum+Number(t.progress),0)/tasks.length):0;
 const division=divisions.find(d=>d.members.includes(name));
 const latest=entries[0];
 const targets=targetResults(name,scoreReports,month);
 const available=targets.filter(t=>t.actual!==null);
 const totalTarget=available.reduce((s,t)=>s+t.target,0),totalActual=available.reduce((s,t)=>s+(t.actual||0),0);
 const score=targets.length&&available.length===targets.length&&totalTarget?Math.round(totalActual/totalTarget*100):null;
 return <article className={`team-score-card ${tasks.length?'has-report':''}`} key={name}>
 <div className="team-card-heading"><div><h3>{name}</h3><span>{division?.name}</span></div><span className="team-initial">{name.slice(0,2).toUpperCase()}</span></div>
 <span className={`team-data-label ${tasks.length?'available':''}`}>{tasks.length?'Ada report':'Belum ada aktivitas'}</span>
 <div className="category-metrics">{labels.map(label=>{const group=tasks.filter(t=>t.kategori===label);return <div key={label}><strong>{group.filter(t=>Number(t.progress)===100).length}<small> / {group.length}</small></strong><span>{label}</span></div>})}{!labels.length&&<p>Kategori akan tampil setelah report diisi.</p>}</div>
 <p className="category-legend">Selesai / aktivitas dilaporkan</p>
 {['Dewi','Ilham'].includes(name)&&<div className="leader-result"><span>{name==='Dewi'?'Jumlah followers':'Jumlah lead'}</span><strong>{latest?Number(latest.metric).toLocaleString('id-ID'):'—'}</strong></div>}
 <div className="team-progress-label"><span>Progress aktivitas</span><strong>{progress}%</strong></div><progress max={100} value={progress}/>
 <div className="team-score"><div><span>Skor target bulanan</span><small>{month} · {score===null?'Data KPI belum lengkap':`${totalActual} selesai / ${totalTarget} target`}</small></div><strong>{score===null?'—':`${score}%`}</strong></div><details className="target-breakdown"><summary>Target per kategori</summary>{targets.map(t=><div key={t.title}><span>{t.title}</span><strong>{t.actual===null?'Belum tersedia':`${t.actual} / ${t.target} · ${Math.round(t.score||0)}%`}</strong>{t.actual===null&&<small>Target {t.target.toLocaleString('id-ID')} / bulan · perlu data pencapaian</small>}</div>)}</details>
 <details className="team-details"><summary>Lihat detail <span>→</span></summary>{entries.length?entries.map(entry=><div className="member-day" key={entry.date}><h4>{new Date(entry.date+'T12:00:00').toLocaleDateString('id-ID',{dateStyle:'medium'})}</h4>{entry.tasks.map(t=><div className="member-activity" key={t.id}><p>{t.pekerjaan}</p><div><span>{t.kategori}</span><strong>{t.progress}%</strong></div></div>)}{!entry.tasks.length&&<p>Tidak ada aktivitas.</p>}</div>):<p>Belum ada report pada periode ini.</p>}</details>
 <span className="team-card-foot">{completed} dari {tasks.length} aktivitas selesai</span>
 </article>;
 })}</div>;
}
