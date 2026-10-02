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


function finalizarPerfilCliente(event) {
    event.preventDefault();

    const nome = document.getElementById("nomeCliente");
    const regiao = document.getElementById("regiaoCliente");
    const telefone = document.getElementById("telefoneCliente");
    const foto = document.getElementById("fotoCliente");

    if (!nome || !regiao || !telefone || !foto) {
        return;
    }

    if (!nome.value.trim()) {
        alert("Digite seu nome.");
        nome.focus();
        return;
    }

    if (!telefone.value.trim()) {
        alert("Digite seu telefone.");
        telefone.focus();
        return;
    }

    if (!regiao.value) {
        alert("Selecione sua região.");
        regiao.focus();
        return;
    }

    if (!foto.files || foto.files.length === 0) {
        alert("Escolha uma foto de perfil.");
        return;
    }

    const arquivo = foto.files[0];

    const leitor = new FileReader();

    leitor.onload = function (e) {

        const dados = new FormData();

        dados.append("nome", nome.value);
        dados.append("telefone", telefone.value);
        dados.append("regiao", regiao.value);

        /*
         * Por enquanto enviamos a imagem como
         * uma informação temporária.
         */
        dados.append("foto", e.target.result);

        fetch("../routes/cliente.php?acao=atualizarPerfil", {
            method: "POST",
            body: dados
        })
            .then(function (resposta) {
                return resposta.json();
            })
            .then(function (dados) {

                alert(dados.mensagem);

                if (dados.sucesso) {
                    window.location.href = "pesquisar.html";
                }

            })
            .catch(function (erro) {

                console.log(erro);

                alert(
                    "Erro ao conectar com o servidor. Veja o Console (F12)."
                );

            });
    };

    leitor.readAsDataURL(arquivo);
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

});