// Gorilla Rush (Oculus Go) — núcleo original do Gorilla Rush (Cardboard), adaptado. Assets agora são arquivos em assets/ (antes base64 embutido).
const ASSET='assets/';
// HOOK: pontos de extensão usados pelos módulos da versão Oculus Go (vr.js, input.js, locomotion.js, modes.js, vrmenu.js). Vazio = comportamento original.
const HOOK={};let SCORE={};
function toast(t,ms){if(HOOK.toast&&HOOK.toast(t,ms))return;const d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:8px;right:8px;top:8px;z-index:99;background:#000a;color:#fff;padding:8px;border-radius:8px;font:13px sans-serif;text-align:center';document.body.appendChild(d);setTimeout(()=>d.remove(),ms||5000)}
const $=id=>document.getElementById(id),V3=(x,y,z)=>new THREE.Vector3(x,y,z),st=t=>$('st').textContent=t;
const R=new THREE.WebGLRenderer({canvas:$('c'),alpha:true,antialias:false,powerPreference:'high-performance'});
R.outputEncoding=THREE.sRGBEncoding;R.shadowMap.type=THREE.PCFShadowMap;R.toneMapping=THREE.NoToneMapping;
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(70,1,.1,260);
const sk=document.createElement('canvas');sk.width=2;sk.height=256;const skx=sk.getContext('2d'),gr=skx.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#2f86e6');gr.addColorStop(.55,'#86c8ff');gr.addColorStop(1,'#e6f5ff');skx.fillStyle=gr;skx.fillRect(0,0,2,256);
const SKY=new THREE.CanvasTexture(sk);SKY.encoding=THREE.sRGBEncoding;const FOG=new THREE.Fog(0xbde0ff,60,240);
const skyT=new THREE.TextureLoader().load(ASSET+'textures/sky.jpg');skyT.encoding=THREE.sRGBEncoding;skyT.wrapS=THREE.RepeatWrapping;skyT.repeat.set(2,1);
function bakeSky(){const W=768,H=384,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),im=x.createImageData(W,H),D=im.data;
const fr=v=>v-Math.floor(v),h3=(a,b,d)=>{a=fr(a*.3183099+.1)*17;b=fr(b*.3183099+.1)*17;d=fr(d*.3183099+.1)*17;return fr(a*b*d*(a+b+d))},mx=(a,b,t)=>a+(b-a)*t;
const n3=(X,Y,Z)=>{const ix=Math.floor(X),iy=Math.floor(Y),iz=Math.floor(Z);let fx=X-ix,fy=Y-iy,fz=Z-iz;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);fz=fz*fz*(3-2*fz);
return mx(mx(mx(h3(ix,iy,iz),h3(ix+1,iy,iz),fx),mx(h3(ix,iy+1,iz),h3(ix+1,iy+1,iz),fx),fy),mx(mx(h3(ix,iy,iz+1),h3(ix+1,iy,iz+1),fx),mx(h3(ix,iy+1,iz+1),h3(ix+1,iy+1,iz+1),fx),fy),fz)};
const fbm=(X,Y,Z)=>{let a=.5,r=0;for(let k=0;k<4;k++){r+=a*n3(X,Y,Z);X=X*2.03+1.7;Y=Y*2.03+9.2;Z=Z*2.03+3.1;a*=.5}return r};
const ss=(a,b,v)=>{v=Math.max(0,Math.min(1,(v-a)/(b-a)));return v*v*(3-2*v)};
const hor=[.74,.89,1],zen=[.04,.38,.95],sd=(()=>{const l=Math.hypot(30,55,20);return[30/l,55/l,20/l]})();
for(let py=0;py<H;py++){const lat=(.5-py/H)*Math.PI,cl=Math.cos(lat),dy=Math.sin(lat);for(let px=0;px<W;px++){const lon=(px/W-.5)*2*Math.PI,dx=cl*Math.cos(lon),dz=cl*Math.sin(lon);
let t=Math.pow(Math.max(dy,0),.5),r=mx(hor[0],zen[0],t),g=mx(hor[1],zen[1],t),b=mx(hor[2],zen[2],t);
if(dy>0){const k=1/(dy+.22);let cc=fbm(dx*k*1.4,dz*k*1.4,3);cc=ss(.46,.76,cc)*ss(0,.2,dy)*.95;r+=(1-r)*cc;g+=(1-g)*cc;b+=(1-b)*cc}
const sg=Math.max(dx*sd[0]+dy*sd[1]+dz*sd[2],0),gl=Math.pow(sg,500)*1.2+Math.pow(sg,10)*.1;r+=gl;g+=gl*.93;b+=gl*.75;
const o=(py*W+px)*4;D[o]=Math.min(255,r*255);D[o+1]=Math.min(255,g*255);D[o+2]=Math.min(255,b*255);D[o+3]=255}}
x.putImageData(im,0,0);const T=new THREE.CanvasTexture(c);T.generateMipmaps=false;T.minFilter=T.magFilter=THREE.LinearFilter;T.wrapS=THREE.RepeatWrapping;return T}
const dome=new THREE.Mesh(new THREE.SphereGeometry(100,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,uniforms:{tex:{value:bakeSky()}},
vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*vec4((viewMatrix*vec4(position,0.)).xyz,1.);p.z=p.w*.9999;gl_Position=p;}',
fragmentShader:'uniform sampler2D tex;varying vec3 vD;void main(){vec3 d=normalize(vD);vec2 uv=vec2(atan(d.z,d.x)*.15915494+.5,asin(clamp(d.y,-1.,1.))*.31830989+.5);gl_FragColor=vec4(texture2D(tex,uv).rgb,1.);}'}));dome.renderOrder=-1;dome.visible=false;dome.frustumCulled=false;S.add(dome);S.add(sun0());
function sun0(){return new THREE.Object3D()}
S.add(new THREE.HemisphereLight(0xd6ecff,0x8a7a58,.7));S.add(new THREE.AmbientLight(0xffffff,.18));const sun=new THREE.DirectionalLight(0xfff0cf,1.15);sun.position.set(30,60,20);S.add(sun);S.add(sun.target);
let gfx=0,dpr=1,vrView=false,vrOn=true;let SHOW_NAMES=false;function prCap(){return gfx==0?.75:gfx==1?.9:Math.min(devicePixelRatio,1.5)}function pr(){R.setPixelRatio(Math.min(dpr,prCap()))}
function rs(){if(HOOK.rs&&HOOK.rs())return;pr();R.setSize(innerWidth,innerHeight,false);cam.fov=vrView?80:70;cam.aspect=vrView?(innerWidth/2)/innerHeight:innerWidth/innerHeight;cam.far=gfx==0?100:gfx==1?140:260;FOG.near=gfx==0?25:gfx==1?40:60;FOG.far=cam.far*.92;cam.updateProjectionMatrix()}addEventListener('resize',rs);rs();$('gfx').onchange=e=>{gfx=+e.target.value;rs()};$('vr').onchange=e=>{vrOn=+e.target.value==1};
const DOWN=V3(0,-1,0),loader=new THREE.GLTFLoader();
// ---------- colisão (grade 2D de triângulos) ----------
const CS=1,GM=new Map();let TM=null,TB=null,TRI=null,stamp=null,sc=0;
function buildGrid(ms){let n=0;ms.forEach(m=>n+=m.geometry.index.count/3);TRI=new Float32Array(n*9);TM=new Uint8Array(n);let t=0;GM.clear();
 ms.forEach(m=>{const cl=(m.material.userData&&m.material.userData.cls)|0,p=m.geometry.attributes.position.array,ix=m.geometry.index.array;for(let i=0;i<ix.length;i+=3){for(let k=0;k<3;k++){const v=ix[i+k]*3,o=t*9+k*3;TRI[o]=p[v];TRI[o+1]=p[v+1];TRI[o+2]=p[v+2]}TM[t]=cl;t++}});
 stamp=new Uint32Array(n);TB=new Float32Array(n*6);
 for(let i=0;i<n;i++){const b=i*9,x0=Math.min(TRI[b],TRI[b+3],TRI[b+6]),x1=Math.max(TRI[b],TRI[b+3],TRI[b+6]),z0=Math.min(TRI[b+2],TRI[b+5],TRI[b+8]),z1=Math.max(TRI[b+2],TRI[b+5],TRI[b+8]);{const o6=i*6;TB[o6]=x0;TB[o6+1]=Math.min(TRI[b+1],TRI[b+4],TRI[b+7]);TB[o6+2]=z0;TB[o6+3]=x1;TB[o6+4]=Math.max(TRI[b+1],TRI[b+4],TRI[b+7]);TB[o6+5]=z1}
  for(let a=Math.floor(x0/CS);a<=Math.floor(x1/CS);a++)for(let c=Math.floor(z0/CS);c<=Math.floor(z1/CS);c++){const k=a*4096+c;let l=GM.get(k);if(!l){l=[];GM.set(k,l)}l.push(i)}}}
