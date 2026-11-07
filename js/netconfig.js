// Gorilla Rush (Oculus Go) — configuração de rede PRÓPRIA (separada dos servidores do Gorilla Rush original).
//
// • prefix: namespace das salas. 'grvr-' = salas exclusivas desta versão (o original usa 'grush-').
// • server: servidor de sinalização PeerJS. null = servidor público do PeerJS (0.peerjs.com).
//   Depois de publicar o servidor próprio da pasta server/ (veja server/README.md), preencha, por exemplo:
//     server:{host:'gorilla-rush-server.onrender.com',port:443,secure:true,path:'/grvr',key:'peerjs'}
// • ice: servidores STUN/TURN. Se tiver um TURN próprio, adicione aqui ({urls,username,credential}).
//
// Para testar outro servidor sem editar este arquivo:  index.html?peerhost=HOST&peerport=PORTA&peerpath=/grvr&peersecure=1
'use strict';
const NETCFG={
  prefix:'grvr-',
  server:null,
  ice:[{urls:'stun:stun.l.google.com:19302'},{urls:['turn:eu-0.turn.peerjs.com:3478','turn:us-0.turn.peerjs.com:3478'],username:'peerjs',credential:'peerjsp'}],
};
(function(){try{const q=new URLSearchParams(location.search),h=q.get('peerhost');
  if(h)NETCFG.server={host:h,port:+(q.get('peerport')||443),secure:q.get('peersecure')!=='0',path:q.get('peerpath')||'/grvr',key:q.get('peerkey')||'peerjs'}}catch(e){}})();
