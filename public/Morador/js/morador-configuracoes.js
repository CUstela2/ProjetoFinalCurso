// ============ PERFIL ============
const btnSalvar = document.querySelector(".btn-primary");
const inputs = document.querySelectorAll(".form-group input");
const btnAlterarFoto = document.querySelector(".btn-small");

// Permitir edição dos campos
inputs.forEach(input => {
  input.addEventListener("dblclick", () => {
    input.disabled = false;
    input.classList.add("editavel");
  });
});

// Salvar alterações
btnSalvar.addEventListener("click", () => {
  const dados = {};
  inputs.forEach(input => {
    input.disabled = true;
    input.classList.remove("editavel");
    dados[input.previousElementSibling.innerText] = input.value;
  });
  localStorage.setItem("perfilMorador", JSON.stringify(dados));
  alert("Alterações salvas com sucesso!");
});

// Alterar foto (simulação)
btnAlterarFoto.addEventListener("click", () => {
  const novaFoto = prompt("Digite o link da nova foto de perfil:");
  if (novaFoto) {
    document.querySelector(".avatar").style.backgroundImage = `url(${novaFoto})`;
    document.querySelector(".avatar").style.backgroundSize = "cover";
    document.querySelector(".avatar").textContent = "";
    alert("Foto atualizada!");
  }
});

// ============ SEGURANÇA ============
const btnAlterarSenha = document.querySelector(".btn-outline");
btnAlterarSenha.addEventListener("click", () => {
  const novaSenha = prompt("Digite sua nova senha:");
  if (novaSenha && novaSenha.length >= 6) {
    localStorage.setItem("senhaMorador", novaSenha);
    alert("Senha alterada com sucesso!");
  } else if (novaSenha) {
    alert("A senha deve ter pelo menos 6 caracteres.");
  }
});

// ============ NOTIFICAÇÕES ============
const switches = document.querySelectorAll(".notification-item input[type='checkbox']");

switches.forEach(sw => {
  // Restaurar estado salvo
  const id = sw.parentElement.previousElementSibling?.innerText?.trim() || Math.random();
  const saved = localStorage.getItem(`notif-${id}`);
  if (saved !== null) sw.checked = saved === "true";

  // Atualizar quando mudar
  sw.addEventListener("change", () => {
    localStorage.setItem(`notif-${id}`, sw.checked);
  });
});

// ============ LOGOUT ============
const btnLogout = document.querySelector(".logout");
btnLogout.addEventListener("click", () => {
  const sair = confirm("Deseja realmente sair do CondoApp?");
  if (sair) {
    localStorage.clear();
    window.location.href = "login.html"; // redireciona para tela de login
  }
});