function hit(o,d,far){const ex=o.x+d.x*far,ez=o.z+d.z*far,a0=Math.floor(Math.min(o.x,ex)/CS),a1=Math.floor(Math.max(o.x,ex)/CS),c0=Math.floor(Math.min(o.z,ez)/CS),c1=Math.floor(Math.max(o.z,ez)/CS);sc++;let bt=far,bi=-1;const ey=o.y+d.y*far,qx0=Math.min(o.x,ex)-.01,qx1=Math.max(o.x,ex)+.01,qy0=Math.min(o.y,ey)-.01,qy1=Math.max(o.y,ey)+.01,qz0=Math.min(o.z,ez)-.01,qz1=Math.max(o.z,ez)+.01;
 for(let a=a0;a<=a1;a++)for(let c=c0;c<=c1;c++){const l=GM.get(a*4096+c);if(!l)continue;
  for(let q=0;q<l.length;q++){const i=l[q];if(stamp[i]===sc)continue;stamp[i]=sc;const t6=i*6;if(TB[t6]>qx1||TB[t6+3]<qx0||TB[t6+1]>qy1||TB[t6+4]<qy0||TB[t6+2]>qz1||TB[t6+5]<qz0)continue;const b=i*9,ax=TRI[b],ay=TRI[b+1],az=TRI[b+2],e1x=TRI[b+3]-ax,e1y=TRI[b+4]-ay,e1z=TRI[b+5]-az,e2x=TRI[b+6]-ax,e2y=TRI[b+7]-ay,e2z=TRI[b+8]-az;
   const px=d.y*e2z-d.z*e2y,py=d.z*e2x-d.x*e2z,pz=d.x*e2y-d.y*e2x,det=e1x*px+e1y*py+e1z*pz;if(det>-1e-9&&det<1e-9)continue;const iv=1/det,tx=o.x-ax,ty=o.y-ay,tz=o.z-az,u=(tx*px+ty*py+tz*pz)*iv;if(u<0||u>1)continue;
   const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,v=(d.x*qx+d.y*qy+d.z*qz)*iv;if(v<0||u+v>1)continue;const t=(e2x*qx+e2y*qy+e2z*qz)*iv;if(t>1e-4&&t<bt){bt=t;bi=i}}}
 if(bi<0)return null;const b=bi*9,e1=V3(TRI[b+3]-TRI[b],TRI[b+4]-TRI[b+1],TRI[b+5]-TRI[b+2]),e2=V3(TRI[b+6]-TRI[b],TRI[b+7]-TRI[b+1],TRI[b+8]-TRI[b+2]),n=e1.cross(e2).normalize();if(n.dot(d)>0)n.negate();
 return{distance:bt,point:V3(o.x+d.x*bt,o.y+d.y*bt,o.z+d.z*bt),n,cls:TM[bi]}}
function faceQ(f){return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V3(-f.z,0,f.x),V3(0,1,0),V3(-f.x,0,-f.z)))}
// ---------- estado ----------
// TUNE: parâmetros físicos ajustáveis (Gorilla Locomotion). Valores 1/9.8/5.5/6 = jogo original.
const TUNE={imp:1,jmp:1,grav:9.8,fric:5.5,max:6,spd:1};
let state='lobby',mapG=null,mapMeshes=[],pl=null,pg=new THREE.Group(),LM=null,mats=[],spawn=V3(0,5,0),floorMin=-50,stumpTop=null,mapDone=false,L1=.5,L2=.5,ARM=1,color='#ffffff';
const P=V3(),vel=V3(),me={id:'me',nick:'Gorilla'},RM={},RO={},bots=[];let itId=null,cd=0,tstart=0,NET={peer:null,host:true,hc:null,conns:{},pub:true,mode:'tag',code:''},pit=0,yw=0,gyro=false;
function chk(){refreshAcc();if(pl&&mapDone){['qj','jn'].forEach(i=>$(i).disabled=false);st('Pronto! Escolha um nome e uma cor.')}}['qj','jn'].forEach(i=>$(i).disabled=true);
try{$('nick').value=localStorage.getItem('gr_nick')||''}catch(e){}
// ---------- cor / textura pegador ----------
function paint(ms,hex){const c=new THREE.Color(hex);ms.forEach(m=>{if(m.map===LAVA)return;if(m.name=='darkfur')m.color.copy(c);else if(m.name=='lightfur')m.color.copy(c).lerp(new THREE.Color(1,1,1),.45)})}
function setColor(h){color=h;$('col').value=h;if(pl)paint(mats,h)}
['#ffffff','#3a2a20','#e53935','#1e88e5','#43a047','#fdd835','#8e24aa','#ff7043'].forEach(c=>{const d=document.createElement('div');d.className='sw';d.style.background=c;d.onclick=()=>setColor(c);$('sws').appendChild(d)});
$('col').oninput=e=>setColor(e.target.value);
const LAVA=new THREE.TextureLoader().load(ASSET+'textures/lava.jpg');LAVA.wrapS=LAVA.wrapT=THREE.RepeatWrapping;LAVA.flipY=false;LAVA.encoding=THREE.sRGBEncoding;
const PRIS={};
function mark(ms,on,hex){ms.forEach(m=>{const p=PRIS[m.name];if(on){if(m.map!==LAVA){m.map=LAVA;m.color.set(0xffffff);m.needsUpdate=true}}else if(m.map===LAVA){m.map=p?p.map:null;m.color.set(0xffffff);m.needsUpdate=true}});if(!on)paint(ms,hex||color)}
// ---------- modelo / rig ----------
function cloneMats(o,list){o.traverse(m=>{if(m.isMesh){m.frustumCulled=false;m.castShadow=true;const src=m.material;if(!PRIS[src.name]&&src.map!==LAVA)PRIS[src.name]={map:src.map};const c=src.clone();c.userData={};const p=PRIS[src.name];if(p&&c.map!==p.map)c.map=p.map;if(c.map&&c.map!==LAVA){const t=c.map;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.NearestFilter;t.anisotropy=R.capabilities.getMaxAnisotropy();t.needsUpdate=true}if(c.name=='gorillatexture'){c.polygonOffset=true;c.polygonOffsetFactor=-2;c.polygonOffsetUnits=-2;c.color.set(0xffffff)}m.material=c;list.push(c)}})}
function rig(o){const b={};o.traverse(x=>{if(x.isBone)b[x.name]=x});const F=p=>Object.values(b).find(x=>x.name.startsWith(p));
 const M={uL:F('upper_arm_L'),fL:F('forearm_L'),hL:F('hand_L'),uR:F('upper_arm_R'),fR:F('forearm_R'),hR:F('hand_R'),head:F('head')};M.hq=M.head.quaternion.clone();
 for(const k of ['L','R']){const g=n=>Object.values(b).find(x=>new RegExp('^'+n+'_'+k+'_\\d+$').test(x.name));M['pm'+k]=g('palm_02');M['ix'+k]=g('f_index_01');M['md'+k]=g('f_middle_01');
  M['fi'+k]=[1,2,3].map(n=>g('f_index_0'+n));M['fm'+k]=[1,2,3].map(n=>g('f_middle_0'+n));M['ft'+k]=[1,2,3].map(n=>g('thumb_0'+n));
  [].concat(M['fi'+k],M['fm'+k],M['ft'+k]).forEach(x=>{if(x&&!REST[x.name])REST[x.name]=x.quaternion.clone()})}
 return M}
const REST={};
const _lq=new THREE.Quaternion(),_Y=V3(0,1,0);
function placeLab(M,g){g.updateMatrixWorld(true);M.lab.position.copy(g.worldToLocal(M.o.localToWorld(V3(0,-.09,.2))))}
function faceCam(M,g){M.lab.visible=SHOW_NAMES||state=='lobby';M.lab.parent.getWorldQuaternion(_lq).invert();M.lab.quaternion.copy(_lq).multiply(cam.quaternion);const d=M.lab.getWorldPosition(V3()).distanceTo(cam.position);M.lab.scale.setScalar(Math.max(1,Math.min(3,d/5)))}
const BLOBT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(0,0,0,.75)');g.addColorStop(.6,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
function mkBlob(){const gm=new THREE.CircleGeometry(1,20);gm.rotateX(-Math.PI/2);const m=new THREE.Mesh(gm,new THREE.MeshBasicMaterial({map:BLOBT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,toneMapped:false}));m.renderOrder=1;m.frustumCulled=false;m.visible=false;S.add(m);return m}
function setBlob(b,x,y,z,gp){if(!gp){b.visible=false;return}const h=Math.max(0,y-gp.point.y);b.visible=true;b.position.set(x,gp.point.y+.03,z);if(gp.n)b.quaternion.setFromUnitVectors(_Y,gp.n.clone().normalize());const f=Math.max(0,1-h/9);b.scale.setScalar(.5+.15*f);b.material.opacity=.1+.45*f}
function mkLabel(t){const c=document.createElement('canvas');c.width=256;c.height=64;const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(.46,.115),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,depthTest:true,toneMapped:false}));m.renderOrder=5;m.position.set(0,.5,0);m.userData={c,tx};setLabel(m,t);return m}
function setLabel(m,t){const c=m.userData.c,x=c.getContext('2d');x.clearRect(0,0,256,64);x.font='40px GT,system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='#000';t=String(t).toUpperCase();x.strokeText(t,128,34);x.fillStyle='#fff';x.fillText(t,128,34);m.userData.tx.needsUpdate=true}
function mkModel(hex,nick){const o=THREE.SkeletonUtils.clone(pl),m=[];{const rm=[];o.traverse(x=>{if(x.userData&&x.userData.acc)rm.push(x)});rm.forEach(x=>x.parent&&x.parent.remove(x))}cloneMats(o,m);paint(m,hex);const g=new THREE.Group();g.add(o);S.add(g);const M=rig(o);Object.assign(M,{g,o,m});M.head.scale.copy(LM.hs);M.pnL=LM.pnL;M.pnR=LM.pnR;M.lab=mkLabel(nick);g.add(M.lab);placeLab(M,g);M.blob=mkBlob();return M}
function build(g){pl=g.scene;cloneMats(pl,mats);paint(mats,color);pg.add(pl);S.add(pg);pg.updateMatrixWorld(true);
 const M=rig(pl),W=b=>b.getWorldPosition(V3());
 const sL=W(M.uL),sR=W(M.uR),hL=W(M.hL),hR=W(M.hR),hd=W(M.head),bd=W(pl.getObjectByName('body_01'));
 const r1=W(M.uL).distanceTo(W(M.fL)),r2=W(M.fL).distanceTo(W(M.hL)),Rr=hR.clone().sub(hL).normalize(),Up=hd.clone().sub(bd).normalize();
 const Bk=Rr.clone().cross(Up).normalize(),U2=Bk.clone().cross(Rr).normalize();
 const qM=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Rr,U2,Bk)).invert();
 const s0=1/(r1+r2),mid=sL.clone().add(sR).multiplyScalar(.5);
 ['L','R'].forEach(k=>{const hb=M['h'+k];hb.updateWorldMatrix(true,false);M['pn'+k]=Up.clone().negate().applyQuaternion(hb.getWorldQuaternion(new THREE.Quaternion()).invert())});pl.scale.setScalar(s0);pl.quaternion.copy(qM);pl.position.copy(mid.applyQuaternion(qM).multiplyScalar(-s0));pg.updateMatrixWorld(true);
 L1=r1*s0;L2=r2*s0;ARM=(L1+L2)*.98;LM=Object.assign(M,{g:pg,o:pl,m:mats});LM.hs=LM.head.scale.clone();LM.lab=mkLabel('Gorilla');pg.add(LM.lab);placeLab(LM,pg);LM.blob=mkBlob();document.fonts&&document.fonts.ready.then(()=>LM.nk=null);
 chk()}
