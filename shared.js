"use strict";

const STORAGE_KEYS = {
  places: "rotasJampaPlaces",
  reviews: "rotasJampaReviews",
  photos: "rotasJampaPhotos",
  favorites: "rotasJampaFavorites",
  tours: "rotasJampaTours",
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
  historico: "Histórico",
  cultural: "Cultural",
  natural: "Natural",
  praia: "Praia e ilha",
  gastronomico: "Gastronômico",
  outro: "Outro"
};

const regions = {
  centro: "Centro Histórico",
  tambau: "Tambaú",
  "cabo-branco": "Cabo Branco",
  manaira: "Manaíra",
  bessa: "Bessa",
  altiplano: "Altiplano",
  mata: "Mata do Buraquinho",
  cabedelo: "Cabedelo",
  outra: "Outra região"
};

const costNames = {
  gratuito: "Gratuito",
  pago: "Pago",
  "nao-informado": "Não informado"
};

const accessibilityNames = {
  sim: "Acessível",
  parcial: "Parcialmente acessível",
  nao: "Sem acessibilidade",
  "nao-informado": "Não informado"
};

const statusNames = {
  aprovado: "Aprovado",
  pendente: "Pendente",
  rejeitado: "Rejeitado"
};

const defaultImage = "img/orla de joao pessoa.jpg";

const mapBounds = { north: -7.0678, south: -7.1853, west: -34.9189, east: -34.7835 };

const mapSizeKm = {
  width: (mapBounds.east - mapBounds.west) * 111.32 * Math.cos(7.12 * Math.PI / 180),
  height: (mapBounds.north - mapBounds.south) * 110.57
};

const placeDefaults = {
  region: "outra",
  cost: "nao-informado",
  price: "",
  accessibility: "nao-informado",
  accessibilityInfo: "",
  hours: "",
  rejectReason: ""
};

