"use strict";

const session = requireRole("guia");

const myPlaces = document.querySelector("#my-places");
const tourForm = document.querySelector("#tour-form");
const tourTitle = document.querySelector("#tour-title");
const tourPlaces = document.querySelector("#tour-places");
const tourSubmit = document.querySelector("#tour-submit");
const tourCancel = document.querySelector("#tour-cancel");
const myTours = document.querySelector("#my-tours");

let placeForm = null;
let editingTourId = "";

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
        <small>${placeTypes[place.type]} · ${regions[place.region]} · ${costNames[place.cost]}</small>
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

function renderTourPlaces(selectedIds = []) {
  const places = getPlaces().filter(place => place.status === "aprovado");

  tourPlaces.innerHTML = places.map(place => `
    <label class="check-item">
      <input type="checkbox" name="pontos" value="${place.id}" ${selectedIds.includes(place.id) ? "checked" : ""}>
      ${escapeHTML(place.name)}
    </label>
  `).join("");
}

function renderMyTours() {
  const tours = getTours().filter(tour => tour.guideId === session.userId);
  const places = getPlaces();

  myTours.innerHTML = tours.length
    ? tours.map(tour => renderTourCard(tour, places, {
      actions: `
        <div class="table-actions">
          <button class="button outline small" type="button" data-tour-action="edit" data-id="${tour.id}">Editar</button>
          <button class="button danger small" type="button" data-tour-action="delete" data-id="${tour.id}">Excluir</button>
        </div>
      `
    })).join("")
    : `<p class="empty">Você ainda não divulgou nenhum passeio.</p>`;
}

function resetTourForm() {
  tourForm.reset();
  editingTourId = "";
  tourTitle.textContent = "Divulgar novo passeio";
  tourSubmit.textContent = "Divulgar passeio";
  tourCancel.hidden = true;
  renderTourPlaces();
}

function editTour(id) {
  const tour = getTours().find(item => item.id === id);
  const fields = tourForm.elements;

  editingTourId = id;
  fields.namedItem("nome").value = tour.name;
  fields.namedItem("duracao").value = tour.duration;
  fields.namedItem("preco").value = tour.price;
  fields.namedItem("data").value = tour.dateTime;
  fields.namedItem("vagas").value = tour.capacity;
  fields.namedItem("contato").value = tour.contact;
  fields.namedItem("descricao").value = tour.description;
  renderTourPlaces(tour.placeIds);

  tourTitle.textContent = `Editando: ${tour.name}`;
  tourSubmit.textContent = "Salvar passeio";
  tourCancel.hidden = false;
  document.querySelector("#passeios").scrollIntoView({ behavior: "smooth" });
}

if (session) {
  document.querySelector("#user-name").textContent = session.name;

  placeForm = createPlaceForm({
    form: document.querySelector("#place-form"),
    map: document.querySelector("#map"),
    mapHint: document.querySelector("#map-hint"),
    title: document.querySelector("#form-title"),
    texts: { createTitle: "Cadastrar novo lugar", create: "Enviar para aprovação", edit: "Salvar e reenviar" },
    getMapPlaces: editingId => getPlaces().filter(place =>
      place.id !== editingId && (place.status === "aprovado" || place.authorId === session.userId)
    ),
    onSubmit: (data, editingId) => {
      const places = getPlaces();

      if (editingId) {
        const place = places.find(item => item.id === editingId);
        Object.assign(place, data, { status: "pendente", rejectReason: "", updatedAt: new Date().toISOString() });
      } else {
        places.push({
          id: createId(),
          ...data,
          status: "pendente",
          rejectReason: "",
          author: session.name,
          authorId: session.userId,
          createdAt: new Date().toISOString()
        });
      }

      if (!savePlaces(places)) {
        return false;
      }

      showMessage(editingId ? "Lugar atualizado e reenviado para aprovação." : "Lugar enviado para aprovação do administrador.");
      renderMyPlaces();
      return true;
    }
  });

  myPlaces.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    if (button.dataset.action === "edit") {
      placeForm.edit(getPlaces().find(place => place.id === button.dataset.id));
      document.querySelector("#cadastro").scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (confirm("Deseja excluir este lugar? As avaliações, fotos e favoritos dele também serão apagados.")) {
      deletePlace(button.dataset.id);
      placeForm.reset();
      renderMyPlaces();
      renderTourPlaces();
      renderMyTours();
      showMessage("Lugar excluído.");
    }
  });

  tourForm.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(tourForm);
    const placeIds = formData.getAll("pontos");

    if (!placeIds.length) {
      showMessage("Escolha pelo menos um ponto turístico para o passeio.");
      return;
    }

    const data = {
      name: String(formData.get("nome")).trim(),
      duration: String(formData.get("duracao")).trim(),
      price: String(formData.get("preco")).trim(),
      dateTime: formData.get("data"),
      capacity: Number(formData.get("vagas")),
      contact: String(formData.get("contato")).trim(),
      description: String(formData.get("descricao")).trim(),
      placeIds
    };

    const tours = getTours();

    if (editingTourId) {
      Object.assign(tours.find(tour => tour.id === editingTourId), data, { updatedAt: new Date().toISOString() });
    } else {
      tours.push({
        id: createId(),
        ...data,
        guideId: session.userId,
        guideName: session.name,
        createdAt: new Date().toISOString()
      });
    }

    if (saveTours(tours)) {
      showMessage(editingTourId ? "Passeio atualizado." : "Passeio divulgado para os turistas!");
      resetTourForm();
      renderMyTours();
    }
  });

  tourCancel.addEventListener("click", resetTourForm);

  myTours.addEventListener("click", event => {
    const button = event.target.closest("[data-tour-action]");

    if (!button) {
      return;
    }

    if (button.dataset.tourAction === "edit") {
      editTour(button.dataset.id);
    } else if (confirm("Deseja excluir este passeio?")) {
      saveTours(getTours().filter(tour => tour.id !== button.dataset.id));

      if (editingTourId === button.dataset.id) {
        resetTourForm();
      }

      renderMyTours();
      showMessage("Passeio excluído.");
    }
  });

  renderMyPlaces();
  resetTourForm();
  renderMyTours();
}