let gl=[];
const ACC_IDS=['c_hawaii','g_white','h_top','h_party','h_banana','h_penguin'];
const ACCT={};let accReady=false,myAcc={g:'',h:'',c:'',y:0,z:0};try{const a=JSON.parse(localStorage.getItem('gr_acc')||'{}');myAcc.g=typeof a.g=='string'?a.g:'';myAcc.h=typeof a.h=='string'?a.h:'';myAcc.c=typeof a.c=='string'?a.c:'';myAcc.y=+a.y||0;myAcc.z=+a.z||0}catch(e){}
try{if(localStorage.getItem('gr_acc_v')!=='3'){myAcc.y=0;myAcc.z=0;localStorage.setItem('gr_acc_v','3')}}catch(e){}
const ACC_ADJ={h_top:[0,2.2,5.6],h_party:[0,3,5.2],h_banana:[0,3,3.6],h_penguin:[0,3,3.6]};
const hasAcc=id=>typeof id=='string'&&Object.prototype.hasOwnProperty.call(ACCT,id);
function setAcc(M,list){if(!M||!M.head||!accReady)return false;list=Array.isArray(list)?list:[];
 for(let i=M.head.children.length-1;i>=0;i--){const c=M.head.children[i];if(c.userData&&c.userData.acc)M.head.remove(c)}
 for(let i=M.o.children.length-1;i>=0;i--){const c=M.o.children[i];if(c.userData&&c.userData.cl)M.o.remove(c)}
 const G=new THREE.Group();G.userData.acc=true;let gl2=null,hd=null,cl=null;
 list.slice(0,3).forEach(id=>{if(!hasAcc(id))return;if(id[0]=='g'&&!gl2)gl2=id;else if(id[0]=='h'&&!hd)hd=id;else if(id[0]=='c'&&!cl)cl=id});
 const hy=Math.max(-8,Math.min(8,+list[3]||0)),hz=Math.max(-8,Math.min(8,+list[4]||0)),nf=x=>{if(x.isMesh){x.frustumCulled=false;x.castShadow=false;x.receiveShadow=false}};
 [gl2,hd].forEach(id=>{if(!id)return;const c=ACCT[id].clone(true),ad=ACC_ADJ[id]||[0,0,0],h=id[0]=='h';c.position.set(ad[0],ad[1]+(h?hy:0),ad[2]+(h?hz:0));c.traverse(nf);G.add(c)});
 M.head.add(G);
 if(cl){const c=ACCT[cl].clone(true);c.userData.acc=true;c.userData.cl=true;c.traverse(nf);M.o.add(c)}
 return true}
const accList=a=>[a.g||'',a.h||'',a.c||'',+a.y||0,+a.z||0];
function refreshAcc(){if(LM)setAcc(LM,accList(myAcc))}
(function(){const ids=ACC_IDS;let n=0;const done=()=>{if(++n==ids.length){accReady=true;refreshAcc()}};
 ids.forEach(id=>{try{loader.load(ASSET+'models/acc/'+id+'.glb',gg=>{gg.scene.traverse(x=>{if(x.isMesh&&x.material&&x.material.transparent){x.material.transparent=false;x.material.depthWrite=true;x.material.alphaTest=.5;x.material.needsUpdate=true}});ACCT[id]=gg.scene;done()},undefined,()=>done())}catch(e){done()}})})();
$('accg').value=myAcc.g;$('acch').value=myAcc.h;myAcc.g=$('accg').value;myAcc.h=$('acch').value;$('accc').value=myAcc.c;myAcc.c=$('accc').value;$('ahy').value=myAcc.y;$('ahz').value=myAcc.z;
const accSave=()=>{myAcc.g=$('accg').value;myAcc.h=$('acch').value;myAcc.c=$('accc').value;myAcc.y=+$('ahy').value;myAcc.z=+$('ahz').value;try{localStorage.setItem('gr_acc',JSON.stringify(myAcc))}catch(e){}refreshAcc()};
['accg','acch','accc'].forEach(i=>$(i).onchange=accSave);['ahy','ahz'].forEach(i=>$(i).oninput=accSave);
st('Carregando macaco…');loader.load(ASSET+'models/player.glb',g=>{build(g);HOOK.playerBuilt&&HOOK.playerBuilt()},undefined,e=>st('Erro no modelo: '+e));
const _q=new THREE.Quaternion();
function aim(u,e,t){const pa=u.parent,a=pa.worldToLocal(u.getWorldPosition(V3())),c=pa.worldToLocal(e.getWorldPosition(V3())),tt=pa.worldToLocal(t.clone()),cu=c.sub(a),de=tt.sub(a);
 if(cu.lengthSq()<1e-12||de.lengthSq()<1e-12)return;u.quaternion.premultiply(_q.setFromUnitVectors(cu.normalize(),de.normalize()));u.updateMatrixWorld(true)}
function arm2(M,k,T,fw,rt,sc){const u=M['u'+k],fa=M['f'+k],h=M['h'+k];if(!(u&&fa&&h))return;const l1=L1*(sc||1),l2=L2*(sc||1);
 const S0=u.getWorldPosition(V3()),d0=T.clone().sub(S0),d=Math.max(.05,Math.min(d0.length(),(l1+l2)*.995)),dir=d0.normalize();
 const a=(l1*l1-l2*l2+d*d)/(2*d),hh=Math.sqrt(Math.max(l1*l1-a*a,0));
 const pole=rt.clone().multiplyScalar(k=='L'?-.6:.6).add(V3(0,-1,0)).addScaledVector(fw,-.2),pv=pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
 aim(u,fa,S0.clone().addScaledVector(dir,a).addScaledVector(pv,hh));aim(fa,h,S0.clone().addScaledVector(dir,d))}
function rotLocal(bn,ax,ang){const pa=bn.parent,w=bn.getWorldPosition(V3()),a=pa.worldToLocal(w.clone()),b=pa.worldToLocal(w.clone().add(ax));bn.quaternion.premultiply(_q.setFromAxisAngle(b.sub(a).normalize(),ang));bn.updateMatrixWorld(true)}
const _wq=new THREE.Quaternion();
function handPose(M,k,d,A,cv){const h=M['h'+k],pm=M['pm'+k],ix=M['ix'+k],md=M['md'+k];if(!(h&&pm&&ix&&md))return;
 h.updateWorldMatrix(true,false);const hp=h.getWorldPosition(V3());
 if(d&&A){aim(h,pm,hp.clone().add(d));h.updateMatrixWorld(true);
  const dc=pm.getWorldPosition(V3()).sub(hp).normalize(),ac=ix.getWorldPosition(V3()).sub(md.getWorldPosition(V3()));ac.addScaledVector(dc,-ac.dot(dc));
  const ad=A.clone().addScaledVector(dc,-A.dot(dc));
  if(ac.lengthSq()>1e-10&&ad.lengthSq()>1e-6){ac.normalize();ad.normalize();rotLocal(h,dc,Math.atan2(dc.dot(V3().crossVectors(ac,ad)),ac.dot(ad)))}}
 const dc2=pm.getWorldPosition(V3()).sub(hp).normalize(),H=ix.getWorldPosition(V3()).sub(md.getWorldPosition(V3()));H.addScaledVector(dc2,-H.dot(dc2));if(H.lengthSq()<1e-10)return;H.normalize();
 let sg=M['sgc'+k]||1;if(M['pn'+k]&&((d&&A)||!M['sgc'+k])){const pn=M['pn'+k].clone().applyQuaternion(h.getWorldQuaternion(_wq));sg=Math.sign(V3().crossVectors(H,dc2).dot(pn))||1;if(d&&A)M['sgc'+k]=sg}
 const ax=H.multiplyScalar(sg),ch=[[M['fi'+k],cv[1],[1.15,1.3,.9]],[M['fm'+k],cv[2],[1.15,1.3,.9]],[M['ft'+k],cv[0],[.55,.7,.55]]];
 ch.forEach(([arr,c,mx])=>arr.forEach((bn,i)=>{if(!bn||!REST[bn.name])return;bn.quaternion.copy(REST[bn.name]);bn.updateMatrixWorld(true);rotLocal(bn,ax,c*mx[i])}))}
function headLook(M,p,rt){const h=M.head;h.quaternion.copy(M.hq);h.updateWorldMatrix(true,false);const pa=h.parent,w=h.getWorldPosition(V3()),a=pa.worldToLocal(w.clone()),b=pa.worldToLocal(w.clone().add(rt));
 h.quaternion.premultiply(_q.setFromAxisAngle(b.sub(a).normalize(),p));h.updateMatrixWorld(true)}
// ---------- mapa ----------
function flat(){const m=new THREE.Mesh(new THREE.PlaneGeometry(400,400).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x4a8a4a,side:2}));S.add(m);mapMeshes=[m];buildGrid(mapMeshes);spawn=V3(0,1.3,0);floorMin=-30}
function satTex(u){const tx=new THREE.Texture(),im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');
 if(typeof x.filter==='string'){x.filter='saturate(1.45) contrast(1.06)';x.drawImage(im,0,0)}else{x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height),a=d.data;for(let i=0;i<a.length;i+=4){const l=.299*a[i]+.587*a[i+1]+.114*a[i+2];for(let k=0;k<3;k++)a[i+k]=Math.max(0,Math.min(255,l+(a[i+k]-l)*1.45))}x.putImageData(d,0,0)}tx.image=c}catch(e){tx.image=im}tx.needsUpdate=true};im.src=u;return tx}
