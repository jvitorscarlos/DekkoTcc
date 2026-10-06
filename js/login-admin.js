document.addEventListener("DOMContentLoaded", function () {


const formulario = document.getElementById("formLoginAdmin");

formulario.addEventListener("submit", function (evento) {

    evento.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (email === "" || senha === "") {
        alert("Preencha o e-mail e a senha.");
        return;
    }

    const dados = new FormData();

    dados.append("email", email);
    dados.append("senha", senha);

    fetch("../routes/adm.php?acao=login", {
        method: "POST",
        body: dados,
        credentials: "same-origin"
    })
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        if (dados.sucesso) {

            window.location.replace("admin.html");

        } else {

            alert(dados.mensagem);

        }

    })
    .catch(function (erro) {

        console.error(erro);

        alert("Erro ao realizar o login.");

    });

});


});