const defaultPlaces = [
  {
    id: "praca-anteno",
    name: "Praça Anteno",
    type: "historico",
    region: "centro",
    category: "Centro Histórico",
    cost: "gratuito",
    description: "Localizada no Centro Histórico, a praça se destaca pelos sobrados coloridos dos séculos XIX e XX, que misturam estilo eclético, Art Déco e elementos clássicos, barrocos e neogóticos. Hoje abriga bares, ateliês e a Fundação de Cultura de João Pessoa.",
    image: "img/praça anteno.jpg",
    x: 25.8,
    y: 41.9
  },
  {
    id: "igreja-sao-francisco",
    name: "Igreja de São Francisco",
    type: "historico",
    region: "centro",
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
    region: "centro",
    category: "Patrimônio",
    description: "O teatro mais antigo da Paraíba e o quinto do Brasil, inaugurado em 3 de novembro de 1889. Recebeu o sobrenome do então presidente da Paraíba, Francisco da Gama Roza, e foi palco de importantes acontecimentos do estado.",
    image: "img/Teatro Santa Roza.jpg",
    x: 23.3,
    y: 45
  },
  {
    id: "jardim-botanico",
    name: "Jardim Botânico",
    type: "natural",
    region: "mata",
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
    region: "cabo-branco",
    category: "Cartão-postal",
    cost: "gratuito",
    description: "Um dos pontos turísticos mais emblemáticos de João Pessoa, ligado ao extremo oriental das Américas. É símbolo de orgulho paraibano e um ótimo lugar para contemplar o mar.",
    image: "img/Farol do cabo branco.jpg",
    x: 89.7,
    y: 68.8
  },
  {
    id: "estacao-cabo-branco",
    name: "Estação Cabo Branco",
    type: "cultural",
    region: "cabo-branco",
    category: "Arte e ciência",
    cost: "gratuito",
    description: "Projetada por Oscar Niemeyer e inaugurada em 2008, a Estação Cabo Branco – Ciência, Cultura e Artes tem mais de 8.500 m² e leva cultura, arte, ciência e tecnologia à população de forma gratuita.",
    image: "img/Estação cabro branco.jpg",
    x: 86.7,
    y: 70.6
  },
  {
    id: "praia-tambau",
    name: "Praia de Tambaú",
    type: "praia",
    region: "tambau",
    category: "Praia",
    cost: "gratuito",
    description: "Uma das praias mais movimentadas da cidade, com bares, restaurantes, música ao vivo, mercado de artesanato e feirinha. Daqui partem embarcações para as piscinas naturais de Picãozinho.",
    image: "img/Praia do Tambaú.jpg",
    x: 80,
    y: 46.3
  },
  {
    id: "praia-cabo-branco",
    name: "Praia de Cabo Branco",
    type: "praia",
    region: "cabo-branco",
    category: "Praia",
    cost: "gratuito",
    description: "Vizinha de Tambaú, possui cerca de 5,1 km com restaurantes, hotéis e lanchonetes ao longo da orla, que se conecta ao complexo do Farol e da Estação Cabo Branco.",
    image: "img/Praia do cabo branco.jpg",
    x: 82.5,
    y: 57
  },
  {
    id: "praia-bessa",
    name: "Praia do Bessa",
    type: "praia",
    region: "bessa",
    category: "Praia",
    cost: "gratuito",
    description: "No extremo norte da cidade, tem cerca de 5,3 km de areias claras, águas esverdeadas e calmas, recifes e coqueiros. O trecho conhecido como Caribessa é famoso pelas águas tranquilas.",
    image: "img/praia bessa.jpg",
    x: 77,
    y: 15
  },
  {
    id: "areia-vermelha",
    name: "Ilha de Areia Vermelha",
    type: "praia",
    region: "cabedelo",
    category: "Ilha",
    cost: "pago",
    price: "Passeio de catamarã (valor varia por empresa)",
    description: "Parque Estadual Marinho em Cabedelo. Na maré baixa, o banco de areia avermelhada aparece e forma um cenário de águas rasas e mornas, muito procurado para passeios de catamarã.",
    image: "img/Ilha da areia vermelha.jpg",
    x: 94.2,
    y: 7.5
  }
].map(place => ({
  ...placeDefaults,
  ...place,
  status: "aprovado",
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
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showMessage("Não foi possível salvar: o armazenamento do navegador está cheio.");
    return false;
  }
}

function normalizePlace(place) {
  const legacyTypes = { natureza: "natural" };
  const seed = defaultPlaces.find(item => item.id === place.id);

  return { ...placeDefaults, ...seed, ...place, type: legacyTypes[place.type] ?? place.type };
}

function getPlaces() {
  const places = readStorage(STORAGE_KEYS.places, null);

  if (!places) {
    writeStorage(STORAGE_KEYS.places, defaultPlaces);
    return defaultPlaces.map(place => ({ ...place }));
  }

  return places.map(normalizePlace);
}

const savePlaces = places => writeStorage(STORAGE_KEYS.places, places);
const getReviews = () => readStorage(STORAGE_KEYS.reviews, []);
const saveReviews = reviews => writeStorage(STORAGE_KEYS.reviews, reviews);
const getPhotos = () => readStorage(STORAGE_KEYS.photos, []);
const savePhotos = photos => writeStorage(STORAGE_KEYS.photos, photos);
const getFavorites = () => readStorage(STORAGE_KEYS.favorites, []);
const saveFavorites = favorites => writeStorage(STORAGE_KEYS.favorites, favorites);
const getTours = () => readStorage(STORAGE_KEYS.tours, []);
const saveTours = tours => writeStorage(STORAGE_KEYS.tours, tours);
const getUsers = () => readStorage(STORAGE_KEYS.users, []);
const saveUsers = users => writeStorage(STORAGE_KEYS.users, users);
const getSession = () => readStorage(STORAGE_KEYS.session, null);
const saveSession = session => writeStorage(STORAGE_KEYS.session, session);
const clearSession = () => localStorage.removeItem(STORAGE_KEYS.session);

function deletePlace(id) {
  savePlaces(getPlaces().filter(place => place.id !== id));
  saveReviews(getReviews().filter(review => review.placeId !== id));
  savePhotos(getPhotos().filter(photo => photo.placeId !== id));
  saveFavorites(getFavorites().filter(favorite => favorite.placeId !== id));
  saveTours(getTours()
    .map(tour => ({ ...tour, placeIds: tour.placeIds.filter(placeId => placeId !== id) }))
    .filter(tour => tour.placeIds.length));
}

const createId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function escapeHTML(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, char => entities[char]);
}

