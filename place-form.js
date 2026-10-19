"use strict";

function placeFormTemplate() {
  return `
    <div class="form-grid">
      <div class="form-field">
        <label for="nome">Nome do lugar</label>
        <input id="nome" name="nome" type="text" maxlength="60" placeholder="Ex.: Mercado de Artesanato" required>
      </div>
      <div class="form-field">
        <label for="tipo">Categoria</label>
        <select id="tipo" name="tipo" required>${optionsFrom(placeTypes)}</select>
      </div>
      <div class="form-field">
        <label for="regiao">Região</label>
        <select id="regiao" name="regiao" required>${optionsFrom(regions)}</select>
      </div>
      <div class="form-field">
        <label for="destaque">Destaque</label>
        <input id="destaque" name="destaque" type="text" maxlength="40" placeholder="Ex.: Cartão-postal" required>
      </div>
      <div class="form-field">
        <label for="custo">Custo de visitação</label>
        <select id="custo" name="custo">${optionsFrom(costNames, "nao-informado")}</select>
      </div>
      <div class="form-field">
        <label for="valor">Valor da entrada</label>
        <input id="valor" name="valor" type="text" maxlength="60" placeholder="Ex.: R$ 10,00 por pessoa">
      </div>
      <div class="form-field">
        <label for="acessibilidade">Acessibilidade</label>
        <select id="acessibilidade" name="acessibilidade">${optionsFrom(accessibilityNames, "nao-informado")}</select>
      </div>
      <div class="form-field">
        <label for="horario">Horário de funcionamento</label>
        <input id="horario" name="horario" type="text" maxlength="60" placeholder="Ex.: Ter. a dom., 9h às 17h">
      </div>
    </div>
    <div class="form-field">
      <label for="info-acessibilidade">Detalhes de acessibilidade</label>
      <input id="info-acessibilidade" name="info-acessibilidade" type="text" maxlength="120" placeholder="Ex.: rampas, banheiro adaptado, piso tátil">
    </div>
    <div class="form-field">
      <label for="descricao">História e contexto cultural</label>
      <textarea id="descricao" name="descricao" rows="5" maxlength="600" placeholder="Conte a história do lugar e o que o turista vai encontrar" required></textarea>
    </div>
    <div class="form-field">
      <label for="foto">Foto principal (opcional)</label>
      <input id="foto" name="foto" type="file" accept="image/*">
      <img class="image-preview" alt="Prévia da foto principal" hidden>
    </div>
    <div class="form-actions">
      <button class="button primary place-submit" type="submit"></button>
      <button class="button outline place-cancel" type="button" hidden>Cancelar</button>
    </div>
  `;
}

function createPlaceForm({ form, map, mapHint, title, texts, getMapPlaces, onSubmit, onCancel = null }) {
  form.innerHTML = placeFormTemplate();

  const fields = form.elements;
  const submitButton = form.querySelector(".place-submit");
  const cancelButton = form.querySelector(".place-cancel");
  const preview = form.querySelector(".image-preview");

  let editingId = "";
  let draft = null;
  let image = "";

  function renderMap() {
    renderMapPins(map, getMapPlaces(editingId), { draft });

    mapHint.innerHTML = draft
      ? "<strong>Local marcado!</strong> Clique em outro ponto do mapa para ajustar."
      : "Clique no mapa para marcar onde fica o lugar.";
  }

  function updatePreview() {
    preview.hidden = !image;
    preview.src = image;
  }

  function togglePrice() {
    const paid = fields.namedItem("custo").value === "pago";
    fields.namedItem("valor").disabled = !paid;

    if (!paid) {
      fields.namedItem("valor").value = "";
    }
  }

  function reset() {
    form.reset();
    editingId = "";
    draft = null;
    image = "";
    title.textContent = texts.createTitle;
    submitButton.textContent = texts.create;
    cancelButton.hidden = !onCancel;
    updatePreview();
    togglePrice();
    renderMap();
  }

  function edit(place) {
    editingId = place.id;
    draft = { x: place.x, y: place.y };
    image = place.image;

    fields.namedItem("nome").value = place.name;
    fields.namedItem("tipo").value = place.type;
    fields.namedItem("regiao").value = place.region;
    fields.namedItem("destaque").value = place.category;
    fields.namedItem("custo").value = place.cost;
    fields.namedItem("acessibilidade").value = place.accessibility;
    fields.namedItem("info-acessibilidade").value = place.accessibilityInfo;
    fields.namedItem("horario").value = place.hours;
    fields.namedItem("descricao").value = place.description;
    fields.namedItem("foto").value = "";
    togglePrice();
    fields.namedItem("valor").value = place.price;

    title.textContent = `Editando: ${place.name}`;
    submitButton.textContent = texts.edit;
    cancelButton.hidden = false;
    updatePreview();
    renderMap();
  }

  map.addEventListener("click", event => {
    draft = getMapPoint(map, event);
    renderMap();
  });

  fields.namedItem("custo").addEventListener("change", togglePrice);

  fields.namedItem("foto").addEventListener("change", async event => {
    const [file] = event.target.files;

    if (!file) {
      return;
    }

    try {
      image = await readImage(file);
      updatePreview();
    } catch {
      event.target.value = "";
      showMessage("Não foi possível ler esta imagem.");
    }
  });

  cancelButton.addEventListener("click", () => {
    reset();
    onCancel?.();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!draft) {
      showMessage("Marque o local no mapa antes de salvar.");
      return;
    }

    const cost = fields.namedItem("custo").value;

    const data = {
      name: fields.namedItem("nome").value.trim(),
      type: fields.namedItem("tipo").value,
      region: fields.namedItem("regiao").value,
      category: fields.namedItem("destaque").value.trim(),
      cost,
      price: cost === "pago" ? fields.namedItem("valor").value.trim() : "",
      accessibility: fields.namedItem("acessibilidade").value,
      accessibilityInfo: fields.namedItem("info-acessibilidade").value.trim(),
      hours: fields.namedItem("horario").value.trim(),
      description: fields.namedItem("descricao").value.trim(),
      image: image || defaultImage,
      x: draft.x,
      y: draft.y
    };

    if (onSubmit(data, editingId) !== false) {
      reset();
    }
  });

  reset();

  return { edit, reset, renderMap };
}
