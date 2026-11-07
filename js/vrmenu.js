// MONKE GO — HUD 3D e menu VR acessível durante a partida.
// Interação: laser do controle + gatilho/clique do touchpad; swipe no touchpad navega; esquerda/direita
// ajusta valores. Sem controle (Cardboard): olhar + permanecer 1,5 s (ou tocar na tela). Desktop: mouse/teclado.
// Abrir/fechar: segurar o touchpad (0,6 s) · botão Voltar do navegador · Esc/M · Cardboard: olhar para cima 1,5 s.
'use strict';
function mkCanvasPlane(w,h,pw,ph){const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false,depthWrite:false,fog:false,toneMapped:false}));m.renderOrder=1000;m.frustumCulled=false;return {c,x:c.getContext('2d'),t,m}}
const FONT=s=>s+'px GT,system-ui,sans-serif';

// ---------------- HUD 3D (preso à câmera) ----------------
const HUD3D=(function(){
  const H={ch:{net:'',mode:'',toast:''},toastEnd:0,dirty:true,last:''};
  const p=mkCanvasPlane(512,160,.62,.195);p.m.position.set(0,.2,-1);cam.add(p.m);p.m.visible=false;
  H.set=(k,v)=>{if(H.ch[k]!==v){H.ch[k]=v;H.dirty=true}};
  H.toast=(t,ms)=>{H.set('toast',t);H.toastEnd=performance.now()+(ms||3500)};
  H.update=()=>{if(H.ch.toast&&performance.now()>H.toastEnd)H.set('toast','');
    const show=VRP.vrActive()||(vrView&&state=='play');
    const txt=H.ch.toast||H.ch.mode||H.ch.net;p.m.visible=show&&!!txt;if(!H.dirty||!p.m.visible)return;H.dirty=false;
    const x=p.x;x.clearRect(0,0,512,160);x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,0,512,160);x.textAlign='center';x.textBaseline='middle';
    const [a,b]=String(txt).split('<small>');x.fillStyle='#fff';x.font=FONT(30);wrap(x,a.replace(/<[^>]+>/g,'').toUpperCase(),256,b?55:80,490,34);
    if(b){x.font=FONT(21);x.fillStyle='#bff5d2';x.fillText(b.replace(/<[^>]+>/g,'').toUpperCase(),256,125)}p.t.needsUpdate=true};
  function wrap(x,t,cx,cy,mw,lh){const w=t.split(' '),L=[];let l='';w.forEach(s=>{const q=l?l+' '+s:s;if(x.measureText(q).width>mw&&l){L.push(l);l=s}else l=q});L.push(l);
    const y0=cy-(L.length-1)*lh/2;L.slice(0,3).forEach((s,i)=>x.fillText(s,cx,y0+i*lh))}
  HOOK.hud=t=>H.set('net',t);
  HOOK.toast=(t,ms)=>{H.toast(t,ms);return VRP.vrActive()};
  return H})();

