# BRZ Cup Central

Crie uma plataforma web completa, responsiva e mobile-first para a BRZ.CUP, uma organização de campeonatos de Free Fire com torneios diários, rankings, perfis de jogadores, inscrições e premiações.

O objetivo é que o site seja mais do que uma landing page: ele deve funcionar como a plataforma oficial da BRZ, onde o jogador encontra campeonatos, se inscreve, acompanha pagamento e vaga, consulta resultados, ranking e seu histórico.

1. IDENTIDADE VISUAL

Utilize a identidade visual BRZ:

Fundo principal: #0B0B0B

Fundo secundário/cards: #1A1A1A

Cinza: #2E2E2E

Branco: #F1F1F1

Vermelho BRZ: #FF0A1A

Vermelho escuro: #8B0000

Dourado: #FFC107 para campeões, troféus e premiações

Verde: #00C853 para pagamentos confirmados e vagas garantidas

Estética:

competitiva;

gamer;

urbana;

dark;

graffiti/grunge;

moderna;

premium;

agressiva sem prejudicar a usabilidade.

Utilize texturas discretas, pinceladas vermelhas, coroas e elementos da identidade BRZ como detalhes visuais.

Não deixe a interface parecendo um template genérico de site gamer.

Priorize legibilidade e experiência mobile.

Slogan:

DO LOBBY PRA HISTÓRIA.

Marca:

BRZ.CUP

Não utilizar “Battle Royale Zone”. BRZ deve aparecer simplesmente como BRZ.



2. HOME

Criar uma home impactante.

Hero principal:

BRZ.CUP

DO LOBBY PRA HISTÓRIA.

Texto:

“Jogue. Faça kills. Suba no ranking. Ganhe.”

CTAs:

JOGAR AGORA
VER RANKING

Logo abaixo, mostrar os principais diferenciais:

💀 R$2 por kill

👑 R$40 para o campeão

🎟️ 2º lugar ganha vaga no próximo Daily

🏆 Rankings semanais e mensais

Adicionar uma seção:

PRÓXIMOS DAILYS

Cards para:

20:00
21:00
22:00

Cada card deve mostrar:

horário;

modalidade;

quantidade máxima de jogadores;

vagas disponíveis;

valor da inscrição;

status;

botão de inscrição.

Status possíveis:

🟢 INSCRIÇÕES ABERTAS

🟡 ÚLTIMAS VAGAS

🔴 LOTADO

⚫ ENCERRADO

Quando estiver lotado, substituir “Inscrever-se” por:

ENTRAR NA LISTA DE ESPERA

Importante:

Os horários devem vir do backend e não ficar hardcoded, porque futuramente novos horários e campeonatos poderão ser criados pelo painel administrativo.



3. FLUXO DE INSCRIÇÃO

Criar uma experiência extremamente simples.

Fluxo:

CAMPEONATO
↓
HORÁRIO
↓
DADOS DO JOGADOR
↓
PIX
↓
CONFIRMAÇÃO
↓
VAGA GARANTIDA
↓
GRUPO DO WHATSAPP

Dados solicitados:

Nick no Free Fire

ID do Free Fire

WhatsApp

Se o jogador já possuir uma conta BRZ, preencher automaticamente seus dados.

Depois:

GERAR PIX

Mostrar:

QR Code;

Pix copia e cola;

valor;

tempo/status do pagamento.

Status:

AGUARDANDO PAGAMENTO

PAGAMENTO CONFIRMADO

VAGA GARANTIDA

Não marcar uma vaga como confirmada apenas porque o jogador iniciou a inscrição.

A vaga definitiva só deve ser considerada garantida depois da confirmação do pagamento pelo backend.

Após confirmação:

“🔥 VOCÊ ESTÁ DENTRO!”

Mostrar:

BRZ DAILY
Horário
Nick
Número da vaga

Botão:

ENTRAR NO GRUPO DO WHATSAPP

A confirmação de pagamento Pix e automações relacionadas já estão sendo desenvolvidas externamente no backend/Codex.

Não criar uma implementação paralela fictícia.

Criar a interface e uma camada de integração/API preparada para receber o status real do backend.



4. PERFIL BRZ DO JOGADOR

Todo jogador deve possuir um perfil BRZ.

Exemplo:

BRIZOLA

BRZ#0182

Mostrar:

🎮 Partidas jogadas

💀 Kills totais

📊 Média de kills por partida

👑 Booyahs

🥈 Top 2

⭐ MVPs

💰 Total ganho em premiações

🏆 Posição no Ranking de Kills

👑 Posição no Ranking de Booyahs

Mostrar separadamente:

TEMPORADA ATUAL

ALL-TIME

O BRZ ID deve ser permanente.

Se o jogador alterar seu nick no Free Fire, seu BRZ ID continua igual.