async function loadParkMap(){try{
 st('Carregando mapa…');
  const ab=await fetchMapBin(ASSET+'maps/park.bin');
 const hl2=new DataView(ab).getUint32(0,true),H=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,4,hl2))),b0=4+hl2;
 const mt=H.m.map(m=>{const o={color:new THREE.Color(m.c[0],m.c[1],m.c[2]),side:THREE.DoubleSide};
  if(m.t){const u=URL.createObjectURL(new Blob([ab.slice(b0+m.t[0],b0+m.t[0]+m.t[1])],{type:'image/'+m.t[2]}));const tx=satTex(u);tx.flipY=false;tx.anisotropy=R.capabilities.getMaxAnisotropy();tx.generateMipmaps=false;tx.minFilter=THREE.NearestFilter;tx.magFilter=THREE.NearestFilter;tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.encoding=THREE.sRGBEncoding;o.map=tx;o.color=new THREE.Color(1.15,1.15,1.15)}
  if(m.a=='MASK')o.alphaTest=.5;if(!o.map){const hs={};o.color.getHSL(hs);o.color.setHSL(hs.h,Math.min(1,hs.s*1.6+.08),Math.min(.9,hs.l*1.06))}const mm=new THREE.MeshLambertMaterial(o);mm.userData.cls=SURF(m.n);return mm});
 mapG=new THREE.Group();mapMeshes=[];
 H.g.forEach(g=>{const q=new Uint16Array(ab.slice(b0+g.op,b0+g.op+g.nv*6)),qu=new Uint16Array(ab.slice(b0+g.ou,b0+g.ou+g.nv*4)),ix=new Uint16Array(ab.slice(b0+g.oi,b0+g.oi+g.ni*2));
  const P2=new Float32Array(g.nv*3),U=new Float32Array(g.nv*2);
  for(let i=0;i<g.nv*3;i++)P2[i]=H.bm[i%3]+q[i]/65535*H.bs[i%3];
  for(let i=0;i<g.nv*2;i++)U[i]=g.um[i%2]+qu[i]/65535*g.ur[i%2];
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(P2,3));ge.setAttribute('uv',new THREE.BufferAttribute(U,2));ge.setIndex(new THREE.BufferAttribute(ix,1));ge.computeVertexNormals();ge.computeBoundingSphere();
  const me2=new THREE.Mesh(ge,mt[g.m>=0?g.m:0]);mapG.add(me2);mapMeshes.push(me2)});
 S.add(mapG);mapG.visible=false;mapMeshes.forEach(m=>{m.receiveShadow=true;m.castShadow=false});
 st('Preparando colisão…');await new Promise(r=>setTimeout(r,30));
 buildGrid(mapMeshes.filter(m=>!m.material.alphaTest));
 let sx=0,sz=0,cn=0;mapMeshes.forEach(m=>{const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){sx+=a[i];sz+=a[i+2];cn++}});sx/=cn;sz/=cn;
 const b=new THREE.Box3().setFromObject(mapG);floorMin=b.min.y-30;spawn=null;let best=1e9;
 for(let dx=-20;dx<=20;dx+=5)for(let dz=-20;dz<=20;dz+=5){const h=hit(V3(sx+dx,b.max.y+5,sz+dz),DOWN,b.max.y-b.min.y+10);if(h){const s2=h.point.y+Math.hypot(dx,dz)*.15;if(s2<best){best=s2;spawn=h.point.clone().add(V3(0,1.2,0))}}}
 spawn=spawn||V3(sx,b.max.y,sz);
  stumpAt=V3(3.3,0,-9.25);{const sp=stumpSpot();if(sp)spawn=sp;else stumpAt=null}
  {const by=new Map();mapMeshes.forEach(m=>{const c=m.geometry.boundingSphere.center,cs=m.material.alphaTest?16:32,k=m.material.uuid+'|'+Math.floor(c.x/cs)+'|'+Math.floor(c.z/cs);let a=by.get(k);if(!a)by.set(k,a=[]);a.push(m)});
  const mg=[];by.forEach(arr=>{let nv=0,ni=0;arr.forEach(m=>{nv+=m.geometry.attributes.position.count;ni+=m.geometry.index.count});
   const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=new Uint32Array(ni);let vo=0,io=0;
   arr.forEach(m=>{const g=m.geometry,c=g.attributes.position.count,ix=g.index.array;pos.set(g.attributes.position.array,vo*3);nor.set(g.attributes.normal.array,vo*3);uv.set(g.attributes.uv.array,vo*2);for(let i=0;i<ix.length;i++)idx[io+i]=ix[i]+vo;vo+=c;io+=ix.length;g.dispose()});
   const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));ge.setAttribute('normal',new THREE.BufferAttribute(nor,3));ge.setAttribute('uv',new THREE.BufferAttribute(uv,2));ge.setIndex(new THREE.BufferAttribute(idx,1));ge.computeBoundingSphere();
   const mm=new THREE.Mesh(ge,arr[0].material);mm.receiveShadow=true;mm.castShadow=false;mg.push(mm)});
  while(mapG.children.length)mapG.remove(mapG.children[0]);mg.forEach(m=>mapG.add(m));mapMeshes=mg}
 }catch(e){st('Erro no mapa ('+e+') – chão plano');flat()}
 mapDone=true;chk()}
// ---------- mãos ----------
const HO=[{d:null,A:null,c:[.3,.3,.3]},{d:null,A:null,c:[.3,.3,.3]}],slot=[{p:null,t:0},{p:null,t:0}],hl=[V3(-.22,-1.05,.02),V3(.22,-1.05,.02)],tgt=[V3(),V3()],ov=$('ov'),ox=ov.getContext('2d');let camOn=false;
async function startCam(){if(camOn)return;const v=$('v');
 let stream;try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:320},height:{ideal:240},frameRate:{ideal:30,max:30}},audio:false})}catch(e){stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false})}
 v.srcObject=stream;await v.play();$('cam').style.display='block';camOn=true;
 await loadHands();const H=new Hands({locateFile:f=>'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/'+f});H.setOptions({maxNumHands:2,modelComplexity:+$('ht').value,minDetectionConfidence:.5,minTrackingConfidence:.4});
 const sm=(p,prev)=>{if(!prev||!prev.l)return p;const sp=Math.hypot(p.x-prev.x,p.y-prev.y),a=Math.min(.9,.3+sp*10),l=p.l.map((q,k)=>{const o=prev.l[k];return{x:o.x+(q.x-o.x)*a,y:o.y+(q.y-o.y)*a,z:o.z+(q.z-o.z)*a}});return{x:(l[0].x+l[9].x)/2,y:(l[0].y+l[9].y)/2,s:Math.hypot(l[0].x-l[9].x,l[0].y-l[9].y),l}};
 H.onResults(r=>{if(ov.width!=v.videoWidth||ov.height!=v.videoHeight){ov.width=v.videoWidth;ov.height=v.videoHeight}else if(!vrOn)ox.clearRect(0,0,ov.width,ov.height);const hs=(r.multiHandLandmarks||[]).map(l=>({x:(l[0].x+l[9].x)/2,y:(l[0].y+l[9].y)/2,s:Math.hypot(l[0].x-l[9].x,l[0].y-l[9].y),l}));
  if(!vrOn)hs.forEach(h=>{ox.fillStyle='#3ddc84';h.l.forEach(p=>{ox.beginPath();ox.arc(p.x*ov.width,p.y*ov.height,4,0,7);ox.fill()})});
  hs.sort((a,b)=>a.x-b.x);const now=performance.now(),pv=i=>slot[i].p&&now-slot[i].t<500?slot[i].p:null;
  if(hs.length==2){[0,1].forEach(i=>Object.assign(slot[i],{p:sm(hs[i],pv(i)),t:now}))}
  else if(hs.length==1){const h=hs[0];let i=h.x<.5?0:1;const d=j=>slot[j].p&&now-slot[j].t<700?Math.hypot(slot[j].p.x-h.x,slot[j].p.y-h.y):9;if(Math.min(d(0),d(1))<.3)i=d(0)<d(1)?0:1;Object.assign(slot[i],{p:sm(h,pv(i)),t:now})}});
 const pump=async()=>{const t0=performance.now();if(v.readyState>=2&&!v.paused)try{await H.send({image:v})}catch(e){}const el=performance.now()-t0;setTimeout(pump,Math.max(30,el*1.3))};pump()}
// ---------- olhar ----------
const zee=V3(0,0,1),q1=new THREE.Quaternion(-Math.sqrt(.5),0,0,Math.sqrt(.5)),q0=new THREE.Quaternion(),eu=new THREE.Euler(),gq=new THREE.Quaternion();let gy0=null,ga=0,gb=0,gg=0,drag=null;
let gotRel=false;addEventListener('deviceorientation',e=>{if(e.alpha!=null){gotRel=true;gyro=true;ga=e.alpha;gb=e.beta;gg=e.gamma}});addEventListener('deviceorientationabsolute',e=>{if(!gotRel&&e.alpha!=null){gyro=true;ga=e.alpha;gb=e.beta;gg=e.gamma}});
const keys={},ptrs=new Set(),pad=()=>{const p=navigator.getGamepads?navigator.getGamepads():[];for(const x of p)if(x&&x.connected)return x;return null};let jumpCool=0,jumpT=0,pdT=0,jumpReq=false,dragMoved=false,padJ=false,wkMode=1,p0=[0,0];
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.target.tagName=='SELECT')return;keys[e.code]=1;if(e.code=='Space'){jumpReq=true;e.preventDefault()}});addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];if(state=='play'){if(!gyro&&window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)try{DeviceOrientationEvent.requestPermission().catch(()=>{})}catch(x){}pdT=performance.now();p0=[e.clientX,e.clientY];dragMoved=false;ptrs.add(e.pointerId);if(ptrs.size>=2)jumpReq=true}});
const pup=e=>{ptrs.delete(e.pointerId);if(!ptrs.size)dragMoved=false;drag=null};addEventListener('pointerup',e=>{if(state=='play'&&ptrs.has(e.pointerId)&&ptrs.size==1&&!dragMoved&&performance.now()-pdT<350)jumpReq=true;pup(e)});addEventListener('pointercancel',pup);
addEventListener('pointermove',e=>{if(!drag||state!='play')return;if(Math.hypot(e.clientX-p0[0],e.clientY-p0[1])>14)dragMoved=true;yw-=(e.clientX-drag[0])*.005;pit=Math.max(-1.4,Math.min(1.4,pit-(e.clientY-drag[1])*.005));drag=[e.clientX,e.clientY]});
function look(){if(R.xr.isPresenting||(HOOK.look&&HOOK.look()))return;if(gyro){const D=THREE.MathUtils.degToRad;eu.set(D(gb),D(ga),-D(gg),'YXZ');gq.setFromEuler(eu).multiply(q1).multiply(q0.setFromAxisAngle(zee,-(screen.orientation?screen.orientation.angle:0)*Math.PI/180));
  if(gy0===null){const d=V3(0,0,-1).applyQuaternion(gq);gy0=Math.atan2(-d.x,-d.z)}cam.quaternion.setFromAxisAngle(V3(0,1,0),yw-gy0).multiply(gq)}
 else cam.quaternion.setFromEuler(eu.set(pit,yw,0,'YXZ'))}
