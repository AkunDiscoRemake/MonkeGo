// MONKE GO — boot, lobby 2D e ligação entre módulos.
'use strict';
// MediaPipe Hands (rastreamento de mãos pela câmera, modo Cardboard ORIGINAL) — carregado só quando usado.
// No Oculus Go nunca é baixado (não há câmera acessível ao navegador).
function loadHands(){if(window.Hands)return Promise.resolve();return new Promise((res,rej)=>{const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js';s.crossOrigin='anonymous';s.onload=res;s.onerror=()=>rej('MediaPipe indisponível');document.head.appendChild(s)})}
const MENU2D={show(on,msg){$('pause').classList.toggle('on',!!on);if(msg)$('pmsg').textContent=msg}};

// ---------- ajustes no lobby (mesmas definições do menu VR) ----------
(function(){const box=$('setx');SETTING_DEFS.forEach(d=>{if(d.k==='quality')return;const r=document.createElement('div');r.className='row2';
  const lb=document.createElement('span');lb.className='lb';lb.style.flex='0 0 46%';lb.textContent=d.l;r.appendChild(lb);let el;
  if(d.opts){el=document.createElement('select');d.opts.forEach(o=>{const op=document.createElement('option');op.value=String(o[0]);op.textContent=o[1];el.appendChild(op)});
    el.onchange=()=>{const o=d.opts.find(o=>String(o[0])===el.value);SETTINGS[d.k]=o[0];SETTINGS.save();applySettings(d.k)}}
  else{el=document.createElement('input');el.type='range';el.min=d.min;el.max=d.max;el.step=d.step;el.oninput=()=>{SETTINGS[d.k]=+el.value;SETTINGS.save();applySettings(d.k)}}
  const vl=document.createElement('span');vl.style.cssText='flex:0 0 22%;font-size:12px;text-align:right';el.id='set_'+d.k;vl.id='setv_'+d.k;r.appendChild(el);r.appendChild(vl);box.appendChild(r)});
  const rb=document.createElement('button');rb.textContent='RESTAURAR PADRÕES';rb.onclick=()=>{const m=SETTINGS.map,mo=SETTINGS.mode;SETTINGS.reset();SETTINGS.map=m;SETTINGS.mode=mo;SETTINGS.save();applySettings('all')};box.appendChild(rb)})();
function syncLobbySettings(){SETTING_DEFS.forEach(d=>{const el=$('set_'+d.k),vl=$('setv_'+d.k);if(el)el.value=String(SETTINGS[d.k]);if(vl)vl.textContent=d.opts?'':d.f(SETTINGS[d.k])});
  const g=$('gfx');if(g)g.value=String(VRP.effQuality())}
$('gfx').addEventListener('change',e=>{SETTINGS.quality=+e.target.value;SETTINGS.save();applySettings('quality')});
$('vr').value=SETTINGS.vrApi;$('vr').onchange=e=>{SETTINGS.vrApi=e.target.value;SETTINGS.save();vrOn=PLATFORM.pickApi(SETTINGS.vrApi)==='cardboard'};
// seleção de mapa (áreas do mapa original)
MAPS.list.forEach(a=>{const o=document.createElement('option');o.value=a.id;o.textContent=a.name+' — '+a.desc;$('area').appendChild(o)});
$('area').value=SETTINGS.map;$('area').onchange=e=>MAPS.go(e.target.value);
// cores extras (estilo babuíno)
['#6b5a3a','#8a7f62'].forEach(c=>{const d=document.createElement('div');d.className='sw';d.style.background=c;d.onclick=()=>setColor(c);$('sws').appendChild(d)});

// ---------- prontidão ----------
const _chk=chk;chk=function(){_chk();const ok=!!(pl&&mapDone);['solo','lava','vrgo','qj','jn'].forEach(i=>$(i).disabled=!ok);if(ok)st('Pronto! Escolha um modo.')};
['solo','lava','vrgo'].forEach(i=>$(i).disabled=true);
HOOK.enterFail=()=>chk();

// ---------- iniciar (sempre dentro do gesto do usuário: requestSession/requestPresent exigem isso) ----------
function launch(fn,openMenu){initAudio();VRP.start(SETTINGS.vrApi);fn();
  if(openMenu){const t=setInterval(()=>{if(state=='play'){clearInterval(t);VRMENU.open_()}},200)}}
$('solo').onclick=()=>launch(()=>MODES.start('solo'));
$('lava').onclick=()=>launch(()=>MODES.start('lava'));
$('qj').onclick=()=>launch(()=>MODES.start('tag'));
$('pkc').onclick=()=>{$('pick').classList.remove('on');launch(()=>MODES.start('cas',pickCode))};
$('pki').onclick=()=>{$('pick').classList.remove('on');launch(()=>MODES.start('inf',pickCode))};
$('vrgo').onclick=()=>launch(()=>MODES.start(SETTINGS.mode=='lava'?'lava':'solo'),true);
$('pvr').onclick=()=>{MENU2D.show(false);VRP.start(SETTINGS.vrApi)};
$('pflat').onclick=()=>MENU2D.show(false);
$('plobby').onclick=()=>location.reload();
// Oculus Go (WebVR): ao colocar o headset/abrir a página em VR o navegador dispara vrdisplayactivate,
// onde requestPresent é permitido sem clique.
addEventListener('vrdisplayactivate',()=>{if(state=='lobby'&&pl&&mapDone&&PLATFORM.pickApi(SETTINGS.vrApi)==='webvr')launch(()=>MODES.start('solo'),true)});

// ---------- ganchos por quadro ----------
HOOK.playerBuilt=()=>LOCO.applyArms();
HOOK.pre=dt=>{INPUT.poll(dt);VRMENU.pre(dt)};
HOOK.post=(dt,now)=>{MODES.update(dt,now);VRMENU.update(dt);HUD3D.update(dt)};

// ---------- boot ----------
LOCO.applyTune();gfx=VRP.effQuality();dpr=prCap();rs();syncLobbySettings();
PLATFORM.ready.then(()=>{$('devinfo').textContent=PLATFORM.describe();
  if(PLATFORM.webxr||PLATFORM.vrDisplay){$('vrgo').style.display='';$('vrgo').textContent=PLATFORM.isGo?'ENTRAR EM VR (OCULUS GO)':'ENTRAR EM VR'}
  [['webxr',PLATFORM.webxr],['webvr',!!PLATFORM.vrDisplay]].forEach(([v,ok])=>{const o=$('vr').querySelector('option[value='+v+']');if(o&&!ok){o.disabled=true;o.textContent+=' — indisponível'}});
  vrOn=PLATFORM.pickApi(SETTINGS.vrApi)==='cardboard'});
requestAnimationFrame(frame);
MAPS.load();
