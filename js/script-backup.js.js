/* ============================= */
/* VLIBRAS (TRADUTOR DE LIBRAS) */
/* ============================= */

(function () {

    if (document.querySelector("[vw]")) {
        return;
    }

    const widget = document.createElement("div");

    widget.setAttribute("vw", "");
    widget.className = "enabled";

    widget.innerHTML = `
        <div vw-access-button class="active"></div>

        <div vw-plugin-wrapper>
            <div class="vw-plugin-top-wrapper"></div>
        </div>
    `;

    document.body.appendChild(widget);

    const script = document.createElement("script");

    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";

    script.onload = function () {
        new window.VLibras.Widget(
            "https://vlibras.gov.br/app"
        );
    };

    document.body.appendChild(script);

})();


function fechar() {

    document
        .querySelectorAll(".modal")
        .forEach(function (modal) {
            modal.classList.remove("ativo");
        });

}


function abrirLogin() {

    fechar();

    let login = document.getElementById("login");

    if (login) {
        login.classList.add("ativo");
    }

}


function abrirCadastro() {

    fechar();

    let cadastro = document.getElementById("cadastro");

    if (cadastro) {
        cadastro.classList.add("ativo");
    }

}


function abrirCliente() {

    fechar();

    let cliente = document.getElementById("cliente");

    if (cliente) {
        cliente.classList.add("ativo");
    }

}


function abrirProfissional() {

    fechar();

    let profissional = document.getElementById("profissional");

    if (profissional) {
        profissional.classList.add("ativo");
    }

}


/* ============================= */
/* VERIFICAR OUTRO SERVIÇO */
/* ============================= */

function verificarOutroServico() {

    let checkboxOutro =
        document.getElementById("checkboxOutro");

    let outro =
        document.getElementById("outro");

    let campo =
        document.getElementById("outroServico");

    if (!checkboxOutro || !outro || !campo) {
        return;
    }

    if (checkboxOutro.checked) {

        outro.classList.add("ativo");
        campo.required = true;

    } else {

        outro.classList.remove("ativo");
        campo.required = false;
        campo.value = "";

    }

}


/* ============================= */
/* LOGIN */
/* ============================= */

function fazerLogin(event) {

    event.preventDefault();

    let form = event.target;

    fetch("../routes/cliente.php?acao=login", {

        method: "POST",
        body: new FormData(form)

    })

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (dados) {

            alert(dados.mensagem);

            if (dados.sucesso) {

                form.reset();
                fechar();
                verificarSessao();

            }

        })

        .catch(function (erro) {

            console.log(erro);

            alert(
                "Erro ao conectar com o servidor. Veja o Console (F12)."
            );

        });

}


/* ============================= */
/* CADASTRAR CLIENTE */
/* ============================= */

function cadastrarCliente(event) {

    event.preventDefault();

    let form = event.target;

    fetch("../routes/cliente.php?acao=cadastrar", {

        method: "POST",
        body: new FormData(form)

    })

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (dados) {

            alert(dados.mensagem);

            if (dados.sucesso) {

                form.reset();
                fechar();

            }

        })

        .catch(function (erro) {

            console.log(erro);

            alert(
                "Erro ao conectar com o servidor. Veja o Console (F12)."
            );

        });

}


/* ============================= */
/* CADASTRAR PROFISSIONAL */
/* ============================= */

function cadastrarProfissional(event) {

    event.preventDefault();

    let form = event.target;

    let servicos = form.querySelectorAll(
        'input[name="servicos[]"]:checked'
    );

    if (servicos.length === 0) {

        alert("Selecione pelo menos um serviço.");
        return;

    }

    let checkboxOutro =
        document.getElementById("checkboxOutro");

    let outroServico =
        document.getElementById("outroServico");

    if (
        checkboxOutro &&
        checkboxOutro.checked &&
        outroServico &&
        outroServico.value.trim() === ""
    ) {

        alert("Digite qual é o outro serviço.");
        outroServico.focus();
        return;

    }

    fetch("../routes/profissional.php?acao=cadastrar", {

        method: "POST",
        body: new FormData(form)

    })

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (dados) {

            alert(dados.mensagem);

            if (dados.sucesso) {

                form.reset();
                verificarOutroServico();
                fechar();

            }

        })

        .catch(function (erro) {

            console.log(erro);

            alert(
                "Erro ao conectar com o servidor. Veja o Console (F12)."
            );

        });

}


