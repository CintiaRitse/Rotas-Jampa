"use strict";

const session = requireRole("admin");

const map = document.querySelector("#map");
const mapCard = document.querySelector("#admin-map-card");
const stats = document.querySelector("#stats");
const pendingCount = document.querySelector("#pending-count");
const photoCount = document.querySelector("#photo-count");
const pendingList = document.querySelector("#pending-list");
const placeEditor = document.querySelector("#place-editor");
const placesTable = document.querySelector("#places-table");
const reviewsTable = document.querySelector("#reviews-table");
const photosList = document.querySelector("#photos-list");
const toursTable = document.querySelector("#tours-table");
const usersTable = document.querySelector("#users-table");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

let selectedId = "";
let placeForm = null;

const emptyRow = (columns, text) => `<tr><td colspan="${columns}" class="empty-cell">${text}</td></tr>`;

function renderStats(places, reviews, photos, tours, users) {
  const pending = places.filter(place => place.status === "pendente").length;
  const pendingPhotos = photos.filter(photo => photo.status === "pendente").length;

  const cards = [
    { value: places.filter(place => place.status === "aprovado").length, label: "Lugares publicados" },
    { value: pending, label: "Lugares para validar" },
    { value: pendingPhotos, label: "Fotos para validar" },
    { value: reviews.length, label: "Avaliações" },
    { value: tours.length, label: "Passeios" },
    { value: users.length, label: "Usuários" }
  ];

  stats.innerHTML = cards.map(card => `
    <article class="stat-card">
      <strong>${card.value}</strong>
      <span>${card.label}</span>
    </article>
  `).join("");

  pendingCount.textContent = pending ? `(${pending})` : "";
  photoCount.textContent = pendingPhotos ? `(${pendingPhotos})` : "";
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
        <small>${placeTypes[place.type]} · ${regions[place.region]} · por ${escapeHTML(place.author)}</small>
        <small>Custo: ${describeCost(place)} · Acessibilidade: ${accessibilityNames[place.accessibility]}</small>
        <p>${escapeHTML(place.description)}</p>
        <div class="table-actions">
          <button class="button primary small" type="button" data-action="approve" data-id="${place.id}">Aprovar</button>
          <button class="button danger small" type="button" data-action="reject" data-id="${place.id}">Rejeitar</button>
          <button class="button outline small" type="button" data-action="edit-place" data-id="${place.id}">Editar</button>
          <button class="button outline small" type="button" data-action="locate" data-id="${place.id}">Ver no mapa</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderPlacesTable(places, reviews) {
  if (!places.length) {
    placesTable.innerHTML = emptyRow(8, "Nenhum lugar cadastrado.");
    return;
  }

  placesTable.innerHTML = places.map(place => {
    const rating = getRating(place.id, reviews);

    return `
      <tr>
        <td><strong>${escapeHTML(place.name)}</strong><small>por ${escapeHTML(place.author)}</small></td>
        <td>${placeTypes[place.type]}</td>
        <td>${regions[place.region]}</td>
        <td>${costNames[place.cost]}</td>
        <td>${accessibilityNames[place.accessibility]}</td>
        <td><span class="status-badge ${place.status}">${statusNames[place.status]}</span></td>
        <td>${rating.total ? `${rating.average.toFixed(1)} <small>(${rating.total})</small>` : "–"}</td>
        <td>
          <div class="table-actions">
            <button class="button outline small" type="button" data-action="edit-place" data-id="${place.id}">Editar</button>
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

function renderPhotos(places, photos) {
  if (!photos.length) {
    photosList.innerHTML = `<p class="empty">Nenhuma foto enviada pelos turistas.</p>`;
    return;
  }

  photosList.innerHTML = [...photos]
    .sort((a, b) => (a.status === "pendente" ? -1 : 0) - (b.status === "pendente" ? -1 : 0) || new Date(b.createdAt) - new Date(a.createdAt))
    .map(photo => {
      const place = places.find(item => item.id === photo.placeId);

      return `
        <figure class="photo-card">
          <img src="${escapeHTML(photo.image)}" alt="${escapeHTML(photo.caption || "Foto enviada por um turista")}">
          <figcaption>
            <span class="status-badge ${photo.status}">${statusNames[photo.status]}</span>
            <strong>${escapeHTML(place?.name ?? "Lugar removido")}</strong>
            ${photo.caption ? `<p>${escapeHTML(photo.caption)}</p>` : ""}
            <small>${escapeHTML(photo.userName)} · ${formatDate(photo.createdAt)}</small>
            <div class="table-actions">
              ${photo.status === "pendente" ? `<button class="button primary small" type="button" data-action="approve-photo" data-id="${photo.id}">Aprovar</button>` : ""}
              <button class="button danger small" type="button" data-action="delete-photo" data-id="${photo.id}">Remover</button>
            </div>
          </figcaption>
        </figure>
      `;
    }).join("");
}

function renderTours(places, tours) {
  if (!tours.length) {
    toursTable.innerHTML = emptyRow(6, "Nenhum passeio divulgado.");
    return;
  }

  toursTable.innerHTML = tours.map(tour => {
    const names = tour.placeIds.map(id => places.find(place => place.id === id)?.name).filter(Boolean);

    return `
      <tr>
        <td><strong>${escapeHTML(tour.name)}</strong><small>${escapeHTML(tour.duration)} · ${tour.capacity} vagas</small></td>
        <td>${escapeHTML(tour.guideName)}<small>${escapeHTML(tour.contact)}</small></td>
        <td>${names.map(escapeHTML).join(", ")}</td>
        <td>${escapeHTML(tour.price)}</td>
        <td>${formatDateTime(tour.dateTime)}</td>
        <td><button class="button danger small" type="button" data-action="delete-tour" data-id="${tour.id}">Remover</button></td>
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
      <td>${escapeHTML(user.identifier)}${user.certificate ? `<small>Cadastro: ${escapeHTML(user.certificate)}</small>` : ""}</td>
      <td>${roleNames[user.role]}</td>
      <td>${user.lastLogin ? formatDate(user.lastLogin) : "–"}</td>
      <td><span class="status-badge ${user.blocked ? "rejeitado" : "aprovado"}">${user.blocked ? "Bloqueado" : "Ativo"}</span></td>
      <td>
        ${user.id === session.userId ? "–" : `
          <div class="table-actions">
            <button class="button ${user.blocked ? "outline" : "danger"} small" type="button" data-action="toggle-user" data-id="${user.id}">${user.blocked ? "Desbloquear" : "Bloquear"}</button>
            <button class="button danger small" type="button" data-action="delete-user" data-id="${user.id}">Remover</button>
          </div>
        `}
      </td>
    </tr>
  `).join("");
}

function renderAll() {
  const places = getPlaces();
  const reviews = getReviews();
  const photos = getPhotos();
  const tours = getTours();
  const users = getUsers();

  renderStats(places, reviews, photos, tours, users);
  renderPending(places);
  renderPlacesTable(places, reviews);
  renderReviews(places, reviews);
  renderPhotos(places, photos);
  renderTours(places, tours);
  renderUsers(users);
}

function openTab(id) {
  tabButtons.forEach(button => button.classList.toggle("active", button.dataset.tab === id));
  tabPanels.forEach(panel => panel.classList.toggle("active", panel.id === id));
}

function openEditor(place = null) {
  openTab("tab-lugares");
  placeEditor.hidden = false;

  if (place) {
    placeForm.edit(place);
  } else {
    placeForm.reset();
  }

  placeEditor.scrollIntoView({ behavior: "smooth" });
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
    const reason = prompt("Motivo (será mostrado para quem cadastrou):", "");

    if (reason === null) {
      return;
    }

    const place = updatePlace(id, { status: "rejeitado", rejectReason: reason.trim() || "Não informado." });
    showMessage(`"${place.name}" foi rejeitado.`);
  },

  locate: locatePlace,

  "edit-place": id => openEditor(getPlaces().find(place => place.id === id)),

  "delete-place": id => {
    if (confirm("Excluir este lugar? Avaliações, fotos e favoritos dele também serão apagados.")) {
      deletePlace(id);
      placeForm.reset();
      placeEditor.hidden = true;
      showMessage("Lugar excluído.");
    }
  },

  "delete-review": id => {
    if (confirm("Excluir esta avaliação?")) {
      saveReviews(getReviews().filter(review => review.id !== id));
      showMessage("Avaliação excluída.");
    }
  },

  "approve-photo": id => {
    const photos = getPhotos();
    photos.find(photo => photo.id === id).status = "aprovado";
    savePhotos(photos);
    showMessage("Foto aprovada e publicada.");
  },

  "delete-photo": id => {
    if (confirm("Remover esta foto?")) {
      savePhotos(getPhotos().filter(photo => photo.id !== id));
      showMessage("Foto removida.");
    }
  },

  "delete-tour": id => {
    if (confirm("Remover este passeio da plataforma?")) {
      saveTours(getTours().filter(tour => tour.id !== id));
      showMessage("Passeio removido.");
    }
  },

  "toggle-user": id => {
    const users = getUsers();
    const user = users.find(item => item.id === id);

    user.blocked = !user.blocked;
    saveUsers(users);
    showMessage(user.blocked ? `${user.name} foi bloqueado.` : `${user.name} foi desbloqueado.`);
  },

  "delete-user": id => {
    if (!confirm("Remover este usuário? Os passeios dele também serão removidos.")) {
      return;
    }

    saveUsers(getUsers().filter(user => user.id !== id));
    saveTours(getTours().filter(tour => tour.guideId !== id));
    showMessage("Usuário removido.");
  }
};

if (session) {
  document.querySelector("#user-name").textContent = session.name;

  placeForm = createPlaceForm({
    form: document.querySelector("#place-form"),
    map: document.querySelector("#form-map"),
    mapHint: document.querySelector("#map-hint"),
    title: document.querySelector("#form-title"),
    texts: { createTitle: "Cadastrar novo lugar", create: "Cadastrar e publicar", edit: "Salvar alterações" },
    getMapPlaces: editingId => getPlaces().filter(place => place.id !== editingId),
    onCancel: () => {
      placeEditor.hidden = true;
    },
    onSubmit: (data, editingId) => {
      const places = getPlaces();

      if (editingId) {
        Object.assign(places.find(place => place.id === editingId), data, { updatedAt: new Date().toISOString() });
      } else {
        places.push({
          id: createId(),
          ...data,
          status: "aprovado",
          rejectReason: "",
          author: session.name,
          authorId: session.userId,
          createdAt: new Date().toISOString()
        });
      }

      if (!savePlaces(places)) {
        return false;
      }

      placeEditor.hidden = true;
      renderAll();
      showMessage(editingId ? "Lugar atualizado." : "Lugar cadastrado e publicado.");
      return true;
    }
  });

  tabButtons.forEach(button => {
    button.addEventListener("click", () => openTab(button.dataset.tab));
  });

  document.querySelector("#new-place").addEventListener("click", () => openEditor());

  document.querySelector("main").addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.action;
    actions[action](button.dataset.id);

    if (!["locate", "edit-place"].includes(action)) {
      renderAll();
    }
  });

  document.querySelector("#reset-data").addEventListener("click", () => {
    if (!confirm("Restaurar os lugares iniciais? Lugares dos guias, avaliações, fotos, favoritos e passeios serão apagados.")) {
      return;
    }

    [STORAGE_KEYS.places, STORAGE_KEYS.reviews, STORAGE_KEYS.photos, STORAGE_KEYS.favorites, STORAGE_KEYS.tours]
      .forEach(key => localStorage.removeItem(key));

    placeEditor.hidden = true;
    renderAll();
    showMessage("Dados iniciais restaurados.");
  });

  renderAll();
}
