// Minimal dependency-free PDF generator for a professional text report.
function esc(s:string){return s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');}
export function makePdf(title:string, lines:string[]):Buffer{
 const content:string[]=['BT','/F1 18 Tf','50 790 Td',`(${esc(title)}) Tj`,'/F1 10 Tf','0 -24 Td'];
 for(const line of lines){content.push(`(${esc(line.slice(0,115))}) Tj`,'0 -16 Td');}
 content.push('ET');
 const stream=content.join('\n');
 const objs=[`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,`5 0 obj\n<< /Length ${Buffer.byteLength(stream,'utf8')} >>\nstream\n${stream}\nendstream\nendobj\n`];
 let pdf='%PDF-1.4\n', offsets=[0];
 for(const o of objs){offsets.push(Buffer.byteLength(pdf,'utf8'));pdf+=o;}
 const xref=Buffer.byteLength(pdf,'utf8');pdf+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return Buffer.from(pdf,'utf8');
}
