import {Fragment} from 'react';
import {targetResults,overallScore} from './targets';
import {divisions,SavedReport} from './reportData';

export default function MemberTable({names,reports,scoreReports,month}:{names:string[];reports:SavedReport[];scoreReports:SavedReport[];month:string}){
 return <section className="target-table-panel"><div className="target-table-heading"><h3>Target & pencapaian anggota</h3><span>{month} · 28 hari kerja</span></div><div className="table-scroll"><table className="target-report-table"><caption className="sr-only">Target dan pencapaian anggota selama bulan {month}</caption><thead><tr><th scope="col">Anggota</th><th scope="col">Kategori / KPI</th><th scope="col">Target</th><th scope="col">Hasil</th><th scope="col">Capaian</th><th scope="col">Skor anggota</th></tr></thead><tbody>{names.map(name=>{
 const targets=targetResults(name,scoreReports,month);
 const score=overallScore(targets);
 const division=divisions.find(d=>d.members.includes(name));
 const tasks=reports.flatMap(r=>r.members.filter(m=>m.name===name).flatMap(m=>m.tasks));
 const rows=targets.length?targets:[{title:'Belum ada target',target:null,actual:null,score:null}];
 return <Fragment key={name}>{rows.map((t,index)=><tr key={t.title} className={index===0?'member-group-start':''}>{index===0&&<th scope="rowgroup" rowSpan={rows.length} className="member-cell"><strong>{name}</strong><span>{division?.name}</span><small>{tasks.filter(t=>Number(t.progress)===100).length} / {tasks.length} aktivitas selesai</small></th>}<td>{t.title}</td><td className="numeric">{t.target===null?'—':t.target.toLocaleString('id-ID')}</td><td className="numeric">{t.actual===null?<span title="Data pencapaian belum tersedia">—</span>:t.actual.toLocaleString('id-ID')}</td><td className="numeric"><span className={`achievement-label ${t.score!==null&&t.score>=100?'achieved':''}`}>{t.score===null?'—':`${Math.round(t.score)}%`}</span></td>{index===0&&<td rowSpan={rows.length} className="member-score-cell"><strong>{score===null?'—':`${score}%`}</strong>{score===null&&<small>Data belum lengkap</small>}</td>}</tr>)}</Fragment>;
 })}</tbody></table></div></section>;
}
