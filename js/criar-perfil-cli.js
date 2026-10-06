// Se a página for aberta com ?editar=1, ela funciona como "Editar perfil"
const modoEditar =
    new URLSearchParams(window.location.search).get("editar") === "1";

// true quando o cliente já tem uma foto salva (modo editar)
let temFotoAtual = false;


// Para onde voltar no modo editar: pesquisar (se veio de lá) ou mensagens
function destinoVoltar() {
    if (document.referrer.indexOf("pesquisar.html") !== -1) {
        return "pesquisar.html";
    }

    return "mensagens.html";
}


function mostrarFotoCliente() {
    const input = document.getElementById("fotoCliente");
    const preview = document.getElementById("avatarPreviewCliente");

    if (!input || !preview || !input.files || input.files.length === 0) {
        return;
    }

    const arquivo = input.files[0];

    const leitor = new FileReader();

    leitor.onload = function (e) {
        preview.innerHTML = `
            <img
                src="${e.target.result}"
                alt="Prévia da foto de perfil">
        `;
    };

    leitor.readAsDataURL(arquivo);
}


// Troca textos da página para "Editar perfil" e carrega os dados atuais
function prepararModoEditar() {
    document.title = "Dekko - Editar perfil";

    const tag = document.getElementById("tagPagina");
    const titulo = document.getElementById("tituloPagina");
    const subtitulo = document.getElementById("subtituloPagina");
    const aviso = document.getElementById("avisoFoto");
    const botaoSalvar = document.getElementById("btnSalvarPerfil");
    const botaoVoltar = document.getElementById("btnVoltar");

    if (tag) tag.textContent = "👤 DEKKO • EDITAR PERFIL";

    if (titulo) titulo.innerHTML = "Edite seu <span>perfil.</span>";

    if (subtitulo) {
        subtitulo.textContent =
            "Troque sua foto ou o nome que aparece para os profissionais.";
    }

    if (aviso) {
        aviso.textContent = "Escolha uma nova foto só se quiser trocar a atual.";
    }

    if (botaoSalvar) botaoSalvar.textContent = "Salvar alterações";

    if (botaoVoltar) {
        botaoVoltar.onclick = function () {
            window.location.href = destinoVoltar();
        };
    }

    fetch("../routes/cliente.php?acao=meuPerfil")
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (dados) {

            if (!dados.sucesso) {
                alert("Você precisa estar logado.");
                window.location.href = "index.html";
                return;
            }

            const nome = document.getElementById("nomeCliente");
            const preview = document.getElementById("avatarPreviewCliente");

            if (nome) nome.value = dados.cliente.nome || "";

            const foto = dados.cliente.foto;

            // foto de verdade tem caminho (ex.: img/clientes/...)
            if (foto && foto.indexOf("/") !== -1 && preview) {

                temFotoAtual = true;

                preview.innerHTML = `
                    <img
                        src="../${foto}"
                        alt="Foto atual do perfil">
                `;
            }
        })
        .catch(function (erro) {
            console.log("Erro ao carregar perfil:", erro);
        });
}


function finalizarPerfilCliente(event) {
    event.preventDefault();

    const nome = document.getElementById("nomeCliente");
    const foto = document.getElementById("fotoCliente");

    if (!nome || !foto) {
        return;
    }

    if (!nome.value.trim()) {
        alert("Digite seu nome.");
        nome.focus();
        return;
    }

    const escolheuFoto = foto.files && foto.files.length > 0;

    // a foto só é obrigatória se o cliente ainda não tem uma
    if (!escolheuFoto && !temFotoAtual) {
        alert("Escolha uma foto de perfil.");
        return;
    }

    const dados = new FormData();

    dados.append("nome", nome.value.trim());

    if (!escolheuFoto) {
        enviarPerfil(dados);
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function (e) {

        /*
         * A imagem vai como texto (base64);
         * o servidor salva em img/clientes/.
         */
        dados.append("foto", e.target.result);

        enviarPerfil(dados);
    };

    leitor.readAsDataURL(foto.files[0]);
}


function enviarPerfil(dados) {

    fetch("../routes/cliente.php?acao=atualizarPerfil", {
        method: "POST",
        body: dados
    })
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (resposta) {

            alert(resposta.mensagem);

            if (resposta.sucesso) {
                window.location.href = modoEditar
                    ? destinoVoltar()
                    : "pesquisar.html";
            }

        })
        .catch(function (erro) {

            console.log(erro);

            alert(
                "Erro ao conectar com o servidor. Veja o Console (F12)."
            );

        });
}


document.addEventListener("DOMContentLoaded", function () {

    const foto = document.getElementById("fotoCliente");
    const formulario = document.getElementById("formPerfilCliente");

    if (foto) {
        foto.addEventListener("change", mostrarFotoCliente);
    }

    if (formulario) {
        formulario.addEventListener(
            "submit",
            finalizarPerfilCliente
        );
    }

    if (modoEditar) {
        prepararModoEditar();
    }

});