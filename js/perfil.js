/* ========================================= */
/* DEKKO - PERFIL.JS                        */
/* Exibição do perfil do profissional       */
/* ========================================= */


/* ========================================= */
/* CARREGAR PERFIL                          */
/* ========================================= */

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


            /* ================================= */
            /* FOTO DE PERFIL                    */
            /* ================================= */

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


            /* ================================= */
            /* REDE SOCIAL                       */
            /* ================================= */

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


            /* ================================= */
            /* PORTFÓLIO                         */
            /* ================================= */

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


            /* ================================= */
            /* PERFIL COMPLETO                   */
            /* ================================= */

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
/* INICIAR CONVERSA                         */
/* ========================================= */

function iniciarConversa(id) {

    window.location.href =
        "mensagens.html?id=" + id;
}


/* ========================================= */
/* INICIAR PERFIL                            */
/* ========================================= */

carregarPerfil();
const exemplos = [
    {
        emoji: "🔌",
        nome: "Instalação de tomadas",
        cor1: "#ffb900",
        cor2: "#ff9f00"
    },
    {
        emoji: "💡",
        nome: "Troca de iluminação",
        cor1: "#ffd43b",
        cor2: "#ffb900"
    },
    {
        emoji: "⚡",
        nome: "Quadro de energia",
        cor1: "#222222",
        cor2: "#111111"
    },
    {
        emoji: "🔦",
        nome: "Iluminação externa",
        cor1: "#ff9f00",
        cor2: "#e68a00"
    },
    {
        emoji: "🏠",
        nome: "Instalação residencial",
        cor1: "#333333",
        cor2: "#1a1a1a"
    },
    {
        emoji: "🛠️",
        nome: "Manutenção elétrica",
        cor1: "#ffc933",
        cor2: "#ffb900"
    }
];

function criarExemplo(n) {
    const e = exemplos[n - 1];

    if (!e) {
        return "";
    }

    const escuro =
        e.cor1 === "#222222" ||
        e.cor1 === "#333333";

    const textoCor = escuro ? "#ffb900" : "#111111";

    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
        '<defs>' +
        '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + e.cor1 + '"/>' +
        '<stop offset="1" stop-color="' + e.cor2 + '"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="400" height="400" fill="url(#g)"/>' +
        '<text x="200" y="215" font-size="130" text-anchor="middle">' +
        e.emoji +
        '</text>' +
        '<text x="200" y="330" font-size="26" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" fill="' +
        textoCor +
        '">' +
        e.nome +
        '</text>' +
        '</svg>';

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

document
    .querySelectorAll(".foto-portfolio img")
    .forEach(function (img) {

        img.addEventListener("error", function () {
            img.onerror = null;
            img.src = criarExemplo(Number(img.dataset.n));
        });

        if (img.complete && img.naturalWidth === 0) {
            img.src = criarExemplo(Number(img.dataset.n));
        }
    });