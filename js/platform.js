// MONKE GO — detecção de dispositivo/capacidades + configurações persistentes.
// Carregado ANTES de core.js (não depende de THREE).
'use strict';
const PLATFORM=(function(){
  const ua=navigator.userAgent||'';
  // Oculus Go: codinome "Pacific" no UA do Oculus Browser. Quest = "Quest". Gear VR = "SamsungBrowser ... VR" / "Mobile VR".
  const isGo=/Pacific/i.test(ua)||/OculusGo/i.test(ua);
  const isOculus=/OculusBrowser/i.test(ua)||isGo||/Quest/i.test(ua);
  const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const chrome=(ua.match(/Chrome\/(\d+)/)||[])[1]|0;
  let optChain=false;try{new Function('a','return a?.b');optChain=true}catch(e){}
  const P={ua,isGo,isOculus,isMobile,chrome,optChain,
    webxr:false,webxrChecked:false,webvr:!!navigator.getVRDisplays,vrDisplay:null,
    decompress:typeof window.DecompressionStream==='function',
    gyroLikely:isMobile&&!isOculus};
  P.ready=(async()=>{
    try{if(navigator.xr&&navigator.xr.isSessionSupported)P.webxr=!!(await navigator.xr.isSessionSupported('immersive-vr'))}catch(e){P.webxr=false}
    P.webxrChecked=true;
    if(P.webvr){try{const ds=await navigator.getVRDisplays();P.vrDisplay=(ds||[]).find(d=>d.capabilities&&d.capabilities.canPresent)||null}catch(e){P.vrDisplay=null}}
    return P})();
  // Melhor API de VR disponível. "auto" = WebXR > WebVR 1.1 > Cardboard (celular) > tela normal.
  P.pickApi=pref=>{
    if(pref==='webxr')return P.webxr?'webxr':(P.vrDisplay?'webvr':'flat');
    if(pref==='webvr')return P.vrDisplay?'webvr':(P.webxr?'webxr':'flat');
    if(pref==='cardboard')return 'cardboard';
    if(pref==='flat')return 'flat';
    if(P.webxr)return 'webxr';if(P.vrDisplay)return 'webvr';
    return P.gyroLikely?'cardboard':'flat'};
  P.describe=()=>{const a=[];a.push(isGo?'Oculus Go':isOculus?'Oculus Browser':isMobile?'Celular':'Desktop');
    a.push('WebXR: '+(P.webxr?'sim':'não'));a.push('WebVR 1.1: '+(P.vrDisplay?('sim ('+P.vrDisplay.displayName+')'):'não'));
    if(chrome)a.push('Chromium '+chrome);return a.join(' · ')};
  return P})();

// ---------- configurações (persistentes em localStorage) ----------
const SETTINGS=(function(){
  const D={impulse:2.2,maxSpeed:9,gravity:9.8,friction:5.5,sens:1.25,assist:.5,quality:PLATFORM.isGo?0:-1,
    arm:1.22,simHand:1,speedMode:'fast',music:.35,snap:1,names:1,handed:'auto',vrApi:'auto',map:'forest',mode:'solo',reach:1};
  const S=Object.assign({},D);
  try{const j=JSON.parse(localStorage.getItem('monke_settings')||'{}');for(const k in D)if(k in j&&typeof j[k]===typeof D[k])S[k]=j[k]}catch(e){}
  S.defaults=D;
  S.save=()=>{try{const o={};for(const k in D)o[k]=S[k];localStorage.setItem('monke_settings',JSON.stringify(o))}catch(e){}};
  S.reset=()=>{for(const k in D)S[k]=D[k];S.save()};
  return S})();

// Faixas/rótulos usados pelo menu VR e pelo lobby 2D (um único lugar = sem divergência).
const SETTING_DEFS=[
  {k:'speedMode',l:'Velocidade do movimento',opts:[['fast','Rápido (atual)'],['medium','Médio'],['slow','Lento']]},
  {k:'music',l:'Volume da música',min:0,max:1,step:.05,f:v=>v<=0?'Desligada':Math.round(v*100)+'%'},
  {k:'impulse',l:'Força do impulso',min:1,max:4,step:.1,f:v=>v.toFixed(1)+'x'},
  {k:'maxSpeed',l:'Velocidade máxima',min:4,max:16,step:.5,f:v=>v.toFixed(1)+' m/s'},
  {k:'gravity',l:'Gravidade',min:4,max:14,step:.2,f:v=>v.toFixed(1)},
  {k:'friction',l:'Atrito',min:1,max:10,step:.25,f:v=>v.toFixed(2)},
  {k:'sens',l:'Sensibilidade',min:.5,max:2.5,step:.05,f:v=>v.toFixed(2)+'x'},
  {k:'assist',l:'Assistência',min:0,max:1,step:.1,f:v=>Math.round(v*100)+'%'},
  {k:'arm',l:'Comprimento dos braços',min:1,max:1.45,step:.05,f:v=>v.toFixed(2)+'x'},
  {k:'quality',l:'Qualidade gráfica',opts:[[-1,'Auto'],[0,'Baixa (Go)'],[1,'Média'],[2,'Alta']]},
  {k:'simHand',l:'Segunda mão',opts:[[0,'Desligada'],[1,'Alternada'],[2,'Espelhada']]},
  {k:'snap',l:'Giro no touchpad',opts:[[0,'Desligado'],[1,'Snap 30°'],[2,'Snap 45°']]},
  {k:'handed',l:'Mão do controle',opts:[['auto','Auto'],['right','Direita'],['left','Esquerda']]},
  {k:'names',l:'Nomes dos jogadores',opts:[[1,'Mostrar'],[0,'Ocultar']]},
];
