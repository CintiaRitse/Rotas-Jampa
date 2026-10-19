"use strict";

const session = requireRole("turista");

const map = document.querySelector("#map");
const placeList = document.querySelector("#place-list");
const placeDetail = document.querySelector("#place-detail");
const detailSection = document.querySelector("#detalhes");
const resultCount = document.querySelector("#result-count");
const tourList = document.querySelector("#tour-list");
const filters = document.querySelector("#filters");
const searchInput = document.querySelector("#search");
const typeFilter = document.querySelector("#type-filter");
const regionFilter = document.querySelector("#region-filter");
const costFilter = document.querySelector("#cost-filter");
const distanceFilter = document.querySelector("#distance-filter");
const accessibleFilter = document.querySelector("#accessible-filter");
const favoriteFilter = document.querySelector("#favorite-filter");
const locationStatus = document.querySelector("#location-status");
const locateButton = document.querySelector("#locate");
const pickButton = document.querySelector("#pick-location");

let selectedId = "";
let userLocation = null;
let pickingLocation = false;

const getFavoriteIds = () => new Set(getFavorites()
  .filter(favorite => favorite.userId === session.userId)
  .map(favorite => favorite.placeId));

function matchesFilters(place, favoriteIds) {
  const term = normalizeText(searchInput.value.trim());
  const searchable = normalizeText(`${place.name} ${place.category} ${regions[place.region]} ${placeTypes[place.type]}`);

  return (!term || searchable.includes(term))
    && (typeFilter.value === "todos" || place.type === typeFilter.value)
    && (regionFilter.value === "todas" || place.region === regionFilter.value)
    && (costFilter.value === "todos" || place.cost === costFilter.value)
    && (distanceFilter.value === "todas" || place.distance === null || place.distance <= Number(distanceFilter.value))
    && (!accessibleFilter.checked || ["sim", "parcial"].includes(place.accessibility))
    && (!favoriteFilter.checked || favoriteIds.has(place.id));
}

function getVisiblePlaces() {
  const favoriteIds = getFavoriteIds();

  return getPlaces()
    .filter(place => place.status === "aprovado")
    .map(place => ({ ...place, distance: userLocation ? getDistanceKm(userLocation, place) : null }))
    .filter(place => matchesFilters(place, favoriteIds))
    .sort((a, b) => userLocation ? a.distance - b.distance : 0);
}

function renderPlaces() {
  const places = getVisiblePlaces();
  const reviews = getReviews();
  const favoriteIds = getFavoriteIds();

  renderMapPins(map, places, { selectedId, onSelect: selectPlace, user: userLocation });
  resultCount.textContent = `${places.length} ${places.length === 1 ? "lugar encontrado" : "lugares encontrados"}`;

  if (!places.length) {
    placeList.innerHTML = `<p class="empty">Nenhum lugar encontrado com esses filtros.</p>`;
    return;
  }

  placeList.innerHTML = places.map(place => {
    const rating = getRating(place.id, reviews);
    const details = [costNames[place.cost]];

    if (place.distance !== null) {
      details.push(`a ${formatDistance(place.distance)}`);
    }

    return `
      <button class="place-item ${place.id === selectedId ? "active" : ""}" type="button" data-id="${place.id}">
        <img src="${escapeHTML(place.image)}" alt="">
        <div>
          <strong>${favoriteIds.has(place.id) ? '<span class="favorite-mark" aria-label="Favorito">♥</span> ' : ""}${escapeHTML(place.name)}</strong>
          <small>${placeTypes[place.type]} · ${regions[place.region]}</small>
          <span class="rating">
            ${rating.total ? `<span class="stars">${renderStars(rating.average)}</span> ${rating.average.toFixed(1)}` : "Sem avaliações"}
            · ${details.join(" · ")}
          </span>
        </div>
      </button>
    `;
  }).join("");
}

