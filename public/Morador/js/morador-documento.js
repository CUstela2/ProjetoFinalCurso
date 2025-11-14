// ===== LOGOUT =====
const btnLogout = document.querySelector(".logout");
btnLogout.addEventListener("click", () => {
  const sair = confirm("Deseja realmente sair do CondoApp?");
  if (sair) {
    localStorage.clear();
    window.location.href = "login.html"; // simula logout
  }
});

// ===== DOWNLOAD DE DOCUMENTOS =====
const botoesDownload = document.querySelectorAll(".download");

botoesDownload.forEach(btn => {
  btn.addEventListener("click", () => {
    const nomeDoc = btn.previousElementSibling.querySelector("p").textContent;
    alert(`Iniciando download de: ${nomeDoc}`);
    // Simulação: Em sistema real seria algo como window.location.href = "docs/" + nomeDoc + ".pdf"
  });
});

// ===== VOTAÇÕES =====
const botoesVotar = document.querySelectorAll(".btn-votar");

botoesVotar.forEach(btn => {
  btn.addEventListener("click", () => {
    const titulo = btn.closest(".votacao").querySelector(".titulo").textContent;
    const voto = prompt(`Você está votando em: "${titulo}"\nDigite "Aprovar", "Rejeitar" ou "Abster":`);
    if (!voto) return;

    const votoNormalizado = voto.trim().toLowerCase();
    if (["aprovar", "rejeitar", "abster"].includes(votoNormalizado)) {
      localStorage.setItem(`voto-${titulo}`, votoNormalizado);
      alert(`Voto "${votoNormalizado}" registrado com sucesso!`);
      btn.textContent = "Votado ✅";
      btn.disabled = true;
      btn.style.background = "#9e9e9e";
    } else {
      alert("Opção inválida. Digite exatamente: Aprovar, Rejeitar ou Abster.");
    }
  });
});

// ===== RECUPERAR VOTOS SALVOS =====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".votacao.ativa").forEach(v => {
    const titulo = v.querySelector(".titulo").textContent;
    const votoSalvo = localStorage.getItem(`voto-${titulo}`);
    const botao = v.querySelector(".btn-votar");
    if (votoSalvo) {
      botao.textContent = "Votado ✅";
      botao.disabled = true;
      botao.style.background = "#9e9e9e";
    }
  });
});