/* ============================= */
/* FECHAR MODAIS AO CLICAR FORA */
/* ============================= */

document
    .querySelectorAll(".modal")
    .forEach(function (modal) {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {
                fechar();
            }

        });

    });


/* ============================= */
/* VERIFICAR SESSÃO */
/* ============================= */

function verificarSessao() {

    fetch("../verificar_sessao.php")

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (dados) {

            if (dados.logado) {

                let botao =
                    document.getElementById("btnUsuario");

                if (botao) {

                    botao.textContent = dados.nome;

                    botao.onclick = function () {
                        abrirCliente();
                    };

                }

                let nomePerfil =
                    document.querySelector(
                        ".perfil-info strong"
                    );

                if (nomePerfil) {

                    nomePerfil.textContent =
                        dados.nome || "Meu perfil";

                }

            }

        })

        .catch(function (erro) {

            console.log(
                "Erro ao verificar sessão:",
                erro
            );

        });

}

verificarSessao();


/* ============================= */
/* MENU DO PERFIL */
/* ============================= */

function abrirMenuPerfil() {

    let menu =
        document.getElementById("menuPerfil");

    if (!menu) {
        return;
    }

    menu.classList.toggle("ativo");

}


/* ============================= */
/* EDITAR PERFIL */
/* ============================= */

function editarPerfil(event) {

    if (event) {

        event.preventDefault();
        event.stopPropagation();

    }

    let menu =
        document.getElementById("menuPerfil");

    if (menu) {
        menu.classList.remove("ativo");
    }

    let modal =
        document.getElementById("modalEditarPerfil");

    if (modal) {
        modal.classList.add("ativo");
    }

}


/* ============================= */
/* FECHAR EDITAR PERFIL */
/* ============================= */

function fecharEditarPerfil() {

    let modal =
        document.getElementById("modalEditarPerfil");

    if (modal) {
        modal.classList.remove("ativo");
    }

}


/* ============================= */
/* SALVAR EDIÇÃO DO PERFIL */
/* ============================= */

document.addEventListener("DOMContentLoaded", function () {

    let formulario =
        document.getElementById("formEditarPerfil");

    if (formulario) {

        formulario.addEventListener("submit", function (event) {

            event.preventDefault();

            alert("Alterações salvas com sucesso!");

            fecharEditarPerfil();

        });

    }

});


/* ============================= */
/* SAIR DA CONTA */
/* ============================= */

function sairConta() {

    let menu =
        document.getElementById("menuPerfil");

    if (menu) {
        menu.classList.remove("ativo");
    }

    window.location.href =
        "index.html";

}


/* ============================= */
/* FECHAR MENU AO CLICAR FORA */
/* ============================= */

document.addEventListener(
    "click",
    function (evento) {

        let menuPerfil =
            document.getElementById("menuPerfil");

        let botaoPerfil =
            document.querySelector(".btn-perfil");

        if (!menuPerfil || !botaoPerfil) {
            return;
        }

        if (
            !menuPerfil.contains(evento.target) &&
            !botaoPerfil.contains(evento.target)
        ) {

            menuPerfil.classList.remove("ativo");

        }

    }
);


/* ============================= */
/* SOBRE */
/* ============================= */

function abrirSobre() {

    fechar();

    let sobre =
        document.getElementById("sobre");

    if (sobre) {
        sobre.classList.add("ativo");
    }

}


/* ============================= */
/* SEGURANÇA */
/* ============================= */

function abrirSeguranca() {

    fechar();

    let seguranca =
        document.getElementById("seguranca");

    if (seguranca) {
        seguranca.classList.add("ativo");
    }

}


