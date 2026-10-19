"use strict";

const routeItems = document.querySelectorAll(".route-item");
const routeImage = document.querySelector("#route-image");
const routeTitle = document.querySelector("#route-title");
const routeText = document.querySelector("#route-text");

routeItems.forEach(item => {
  item.addEventListener("click", () => {
    routeItems.forEach(button => button.classList.remove("active"));
    item.classList.add("active");

    if (routeImage && routeTitle && routeText) {
      routeImage.src = item.dataset.image;
      routeImage.alt = item.dataset.title;
      routeTitle.textContent = item.dataset.title;
      routeText.textContent = item.dataset.text;
    }
  });
});

const profileButtons = document.querySelectorAll(".profile-button");
const loginBox = document.querySelector("#login-box");
const loginTitle = document.querySelector("#login-title");
const loginFields = document.querySelector("#login-fields");
const loginForm = document.querySelector("#login-form");
const closeLogin = document.querySelector("#close-login");

let selectedProfile = "";

const activeSession = getActiveUser();
const accessLink = document.querySelector('.primary-nav a[href="#acesso"]');

if (activeSession && accessLink) {
  accessLink.textContent = "Meu painel";
  accessLink.href = panelPages[activeSession.role];
}

const loginData = {
  turista: {
    title: "Login do Turista",
    fields: [
      { label: "E-mail", type: "email", name: "email", placeholder: "seuemail@email.com" },
      { label: "Senha", type: "password", name: "senha", placeholder: "Digite sua senha" }
    ]
  },

  guia: {
    title: "Login do Guia Turístico",
    fields: [
      { label: "E-mail", type: "email", name: "email", placeholder: "seuemail@email.com" },
      { label: "Senha", type: "password", name: "senha", placeholder: "Digite sua senha" },
      { label: "Cadastro do Guia", type: "text", name: "cadastro", placeholder: "Digite seu cadastro" }
    ]
  },

  admin: {
    title: "Login do Administrador",
    fields: [
      { label: "Usuário", type: "text", name: "usuario", placeholder: "Digite seu usuário" },
      { label: "Senha", type: "password", name: "senha", placeholder: "Digite sua senha" },
      { label: "Código administrativo", type: "text", name: "codigo", placeholder: "Digite o código" }
    ]
  }
};

profileButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedProfile = button.dataset.profile;
    const profile = loginData[selectedProfile];

    loginTitle.textContent = profile.title;

    loginFields.innerHTML = profile.fields.map(field => `
      <div class="login-field">
        <label for="${field.name}">${field.label}</label>
        <input
          id="${field.name}"
          name="${field.name}"
          type="${field.type}"
          placeholder="${field.placeholder}"
          required
        >
      </div>
    `).join("");

    loginBox.classList.add("active");
    loginBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

closeLogin.addEventListener("click", () => {
  loginBox.classList.remove("active");
  loginForm.reset();
});

loginForm.addEventListener("submit", event => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const identifier = String(formData.get("email") ?? formData.get("usuario")).trim().toLowerCase();
  const users = getUsers();
  let user = users.find(item => item.identifier === identifier && item.role === selectedProfile);

  if (user?.blocked) {
    alert("Este usuário foi bloqueado pelo administrador.");
    return;
  }

  if (!user) {
    user = {
      id: createId(),
      identifier,
      role: selectedProfile,
      name: identifier.split("@")[0],
      blocked: false,
      createdAt: new Date().toISOString()
    };
    users.push(user);
  }

  if (selectedProfile === "guia") {
    user.certificate = String(formData.get("cadastro")).trim();
  }

  user.lastLogin = new Date().toISOString();
  saveUsers(users);
  saveSession({ userId: user.id, role: user.role, name: user.name });

  window.location.href = panelPages[selectedProfile];
});
