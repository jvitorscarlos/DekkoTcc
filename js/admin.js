document.addEventListener("DOMContentLoaded", function () {


verificarLogin();


});

function verificarLogin() {


fetch("../routes/adm.php?acao=verificarLogin")
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        if (!dados.sucesso) {
            window.location.href = "login-admin.html";
            return;
        }

        carregarDashboard();
        carregarClientes();
        carregarProfissionais();

    })
    .catch(function (erro) {

        console.error(erro);

        window.location.href = "login-admin.html";

    });


}

function sairAdmin() {


const confirmar = confirm(
    "Deseja realmente sair do painel administrativo?"
);

if (!confirmar) {
    return;
}

fetch("../routes/adm.php?acao=logout", {
    method: "POST"
})
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        if (dados.sucesso) {

            window.location.replace("login-admin.html");

        } else {

            alert(dados.mensagem);

        }

    })
    .catch(function (erro) {

        console.error(erro);

        alert("Erro ao sair do painel.");

    });


}

function carregarDashboard() {


fetch("../routes/adm.php?acao=dashboard")
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        if (!dados.sucesso) {
            return;
        }

        document.getElementById("totalClientes").textContent = dados.clientes;
        document.getElementById("totalProfissionais").textContent = dados.profissionais;
        document.getElementById("totalConversas").textContent = dados.conversas;
        document.getElementById("totalFavoritos").textContent = dados.favoritos;

        document.getElementById("contadorClientes").textContent =
            dados.clientes + (dados.clientes === 1 ? " cliente" : " clientes");

        document.getElementById("contadorProfissionais").textContent =
            dados.profissionais + (dados.profissionais === 1 ? " profissional" : " profissionais");

    })
    .catch(function (erro) {
        console.error(erro);
    });


}

function carregarClientes() {


fetch("../routes/adm.php?acao=listarClientes")
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        if (!dados.sucesso) {
            return;
        }

        const corpo = document.getElementById("corpoClientes");

        corpo.innerHTML = "";

        dados.clientes.forEach(function (cliente) {

            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>
                    ${
                        cliente.foto
                        ? `<img src="../${cliente.foto}" width="45" height="45">`
                        : "Sem foto"
                    }
                </td>

                <td>${cliente.nome}</td>

                <td>${cliente.email}</td>

                <td>${cliente.telefone || "-"}</td>

                <td>${cliente.regiao || "-"}</td>

                <td>
                    <button
                        type="button"
                        onclick="visualizarCliente(${cliente.id_cliente})"
                    >
                        Visualizar
                    </button>

                    <button
                        type="button"
                        onclick="editarCliente(${cliente.id_cliente})"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        onclick="excluirCliente(${cliente.id_cliente})"
                    >
                        Excluir
                    </button>
                </td>
            `;

            corpo.appendChild(linha);

        });

    })
    .catch(function (erro) {
        console.error(erro);
    });


}

function carregarProfissionais() {


fetch("../routes/adm.php?acao=listarProfissionais")
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        if (!dados.sucesso) {
            return;
        }

        const corpo = document.getElementById("corpoProfissionais");

        corpo.innerHTML = "";

        dados.profissionais.forEach(function (profissional) {

            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>
                    ${
                        profissional.foto
                        ? `<img src="../${profissional.foto}" width="45" height="45">`
                        : "Sem foto"
                    }
                </td>

                <td>${profissional.nome}</td>

                <td>${profissional.email}</td>

                <td>${profissional.telefone || "-"}</td>

                <td>${profissional.regiao || "-"}</td>

                <td>${profissional.servico || "-"}</td>

                <td>
                    <button
                        type="button"
                        onclick="visualizarProfissional(${profissional.id_profissional})"
                    >
                        Visualizar
                    </button>

                    <button
                        type="button"
                        onclick="editarProfissional(${profissional.id_profissional})"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        onclick="excluirProfissional(${profissional.id_profissional})"
                    >
                        Excluir
                    </button>
                </td>
            `;

            corpo.appendChild(linha);

        });

    })
    .catch(function (erro) {
        console.error(erro);
    });


}

function visualizarCliente(id) {


fetch("../routes/adm.php?acao=visualizarCliente&id=" + id)
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        if (!dados.sucesso) {
            alert(dados.mensagem);
            return;
        }

        const cliente = dados.cliente;

        alert(
            "Nome: " + cliente.nome +
            "\nE-mail: " + cliente.email +
            "\nTelefone: " + (cliente.telefone || "-") +
            "\nRegião: " + (cliente.regiao || "-")
        );

    })
    .catch(function (erro) {
        console.error(erro);
        alert("Erro ao visualizar cliente.");
    });


}

