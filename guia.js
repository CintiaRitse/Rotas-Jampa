"use strict";

const session = requireRole("guia");

const map = document.querySelector("#map");
const mapHint = document.querySelector("#map-hint");
const placeForm = document.querySelector("#place-form");
const formTitle = document.querySelector("#form-title");
const submitButton = document.querySelector("#submit-place");
const cancelButton = document.querySelector("#cancel-edit");
const myPlaces = document.querySelector("#my-places");

let editingId = "";
let draft = null;

function renderMap() {
  const places = getPlaces().filter(place =>
    place.id !== editingId && (place.status === "aprovado" || place.authorId === session.userId)
  );

  renderMapPins(map, places, { draft });

  mapHint.innerHTML = draft
    ? "<strong>Local marcado!</strong> Clique em outro ponto do mapa para ajustar."
    : "Clique no mapa para marcar onde fica o lugar.";
}

function renderMyPlaces() {
  const places = getPlaces()
    .filter(place => place.authorId === session.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!places.length) {
    myPlaces.innerHTML = `<p class="empty">Você ainda não cadastrou nenhum lugar.</p>`;
    return;
  }

  myPlaces.innerHTML = places.map(place => `
    <article class="manage-card">
      <img src="${escapeHTML(place.image)}" alt="${escapeHTML(place.name)}">
      <div>
        <span class="status-badge ${place.status}">${statusNames[place.status]}</span>
        <h3>${escapeHTML(place.name)}</h3>
        <small>${placeTypes[place.type]} · ${escapeHTML(place.category)}</small>
        <p>${escapeHTML(place.description)}</p>
        ${place.status === "rejeitado" ? `<p class="reject-reason"><strong>Motivo:</strong> ${escapeHTML(place.rejectReason)}</p>` : ""}
        <div class="table-actions">
          <button class="button outline small" type="button" data-action="edit" data-id="${place.id}">Editar</button>
          <button class="button danger small" type="button" data-action="delete" data-id="${place.id}">Excluir</button>
        </div>
      </div>
    </article>
  `).join("");
}

function resetForm() {
  placeForm.reset();
  editingId = "";
  draft = null;
  formTitle.textContent = "Cadastrar novo lugar";
  submitButton.textContent = "Enviar para aprovação";
  cancelButton.hidden = true;
  renderMap();
}

function startEdit(id) {
  const place = getPlaces().find(item => item.id === id);

  if (!place) {
    return;
  }

  editingId = id;
  draft = { x: place.x, y: place.y };

  placeForm.elements.namedItem("nome").value = place.name;
  placeForm.elements.namedItem("tipo").value = place.type;
  placeForm.elements.namedItem("categoria").value = place.category;
  placeForm.elements.namedItem("imagem").value = place.image === defaultImage ? "" : place.image;
  placeForm.elements.namedItem("descricao").value = place.description;

  formTitle.textContent = `Editando: ${place.name}`;
  submitButton.textContent = "Salvar e reenviar";
  cancelButton.hidden = false;
  renderMap();
  document.querySelector("#cadastro").scrollIntoView({ behavior: "smooth" });
}

if (session) {
  document.querySelector("#user-name").textContent = session.name;

  map.addEventListener("click", event => {
    const area = map.getBoundingClientRect();

    draft = {
      x: Number(((event.clientX - area.left) / area.width * 100).toFixed(1)),
      y: Number(((event.clientY - area.top) / area.height * 100).toFixed(1))
    };

    renderMap();
  });

  placeForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!draft) {
      showMessage("Marque o local no mapa antes de enviar.");
      return;
    }

    const formData = new FormData(placeForm);
    const places = getPlaces();
    const data = {
      name: String(formData.get("nome")).trim(),
      type: formData.get("tipo"),
      category: String(formData.get("categoria")).trim(),
      description: String(formData.get("descricao")).trim(),
      image: String(formData.get("imagem")).trim() || defaultImage,
      x: draft.x,
      y: draft.y,
      status: "pendente",
      rejectReason: ""
    };

    if (editingId) {
      const place = places.find(item => item.id === editingId);
      Object.assign(place, data, { updatedAt: new Date().toISOString() });
    } else {
      places.push({
        id: createId(),
        ...data,
        author: session.name,
        authorId: session.userId,
        createdAt: new Date().toISOString()
      });
    }

    savePlaces(places);
    showMessage(editingId ? "Lugar atualizado e reenviado para aprovação." : "Lugar enviado para aprovação do administrador.");
    resetForm();
    renderMyPlaces();
  });

  cancelButton.addEventListener("click", resetForm);

  myPlaces.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    if (button.dataset.action === "edit") {
      startEdit(button.dataset.id);
      return;
    }

    if (confirm("Deseja excluir este lugar? As avaliações dele também serão apagadas.")) {
      savePlaces(getPlaces().filter(place => place.id !== button.dataset.id));
      saveReviews(getReviews().filter(review => review.placeId !== button.dataset.id));

      if (editingId === button.dataset.id) {
        resetForm();
      }

      renderMap();
      renderMyPlaces();
      showMessage("Lugar excluído.");
    }
  });

  renderMap();
  renderMyPlaces();
}
