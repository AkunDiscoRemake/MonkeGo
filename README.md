# MONKE GO

Port do **Gorilla Rush** (jogo original para Google Cardboard, em `original/`) para o **Oculus Go**,
em HTML + CSS + JavaScript puro, pronto para GitHub Pages.

> O jogo original foi preservado: mesmo modelo de macaco (sem pernas), mesmo mapa, mesma física de
> colisão, mesmos acessórios, sons, multiplayer PeerJS (Tag / Casual / Infecção) e o modo Cardboard com
> rastreamento de mãos pela câmera. O port acrescenta o caminho do Oculus Go por cima disso.

## Como jogar

- **Oculus Go**: abra o endereço do GitHub Pages no Oculus Browser → **ENTRAR EM VR (OCULUS GO)**.
  Você entra no SoloPlay com o menu VR aberto e escolhe mapa e modo lá dentro.
- **Celular (VR Box / Cardboard)**: escolha um modo no lobby; a tela se divide em 2 vistas (como no original).
  Mostre as mãos para a câmera.
- **Desktop**: WASD / setas, arraste para olhar, Espaço pula, `Esc`/`M` abre o menu.

### Controle do Oculus Go (sistema de entrada centralizado: `js/input.js`)

| Entrada | No jogo | No menu |
|---|---|---|
| Girar o pulso com a mão no chão/parede | **Gorilla Locomotion**: empurrar para trás = ir para frente; empurrar para baixo rápido = pular | – |
| Gatilho | **Agarrar**: a mão fica presa na superfície e o corpo se move ao redor dela (escalar, puxar-se, arremessar-se ao soltar) | Selecionar o item apontado pelo laser |
| Clique no touchpad (centro) | Pular / impulso | Confirmar |
| Clique nas bordas esquerda/direita do touchpad | Giro em snap (30° ou 45°, configurável) | Diminuir / aumentar valor |
| Tocar (sem clicar) no touchpad | Assistência de movimento suave (opcional, regulável; 0% desliga) | Swipe ↑/↓ navega |
| Segurar o touchpad 0,6 s | Abre/fecha o menu | Fecha o menu |
| Botão Voltar | Fora do modo VR: abre o menu (interceptado via `history`). Dentro do VR o sistema do Go usa o botão para sair da apresentação; o jogo pausa e mostra **VOLTAR AO VR**. | |

Sem controle (Cardboard) o menu funciona por **olhar**: olhe para cima 1,5 s para abrir; mire um item e
espere 1,5 s (ou toque na tela). O toque continua sendo o pulo, como no original.

### Gorilla Locomotion com um único controle 3DoF (`js/locomotion.js`)

- **Mão real**: modelo de braço — ombro fixo no corpo + direção do controle. A *sensibilidade* amplifica o
  ângulo do pulso, então movimentos pequenos de pulso viram braçadas grandes.
- **Mão simulada**: espelha a mão real com atraso (modo *Alternada*, imita a corrida de gorila),
  sem atraso (*Espelhada*) ou desligada.
- **Cabeça**: define a direção do corpo.
- **Física**: o impulso original multiplicado por *Força do impulso* (padrão **2,2×**), limitado pela
  *Velocidade máxima*; colisão contínua vertical para impulsos fortes não atravessarem o chão.
- **Velocidade do movimento**: *Rápido* (padrão, valores atuais), *Médio* (70 %) ou *Lento* (45 %) —
  escala impulso, velocidade máxima, pulo, arremesso, assistência e teclado/gamepad de uma vez.
- Ajustáveis (lobby → AJUSTES, ou menu VR → Configurações): velocidade do movimento, força do impulso, velocidade máxima,
  gravidade, atrito, sensibilidade, assistência, comprimento dos braços, qualidade gráfica, mão do
  controle, giro, nomes. Valores ficam salvos no navegador.

## Modos

- **SoloPlay** – sozinho, sem bots, explorar e escalar.
- **Lava Run** – a lava (textura original do jogo) sobe cada vez mais rápido; pontos = segundos vivo;
  recorde salvo por área; névoa alaranjada e ronco grave quando ela chega perto, bip a cada 10 s,
  chiado ao morrer, reinício automático.
