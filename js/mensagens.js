
(function () {
    let conversaAtual = null;
    let idProfissionalAtual = null;
    let tipoUsuario = null;
    let dadosUsuario = null;
    let assinaturaMensagens = null;
    let confirmacoesAtuais = [];
    let intervaloConversas = null;
    let statusConversaAtual = null;

    const INTERVALO_ATUALIZACAO = 3000;
    const FOTO_PADRAO = "../img/sem-foto.jpg";

    function caminhoFoto(foto) {
        if (!foto) return FOTO_PADRAO;
        foto = String(foto);

        if (
            /^(https?:)?\/\//.test(foto) ||
            foto.indexOf("../") === 0 ||
            foto.charAt(0) === "/"
        ) {
            return foto;
        }

        if (foto.indexOf("/") !== -1) return "../" + foto;
        return "../img/" + foto;
    }

    document.addEventListener("DOMContentLoaded", detectarUsuario);

    function escapar(texto) {
        const div = document.createElement("div");
        div.textContent = texto == null ? "" : String(texto);
        return div.innerHTML;
    }

    function fotoComFallback(img) {
        if (!img) return;

        img.onerror = function () {
            this.onerror = null;
            this.src = FOTO_PADRAO;
        };
    }

    function detectarUsuario() {
        fetch("../routes/profissional.php?acao=meuPerfil")
            .then(r => r.json())
            .then(dados => {
                if (dados.sucesso) {
                    tipoUsuario = "profissional";
                    dadosUsuario = dados.profissional;
                    configurarTela();
                    carregarConversas();

                    if (intervaloConversas) clearInterval(intervaloConversas);

                    intervaloConversas = setInterval(() => {
                        if (!document.hidden) carregarConversasSemReabrir();
                    }, INTERVALO_ATUALIZACAO * 2);

                    return;
                }

                detectarCliente();
            })
            .catch(detectarCliente);
    }

    function detectarCliente() {
        fetch("../routes/cliente.php?acao=meuPerfil")
            .then(r => r.json())
            .then(dados => {
                if (!dados.sucesso) {
                    alert("Você precisa estar logado.");
                    window.location.href = "index.html";
                    return;
                }

                tipoUsuario = "cliente";
                dadosUsuario = dados.cliente;
                configurarTela();
                carregarConversas();

                if (intervaloConversas) clearInterval(intervaloConversas);

                intervaloConversas = setInterval(() => {
                    if (!document.hidden) carregarConversasSemReabrir();
                }, INTERVALO_ATUALIZACAO * 2);
            })
            .catch(erro => console.log("Erro ao descobrir usuário:", erro));
    }

    function configurarTela() {
        const titulo = document.querySelector(".titulo-mensagens h1");
        const descricao = document.querySelector(".titulo-mensagens p");
        const subtituloLista = document.querySelector(".topo-conversas span");
        const textoChat = document.querySelector(".perfil-chat h2");
        const descricaoChat = document.querySelector(".perfil-chat span");
        const ehPro = tipoUsuario === "profissional";

        if (titulo) titulo.innerHTML = "Suas <span>conversas.</span>";

        if (descricao) {
            descricao.textContent = ehPro
                ? "Converse diretamente com os clientes interessados no seu trabalho."
                : "Converse diretamente com os profissionais.";
        }

        if (subtituloLista) {
            subtituloLista.textContent = ehPro
                ? "Seus clientes no Dekko"
                : "Seus profissionais no Dekko";
        }

        if (textoChat) textoChat.textContent = "Selecione uma conversa";

        if (descricaoChat) {
            descricaoChat.textContent = ehPro
                ? "Escolha um cliente para começar"
                : "Escolha um profissional para começar";
        }

        ajustarMenuPorTipo();
        carregarMeuPerfil();
        configurarBotoesChat();
    }

    function configurarBotoesChat() {
        const botaoConfirmar = document.getElementById("btnSolicitarConfirmacao");
        const botaoNovaConversa = document.getElementById("btnNovaConversa");

        if (botaoConfirmar) {
            botaoConfirmar.style.display =
                tipoUsuario === "profissional" ? "inline-flex" : "none";
        }

        // A nova conversa será iniciada pelo botão dentro do card.
        if (botaoNovaConversa) {
            botaoNovaConversa.style.display = "none";
        }
    }

    function ajustarMenuPorTipo() {
        const botaoPerfil = document.querySelector(".btn-perfil-mensagens");
        const botaoVoltar = document.querySelector(".btn-voltar-pesquisa");
        const menu = document.getElementById("menuPerfilMensagens");

        if (tipoUsuario === "profissional") {
            if (botaoPerfil) botaoPerfil.style.display = "flex";
            if (botaoVoltar) botaoVoltar.style.display = "none";
            if (menu) menu.style.display = "";
            return;
        }

        if (tipoUsuario === "cliente") {
            if (botaoPerfil) botaoPerfil.style.display = "none";
            if (botaoVoltar) botaoVoltar.style.display = "block";
            if (menu) menu.classList.remove("aberto");
        }
    }

    window.voltarParaPesquisa = function () {
        window.location.href = "pesquisar.html";
    };

    function carregarMeuPerfil() {
        const url = tipoUsuario === "profissional"
            ? "../routes/profissional.php?acao=meuPerfil"
            : "../routes/cliente.php?acao=meuPerfil";

        fetch(url)
            .then(r => r.json())
            .then(dados => {
                if (!dados.sucesso) return;

                dadosUsuario = tipoUsuario === "profissional"
                    ? dados.profissional
                    : dados.cliente;

                const nomeMenu = document.getElementById("nomePerfilMenu");

                if (nomeMenu) {
                    nomeMenu.textContent = dadosUsuario.nome || "Usuário";
                }

                const botaoPerfil = document.querySelector(".btn-perfil-mensagens");

                if (botaoPerfil && dadosUsuario.foto && tipoUsuario === "profissional") {
                    let fotoPerfil = botaoPerfil.querySelector("img");

                    if (!fotoPerfil) {
                        fotoPerfil = document.createElement("img");
                        fotoPerfil.alt = "Meu perfil";
                        botaoPerfil.innerHTML = "";
                        botaoPerfil.appendChild(fotoPerfil);
                    }

                    const novaFoto = caminhoFoto(dadosUsuario.foto);
                    fotoComFallback(fotoPerfil);

                    if (fotoPerfil.getAttribute("src") !== novaFoto) {
                        fotoPerfil.src = novaFoto;
                    }
                }
            })
            .catch(erro => console.log("Erro ao carregar perfil:", erro));
    }

    function obterUrlConversas() {
        return tipoUsuario === "profissional"
            ? "../routes/conversa.php?acao=minhasProfissional"
            : "../routes/conversa.php?acao=minhasCliente";
    }

    function carregarConversas() {
        fetch(obterUrlConversas())
            .then(r => r.json())
            .then(dados => {
                if (!dados.sucesso) {
                    console.log("Erro ao carregar conversas:", dados.mensagem);
                    return;
                }

                renderizarConversas(dados.conversas || []);
            })
            .catch(erro => console.log("Erro ao carregar conversas:", erro));
    }

    function carregarConversasSemReabrir() {
        fetch(obterUrlConversas())
            .then(r => r.json())
            .then(dados => {
                if (!dados.sucesso) return;

                const conversas = dados.conversas || [];

                atualizarListaConversas(conversas);

                if (conversaAtual) {
                    const conversa = conversas.find(c =>
                        Number(c.id_conversa) === Number(conversaAtual)
                    );

                    if (conversa) {
                        statusConversaAtual = conversa.status;
                        atualizarEstadoCampo(conversa.status);
                        carregarConfirmacoes(conversaAtual);
                    }
                }
            })
            .catch(erro => console.log("Erro ao atualizar conversas:", erro));
    }

    function atualizarListaConversas(conversas) {
        const lista = document.querySelector(".lista-conversas");
        if (!lista) return;

        const ehPro = tipoUsuario === "profissional";

        lista.innerHTML = `
            <div class="topo-conversas">
                <h2>Conversas</h2>
                <span>${ehPro ? "Seus clientes no Dekko" : "Seus profissionais no Dekko"}</span>
            </div>
        `;

        if (!conversas.length) {
            lista.innerHTML += `
                <div style="padding:30px 20px;text-align:center;color:#777">
                    <div style="font-size:35px;margin-bottom:10px">💬</div>
                    <strong>Nenhuma conversa ainda</strong>
                    <p>${ehPro
                        ? "Quando um cliente chamar você, a conversa aparecerá aqui."
                        : "Quando você conversar com um profissional, a conversa aparecerá aqui."}</p>
                </div>`;

            if (!conversaAtual) limparChat();
            return;
        }

        conversas.forEach(conversa => {
            const nome = ehPro
                ? (conversa.cliente_nome || "Cliente")
                : (conversa.profissional_nome || "Profissional");

            const foto = ehPro
                ? (conversa.cliente_foto || "sem-foto.jpg")
                : (conversa.profissional_foto || "sem-foto.jpg");

            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "conversa";

            if (Number(conversa.id_conversa) === Number(conversaAtual)) {
                botao.classList.add("ativa");
            }

            botao.innerHTML = `
                <div class="avatar-conversa">
                    <img src="${escapar(caminhoFoto(foto))}" alt="Foto de ${escapar(nome)}">
                </div>
                <div class="info-conversa">
                    <strong>${escapar(nome)}</strong>
                    <span>${escapar(conversa.ultima_mensagem || "Nenhuma mensagem ainda.")}</span>
                </div>`;

            fotoComFallback(botao.querySelector("img"));

            botao.addEventListener("click", () => {
                document.querySelectorAll(".lista-conversas .conversa")
                    .forEach(item => item.classList.remove("ativa"));

                botao.classList.add("ativa");
                abrirConversa(conversa.id_conversa, conversa);
            });

            lista.appendChild(botao);
        });
    }

    function renderizarConversas(conversas) {
        atualizarListaConversas(conversas);

        if (!conversas.length) {
            limparChat();
            return;
        }

        let conversaParaAbrir = null;

        if (conversaAtual) {
            conversaParaAbrir = conversas.find(c =>
                Number(c.id_conversa) === Number(conversaAtual)
            );
        }

        if (!conversaParaAbrir) {
            const idUrl = new URLSearchParams(window.location.search).get("id_conversa");

            if (idUrl) {
                conversaParaAbrir = conversas.find(c =>
                    Number(c.id_conversa) === Number(idUrl)
                );
            }
        }

        if (!conversaParaAbrir) conversaParaAbrir = conversas[0];

        abrirConversa(conversaParaAbrir.id_conversa, conversaParaAbrir);
    }

    function abrirConversa(idConversa, conversa) {
        if (!idConversa) return;

        const mudouConversa = Number(conversaAtual) !== Number(idConversa);

        conversaAtual = idConversa;
        idProfissionalAtual = conversa.id_profissional || null;
        statusConversaAtual = conversa.status;

        if (mudouConversa) {
            assinaturaMensagens = null;
            confirmacoesAtuais = [];
        }

        atualizarTopoChat(conversa);
        atualizarEstadoCampo(conversa.status);
        carregarMensagens(idConversa);
        carregarConfirmacoes(idConversa);
    }

    function atualizarTopoChat(conversa) {
        const perfilChat = document.querySelector(".perfil-chat");
        if (!perfilChat) return;

        const ehPro = tipoUsuario === "profissional";
        const avatar = perfilChat.querySelector(".avatar-chat");
        const nomeElemento = perfilChat.querySelector("h2");
        const statusElemento = perfilChat.querySelector(":scope > div:not(.avatar-chat) span");

        const nome = ehPro
            ? (conversa.cliente_nome || "Cliente")
            : (conversa.profissional_nome || "Profissional");

        const foto = ehPro
            ? (conversa.cliente_foto || "sem-foto.jpg")
            : (conversa.profissional_foto || "sem-foto.jpg");

        if (nomeElemento) nomeElemento.textContent = nome;

        if (statusElemento) {
            statusElemento.textContent = ehPro
                ? "Cliente"
                : (conversa.profissional_servicos || "Profissional");
        }

        if (avatar) {
            let imagem = avatar.querySelector("img");

            if (!imagem) {
                imagem = document.createElement("img");
                avatar.innerHTML = "";
                avatar.appendChild(imagem);
            }

            fotoComFallback(imagem);
            imagem.alt = "Foto de " + nome;

            const novoSrc = caminhoFoto(foto);

            if (imagem.getAttribute("src") !== novoSrc) {
                imagem.src = novoSrc;
            }
        }
    }

    function atualizarEstadoCampo(statusConversa) {
        statusConversaAtual = statusConversa;

        const input = document.querySelector(".campo-mensagem input");
        const botaoEnviar = document.querySelector(".btn-enviar-mensagem");
        const botaoConfirmar = document.getElementById("btnSolicitarConfirmacao");
        const botaoNovaConversa = document.getElementById("btnNovaConversa");

        const encerrada = statusConversa === "ENCERRADA";

        if (input) {
            input.disabled = encerrada;
            input.placeholder = encerrada
                ? "Esta conversa foi encerrada."
                : "Digite uma mensagem...";
        }

        if (botaoEnviar) botaoEnviar.disabled = encerrada;

        if (botaoConfirmar) {
            botaoConfirmar.disabled = encerrada;
            botaoConfirmar.style.display =
                tipoUsuario === "profissional" ? "inline-flex" : "none";
        }

        // O botão fica dentro do card de confirmação, não no rodapé.
        if (botaoNovaConversa) {
            botaoNovaConversa.style.display = "none";
        }
    }

    function criarNovaConversa() {
        if (
            !conversaAtual ||
            !idProfissionalAtual ||
            tipoUsuario !== "cliente"
        ) {
            alert("Não foi possível identificar o profissional desta conversa.");
            return;
        }

        const dados = new FormData();
        dados.append("id_profissional", idProfissionalAtual);

        const botoesCard = document.querySelectorAll(
            ".btn-nova-conversa-card"
        );

        botoesCard.forEach(botao => {
            botao.disabled = true;
        });

        fetch("../routes/conversa.php?acao=criar", {
            method: "POST",
            body: dados
        })
            .then(async r => {
                const texto = await r.text();

                try {
                    return JSON.parse(texto);
                } catch (erro) {
                    console.error("Resposta recebida do PHP:", texto);
                    throw new Error(
                        "O servidor retornou um erro em vez de JSON. Verifique o PHP da rota conversa.php."
                    );
                }
            })
            .then(resp => {
                if (!resp.sucesso || !resp.id_conversa) {
                    throw new Error(
                        resp.mensagem || "Não foi possível criar uma nova conversa."
                    );
                }

                return fetch(obterUrlConversas())
                    .then(r => r.json())
                    .then(dadosConversas => ({
                        resp,
                        dadosConversas
                    }));
            })
            .then(({ resp, dadosConversas }) => {
                if (!dadosConversas.sucesso) {
                    throw new Error(
                        "A conversa foi criada, mas não foi possível atualizar a lista."
                    );
                }

                const conversas = dadosConversas.conversas || [];

                atualizarListaConversas(conversas);

                const nova = conversas.find(c =>
                    Number(c.id_conversa) === Number(resp.id_conversa)
                );

                if (!nova) {
                    throw new Error(
                        "A nova conversa não apareceu na lista. Atualize a página."
                    );
                }

                abrirConversa(nova.id_conversa, nova);

                document.querySelectorAll(".lista-conversas .conversa")
                    .forEach(item => item.classList.remove("ativa"));

                const botoes = document.querySelectorAll(
                    ".lista-conversas .conversa"
                );

                const indice = conversas.findIndex(c =>
                    Number(c.id_conversa) === Number(nova.id_conversa)
                );

                if (indice >= 0 && botoes[indice]) {
                    botoes[indice].classList.add("ativa");
                }
            })
            .catch(erro => {
                console.log("Erro ao criar nova conversa:", erro);
                alert(erro.message || "Não foi possível criar a conversa.");

                document.querySelectorAll(".btn-nova-conversa-card")
                    .forEach(botao => botao.disabled = false);
            });
    }

    function carregarMensagens(idConversa, silencioso) {
        fetch("../routes/mensagem.php?acao=listar&id_conversa=" + encodeURIComponent(idConversa))
            .then(r => r.json())
            .then(dados => {
                if (!dados.sucesso) {
                    if (!silencioso) {
                        console.log("Erro ao carregar mensagens:", dados.mensagem);
                    }
                    return;
                }

                if (Number(idConversa) !== Number(conversaAtual)) return;

                const mensagens = dados.mensagens || [];
                const ultima = mensagens[mensagens.length - 1];

                const assinatura = mensagens.length + ":" +
                    (ultima ? ultima.id_mensagem : 0);

                if (!silencioso || assinatura !== assinaturaMensagens) {
                    assinaturaMensagens = assinatura;
                    renderizarMensagens(mensagens);
                }

                carregarConfirmacoes(idConversa);
            })
            .catch(erro => {
                if (!silencioso) {
                    console.log("Erro ao carregar mensagens:", erro);
                }
            });
    }

    function carregarConfirmacoes(idConversa) {
        if (!idConversa) return;

        fetch("../routes/confirmacao.php?acao=listar&id_conversa=" + encodeURIComponent(idConversa))
            .then(r => r.json())
            .then(dados => {
                if (Number(idConversa) !== Number(conversaAtual)) return;

                if (!dados.sucesso) {
                    console.log("Erro ao carregar confirmações:", dados.mensagem);
                    return;
                }

                confirmacoesAtuais = dados.confirmacoes || [];
                renderizarConfirmacoes();
                atualizarBotaoSolicitacao();
            })
            .catch(erro => console.log("Erro ao carregar confirmações:", erro));
    }

    function renderizarConfirmacoes() {
        const area = document.querySelector(".mensagens-chat");
        if (!area) return;

        area.querySelectorAll(".cartao-confirmacao").forEach(card => card.remove());

        if (!confirmacoesAtuais.length) return;

        const ultima = confirmacoesAtuais[confirmacoesAtuais.length - 1];
        const ehPro = tipoUsuario === "profissional";

        // PROFISSIONAL
        if (ehPro) {
            if (ultima.status === "PENDENTE") {
                const card = document.createElement("div");
                card.className = "cartao-confirmacao";

                card.innerHTML = `
                    <strong>Confirmação do serviço</strong>
                    <p>Solicitação enviada. Aguardando resposta do cliente.</p>
                `;

                area.appendChild(card);
            }

            if (
                ultima.status === "ACEITA" &&
                statusConversaAtual === "ENCERRADA"
            ) {
                const card = document.createElement("div");
                card.className = "cartao-confirmacao";

                card.innerHTML = `
                    <strong>SERVIÇO CONFIRMADO</strong>
                    <p>O cliente aceitou a confirmação do serviço.</p>
                `;

                area.appendChild(card);
            }

            // A recusa desaparece para o profissional quando o cliente escolhe continuar.
            if (
                ultima.status === "RECUSADA" &&
                ultima.decisao_cliente !== "CONTINUAR"
            ) {
                const card = document.createElement("div");
                card.className = "cartao-confirmacao";

                const decisao = ultima.decisao_cliente === "ENCERRAR"
                    ? "O cliente escolheu encerrar a conversa."
                    : "Aguardando o cliente decidir.";

                card.innerHTML = `
                    <strong>CONFIRMAÇÃO RECUSADA</strong>
                    <p>O cliente recusou a confirmação do serviço.</p>
                    <p>${decisao}</p>
                `;

                area.appendChild(card);
            }

            return;
        }

        // CLIENTE: pedido pendente.
        if (ultima.status === "PENDENTE") {
            const card = document.createElement("div");
            card.className = "cartao-confirmacao";

            card.innerHTML = `
                <strong>Confirmação do serviço</strong>
                <p>O profissional deseja confirmar que o serviço foi realizado.</p>

                <div class="acoes-confirmacao">
                    <button type="button" class="btn-aceitar-confirmacao">
                        Aceitar
                    </button>

                    <button type="button" class="btn-recusar-confirmacao">
                        Recusar
                    </button>
                </div>
            `;

            card.querySelector(".btn-aceitar-confirmacao")
                .addEventListener("click", () => responderConfirmacao("ACEITA"));

            card.querySelector(".btn-recusar-confirmacao")
                .addEventListener("click", () => responderConfirmacao("RECUSADA"));

            area.appendChild(card);
        }

        // CLIENTE: decisão após recusar.
        if (
            ultima.status === "RECUSADA" &&
            ultima.decisao_cliente === null &&
            statusConversaAtual === "ABERTA"
        ) {
            const card = document.createElement("div");
            card.className = "cartao-confirmacao";

            card.innerHTML = `
                <strong>Você recusou a confirmação</strong>
                <p>O que deseja fazer agora?</p>

                <div class="acoes-confirmacao">
                    <button type="button" class="btn-encerrar-apos-recusa">
                        Encerrar conversa
                    </button>

                    <button type="button" class="btn-continuar-apos-recusa">
                        Continuar conversando
                    </button>
                </div>
            `;

            card.querySelector(".btn-encerrar-apos-recusa")
                .addEventListener("click", () => decidirRecusa("ENCERRAR"));

            card.querySelector(".btn-continuar-apos-recusa")
                .addEventListener("click", () => decidirRecusa("CONTINUAR"));

            area.appendChild(card);
        }

        // CLIENTE: serviço aceito e conversa encerrada.
        if (
            ultima.status === "ACEITA" &&
            statusConversaAtual === "ENCERRADA"
        ) {
            const card = document.createElement("div");
            card.className = "cartao-confirmacao";

            card.innerHTML = `
                <strong>SERVIÇO CONFIRMADO</strong>
                <p>O serviço foi confirmado com sucesso!</p>

                <div class="acoes-confirmacao">
                    <button type="button" class="btn-nova-conversa-card">
                        Nova conversa
                    </button>
                </div>
            `;

            card.querySelector(".btn-nova-conversa-card")
                .addEventListener("click", criarNovaConversa);

            area.appendChild(card);
        }

        // CLIENTE: recusou e escolheu encerrar.
        if (
            ultima.status === "RECUSADA" &&
            ultima.decisao_cliente === "ENCERRAR" &&
            statusConversaAtual === "ENCERRADA"
        ) {
            const card = document.createElement("div");
            card.className = "cartao-confirmacao";

            card.innerHTML = `
                <strong>CONVERSA ENCERRADA</strong>
                <p>Você pode iniciar uma nova conversa com este profissional.</p>

                <div class="acoes-confirmacao">
                    <button type="button" class="btn-nova-conversa-card">
                        Nova conversa
                    </button>
                </div>
            `;

            card.querySelector(".btn-nova-conversa-card")
                .addEventListener("click", criarNovaConversa);

            area.appendChild(card);
        }
    }

    function atualizarBotaoSolicitacao() {
        const botao = document.getElementById("btnSolicitarConfirmacao");
        if (!botao) return;

        const ultima = confirmacoesAtuais.length
            ? confirmacoesAtuais[confirmacoesAtuais.length - 1]
            : null;

        const pendente = ultima && ultima.status === "PENDENTE";
        const conversaEncerrada = statusConversaAtual === "ENCERRADA";

        botao.style.display =
            tipoUsuario === "profissional" ? "inline-flex" : "none";

        botao.disabled = !!pendente || conversaEncerrada;

        botao.title = pendente
            ? "Já existe um pedido aguardando resposta."
            : "Solicitar confirmação do serviço";
    }

    function solicitarConfirmacao() {
        if (!conversaAtual || tipoUsuario !== "profissional") return;

        const dados = new FormData();
        dados.append("id_conversa", conversaAtual);

        const botao = document.getElementById("btnSolicitarConfirmacao");

        if (botao) botao.disabled = true;

        fetch("../routes/confirmacao.php?acao=solicitar", {
            method: "POST",
            body: dados
        })
            .then(r => r.json())
            .then(resp => {
                alert(resp.mensagem || "Resposta recebida.");

                if (resp.sucesso) {
                    carregarConfirmacoes(conversaAtual);
                } else {
                    atualizarBotaoSolicitacao();
                }
            })
            .catch(erro => {
                console.log("Erro ao solicitar confirmação:", erro);
                alert("Não foi possível solicitar a confirmação.");
                atualizarBotaoSolicitacao();
            });
    }

    function responderConfirmacao(resposta) {
        if (!conversaAtual || tipoUsuario !== "cliente") return;

        const confirmar = resposta === "ACEITA"
            ? "Confirma que o serviço foi realizado?"
            : "Tem certeza de que deseja recusar este pedido?";

        if (!window.confirm(confirmar)) return;

        const dados = new FormData();
        dados.append("id_conversa", conversaAtual);
        dados.append("resposta", resposta);

        fetch("../routes/confirmacao.php?acao=responder", {
            method: "POST",
            body: dados
        })
            .then(r => r.json())
            .then(resp => {
                alert(resp.mensagem || "Resposta recebida.");

                if (!resp.sucesso) return;

                if (resposta === "ACEITA") {
                    statusConversaAtual = "ENCERRADA";
                    atualizarEstadoCampo("ENCERRADA");
                }

                carregarConversasSemReabrir();
                carregarConfirmacoes(conversaAtual);
                carregarMensagens(conversaAtual);
            })
            .catch(erro => {
                console.log("Erro ao responder confirmação:", erro);
                alert("Não foi possível registrar sua resposta.");
            });
    }

    function decidirRecusa(decisao) {
        if (!conversaAtual || tipoUsuario !== "cliente") return;

        const mensagem = decisao === "ENCERRAR"
            ? "Deseja realmente encerrar esta conversa?"
            : "Deseja continuar conversando?";

        if (!window.confirm(mensagem)) return;

        const dados = new FormData();
        dados.append("id_conversa", conversaAtual);
        dados.append("decisao", decisao);

        fetch("../routes/confirmacao.php?acao=decidirRecusa", {
            method: "POST",
            body: dados
        })
            .then(r => r.json())
            .then(resp => {
                if (!resp.sucesso) {
                    alert(resp.mensagem || "Não foi possível registrar sua decisão.");
                    return;
                }

                alert(resp.mensagem || "Decisão registrada.");

                if (decisao === "ENCERRAR") {
                    statusConversaAtual = "ENCERRADA";
                    atualizarEstadoCampo("ENCERRADA");
                }

                carregarConversasSemReabrir();
                carregarConfirmacoes(conversaAtual);
            })
            .catch(erro => {
                console.log("Erro ao registrar decisão:", erro);
                alert("Não foi possível registrar sua decisão.");
            });
    }

    function renderizarMensagens(mensagens) {
        const area = document.querySelector(".mensagens-chat");
        if (!area) return;

        area.innerHTML = "";

        if (mensagens.length === 0) {
            area.innerHTML = `
                <div style="padding:40px;text-align:center;color:#777">
                    <div style="font-size:40px;margin-bottom:10px">💬</div>
                    <strong>Nenhuma mensagem ainda</strong>
                    <p>Comece a conversa!</p>
                </div>`;
        } else {
            mensagens.forEach(mensagem => {
                const souEu = tipoUsuario === "cliente"
                    ? mensagem.id_cliente !== null && mensagem.id_cliente !== undefined
                    : mensagem.id_profissional !== null && mensagem.id_profissional !== undefined;

                const div = document.createElement("div");
                div.className = souEu
                    ? "mensagem enviada"
                    : "mensagem recebida";

                let hora = "";

                if (mensagem.data_envio) {
                    const data = new Date(mensagem.data_envio);

                    if (!isNaN(data.getTime())) {
                        hora = data.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                    }
                }

                div.innerHTML = `
                    <div class="mensagem-texto">${escapar(mensagem.mensagem)}</div>
                    <span class="mensagem-hora">${hora}</span>`;

                area.appendChild(div);
            });
        }

        renderizarConfirmacoes();
        area.scrollTop = area.scrollHeight;
    }

    function limparChat() {
        const perfilChat = document.querySelector(".perfil-chat");
        const mensagens = document.querySelector(".mensagens-chat");
        const input = document.querySelector(".campo-mensagem input");
        const enviar = document.querySelector(".btn-enviar-mensagem");
        const confirmar = document.getElementById("btnSolicitarConfirmacao");
        const novaConversa = document.getElementById("btnNovaConversa");

        conversaAtual = null;
        idProfissionalAtual = null;
        assinaturaMensagens = null;
        confirmacoesAtuais = [];
        statusConversaAtual = null;

        if (perfilChat) {
            perfilChat.innerHTML = `
                <div class="avatar-chat"><span>👤</span></div>
                <div>
                    <h2>Selecione uma conversa</h2>
                    <span>${tipoUsuario === "profissional"
                        ? "Escolha um cliente para começar"
                        : "Escolha um profissional para começar"}</span>
                </div>`;
        }

        if (mensagens) {
            mensagens.innerHTML = `
                <div style="padding:40px;text-align:center;color:#777">
                    <div style="font-size:40px;margin-bottom:10px">💬</div>
                    <strong>Selecione uma conversa</strong>
                    <p>Escolha uma conversa ao lado para visualizar as mensagens.</p>
                </div>`;
        }

        if (input) {
            input.disabled = true;
            input.value = "";
            input.placeholder = "Selecione uma conversa...";
        }

        if (enviar) enviar.disabled = true;

        if (confirmar) {
            confirmar.disabled = true;
            confirmar.style.display = "none";
        }

        if (novaConversa) {
            novaConversa.disabled = false;
            novaConversa.style.display = "none";
        }
    }

    function enviarMensagem() {
        if (!conversaAtual) {
            alert("Selecione uma conversa primeiro.");
            return;
        }

        const input = document.querySelector(".campo-mensagem input");

        if (!input || input.disabled) return;

        const texto = input.value.trim();
        if (!texto) return;

        const dados = new FormData();
        dados.append("id_conversa", conversaAtual);
        dados.append("mensagem", texto);

        const acao = tipoUsuario === "profissional"
            ? "enviarProfissional"
            : "enviarCliente";

        fetch("../routes/mensagem.php?acao=" + acao, {
            method: "POST",
            body: dados
        })
            .then(r => r.json())
            .then(resp => {
                if (!resp.sucesso) {
                    alert(resp.mensagem);
                    return;
                }

                input.value = "";
                carregarMensagens(conversaAtual);
                carregarConversasSemReabrir();
            })
            .catch(erro => {
                console.log("Erro ao enviar mensagem:", erro);
                alert("Não foi possível enviar a mensagem.");
            });
    }

    document.addEventListener("click", function (event) {
        if (event.target.closest(".btn-enviar-mensagem")) {
            enviarMensagem();
            return;
        }

        if (event.target.closest("#btnSolicitarConfirmacao")) {
            solicitarConfirmacao();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (!event.target.closest(".campo-mensagem input")) return;

        if (event.key === "Enter") {
            event.preventDefault();
            enviarMensagem();
        }
    });

    window.alternarMenuPerfilMensagens = function () {
        const menu = document.getElementById("menuPerfilMensagens");

        if (menu) menu.classList.toggle("aberto");
    };

    document.addEventListener("click", function (event) {
        const menu = document.getElementById("menuPerfilMensagens");
        const botao = document.querySelector(".btn-perfil-mensagens");

        if (!menu || !botao) return;

        if (!menu.contains(event.target) && !botao.contains(event.target)) {
            menu.classList.remove("aberto");
        }
    });

    window.editarPerfilProfissional = function () {
        window.location.href = tipoUsuario === "cliente"
            ? "criar-perfil-cli.html?editar=1"
            : "editar-perfil-pro.html";
    };

    window.editarPortfolio = function () {
        window.location.href = "editar-portfolio.html";
    };

    window.sairContaProfissional = function () {
        const rota = tipoUsuario === "cliente"
            ? "../routes/cliente.php?acao=sair"
            : "../routes/profissional.php?acao=sair";

        fetch(rota)
            .catch(() => {})
            .then(() => {
                window.location.href = "index.html";
            });
    };

})();
