// Reproducible, dependency-free raster icons. No external assets or font requests.
import { deflateSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
function crc32(bytes) { let crc = -1; for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return (crc ^ -1) >>> 0; }
function chunk(type, data) { const name = Buffer.from(type); const length = Buffer.alloc(4); length.writeUInt32BE(data.length); const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc32(Buffer.concat([name, data]))); return Buffer.concat([length, name, data, checksum]); }
const lines = [[23,20,11,32],[11,32,23,44],[41,20,53,32],[53,32,41,44],[36,16,28,48]];
function distance(x,y,[x1,y1,x2,y2]) { const t=Math.max(0,Math.min(1,((x-x1)*(x2-x1)+(y-y1)*(y2-y1))/((x2-x1)**2+(y2-y1)**2))); return Math.hypot(x-x1-t*(x2-x1),y-y1-t*(y2-y1)); }
await mkdir('apps/extension/public/icon', { recursive:true });
for (const size of [16,32,48,128]) {
  const data = Buffer.alloc(size*(size*4+1));
  for (let y=0;y<size;y++) for(let x=0;x<size;x++) {
    const sums=[0,0,0,0];
    for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++) {
      const px=(x+(sx+.5)/4)*64/size, py=(y+(sy+.5)/4)*64/size;
      const inside=Math.hypot(Math.max(Math.abs(px-32)-18,0),Math.max(Math.abs(py-32)-18,0))<=14;
      if(inside) { const white=lines.some(line=>distance(px,py,line)<2); const color=white?[255,255,255]:[35,35,35]; for(let c=0;c<3;c++)sums[c]+=color[c]; sums[3]+=255; }
    }
    const index=y*(size*4+1)+1+x*4; for(let c=0;c<4;c++)data[index+c]=Math.round(sums[c]/16);
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  await writeFile(`apps/extension/public/icon/${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(data)),chunk('IEND',Buffer.alloc(0))]));
}
console.log('Generated DevKit icons: 16, 32, 48, 128 px.');