// ---------------- Menu VR ----------------
const VRMENU=(function(){
  const W=512,Hh=640,PW=1.0,PH=1.25,ROW=46,TOP=86,VIS=11;
  const p=mkCanvasPlane(W,Hh,PW,PH);p.m.material.depthTest=true;p.m.visible=false;S.add(p.m);
  const ray=new THREE.Raycaster(),_o=new THREE.Vector3(),_d=new THREE.Vector3(),_q=new THREE.Quaternion();
  const laserG=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
  const laser=new THREE.Line(laserG,new THREE.LineBasicMaterial({color:0x3ddc84,depthTest:false,fog:false}));laser.renderOrder=1001;laser.frustumCulled=false;laser.visible=false;S.add(laser);
  const dot=new THREE.Mesh(new THREE.RingGeometry(.006,.016,16),new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false,fog:false}));dot.renderOrder=1002;dot.visible=false;S.add(dot);
  const M={open:false,page:'main',focus:0,scroll:0,hover:-1,dwell:0,dwellIdx:-1,upT:0,anchor:new THREE.Vector3(),mouse:null,dirty:true};
  const COLORS=['#ffffff','#3a2a20','#e53935','#1e88e5','#43a047','#fdd835','#8e24aa','#ff7043','#6b5a3a','#8a7f62'];
  const set=(k,v)=>{SETTINGS[k]=v;SETTINGS.save();applySettings(k)};
  function pages(){
    const P2={};
    P2.main={t:'MONKE GO',items:[
      {l:'Voltar ao jogo',a:close},
      {l:'Modos',sub:MODES.label(),a:()=>go('modes')},
      {l:'Mapas',sub:MAPS.byId(MAPS.cur).name,a:()=>go('maps')},
      {l:'Configurações',a:()=>go('set')},
      {l:'Placar',sub:NET.code?('Sala '+NET.code):'',a:()=>go('score')},
      {l:'Cor do macaco',sub:'◀ ▶',adj:d=>{let i=COLORS.indexOf(color);i=(i+d+COLORS.length)%COLORS.length;setColor(COLORS[i])},swatch:()=>color},
      {l:'Música',sub:MUSIC.now(),val:()=>SETTINGS.music<=0?'DESLIGADA':Math.round(SETTINGS.music*100)+'%',adj:d=>set('music',Math.max(0,Math.min(1,+(SETTINGS.music+d*.1).toFixed(2)))),a:()=>{MUSIC.start();MUSIC.next();M.dirty=true}},
      {l:'Recentralizar giro',a:()=>{VRP.setYaw(0);yw=0;toast('Giro recentralizado',1500)}},
      {l:'Dispositivo',sub:PLATFORM.isGo?'Oculus Go':VRP.mode.toUpperCase(),a:()=>toast(PLATFORM.describe()+' · modo '+VRP.mode,6000)},
    ]};
    if(VRP.vrActive())P2.main.items.push({l:'Sair do VR',a:()=>{close();VRP.stop()}});
    P2.modes={t:'MODOS',items:[
      {l:'SoloPlay',sub:'Explorar sozinho, sem bots',on:MODES.cur=='solo',a:()=>pickMode('solo')},
      {l:'Lava Run',sub:'A lava sobe: sobreviva!',on:MODES.cur=='lava',a:()=>pickMode('lava')},
      {l:'Tag multiplayer',sub:'Entrada rápida em sala pública',on:MODES.cur=='tag',a:()=>pickMode('tag')},
      {l:'Infecção',sub:'Sala MONKEGO (código no lobby 2D)',on:MODES.cur=='inf',a:()=>pickMode('inf')},
      {l:'Casual',sub:'Sala MONKEGO, sem pegar',on:MODES.cur=='cas',a:()=>pickMode('cas')},
      {l:'‹ Voltar',a:()=>go('main')}]};
    P2.maps={t:'MAPAS',items:MAPS.list.map(a=>({l:a.name,sub:a.desc,on:MAPS.cur==a.id,a:()=>{MAPS.go(a.id);close()}})).concat([{l:'‹ Voltar',a:()=>go('main')}])};
    P2.set={t:'CONFIGURAÇÕES',items:SETTING_DEFS.map(d=>({l:d.l,val:()=>fmt(d),adj:dir=>adjust(d,dir)})).concat([
      {l:'Restaurar padrões',a:()=>{const m=SETTINGS.map,mo=SETTINGS.mode;SETTINGS.reset();SETTINGS.map=m;SETTINGS.mode=mo;SETTINGS.save();applySettings('all');toast('Padrões restaurados',1500)}},
      {l:'‹ Voltar',a:()=>go('main')}])};
    const sl=MODES.scoreLines();
    P2.score={t:'PLACAR',items:sl.map(r=>({l:r.n,sub:r.st,val:()=>String(r.sc)+' tags',a:()=>{}})).concat([{l:'‹ Voltar',a:()=>go('main')}])};
    return P2}
  function fmt(d){const v=SETTINGS[d.k];if(d.opts){const o=d.opts.find(o=>o[0]===v);return o?o[1]:String(v)}return d.f(v)}
  function adjust(d,dir){let v=SETTINGS[d.k];
    if(d.opts){let i=d.opts.findIndex(o=>o[0]===v);i=(i+dir+d.opts.length)%d.opts.length;v=d.opts[i][0]}
    else v=Math.round(Math.max(d.min,Math.min(d.max,v+dir*d.step))/d.step)*d.step;set(d.k,+v===v?+(+v).toFixed(3):v)}
  function pickMode(m){close();if(m===MODES.cur&&m!='lava'&&state=='play'){toast('Já está em '+MODES.label(m),1500);return}MODES.start(m)}
  function go(pg){M.page=pg;M.focus=0;M.scroll=0;M.dirty=true}
  let cache=null;
  function draw(){const pg=cache=pages()[M.page],x=p.x;x.clearRect(0,0,W,Hh);
    x.fillStyle='rgba(8,20,14,.93)';rr(x,0,0,W,Hh,28);x.fill();x.strokeStyle='#3ddc84';x.lineWidth=4;rr(x,2,2,W-4,Hh-4,26);x.stroke();
    x.fillStyle='#3ddc84';x.font=FONT(40);x.textAlign='center';x.textBaseline='middle';x.fillText(pg.t,W/2,44);
    const n=pg.items.length;if(M.focus<M.scroll)M.scroll=M.focus;if(M.focus>=M.scroll+VIS)M.scroll=M.focus-VIS+1;
    for(let j=0;j<Math.min(VIS,n);j++){const i=j+M.scroll,it=pg.items[i];if(!it)break;const y=TOP+j*ROW,f=i===M.focus||i===M.hover;
      x.fillStyle=f?'#3ddc84':it.on?'rgba(61,220,132,.28)':'rgba(255,255,255,.08)';rr(x,16,y,W-32,ROW-6,12);x.fill();
      x.fillStyle=f?'#04210f':'#eafff2';x.textAlign='left';x.font=FONT(it.sub?22:24);x.fillText(it.l.toUpperCase(),32,y+(it.sub?14:20));
      if(it.sub){x.font=FONT(15);x.globalAlpha=.8;x.fillText(String(it.sub).toUpperCase().slice(0,44),32,y+31);x.globalAlpha=1}
      if(it.val||it.adj){x.textAlign='right';x.font=FONT(21);x.fillText((it.adj?'◀ ':'')+(it.val?it.val():'')+(it.adj?' ▶':''),W-30,y+20)}
      if(it.swatch){x.fillStyle=it.swatch();x.beginPath();x.arc(W-120,y+20,13,0,7);x.fill()}}
    if(n>VIS){x.fillStyle='#fff8';x.textAlign='center';x.font=FONT(16);x.fillText((M.scroll>0?'▲ ':'')+(M.scroll+VIS<n?'▼':''),W/2,TOP+VIS*ROW+4)}
    x.textAlign='center';x.font=FONT(14);x.fillStyle='#eafff2aa';
    x.fillText(INPUT.gaze?'OLHE + AGUARDE OU TOQUE NA TELA PARA ESCOLHER':'GATILHO/TOUCHPAD: ESCOLHER · ◀▶ AJUSTAR · SEGURE: FECHAR',W/2,Hh-22);
    p.t.needsUpdate=true;M.dirty=false}
  function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
  function place(){const hp=cam.getWorldPosition(_o);VRP.headWorldQuat(_q);_d.set(0,0,-1).applyQuaternion(_q);_d.y=0;if(_d.lengthSq()<1e-4)_d.set(0,0,-1);_d.normalize();
    p.m.position.copy(hp).addScaledVector(_d,1.15);p.m.position.y=hp.y-.12;p.m.lookAt(hp.x,p.m.position.y,hp.z);M.anchor.copy(P)}
  function open(){if(state!='play')return;M.open=true;INPUT.context='menu';go('main');place();p.m.visible=true;LOCO.anchor&&LOCO.release()}
  function close(){M.open=false;INPUT.context='game';p.m.visible=false;laser.visible=false;dot.visible=false}
  M.open_=open;M.close=close;M.toggle=()=>M.open?close():open();
  function activate(i,u){const it=cache&&cache.items[i];if(!it)return;if(it.adj&&!it.a){it.adj(u!=null&&u<.5?-1:1)}else if(it.a)it.a();M.dirty=true}
  // ponteiro: controle (laser), olhar, ou mouse
  function pointer(){
    if(INPUT.ctrl.present){const hp=cam.getWorldPosition(_o);VRP.headWorldQuat(_q);const rt=new THREE.Vector3(1,0,0).applyQuaternion(_q);rt.y=0;rt.normalize();
      _o.addScaledVector(rt,INPUT.handIndex?.18:-.18);_o.y-=.35;_d.set(0,0,-1).applyQuaternion(INPUT.ctrl.quat);ray.set(_o,_d);return 'ctrl'}
    if(!VRP.vrActive()&&!vrView&&M.mouse){ray.setFromCamera(M.mouse,cam);return 'mouse'}
    cam.getWorldPosition(_o);VRP.headWorldQuat(_q);_d.set(0,0,-1).applyQuaternion(_q);ray.set(_o,_d);return 'gaze'}
  addEventListener('mousemove',e=>{M.mouse={x:e.clientX/innerWidth*2-1,y:-(e.clientY/innerHeight)*2+1}});
  addEventListener('click',e=>{if(M.open&&!VRP.vrActive()&&!vrView&&M.hover>=0)activate(M.hover,M.hu)});
  M.pre=dt=>{
    if(INPUT.has('menu')||INPUT.has('back')&&!M.open){M.toggle();return}
    // Cardboard sem controle: olhar para cima por 1,5 s abre/fecha o menu
    if(state=='play'&&INPUT.gaze&&(vrView||VRP.vrActive())){VRP.headWorldQuat(_q);_d.set(0,0,-1).applyQuaternion(_q);if(_d.y>.9){M.upT+=dt;if(M.upT>1.5){M.upT=-99;M.toggle()}else if(M.upT>.4)HUD3D.toast('MENU EM '+Math.ceil(1.5-M.upT)+'…',400)}else M.upT=0}
    if(!M.open)return;
    const pg=cache||pages()[M.page],n=pg.items.length;
    if(INPUT.has('up')){M.focus=(M.focus-1+n)%n;M.dirty=true}
    if(INPUT.has('down')){M.focus=(M.focus+1)%n;M.dirty=true}
    const L=INPUT.has('left'),Rt=INPUT.has('right');if(L||Rt){const it=pg.items[M.hover>=0?M.hover:M.focus];if(it&&it.adj){it.adj(L?-1:1);M.dirty=true}else if(L&&M.page!='main')go('main')}
    if(INPUT.has('back'))M.page=='main'?close():go('main');
    if(INPUT.has('select'))activate(M.hover>=0?M.hover:M.focus,M.hu)};
  M.update=dt=>{if(!M.open){laser.visible=dot.visible=false;return}
    if(M.anchor.distanceTo(P)>1.5)place();
    const mode=pointer(),h=ray.intersectObject(p.m)[0];let idx=-1;M.hu=null;
    if(h&&h.uv){const px=h.uv.x*W,py=(1-h.uv.y)*Hh,j=Math.floor((py-TOP)/ROW);if(py>=TOP&&j>=0&&j<VIS&&px>16&&px<W-16){idx=j+M.scroll;M.hu=h.uv.x}if(cache&&idx>=cache.items.length)idx=-1}
    if(idx!==M.hover){M.hover=idx;M.dirty=true;if(idx>=0)M.focus=idx}
    // laser + cursor
    const end=h?h.point:_o.clone().addScaledVector(ray.ray.direction,3);
    if(mode=='ctrl'){const a=laserG.attributes.position.array;a[0]=ray.ray.origin.x;a[1]=ray.ray.origin.y;a[2]=ray.ray.origin.z;a[3]=end.x;a[4]=end.y;a[5]=end.z;laserG.attributes.position.needsUpdate=true;laser.visible=true}else laser.visible=false;
    dot.visible=!!h&&mode!='mouse';if(h){dot.position.copy(h.point);dot.quaternion.copy(p.m.quaternion);dot.translateZ(.005)}
    // permanência do olhar (sem controle)
    if(mode=='gaze'&&idx>=0){if(idx===M.dwellIdx){M.dwell+=dt;dot.scale.setScalar(1+M.dwell*1.6);if(M.dwell>1.5){M.dwell=-1;activate(idx,M.hu)}}else{M.dwellIdx=idx;M.dwell=0}}else{M.dwellIdx=-1;M.dwell=0;dot.scale.setScalar(1)}
    if(M.dirty)draw()};
  return M})();

// aplica configurações (física, braços, qualidade, nomes)
function applySettings(k){LOCO.applyTune();if(k=='arm'||k=='all')LOCO.applyArms();
  if(k=='quality'||k=='all'){gfx=VRP.effQuality();const g=$('gfx');if(g)g.value=gfx;dpr=prCap();rs();VRP.resize();
    const sh=gfx>0&&state=='play';R.shadowMap.enabled=sh;sun.castShadow=sh;R.shadowMap.needsUpdate=true;mapMeshes.forEach(m=>{m.material.needsUpdate=true});
    if(VRP.mode==='webxr'&&VRP.presenting)toast('Resolução VR muda na próxima entrada em VR',2500)}
  syncLobbySettings&&syncLobbySettings()}