function renderReviewList(reviews) {
  if (!reviews.length) {
    return `<p class="empty">Ninguém avaliou este lugar ainda. Seja o primeiro!</p>`;
  }

  return reviews
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(review => `
      <article class="review-item">
        <div class="review-head">
          <strong>${escapeHTML(review.userName)}${review.userId === session.userId ? " (você)" : ""}</strong>
          <span class="stars">${renderStars(review.rating)}</span>
        </div>
        <p>${escapeHTML(review.comment)}</p>
        <small>${formatDate(review.updatedAt ?? review.createdAt)}</small>
      </article>
    `).join("");
}

function renderPhotoGrid(placeId) {
  const photos = getPhotos()
    .filter(photo => photo.placeId === placeId && (photo.status === "aprovado" || photo.userId === session.userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!photos.length) {
    return `<p class="empty">Nenhuma foto enviada ainda.</p>`;
  }

  return `
    <div class="photo-grid">
      ${photos.map(photo => `
        <figure class="photo-card">
          <img src="${escapeHTML(photo.image)}" alt="${escapeHTML(photo.caption || "Foto enviada por um turista")}">
          <figcaption>
            ${photo.status === "pendente" ? '<span class="status-badge pendente">Aguardando validação</span>' : ""}
            ${photo.caption ? `<p>${escapeHTML(photo.caption)}</p>` : ""}
            <small>${escapeHTML(photo.userName)} · ${formatDate(photo.createdAt)}</small>
            ${photo.userId === session.userId ? `<button class="link-button" type="button" data-delete-photo="${photo.id}">Excluir foto</button>` : ""}
          </figcaption>
        </figure>
      `).join("")}
    </div>
  `;
}

function renderDetail() {
  const place = getPlaces().find(item => item.id === selectedId && item.status === "aprovado");

  if (!place) {
    placeDetail.innerHTML = `<p class="empty">Selecione um lugar no mapa ou na lista para ver os detalhes, favoritar e avaliar.</p>`;
    return;
  }

  const places = getPlaces();
  const reviews = getReviews().filter(review => review.placeId === place.id);
  const rating = getRating(place.id, reviews);
  const ownReview = reviews.find(review => review.userId === session.userId);
  const isFavorite = getFavoriteIds().has(place.id);
  const tours = getTours().filter(tour => tour.placeIds.includes(place.id));

  const starInputs = [5, 4, 3, 2, 1].map(value => `
    <input type="radio" id="star-${value}" name="rating" value="${value}" ${ownReview?.rating === value ? "checked" : ""} required>
    <label for="star-${value}" title="${value} estrela${value > 1 ? "s" : ""}">★</label>
  `).join("");

  placeDetail.innerHTML = `
    <div class="detail-layout">
      <img class="detail-image" src="${escapeHTML(place.image)}" alt="${escapeHTML(place.name)}">
      <div>
        <span class="eyebrow">${placeTypes[place.type]} · ${escapeHTML(place.category)}</span>
        <h2>${escapeHTML(place.name)}</h2>
        <div class="rating-summary">
          <span class="stars">${renderStars(rating.average)}</span>
          <strong>${rating.total ? rating.average.toFixed(1) : "–"}</strong>
          <small>${rating.total} ${rating.total === 1 ? "avaliação" : "avaliações"}</small>
        </div>
        <button class="button ${isFavorite ? "primary" : "outline"} small favorite-button" id="favorite-toggle" type="button" aria-pressed="${isFavorite}">
          ${isFavorite ? "♥ Nos seus favoritos" : "♡ Favoritar"}
        </button>
        <dl class="info-grid">
          <div><dt>Região</dt><dd>${regions[place.region]}</dd></div>
          <div><dt>Custo</dt><dd><span class="cost-badge ${place.cost}">${costNames[place.cost]}</span>${place.price ? `<small>${escapeHTML(place.price)}</small>` : ""}</dd></div>
          <div><dt>Acessibilidade</dt><dd>${accessibilityNames[place.accessibility]}${place.accessibilityInfo ? `<small>${escapeHTML(place.accessibilityInfo)}</small>` : ""}</dd></div>
          <div><dt>Horário</dt><dd>${escapeHTML(place.hours) || "Não informado"}</dd></div>
          ${userLocation ? `<div><dt>Distância</dt><dd>a ${formatDistance(getDistanceKm(userLocation, place))} de você</dd></div>` : ""}
        </dl>
        <h3 class="detail-subtitle">História e contexto cultural</h3>
        <p>${escapeHTML(place.description)}</p>
        <small class="detail-author">Cadastrado por ${escapeHTML(place.author)}</small>
      </div>
    </div>
    <div class="review-layout">
      <form class="panel-card" id="review-form">
        <h3>${ownReview ? "Editar sua avaliação" : "Avalie este lugar"}</h3>
        <div class="star-input">${starInputs}</div>
        <div class="form-field">
          <label for="review-comment">Comentário</label>
          <textarea id="review-comment" name="comment" rows="4" maxlength="400" placeholder="Conte como foi a sua visita" required>${escapeHTML(ownReview?.comment)}</textarea>
        </div>
        <div class="form-actions">
          <button class="button primary" type="submit">${ownReview ? "Atualizar avaliação" : "Enviar avaliação"}</button>
          ${ownReview ? `<button class="button outline" type="button" id="delete-review">Excluir avaliação</button>` : ""}
        </div>
      </form>
      <div>
        <h3>O que os turistas dizem</h3>
        <div class="review-list">${renderReviewList(reviews)}</div>
      </div>
    </div>
    <div class="review-layout">
      <form class="panel-card" id="photo-form">
        <h3>Envie uma foto</h3>
        <p class="form-help">Mostre como o lugar está hoje. A foto aparece para todos depois da validação do administrador.</p>
        <div class="form-field">
          <label for="photo-file">Foto</label>
          <input id="photo-file" name="foto" type="file" accept="image/*" required>
        </div>
        <div class="form-field">
          <label for="photo-caption">Legenda (opcional)</label>
          <input id="photo-caption" name="legenda" type="text" maxlength="120" placeholder="Ex.: Maré baixa no fim da tarde">
        </div>
        <button class="button primary" type="submit">Enviar foto</button>
      </form>
      <div>
        <h3>Fotos dos visitantes</h3>
        ${renderPhotoGrid(place.id)}
      </div>
    </div>
    ${tours.length ? `
      <div class="detail-tours">
        <h3>Passeios que passam por aqui</h3>
        <div class="tour-list">${tours.map(tour => renderTourCard(tour, places, { linkPlaces: true })).join("")}</div>
      </div>
    ` : ""}
  `;
}

function renderTours() {
  const tours = getTours().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const places = getPlaces();

  tourList.innerHTML = tours.length
    ? tours.map(tour => renderTourCard(tour, places, { linkPlaces: true })).join("")
    : `<p class="empty">Nenhum passeio divulgado ainda.</p>`;
}

function renderAll() {
  renderPlaces();
  renderDetail();
}

function selectPlace(id) {
  selectedId = id;
  renderAll();
  detailSection.scrollIntoView({ behavior: "smooth" });
}

function setUserLocation(point) {
  userLocation = point;
  distanceFilter.disabled = false;
  locationStatus.innerHTML = "<strong>Localização definida.</strong> Os lugares estão ordenados do mais perto para o mais longe.";
  renderAll();
}

function setPicking(active) {
  pickingLocation = active;
  map.classList.toggle("pickable", active);
  pickButton.textContent = active ? "Cancelar marcação" : "Marcar no mapa";

  if (active) {
    locationStatus.innerHTML = "<strong>Clique no mapa</strong> para marcar onde você está.";
  }
}

function toggleFavorite() {
  const favorites = getFavorites();
  const index = favorites.findIndex(favorite => favorite.userId === session.userId && favorite.placeId === selectedId);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push({ id: createId(), userId: session.userId, placeId: selectedId, createdAt: new Date().toISOString() });
  }

  saveFavorites(favorites);
  renderAll();
  showMessage(index >= 0 ? "Removido dos favoritos." : "Adicionado aos favoritos!");
}