- **Tag multiplayer** – o multiplayer **original** (PeerJS, P2P): entrada rápida em sala pública (Tag),
  ou sala por código (Casual / Infecção). Sincronização, tag, infecção, nomes sobre os jogadores e
  **placar** (menu VR → Placar: quem está com o pegador/infectado e quantos tags cada um fez).
  Como o multiplayer já existia, **não foi usado Supabase** (não há SQL a configurar).
  Usa os **servidores originais** do Gorilla Rush (ver abaixo) e o mesmo prefixo de sala `grush-`:
  jogadores do MONKE GO e do Gorilla Rush original entram nas mesmas salas.

### O que foi corrigido para o multiplayer funcionar de verdade

- **Servidores originais**: sinalização no servidor público PeerJS (`0.peerjs.com`) e ICE padrão do
  PeerJS 1.5.4 (STUN `stun.l.google.com:19302` + TURN `eu-0`/`us-0.turn.peerjs.com:3478`), exatamente
  como no código-fonte. O navegador carrega o **PeerJS 1.5.4** (mesma versão do original); só no Oculus
  Go, cujo Chromium 77 não executa o 1.5.4, carrega o 1.3.2 configurado com esses mesmos servidores.
  Compatibilidade testada nos dois sentidos (host/cliente): original ↔ MONKE GO 1.5.4 ↔ MONKE GO 1.3.2 (Go).
- **Timeouts**: entrar numa sala esperava só 2,5 s; pela internet a conexão demora mais e cada jogador
  acabava criando a própria sala. Agora 8–10 s (salas inexistentes continuam sendo descartadas na hora).
- **Spawn espalhado** no online: antes todos nasciam no mesmo ponto e a Infecção acabava na hora.
- **Migração de host**: se o host sai (ou some — heartbeat de 5 s), os outros reconectam à mesma sala e
  o primeiro vira o novo host, sem voltar ao solo.
- **Reconexão** ao servidor PeerJS quando o websocket ocioso cai; conexões mortas são removidas.
- **Salas públicas se unem**: quem ficou sozinho em `pub2..6` por 20 s volta a procurar a partir da `pub1`.
- HUD mostra sala, nº de jogadores e se você é o pegador; aviso claro quando está offline.

Testado com 3 navegadores reais conectando pelo servidor PeerJS público (sala por código, infecção,
saída do host com migração) e entrada rápida com 2 jogadores.

## Música

Música chill de fundo, **CC0 (domínio público)**, do OpenGameArt, tocando em sequência:

| Faixa | Autor | Fonte |
|---|---|---|
| Chill Lofi Inspired | omfgdude | https://opengameart.org/content/chill-lofi-inspired |
| Lofi Hip Hop | omfgdude | https://opengameart.org/content/lofi-hip-hop |
| Napping On A Cloud | congusbongus | https://opengameart.org/content/napping-on-a-cloud |

Reconvertidas para MP3 80 kbps (`assets/music/`), tocadas por streaming (só a faixa atual é baixada).
Volume em AJUSTES/menu VR (0 = desligada); *Próxima música* no lobby e no menu VR (item Música:
◀ ▶ volume, clique troca a faixa). A música abaixa quando a lava chega perto no Lava Run.

## Mapas

Somente o mapa que veio na source (`assets/maps/park.bin`). O seletor de mapas leva às áreas que
existem nele (coordenadas extraídas da geometria do próprio mapa):

| Área | Onde fica no mapa original |
|---|---|
| Floresta | toco central, árvores, casa na árvore (spawn original) |
| Cânions | paredões `canyon*`, cactos e almofadas gigantes (z ≈ −50) |
| Cavernas | subsolo com cristais, caixas e carrinhos de mina (y ≈ −14) |
| Montanhas | penhasco rochoso alto com setas de escalada (spawn de novato original) |

City, Beach, Clouds, Basement e Bayou **não existem** na source; conforme pedido, nenhum mapa novo foi
criado e não há botões sem função para eles.

## Compatibilidade com o Oculus Go (o que foi verificado, não presumido)

O navegador do Go (Oculus Browser, Chromium 7x) **não** tem várias APIs que o original usava:

