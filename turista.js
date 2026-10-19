"use strict";

const session = requireRole("turista");

const map = document.querySelector("#map");
const placeList = document.querySelector("#place-list");
const placeDetail = document.querySelector("#place-detail");
const detailSection = document.querySelector("#detalhes");
const typeFilter = document.querySelector("#type-filter");

let selectedId = "";

function getVisiblePlaces() {
  return getPlaces().filter(place =>
    place.status === "aprovado" && (typeFilter.value === "todos" || place.type === typeFilter.value)
  );
}

function renderPlaces() {
  const places = getVisiblePlaces();
  const reviews = getReviews();

  renderMapPins(map, places, { selectedId, onSelect: selectPlace });

  if (!places.length) {
    placeList.innerHTML = `<p class="empty">Nenhum lugar encontrado para este filtro.</p>`;
    return;
  }

  placeList.innerHTML = places.map(place => {
    const rating = getRating(place.id, reviews);

    return `
      <button class="place-item ${place.id === selectedId ? "active" : ""}" type="button" data-id="${place.id}">
        <img src="${escapeHTML(place.image)}" alt="">
        <div>
          <strong>${escapeHTML(place.name)}</strong>
          <small>${escapeHTML(place.category)}</small>
          <span class="rating">
            ${rating.total ? `<span class="stars">${renderStars(rating.average)}</span> ${rating.average.toFixed(1)}` : "Sem avaliações"}
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

function renderDetail() {
  const place = getPlaces().find(item => item.id === selectedId && item.status === "aprovado");

  if (!place) {
    placeDetail.innerHTML = `<p class="empty">Selecione um lugar no mapa ou na lista para ver os detalhes e avaliar.</p>`;
    return;
  }

  const reviews = getReviews().filter(review => review.placeId === place.id);
  const rating = getRating(place.id, reviews);
  const ownReview = reviews.find(review => review.userId === session.userId);

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
  `;
}

function selectPlace(id) {
  selectedId = id;
  renderPlaces();
  renderDetail();
  detailSection.scrollIntoView({ behavior: "smooth" });
}

if (session) {
  document.querySelector("#user-name").textContent = session.name;

  typeFilter.addEventListener("change", renderPlaces);

  placeList.addEventListener("click", event => {
    const item = event.target.closest(".place-item");

    if (item) {
      selectPlace(item.dataset.id);
    }
  });

  placeDetail.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(event.target);
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

    saveReviews(reviews);
    renderPlaces();
    renderDetail();
    showMessage(ownReview ? "Avaliação atualizada!" : "Obrigado pela sua avaliação!");
  });

  placeDetail.addEventListener("click", event => {
    if (!event.target.closest("#delete-review") || !confirm("Deseja excluir a sua avaliação?")) {
      return;
    }

    saveReviews(getReviews().filter(review => !(review.placeId === selectedId && review.userId === session.userId)));
    renderPlaces();
    renderDetail();
    showMessage("Avaliação excluída.");
  });

  renderPlaces();
  renderDetail();
}