// ---------- rede (PeerJS) ----------
const SND_FILES={grass:'grass',wood:'wood',metal:'metal',stone:'stone'};
const SURF=n=>/metal|bronze/.test(n)?2:/bark|log|brown|panel|picnic|crate|cart|knob|plastic|roof/.test(n)?1:/pitground|bush|leaves|cactus|pillow|material_1/.test(n)?0:3;
let AC=null;const SB=[null,null,null,null],SNDK=['grass','wood','metal','stone'],lastSnd=[0,0];let lastCls=0,gCls=0,gPrev=false,assist=1;
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();SNDK.forEach((k,i)=>{fetch(ASSET+'sounds/'+SND_FILES[k]+'.mp3').then(r=>r.arrayBuffer()).then(ab=>AC.decodeAudioData(ab,b=>{SB[i]=b},()=>{})).catch(()=>{})});HOOK.audio&&HOOK.audio(AC)}catch(e){AC=null}}
function tapSound(hand,cls,vol){if(!AC||!SB[cls])return;const n=performance.now();if(n-lastSnd[hand]<90)return;lastSnd[hand]=n;if(AC.state=='suspended')AC.resume();const s=AC.createBufferSource(),g=AC.createGain();s.buffer=SB[cls];s.playbackRate.value=.93+Math.random()*.14;g.gain.value=Math.max(.2,Math.min(1,vol));s.connect(g);g.connect(AC.destination);s.start()}
const NP='grush-'; // prefixo ORIGINAL: a versão Oculus Go entra nas mesmas salas do Gorilla Rush
let INF={},iPh='wait',iEnd=0,iRem=0,iAt=0,REMI=0,pickCode='',hudS='';
const isIt=id=>NET.mode=='inf'?!!INF[id]:id===itId;
function sfx(v){return v=='inf'?'-I':'-C'}
// ---------- servidores ORIGINAIS ----------
// Mesmos do Gorilla Rush original: sinalização no servidor público PeerJS (0.peerjs.com, padrão da lib) e os
// servidores ICE padrão do PeerJS 1.5.4 (STUN Google + TURN peerjs.com). No Oculus Go roda o PeerJS 1.3.2
// (o 1.5.4 não carrega no Chromium 77); a lista abaixo faz o 1.3.2 usar exatamente os servidores do 1.5.4.
const ORIGINAL_ICE=[{urls:'stun:stun.l.google.com:19302'},{urls:['turn:eu-0.turn.peerjs.com:3478','turn:us-0.turn.peerjs.com:3478'],username:'peerjs',credential:'peerjsp'}];
function iceServers(){return ORIGINAL_ICE}
async function initPeer(id){const ice=iceServers();return new Promise((res,rej)=>{if(!window.Peer)return rej('sem PeerJS');const p=new Peer(id||undefined,{debug:0,config:{iceServers:ice}});const to=setTimeout(()=>{try{p.destroy()}catch(e){}rej('timeout')},12000);p.on('open',()=>{clearTimeout(to);res(p)});
  // o servidor PeerJS derruba websockets ociosos: reconecta para continuar recebendo novos jogadores
  p.on('disconnected',()=>{if(!p.destroyed&&NET.peer===p)setTimeout(()=>{try{if(!p.destroyed)p.reconnect()}catch(e){}},1500)});p.on('error',e=>{if(e.type=='peer-unavailable'){NET.pend&&NET.pend(false);return}clearTimeout(to);rej(e.type||String(e))})})}
function hostListen(){NET.peer.on('connection',c=>{c.on('open',()=>{if(Object.keys(NET.conns).length>=7){c.send({t:'full'});setTimeout(()=>c.close(),300);return}NET.conns[c.peer]=c;c.send({t:'hello',pub:NET.pub,code:NET.code,mode:NET.mode,map:HOOK.mapId?HOOK.mapId():''})});
 c.on('data',m=>{if(m.t=='p'){const h=m.h||[0,0,0,0,0,0];RM[c.peer]={i:c.peer,x:m.x,y:m.y,z:m.z,w:m.w,p:m.p,h,c:m.c,n:m.n,o:m.o,a:m.a,t:performance.now()}}});
 const gone=()=>{delete NET.conns[c.peer];delete RM[c.peer];if(itId===c.peer)itId=null};c.on('close',gone);c.on('error',gone)})}
function tryJoin(code,ms=8000){return new Promise(res=>{let done=false;const fin=v=>{if(!done){done=true;clearTimeout(to);NET.pend=null;res(v)}};const c=NET.peer.connect(NP+code,{reliable:true}),to=setTimeout(()=>{try{c.close()}catch(e){}fin(false)},ms);NET.pend=v=>{fin(v)};
  c.on('data',m=>{if(m.t=='full'){fin(false);c.close();return}if(m.t=='hello'){NET.hc=c;NET.host=false;NET.pub=m.pub;NET.code=m.code;if(m.mode)NET.mode=m.mode;if(m.map&&HOOK.remoteMap)HOOK.remoteMap(m.map);fin(true);return}netData(m)});
  c.on('close',()=>{if(done&&NET.hc===c&&state=='play'){toast('A sala foi fechada.');if(HOOK.roomClosed)HOOK.roomClosed();else location.reload()}})})}
function netData(m){if(m.t!='s')return;NET.lastS=performance.now();const seen={};m.e.forEach(e=>{if(e.i===me.id)return;seen[e.i]=1;RM[e.i]=Object.assign(e,{t:performance.now()})});for(const k in RM)if(!seen[k])delete RM[k];itId=m.it;if(m.mp&&HOOK.remoteMap)HOOK.remoteMap(m.mp);if(m.sc)SCORE=m.sc;if(NET.mode=='inf'){INF={};(m.inf||[]).forEach(i=>INF[i]=1);iPh=m.ph||'wait';iRem=m.ir||0;iAt=performance.now()}}
async function becomeHost(code,pub,mode){const m2=mode||'tag';NET.peer=await initPeer(NP+code+(m2=='tag'?'':sfx(m2)));NET.host=true;NET.pub=pub;NET.mode=m2;NET.code=code;me.id=NET.peer.id;hostListen()}
const rc=()=>Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.random()*32|0]).join('');
async function enter(mode,vr){
 initAudio();me.nick=($('nick').value.trim()||'Gorilla').slice(0,12);try{localStorage.setItem('gr_nick',me.nick)}catch(e){}
 if(HOOK.enter)HOOK.enter(mode,vr);
 // Gorilla Rush (Oculus Go): modos offline (SoloPlay / Lava Run) — sem rede, sem bots
 if(mode=='solo'||mode=='lava'){NET.peer=null;NET.hc=null;NET.conns={};NET.host=true;NET.pub=false;NET.mode='cas';NET.code=mode=='lava'?'LAVA':'SOLO';me.id='me';startGame();return}
 ['qj','jn'].forEach(i=>$(i).disabled=true);
 try{if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)await DeviceOrientationEvent.requestPermission()}catch(e){}
 try{if(!R.xr.isPresenting&&!(HOOK.noCam&&HOOK.noCam()))await startCam()}catch(e){toast('Sem câmera/hand tracking: arraste para olhar. '+e)}
 let ok=false;const jm=mode=='quick'?'tag':vr,code=mode=='quick'?'':pickCode,rid=code+(mode=='quick'?'':sfx(jm));NET.mode=jm;
 try{
  if(mode=='quick'){st('Procurando sala pública…');NET.peer=await initPeer();let found=false;
   for(let i=1;i<=6&&!found;i++){st('Procurando sala '+i+'…');found=await tryJoin('pub'+i,8000)}
   if(found){me.id=NET.peer.id;ok=true}
   else{NET.peer.destroy();NET.peer=null;for(let i=1;i<=6&&!ok;i++){try{await becomeHost('pub'+i,true);ok=true}catch(e){if(e!='unavailable-id')break}}}}
  else{st('Entrando na sala '+code+' ('+(jm=='inf'?'Infecção':'Casual')+')…');NET.peer=await initPeer();
   if(await tryJoin(rid,10000)){me.id=NET.peer.id;ok=true}
   else{NET.peer.destroy();NET.peer=null;try{await becomeHost(code,false,jm);ok=true}catch(e){if(e=='unavailable-id'){st('Sala cheia. Tente outro código.');['qj','jn'].forEach(i=>$(i).disabled=false);HOOK.enterFail&&HOOK.enterFail();return}throw e}}}
 }catch(e){console.warn(e)}
 if(!ok){NET.peer=null;NET.host=true;NET.pub=mode=='quick';NET.mode=jm;NET.code=mode=='quick'?'OFFLINE':(code||'OFFLINE');me.id='me'}
 startGame()}
