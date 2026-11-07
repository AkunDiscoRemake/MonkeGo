// MONKE GO — mapas. Usa APENAS o mapa que veio na source original (assets/maps/park.bin).
// O mapa original contém várias áreas; o "seletor de mapas" leva o jogador a cada uma delas.
// Áreas sem conteúdo correspondente no mapa original (City, Beach, Clouds, Basement, Bayou) NÃO
// são listadas — não há botões falsos (ver README, "Limitações").
'use strict';
// Carrega o binário do mapa. O original usava DecompressionStream (Chrome 80+), que NÃO existe no
// navegador do Oculus Go (Chromium 7x) — por isso há fallback para o arquivo já descompactado.
async function fetchMapBin(u){
  if(PLATFORM.decompress){try{const r=await fetch(u+'.gz');if(r.ok&&r.body)return await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()}catch(e){console.warn('gz',e)}}
  const r=await fetch(u);if(!r.ok)throw 'HTTP '+r.status;return r.arrayBuffer()}

const MAPS=(function(){
  const M={cur:'forest',loaded:false};
  // Áreas (coordenadas tiradas da geometria do mapa original; ver README)
  M.list=[
    {id:'forest',name:'Floresta',desc:'Toco central, árvores e casa na árvore (spawn original)',orig:true},
    {id:'canyons',name:'Cânions',desc:'Paredões, cactos e almofadas gigantes',at:[3,-47],r:9,top:30},
    {id:'caves',name:'Cavernas',desc:'Cristais e carrinhos de mina no subsolo',at:[10,17],r:6,top:-6,cave:true},
    {id:'mountains',name:'Montanhas',desc:'Penhasco rochoso com rota de escalada (spawn de novato original)',spawn:[59.32,17.21,-23.61]},
  ];
  const byId=id=>M.list.find(a=>a.id===id)||M.list[0];
  M.byId=byId;
  const _o=new THREE.Vector3(),_u=new THREE.Vector3(0,1,0);
  // procura um ponto de spawn livre perto do centro da área (chão razoavelmente plano + espaço para a cabeça)
  function findSpot(a){
    if(a.spawn)return V3(a.spawn[0],a.spawn[1],a.spawn[2]);
    for(let i=0;i<80;i++){const r=i?a.r*Math.sqrt(Math.random()):0,t=Math.random()*6.283,x=a.at[0]+Math.cos(t)*r,z=a.at[1]+Math.sin(t)*r;
      const h=hit(_o.set(x,a.top,z),DOWN,60);if(!h||h.n.y<.7)continue;
      if(hit(_o.set(x,h.point.y+.1,z),_u,1.6))continue;
      return V3(x,h.point.y+1.12,z)}
    return null}
  M.spawn=()=>{const a=byId(M.cur);if(a.orig)return M.chosen?V3(3.60,6.30,-6.49):null;/* null = lógica original (toco / novato) */
    if(!a._sp)a._sp=findSpot(a);return a._sp?a._sp.clone():null};
  M.go=id=>{const a=byId(id);M.cur=a.id;M.chosen=true;SETTINGS.map=a.id;SETTINGS.save();
    if(state=='play'&&mapDone){P.copy(spawnPos());vel.set(0,0,0);LOCO.reset();MODES.onArea&&MODES.onArea()}
    toast('Área: '+a.name,2000)};
  M.load=async()=>{M.cur=byId(SETTINGS.map).id;await loadParkMap();M.loaded=true;
    // limites verticais (para o Lava Run)
    const b=new THREE.Box3();mapMeshes.forEach(m=>{m.geometry.computeBoundingBox();b.union(m.geometry.boundingBox)});M.minY=b.min.y;M.maxY=b.max.y};
  // multiplayer: cada jogador nasce num ponto diferente ao redor do spawn (senão o pegador/infectado
  // encosta em todos no mesmo instante)
  function spread(s){for(let k=0;k<30;k++){const a=Math.random()*6.283,r=1.3+Math.random()*2.4,x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r;
      const h=hit(_o.set(x,s.y+1.2,z),DOWN,4.5);if(!h||h.n.y<.7||Math.abs(h.point.y-(s.y-1.12))>1.6)continue;if(hit(_o.set(x,h.point.y+.1,z),_u,1.6))continue;return V3(x,h.point.y+1.12,z)}return s}
  HOOK.spawn=()=>{let s=M.spawn();if(!NET.peer)return s;if(!s)s=isNewbie?V3(59.32,17.21,-23.61):V3(3.60,6.30,-6.49);return spread(s)};
  HOOK.mapId=()=>'park';
  return M})();