/* ============================= */
/* FAVORITOS */
/* ============================= */

function obterFavoritos() {

    let favoritos =
        localStorage.getItem("dekkoFavoritos");

    if (!favoritos) {
        return [];
    }

    try {

        return JSON.parse(favoritos);

    } catch (erro) {

        return [];

    }

}


function salvarFavoritos(favoritos) {

    localStorage.setItem(
        "dekkoFavoritos",
        JSON.stringify(favoritos)
    );

}


function profissionalFavoritado(id) {

    let favoritos =
        obterFavoritos();

    return favoritos.includes(String(id));

}


function alternarFavorito(id, botao) {

    let idProfissional =
        String(id);

    let favoritos =
        obterFavoritos();

    let posicao =
        favoritos.indexOf(idProfissional);

    if (posicao === -1) {

        favoritos.push(idProfissional);

        botao.textContent = "★";

        botao.classList.add("favoritado");

        botao.setAttribute(
            "aria-label",
            "Remover profissional dos favoritos"
        );

    } else {

        favoritos.splice(posicao, 1);

        botao.textContent = "☆";

        botao.classList.remove("favoritado");

        botao.setAttribute(
            "aria-label",
            "Favoritar profissional"
        );

    }

    salvarFavoritos(favoritos);

    carregarFavoritos();

}


/* ============================= */
/* CRIAR CARD DO PROFISSIONAL */
/* ============================= */

function criarCardProfissional(profissional) {

    let fotoHTML = "";

    if (profissional.foto) {

        fotoHTML = `
            <img
                src="${profissional.foto}"
                alt="Foto de ${profissional.nome}"
            >
        `;

    } else {

        let inicial =
            profissional.nome
                ? profissional.nome.charAt(0).toUpperCase()
                : "?";

        fotoHTML = `
            <span>
                ${inicial}
            </span>
        `;

    }

    let favorito =
        profissionalFavoritado(
            profissional.id_profissional
        );

    let simboloFavorito =
        favorito ? "★" : "☆";

    let classeFavorito =
        favorito ? "favoritado" : "";

    return `
        <div class="card-profissional">

            <div class="foto-card-profissional">
                ${fotoHTML}
            </div>

            <div class="info-card-profissional">

                <h3>
                    ${profissional.nome}
                </h3>

                <p class="especialidade">
                    ${
                        profissional.servico ||
                        "Serviço não informado"
                    }
                </p>

                <p>
                    📍
                    ${
                        profissional.regiao ||
                        "Região não informada"
                    }
                </p>

            </div>

            <button
                type="button"
                class="btn-favorito ${classeFavorito}"
                onclick="alternarFavorito(
                    '${profissional.id_profissional}',
                    this
                )"
                aria-label="${
                    favorito
                        ? "Remover profissional dos favoritos"
                        : "Favoritar profissional"
                }"
            >
                ${simboloFavorito}
            </button>

            <button
                type="button"
                class="btn-ver-perfil"
                onclick="verPerfil(
                    ${profissional.id_profissional}
                )"
            >
                Ver perfil
            </button>

        </div>
    `;

}


/* ============================= */
/* LISTAR PROFISSIONAIS */
/* ============================= */

function listarProfissionais(
    servico = "",
    regiao = ""
) {

    let url =
        "../routes/profissional.php?acao=listar";

    if (servico !== "") {

        url +=
            "&servico=" +
            encodeURIComponent(servico);

    }

    if (regiao !== "") {

        url +=
            "&regiao=" +
            encodeURIComponent(regiao);

    }

    return fetch(url)

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (dados) {

            let lista =
                document.getElementById(
                    "listaProfissionais"
                );

            if (!lista) {

                return dados.profissionais || [];

            }

            lista.innerHTML = "";

            if (
                !dados.sucesso ||
                !dados.profissionais ||
                dados.profissionais.length === 0
            ) {

                lista.innerHTML = `
                    <p class="mensagem-busca">
                        😕 Nenhum profissional encontrado.
                    </p>
                `;

                return [];

            }

            dados.profissionais.forEach(
                function (profissional) {

                    lista.innerHTML +=
                        criarCardProfissional(
                            profissional
                        );

                }
            );

            return dados.profissionais;

        })

        .catch(function (erro) {

            console.log(
                "Erro ao listar profissionais:",
                erro
            );

            let lista =
                document.getElementById(
                    "listaProfissionais"
                );

            if (lista) {

                lista.innerHTML = `
                    <p class="mensagem-busca">
                        ❌ Não foi possível carregar os profissionais.
                    </p>
                `;

            }

            return [];

        });

}


