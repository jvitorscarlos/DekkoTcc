/* ========================================= */
/* DEKKO - MENSAGENS.JS                     */
/* Chat e funções da página de mensagens    */
/* ========================================= */


/* ========================================= */
/* CONFIRMAR SERVIÇO                         */
/* ========================================= */

function confirmarServico() {

    const card =
        document.querySelector(".confirmacao-servico");

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


/* ========================================= */
/* RECUSAR SERVIÇO                           */
/* ========================================= */

function recusarServico() {

    const card =
        document.querySelector(".confirmacao-servico");

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


/* ========================================= */
/* MENU DO PERFIL                            */
/* ========================================= */

function alternarMenuPerfilMensagens() {

    const menu =
        document.getElementById(
            "menuPerfilMensagens"
        );

    if (!menu) {
        return;
    }

    menu.classList.toggle("aberto");
}


/* ========================================= */
/* EDITAR PERFIL                             */
/* ========================================= */

function editarPerfilProfissional() {

    alert(
        "Aqui será aberta a tela de edição do perfil do profissional."
    );

}


/* ========================================= */
/* EDITAR PORTFÓLIO                          */
/* ========================================= */

function editarPortfolio() {

    alert(
        "Aqui será aberta a tela de edição do portfólio."
    );

}


/* ========================================= */
/* SAIR DA CONTA                             */
/* ========================================= */

function sairContaProfissional() {

    const confirmar =
        confirm(
            "Deseja realmente sair da sua conta?"
        );

    if (confirmar) {

        window.location.href =
            "index.html";

    }

}


/* ========================================= */
/* FECHAR MENU AO CLICAR FORA                */
/* ========================================= */

document.addEventListener(
    "click",
    function (evento) {

        const perfil =
            document.querySelector(
                ".perfil-mensagens"
            );

        const menu =
            document.getElementById(
                "menuPerfilMensagens"
            );

        if (
            perfil &&
            menu &&
            !perfil.contains(evento.target)
        ) {

            menu.classList.remove("aberto");

        }

    }
);