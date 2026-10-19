# 🌴 Rotas Jampa

Aplicação web desenvolvida para apresentar alguns dos principais pontos turísticos de João Pessoa, reunindo informações sobre locais culturais, praias, ilhas, natureza e a história da cidade.

O projeto permite navegar por diferentes pontos turísticos, visualizar imagens, descrições e acessar um roteiro interativo com os principais locais apresentados.

---

## 📝 Sobre o projeto

O **Rotas Jampa** foi desenvolvido utilizando HTML, CSS e JavaScript puro, com foco em apresentar João Pessoa de forma visual, organizada e responsiva.

A interface foi inspirada em sites de turismo, utilizando imagens em destaque, seções de roteiro, cards informativos e áreas específicas para cultura, praias e história.

O usuário pode:

- Conhecer os principais pontos turísticos de João Pessoa.
- Visualizar imagens e descrições de cada local.
- Navegar por um roteiro interativo.
- Conhecer pontos culturais da cidade.
- Explorar praias e ilhas da região.
- Ler sobre a história de João Pessoa.
- Utilizar o site em computadores, tablets e celulares.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** — estruturação das páginas e conteúdos.
- **CSS3** — estilização, responsividade, organização dos cards e identidade visual.
- **JavaScript (ES6+)** — interação do menu, manipulação do DOM e atualização dinâmica dos locais apresentados no roteiro.

---

## 🗂️ Estrutura do Projeto

```text
rotas-jampa/
│
├── img/
│   ├── praca-anteno.png
│   ├── jardim-botanico.png
│   ├── farol-cabo-branco.png
│   ├── theatro-santa-roza.png
│   ├── estacao-cabo-branco.png
│   ├── igreja-sao-francisco.png
│   ├── tambau.png
│   ├── cabo-branco.png
│   ├── bessa.png
│   └── areia-vermelha.png
│
├── index.html       # Estrutura principal do site
├── script.js        # Interações e funcionamento do roteiro
├── style.css        # Estilos visuais e responsividade
└── README.md        # Documentação do projeto
```

---

## 🖥️ Instruções de instalação

### 1. Clone o repositório

```bash
git clone https://github.com/CintiaRitse/Rotas-Jampa.git
```

### 2. Acesse a pasta do projeto

```bash
cd rotas-jampa
```

### 3. Abra o projeto

Como o projeto utiliza apenas HTML, CSS e JavaScript, não é necessário instalar dependências.

No Windows:

```bash
start index.html
```

No Linux:

```bash
xdg-open index.html
```

No macOS:

```bash
open index.html
```


---

## 📌 Funcionalidades

- Menu de navegação entre as principais seções do site.
- Seção inicial com imagem em destaque de João Pessoa.
- Roteiro interativo com os principais pontos turísticos.
- Alteração dinâmica da imagem, título e descrição ao selecionar uma parada do roteiro.
- Cards com imagens e informações sobre cada ponto turístico.
- Seção específica para pontos culturais.
- Seção específica para praias e ilhas.
- Seção dedicada à história de João Pessoa.
- Navegação por âncoras entre as seções da página.
- Menu responsivo para dispositivos móveis.
- Layout adaptado para computadores, tablets e celulares.
- Imagens reais dos pontos turísticos apresentadas no projeto.

### 👥 Perfis de usuário

O login é simulado e os dados ficam salvos no `localStorage` do navegador.

- **Turista** (`turista.html`): busca lugares por nome, região ou categoria; filtra por custo, distância, acessibilidade e favoritos; informa a localização (GPS ou clique no mapa) para ver a distância até cada lugar; favorita lugares; avalia com estrelas e comentário; envia fotos da condição atual do local; e consulta os passeios guiados.
- **Guia Turístico** (`guia.html`): cadastra lugares (com custo, acessibilidade e horário) marcando a localização no mapa, e divulga passeios vinculados a pelo menos um ponto turístico. Os lugares ficam pendentes até o administrador validar.
- **Administrador** (`admin.html`): cadastra, edita, valida, despublica e exclui lugares; modera avaliações e fotos; remove passeios; bloqueia ou remove usuários; e restaura os dados iniciais.

### 📋 Requisitos funcionais atendidos

| RF | Onde está |
| --- | --- |
| RF001 Acesso à plataforma | Login por perfil em `index.html`; cada página bloqueia outros perfis |
| RF002 Busca por nome, região ou categoria | Campo de busca e filtros em `turista.html` |
| RF003 História e contexto cultural | Detalhe do lugar em `turista.html` |
| RF004 Mapa dos pontos próximos | Mapa com a posição do usuário em `turista.html` |
| RF005 Filtro por distância e região | Filtros de distância e região em `turista.html` |
| RF006 Avaliação em estrelas | Formulário de avaliação em `turista.html` |
| RF007 Envio de fotos | "Envie uma foto" no detalhe do lugar |
| RF008 Favoritar locais | Botão "Favoritar" e filtro "Somente favoritos" |
| RF009 Consulta de custos | Custo e valor no detalhe e filtro de custo |
| RF010 Consulta de acessibilidade | Acessibilidade no detalhe e filtro "Somente acessíveis" |
| RF011 Cadastro de pontos turísticos | Aba "Lugares" em `admin.html` |
| RF012 Divulgação de passeios | Seção "Meus passeios" em `guia.html` |
| RF013 Moderação de avaliações e fotos | Abas "Avaliações" e "Fotos" em `admin.html` |

O código compartilhado entre as páginas (dados, mapa e utilitários) fica em `shared.js`, o formulário de lugar usado pelo guia e pelo administrador fica em `place-form.js`, e o mapa ilustrado de João Pessoa é o arquivo `img/mapa-jampa.svg`.

> O mapa é ilustrativo: as distâncias são aproximadas a partir da posição no desenho. As fotos são reduzidas antes de salvar, mas o `localStorage` tem limite de cerca de 5 MB.

---

## 📱 Responsividade

O site foi desenvolvido para funcionar em diferentes tamanhos de tela.

O CSS utiliza **Media Queries** para adaptar elementos como:

- Menu de navegação.
- Cards dos pontos turísticos.
- Roteiro interativo.
- Imagens.
- Textos.
- Seção histórica.
- Organização das colunas.

Em dispositivos menores, o menu tradicional é substituído por um botão **Menu**, controlado por JavaScript.

---

## 🎓 Objetivo de Aprendizado

Este projeto foi desenvolvido com o objetivo de praticar:

- Estruturação de páginas utilizando HTML semântico.
- Estilização e criação de layouts utilizando CSS.
- Desenvolvimento de páginas responsivas.
- Manipulação do DOM com JavaScript.
- Criação de interações utilizando eventos.
- Organização de HTML, CSS e JavaScript separados por responsabilidade.
- Desenvolvimento de uma interface voltada para turismo.
- Organização e apresentação de informações em cards e seções.
- Utilização de imagens relacionadas aos pontos turísticos de João Pessoa.
- Implementação de navegação interna utilizando âncoras.
- Criação de componentes interativos sem utilização de frameworks.

---

## 👨‍💻 Autores

Desenvolvido por **Cintia Ritse Machado e Jucian Oliveira Barbosa**, estudantes de Engenharia de Software, atualmente no segundo período.

GitHub:

- https://github.com/CintiaRitse
- https://github.com/Juca-dev1

---

## 📄 Licença

Este projeto possui fins educacionais e acadêmicos.

As imagens e informações utilizadas sobre os pontos turísticos têm finalidade de apresentação e estudo.