/* ============================= */
/* CARREGAR FAVORITOS */
/* ============================= */

function carregarFavoritos() {

    let listaFavoritos =
        document.getElementById("listaFavoritos");

    if (!listaFavoritos) {
        return;
    }

    let favoritos =
        obterFavoritos();

    if (favoritos.length === 0) {

        listaFavoritos.innerHTML = `
            <p class="mensagem-busca">
                Você ainda não favoritou nenhum profissional.
            </p>
        `;

        return;

    }

    fetch("../routes/profissional.php?acao=listar")

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (dados) {

            if (
                !dados.sucesso ||
                !dados.profissionais
            ) {

                listaFavoritos.innerHTML = `
                    <p class="mensagem-busca">
                        Não foi possível carregar seus favoritos.
                    </p>
                `;

                return;

            }

            let profissionaisFavoritos =
                dados.profissionais.filter(
                    function (profissional) {

                        return favoritos.includes(
                            String(
                                profissional.id_profissional
                            )
                        );

                    }
                );

            listaFavoritos.innerHTML = "";

            if (profissionaisFavoritos.length === 0) {

                listaFavoritos.innerHTML = `
                    <p class="mensagem-busca">
                        Você ainda não favoritou nenhum profissional.
                    </p>
                `;

                return;

            }

            profissionaisFavoritos.forEach(
                function (profissional) {

                    listaFavoritos.innerHTML +=
                        criarCardProfissional(
                            profissional
                        );

                }
            );

        })

        .catch(function (erro) {

            console.log(
                "Erro ao carregar favoritos:",
                erro
            );

            listaFavoritos.innerHTML = `
                <p class="mensagem-busca">
                    ❌ Não foi possível carregar seus favoritos.
                </p>
            `;

        });

}


/* ============================= */
/* BUSCAR PROFISSIONAIS */
/* ============================= */

function buscarProfissionais() {

    let campoServico =
        document.getElementById(
            "buscaServico"
        );

    let campoRegiao =
        document.getElementById(
            "buscaRegiao"
        );

    let areaResultados =
        document.getElementById(
            "areaResultados"
        );

    if (
        !campoServico ||
        !campoRegiao
    ) {
        return;
    }

    let servico =
        campoServico.value.trim();

    let regiao =
        campoRegiao.value;

    if (areaResultados) {
        areaResultados.style.display = "block";
    }

    listarProfissionais(
        servico,
        regiao
    );

}


/* ============================= */
/* VER PERFIL */
/* ============================= */

function verPerfil(id) {

    window.location.href =
        "perfil.html?id=" + id;

}


/* ============================= */
/* CARREGAR PERFIL */
/* ============================= */

