// MONKE GO — modos de jogo.
//  • SoloPlay: offline, sem bots, explorar/escalar livremente (enter('solo') no núcleo).
//  • Lava Run: offline; lava (textura de lava ORIGINAL do jogo) sobe progressivamente; pontos = tempo vivo.
//  • Tag / Infecção / Casual: multiplayer ORIGINAL (PeerJS) preservado; aqui só placar e troca de modo.
'use strict';
const MODES=(function(){
  const Mo={cur:'solo'};
  // ---------- troca de modo ----------
  function leaveNet(){const p=NET.peer;NET.hc=null;NET.conns={};NET.peer=null;try{p&&p.destroy()}catch(e){}
    for(const k in RM)delete RM[k];itId=null;INF={};SCORE={}}
  Mo.leaveNet=leaveNet;
  Mo.start=(m,code)=>{if(state=='play')leaveNet();
    if(m=='solo'||m=='lava')return enter(m);
    if(m=='tag')return enter('quick');
    pickCode=(code||'MONKEGO').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'MONKEGO';return enter('join',m)};
  HOOK.enter=(mode,vr)=>{Mo.cur=mode=='quick'?'tag':mode=='join'?(vr=='inf'?'inf':'cas'):mode;SETTINGS.mode=Mo.cur;SETTINGS.save()};
  HOOK.roomClosed=()=>{leaveNet();Mo.start('solo')};
  HOOK.startGame=()=>{lava.reset();HUD3D.set('mode','');if(Mo.cur=='lava')lava.begin()};
  Mo.onArea=()=>{if(Mo.cur=='lava')lava.begin()};
  Mo.label=m=>({solo:'SoloPlay',lava:'Lava Run',tag:'Tag (público)',inf:'Infecção',cas:'Casual'})[m||Mo.cur]||m;
  // ---------- Lava Run ----------
  const lmat=new THREE.MeshBasicMaterial({map:LAVA,color:0xffffff,fog:false});
  const lmesh=new THREE.Mesh(new THREE.PlaneGeometry(420,420,1,1).rotateX(-Math.PI/2),lmat);lmesh.visible=false;lmesh.frustumCulled=false;lmesh.renderOrder=2;S.add(lmesh);
  const lava={on:false,y:-99,t0:0,dead:0,best:0,won:0,tick:0,
    reset(){this.on=false;lmesh.visible=false;this.dead=0;this.won=0;FOG.color.setHex(0xbde0ff);snd.stop()},
    begin(){this.reset();this.on=true;P.copy(spawnPos());vel.set(0,0,0);this.y=P.y-1.1-4.5;this.t0=performance.now()+4000;this.tick=0;
      this.top=(MAPS.maxY||30)-1.5;try{this.best=+localStorage.getItem('monke_lava_'+MAPS.cur)||0}catch(e){this.best=0}
      LAVA.repeat.set(60,60);lmesh.visible=true;snd.start();toast('LAVA RUN: suba o mais alto que puder!',3000)},
    update(dt,now){if(!this.on)return;
      const t=(now-this.t0)/1000;
      if(this.dead){if(now>this.dead){this.begin()}return}
      if(t>0&&!this.won){const sp=Math.min(.55,.12+t*.0035);this.y=Math.min(this.top,this.y+sp*dt)}
      lmesh.position.y=this.y;LAVA.offset.x=(now*.00002)%1;LAVA.offset.y=(now*.000013)%1;
      const feet=P.y-1.1,dist=feet-this.y;
      // efeito visual: névoa alaranjada quando perto
      const k=Math.max(0,Math.min(1,1-dist/6));FOG.color.setRGB(.74+.26*k,.88-.45*k,1-.8*k);snd.level(k);
      const sec=Math.max(0,t);
      if(this.y>=this.top&&!this.won){this.won=now+12000}
      if(this.won&&now>this.won){this.finish(sec,true);return}
      if(t>0&&Math.floor(sec/10)>this.tick){this.tick=Math.floor(sec/10);snd.beep(660)}
      HUD3D.set('mode',t<0?'A LAVA SOBE EM '+Math.ceil(-t):'LAVA RUN  '+sec.toFixed(1)+'s<small>RECORDE '+this.best.toFixed(1)+'s · LAVA A '+Math.max(0,dist).toFixed(1)+' m</small>');
      if(dist<0&&t>0)this.finish(sec,false)},
    finish(sec,win){const rec=sec>this.best;if(rec){this.best=sec;try{localStorage.setItem('monke_lava_'+MAPS.cur,String(sec))}catch(e){}}
      this.dead=performance.now()+4000;vel.set(0,0,0);snd.sizzle(win);
      HUD3D.set('mode',(win?'VOCÊ SOBREVIVEU!':'QUEIMOU!')+'  '+sec.toFixed(1)+'s<small>'+(rec?'NOVO RECORDE!':'RECORDE '+this.best.toFixed(1)+'s')+' · REINICIANDO…</small>')}};
  Mo.lava=lava;
  // ---------- sons sintetizados (WebAudio; sem arquivos extras) ----------
  const snd={g:null,src:null,
    start(){if(!AC||this.src)return;try{const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}
      const s=AC.createBufferSource();s.buffer=b;s.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=320;const g=AC.createGain();g.gain.value=.05;s.connect(f);f.connect(g);g.connect(AC.destination);s.start();this.src=s;this.g=g}catch(e){}},
    stop(){try{this.src&&this.src.stop()}catch(e){}this.src=null;this.g=null},
    level(k){if(this.g)this.g.gain.value=.05+.5*k*k},
    beep(f){if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.setValueAtTime(.15,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.25);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.3)}catch(e){}},
    sizzle(win){if(!AC)return;if(win){this.beep(523);setTimeout(()=>this.beep(784),180);return}
      try{const n=AC.sampleRate*1.2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
      const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=2800;const g=AC.createGain();g.gain.value=.5;s.connect(f);f.connect(g);g.connect(AC.destination);s.start()}catch(e){}}};
  // ---------- placar (Tag/Infecção) ----------
  Mo.scoreLines=()=>{const rows=[{id:me.id,n:me.nick+' (você)'}];for(const k in RM)rows.push({id:k,n:RM[k].n||'?'});
    return rows.map(r=>{const st=NET.mode=='inf'?(INF[r.id]?'INFECTADO':'livre'):(itId===r.id?'PEGADOR':'');return {n:r.n,st,sc:SCORE[r.id]||0}}).sort((a,b)=>b.sc-a.sc)};
  Mo.update=(dt,now)=>{lava.update(dt,now)};
  return Mo})();
