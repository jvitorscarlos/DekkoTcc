/* ========================================= */
/* DEKKO - FAVORITOS.JS                     */
/* Sistema de favoritos dos profissionais   */
/* ========================================= */


/* ========================================= */
/* OBTER FAVORITOS                           */
/* ========================================= */

function obterFavoritos() {

    let favoritos =
        localStorage.getItem(
            "dekkoFavoritos"
        );


    if (!favoritos) {
        return [];
    }


    try {

        return JSON.parse(
            favoritos
        );

    } catch (erro) {

        return [];

    }
}


/* ========================================= */
/* SALVAR FAVORITOS                          */
/* ========================================= */

function salvarFavoritos(favoritos) {

    localStorage.setItem(
        "dekkoFavoritos",
        JSON.stringify(favoritos)
    );
}


/* ========================================= */
/* VERIFICAR SE ESTÁ FAVORITADO              */
/* ========================================= */

function profissionalFavoritado(id) {

    let favoritos =
        obterFavoritos();


    return favoritos.includes(
        String(id)
    );
}


/* ========================================= */
/* ALTERNAR FAVORITO                         */
/* ========================================= */

function alternarFavorito(
    id,
    botao
) {

    let idProfissional =
        String(id);


    let favoritos =
        obterFavoritos();


    let posicao =
        favoritos.indexOf(
            idProfissional
        );


    /* ===================================== */
    /* ADICIONAR                              */
    /* ===================================== */

    if (posicao === -1) {

        favoritos.push(
            idProfissional
        );


        if (botao) {

            botao.textContent =
                "★";


            botao.classList.add(
                "favoritado"
            );


            botao.setAttribute(
                "aria-label",
                "Remover profissional dos favoritos"
            );

        }

    }


    /* ===================================== */
    /* REMOVER                               */
    /* ===================================== */

    else {

        favoritos.splice(
            posicao,
            1
        );


        if (botao) {

            botao.textContent =
                "☆";


            botao.classList.remove(
                "favoritado"
            );


            botao.setAttribute(
                "aria-label",
                "Favoritar profissional"
            );

        }

    }


    salvarFavoritos(
        favoritos
    );


    carregarFavoritos();
}


/* ========================================= */
/* CARREGAR FAVORITOS                        */
/* ========================================= */

function carregarFavoritos() {

    let listaFavoritos =
        document.getElementById(
            "listaFavoritos"
        );


    if (!listaFavoritos) {
        return;
    }


    let favoritos =
        obterFavoritos();


    /* ===================================== */
    /* NENHUM FAVORITO                       */
    /* ===================================== */

    if (favoritos.length === 0) {

        listaFavoritos.innerHTML = `

            <p class="mensagem-busca">

                Você ainda não favoritou nenhum profissional.

            </p>

        `;

        return;
    }


    /* ===================================== */
    /* BUSCAR PROFISSIONAIS                  */
    /* ===================================== */

    fetch(
        "../routes/profissional.php?acao=listar"
    )

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


            /* ============================= */
            /* FILTRAR FAVORITOS             */
            /* ============================= */

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


            listaFavoritos.innerHTML =
                "";


            /* ============================= */
            /* NENHUM ENCONTRADO             */
            /* ============================= */

            if (
                profissionaisFavoritos.length === 0
            ) {

                listaFavoritos.innerHTML = `

                    <p class="mensagem-busca">

                        Você ainda não favoritou nenhum profissional.

                    </p>

                `;

                return;
            }


            /* ============================= */
            /* MONTAR CARDS                  */
            /* ============================= */

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


/* ========================================= */
/* INICIAR FAVORITOS                         */
/* ========================================= */

carregarFavoritos();