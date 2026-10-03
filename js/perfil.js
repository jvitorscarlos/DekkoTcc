function carregarPerfil() {

    let areaPerfil =
        document.getElementById("perfilProfissional");

    if (!areaPerfil) {
        return;
    }

    let parametros =
        new URLSearchParams(window.location.search);

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


    /* ========================================= */
    /* BUSCAR PROFISSIONAL                       */
    /* ========================================= */

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


            /* ========================================= */
            /* FOTO DE PERFIL                            */
            /* ========================================= */

            let fotoPerfil =
                profissional.foto;

            let avatarHTML = "";

            if (fotoPerfil) {

                let caminhoFoto =
                    fotoPerfil;

                if (!caminhoFoto.startsWith("../")) {
                    caminhoFoto =
                        "../" + caminhoFoto;
                }

                avatarHTML = `
                    <img
                        src="${caminhoFoto}"
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


            /* ========================================= */
            /* REDE SOCIAL                               */
            /* ========================================= */

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


            /* ========================================= */
            /* BUSCAR PORTFÓLIO DO PROFISSIONAL          */
            /* ========================================= */

            return fetch(
                "../routes/portfolio.php?acao=listarPorId&id=" +
                id
            )

                .then(function (respostaPortfolio) {
                    return respostaPortfolio.json();
                })

                .then(function (dadosPortfolio) {

                    let fotosPortfolio = [];

                    if (
                        dadosPortfolio.sucesso &&
                        Array.isArray(dadosPortfolio.fotos)
                    ) {

                        fotosPortfolio =
                            dadosPortfolio.fotos;
                    }


                    /* ========================================= */
                    /* MONTAR PORTFÓLIO                           */
                    /* ========================================= */

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


                    if (fotosPortfolio.length > 0) {

                        portfolioHTML = `
                            <div class="galeria-portfolio">

                                ${
                                    fotosPortfolio
                                        .slice(0, 6)
                                        .map(function (
                                            foto,
                                            indice
                                        ) {

                                            let caminhoFoto =
                                                foto.foto ||
                                                foto;

                                            if (
                                                !caminhoFoto.startsWith("../")
                                            ) {
                                                caminhoFoto =
                                                    "../" +
                                                    caminhoFoto;
                                            }

                                            return `
                                                <div class="foto-portfolio">

                                                    <img
                                                        src="${caminhoFoto}"
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


                    /* ========================================= */
                    /* PERFIL COMPLETO                           */
                    /* ========================================= */

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
                                        profissional.biografia ||
                                        "Este profissional ainda não adicionou uma biografia."
                                    }

                                </p>

                            </div>


                            <!-- REDE SOCIAL -->

                            ${redeSocialHTML}


                            <div class="perfil-divisoria">
                            </div>


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

                });

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


/* ========================================= */
/* INICIAR CONVERSA                          */
/* ========================================= */

function iniciarConversa(id) {

    if (!id) {

        alert(
            "Profissional não informado."
        );

        return;
    }


    const dados =
        new FormData();

    dados.append(
        "id_profissional",
        id
    );


    fetch(
        "../routes/conversa.php?acao=criar",
        {
            method: "POST",
            body: dados
        }
    )

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (resultado) {

            console.log(
                "Resposta criar conversa:",
                resultado
            );


            if (!resultado.sucesso) {

                alert(
                    resultado.mensagem
                );

                return;
            }


            window.location.href =
                "mensagens.html?id_conversa=" +
                resultado.id_conversa;

        })

        .catch(function (erro) {

            console.log(
                "Erro ao iniciar conversa:",
                erro
            );

            alert(
                "Não foi possível iniciar a conversa."
            );

        });
}


/* ========================================= */
/* INICIAR PERFIL                            */
/* ========================================= */

carregarPerfil();