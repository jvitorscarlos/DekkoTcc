/* ========================================= */
/* DEKKO - PESQUISAR.JS                     */
/* Pesquisa e listagem de profissionais     */
/* ========================================= */


/* ========================================= */
/* SERVIÇOS DISPONÍVEIS                     */
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


/* ========================================= */
/* CRIAR CARD DO PROFISSIONAL               */
/* ========================================= */

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
                ? profissional.nome
                    .charAt(0)
                    .toUpperCase()
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


/* ========================================= */
/* LISTAR PROFISSIONAIS                     */
/* ========================================= */

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


/* ========================================= */
/* BUSCAR PROFISSIONAIS                     */
/* ========================================= */

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

        areaResultados.style.display =
            "block";

    }


    listarProfissionais(
        servico,
        regiao
    );
}


/* ========================================= */
/* SUGESTÕES DE SERVIÇOS                    */
/* ========================================= */

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


    /* ===================================== */
    /* FECHAR SUGESTÕES AO CLICAR FORA       */
    /* ===================================== */

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


/* ========================================= */
/* VER PERFIL                                */
/* ========================================= */

function verPerfil(id) {

    window.location.href =
        "perfil.html?id=" + id;

}