function carregarPerfil() {

    let areaPerfil =
        document.getElementById(
            "perfilProfissional"
        );

    if (!areaPerfil) {
        return;
    }

    let parametros =
        new URLSearchParams(
            window.location.search
        );

    let id =
        parametros.get("id");

    if (!id) {

        areaPerfil.innerHTML = `
            <div class="perfil-instagram">

                <div class="perfil-erro">

                    <h2>
                        Perfil não informado
                    </h2>

                    <p>
                        Selecione um profissional
                        para visualizar o perfil.
                    </p>

                </div>

            </div>
        `;

        return;

    }

    fetch(
        "../routes/profissional.php?acao=buscar&id=" +
        id
    )

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (dados) {

            if (
                !dados.sucesso ||
                !dados.profissional
            ) {

                areaPerfil.innerHTML = `
                    <div class="perfil-instagram">

                        <div class="perfil-erro">

                            <h2>
                                Profissional não encontrado
                            </h2>

                            <p>
                                Não foi possível encontrar
                                esse perfil.
                            </p>

                        </div>

                    </div>
                `;

                return;

            }

            let profissional =
                dados.profissional;


            /* FOTO DE PERFIL */

            let fotoPerfil =
                profissional.foto;

            let avatarHTML = "";

            if (fotoPerfil) {

                avatarHTML = `
                    <img
                        src="${fotoPerfil}"
                        alt="Foto de ${profissional.nome}"
                    >
                `;

            } else {

                let inicial =
                    profissional.nome
                        ? profissional.nome
                            .charAt(0)
                            .toUpperCase()
                        : "D";

                avatarHTML = `
                    <span>
                        ${inicial}
                    </span>
                `;

            }


            /* REDE SOCIAL */

            let redeSocialHTML = "";

            if (profissional.rede_social) {

                redeSocialHTML = `
                    <div class="perfil-social">

                        <strong>
                            📱 Rede social
                        </strong>

                        <a
                            href="${profissional.rede_social}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Ver rede social
                        </a>

                    </div>
                `;

            }


            /* PORTFÓLIO */

            let portfolioHTML = `
                <div class="galeria-portfolio">

                    <div class="portfolio-vazio">

                        <span>
                            📸
                        </span>

                        <h3>
                            Portfólio vazio
                        </h3>

                        <p>
                            Este profissional ainda
                            não adicionou fotos.
                        </p>

                    </div>

                </div>
            `;

            if (
                profissional.portfolio &&
                Array.isArray(profissional.portfolio) &&
                profissional.portfolio.length > 0
            ) {

                portfolioHTML = `
                    <div class="galeria-portfolio">

                        ${
                            profissional.portfolio
                                .slice(0, 6)
                                .map(function (foto, indice) {

                                    return `
                                        <div class="foto-portfolio">

                                            <img
                                                src="${foto}"
                                                alt="Trabalho ${
                                                    indice + 1
                                                } de ${
                                                    profissional.nome
                                                }"
                                            >

                                        </div>
                                    `;

                                })
                                .join("")
                        }

                    </div>
                `;

            }


            /* PERFIL COMPLETO */

            areaPerfil.innerHTML = `

                <div class="perfil-instagram">

                    <!-- CABEÇALHO -->

                    <div class="perfil-cabecalho">

                        <div class="perfil-avatar">
                            ${avatarHTML}
                        </div>

                        <div class="perfil-dados">

                            <h1>
                                ${profissional.nome}
                            </h1>

                            <p class="perfil-servico">
                                ${
                                    profissional.servico ||
                                    "Profissional"
                                }
                            </p>

                            <p class="perfil-regiao">
                                📍
                                ${
                                    profissional.regiao ||
                                    "Região não informada"
                                }
                            </p>

                            <button
                                class="btn-conversar"
                                type="button"
                                onclick="iniciarConversa(
                                    ${profissional.id_profissional}
                                )"
                            >
                                💬 Conversar
                            </button>

                        </div>

                    </div>


                    <!-- BIO -->

                    <div class="perfil-bio">

                        <h3>
                            Sobre mim
                        </h3>

                        <p>
                            ${
                                profissional.descricao ||
                                "Este profissional ainda não adicionou uma biografia."
                            }
                        </p>

                    </div>


                    <!-- REDE SOCIAL -->

                    ${redeSocialHTML}


                    <div class="perfil-divisoria"></div>


                    <!-- PORTFÓLIO -->

                    <div class="perfil-publicacoes">

                        <div class="titulo-portfolio">

                            <h2>
                                Portfólio
                            </h2>

                            <span>
                                Trabalhos e projetos
                            </span>

                        </div>

                        ${portfolioHTML}

                    </div>

                </div>

            `;

        })

        .catch(function (erro) {

            console.log(
                "Erro ao carregar perfil:",
                erro
            );

            areaPerfil.innerHTML = `
                <div class="perfil-instagram">

                    <div class="perfil-erro">

                        <h2>
                            Erro ao carregar perfil
                        </h2>

                        <p>
                            Verifique se o servidor
                            está funcionando.
                        </p>

                    </div>

                </div>
            `;

        });

}


