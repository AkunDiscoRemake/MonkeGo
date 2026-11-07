// MONKE GO — música chill de fundo (faixas CC0 do OpenGameArt, ver README/créditos).
// Usa <audio> com streaming (não decodifica a faixa inteira na memória do Go) e só baixa a faixa que vai tocar.
// Começa no primeiro gesto do usuário (política de autoplay dos navegadores).
'use strict';
const MUSIC=(function(){
  const TRACKS=[
    {f:'chill-lofi.mp3',t:'Chill Lofi Inspired',a:'omfgdude'},
    {f:'lofi-hip-hop.mp3',t:'Lofi Hip Hop',a:'omfgdude'},
    {f:'napping-on-a-cloud.mp3',t:'Napping On A Cloud',a:'congusbongus'},
  ];
  const M={i:Math.floor(Math.random()*TRACKS.length),on:false,el:null,duck:1};
  function el(){if(M.el)return M.el;const a=new Audio();a.preload='none';a.loop=false;
    a.addEventListener('ended',()=>M.next(true));a.addEventListener('error',()=>setTimeout(()=>M.next(true),2000));M.el=a;return a}
  M.volume=()=>{if(!M.el){if(!(M.on&&SETTINGS.music>0))return;el().src=ASSET+'music/'+TRACKS[M.i].f}const v=Math.max(0,Math.min(1,SETTINGS.music))*M.duck;M.el.volume=v;
    if(v<=0&&!M.el.paused)M.el.pause();else if(v>0&&M.on&&M.el.paused)M.el.play().catch(()=>{})};
  M.start=()=>{if(M.on)return;M.on=true;if(SETTINGS.music<=0)return;const a=el();if(!a.src)a.src=ASSET+'music/'+TRACKS[M.i].f;M.volume();a.play().catch(()=>{M.on=false})};
  M.next=auto=>{M.i=(M.i+1)%TRACKS.length;const a=el();a.src=ASSET+'music/'+TRACKS[M.i].f;M.volume();if(M.on&&SETTINGS.music>0)a.play().catch(()=>{});if(!auto)toast('♪ '+M.now(),2500)};
  M.now=()=>TRACKS[M.i].t+' — '+TRACKS[M.i].a+' (CC0)';
  M.setDuck=d=>{if(Math.abs(d-M.duck)>.01){M.duck=d;M.volume()}};
  // primeiro toque/clique/tecla em qualquer lugar inicia a música
  const go=()=>M.start(); // idempotente; se o navegador bloquear, o próximo gesto tenta de novo
  addEventListener('pointerdown',go);addEventListener('keydown',go);
  // o navegador pode pausar o áudio ao sair/entrar no VR: retoma
  addEventListener('vrdisplaypresentchange',()=>{if(M.on)M.volume()});
  document.addEventListener('visibilitychange',()=>{if(!M.el||!M.on)return;if(document.hidden)M.el.pause();else M.volume()});
  return M})();