function saveReview(form) {
  const formData = new FormData(form);
  const comment = String(formData.get("comment")).trim();
  const reviews = getReviews();
  const ownReview = reviews.find(review => review.placeId === selectedId && review.userId === session.userId);

  if (!comment) {
    showMessage("Escreva um comentário sobre a sua visita.");
    return;
  }

  if (ownReview) {
    ownReview.rating = Number(formData.get("rating"));
    ownReview.comment = comment;
    ownReview.updatedAt = new Date().toISOString();
  } else {
    reviews.push({
      id: createId(),
      placeId: selectedId,
      userId: session.userId,
      userName: session.name,
      rating: Number(formData.get("rating")),
      comment,
      createdAt: new Date().toISOString()
    });
  }

  if (saveReviews(reviews)) {
    renderAll();
    showMessage(ownReview ? "Avaliação atualizada!" : "Obrigado pela sua avaliação!");
  }
}

async function savePhoto(form) {
  const formData = new FormData(form);

  try {
    const image = await readImage(formData.get("foto"));
    const photos = getPhotos();

    photos.push({
      id: createId(),
      placeId: selectedId,
      userId: session.userId,
      userName: session.name,
      image,
      caption: String(formData.get("legenda")).trim(),
      status: "pendente",
      createdAt: new Date().toISOString()
    });

    if (savePhotos(photos)) {
      renderDetail();
      showMessage("Foto enviada! Ela aparece para todos depois da validação.");
    }
  } catch {
    showMessage("Não foi possível ler esta imagem.");
  }
}