const normalizeText = text => String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const formatDate = date => new Date(date).toLocaleDateString("pt-BR");

const formatDateTime = date => date
  ? new Date(date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
  : "Sob consulta";

const formatDistance = km => km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;

const describeCost = place => place.cost === "pago" && place.price ? `Pago · ${place.price}` : costNames[place.cost];

const optionsFrom = (items, selected = "") => Object.entries(items)
  .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`)
  .join("");

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

function toMapPosition(latitude, longitude) {
  return {
    x: (longitude - mapBounds.west) / (mapBounds.east - mapBounds.west) * 100,
    y: (mapBounds.north - latitude) / (mapBounds.north - mapBounds.south) * 100
  };
}

const isInsideMap = point => point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100;

function getDistanceKm(from, to) {
  const width = (to.x - from.x) / 100 * mapSizeKm.width;
  const height = (to.y - from.y) / 100 * mapSizeKm.height;

  return Math.hypot(width, height);
}

function getMapPoint(map, event) {
  const area = map.getBoundingClientRect();

  return {
    x: Number(((event.clientX - area.left) / area.width * 100).toFixed(1)),
    y: Number(((event.clientY - area.top) / area.height * 100).toFixed(1))
  };
}

function readImage(file, maxSize = 900) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("O arquivo não é uma imagem."));
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const image = new Image();

      image.addEventListener("load", () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      });

      image.addEventListener("error", reject);
      image.src = reader.result;
    });

    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
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

function createPin(className, point, name) {
  const pin = document.createElement("span");
  pin.className = `map-pin ${className}`;
  pin.style.left = `${point.x}%`;
  pin.style.top = `${point.y}%`;
  pin.dataset.name = name;
  return pin;
}

function renderMapPins(map, places, { selectedId = "", onSelect = null, draft = null, user = null } = {}) {
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
    map.append(createPin("draft", draft, "Novo local"));
  }

  if (user) {
    map.append(createPin("user", user, "Você está aqui"));
  }
}

function renderTourCard(tour, places, { linkPlaces = false, actions = "" } = {}) {
  const tourPlaces = tour.placeIds
    .map(id => places.find(place => place.id === id && place.status === "aprovado"))
    .filter(Boolean);

  const chips = tourPlaces.map(place => linkPlaces
    ? `<button class="chip" type="button" data-place="${place.id}">${escapeHTML(place.name)}</button>`
    : `<span class="chip">${escapeHTML(place.name)}</span>`
  ).join("");

  return `
    <article class="tour-item">
      <span class="eyebrow">Passeio guiado · por ${escapeHTML(tour.guideName)}</span>
      <h3>${escapeHTML(tour.name)}</h3>
      <p>${escapeHTML(tour.description)}</p>
      <ul class="tour-facts">
        <li><strong>Duração</strong>${escapeHTML(tour.duration)}</li>
        <li><strong>Valor</strong>${escapeHTML(tour.price)}</li>
        <li><strong>Data</strong>${formatDateTime(tour.dateTime)}</li>
        <li><strong>Vagas</strong>${tour.capacity}</li>
      </ul>
      <div class="chip-list">${chips}</div>
      <p class="tour-contact">Contato do guia: <strong>${escapeHTML(tour.contact)}</strong></p>
      ${actions}
    </article>
  `;
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
