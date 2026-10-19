"use strict";

const session = requireRole("admin");

const map = document.querySelector("#map");
const mapCard = document.querySelector("#admin-map-card");
const stats = document.querySelector("#stats");
const pendingCount = document.querySelector("#pending-count");
const pendingList = document.querySelector("#pending-list");
const placesTable = document.querySelector("#places-table");
const reviewsTable = document.querySelector("#reviews-table");
const usersTable = document.querySelector("#users-table");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

let selectedId = "";

const emptyRow = (columns, text) => `<tr><td colspan="${columns}" class="empty-cell">${text}</td></tr>`;

function renderStats(places, reviews, users) {
  const pending = places.filter(place => place.status === "pendente").length;

  const cards = [
    { value: places.filter(place => place.status === "aprovado").length, label: "Lugares publicados" },
    { value: pending, label: "Aguardando aprovação" },
    { value: reviews.length, label: "Avaliações" },
    { value: users.length, label: "Usuários" }
  ];

  stats.innerHTML = cards.map(card => `
    <article class="stat-card">
      <strong>${card.value}</strong>
      <span>${card.label}</span>
    </article>
  `).join("");

  pendingCount.textContent = pending ? `(${pending})` : "";
}

function renderPending(places) {
  const pending = places.filter(place => place.status === "pendente");

  renderMapPins(map, places, { selectedId, onSelect: locatePlace });

  if (!pending.length) {
    pendingList.innerHTML = `<p class="empty">Nenhum lugar aguardando aprovação.</p>`;
    return;
  }

  pendingList.innerHTML = pending.map(place => `
    <article class="manage-card ${place.id === selectedId ? "active" : ""}">
      <img src="${escapeHTML(place.image)}" alt="${escapeHTML(place.name)}">
      <div>
        <span class="status-badge pendente">Pendente</span>
        <h3>${escapeHTML(place.name)}</h3>
        <small>${placeTypes[place.type]} · ${escapeHTML(place.category)} · por ${escapeHTML(place.author)}</small>
        <p>${escapeHTML(place.description)}</p>
        <div class="table-actions">
          <button class="button primary small" type="button" data-action="approve" data-id="${place.id}">Aprovar</button>
          <button class="button danger small" type="button" data-action="reject" data-id="${place.id}">Rejeitar</button>
          <button class="button outline small" type="button" data-action="locate" data-id="${place.id}">Ver no mapa</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderPlacesTable(places, reviews) {
  if (!places.length) {
    placesTable.innerHTML = emptyRow(6, "Nenhum lugar cadastrado.");
    return;
  }

  placesTable.innerHTML = places.map(place => {
    const rating = getRating(place.id, reviews);

    return `
      <tr>
        <td><strong>${escapeHTML(place.name)}</strong><small>${escapeHTML(place.category)}</small></td>
        <td>${placeTypes[place.type]}</td>
        <td>${escapeHTML(place.author)}</td>
        <td><span class="status-badge ${place.status}">${statusNames[place.status]}</span></td>
        <td>${rating.total ? `${rating.average.toFixed(1)} <small>(${rating.total})</small>` : "–"}</td>
        <td>
          <div class="table-actions">
            ${place.status === "aprovado"
              ? `<button class="button outline small" type="button" data-action="reject" data-id="${place.id}">Despublicar</button>`
              : `<button class="button primary small" type="button" data-action="approve" data-id="${place.id}">Aprovar</button>`}
            <button class="button danger small" type="button" data-action="delete-place" data-id="${place.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderReviews(places, reviews) {
  if (!reviews.length) {
    reviewsTable.innerHTML = emptyRow(6, "Nenhuma avaliação feita ainda.");
    return;
  }

  reviewsTable.innerHTML = [...reviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(review => {
      const place = places.find(item => item.id === review.placeId);

      return `
        <tr>
          <td>${escapeHTML(place?.name ?? "Lugar removido")}</td>
          <td>${escapeHTML(review.userName)}</td>
          <td><span class="stars">${renderStars(review.rating)}</span></td>
          <td class="comment-cell">${escapeHTML(review.comment)}</td>
          <td>${formatDate(review.updatedAt ?? review.createdAt)}</td>
          <td><button class="button danger small" type="button" data-action="delete-review" data-id="${review.id}">Excluir</button></td>
        </tr>
      `;
    }).join("");
}

function renderUsers(users) {
  if (!users.length) {
    usersTable.innerHTML = emptyRow(6, "Nenhum usuário registrado.");
    return;
  }

  usersTable.innerHTML = users.map(user => `
    <tr>
      <td><strong>${escapeHTML(user.name)}</strong>${user.id === session.userId ? "<small>Você</small>" : ""}</td>
      <td>${escapeHTML(user.identifier)}</td>
      <td>${roleNames[user.role]}</td>
      <td>${user.lastLogin ? formatDate(user.lastLogin) : "–"}</td>
      <td><span class="status-badge ${user.blocked ? "rejeitado" : "aprovado"}">${user.blocked ? "Bloqueado" : "Ativo"}</span></td>
      <td>
        ${user.id === session.userId
          ? "–"
          : `<button class="button ${user.blocked ? "outline" : "danger"} small" type="button" data-action="toggle-user" data-id="${user.id}">${user.blocked ? "Desbloquear" : "Bloquear"}</button>`}
      </td>
    </tr>
  `).join("");
}

function renderAll() {
  const places = getPlaces();
  const reviews = getReviews();
  const users = getUsers();

  renderStats(places, reviews, users);
  renderPending(places);
  renderPlacesTable(places, reviews);
  renderReviews(places, reviews);
  renderUsers(users);
}

function locatePlace(id) {
  selectedId = id;
  renderPending(getPlaces());
  mapCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updatePlace(id, changes) {
  const places = getPlaces();
  const place = places.find(item => item.id === id);

  Object.assign(place, changes, { reviewedAt: new Date().toISOString() });
  savePlaces(places);
  return place;
}

const actions = {
  approve: id => {
    const place = updatePlace(id, { status: "aprovado", rejectReason: "" });
    showMessage(`"${place.name}" foi publicado.`);
  },

  reject: id => {
    const reason = prompt("Motivo (será mostrado para o guia):", "");

    if (reason === null) {
      return;
    }

    const place = updatePlace(id, { status: "rejeitado", rejectReason: reason.trim() || "Não informado." });
    showMessage(`"${place.name}" foi rejeitado.`);
  },

  locate: locatePlace,

  "delete-place": id => {
    if (!confirm("Excluir este lugar? As avaliações dele também serão apagadas.")) {
      return;
    }

    savePlaces(getPlaces().filter(place => place.id !== id));
    saveReviews(getReviews().filter(review => review.placeId !== id));
    showMessage("Lugar excluído.");
  },

  "delete-review": id => {
    if (!confirm("Excluir esta avaliação?")) {
      return;
    }

    saveReviews(getReviews().filter(review => review.id !== id));
    showMessage("Avaliação excluída.");
  },

  "toggle-user": id => {
    const users = getUsers();
    const user = users.find(item => item.id === id);

    user.blocked = !user.blocked;
    saveUsers(users);
    showMessage(user.blocked ? `${user.name} foi bloqueado.` : `${user.name} foi desbloqueado.`);
  }
};

if (session) {
  document.querySelector("#user-name").textContent = session.name;

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(item => item.classList.toggle("active", item === button));
      tabPanels.forEach(panel => panel.classList.toggle("active", panel.id === button.dataset.tab));
    });
  });

  document.querySelector("main").addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    actions[button.dataset.action](button.dataset.id);

    if (button.dataset.action !== "locate") {
      renderAll();
    }
  });

  document.querySelector("#reset-data").addEventListener("click", () => {
    if (!confirm("Restaurar os lugares iniciais? Os lugares dos guias e todas as avaliações serão apagados.")) {
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.places);
    localStorage.removeItem(STORAGE_KEYS.reviews);
    renderAll();
    showMessage("Dados iniciais restaurados.");
  });

  renderAll();
}
