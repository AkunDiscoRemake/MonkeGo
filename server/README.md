# Servidor próprio do Gorilla Rush (sinalização PeerJS)

O multiplayer é P2P (WebRTC). Este servidor só apresenta os jogadores uns aos outros (sinalização);
depois disso o tráfego do jogo vai direto entre eles. Ele substitui o servidor público `0.peerjs.com`.

## Publicar no Render (gratuito)

1. Crie uma conta em https://render.com e conecte o GitHub.
2. **New → Blueprint** → escolha este repositório (o arquivo `render.yaml` está em `server/`;
   se o Render não o encontrar, use **New → Web Service** com *Root Directory* `server`,
   *Build* `npm install`, *Start* `npm start`).
3. Quando o serviço ficar *Live*, copie o endereço, por exemplo `gorilla-rush-server.onrender.com`.
4. Em `js/netconfig.js`, troque `server:null` por:

   ```js
   server:{host:'gorilla-rush-server.onrender.com',port:443,secure:true,path:'/grvr',key:'peerjs'},
   ```

5. Faça commit e push: o GitHub Pages publica de novo e todos passam a usar o seu servidor.

Para testar antes de editar: `https://SEU-SITE/?peerhost=gorilla-rush-server.onrender.com`.

> No plano gratuito do Render o serviço "dorme" após ~15 min sem uso; a primeira conexão depois disso
> demora uns 30–60 s para acordá-lo. Railway, Fly.io ou uma VPS evitam isso.

## Rodar localmente

```bash
cd server && npm install && npm start      # escuta em http://localhost:9000/grvr
```

Abra o jogo com `?peerhost=localhost&peerport=9000&peersecure=0`.