5. CONQUISTAS

Criar sistema visual de badges.

Exemplos:

🩸 FIRST BLOOD
Primeira kill na BRZ.

👑 BOOYAH
Primeira vitória.

💀 CARRASCO
10 kills em uma partida.

🔥 ON FIRE
5 partidas consecutivas com pelo menos uma kill.

🎯 CAÇADOR
50 kills.

☠️ EXTERMINADOR
100 kills.

🏆 TRICAMPEÃO
3 Booyahs.

⭐ MVP
Maior número de kills em um Daily.

Mostrar até 3 conquistas principais no topo do perfil e uma área:

VER TODAS AS CONQUISTAS

Preparar o sistema para adicionar novas conquistas futuramente.



6. RANKINGS

Criar página:

RANKINGS BRZ

Não utilizar sistema de pontos.

Existem dois rankings independentes.

💀 KILL RANKING

Ordenado pelo total de kills.

Mostrar:

posição;
nick;
BRZ ID;
kills;
Booyahs;
partidas.

👑 BOOYAH RANKING

Ordenado pelo número de Booyahs.

Mostrar:

posição;
nick;
BRZ ID;
Booyahs;
kills;
partidas.

Permitir alternar:

SEMANA

MÊS

TEMPORADA

ALL-TIME

Destacar visualmente TOP 3.



7. PREMIAÇÃO DO RANKING

Criar uma seção especial:

QUANTO MAIS VOCÊ JOGA, MAIS VALE SUA HISTÓRIA.

Ranking semanal:

⭐ MVP DA SEMANA
Jogador com mais kills na semana
R$50

👑 REI DO BOOYAH DA SEMANA
Jogador com mais Booyahs na semana
R$50

Ranking mensal:

⭐ MVP DO MÊS
Jogador com mais kills no mês
R$100

👑 REI DO BOOYAH DO MÊS
Jogador com mais Booyahs no mês
R$100

Criar cards especiais para esses quatro líderes.

Os valores devem ser configuráveis pelo painel administrativo, e não hardcoded na lógica.



8. RESULTADOS

Criar página:

RESULTADOS

Mostrar histórico de Dailys.

Exemplo:

BRZ DAILY #001
20:00

👑 Campeão: PLAYER

⭐ MVP: PLAYER — 8 kills

🥈 2º lugar: PLAYER

Permitir abrir o resultado completo.

Mostrar tabela:

posição;
jogador;
kills;
premiação.

Os resultados devem alimentar automaticamente os rankings e perfis quando recebidos do backend.



9. MEUS CAMPEONATOS

Dentro da conta do jogador criar:

MEUS CAMPEONATOS

Separar:

PRÓXIMOS

FINALIZADOS

Em cada inscrição mostrar:

BRZ Daily;
data;
horário;
status do pagamento;
status da vaga.

Antes da partida:

“AGUARDANDO SALA”

Quando a sala for liberada pelo backend:

“SALA LIBERADA”

Mostrar ID e senha apenas quando autorizado pelo sistema.



10. LOGIN

Criar sistema simples de autenticação.

Permitir:

WhatsApp/telefone

e/ou

e-mail.

Não tornar obrigatório criar uma conta longa antes da primeira inscrição.

O cadastro deve ser rápido.

Após a primeira participação, criar automaticamente o perfil BRZ do jogador.



11. PAINEL ADMINISTRATIVO

Criar área protegida:

BRZ ADMIN

Dashboard:

inscrições hoje;

receita em inscrições;

jogadores novos;

jogadores recorrentes;

Dailys ativos;

vagas ocupadas;

pagamentos aguardando;

pagamentos confirmados.

CAMPEONATOS

Permitir criar campeonato.

Campos:

nome;
data;
horário;
modalidade;
limite de jogadores;
valor da inscrição;
valor por kill;
premiação do campeão;
premiação do segundo colocado;
status.

PARTICIPANTES

Mostrar:

nick;
BRZ ID;
WhatsApp;
Free Fire ID;
pagamento;
horário;
vaga.

Filtros:

pago;
aguardando;
20h;
21h;
22h.

SALA

Campo:

ID DA SALA

SENHA

Botão:

LIBERAR SALA

Somente após liberar, os participantes daquele campeonato podem visualizar essas informações.

RESULTADOS

Permitir registrar/importar:

posição;
nick;
kills.

Preparar endpoint/API para receber resultados processados pela automação externa.

Ao confirmar resultado:

atualizar perfil;

atualizar kills;

atualizar Booyahs;

atualizar partidas;

atualizar premiação;

recalcular rankings;

verificar conquistas.



12. LISTA DE ESPERA

Quando um campeonato chegar ao limite de jogadores:

Status:

🔴 LOTADO

Botão:

ENTRAR NA LISTA DE ESPERA

Registrar:

