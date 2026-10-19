"use strict";

const STORAGE_KEYS = {
  places: "rotasJampaPlaces",
  reviews: "rotasJampaReviews",
  users: "rotasJampaUsers",
  session: "rotasJampaSession"
};

const panelPages = {
  turista: "turista.html",
  guia: "guia.html",
  admin: "admin.html"
};

const roleNames = {
  turista: "Turista",
  guia: "Guia Turístico",
  admin: "Administrador"
};

const placeTypes = {
  cultural: "Cultural",
  praia: "Praia e ilha",
  natureza: "Natureza"
};

const statusNames = {
  aprovado: "Aprovado",
  pendente: "Pendente",
  rejeitado: "Rejeitado"
};

const defaultImage = "img/orla de joao pessoa.jpg";

const defaultPlaces = [
  {
    id: "praca-anteno",
    name: "Praça Anteno",
    type: "cultural",
    category: "Centro Histórico",
    description: "Localizada no Centro Histórico, a praça se destaca pelos sobrados coloridos dos séculos XIX e XX, que misturam estilo eclético, Art Déco e elementos clássicos, barrocos e neogóticos. Hoje abriga bares, ateliês e a Fundação de Cultura de João Pessoa.",
    image: "img/praça anteno.jpg",
    x: 25.8,
    y: 41.9
  },
  {
    id: "igreja-sao-francisco",
    name: "Igreja de São Francisco",
    type: "cultural",
    category: "Patrimônio religioso",
    description: "Em estilo barroco rococó, é um importante monumento histórico-artístico religioso. Começou a ser construída em 1589 e só foi concluída em 1788. Durante a invasão holandesa, serviu de residência a diretores holandeses.",
    image: "img/Igreja da São Francisco.jpg",
    x: 22.5,
    y: 38.1
  },
  {
    id: "theatro-santa-roza",
    name: "Theatro Santa Roza",
    type: "cultural",
    category: "Patrimônio",
    description: "O teatro mais antigo da Paraíba e o quinto do Brasil, inaugurado em 3 de novembro de 1889. Recebeu o sobrenome do então presidente da Paraíba, Francisco da Gama Roza, e foi palco de importantes acontecimentos do estado.",
    image: "img/Teatro Santa Roza.jpg",
    x: 23.3,
    y: 45
  },
  {
    id: "jardim-botanico",
    name: "Jardim Botânico",
    type: "natureza",
    category: "Mata do Buraquinho",
    description: "O Jardim Botânico Benjamim Maranhão, conhecido como Mata do Buraquinho, foi criado em 28 de agosto de 2000 e possui 515 hectares de área verde cercada pela zona urbana.",
    image: "img/Jardim botânico.jpg",
    x: 50,
    y: 55.6
  },
  {
    id: "farol-cabo-branco",
    name: "Farol do Cabo Branco",
    type: "cultural",
    category: "Cartão-postal",
    description: "Um dos pontos turísticos mais emblemáticos de João Pessoa, ligado ao extremo oriental das Américas. É símbolo de orgulho paraibano e um ótimo lugar para contemplar o mar.",
    image: "img/Farol do cabo branco.jpg",
    x: 89.7,
    y: 68.8
  },
  {
    id: "estacao-cabo-branco",
    name: "Estação Cabo Branco",
    type: "cultural",
    category: "Arte e ciência",
    description: "Projetada por Oscar Niemeyer e inaugurada em 2008, a Estação Cabo Branco – Ciência, Cultura e Artes tem mais de 8.500 m² e leva cultura, arte, ciência e tecnologia à população de forma gratuita.",
    image: "img/Estação cabro branco.jpg",
    x: 86.7,
    y: 70.6
  },
  {
    id: "praia-tambau",
    name: "Praia de Tambaú",
    type: "praia",
    category: "Praia",
    description: "Uma das praias mais movimentadas da cidade, com bares, restaurantes, música ao vivo, mercado de artesanato e feirinha. Daqui partem embarcações para as piscinas naturais de Picãozinho.",
    image: "img/Praia do Tambaú.jpg",
    x: 80,
    y: 46.3
  },
  {
    id: "praia-cabo-branco",
    name: "Praia de Cabo Branco",
    type: "praia",
    category: "Praia",
    description: "Vizinha de Tambaú, possui cerca de 5,1 km com restaurantes, hotéis e lanchonetes ao longo da orla, que se conecta ao complexo do Farol e da Estação Cabo Branco.",
    image: "img/Praia do cabo branco.jpg",
    x: 82.5,
    y: 57
  },
  {
    id: "praia-bessa",
    name: "Praia do Bessa",
    type: "praia",
    category: "Praia",
    description: "No extremo norte da cidade, tem cerca de 5,3 km de areias claras, águas esverdeadas e calmas, recifes e coqueiros. O trecho conhecido como Caribessa é famoso pelas águas tranquilas.",
    image: "img/praia bessa.jpg",
    x: 77,
    y: 15
  },
  {
    id: "areia-vermelha",
    name: "Ilha de Areia Vermelha",
    type: "praia",
    category: "Ilha",
    description: "Parque Estadual Marinho em Cabedelo. Na maré baixa, o banco de areia avermelhada aparece e forma um cenário de águas rasas e mornas, muito procurado para passeios de catamarã.",
    image: "img/Ilha da areia vermelha.jpg",
    x: 94.2,
    y: 7.5
  }
].map(place => ({
  ...place,
  status: "aprovado",
  rejectReason: "",
  author: "Rotas Jampa",
  authorId: "sistema",
  createdAt: "2026-09-06T00:00:00.000Z"
}));

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getPlaces() {
  const places = readStorage(STORAGE_KEYS.places, null);

  if (!places) {
    writeStorage(STORAGE_KEYS.places, defaultPlaces);
    return defaultPlaces.map(place => ({ ...place }));
  }

  return places;
}

