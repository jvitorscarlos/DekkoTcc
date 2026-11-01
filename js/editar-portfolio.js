
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formEditarPortfolio");
    const grade = document.getElementById("gradePortfolio");
    const contador = document.getElementById("pfContagem");
    const mensagem = document.getElementById("pfMensagem");
    const barra = document.getElementById("pfBarra");
    const erro = document.getElementById("pfErro");
    const botaoSalvar = document.getElementById("btnSalvarPortfolio");

    if (!formulario || !grade) return;

    const MIN_FOTOS = 3;
    const MAX_FOTOS = 6;
    const TAMANHO_MAXIMO = 5 * 1024 * 1024;

    const fotos = Array(MAX_FOTOS).fill(null);

    function mostrarErro(texto) {
        erro.textContent = texto;
        erro.style.display = texto ? "block" : "none";
    }

    function caminhoFoto(caminho) {
        if (!caminho) return "";

        if (caminho.startsWith("http")) {
            return caminho;
        }

        return "../" + caminho.replace(/^\/+/, "");
    }

    function atualizarInterface() {
        const quantidade = fotos.filter(foto => foto !== null).length;

        contador.innerHTML = `
            ${quantidade}/6 fotos
            <small>fotos adicionadas</small>
        `;

        barra.style.width = `${(quantidade / MAX_FOTOS) * 100}%`;

        mensagem.textContent = quantidade < MIN_FOTOS
            ? `Adicione mais ${MIN_FOTOS - quantidade} foto(s).`
            : "Você já pode salvar seu portfólio.";

        botaoSalvar.disabled = quantidade < MIN_FOTOS;
    }

    function renderizarSlot(indice) {
        const foto = fotos[indice];

        const slot = document.createElement("label");
        slot.className = "slot-foto";
        slot.htmlFor = `foto${indice + 1}`;
        slot.dataset.numero = indice + 1;

        const numero = document.createElement("span");
        numero.className = "pf-numero";
        numero.textContent = indice + 1;

        const conteudo = document.createElement("div");
        conteudo.className = "slot-conteudo";

        if (foto) {
            const imagem = document.createElement("img");

            imagem.src = foto.arquivo
                ? foto.previewUrl
                : caminhoFoto(foto.caminho);

            imagem.alt = `Foto ${indice + 1}`;
            imagem.style.width = "100%";
            imagem.style.height = "100%";
            imagem.style.objectFit = "cover";

            conteudo.appendChild(imagem);
            slot.classList.add("com-foto");
        } else {
            conteudo.innerHTML = `
                <span class="icone-foto">+</span>
                <strong>Foto ${indice + 1}</strong>
                <small>Clique para escolher</small>
            `;
        }

        const trocar = document.createElement("span");
        trocar.className = "pf-trocar";
        trocar.textContent = "Clique para trocar";
        trocar.style.display = foto ? "block" : "none";

        const remover = document.createElement("button");
        remover.className = "pf-remover";
        remover.type = "button";
        remover.textContent = "×";
        remover.setAttribute("aria-label", `Remover foto ${indice + 1}`);
        remover.style.display = foto ? "block" : "none";

        remover.addEventListener("click", evento => {
            evento.preventDefault();
            evento.stopPropagation();

            if (fotos[indice]?.previewUrl) {
                URL.revokeObjectURL(fotos[indice].previewUrl);
            }

            fotos[indice] = null;

            mostrarErro("");
            atualizarTela();
        });

        const input = document.createElement("input");
        input.type = "file";
        input.id = `foto${indice + 1}`;
        input.name = "portfolio_novas[]";
        input.accept = "image/*";

        input.addEventListener("change", () => {
            mostrarErro("");

            const arquivo = input.files[0];

            if (!arquivo) return;

            if (!arquivo.type.startsWith("image/")) {
                mostrarErro("Selecione um arquivo de imagem.");
                input.value = "";
                return;
            }

            if (arquivo.size > TAMANHO_MAXIMO) {
                mostrarErro("Cada imagem deve ter no máximo 5 MB.");
                input.value = "";
                return;
            }

            if (fotos[indice]?.previewUrl) {
                URL.revokeObjectURL(fotos[indice].previewUrl);
            }

            fotos[indice] = {
                id: null,
                caminho: null,
                arquivo: arquivo,
                previewUrl: URL.createObjectURL(arquivo)
            };

            atualizarTela();
        });

        slot.appendChild(numero);
        slot.appendChild(conteudo);
        slot.appendChild(trocar);
        slot.appendChild(remover);
        slot.appendChild(input);

        grade.appendChild(slot);
    }

    function atualizarTela() {
        grade.innerHTML = "";

        for (let i = 0; i < MAX_FOTOS; i++) {
            renderizarSlot(i);
        }

        atualizarInterface();
    }

    async function carregarFotos() {
        contador.innerHTML = `
            Carregando...
            <small>fotos adicionadas</small>
        `;

        try {
            const resposta = await fetch(
                "../routes/portfolio.php?acao=listar",
                {
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível consultar suas fotos.");
            }

            const dados = await resposta.json();

            if (!dados.sucesso) {
                throw new Error(
                    dados.mensagem || "Não foi possível carregar as fotos."
                );
            }

            fotos.fill(null);

            if (Array.isArray(dados.fotos)) {
                dados.fotos.slice(0, MAX_FOTOS).forEach((foto, indice) => {
                    fotos[indice] = {
                        id: foto.id_portfolio,
                        caminho: foto.foto,
                        arquivo: null,
                        previewUrl: null
                    };
                });
            }

            mostrarErro("");
            atualizarTela();

        } catch (e) {
            console.error("Erro ao carregar fotos:", e);

            atualizarTela();

            mostrarErro(
                "Não foi possível carregar as fotos cadastradas. " +
                "Verifique sua conexão e tente novamente."
            );
        }
    }

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();
        mostrarErro("");

        const quantidade = fotos.filter(foto => foto !== null).length;

        if (quantidade < MIN_FOTOS || quantidade > MAX_FOTOS) {
            mostrarErro("Adicione entre 3 e 6 fotos.");
            return;
        }

        const dados = new FormData();

        fotos.forEach(foto => {
            if (!foto) return;

            if (foto.id !== null) {
                dados.append("fotos_mantidas[]", foto.id);
            }

            if (foto.arquivo) {
                dados.append("portfolio_novas[]", foto.arquivo);
            }
        });

        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Salvando...";

        try {
            const resposta = await fetch(
                "../routes/portfolio.php?acao=atualizar",
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

            alert(resultado.mensagem || "Portfólio atualizado com sucesso!");

            fotos.forEach(foto => {
                if (foto?.previewUrl) {
                    URL.revokeObjectURL(foto.previewUrl);
                }
            });

            await carregarFotos();

        } catch (e) {
            console.error("Erro ao salvar:", e);
            mostrarErro(e.message);

        } finally {
            botaoSalvar.textContent = "Salvar alterações";
            atualizarInterface();
        }
    });

    // Primeiro mostra os seis espaços.
    atualizarTela();

    // Depois carrega as fotos cadastradas.
    carregarFotos();
});
