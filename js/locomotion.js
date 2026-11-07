// Gorilla Rush (Oculus Go) — Gorilla Locomotion híbrido para UM controle 3DoF (Oculus Go).
// O núcleo original já move o macaco quando a mão encosta numa superfície e é empurrada (para trás/baixo).
// Aqui geramos as posições das mãos a partir do controle 3DoF:
//  • Mão real: modelo de braço — ombro fixo no corpo + direção do controle (amplificada pela sensibilidade).
//    Girar o pulso para trás com a mão no chão = empurrão para frente; girar para baixo rápido = pulo.
//  • Duas mãos com um controle (padrão "Troca automática"): o controle move uma mão por vez; ao fim de cada
//    braçada a mão fica plantada (estável) e o controle passa para a outra. Modos antigos: Alternada/Espelhada.
//  • Gatilho = AGARRAR: com a mão encostada, a mão fica ancorada e o corpo se move ao redor dela
//    (escalar paredes, puxar-se para cima, arremessar-se ao soltar). Esse é o mecanismo real do Gorilla Tag.
//  • Cabeça = orientação do corpo. Touchpad (só tocar) = assistência de movimento suave e opcional.
'use strict';
const LOCO=(function(){
  const L={was:[false,false],anchor:null,climbVel:new THREE.Vector3(),hist:[],desiredW:[new THREE.Vector3(),new THREE.Vector3()],grabbed:false};
  const _d=new THREE.Vector3(),_n=new THREE.Vector3(),_ax=new THREE.Vector3(),_q=new THREE.Quaternion(),_hq=new THREE.Quaternion(),_v=new THREE.Vector3(),_w=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
  let L1b=0,L2b=0;
  // Velocidade do movimento: Rápido = valores atuais; Médio/Lento reduzem impulso, velocidade máxima, pulo e assistência
  L.speedMul=()=>({fast:1,medium:.7,slow:.45})[SETTINGS.speedMode]||1;
  L.applyTune=()=>{const k=L.speedMul();TUNE.imp=SETTINGS.impulse*k;TUNE.jmp=(1+(SETTINGS.impulse-1)*.32)*Math.sqrt(k);TUNE.grav=SETTINGS.gravity;TUNE.fric=SETTINGS.friction;TUNE.max=SETTINGS.maxSpeed*k;TUNE.spd=k;SHOW_NAMES=!!SETTINGS.names;window.MUSIC&&MUSIC.volume()};
  L.applyArms=()=>{if(!LM||!LM.uL)return;if(!L1b){L1b=L1;L2b=L2}const k=SETTINGS.arm;
    [LM.uL,LM.uR].forEach(b=>b&&b.scale.setScalar(k));for(const id in RO){const M=RO[id];[M.uL,M.uR].forEach(b=>b&&b.scale.setScalar(k))}
    L1=L1b*k;L2=L2b*k;ARM=(L1+L2)*.98};
  const active=()=>INPUT.ctrl.present&&VRP.threeDoF()&&state=='play';
  // direção do corpo: guinada da cabeça (com proteção ao olhar reto para cima/baixo)
  HOOK.bodyFw=(fw,d)=>{VRP.headWorldQuat(_hq);_d.set(0,0,-1).applyQuaternion(_hq);
    if(Math.abs(_d.y)>.97){_d.set(0,1,0).applyQuaternion(_hq).multiplyScalar(-Math.sign(_d.y))}
    fw.set(_d.x,0,_d.z);if(fw.lengthSq()<1e-6)fw.set(0,0,-1);fw.normalize();d.set(0,0,-1).applyQuaternion(_hq)};
  // ---- estabilização do controle 3DoF: filtro adaptativo (parado = suave; movimento rápido = sem atraso) ----
  const fq=new THREE.Quaternion();let fqInit=false;
  function filterCtrl(dt){const q=INPUT.ctrl.quat;if(!fqInit){fq.copy(q);fqInit=true;return}
    const ang=2*Math.acos(Math.min(1,Math.abs(fq.dot(q)))),spd=ang/Math.max(dt,1e-3);
    const base=60-50*SETTINGS.smooth;/* 60/s = quase cru; 10/s = bem suave */const k=1-Math.exp(-dt*(base+spd*25));fq.slerp(q,Math.min(1,k))}
  // posição desejada (local: x=direita, y=cima, z=frente; relativo à cabeça P) da mão i guiada pelo controle.
  // A mão do lado oposto ao controle usa a direção espelhada, para o gesto ficar natural nas duas mãos.
  function realLocal(i,fw,rt,out){
    _d.set(0,0,-1).applyQuaternion(fq);
    if(i!==INPUT.handIndex){const lx=_d.dot(rt);_d.addScaledVector(rt,-2*lx)}
    // direção neutra = 40° abaixo do horizonte à frente; sensibilidade amplifica o desvio angular
    _n.copy(fw).multiplyScalar(.766).addScaledVector(UP,-.643).normalize();
    const ang=Math.acos(Math.max(-1,Math.min(1,_n.dot(_d))));_ax.crossVectors(_n,_d);
    if(_ax.lengthSq()>1e-8&&ang>1e-4){_ax.normalize();_q.setFromAxisAngle(_ax,Math.min(ang*SETTINGS.sens,2.9));_d.copy(_n).applyQuaternion(_q)}
    const sx=i?.19:-.19,reach=ARM*SETTINGS.reach;
    _v.set(sx,-.3,-.08);
    out.set(_v.x+_d.dot(rt)*reach,_v.y+_d.y*reach,_v.z+_d.dot(fw)*reach);return out}
  const toLocal=(w,fw,rt,out)=>{_v.copy(w).sub(P);return out.set(_v.dot(rt),_v.y,_v.dot(fw))};
  const toWorld=(o,fw,rt,out)=>out.copy(P).addScaledVector(rt,o.x).addScaledVector(UP,o.y).addScaledVector(fw,o.z);
  // ---- DUAS MÃOS COM UM CONTROLE (modo "Troca automática") ----
  // O controle move UMA mão por vez (a "ativa"). Ao terminar uma braçada (a mão encostou numa superfície e
  // levantou), essa mão fica PLANTADA exatamente onde estava (fixa no mundo, sem tremer) e o controle passa a
  // mover a outra. Resultado: mãos alternando como na corrida do Gorilla Tag, ambas estáveis.
  // A mão plantada/passiva nunca gera impulso (HOOK.noPush) — só a ativa empurra, então não há impulso duplo.
  L.act=1;L.plant=[null,null];L.blend=[new THREE.Vector3(),new THREE.Vector3()];L.pas=[new THREE.Vector3(-.24,-.95,.12),new THREE.Vector3(.24,-.95,.12)];
  let touchT=0,lastC=new THREE.Vector3(),frameDone=-1;
  const REST=i=>new THREE.Vector3(i?.24:-.24,-.95,.12);
  L.ctrlHand=()=>SETTINGS.simHand==3?L.act:INPUT.handIndex;
  function swapTick(fw,rt,dt){
    if(frameDone===fr)return;frameDone=fr;filterCtrl(dt);
    if(SETTINGS.simHand!=3||L.anchor)return;
    const a=L.act;
    if(touch[a]){touchT+=dt;lastC.copy(tgt[a])}
    else if(touchT>.08){touchT=0;const b=1-a;
      L.plant[a]=lastC.clone();                         // mão que terminou a braçada fica plantada
      // a outra mão assume de onde ela está (offset que some suavemente -> sem salto)
      const cur=L.plant[b]?toLocal(L.plant[b],fw,rt,new THREE.Vector3()):L.pas[b].clone();
      L.plant[b]=null;L.blend[b].copy(cur).sub(realLocal(b,fw,rt,new THREE.Vector3()));L.act=b}
    else touchT=0}
  // só a mão ativa empurra, e só depois de 'alcançar' o controle (o offset de transição não gera impulso falso)
  HOOK.noPush=i=>SETTINGS.simHand==3&&active()&&INPUT.context!='menu'&&(i!==L.act||L.blend[i].lengthSq()>.0016);
  HOOK.hand=(i,fw,rt,dt)=>{
    if(!active()||INPUT.context=='menu'){L.hist.length=0;L.was[i]=false;L.plant[i]=null;fqInit=false;return null}
    swapTick(fw,rt,dt);
    const now=performance.now();
    if(SETTINGS.simHand==3){let o;
      if(i===L.act){o=realLocal(i,fw,rt,new THREE.Vector3());L.blend[i].multiplyScalar(Math.exp(-dt*9));o.add(L.blend[i]);
        L.desiredW[i].copy(toWorld(o,fw,rt,_w));if(L.anchor)toLocal(L.anchor,fw,rt,o)}
      else{const pl2=L.plant[i];
        if(pl2){const sh=_w.copy(P).addScaledVector(rt,i?.19:-.19);sh.y-=.3;if(pl2.distanceTo(sh)>ARM*1.02)L.plant[i]=null}
        if(L.plant[i])o=toLocal(L.plant[i],fw,rt,new THREE.Vector3());
        else{L.pas[i].lerp(REST(i),1-Math.exp(-dt*7));o=L.pas[i].clone()}
        L.pas[i].copy(o)}
      if(!L.was[i]){L.was[i]=true;hl[i].copy(o);hv[i].set(0,0,0)}
      return o}
    const ri=INPUT.handIndex;
    if(i===ri){const o=realLocal(i,fw,rt,new THREE.Vector3());
      // mão reativando (menu fechado, controle reconectado, teleporte): começa na pose atual, sem pico de velocidade
      if(!L.was[i]){L.was[i]=true;hl[i].copy(o);hv[i].set(0,0,0)}
      L.desiredW[i].copy(P).addScaledVector(rt,o.x).addScaledVector(UP,o.y).addScaledVector(fw,o.z);
      L.hist.push({t:now,x:o.x,y:o.y,z:o.z});while(L.hist.length>90||(L.hist.length&&now-L.hist[0].t>1000))L.hist.shift();
      if(L.anchor){_v.copy(L.anchor).sub(P);return o.set(_v.dot(rt),_v.y,_v.dot(fw))}
      return o}
    const m=SETTINGS.simHand;if(!m||!L.hist.length){L.was[i]=false;return null}
    let s=L.hist[L.hist.length-1];
    if(m==1){const tt=now-220/Math.max(.6,SETTINGS.sens);for(let k=L.hist.length-1;k>=0;k--){s=L.hist[k];if(L.hist[k].t<=tt)break}}
    // a mão simulada nunca agarra (o gatilho só ancora a mão real)
    const o=new THREE.Vector3(-s.x,s.y,s.z);if(!L.was[i]){L.was[i]=true;hl[i].copy(o);hv[i].set(0,0,0)}return o};
  function nearSurface(p){const r=.12+.25*SETTINGS.assist;if(hit(_w.set(p.x,p.y+.2,p.z),DOWN,.2+r))return true;
    for(let k=0;k<4;k++){_v.set(k&2?1:0,0,k&2?0:1);if(k&1)_v.negate();if(hit(p,_v,r))return true}return false}
  HOOK.climb=(dt,fw,rt)=>{
    const ri=L.ctrlHand();
    if(!active()||INPUT.context=='menu'||!INPUT.ctrl.trigger){if(L.anchor)release();return false}
    if(!L.anchor){if(touch[ri]||nearSurface(tgt[ri])){L.anchor=tgt[ri].clone();L.climbVel.set(0,0,0);tapSound(ri,lastCls,.6)}else return false}
    // corpo se move para que a mão desejada coincida com a âncora
    _v.copy(L.anchor).sub(L.desiredW[ri]);
    const shoulder=_w.copy(P).addScaledVector(fw,-.12);shoulder.y-=.3;
    if(L.anchor.distanceTo(shoulder)>ARM*1.7){release();return false}
    const lim=TUNE.max*1.4*dt;if(_v.length()>lim)_v.setLength(lim);
    {const y0=P.y,n=Math.max(1,Math.ceil(_v.length()/.1));_v.divideScalar(n);for(let i=0;i<n;i++){const y1=P.y;P.add(_v);wallFix();groundSweep(y1)}_v.multiplyScalar(n);void y0}
    L.climbVel.lerp(_v.divideScalar(Math.max(dt,1e-3)),1-Math.exp(-dt*18));
    vel.copy(L.climbVel);return true};
  function release(){L.anchor=null;
    // arremesso: velocidade do último gesto × impulso (bem maior que o padrão, mas limitado)
    const boost=Math.min(1.8,.75+.35*SETTINGS.impulse*L.speedMul());vel.multiplyScalar(boost);const h=Math.hypot(vel.x,vel.z),mx=TUNE.max*1.3;if(h>mx){vel.x*=mx/h;vel.z*=mx/h}
    if(vel.y>8*TUNE.jmp)vel.y=8*TUNE.jmp}
  L.release=release;
  L.reset=()=>{L.anchor=null;L.was[0]=L.was[1]=false;L.hist.length=0;L.plant[0]=L.plant[1]=null;touchT=0;L.act=INPUT.handIndex;fqInit=false};
  // assistência do touchpad + ações de jogo do controle
  HOOK.move=(fw,rt,grounded)=>{const r={x:0,z:0,jump:false};if(INPUT.context=='menu')return r;
    if(INPUT.has('jump'))r.jump=true;
    const tl=INPUT.has('turnL'),tr=INPUT.has('turnR');if(tl||tr){const a=(SETTINGS.snap==2?45:30)*Math.PI/180*(tl?1:-1);if(VRP.vrActive())VRP.turn(a);else yw+=a}
    const pm=INPUT.padMove();if(pm&&SETTINGS.assist>0){const k=pm.r*SETTINGS.assist*(grounded?1:.6)*L.speedMul();r.z=-pm.y/Math.hypot(pm.x,pm.y)*k;r.x=pm.x/Math.hypot(pm.x,pm.y)*k}
    return r};
  HOOK.padFilter=g=>g&&INPUT.isVRPad(g)?null:g;
  HOOK.inputLocked=()=>INPUT.context=='menu';
  return L})();