const savePlaces = places => writeStorage(STORAGE_KEYS.places, places);
const getReviews = () => readStorage(STORAGE_KEYS.reviews, []);
const saveReviews = reviews => writeStorage(STORAGE_KEYS.reviews, reviews);
const getUsers = () => readStorage(STORAGE_KEYS.users, []);
const saveUsers = users => writeStorage(STORAGE_KEYS.users, users);
const getSession = () => readStorage(STORAGE_KEYS.session, null);
const saveSession = session => writeStorage(STORAGE_KEYS.session, session);
const clearSession = () => localStorage.removeItem(STORAGE_KEYS.session);

const createId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function escapeHTML(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, char => entities[char]);
}

const formatDate = date => new Date(date).toLocaleDateString("pt-BR");

function getRating(placeId, reviews = getReviews()) {
  const placeReviews = reviews.filter(review => review.placeId === placeId);
  const total = placeReviews.length;
  const average = total ? placeReviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;

  return { average, total };
}

function renderStars(value) {
  const rounded = Math.round(value);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function getActiveUser() {
  const session = getSession();
  const user = session && getUsers().find(item => item.id === session.userId);

  return user && !user.blocked ? session : null;
}

function requireRole(role) {
  const session = getActiveUser();

  if (!session || session.role !== role) {
    clearSession();
    window.location.replace("index.html#acesso");
    return null;
  }

  return session;
}

function renderMapPins(map, places, { selectedId = "", onSelect = null, draft = null } = {}) {
  map.querySelectorAll(".map-pin").forEach(pin => pin.remove());

  places.forEach(place => {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = `map-pin ${place.status}`;
    pin.classList.toggle("active", place.id === selectedId);
    pin.style.left = `${place.x}%`;
    pin.style.top = `${place.y}%`;
    pin.dataset.name = place.name;
    pin.setAttribute("aria-label", place.name);

    if (onSelect) {
      pin.addEventListener("click", () => onSelect(place.id));
    } else {
      pin.tabIndex = -1;
    }

    map.append(pin);
  });

  if (draft) {
    const pin = document.createElement("span");
    pin.className = "map-pin draft";
    pin.style.left = `${draft.x}%`;
    pin.style.top = `${draft.y}%`;
    pin.dataset.name = "Novo local";
    map.append(pin);
  }
}

function showMessage(text) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.append(toast);
  }

  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const open = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  navigation.addEventListener("click", event => {
    if (event.target.closest("a")) {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelector("#logout")?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});
