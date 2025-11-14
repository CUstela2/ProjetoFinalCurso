// admin-manutencao.js (corrigido: edição atualiza o card em vez de duplicar)

const modal = document.getElementById("modal");
const confirmModal = document.getElementById("confirm-modal");
const addBtn = document.querySelector(".add-btn");
const cancelBtn = modal.querySelector(".cancel");
const saveBtn = modal.querySelector(".save");
const equipamentoInput = document.getElementById("equipamento");
const descricaoInput = document.getElementById("descricao");
const gravidadeSelect = document.getElementById("gravidade");
const listaAtivas = document.querySelector(".manutencoes-ativas");

let cardParaExcluir = null;
let editCard = null; // referência do card que está sendo editado

// Abre modal para criar nova manutenção
addBtn.addEventListener("click", () => {
  equipamentoInput.value = "";
  descricaoInput.value = "";
  gravidadeSelect.value = "";
  modal.style.display = "flex";
  document.getElementById("modal-titulo").textContent = "Nova Manutenção";
  saveBtn.dataset.editando = "false";
  editCard = null;
});

// Fecha modal
cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
  editCard = null;
  saveBtn.dataset.editando = "false";
});

// Helper: capitalizar
function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Salvar manutenção (nova ou edição)
saveBtn.addEventListener("click", () => {
  const titulo = equipamentoInput.value.trim();
  const desc = descricaoInput.value.trim();
  const gravidade = gravidadeSelect.value;

  if (!titulo || !desc || !gravidade) {
    alert("Preencha todos os campos!");
    return;
  }

  // Classe da tag conforme gravidade
  const gravClass = { baixa: "baixa", media: "media", alta: "alta", urgente: "urgente" }[gravidade] || "media";
  const gravLabel = capitalize(gravidade);

  if (saveBtn.dataset.editando === "true" && editCard) {
    // Atualiza card existente
    editCard.querySelector("h5").textContent = titulo;
    // o primeiro <p> dentro de manutencao-info é a descrição (presumindo estrutura)
    const infoParas = editCard.querySelectorAll(".manutencao-info > p");
    if (infoParas.length > 0) {
      infoParas[0].textContent = desc;
    } else {
      // fallback: criar um <p> se não existir
      const p = document.createElement("p");
      p.textContent = desc;
      editCard.querySelector(".manutencao-info").appendChild(p);
    }

    // Atualiza (ou cria) a tag de gravidade
    const tagsDiv = editCard.querySelector(".tags");
    let gravTag = tagsDiv ? tagsDiv.querySelector(".tag:not(.pendente)") : null;
    if (!gravTag) {
      // cria nova tag antes da tag pendente (se existir) ou adiciona ao final
      gravTag = document.createElement("span");
      gravTag.classList.add("tag");
      if (tagsDiv) {
        const pend = tagsDiv.querySelector(".tag.pendente");
        if (pend) tagsDiv.insertBefore(gravTag, pend);
        else tagsDiv.appendChild(gravTag);
      } else {
        const newTags = document.createElement("div");
        newTags.classList.add("tags");
        newTags.appendChild(gravTag);
        editCard.appendChild(newTags);
      }
    }
    // remove classes de gravidade antigas e aplica a nova
    gravTag.classList.remove("baixa","media","alta","urgente");
    gravTag.classList.add(gravClass);
    gravTag.textContent = gravLabel;

    // limpar estado de edição
    editCard.classList.remove("editando");
    editCard = null;
    saveBtn.dataset.editando = "false";
  } else {
    // Cria nova manutenção
    const card = document.createElement("div");
    card.classList.add("manutencao-card");
    card.innerHTML = `
      <div class="manutencao-info">
        <h5>${titulo}</h5>
        <p>${desc}</p>
        <p class="details">Registrado em ${new Date().toLocaleDateString()}<br>Técnico: A confirmar</p>
      </div>
      <div class="tags">
        <span class="tag ${gravClass}">${gravLabel}</span>
        <span class="tag pendente">Pendente</span>
      </div>
    `;
    listaAtivas.appendChild(card);
    adicionarAcoes(card);
  }

  modal.style.display = "none";
  equipamentoInput.value = "";
  descricaoInput.value = "";
  gravidadeSelect.value = "";
});

// Ações editar / deletar
function adicionarAcoes(card) {
  // evita duplicar actions
  if (card.querySelector(".actions")) return;

  const actions = document.createElement("div");
  actions.classList.add("actions");

  const btnEditar = document.createElement("button");
  btnEditar.classList.add("btn-action", "edit");
  btnEditar.type = "button";
  btnEditar.textContent = "✎";

  const btnDeletar = document.createElement("button");
  btnDeletar.classList.add("btn-action", "delete");
  btnDeletar.type = "button";
  btnDeletar.textContent = "🗑️";

  actions.appendChild(btnEditar);
  actions.appendChild(btnDeletar);
  card.appendChild(actions);

  // EDITAR: preenche modal e define editCard
  btnEditar.addEventListener("click", () => {
    editCard = card;
    card.classList.add("editando");

    equipamentoInput.value = card.querySelector("h5") ? card.querySelector("h5").textContent : "";
    // pega a primeira <p> (descrição)
    const infoPara = card.querySelector(".manutencao-info > p");
    descricaoInput.value = infoPara ? infoPara.textContent : "";

    // detecta gravidade a partir das tags (procura a tag que não é 'pendente')
    const gravTag = card.querySelector(".tags .tag:not(.pendente)");
    if (gravTag) {
      const text = gravTag.textContent.trim().toLowerCase();
      const mapTextToValue = (t) => {
        if (t.includes("baixa")) return "baixa";
        if (t.includes("méd") || t.includes("media") || t.includes("média")) return "media";
        if (t.includes("alta")) return "alta";
        if (t.includes("urg")) return "urgente";
        return "";
      };
      gravidadeSelect.value = mapTextToValue(text) || "";
    } else {
      gravidadeSelect.value = "";
    }

    document.getElementById("modal-titulo").textContent = "Editar Manutenção";
    saveBtn.dataset.editando = "true";
    modal.style.display = "flex";
  });

  // DELETAR: abre modal de confirmação estilizado
  btnDeletar.addEventListener("click", () => {
    cardParaExcluir = card;
    // abre o confirm modal (se existir)
    if (typeof confirmModal !== "undefined" && confirmModal) {
      confirmModal.style.display = "flex";
    } else {
      // fallback para confirm nativo
      if (confirm("Deseja excluir esta manutenção?")) card.remove();
    }
  });
}

// Configurações do modal de confirmação (caso exista)
if (typeof confirmModal !== "undefined" && confirmModal) {
  const cancelDeleteBtn = confirmModal.querySelector(".cancel");
  const confirmDeleteBtn = confirmModal.querySelector(".delete-confirm");

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      confirmModal.style.display = "none";
      cardParaExcluir = null;
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (cardParaExcluir) {
        cardParaExcluir.remove();
        cardParaExcluir = null;
      }
      confirmModal.style.display = "none";
    });
  }
}

// Inicial: adiciona ações aos cards já existentes
document.querySelectorAll(".manutencao-card").forEach(adicionarAcoes);

// Fechar modais clicando fora (opcional)
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    editCard = null;
    saveBtn.dataset.editando = "false";
  }
  if (typeof confirmModal !== "undefined" && e.target === confirmModal) {
    confirmModal.style.display = "none";
    cardParaExcluir = null;
  }
});
