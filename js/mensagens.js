(function () {

    let conversaAtual = null;
    let tipoUsuario = null;
    let dadosUsuario = null;
    let assinaturaMensagens = null;
    const INTERVALO_ATUALIZACAO = 3000; // 3 segundos

    const FOTO_PADRAO = "../img/sem-foto.jpg";

    // monta o caminho da foto, seja o banco guardando só o nome
    // ("joao.jpg") ou um caminho ("img/joao.jpg", "uploads/joao.jpg")
    function caminhoFoto(foto) {
        if (!foto) return FOTO_PADRAO;

        foto = String(foto);

        if (/^(https?:)?\/\//.test(foto) || foto.indexOf("../") === 0 || foto.charAt(0) === "/") {
            return foto;
        }

        if (foto.indexOf("/") !== -1) {
            return "../" + foto;
        }

        return "../img/" + foto;
    }

    document.addEventListener("DOMContentLoaded", detectarUsuario);

    // evita que o texto da mensagem seja interpretado como HTML
    function escapar(texto) {
        const div = document.createElement("div");
        div.textContent = texto == null ? "" : String(texto);
        return div.innerHTML;
    }

    // troca para a foto padrão só UMA vez (evita a foto piscando)
    function fotoComFallback(img) {
        img.onerror = function () {
            this.onerror = null;
            this.src = FOTO_PADRAO;
        };
    }

    // =========================================================
    // DESCOBRIR QUEM ESTÁ LOGADO
    // =========================================================

    function detectarUsuario() {
        fetch("../routes/profissional.php?acao=meuPerfil")
            .then(function (r) { return r.json(); })
            .then(function (dados) {
                if (dados.sucesso) {
                    tipoUsuario = "profissional";
                    dadosUsuario = dados.profissional;
                    configurarTela();
                    carregarConversas();
                    return;
                }
                detectarCliente();
            })
            .catch(detectarCliente);
    }

    function detectarCliente() {
        fetch("../routes/cliente.php?acao=meuPerfil")
            .then(function (r) { return r.json(); })
            .then(function (dados) {
                if (!dados.sucesso) {
                    alert("Você precisa estar logado.");
                    window.location.href = "index.html";
                    return;
                }
                tipoUsuario = "cliente";
                dadosUsuario = dados.cliente;
                configurarTela();
                carregarConversas();
            })
            .catch(function (erro) {
                console.log("Erro ao descobrir usuário:", erro);
            });
    }

    // =========================================================
    // CONFIGURAR A TELA
    // =========================================================

    function configurarTela() {
        const titulo = document.querySelector(".titulo-mensagens h1");
        const descricao = document.querySelector(".titulo-mensagens p");
        const subtituloLista = document.querySelector(".topo-conversas span");
        const textoChat = document.querySelector(".perfil-chat h2");
        const descricaoChat = document.querySelector(".perfil-chat span");

        const ehPro = tipoUsuario === "profissional";

        if (titulo) titulo.innerHTML = 'Suas <span>conversas.</span>';
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

        carregarMeuPerfil();
        ajustarMenuPorTipo();
    }

    // cliente não tem portfólio nem perfil de profissional:
    // esconde esses botões do menu
    function ajustarMenuPorTipo() {
        if (tipoUsuario !== "cliente") return;

        document.querySelectorAll("#menuPerfilMensagens button").forEach(function (botao) {
            const acao = botao.getAttribute("onclick") || "";

            if (acao.indexOf("editarPortfolio") !== -1) {
                botao.style.display = "none";
            }
        });
    }

    // =========================================================
    // MEU PERFIL
    // =========================================================

    function carregarMeuPerfil() {
        const url = tipoUsuario === "profissional"
            ? "../routes/profissional.php?acao=meuPerfil"
            : "../routes/cliente.php?acao=meuPerfil";

        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (dados) {
                if (!dados.sucesso) return;

                dadosUsuario = tipoUsuario === "profissional"
                    ? dados.profissional
                    : dados.cliente;

                const nomeMenu = document.getElementById("nomePerfilMenu");
                if (nomeMenu) nomeMenu.textContent = dadosUsuario.nome || "Usuário";

                const botaoPerfil = document.querySelector(".btn-perfil-mensagens");
                if (botaoPerfil && dadosUsuario.foto) {
                    let fotoPerfil = botaoPerfil.querySelector("img");

                    // se o botão não tem <img> (só emoji/texto), cria uma
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
            .catch(function (erro) {
                console.log("Erro ao carregar perfil:", erro);
            });
    }

    // =========================================================
    // CARREGAR CONVERSAS
    // =========================================================

    function carregarConversas() {
        const url = tipoUsuario === "profissional"
            ? "../routes/conversa.php?acao=minhasProfissional"
            : "../routes/conversa.php?acao=minhasCliente";

        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (dados) {
                if (!dados.sucesso) {
                    console.log("Erro ao carregar conversas:", dados.mensagem);
                    return;
                }
                renderizarConversas(dados.conversas || []);
            })
            .catch(function (erro) {
                console.log("Erro ao carregar conversas:", erro);
            });
    }

    // =========================================================
    // MOSTRAR LISTA DE CONVERSAS
    // =========================================================

    function renderizarConversas(conversas) {
        const lista = document.querySelector(".lista-conversas");
        if (!lista) return;

        const ehPro = tipoUsuario === "profissional";

        lista.innerHTML = `
            <div class="topo-conversas">
                <h2>Conversas</h2>
                <span>${ehPro ? "Seus clientes no Dekko" : "Seus profissionais no Dekko"}</span>
            </div>
        `;

        if (conversas.length === 0) {
            lista.innerHTML += `
                <div style="padding: 30px 20px; text-align: center; color: #777;">
                    <div style="font-size: 35px; margin-bottom: 10px;">💬</div>
                    <strong>Nenhuma conversa ainda</strong>
                    <p>${ehPro
                        ? "Quando um cliente chamar você, a conversa aparecerá aqui."
                        : "Quando você conversar com um profissional, a conversa aparecerá aqui."}</p>
                </div>
            `;
            limparChat();
            return;
        }

        // escolher qual conversa abrir
        let conversaParaAbrir = null;

        if (conversaAtual) {
            conversaParaAbrir = conversas.find(function (c) {
                return Number(c.id_conversa) === Number(conversaAtual);
            });
        }

        if (!conversaParaAbrir) {
            const idUrl = new URLSearchParams(window.location.search).get("id_conversa");
            if (idUrl) {
                conversaParaAbrir = conversas.find(function (c) {
                    return Number(c.id_conversa) === Number(idUrl);
                });
            }
        }

        if (!conversaParaAbrir) conversaParaAbrir = conversas[0];

        // criar cada conversa
        conversas.forEach(function (conversa) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "conversa";

            if (Number(conversa.id_conversa) === Number(conversaParaAbrir.id_conversa)) {
                botao.classList.add("ativa");
            }

            const nome = ehPro
                ? (conversa.cliente_nome || "Cliente")
                : (conversa.profissional_nome || "Profissional");

            const foto = ehPro
                ? (conversa.cliente_foto || "sem-foto.jpg")
                : (conversa.profissional_foto || "sem-foto.jpg");

            const ultimaMensagem = conversa.ultima_mensagem || "Nenhuma mensagem ainda.";

            botao.innerHTML = `
                <div class="avatar-conversa">
                    <img src="${escapar(caminhoFoto(foto))}" alt="Foto de ${escapar(nome)}">
                </div>
                <div class="info-conversa">
                    <strong>${escapar(nome)}</strong>
                    <span>${escapar(ultimaMensagem)}</span>
                </div>
            `;

            fotoComFallback(botao.querySelector("img"));

            botao.addEventListener("click", function () {
                document.querySelectorAll(".lista-conversas .conversa").forEach(function (item) {
                    item.classList.remove("ativa");
                });
                botao.classList.add("ativa");
                abrirConversa(conversa.id_conversa, conversa);
            });

            lista.appendChild(botao);
        });

        abrirConversa(conversaParaAbrir.id_conversa, conversaParaAbrir);
    }

    // =========================================================
    // ABRIR CONVERSA
    // =========================================================

    function abrirConversa(idConversa, conversa) {
        if (!idConversa) return;

        conversaAtual = idConversa;
        assinaturaMensagens = null;
        atualizarTopoChat(conversa);
        carregarMensagens(idConversa);
    }

    // =========================================================
    // TOPO DO CHAT
    // =========================================================

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

    // =========================================================
    // CARREGAR MENSAGENS
    // =========================================================

    function carregarMensagens(idConversa, silencioso) {
        fetch(
            "../routes/mensagem.php?acao=listar&id_conversa=" +
            encodeURIComponent(idConversa)
        )
            .then(function (r) { return r.json(); })
            .then(function (dados) {
                if (!dados.sucesso) {
                    if (!silencioso) {
                        console.log("Erro ao carregar mensagens:", dados.mensagem);
                    }
                    return;
                }

                // o usuário trocou de conversa enquanto carregava
                if (Number(idConversa) !== Number(conversaAtual)) return;

                const mensagens = dados.mensagens || [];
                const ultima = mensagens[mensagens.length - 1];
                const assinatura = mensagens.length + ":" + (ultima ? ultima.id_mensagem : 0);

                // atualização automática: só redesenha se chegou algo novo
                if (silencioso && assinatura === assinaturaMensagens) return;

                assinaturaMensagens = assinatura;
                renderizarMensagens(mensagens);
            })
            .catch(function (erro) {
                if (!silencioso) {
                    console.log("Erro ao carregar mensagens:", erro);
                }
            });
    }

    // atualiza o chat sozinho, sem precisar recarregar a página
    setInterval(function () {
        if (conversaAtual && !document.hidden) {
            carregarMensagens(conversaAtual, true);
        }
    }, INTERVALO_ATUALIZACAO);

    // =========================================================
    // MOSTRAR MENSAGENS
    // =========================================================

    function renderizarMensagens(mensagens) {
        const area = document.querySelector(".mensagens-chat");
        if (!area) return;

        area.innerHTML = "";

        if (mensagens.length === 0) {
            area.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #777;">
                    <div style="font-size: 40px; margin-bottom: 10px;">💬</div>
                    <strong>Nenhuma mensagem ainda</strong>
                    <p>Comece a conversa!</p>
                </div>
            `;
            return;
        }

        mensagens.forEach(function (mensagem) {

            // CORREÇÃO: no banco, quem enviou fica com o id preenchido
            // e o outro fica NULL. Então basta ver qual dos dois veio preenchido.
            const souEu = tipoUsuario === "cliente"
                ? mensagem.id_cliente !== null && mensagem.id_cliente !== undefined
                : mensagem.id_profissional !== null && mensagem.id_profissional !== undefined;

            const div = document.createElement("div");
            div.className = souEu ? "mensagem enviada" : "mensagem recebida";

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
                <span class="mensagem-hora">${hora}</span>
            `;

            area.appendChild(div);
        });

        area.scrollTop = area.scrollHeight;
    }

    // =========================================================
    // LIMPAR CHAT
    // =========================================================

    function limparChat() {
        const perfilChat = document.querySelector(".perfil-chat");
        const mensagens = document.querySelector(".mensagens-chat");

        if (perfilChat) {
            perfilChat.innerHTML = `
                <div class="avatar-chat"><span>👤</span></div>
                <div>
                    <h2>Selecione uma conversa</h2>
                    <span>${tipoUsuario === "profissional"
                        ? "Escolha um cliente para começar"
                        : "Escolha um profissional para começar"}</span>
                </div>
            `;
        }

        if (mensagens) {
            mensagens.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #777;">
                    <div style="font-size: 40px; margin-bottom: 10px;">💬</div>
                    <strong>Selecione uma conversa</strong>
                    <p>Escolha uma conversa ao lado para visualizar as mensagens.</p>
                </div>
            `;
        }
    }

    // =========================================================
    // ENVIAR MENSAGEM
    // =========================================================

    function enviarMensagem() {
        if (!conversaAtual) {
            alert("Selecione uma conversa primeiro.");
            return;
        }

        const input = document.querySelector(".campo-mensagem input");
        if (!input) return;

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
            .then(function (r) { return r.json(); })
            .then(function (resp) {
                if (!resp.sucesso) {
                    alert(resp.mensagem);
                    return;
                }

                input.value = "";

                // atualiza só o chat, sem reconstruir a lista de conversas
                carregarMensagens(conversaAtual);
            })
            .catch(function (erro) {
                console.log("Erro ao enviar mensagem:", erro);
                alert("Não foi possível enviar a mensagem.");
            });
    }

    // botão enviar
    document.addEventListener("click", function (event) {
        if (event.target.closest(".campo-mensagem button")) {
            enviarMensagem();
        }
    });

    // enter para enviar
    document.addEventListener("keydown", function (event) {
        if (!event.target.closest(".campo-mensagem input")) return;

        if (event.key === "Enter") {
            event.preventDefault();
            enviarMensagem();
        }
    });

    // =========================================================
    // MENU DO PERFIL
    // =========================================================

    window.alternarMenuPerfilMensagens = function () {
        const menu = document.getElementById("menuPerfilMensagens");
        if (menu) menu.classList.toggle("aberto");
    };

    // fechar menu clicando fora
    document.addEventListener("click", function (event) {
        const menu = document.getElementById("menuPerfilMensagens");
        const botao = document.querySelector(".btn-perfil-mensagens");

        if (!menu || !botao) return;

        if (!menu.contains(event.target) && !botao.contains(event.target)) {
            menu.classList.remove("aberto");
        }
    });

    // serve para os dois: cada um vai para a sua página de perfil
    window.editarPerfilProfissional = function () {
        window.location.href = tipoUsuario === "cliente"
            ? "criar-perfil-cli.html"
            : "editar-perfil-pro.html";
    };

    window.editarPortfolio = function () {
        window.location.href = "portfolio.html";
    };

    window.sairContaProfissional = function () {
        window.location.href = "../index.html";
    };

})();