| Problema no original | Solução |
|---|---|
| `DecompressionStream` (Chrome 80+) para abrir o mapa | mapa servido também descompactado (`park.bin`); `.gz` só quando a API existe |
| PeerJS 1.5.4 usa `?.` (erro de sintaxe no Chromium 77) | 1.5.4 onde roda; 1.3.2 (ES5) só no Go, com os mesmos servidores — interopera com o original |
| CSS `inset`, `min()` e `gap` em flexbox | propriedades equivalentes |
| WebXR pode não existir no Go | detecção real: **WebXR** (`isSessionSupported`) → **WebVR 1.1** (`getVRDisplays`) → Cardboard → tela |
| three.js r128 não tem mais WebVR | renderizador WebVR 1.1 próprio em `js/vr.js`: `requestPresent`, `VRFrameData`, projeção/visão por olho, `submitFrame`, pose reamostrada logo antes de desenhar (menor latência) |
| ~4,4 MB em base64 num único HTML | assets separados (`assets/`), MediaPipe só baixado no modo câmera |

Testado em Chromium headless com o UA do Oculus Go e um VRDisplay/controle Go simulados
(apresentação estéreo, laser do menu, gatilho, snap turn, menu por toque longo, locomoção por pulso,
escalada) e no modo celular/Cardboard. **Não foi testado em um Oculus Go físico.**

## Otimização (Snapdragon 821 / Adreno 530)

- Qualidade *Auto* = Baixa no Go: sem sombras, névoa curta, far plane 100 m, olho 1024 px (0,8× de 1280).
- WebXR: `framebufferScaleFactor` pela qualidade e foveação fixa quando o navegador suporta.
- Mapa original já é agrupado por material + células de 32 m (≈15–20 draw calls); frustum culling do three;
  folhagem com alpha-test desligada por distância (LOD por distância).
- Colisão por grade 2D de triângulos (original) + raios curtos; nenhuma alocação nova no laço de render do WebVR.
- Carregamento progressivo: modelo do jogador → mapa → acessórios/sons em paralelo; MediaPipe sob demanda.

## Limitações reais

- **72 Hz**: a página não controla a taxa; o Oculus Browser decide (60 ou 72 Hz). Metas de custo foram
  feitas para 72 Hz.
- **3DoF**: não existe posição real das mãos; a locomoção é uma aproximação por modelo de braço.
  O deslocamento (drift) do controle é corrigido com o recentrar do sistema ou *Recentralizar giro*.
- **Botão Voltar dentro do VR** é reservado pelo sistema; ele encerra o VR (o jogo pausa e oferece voltar).
- **Texturas comprimidas** (ETC/ASTC/Basis): não usadas — exigiriam reconverter os assets originais e um
  transcoder; as texturas do jogo já são pequenas (JPEG/PNG ≤ 256 px no mapa).
- **Multiplayer** depende dos servidores públicos do PeerJS (os mesmos do original) e de conexões P2P
  (WebRTC); se o TURN do PeerJS estiver fora do ar, redes com NAT muito restritivo podem não conectar.
- **Áudio/música** só iniciam após um toque/clique (política dos navegadores).
- A origem dos modelos do mapa e do macaco é a da source original; a camisa havaiana é CC BY 4.0
  (“Gorilla Tag Hawaiian T-shirt” por That-one-ripper, Sketchfab). Confirme as licenças da source antes
  de distribuir comercialmente.

## Estrutura

```
index.html            lobby + carregamento dos scripts
css/style.css         estilos (do original, compatíveis com Chromium 77)
js/platform.js        detecção do dispositivo/APIs + configurações persistentes
js/core.js            NÚCLEO ORIGINAL (render, colisão, rig, mapa, rede, física) com ganchos HOOK.*
js/vr.js              WebXR / WebVR 1.1 / Cardboard
js/input.js           entrada centralizada (Go via WebVR/WebXR, gamepad, teclado, toque, olhar)
js/locomotion.js      Gorilla Locomotion 3DoF híbrido
js/maps.js            áreas do mapa original
js/modes.js           SoloPlay, Lava Run, placar
js/vrmenu.js          menu VR 3D e HUD 3D
js/music.js           música de fundo (playlist CC0)
js/main.js            boot e lobby
lib/                  three r128, GLTFLoader, SkeletonUtils, PeerJS 1.5.4 e 1.3.2 (sem CDN obrigatório)
assets/               modelo, acessórios, mapa, texturas, sons, fonte (extraídos do original) + music/ (CC0)
original/             o HTML original do Gorilla Rush, intacto
```

## Publicação (GitHub Pages)

Todos os caminhos são relativos e não há etapa de build. O workflow `.github/workflows/pages.yml`
publica a raiz do repositório no GitHub Pages a cada push. Para rodar localmente:
`python3 -m http.server` e abra `http://localhost:8000` (WebXR/WebVR exigem HTTPS fora do localhost).
