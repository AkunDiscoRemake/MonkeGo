// MONKE GO — sistema de entrada CENTRALIZADO.
// Todas as fontes (controle Oculus Go via WebVR ou WebXR, gamepad comum, teclado, toque/Cardboard, olhar)
// são lidas aqui uma vez por quadro e convertidas em: estado contínuo (orientação do controle, gatilho,
// touchpad) + AÇÕES discretas roteadas para o contexto ativo ('game' ou 'menu'). Assim um mesmo botão
// nunca dispara duas coisas ao mesmo tempo (ex.: clique do touchpad = pular no jogo, confirmar no menu).
'use strict';
const INPUT=(function(){
  const I={
    context:'game',
    ctrl:{present:false,source:'',id:'',hand:'right',raw:new THREE.Quaternion(),quat:new THREE.Quaternion(),
      trigger:false,touch:false,x:0,y:0,click:false},
    gaze:true,           // sem controle -> menus por olhar (Cardboard)
    actions:[],          // fila de ações do quadro: {a:'menu'|'select'|'jump'|'turnL'|'turnR'|'up'|'down'|'left'|'right'|'back'}
    trigDown:false,trigUp:false,
    xrSources:[],        // preenchido por vr.js (WebXR)
    xrSelect:[false,false],
  };
  const PRESS_LONG=.6;let pad0=null,padT=0,padLong=false,touchStart=null,lastTrig=false,lastBack=false,swipeLock=0;
  const isVRPad=g=>!!(g&&(g.pose||/Oculus|Gear VR|Daydream|OpenVR|Pacific/i.test(g.id||'')||g.hand||g.mapping==='xr-standard'));
  I.isVRPad=isVRPad;
  // eventos (teclado/toque) chegam entre quadros: ficam pendentes e entram na fila no próximo poll
  const pend=[];function push(a,x){pend.push({a,x})}
  I.push=push;
  // ---- fontes ----
  function readWebVR(){
    const gps=navigator.getGamepads?navigator.getGamepads():[];let g=null;
    for(let i=0;i<gps.length;i++){const p=gps[i];if(p&&p.connected&&p.pose&&(p.pose.hasOrientation||p.pose.orientation)){g=p;break}}
    if(!g)return false;
    const c=I.ctrl;c.present=true;c.source='webvr';c.id=g.id;c.hand=g.hand||'right';
    const o=g.pose.orientation;if(o)c.raw.set(o[0],o[1],o[2],o[3]);
    const b=g.buttons||[];c.click=!!(b[0]&&b[0].pressed);c.touch=!!(b[0]&&(b[0].touched||b[0].pressed))||Math.abs(g.axes[0]||0)>.01||Math.abs(g.axes[1]||0)>.01;
    c.trigger=!!(b[1]&&(b[1].pressed||b[1].value>.5));c.x=g.axes[0]||0;c.y=g.axes[1]||0;
    const back=/Gear VR/i.test(g.id)&&b[2]&&b[2].pressed;if(back&&!lastBack)push('back');lastBack=!!back;
    return true}
  function readWebXR(){
    const src=I.xrSources;if(!src||!src.length)return false;let k=-1;
    for(let i=0;i<src.length;i++){const s=src[i];if(s&&s.targetRayMode==='tracked-pointer'){k=i;break}}
    if(k<0)return false;const s=src[k],c=I.ctrl;c.present=true;c.source='webxr';c.id=(s.profiles&&s.profiles[0])||'xr';c.hand=s.handedness==='left'?'left':'right';
    if(VRP.xrCtrlQuat(k,c.raw)===false)return false;
    const g=s.gamepad;
    if(g&&g.buttons&&g.buttons.length){const b=g.buttons;c.trigger=!!(b[0]&&(b[0].pressed||b[0].value>.5))||I.xrSelect[k];
      const tp=b[2]||b[3]||null;c.click=!!(tp&&tp.pressed);const ax=g.axes||[];
      // xr-standard: touchpad = axes[0,1]; thumbstick = axes[2,3]
      c.x=ax[0]||ax[2]||0;c.y=ax[1]||ax[3]||0;c.touch=!!(tp&&(tp.touched||tp.pressed))||Math.abs(c.x)>.01||Math.abs(c.y)>.01;
      if(b[3]&&b[3].pressed&&c.id.indexOf('touchpad')<0){/* botão extra (ex.: Quest A) = menu */if(!lastBack)push('menu');lastBack=true}else lastBack=false}
    else{c.trigger=!!I.xrSelect[k];c.click=false;c.touch=false;c.x=c.y=0}
    return true}
  // ---- teclado (desktop / depuração) ----
  addEventListener('keydown',e=>{if(e.target&&(e.target.tagName=='INPUT'||e.target.tagName=='SELECT'))return;
    const k=e.code;if(k=='Escape'||k=='KeyM'||k=='Tab'){push('menu');e.preventDefault()}
    else if(I.context=='menu'){if(k=='ArrowUp')push('up');else if(k=='ArrowDown')push('down');else if(k=='ArrowLeft')push('left');else if(k=='ArrowRight')push('right');else if(k=='Enter'||k=='Space'){push('select');e.preventDefault()}else if(k=='Backspace')push('back')}
    else if(k=='KeyQ')push('turnL');else if(k=='KeyE')push('turnR')});
  // ---- toque (Cardboard: o botão do Cardboard gera um toque na tela) ----
  let tDown=0,tPos=null,tLongFired=false;
  addEventListener('pointerdown',e=>{if(state!='play')return;tDown=performance.now();tPos=[e.clientX,e.clientY];tLongFired=false});
  addEventListener('pointerup',e=>{if(state!='play'||!tPos)return;const short=performance.now()-tDown<350&&Math.hypot(e.clientX-tPos[0],e.clientY-tPos[1])<14;
    if(I.context=='menu'&&short&&!tLongFired)push('select',{sx:e.clientX,sy:e.clientY});tPos=null});
  addEventListener('pointercancel',()=>{tPos=null});
  // botão "voltar" do navegador (Oculus Go fora do modo VR / Android): abre o menu em vez de sair da página
  try{history.pushState({monke:1},'');addEventListener('popstate',()=>{if(state=='play'){push('menu');try{history.pushState({monke:1},'')}catch(e){}}})}catch(e){}

  I.poll=function(dt){
    I.actions.length=0;while(pend.length)I.actions.push(pend.shift());const c=I.ctrl,was=c.present;
    c.present=false;
    if(!(VRP.mode==='webxr'&&readWebXR()))readWebVR();
    if(!c.present){c.trigger=c.click=c.touch=false;c.x=c.y=0}
    I.gaze=!c.present;
    if(c.present&&!was)toast('Controle conectado: '+(c.id||'controle 3DoF'),2500);
    // mão do controle
    const h=SETTINGS.handed==='auto'?c.hand:SETTINGS.handed;I.handIndex=h==='left'?0:1;
    // orientação no mundo = giro (snap turn / yaw do rig) * orientação do controle
    VRP.toWorldQuat(c.raw,c.quat);
    // gatilho
    I.trigDown=c.trigger&&!lastTrig;I.trigUp=!c.trigger&&lastTrig;lastTrig=c.trigger;
    if(I.trigDown&&I.context=='menu')push('select');
    // touchpad: clique curto / longo, swipe
    const now=performance.now()/1000;
    if(c.click&&!pad0){pad0={x:c.x,y:c.y};padT=now;padLong=false}
    if(c.click&&pad0&&!padLong&&now-padT>PRESS_LONG){padLong=true;push('menu')}
    if(!c.click&&pad0){if(!padLong){const x=pad0.x,y=pad0.y;
        if(I.context=='menu'){if(Math.abs(x)>.6&&Math.abs(x)>Math.abs(y))push(x<0?'left':'right');else push('select')}
        else{if(SETTINGS.snap&&Math.abs(x)>.55&&Math.abs(x)>Math.abs(y))push(x<0?'turnL':'turnR');else push('jump')}}
      pad0=null}
    if(c.touch&&!c.click){if(!touchStart)touchStart={x:c.x,y:c.y};else if(I.context=='menu'&&now>swipeLock){const dy=c.y-touchStart.y;if(Math.abs(dy)>.55){push(dy<0?'up':'down');touchStart={x:c.x,y:c.y};swipeLock=now+.18}}}
    else if(!c.touch)touchStart=null;
    // toque longo na tela (Cardboard) = menu
    if(tPos&&!tLongFired&&(assist==0||I.context=='menu')&&performance.now()-tDown>800){tLongFired=true;push('menu')}
  };
  I.has=a=>{for(let i=0;i<I.actions.length;i++)if(I.actions[i].a===a)return I.actions[i];return null};
  // vetor de movimento assistido pelo touchpad (apenas tocado, sem clique) — suave, opcional
  I.padMove=()=>{const c=I.ctrl;if(!c.present||!c.touch||c.click||I.context!='game')return null;
    const r=Math.hypot(c.x,c.y);if(r<.25)return null;return {x:c.x,y:c.y,r:Math.min(1,(r-.25)/.6)}};
  return I})();