jogador;
WhatsApp;
campeonato;
horário;
posição na fila.

Preparar estrutura para futuramente notificar automaticamente quando surgir uma vaga.



13. WHATSAPP

O WhatsApp faz parte da operação da BRZ.

Preparar o frontend/backend para integração com a automação externa existente.

Eventos importantes:

registration.created

payment.pending

payment.confirmed

player.confirmed

tournament.full

room.released

result.processed

ranking.updated

achievement.unlocked

Não implementar um bot falso dentro do Lovable.

Criar serviços/interfaces para que esses eventos possam chamar ou receber dados do backend desenvolvido externamente.



14. PIX

A confirmação automática de Pix será feita pelo sistema/backend externo desenvolvido separadamente.

Preparar endpoints/interfaces como:

POST /registrations

POST /payments/create

GET /payments/:id/status

POST /webhooks/payment-confirmed

GET /tournaments

GET /tournaments/:id

GET /rankings

GET /players/:id

GET /players/:id/history

POST /results

Os nomes são uma sugestão e podem ser adaptados à arquitetura existente.

Não duplicar regras de negócio que já existam no backend.

O frontend deve consumir a API real quando ela estiver disponível.



15. BANCO DE DADOS

Estruturar pensando nas entidades:

players

tournaments

registrations

payments

matches

results

player_stats

rankings

achievements

player_achievements

waitlist

prizes

rooms

Criar relacionamentos adequados e IDs únicos.

Separar claramente dados derivados de dados originais para evitar inconsistências nos rankings.



16. ANALYTICS

Preparar tracking de aquisição.

Registrar source/UTM da primeira inscrição:

instagram_brz

instagram_68k

tiktok

meta_ads

influencer

referral

organic

Criar no ADMIN:

AQUISIÇÃO

Mostrar por origem:

visitantes;
inscrições iniciadas;
pagamentos;
jogadores;
taxa de conversão;
jogadores recorrentes.

Isso será importante para calcular CAC futuramente.



17. EXPERIÊNCIA MOBILE

A maioria dos jogadores provavelmente acessará pelo celular.

Todo o sistema deve ser pensado mobile-first.

Principal navegação mobile:

🏠 Início

🎮 Jogar

🏆 Ranking

👤 Perfil

No desktop utilizar menu superior/lateral adequado.

O botão JOGAR deve sempre ter destaque vermelho.



18. ESTADOS DA INTERFACE

Não criar apenas telas perfeitas com dados fictícios.

Desenvolver estados reais:

loading;
vazio;
erro;
pagamento pendente;
pagamento aprovado;
campeonato lotado;
lista de espera;
sem campeonatos;
sem resultados;
ranking ainda não iniciado;
API indisponível.

Adicionar skeleton loaders.

Exibir mensagens de erro claras.



19. ARQUITETURA

Desenvolva componentes reutilizáveis.

Não misture regras de negócio críticas diretamente nos componentes visuais.

Separar:

UI

services/API

authentication

state

business logic

types/models

Criar variáveis de ambiente para URLs, chaves e configurações.

Nunca colocar chaves secretas no frontend.

Preparar a aplicação para conectar posteriormente ao backend/API criado através do Codex.

Antes de criar uma nova regra relacionada a pagamento, WhatsApp, processamento de resultados ou inscrição, considerar que essa funcionalidade poderá já existir no backend externo.



20. ESCALABILIDADE

Embora inicialmente a BRZ opere Dailys Solo, a arquitetura deve permitir futuramente:

Solo

Duo

Squad

BRZ Daily

BRZ Cup

BRZ League

temporadas

outros organizadores

Não desenvolver marketplace ou plataforma para outros organizadores agora.

Apenas evitar uma arquitetura que impeça essa evolução.



21. PRIORIDADE DE DESENVOLVIMENTO

Não tente construir tudo de uma vez.

FASE 1 — MVP

identidade visual;

Home;

campeonatos disponíveis;

fluxo de inscrição;

Pix/interface de status;

confirmação de vaga;

conta/perfil;

ranking;

painel administrativo básico.

FASE 2

resultados;

histórico;

conquistas;

ranking semanal/mensal;

lista de espera;

analytics.

FASE 3

cards compartilháveis;

temporadas;

melhorias sociais;

recursos avançados.

Comece implementando somente a FASE 1.

Antes de implementar integrações reais de Pix, WhatsApp ou resultados, crie contratos/interfaces claros para conectar ao backend que já está sendo desenvolvido.

Não substitua nem reescreva automaticamente o backend existente.

O objetivo é transformar a BRZ.CUP em uma experiência extremamente simples:

ENTRAR → PAGAR → JOGAR → COMPETIR → SUBIR NO RANKING → VOLTAR AMANHÃ.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1787e0c4-37bd-440c-ad71-8e7144c231ac).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