function openPick(){const code=$('code').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<1){st('Type a room code.');return}pickCode=code;$('pkt').textContent='ROOM '+code;$('pick').classList.add('on')}
function pickGo(v){$('pick').classList.remove('on');enter('join',v)}
document.querySelectorAll('#menu .tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('#menu .tab').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('#menu .pane').forEach(p=>p.classList.toggle('on',p.dataset.t===b.dataset.t))});
$('mv').onchange=e=>assist=+e.target.value;$('qj').onclick=()=>enter('quick');$('jn').onclick=openPick;$('pkc').onclick=()=>pickGo('cas');$('pki').onclick=()=>pickGo('inf');$('pkx').onclick=()=>$('pick').classList.remove('on');
// ---------- bots (apenas servidor público, simulados pelo host) ----------
function infTick(all,now){itId=null;
 const ids={};all.forEach(e=>ids[e.id]=1);for(const k in INF)if(!ids[k])delete INF[k];
 const n=all.length,ic=Object.keys(INF).length;
 if(n<2){INF={};iPh='wait';return}
 if(iPh=='wait'){iPh='cd';iEnd=now+6000}
 if(iPh=='cd'){if(now>=iEnd){INF={};INF[all[Math.random()*n|0].id]=1;iPh='play';cd=now+1500}return}
 if(iPh=='over'){if(now>=iEnd){INF={};iPh='cd';iEnd=now+6000}return}
 if(!ic){INF[all[Math.random()*n|0].id]=1;cd=now+1500;return}
 if(ic>=n){iPh='over';iEnd=now+6000;return}
 if(now<cd)return;
 const cur=Object.assign({},INF),hs=id=>id===me.id?[tgt[0],tgt[1]]:(RM[id]&&RM[id].h?[V3(RM[id].h[0],RM[id].h[1],RM[id].h[2]),V3(RM[id].h[3],RM[id].h[4],RM[id].h[5])]:[]);
 for(const it of all){if(!cur[it.id])continue;const ih=hs(it.id);
  for(const o of all){if(cur[o.id]||INF[o.id])continue;const c=V3(o.x,o.y,o.z);
   let t=Math.hypot(it.x-o.x,it.z-o.z)<(o.id===me.id||it.id===me.id?.7:.55)&&Math.abs(it.y-o.y)<1.1;
   if(!t)for(const h of ih)if(h.distanceTo(c)<.45){t=true;break}
   if(t){INF[o.id]=1;SCORE[it.id]=(SCORE[it.id]||0)+1}}}}
function hudTick(now){const h=$('hud');if(NET.mode!='inf'){if(hudS){hudS='';h.style.display='none';HOOK.hud&&HOOK.hud('')}return}
 const rem=NET.host?Math.max(0,iEnd-now):Math.max(0,iRem-(now-iAt)),sec=Math.ceil(rem/1000),tot=Object.keys(INF).length;let a;
 if(iPh=='wait')a='ESPERANDO JOGADORES';else if(iPh=='cd')a='INFECÇÃO COMEÇA EM '+sec;else if(iPh=='over')a='TODOS INFECTADOS · NOVA RODADA EM '+sec;else a=INF[me.id]?'VOCÊ ESTÁ INFECTADO · ESPALHE':'CORRA · NÃO SEJA INFECTADO';
 const t=a+'<small>SALA '+NET.code+' · INFECÇÃO · '+tot+' INFECTADOS</small>';if(t!==hudS){hudS=t;h.innerHTML=t;h.style.display='block';HOOK.hud&&HOOK.hud(t)}}
function hostTick(dt,now){
 const pl2=[{id:me.id,x:P.x,y:P.y-.5,z:P.z}];for(const k in RM)if(!RM[k].b){if(now-RM[k].t>6000){delete RM[k];try{NET.conns[k]&&NET.conns[k].close()}catch(e){}delete NET.conns[k];continue}pl2.push({id:k,x:RM[k].x,y:RM[k].y-.5,z:RM[k].z})}
 const all=pl2.concat(bots.map(b=>({id:b.id,x:b.x,y:b.y+.6,z:b.z})));
 if(NET.mode=='cas'){itId=null;return}
  if(NET.mode=='inf'){infTick(all,now);return}
  if(!NET.pub){itId=null;return}
 if(!all.find(e=>e.id===itId)){itId=null;if(bots.length)itId=bots[bots.length*Math.random()|0].id;else if(pl2.length>=2)itId=pl2[Math.random()*pl2.length|0].id;if(itId)cd=now+6000}
 bots.forEach(b=>{b.t-=dt;if(b.t<0){b.t=1.5+Math.random()*2;b.dir+=(Math.random()-.5)*2}
  const mine=itId===b.id;let dir=null;
  if(mine){let best=null,bd=1e9;for(const e of all){if(e.id===b.id)continue;const dd=Math.hypot(e.x-b.x,e.z-b.z);if(dd<bd){bd=dd;best=e}}if(best)dir=V3(best.x-b.x,0,best.z-b.z).normalize()}
  else{const it=all.find(e=>e.id===itId);if(it&&Math.hypot(it.x-b.x,it.z-b.z)<14)dir=V3(b.x-it.x,0,b.z-it.z).normalize()}
  if(!dir||!isFinite(dir.x))dir=V3(Math.cos(b.dir),0,Math.sin(b.dir));
  const sp=(mine?(itId===me.id?3:3.4):(itId===me.id?3.1:3.9))*dt;if(!hit(V3(b.x,b.y+.8,b.z),dir,.7)){b.x+=dir.x*sp;b.z+=dir.z*sp}else b.dir+=2;
  const gh=hit(V3(b.x,b.y+2,b.z),DOWN,6);if(gh)b.y=gh.point.y;else b.y-=9*dt;
  b.w=Math.atan2(-dir.x,-dir.z);const fw=V3(-Math.sin(b.w),0,-Math.cos(b.w)),rt=V3(-fw.z,0,fw.x),sw=Math.sin(now/130)*.3,sh=V3(b.x-fw.x*.12,b.y+1.1-.3,b.z-fw.z*.12);
  const hL=sh.clone().addScaledVector(rt,-.3).addScaledVector(fw,.25+sw).add(V3(0,-.7,0)),hR=sh.clone().addScaledVector(rt,.3).addScaledVector(fw,.25-sw).add(V3(0,-.7,0));
  RM[b.id]={i:b.id,x:b.x,y:b.y+1.1,z:b.z,w:b.w,p:0,h:[hL.x,hL.y,hL.z,hR.x,hR.y,hR.z],c:b.c,n:b.n,b:1,t:now}});
 if(itId&&now>cd){const it=all.find(e=>e.id===itId);if(it){const hs=id=>id===me.id?[tgt[0],tgt[1]]:(RM[id]&&RM[id].h?[V3(RM[id].h[0],RM[id].h[1],RM[id].h[2]),V3(RM[id].h[3],RM[id].h[4],RM[id].h[5])]:[]),ih=hs(it.id);
  for(const o of all){if(o===it)continue;const c=V3(o.x,o.y,o.z);let t=Math.hypot(it.x-o.x,it.z-o.z)<(o.id===me.id||it.id===me.id?.7:.55)&&Math.abs(it.y-o.y)<1.1;if(!t)for(const h of ih)if(h.distanceTo(c)<.45){t=true;break}
   if(t){SCORE[it.id]=(SCORE[it.id]||0)+1;itId=o.id;cd=now+4000;break}}}}}
let lastSend=0;
function netSend(now){if(now-lastSend<80)return;lastSend=now;const r=n=>Math.round(n*100)/100,fw=V3(0,0,-1).applyQuaternion(cam.quaternion),w=Math.atan2(-fw.x,-fw.z),h=[r(tgt[0].x),r(tgt[0].y),r(tgt[0].z),r(tgt[1].x),r(tgt[1].y),r(tgt[1].z)];
 const o=HO[0].d&&HO[1].d?[].concat(...HO.map(q=>[q.d.x,q.d.y,q.d.z,q.A.x,q.A.y,q.A.z,q.c[0],q.c[1],q.c[2]])).map(r):null;
 const self={i:me.id,x:r(P.x),y:r(P.y),z:r(P.z),w:r(w),p:r(Math.asin(Math.max(-1,Math.min(1,fw.y)))),h,c:color,n:me.nick,o,a:[myAcc.g,myAcc.h,myAcc.c,myAcc.y,myAcc.z,HOOK.style?HOOK.style():'']}; // a[5] = estilo MONKE (ignorado pelo original)
 if(NET.host){const e=[self];for(const k in RM){const q=RM[k];e.push({i:q.i,x:r(q.x),y:r(q.y),z:r(q.z),w:r(q.w),p:r(q.p||0),h:q.h.map(r),c:q.c,n:q.n,b:q.b,o:q.o,a:q.a})}
  const m={t:'s',it:itId,e,mp:HOOK.mapId?HOOK.mapId():'',sc:SCORE};if(NET.mode=='inf'){m.inf=Object.keys(INF);m.ph=iPh;m.ir=Math.max(0,iEnd-now)}for(const k in NET.conns)try{NET.conns[k].send(m)}catch(x){}}
 else if(NET.hc&&NET.hc.open)NET.hc.send(Object.assign({t:'p'},self))}
// ---------- jogo ----------
function startGame(){$('lobby').style.display='none';$('bg').style.display='none';$('hud').style.display='none';state='play';try{localStorage.setItem('gr_played','1')}catch(e){}setTimeout(()=>{if(state=='play'&&!gyro&&!(HOOK.headTracked&&HOOK.headTracked())){const t=document.createElement('div');t.textContent='Rastreamento de cabeça indisponível: abra no Chrome/Safari via https e permita os sensores de movimento. Arraste para olhar.';t.style.cssText='position:fixed;left:8px;right:8px;top:8px;z-index:99;background:#000a;color:#fff;padding:8px;border-radius:8px;font:13px sans-serif;text-align:center';document.body.appendChild(t);setTimeout(()=>t.remove(),6000)}},3500);vrView=vrOn;$('cam').classList.toggle('vr',vrOn);pg.scale.setScalar(1);P.copy(spawnPos());vel.set(0,0,0);if(LM.head)LM.head.scale.setScalar(.001);
 LM.lab.visible=false;const sh=gfx>0;R.shadowMap.type=gfx==2?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;dpr=prCap();rs();mapMeshes.forEach(m=>{m.material.needsUpdate=true});mapMeshes.forEach(m=>m.castShadow=gfx==2&&!m.material.alphaTest);R.shadowMap.enabled=sh;R.shadowMap.autoUpdate=false;sun.castShadow=sh;{const ms=Math.min(R.capabilities.maxTextureSize,gfx==2?4096:2048);sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:160});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0004;sun.shadow.normalBias=.025;
 tstart=performance.now();for(const k in RM)delete RM[k];INF={};iPh='wait';iEnd=0;hudS='';SCORE={};HOOK.startGame&&HOOK.startGame()}
