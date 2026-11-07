// Servidor de sinalização PeerJS PRÓPRIO do Gorilla Rush (versão Oculus Go).
// Só troca as mensagens de conexão (oferta/resposta WebRTC); o jogo em si continua P2P entre os jogadores.
const { PeerServer } = require('peer');
const port = +(process.env.PORT || 9000);
const path = process.env.PEER_PATH || '/grvr';
const key = process.env.PEER_KEY || 'peerjs';
PeerServer({
  port, path, key,
  host: process.env.HOST || '0.0.0.0', // IPv4 (alguns hosts/containers não têm IPv6)
  proxied: true,            // atrás do proxy HTTPS do Render/Railway/Fly
  allow_discovery: false,   // não lista os IDs conectados
  alive_timeout: 60000,
  corsOptions: { origin: true },
}, () => console.log(`Gorilla Rush PeerServer em :${port}${path} (key=${key})`));
