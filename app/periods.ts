export const FIRST_PERIOD_START='2026-09-15';
const DAY=86400000;
export function periodIndex(date:string){return Math.max(-1,Math.floor((Date.parse(date+'T00:00:00Z')-Date.parse(FIRST_PERIOD_START+'T00:00:00Z'))/(28*DAY)));}
export function getPeriod(index:number){
 const startTime=Date.parse(FIRST_PERIOD_START+'T00:00:00Z')+Math.max(-1,index)*28*DAY;
 return {index,start:new Date(startTime).toISOString().slice(0,10),end:new Date(startTime+27*DAY).toISOString().slice(0,10)};
}
export function inPeriod(date:string,index:number){const p=getPeriod(index);return date>=p.start&&date<=p.end;}
export function periodLabel(index:number){const p=getPeriod(index);const fmt=(d:string)=>new Date(d+'T00:00:00Z').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});return `${fmt(p.start)} – ${fmt(p.end)}`;}