function renderRemotes(dt){for(const id in RM){const e=RM[id];let M=RO[id];if(!M){M=RO[id]=mkModel(e.c,e.n);M.cur={x:e.x,y:e.y,z:e.z,w:e.w,p:e.p||0,h:e.h.slice()}}
  const k=1-Math.exp(-12*dt),c=M.cur;c.x+=(e.x-c.x)*k;c.y+=(e.y-c.y)*k;c.z+=(e.z-c.z)*k;let dw=e.w-c.w;dw=Math.atan2(Math.sin(dw),Math.cos(dw));c.w+=dw*k;c.p+=((e.p||0)-c.p)*k;for(let i=0;i<6;i++)c.h[i]+=(e.h[i]-c.h[i])*k;
  {const ak=(e.a||[]).join('|');if(M.ak!==ak&&setAcc(M,e.a))M.ak=ak}if(M.nk!==e.n){setLabel(M.lab,e.n);M.nk=e.n}if(M.col!==e.c){paint(M.m,e.c);M.col=e.c}const want=isIt(id);if(M.itm!==want){mark(M.m,want,M.col);M.itm=want}
  const fw=V3(-Math.sin(c.w),0,-Math.cos(c.w)),rt=V3(-fw.z,0,fw.x);M.g.position.set(c.x-fw.x*.12,c.y-.3,c.z-fw.z*.12);M.g.quaternion.copy(faceQ(fw));M.g.updateMatrixWorld(true);
  headLook(M,c.p,rt);faceCam(M);if((fr+M.cur.x*0|0)%3==0||!M.gp)M.gp=hit(V3(c.x,c.y,c.z),DOWN,14);setBlob(M.blob,c.x,c.y-1.1,c.z,M.gp);{const dx=c.x-P.x,dz=c.z-P.z;if(dx*dx+dz*dz>625&&((fr+(M.si||(M.si=++REMI)))&1))continue}arm2(M,'L',V3(c.h[0],c.h[1],c.h[2]),fw,rt);arm2(M,'R',V3(c.h[3],c.h[4],c.h[5]),fw,rt);
  if(((fr+M.si)%3)!=0)continue;const eo=e.o;if(eo&&eo.length==18){if(!c.o)c.o=eo.slice();for(let i=0;i<18;i++)c.o[i]+=(eo[i]-c.o[i])*Math.min(1,k*2.5);const o=c.o;
   handPose(M,'L',V3(o[0],o[1],o[2]).normalize(),V3(o[3],o[4],o[5]).normalize(),[o[6],o[7],o[8]]);handPose(M,'R',V3(o[9],o[10],o[11]).normalize(),V3(o[12],o[13],o[14]).normalize(),[o[15],o[16],o[17]])}
  else{const sw=.35+.15*Math.sin(performance.now()/300);handPose(M,'L',null,null,[sw,sw,sw]);handPose(M,'R',null,null,[sw,sw,sw])}}
 for(const id in RO)if(!RM[id]){S.remove(RO[id].g);S.remove(RO[id].blob);delete RO[id]}}
let stumpAt=null;
function stumpSpot(){for(let i=0;i<40;i++){const a=Math.random()*6.283,r=1.2+Math.random()*1.6,x=stumpAt.x+Math.cos(a)*r,z=stumpAt.z+Math.sin(a)*r,h=hit(V3(x,1.2,z),DOWN,2);
 if(!h||h.point.y<-.4||h.point.y>.5||hit(V3(x,h.point.y+.1,z),V3(0,1,0),1.5))continue;let free=true;for(let k=0;k<4;k++){_hd.set(k&2?(k&1?-1:1):0,0,k&2?0:(k&1?-1:1));if(hit(V3(x,h.point.y+.6,z),_hd,.5)){free=false;break}}
 if(free)return V3(x,h.point.y+1.12,z)}return null}
let isNewbie=true;try{isNewbie=!localStorage.getItem('gr_played')}catch(e){}
const WR=.14,_wd=[],_wn=V3(),_upv=V3(0,1,0);for(let i=0;i<8;i++){const a=i*Math.PI/4;_wd.push(V3(Math.cos(a),0,Math.sin(a)))}
function wallFix(){for(const hy of [-.65,-.2,.15])for(let i=0;i<8;i++){const d=_wd[i],h=hit(V3(P.x,P.y+hy,P.z),d,WR);if(h){_wn.copy(h.n);_wn.y=0;if(_wn.lengthSq()<1e-4)_wn.copy(d).negate();_wn.normalize();if(_wn.dot(d)>0)_wn.negate();P.addScaledVector(_wn,WR-h.distance);const k=vel.dot(_wn);if(k<0)vel.addScaledVector(_wn,-k)}}
 const c=hit(P,_upv,.2);if(c){P.y-=.2-c.distance;if(vel.y>0)vel.y=0}}
// Gorilla Rush (Oculus Go): colisão contínua vertical — impede atravessar o chão com impulsos fortes / quadros longos
const _gs=V3();function groundSweep(y0){if(P.y>=y0)return;const top=Math.max(y0,P.y)+.3,h=hit(_gs.set(P.x,top,P.z),DOWN,top-(P.y-1.1)+.05);if(h&&h.n.y>.3&&P.y-1.1<h.point.y){P.y=h.point.y+1.1;if(vel.y<0)vel.y=0}}
function spawnPos(){if(HOOK.spawn){const s=HOOK.spawn();if(s)return s}return isNewbie?V3(59.32,17.21,-23.61):V3(3.60,6.30,-6.49)}
const _er=V3(),touch=[false,false],_hd=V3(),_ro=V3();
function handTouch(p,fw,rt){_ro.set(p.x,p.y+1,p.z);const g=hit(_ro,DOWN,1.6);
 if(g&&g.point.y>p.y-.5&&g.point.y<p.y+.25){p.y=g.point.y+.05;lastCls=g.cls|0;return true}
 for(let k=0;k<4;k++){_hd.copy(k&2?rt:fw);if(k&1)_hd.negate();const h=hit(p,_hd,.3);if(h){p.addScaledVector(h.n,Math.max(0,.12-h.distance));lastCls=h.cls|0;return true}}
 return false}
function renderPlay(){if(HOOK.render&&HOOK.render())return;if(!vrView||R.xr.isPresenting){R.render(S,cam);return}
 const W=innerWidth,H=innerHeight,hw=W>>1,o=cam.position.clone();_er.set(1,0,0).applyQuaternion(cam.quaternion).multiplyScalar(.032);R.setScissorTest(true);
 for(let e=0;e<2;e++){const x=e?hw:0,w=e?W-hw:hw;R.setViewport(x,0,w,H);R.setScissor(x,0,w,H);cam.position.copy(o).addScaledVector(_er,e?1:-1);cam.updateMatrixWorld();R.render(S,cam)}
 cam.position.copy(o);cam.updateMatrixWorld();R.setScissorTest(false);R.setViewport(0,0,W,H)}