function visualizarProfissional(id) {


fetch("../routes/adm.php?acao=visualizarProfissional&id=" + id)
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        if (!dados.sucesso) {
            alert(dados.mensagem);
            return;
        }

        const profissional = dados.profissional;

        alert(
            "Nome: " + profissional.nome +
            "\nE-mail: " + profissional.email +
            "\nTelefone: " + (profissional.telefone || "-") +
            "\nEndereço: " + (profissional.endereco || "-") +
            "\nRegião: " + (profissional.regiao || "-") +
            "\nServiço: " + (profissional.servico || "-") +
            "\nBiografia: " + (profissional.biografia || "-")
        );

    })
    .catch(function (erro) {
        console.error(erro);
        alert("Erro ao visualizar profissional.");
    });


}

function editarCliente(id) {


const nome = prompt("Novo nome:");
const email = prompt("Novo e-mail:");
const telefone = prompt("Novo telefone:");
const idRegiao = prompt("ID da região (1 a 4):");

if (
    nome === null ||
    email === null ||
    telefone === null ||
    idRegiao === null
) {
    return;
}

const dados = new FormData();

dados.append("id", id);
dados.append("nome", nome);
dados.append("email", email);
dados.append("telefone", telefone);
dados.append("id_regiao", idRegiao);

fetch("../routes/adm.php?acao=atualizarCliente", {
    method: "POST",
    body: dados
})
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        alert(dados.mensagem);

        if (dados.sucesso) {
            carregarClientes();
            carregarDashboard();
        }

    })
    .catch(function (erro) {
        console.error(erro);
        alert("Erro ao editar cliente.");
    });


}

function editarProfissional(id) {


const nome = prompt("Novo nome:");
const email = prompt("Novo e-mail:");
const telefone = prompt("Novo telefone:");
const endereco = prompt("Novo endereço:");
const biografia = prompt("Nova biografia:");
const idRegiao = prompt("ID da região (1 a 4):");

if (
    nome === null ||
    email === null ||
    telefone === null ||
    endereco === null ||
    biografia === null ||
    idRegiao === null
) {
    return;
}

const dados = new FormData();

dados.append("id", id);
dados.append("nome", nome);
dados.append("email", email);
dados.append("telefone", telefone);
dados.append("endereco", endereco);
dados.append("biografia", biografia);
dados.append("id_regiao", idRegiao);

fetch("../routes/adm.php?acao=atualizarProfissional", {
    method: "POST",
    body: dados
})
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        alert(dados.mensagem);

        if (dados.sucesso) {
            carregarProfissionais();
            carregarDashboard();
        }

    })
    .catch(function (erro) {
        console.error(erro);
        alert("Erro ao editar profissional.");
    });


}

function excluirCliente(id) {


const confirmar = confirm(
    "Deseja realmente excluir este cliente?"
);

if (!confirmar) {
    return;
}

const dados = new FormData();

dados.append("id", id);

fetch("../routes/adm.php?acao=excluirCliente", {
    method: "POST",
    body: dados
})
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        alert(dados.mensagem);

        if (dados.sucesso) {
            carregarClientes();
            carregarDashboard();
        }

    })
    .catch(function (erro) {
        console.error(erro);
        alert("Erro ao excluir cliente.");
    });


}

function excluirProfissional(id) {


const confirmar = confirm(
    "Deseja realmente excluir este profissional?"
);

if (!confirmar) {
    return;
}

const dados = new FormData();

dados.append("id", id);

fetch("../routes/adm.php?acao=excluirProfissional", {
    method: "POST",
    body: dados
})
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {

        alert(dados.mensagem);

        if (dados.sucesso) {
            carregarProfissionais();
            carregarDashboard();
        }

    })
    .catch(function (erro) {
        console.error(erro);
        alert("Erro ao excluir profissional.");
    });


}

function pesquisar() {


const termo = document
    .getElementById("pesquisa")
    .value
    .toLowerCase();

const linhasClientes = document.querySelectorAll(
    "#corpoClientes tr"
);

const linhasProfissionais = document.querySelectorAll(
    "#corpoProfissionais tr"
);

linhasClientes.forEach(function (linha) {

    const texto = linha.textContent.toLowerCase();

    linha.style.display =
        texto.includes(termo) ? "" : "none";

});

linhasProfissionais.forEach(function (linha) {

    const texto = linha.textContent.toLowerCase();

    linha.style.display =
        texto.includes(termo) ? "" : "none";

});


}

function filtrarRegiao() {


const regiao = document
    .getElementById("regiao")
    .value
    .toLowerCase();

const linhasClientes = document.querySelectorAll(
    "#corpoClientes tr"
);

const linhasProfissionais = document.querySelectorAll(
    "#corpoProfissionais tr"
);

linhasClientes.forEach(function (linha) {

    const colunaRegiao = linha.cells[4];

    if (!regiao || !colunaRegiao) {
        linha.style.display = "";
        return;
    }

    linha.style.display =
        colunaRegiao.textContent
            .toLowerCase()
            .includes(regiao)
            ? ""
            : "none";

});

linhasProfissionais.forEach(function (linha) {

    const colunaRegiao = linha.cells[4];

    if (!regiao || !colunaRegiao) {
        linha.style.display = "";
        return;
    }

    linha.style.display =
        colunaRegiao.textContent
            .toLowerCase()
            .includes(regiao)
            ? ""
            : "none";

});


}