if (session) {
  document.querySelector("#user-name").textContent = session.name;

  typeFilter.innerHTML = `<option value="todos">Todas</option>${optionsFrom(placeTypes)}`;
  regionFilter.innerHTML = `<option value="todas">Todas</option>${optionsFrom(regions)}`;
  costFilter.innerHTML = `<option value="todos">Todos</option>${optionsFrom(costNames)}`;

  filters.addEventListener("input", renderPlaces);
  filters.addEventListener("submit", event => event.preventDefault());

  locateButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showMessage("Seu navegador não permite localização. Use “Marcar no mapa”.");
      return;
    }

    locationStatus.textContent = "Buscando sua localização...";

    navigator.geolocation.getCurrentPosition(
      position => {
        const point = toMapPosition(position.coords.latitude, position.coords.longitude);

        if (isInsideMap(point)) {
          setUserLocation(point);
        } else {
          locationStatus.innerHTML = "Você está fora da área do mapa. Use <strong>Marcar no mapa</strong> para escolher um ponto.";
        }
      },
      () => {
        locationStatus.innerHTML = "Não foi possível obter sua localização. Use <strong>Marcar no mapa</strong>.";
      },
      { timeout: 10000 }
    );
  });

  pickButton.addEventListener("click", () => setPicking(!pickingLocation));

  map.addEventListener("click", event => {
    if (pickingLocation) {
      setPicking(false);
      setUserLocation(getMapPoint(map, event));
    }
  });

  placeList.addEventListener("click", event => {
    const item = event.target.closest(".place-item");

    if (item) {
      selectPlace(item.dataset.id);
    }
  });

  placeDetail.addEventListener("submit", event => {
    event.preventDefault();

    if (event.target.id === "review-form") {
      saveReview(event.target);
    } else if (event.target.id === "photo-form") {
      savePhoto(event.target);
    }
  });

  placeDetail.addEventListener("click", event => {
    const photoButton = event.target.closest("[data-delete-photo]");

    if (event.target.closest("#favorite-toggle")) {
      toggleFavorite();
    } else if (photoButton && confirm("Deseja excluir esta foto?")) {
      savePhotos(getPhotos().filter(photo => photo.id !== photoButton.dataset.deletePhoto));
      renderDetail();
      showMessage("Foto excluída.");
    } else if (event.target.closest("#delete-review") && confirm("Deseja excluir a sua avaliação?")) {
      saveReviews(getReviews().filter(review => !(review.placeId === selectedId && review.userId === session.userId)));
      renderAll();
      showMessage("Avaliação excluída.");
    }
  });

  document.querySelector("main").addEventListener("click", event => {
    const chip = event.target.closest("[data-place]");

    if (chip) {
      selectPlace(chip.dataset.place);
    }
  });

  renderAll();
  renderTours();
}