let last=0,lmark=null,fr=0,fa=.02,lastAdj=0;
function frame(t){if(!R.xr.isPresenting&&!(HOOK.ownLoop&&HOOK.ownLoop()))requestAnimationFrame(frame);const dt=Math.min((t-last)/1000||.016,.05);last=t;if(HOOK.pre)HOOK.pre(dt,t);
 if(state=='lobby'&&HOOK.lobbyVR&&HOOK.lobbyVR(dt))return;
 if(state=='lobby'&&pl){pg.scale.setScalar(1.6);pg.position.set(-.2,1.2,0);pg.rotation.y+=dt*.8;if(LM){const nv=$('nick').value.trim()||'Gorilla';if(LM.nk!==nv){setLabel(LM.lab,nv);LM.nk=nv}const f0=V3(0,0,-1).applyQuaternion(pg.quaternion);faceCam(LM);LM.blob.visible=false;pg.updateMatrixWorld(true);{const rt0=V3(1,0,0).applyQuaternion(pg.quaternion);['L','R'].forEach((k,ii)=>{const u=LM['u'+k];if(!u)return;const S0=u.getWorldPosition(V3()),T=S0.clone().addScaledVector(rt0,(ii?.03:-.03)*1.6).addScaledVector(V3(0,-1,0),.93*1.6).addScaledVector(f0,.04*1.6);arm2(LM,k,T,f0,rt0,1.6)})}if(LM.head.scale.x<.5)LM.head.scale.copy(LM.hs)}mapG&&(mapG.visible=false);dome.visible=false;S.background=null;S.fog=null;R.setClearColor(0,0);cam.position.set(0,.8,2.8);cam.lookAt(0,.65,0);R.render(S,cam);return}
 if(state!='play')return;mapG&&(mapG.visible=true);dome.visible=true;S.fog=FOG;look();
 if((fr&7)==0){const lim=gfx==0?55:gfx==1?80:130;for(const m of mapMeshes)if(m.material.alphaTest){const b=m.geometry.boundingSphere;m.visible=Math.hypot(b.center.x-P.x,b.center.z-P.z)-b.radius<lim}}
 const d=V3(0,0,-1).applyQuaternion(cam.quaternion),fw=V3(d.x,0,d.z).normalize(),now=performance.now();if(HOOK.bodyFw)HOOK.bodyFw(fw,d,dt);const rt=V3(-fw.z,0,fw.x);const XRH=[null,null];if(R.xr.isPresenting&&!(HOOK.ctrlHands&&HOOK.ctrlHands())){xrRig.position.set(P.x,P.y-1.1,P.z);for(let i=0;i<2;i++){const c=R.xr.getController(i);if(c.visible)XRH[i]=c.getWorldPosition(V3())}}
  const dsum=V3();let n=0,dnS=0;
 for(let i=0;i<2;i++){const lh=HOOK.hand?HOOK.hand(i,fw,rt,dt):null,s=slot[i],xh=XRH[i],on=!!lh||!!xh||(s.p&&now-s.t<350);if((xh||lh)&&!s.p)s.p={x:.5,y:0,s:.1,l:null};
  const goal=on?V3((s.p.x-.5)*1.8,(.5-s.p.y)*3.2-.15,Math.max(.4,Math.min(.9,.12/s.p.s))):V3(i?.22:-.22,-1.05,.02);
  const prev=hl[i].clone();hl[i].lerp(goal,1-Math.exp(-dt*20));if(xh){const dP=xh.clone().sub(P);hl[i].set(dP.dot(rt),dP.y,dP.dot(fw))}if(lh)hl[i].copy(lh);
  const sh=V3(P.x-fw.x*.12,P.y-.3,P.z-fw.z*.12),des=P.clone().addScaledVector(rt,hl[i].x).addScaledVector(V3(0,1,0),hl[i].y).addScaledVector(fw,hl[i].z),dd=des.sub(sh),w=sh.clone().add(dd.setLength(Math.min(dd.length(),ARM)));
  tgt[i].copy(w);const real=on?handTouch(tgt[i],fw,rt):false,tc=real||(on&&gPrev&&s.p.y>.3),tp=touch[i];touch[i]=tc;if(tc&&!tp)tapSound(i,real?lastCls:gCls,.35+Math.min(.65,hl[i].distanceTo(prev)/dt*.4));
  {const ho=HO[i],l=on&&s.p.l;if(l){const asp=(ov.width/ov.height)||1.33,cr=V3(1,0,0).applyQuaternion(cam.quaternion),cu=V3(0,1,0).applyQuaternion(cam.quaternion),cf=V3(0,0,-1).applyQuaternion(cam.quaternion),
    cv=(a,b)=>V3().addScaledVector(cr,(a.x-b.x)*asp).addScaledVector(cu,-(a.y-b.y)).addScaledVector(cf,(a.z-b.z)*asp*.7),
    dist=(a,b)=>Math.hypot((a.x-b.x)*asp,a.y-b.y,(a.z-b.z)*asp*.7),cl=(x,lo,hi)=>Math.max(0,Math.min(1,(hi-x)/(hi-lo))),
    d=cv(l[9],l[0]).normalize(),A=cv(l[5],l[9]).normalize(),k2=1-Math.exp(-dt*13),
    ag=(a,b,c)=>{const ux=(a.x-b.x)*asp,uy=a.y-b.y,uz=(a.z-b.z)*asp,vx=(c.x-b.x)*asp,vy=c.y-b.y,vz=(c.z-b.z)*asp;return Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy+uz*vz)/((Math.hypot(ux,uy,uz)*Math.hypot(vx,vy,vz))||1))))},
    fcv=(m,p,d,t,old)=>{const a=ag(m,p,d)*.65+ag(p,d,t)*.35;return Math.max(0,Math.min(1,(2.95-a)/1.25))*.65+old*.35},
    nc=[cl(dist(l[4],l[0])/dist(l[2],l[0]),1.15,1.95),fcv(l[5],l[6],l[7],l[8],cl(dist(l[8],l[0])/dist(l[5],l[0]),1.0,1.85)),fcv(l[9],l[10],l[11],l[12],cl(dist(l[12],l[0])/dist(l[9],l[0]),1.0,1.85))];
    if(!ho.d){ho.d=d;ho.A=A}else{ho.d.lerp(d,k2).normalize();ho.A.lerp(A,k2).normalize()}for(let q=0;q<3;q++)ho.c[q]+=(nc[q]-ho.c[q])*(1-Math.exp(-dt*15))}
   else{for(let q=0;q<3;q++)ho.c[q]+=(.3-ho.c[q])*.1;if(ho.d&&!on)ho.d=null}}
  if(on){hv[i].lerp(hl[i].clone().sub(prev).divideScalar(dt),1-Math.exp(-dt*12));if(!(HOOK.noPush&&HOOK.noPush(i)))dnS+=Math.max(0,-hv[i].y-.3)}else hv[i].set(0,0,0);
  if(on&&tc&&tp&&!(HOOK.noPush&&HOOK.noPush(i))){const dn=Math.max(0,-hv[i].y-.25),bk=Math.max(0,-hv[i].z-.25),sp2=dn+bk;if(sp2>0){dsum.addScaledVector(fw,sp2*dt*1.15).addScaledVector(rt,-hv[i].x*dt*.3);dsum.y+=dn*dt;n++}}}
 const climbing=HOOK.climb?HOOK.climb(dt,fw,rt):false;
 jumpCool-=dt;if(dnS>.9&&gPrev&&jumpCool<=0){jumpReq=true;jumpCool=.4}
 if(n&&!climbing){const hx=dsum.x,hz=dsum.z,hsp=Math.hypot(hx,hz)/dt;if(hsp>.05){vel.x+=hx*22*TUNE.imp;vel.z+=hz*22*TUNE.imp}if(dsum.y/dt>.6)vel.y=Math.min(5.6*TUNE.jmp,Math.max(vel.y,0)+dsum.y*3.6*TUNE.imp)}
 if(!climbing)vel.y-=TUNE.grav*dt;{const ns=Math.min(8,Math.max(1,Math.ceil(vel.length()*dt/.1)));for(let s=0;s<ns;s++){const y0=P.y;P.addScaledVector(vel,dt/ns);wallFix();groundSweep(y0)}}
 const g=hit(V3(P.x,P.y+.3,P.z),DOWN,3);let grounded=false;if(g&&P.y-1.1<g.point.y+.05){grounded=true;if(P.y-1.1<g.point.y)P.y=g.point.y+1.1;if(vel.y<0)vel.y=0}gPrev=grounded;gCls=g?(g.cls|0):0;
  {let fx=0,fz=0;if(keys.KeyW||keys.ArrowUp)fz++;if(keys.KeyS||keys.ArrowDown)fz--;if(assist&&ptrs.size&&!dragMoved)fz++;if(keys.KeyD||keys.ArrowRight)fx++;if(keys.KeyA||keys.ArrowLeft)fx--;
   
   if(HOOK.move){const mv=HOOK.move(fw,rt,grounded);fx+=mv.x;fz+=mv.z;if(mv.jump)jumpReq=true}
    const gpd=HOOK.padFilter?HOOK.padFilter(pad()):pad();if(gpd){const xs=gpd.mapping==='xr-standard',ax=(xs?gpd.axes[2]:gpd.axes[0])||0,ay=(xs?gpd.axes[3]:gpd.axes[1])||0;if(Math.abs(ax)>.15)fx+=ax;if(Math.abs(ay)>.15)fz-=ay;const pj=!!((gpd.buttons[0]&&gpd.buttons[0].pressed)||(xs&&gpd.buttons[4]&&gpd.buttons[4].pressed));if(pj&&!padJ)jumpReq=true;padJ=pj}
   if(HOOK.inputLocked&&HOOK.inputLocked()){fx=0;fz=0;jumpReq=false}const ml=Math.hypot(fx,fz);if(ml>.05){const k=Math.min(1,ml)/ml,tx=(fw.x*fz+rt.x*fx)*k*3.8*TUNE.spd,tz=(fw.z*fz+rt.z*fx)*k*3.8*TUNE.spd,aa=1-Math.exp(-(grounded?9:2.5)*dt);vel.x+=(tx-vel.x)*aa;vel.z+=(tz-vel.z)*aa}
   if(jumpReq){jumpT=.15;jumpReq=false}jumpT-=dt;if(jumpT>0&&(grounded||gPrev)){vel.y=5.2*TUNE.jmp;jumpT=0}}
 {const f2=Math.exp(-(grounded?TUNE.fric:.25)*dt);vel.x*=f2;vel.z*=f2;const hs3=Math.hypot(vel.x,vel.z);if(hs3>TUNE.max){vel.x*=TUNE.max/hs3;vel.z*=TUNE.max/hs3}}
 if(P.y<floorMin){P.copy(spawnPos());vel.set(0,0,0);HOOK.respawned&&HOOK.respawned()}
 if(HOOK.rig&&HOOK.rig()){}else if(R.xr.isPresenting){xrRig.position.set(P.x,P.y-1.1,P.z)}else cam.position.copy(P);
 pg.quaternion.copy(faceQ(fw));pg.position.set(P.x-fw.x*.12,P.y-.3,P.z-fw.z*.12);pg.updateMatrixWorld(true);setBlob(LM.blob,P.x,P.y-1.1,P.z,g||hit(V3(P.x,P.y,P.z),DOWN,14));
 arm2(LM,'L',tgt[0],fw,rt);arm2(LM,'R',tgt[1],fw,rt);if((fr&1)==0){handPose(LM,'L',HO[0].d,HO[0].A,HO[0].c);handPose(LM,'R',HO[1].d,HO[1].A,HO[1].c)}
 fr++;if(gfx>0&&fr%3==0){const ld=V3(30,55,20).normalize(),lr=V3().crossVectors(_Y,ld).normalize(),lu=V3().crossVectors(ld,lr),tx0=40/sun.shadow.mapSize.x,a1=Math.round(P.dot(lr)/tx0)*tx0,a2=Math.round(P.dot(lu)/tx0)*tx0,a3=P.dot(ld),T=V3().addScaledVector(lr,a1).addScaledVector(lu,a2).addScaledVector(ld,a3);sun.target.position.copy(T);sun.position.set(T.x+30,T.y+55,T.z+20);sun.target.updateMatrixWorld();R.shadowMap.needsUpdate=true}
 fa=fa*.95+dt*.05;if(!R.xr.isPresenting&&!(HOOK.vrActive&&HOOK.vrActive())&&now-lastAdj>2500){if(fa>.032&&dpr>.5){dpr=Math.max(.5,dpr-.12);lastAdj=now;rs()}else if(fa>.05&&gfx>0&&dpr<=.55){gfx--;dpr=prCap();lastAdj=now;fa=.02;rs();if(gfx<2)mapMeshes.forEach(m=>m.castShadow=false);if(gfx==0){R.shadowMap.enabled=false;sun.castShadow=false}$('gfx').value=gfx}else if(fa<.021&&dpr<prCap()){dpr=Math.min(prCap(),dpr+.08);lastAdj=now;rs()}}
 if(NET.host)hostTick(dt,now);netSend(now);renderRemotes(dt);hudTick(now);
 const want=isIt(me.id);if(lmark!==want){mark(mats,want,color);lmark=want}
 HOOK.post&&HOOK.post(dt,now);
 renderPlay()}
const hv=[V3(),V3()];
const xrRig=new THREE.Group();S.add(xrRig);xrRig.add(cam);
// (enterVR original do WebXR foi movido/estendido em js/vr.js: WebXR + WebVR 1.1 + Cardboard)
// boot: js/main.js
