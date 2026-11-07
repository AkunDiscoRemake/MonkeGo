// Gorilla Rush (Oculus Go) — identidade da versão Oculus Go: estilos do macaco (Monke / Baboon), quadro do lobby no mundo 3D e
// mecânicas de tag no estilo dos fan games de macaco (tag freeze, som de tag, pegador mais rápido).
'use strict';
const MONKE=(function(){
  const K={isIt:false,freezeT:0};
  // ---------- estilos ----------
  // Monke: pelagem marrom e rosto escuro (inspirado no Gorilla Tag). Baboon: cinza-oliva e rosto rosado
  // (inspirado no Scary Baboon). Original: visual do Gorilla Rush.
  K.STY={monke:{n:'Monke',fur:'#5b3a24',face:0x8a6a58},baboon:{n:'Baboon',fur:'#7d7461',face:0xff8080},original:{n:'Original',fur:'#ffffff',face:0xffffff}};
  const styleOf=id=>K.STY[id]||K.STY.original;
  const _paint=paint;
  paint=function(ms,hex){_paint(ms,hex);const f=styleOf(ms.monkeStyle).face;ms.forEach(m=>{if(m.name=='gorillatexture'&&m.map!==LAVA)m.color.setHex(f)})};
  const _setAcc=setAcc;
  setAcc=function(M,list){const r=_setAcc(M,list);if(M&&M.m&&M!==LM){const st=Array.isArray(list)&&typeof list[5]=='string'?list[5]:'original';if(M.m.monkeStyle!==st){M.m.monkeStyle=st;paint(M.m,M.col||'#ffffff')}}return r};
  const _setColor=setColor;
  setColor=function(h){_setColor(h);SETTINGS.color=h;SETTINGS.save()};
  K.setStyle=(id,keepColor)=>{if(!K.STY[id])id='monke';SETTINGS.style=id;SETTINGS.save();mats.monkeStyle=id;const s=$('style');if(s)s.value=id;
    if(keepColor)paint(mats,color);else setColor(styleOf(id).fur)};
  K.onPlayer=()=>{mats.monkeStyle=SETTINGS.style;setColor(SETTINGS.color)};
  HOOK.style=()=>SETTINGS.style;

  // ---------- quadro Gorilla Rush no mundo (ao lado do toco / computador do mapa original) ----------
  const W=1024,H=640,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=4;
  const board=new THREE.Group();
  const face=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.5),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,toneMapped:false}));
  const frame=new THREE.Mesh(new THREE.BoxGeometry(2.56,1.66,.08),new THREE.MeshLambertMaterial({color:0x4a3020}));frame.position.z=-.05;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,2.2,8),new THREE.MeshLambertMaterial({color:0x4a3020}));post.position.set(0,-1.75,-.05);
  board.add(frame,face,post);board.visible=false;S.add(board);
  K.board=board;
  K.placeBoard=(x0,y0,z0,ry)=>{board.position.set(x0,y0,z0);board.rotation.set(0,ry||0,0);board.visible=true};
  let sig='',bt=0;
  function drawBoard(){
    const rows=MODES.scoreLines(),online=!!NET.peer;
    const s=[MODES.cur,NET.code,online,rows.map(r=>r.n+r.st+r.sc).join(','),MUSIC.now()].join('|');if(s===sig)return;sig=s;
    x.fillStyle='#0b1410';x.fillRect(0,0,W,H);x.strokeStyle='#3ddc84';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);
    x.textBaseline='middle';x.textAlign='left';x.fillStyle='#3ddc84';x.font=FONT(70);x.fillText('GORILLA',40,72);x.fillStyle='#ffd54f';x.fillText('RUSH',372,72);
    x.fillStyle='#eafff2';x.font=FONT(24);x.fillText('CRIADO POR WELLIDEV',620,58);x.globalAlpha=.7;x.font=FONT(18);x.fillText('VERSÃO OCULUS GO',620,88);x.globalAlpha=1;
    x.fillStyle='#ffffff18';x.fillRect(30,130,W-60,3);
    x.fillStyle='#3ddc84';x.font=FONT(28);x.fillText('MODO: '+MODES.label().toUpperCase(),40,170);
    x.fillStyle='#eafff2';x.font=FONT(22);x.fillText(online?('SALA '+NET.code+' · '+rows.length+(rows.length>1?' JOGADORES':' JOGADOR')):'OFFLINE',40,206);
    x.font=FONT(24);rows.slice(0,8).forEach((r,k)=>{const y=250+k*38;x.fillStyle=r.st=='PEGADOR'||r.st=='INFECTADO'?'#ff7043':'#eafff2';
      x.fillText((k+1)+'. '+r.n.toUpperCase().slice(0,18),40,y);x.textAlign='right';x.fillText((r.st?r.st.toUpperCase()+'  ':'')+r.sc,520,y);x.textAlign='left'});
    x.fillStyle='#ffd54f';x.font=FONT(26);x.fillText('COMO JOGAR',580,170);x.fillStyle='#eafff2';x.font=FONT(19);
    ['APONTE PARA O CHÃO E PUXE O PULSO','PARA TRÁS: EMPURRA COMO GORILA','AS MÃOS SE REVEZAM SOZINHAS','GATILHO: AGARRAR / ESCALAR','TOUCHPAD: PULAR · BORDAS: GIRAR','SEGURAR TOUCHPAD: MENU'].forEach((t,k)=>x.fillText(t,580,212+k*36));
    x.globalAlpha=.75;x.font=FONT(17);x.fillText('♪ '+MUSIC.now().toUpperCase().slice(0,44),580,450);x.globalAlpha=1;
    x.fillStyle='#ffffff18';x.fillRect(30,H-80,W-60,3);x.fillStyle='#eafff2';x.font=FONT(20);x.textAlign='center';
    x.fillText(NET.mode=='inf'?'INFECÇÃO: QUEM É PEGO VIRA PEGADOR TAMBÉM':NET.mode=='tag'?'TAG: ENCOSTE NO OUTRO MONKE PARA PASSAR O PEGADOR':'EXPLORE, ESCALE E PULE ENTRE AS ÁRVORES',W/2,H-42);
    tex.needsUpdate=true}

  // ---------- mecânicas de tag ----------
  function tagSound(){if(!AC)return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(90,t+.25);
    g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.32)}catch(e){}}
  const _apply=LOCO.applyTune;
  // pegador/infectado: um pouco mais rápido (como nos fan games), para conseguir alcançar os outros
  LOCO.applyTune=()=>{_apply();if(K.isIt){TUNE.max*=1.15;TUNE.imp*=1.1}};
  K.update=dt=>{
    if(state!='play')return;
    const it=!!NET.peer&&NET.mode!='cas'&&isIt(me.id);
    if(it!==K.isIt){K.isIt=it;LOCO.applyTune();
      if(it){K.freezeT=1.1;tagSound();HUD3D.toast(NET.mode=='inf'?'VOCÊ FOI INFECTADO!':'VOCÊ FOI PEGO! AGORA É O PEGADOR',2500);if(LOCO.anchor)LOCO.release()}}
    // tag freeze: quem acabou de ser pego fica parado um instante
    if(K.freezeT>0){K.freezeT-=dt;vel.x=0;vel.z=0;if(vel.y>0)vel.y=0}
    bt-=dt;if(bt<=0){bt=1;if(board.visible)drawBoard()}};
  const _il=HOOK.inputLocked,_np=HOOK.noPush;
  HOOK.inputLocked=()=>_il()||K.freezeT>0;
  HOOK.noPush=i=>K.freezeT>0||(_np?_np(i):false);
  return K})();
