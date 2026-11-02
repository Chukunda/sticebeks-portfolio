// Loopback-only development server. The deployed Netlify site serves static files.
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const {once} = require('node:events');
const root = __dirname;
const port = Number(process.env.PORT || 4321);
const token = crypto.randomBytes(24).toString('hex');
const maxBytes = 80 * 1024 * 1024;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'};
let saving = false;
function json(res, code, value) { res.writeHead(code, {'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(value)); }
async function upload(req, res, url) {
  if (req.headers['x-editor-token'] !== token || ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(req.headers.origin)) return json(res,403,{error:'Open the editor from the local preview.'});
  if (saving) return json(res,409,{error:'Another clip is saving. Please try again when it finishes.'});
  const extension = path.extname(url.searchParams.get('filename') || '').toLowerCase();
  const title = (url.searchParams.get('title') || '').trim();
  if (!['.mp4','.webm'].includes(extension) || !title || title.length > 100) return json(res,400,{error:'Choose an MP4 or WebM and a title of up to 100 characters.'});
  const length = Number(req.headers['content-length']);
  if (!Number.isFinite(length) || length <= 0 || length > maxBytes) return json(res,413,{error:'Choose a non-empty video smaller than 80 MB.'});
  const category = url.searchParams.get('category');
  if (!['Cinematography','Video editing','Content creation'].includes(category)) return json(res,400,{error:'Choose a valid video category.'});
  saving = true;
  const directory = path.join(root,'assets','videos');
  const filename = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${extension}`;
  const target = path.join(directory,filename); const temporary = target + '.part';
  let stream; let count = 0; let signature = Buffer.alloc(0);
  try {
    const records = JSON.parse(await fsp.readFile(path.join(root,'videos.json'),'utf8')); if (!Array.isArray(records)) throw Error('Invalid video list.');
    await fsp.mkdir(directory,{recursive:true});
    stream = fs.createWriteStream(temporary,{flags:'wx'});
    // Attach a listener immediately so disk errors cannot become unhandled events.
    let diskError; stream.on('error', error => { diskError = error; });
    for await (const chunk of req) {
      count += chunk.length; if (count > maxBytes) throw Error('Video exceeds 80 MB.');
      if (signature.length < 16) signature = Buffer.concat([signature,chunk.subarray(0,16-signature.length)]);
      if (diskError) throw diskError;
      if (!stream.write(chunk)) await once(stream,'drain');
    }
    if (count !== length) throw Error('Upload was interrupted. Please try again.');
    const valid = extension === '.mp4' ? signature.subarray(4,8).toString() === 'ftyp' : signature.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
    if (!valid) throw Error('The selected file is not a recognised MP4 or WebM.');
    await new Promise((resolve,reject) => { stream.once('error',reject); stream.end(resolve); });
    await fsp.rename(temporary,target);
    records.push({title,category,caption:(url.searchParams.get('caption') || '').slice(0,500),src:`assets/videos/${filename}`});
    const listTemp = path.join(root,'videos.json.tmp'); await fsp.writeFile(listTemp,JSON.stringify(records,null,2)+'\n'); await fsp.rename(listTemp,path.join(root,'videos.json'));
    json(res,201,{saved:true});
  } catch (error) {
    if (stream) { stream.destroy(); if (!stream.closed) await once(stream,'close').catch(()=>{}); }
    await fsp.unlink(temporary).catch(()=>{}); await fsp.unlink(target).catch(()=>{});
    json(res,400,{error:error.message || 'Video could not be saved.'});
  } finally { saving = false; }
}
const server = http.createServer(async (req,res) => {
  if (![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)) {res.writeHead(403).end();return;}
  let url, pathname;
  try { url = new URL(req.url,`http://127.0.0.1:${port}`); pathname = decodeURIComponent(url.pathname); } catch {res.writeHead(400).end();return;}
  if (pathname === '/api/editor' && req.method === 'GET') return json(res,200,{token});
  if (pathname === '/api/videos' && req.method === 'POST') return upload(req,res,url);
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405).end();return;}
  const target = path.resolve(root,'.'+(pathname === '/' ? '/index.html' : pathname));
  const relative = path.relative(root,target);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part=>part.startsWith('.')) || target.endsWith('.part') || target.endsWith('.tmp')) {res.writeHead(403).end();return;}
  try {
    const stat = await fsp.stat(target); if (!stat.isFile()) {res.writeHead(404).end();return;}
    const headers = {'Content-Type':types[path.extname(target)] || 'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    let start=0,end=stat.size-1,code=200;
    if (req.headers.range) {
      const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!range || (!range[1] && !range[2])) {res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
      if (!range[1]) start=Math.max(0,stat.size-Number(range[2])); else {start=Number(range[1]);if(range[2])end=Math.min(Number(range[2]),end);}
      if (start>end || start>=stat.size || start<0) {res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
      headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;code=206;
    }
    headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(code,headers);
    if(req.method==='HEAD' || !stat.size)return res.end();
    const read=fs.createReadStream(target,{start,end});read.on('error',()=>res.destroy());res.on('close',()=>read.destroy());read.pipe(res);
  } catch {res.writeHead(404).end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
