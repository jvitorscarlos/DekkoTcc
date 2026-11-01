
document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formPortfolio");
    const grade = document.getElementById("gradePortfolio");
    const contador = document.getElementById("pfContagem");
    const mensagem = document.getElementById("pfMensagem");
    const barra = document.getElementById("pfBarra");
    const erro = document.getElementById("pfErro");
    const botaoEnviar = document.getElementById("btnFinalizar");

    if (!formulario || !grade) return;

    const slots = Array.from(grade.querySelectorAll(".slot-foto"));
    const arquivosSelecionados = new Map();

    function atualizarInterface() {
        const quantidade = arquivosSelecionados.size;

        if (contador) {
            contador.textContent = `${quantidade}/6 fotos`;
        }

        if (barra) {
            barra.style.width = `${(quantidade / 6) * 100}%`;
        }

        if (mensagem) {
            mensagem.textContent =
                quantidade < 3
                    ? `Adicione mais ${3 - quantidade} foto(s).`
                    : "Você já pode salvar seu portfólio.";
        }

        if (botaoEnviar) {
            botaoEnviar.disabled = quantidade < 3 || quantidade > 6;
        }
    }

    function mostrarErro(texto) {
        if (erro) {
            erro.textContent = texto;
            erro.style.display = "block";
        }
    }

    function limparErro() {
        if (erro) {
            erro.textContent = "";
            erro.style.display = "none";
        }
    }

    function atualizarSlot(slot, arquivo) {
        const conteudo = slot.querySelector(".slot-conteudo");

        if (!conteudo) return;

        const imagem = document.createElement("img");
        imagem.src = URL.createObjectURL(arquivo);
        imagem.alt = "Prévia da foto do portfólio";
        imagem.style.width = "100%";
        imagem.style.height = "100%";
        imagem.style.objectFit = "cover";

        conteudo.replaceChildren(imagem);
        slot.classList.add("com-foto");

        const trocar = slot.querySelector(".pf-trocar");
        if (trocar) trocar.style.display = "block";
    }

    function limparSlot(slot) {
        const conteudo = slot.querySelector(".slot-conteudo");
        const input = slot.querySelector('input[type="file"]');

        if (conteudo) {
            conteudo.innerHTML = "";
        }

        if (input) {
            input.value = "";
        }

        slot.classList.remove("com-foto");

        const trocar = slot.querySelector(".pf-trocar");
        if (trocar) trocar.style.display = "none";
    }

    slots.forEach(function (slot, indice) {
        const input = slot.querySelector('input[type="file"]');
        const remover = slot.querySelector(".pf-remover");

        if (!input) return;

        input.addEventListener("change", function () {
            limparErro();

            const arquivo = input.files[0];

            if (!arquivo) return;

            if (!arquivo.type.startsWith("image/")) {
                mostrarErro("Selecione um arquivo de imagem.");
                input.value = "";
                return;
            }

            if (arquivo.size > 5 * 1024 * 1024) {
                mostrarErro("Cada imagem deve ter no máximo 5 MB.");
                input.value = "";
                return;
            }

            arquivosSelecionados.set(indice, arquivo);
            atualizarSlot(slot, arquivo);
            atualizarInterface();
        });

        if (remover) {
            remover.addEventListener("click", function (evento) {
                evento.preventDefault();
                evento.stopPropagation();

                arquivosSelecionados.delete(indice);
                limparSlot(slot);
                limparErro();
                atualizarInterface();
            });
        }
    });

    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        limparErro();

        const quantidade = arquivosSelecionados.size;

        if (quantidade < 3 || quantidade > 6) {
            mostrarErro("Adicione entre 3 e 6 fotos.");
            return;
        }

        const dados = new FormData();

        arquivosSelecionados.forEach(function (arquivo) {
            dados.append("portfolio[]", arquivo);
        });

        botaoEnviar.disabled = true;
        botaoEnviar.textContent = "Salvando...";

        try {
            const resposta = await fetch(
                "../routes/portfolio.php?acao=adicionar",
                {
                    method: "POST",
                    body: dados
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(
                    resultado.mensagem || "Não foi possível salvar as fotos."
                );
            }

            alert(resultado.mensagem || "Portfólio salvo com sucesso!");

            window.location.reload();

        } catch (erroEnvio) {
            mostrarErro(erroEnvio.message);
            botaoEnviar.disabled = false;
            botaoEnviar.textContent = "Finalizar";
        }
    });

    atualizarInterface();
});