/* ============================= */
/* INICIAR CONVERSA */
/* ============================= */

function iniciarConversa(id) {

    window.location.href =
        "mensagens.html?id=" + id;

}


/* ============================= */
/* INICIAR PERFIL */
/* ============================= */

carregarPerfil();


/* ============================= */
/* INICIAR FAVORITOS */
/* ============================= */

carregarFavoritos();


/* ========================================= */
/* PESQUISA DE SERVIÇOS */
/* ========================================= */

const servicosDisponiveis = [

    "Barbeiro",
    "Cabeleireira",
    "Manicure",
    "Eletricista",
    "Encanador",
    "Técnico de informática",
    "Fotógrafo",
    "Designer",
    "Professor"

];


const campoBuscaServico =
    document.getElementById(
        "buscaServico"
    );

const caixaSugestoes =
    document.getElementById(
        "sugestoesServico"
    );


if (
    campoBuscaServico &&
    caixaSugestoes
) {

    campoBuscaServico.addEventListener(
        "input",
        function () {

            const texto =
                this.value
                    .trim()
                    .toLowerCase();

            caixaSugestoes.innerHTML = "";

            if (!texto) {

                caixaSugestoes.style.display =
                    "none";

                return;

            }

            const resultados =
                servicosDisponiveis.filter(
                    function (servico) {

                        return servico
                            .toLowerCase()
                            .includes(texto);

                    }
                );


            if (resultados.length === 0) {

                caixaSugestoes.style.display =
                    "none";

                return;

            }


            resultados.forEach(
                function (servico) {

                    const botao =
                        document.createElement(
                            "button"
                        );

                    botao.type =
                        "button";

                    botao.className =
                        "sugestao-servico";

                    botao.textContent =
                        servico;


                    botao.addEventListener(
                        "click",
                        function () {

                            campoBuscaServico.value =
                                servico;

                            caixaSugestoes.innerHTML =
                                "";

                            caixaSugestoes.style.display =
                                "none";

                        }
                    );


                    caixaSugestoes.appendChild(
                        botao
                    );

                }
            );


            caixaSugestoes.style.display =
                "block";

        }
    );


    document.addEventListener(
        "click",
        function (evento) {

            if (
                !campoBuscaServico.contains(
                    evento.target
                ) &&
                !caixaSugestoes.contains(
                    evento.target
                )
            ) {

                caixaSugestoes.style.display =
                    "none";

            }

        }
    );

}


/* ============================= */
/* CONFIRMAR SERVIÇO */
/* ============================= */

function confirmarServico() {

    const card =
        document.getElementById(
            "confirmacaoServico"
        );

    if (!card) {
        return;
    }

    card.innerHTML = `
        <div class="icone-confirmacao">
            ✅
        </div>

        <div class="conteudo-confirmacao">

            <span class="titulo-confirmacao">
                Serviço confirmado
            </span>

            <p>
                Você confirmou o fechamento deste serviço com o profissional.
            </p>

            <div class="status-confirmacao confirmado">

                <span class="bolinha-status"></span>

                Serviço confirmado

            </div>

        </div>
    `;

}


/* ============================= */
/* RECUSAR SERVIÇO */
/* ============================= */

function recusarServico() {

    const card =
        document.getElementById(
            "confirmacaoServico"
        );

    if (!card) {
        return;
    }

    card.innerHTML = `
        <div class="icone-confirmacao">
            ❌
        </div>

        <div class="conteudo-confirmacao">

            <span class="titulo-confirmacao">
                Serviço não confirmado
            </span>

            <p>
                Você recusou a confirmação do serviço.
            </p>

            <div class="status-confirmacao recusado">

                <span class="bolinha-status"></span>

                Aguardando novo acordo

            </div>

        </div>
    `;

}