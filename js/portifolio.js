(function () {
  const MINIMO = 3;
  const MAXIMO = 6;
  const TAMANHO_MAX_MB = 5;

  const formulario = document.getElementById("formPortfolio");

  if (!formulario) return;

  const slots = document.querySelectorAll(".slot-foto");

  const contador = document.getElementById("pfContagem");
  const mensagem = document.getElementById("pfMensagem");
  const barra = document.getElementById("pfBarra");
  const caixaErro = document.getElementById("pfErro");
  const botaoFinalizar = document.getElementById("btnFinalizar");

  function mostrarErro(texto) {
    if (!caixaErro) return;

    caixaErro.textContent = texto;
    caixaErro.classList.add("visivel");

    setTimeout(function () {
      caixaErro.classList.remove("visivel");
    }, 4000);
  }

  function contarFotos() {
    let total = 0;

    slots.forEach(function (slot) {
      const input = slot.querySelector("input[type='file']");

      if (input && input.files.length > 0) {
        total++;
      }
    });

    return total;
  }

  function atualizarProgresso() {
    const total = contarFotos();

    if (contador) {
      contador.textContent = total + "/" + MAXIMO;
    }

    if (barra) {
      const porcentagem = (total / MAXIMO) * 100;
      barra.style.width = porcentagem + "%";
    }

    if (mensagem) {
      if (total === 0) {
        mensagem.textContent = "Adicione pelo menos 3 fotos.";
      } else if (total < MINIMO) {
        mensagem.textContent =
          "Adicione mais " + (MINIMO - total) + " foto(s).";
      } else {
        mensagem.textContent = "Tudo certo! Você pode finalizar.";
      }
    }

    if (botaoFinalizar) {
      botaoFinalizar.disabled = total < MINIMO;
    }
  }

  function preencherSlot(slot, arquivo) {
    const input = slot.querySelector("input[type='file']");

    if (!arquivo || !arquivo.type.startsWith("image/")) {
      mostrarErro("Selecione apenas imagens.");
      return;
    }

    const tamanhoMB = arquivo.size / (1024 * 1024);

    if (tamanhoMB > TAMANHO_MAX_MB) {
      mostrarErro("A imagem deve ter no máximo 5 MB.");
      input.value = "";
      return;
    }

    const leitor = new FileReader();

    leitor.onload = function (evento) {
      // Remove prévia anterior
      const imagemAntiga = slot.querySelector(".preview-foto");

      if (imagemAntiga) {
        imagemAntiga.remove();
      }

      // Cria nova imagem
      const imagem = document.createElement("img");

      imagem.src = evento.target.result;
      imagem.className = "preview-foto";

      slot.appendChild(imagem);

      // Cria botão de lixeira
      let botaoRemover = slot.querySelector(".btn-remover-foto");

      if (!botaoRemover) {
        botaoRemover = document.createElement("button");

        botaoRemover.type = "button";
        botaoRemover.className = "btn-remover-foto";
        botaoRemover.style.display = "block";
        botaoRemover.style.position = "absolute";
        botaoRemover.style.top = "8px";
        botaoRemover.style.right = "8px";
        botaoRemover.style.zIndex = "999";
        botaoRemover.style.cursor = "pointer";
        botaoRemover.innerHTML = "×";
        botaoRemover.title = "Remover foto";

        botaoRemover.style.width = "28px";
        botaoRemover.style.height = "28px";
        botaoRemover.style.border = "none";
        botaoRemover.style.borderRadius = "50%";
        botaoRemover.style.background = "rgba(0, 0, 0, 0.7)";
        botaoRemover.style.color = "white";
        botaoRemover.style.fontSize = "20px";
        botaoRemover.style.fontWeight = "bold";
        botaoRemover.style.lineHeight = "28px";
        botaoRemover.style.padding = "0";

        botaoRemover.addEventListener("click", function (evento) {
          evento.preventDefault();
          evento.stopPropagation();

          limparSlot(slot);
        });

        slot.appendChild(botaoRemover);
      }

      slot.classList.add("preenchido");

      atualizarProgresso();
    };

    leitor.readAsDataURL(arquivo);
  }

  function limparSlot(slot) {
    const input = slot.querySelector("input[type='file']");
    const imagem = slot.querySelector(".preview-foto");
    const botaoRemover = slot.querySelector(".btn-remover-foto");

    if (input) {
      input.value = "";
    }

    if (imagem) {
      imagem.remove();
    }

    if (botaoRemover) {
      botaoRemover.remove();
    }

    slot.classList.remove("preenchido");

    atualizarProgresso();
  }

  slots.forEach(function (slot) {
    const input = slot.querySelector("input[type='file']");

    if (!input) return;

    input.addEventListener("change", function () {
      if (input.files.length === 0) {
        return;
      }

      preencherSlot(slot, input.files[0]);
    });
  });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const total = contarFotos();

    if (total < MINIMO) {
      mostrarErro("Você precisa adicionar pelo menos " + MINIMO + " fotos.");

      return;
    }

    const caixaSucesso = document.getElementById("pfSucesso");

    if (caixaSucesso) {
      caixaSucesso.classList.add("visivel");
    }

    setTimeout(function () {
      window.location.href = "perfil.html";
    }, 1500);
  });

  atualizarProgresso();
})();
