// Meu Arquiteto IA - prototipo de pintura localizada (sem IA generativa)
// Cole este arquivo em worker.js da Cloudflare para testar o modo preciso.
// Mantem todos os pixels fora da area marcada. Nao faz edicao de moveis.
// A pintura usa composicao no navegador; o Worker serve a interface.
export default {
  async fetch(request) {
    if (request.method !== "GET") return new Response("Metodo nao permitido",{status:405});
    return new Response(PAGE,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
  }
};
const PAGE = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meu Arquiteto IA - Pintura precisa</title>
<style>body{background:#101d30;color:white;font:16px Arial;max-width:720px;margin:auto;padding:18px}h1{color:#78c8ff}button,input,select{font:inherit;margin:8px 0;padding:10px}button{background:#38aaff;border:0;border-radius:8px}canvas{width:100%;touch-action:none;border-radius:8px;background:#293647}p{line-height:1.45}.actions{display:flex;gap:8px;flex-wrap:wrap}.actions button{flex:1}a{color:#8bd4ff}</style>
<h1>Meu Arquiteto IA</h1><p><b>Teste: pintura localizada.</b> Escolha uma foto e pinte com o dedo apenas a parede existente. O resto da imagem permanece idêntico.</p>
<input id="file" type="file" accept="image/jpeg,image/png,image/webp"><p>Cor: <input id="color" type="color" value="#a5a9ad"> Intensidade: <input id="strength" type="range" min="10" max="90" value="65"> Pincel: <input id="brush" type="range" min="5" max="120" value="35"></p>
<canvas id="view"></canvas><div class="actions"><button id="undo">Desfazer pincelada</button><button id="reset">Limpar pintura</button><button id="save">Baixar resultado</button></div><p id="status">Selecione uma foto JPG, PNG ou WebP.</p>
<script>
const canvas=document.getElementById('view'),ctx=canvas.getContext('2d'),mask=document.createElement('canvas'),mc=mask.getContext('2d'),file=document.getElementById('file'),status=document.getElementById('status');
let original=null,painting=false,last=null,history=[];
file.onchange=async()=>{try{const f=file.files[0];if(!f)return;const bmp=await createImageBitmap(f);const s=Math.min(1,1200/Math.max(bmp.width,bmp.height));canvas.width=mask.width=Math.round(bmp.width*s);canvas.height=mask.height=Math.round(bmp.height*s);ctx.drawImage(bmp,0,0,canvas.width,canvas.height);bmp.close();original=ctx.getImageData(0,0,canvas.width,canvas.height);mc.clearRect(0,0,mask.width,mask.height);history=[];render();status.textContent='Pinte com o dedo somente a parede.'}catch(e){status.textContent='Não foi possível abrir a foto. Tente JPG ou PNG.'}};
function pos(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
function stroke(a,b){mc.strokeStyle='#fff';mc.lineWidth=+document.getElementById('brush').value*canvas.width/700;mc.lineCap='round';mc.lineJoin='round';mc.beginPath();mc.moveTo(a.x,a.y);mc.lineTo(b.x,b.y);mc.stroke()}
canvas.onpointerdown=e=>{if(!original)return;canvas.setPointerCapture(e.pointerId);history.push(mc.getImageData(0,0,mask.width,mask.height));if(history.length>15)history.shift();painting=true;last=pos(e);stroke(last,last);render()};
canvas.onpointermove=e=>{if(!painting)return;const p=pos(e);stroke(last,p);last=p;render()};
canvas.onpointerup=canvas.onpointercancel=()=>{painting=false;last=null};
function render(){if(!original)return;const out=new ImageData(new Uint8ClampedArray(original.data),canvas.width,canvas.height),m=mc.getImageData(0,0,mask.width,mask.height).data,c=document.getElementById('color').value;const rgb=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));const opacity=+document.getElementById('strength').value/100;for(let i=0;i<out.data.length;i+=4){const a=m[i+3]/255*opacity;if(!a)continue;const lum=(original.data[i]*.299+original.data[i+1]*.587+original.data[i+2]*.114)/255;for(let k=0;k<3;k++){const target=Math.min(255,rgb[k]*(.55+.65*lum));out.data[i+k]=original.data[i+k]*(1-a)+target*a}}ctx.putImageData(out,0,0)}
document.getElementById('color').oninput=render;document.getElementById('strength').oninput=render;
document.getElementById('undo').onclick=()=>{if(history.length){mc.putImageData(history.pop(),0,0);render()}};
document.getElementById('reset').onclick=()=>{mc.clearRect(0,0,mask.width,mask.height);history=[];render()};
document.getElementById('save').onclick=()=>{if(!original)return;render();const a=document.createElement('a');a.download='meu-arquiteto-pintura.png';a.href=canvas.toDataURL('image/png');a.click()};
</script></html>`;
