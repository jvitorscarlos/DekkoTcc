function visualizar(nome) {
    alert("Visualizando o perfil de " + nome);
}

function editar(nome) {
    alert("A área de edição de " + nome + " será aberta.");
}

function excluir(botao) {
    let confirmar = confirm(
        "Deseja realmente excluir este cadastro?"
    );

    if (confirmar) {
        botao.closest("tr").remove();
    }
}

function pesquisar() {
    let texto = document
        .getElementById("pesquisa")
        .value
        .toLowerCase();

    let tabelas = document.querySelectorAll("tbody");

    tabelas.forEach(function (tabela) {
        let linhas = tabela.querySelectorAll("tr");

        linhas.forEach(function (linha) {
            let conteudo = linha.innerText.toLowerCase();

            if (conteudo.includes(texto)) {
                linha.style.display = "";
            } else {
                linha.style.display = "none";
            }
        });
    });
}

function filtrarRegiao() {
    let regiao = document
        .getElementById("regiao")
        .value
        .toLowerCase();

    let tabelas = document.querySelectorAll("tbody");

    tabelas.forEach(function (tabela) {
        let linhas = tabela.querySelectorAll("tr");

        linhas.forEach(function (linha) {
            let conteudo = linha.innerText.toLowerCase();

            if (
                regiao === "" ||
                conteudo.includes(regiao)
            ) {
                linha.style.display = "";
            } else {
                linha.style.display = "none";
            }
        });
    });
}