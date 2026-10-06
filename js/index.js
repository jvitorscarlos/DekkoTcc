/* ========================================= */
/* DEKKO - INDEX.JS                          */
/* Login, cadastro e modais da página inicial */
/* ========================================= */


/* ========================================= */
/* FECHAR MODAIS                             */
/* ========================================= */

function fechar() {
    document
        .querySelectorAll(".modal")
        .forEach(function (modal) {
            modal.classList.remove("ativo");
        });
}


/* ========================================= */
/* ABRIR LOGIN                               */
/* ========================================= */

function abrirLogin() {
    fechar();

    let login = document.getElementById("login");

    if (login) {
        login.classList.add("ativo");
    }
}


/* ========================================= */
/* ABRIR CADASTRO                            */
/* ========================================= */

function abrirCadastro() {
    fechar();

    let cadastro = document.getElementById("cadastro");

    if (cadastro) {
        cadastro.classList.add("ativo");
    }
}


/* ========================================= */
/* ABRIR CADASTRO DE CLIENTE                 */
/* ========================================= */

function abrirCliente() {
    fechar();

    let cliente = document.getElementById("cliente");

    if (cliente) {
        cliente.classList.add("ativo");
    }
}


/* ========================================= */
/* ABRIR CADASTRO DE PROFISSIONAL            */
/* ========================================= */

function abrirProfissional() {
    fechar();

    let profissional =
        document.getElementById("profissional");

    if (profissional) {
        profissional.classList.add("ativo");
    }
}


/* ========================================= */
/* OUTRO SERVIÇO                             */
/* ========================================= */

function verificarOutroServico() {
    let checkboxOutro =
        document.getElementById("checkboxOutro");

    let outro =
        document.getElementById("outro");

    let campo =
        document.getElementById("outroServico");

    if (!checkboxOutro || !outro || !campo) {
        return;
    }

    if (checkboxOutro.checked) {
        outro.classList.add("ativo");
        campo.required = true;
    } else {
        outro.classList.remove("ativo");
        campo.required = false;
        campo.value = "";
    }
}


/* ========================================= */
/* ABRIR LOGIN DE CLIENTE                    */
/* ========================================= */

function abrirLoginCliente() {
    fechar();

    let loginCliente =
        document.getElementById("loginCliente");

    if (loginCliente) {
        loginCliente.classList.add("ativo");
    }
}


/* ========================================= */
/* ABRIR LOGIN DE PROFISSIONAL               */
/* ========================================= */

function abrirLoginProfissional() {
    fechar();

    let loginProfissional =
        document.getElementById("loginProfissional");

    if (loginProfissional) {
        loginProfissional.classList.add("ativo");
    }
}


/* ========================================= */
/* LOGIN DO CLIENTE                          */
/* ========================================= */

function fazerLoginCliente(event) {
    event.preventDefault();

    let form = event.target;

    fetch(
        "../routes/cliente.php?acao=login",
        {
            method: "POST",
            body: new FormData(form)
        }
    )
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (dados) {

            console.log(
                "Resposta login cliente:",
                dados
            );

            alert(dados.mensagem);

            if (!dados.sucesso) {
                return;
            }

            form.reset();
            fechar();

            /* CLIENTE NOVO */

            if (
                Number(
                    dados.cliente.perfil_completo
                ) === 0
            ) {
                window.location.href =
                    "criar-perfil-cli.html";

                return;
            }

            /* CLIENTE HABITUADO */

            window.location.href =
                "pesquisar.html";
        })
        .catch(function (erro) {

            console.log(
                "Erro no login do cliente:",
                erro
            );

            alert(
                "Erro ao conectar com o servidor. Veja o Console (F12)."
            );
        });
}


/* ========================================= */
/* LOGIN DO PROFISSIONAL                     */
/* ========================================= */

function fazerLoginProfissional(event) {
    event.preventDefault();

    let form = event.target;

    fetch(
        "../routes/profissional.php?acao=login",
        {
            method: "POST",
            body: new FormData(form)
        }
    )
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (dados) {

            console.log(
                "Resposta login profissional:",
                dados
            );

            alert(dados.mensagem);

            if (!dados.sucesso) {
                return;
            }

            form.reset();
            fechar();

            /* PROFISSIONAL NOVO */

            if (
                Number(
                    dados.profissional.perfil_completo
                ) === 0
            ) {
                window.location.href =
                    "criar-perfil-pro.html";

                return;
            }

            /* PROFISSIONAL HABITUADO */

            window.location.href =
                "mensagens.html";
        })
        .catch(function (erro) {

            console.log(
                "Erro no login profissional:",
                erro
            );

            alert(
                "Erro ao conectar com o servidor. Veja o Console (F12)."
            );
        });
}


/* ========================================= */
/* CADASTRAR CLIENTE                         */
/* ========================================= */

function cadastrarCliente(event) {
    event.preventDefault();

    let form = event.target;

    fetch(
        "../routes/cliente.php?acao=cadastrar",
        {
            method: "POST",
            body: new FormData(form)
        }
    )
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (dados) {

            console.log(
                "Resposta cadastro cliente:",
                dados
            );

            alert(dados.mensagem);

            if (dados.sucesso) {

                form.reset();

                fechar();

                alert(
                    "Conta criada! Agora faça login para continuar."
                );

                abrirLogin();
            }
        })
        .catch(function (erro) {

            console.log(
                "Erro no cadastro do cliente:",
                erro
            );

            alert(
                "Erro ao conectar com o servidor. Veja o Console (F12)."
            );
        });
}


/* ========================================= */
/* CADASTRAR PROFISSIONAL                    */
/* ========================================= */

function cadastrarProfissional(event) {
    event.preventDefault();

    let form = event.target;

    let servicos =
        form.querySelectorAll(
            'input[name="servicos[]"]:checked'
        );

    if (servicos.length === 0) {

        alert(
            "Selecione pelo menos um serviço."
        );

        return;
    }

    let checkboxOutro =
        document.getElementById("checkboxOutro");

    let outroServico =
        document.getElementById("outroServico");

    if (
        checkboxOutro &&
        checkboxOutro.checked &&
        outroServico &&
        outroServico.value.trim() === ""
    ) {

        alert(
            "Digite qual é o outro serviço."
        );

        outroServico.focus();

        return;
    }

    fetch(
        "../routes/profissional.php?acao=cadastrar",
        {
            method: "POST",
            body: new FormData(form)
        }
    )
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (dados) {

            console.log(
                "Resposta cadastro profissional:",
                dados
            );

            alert(dados.mensagem);

            if (dados.sucesso) {

                form.reset();

                verificarOutroServico();

                fechar();

                /* igual ao cliente: avisa e abre o login */

                alert(
                    "Conta criada! Agora faça login para continuar."
                );

                abrirLogin();
            }
        })
        .catch(function (erro) {

            console.log(
                "Erro no cadastro profissional:",
                erro
            );

            alert(
                "Erro ao conectar com o servidor. Veja o Console (F12)."
            );
        });
}


/* ========================================= */
/* FECHAR MODAIS CLICANDO FORA               */
/* ========================================= */

document
    .querySelectorAll(".modal")
    .forEach(function (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {
                    fechar();
                }

            }
        );

    });


/* ========================================= */
/* VERIFICAR SESSÃO                          */
/* ========================================= */

/*
    Esta função foi mantida para referência,
    mas NÃO é executada automaticamente.

    O arquivo verificar_sessao.php não existe
    atualmente no projeto.
*/

function verificarSessao() {

    fetch("../verificar_sessao.php")

        .then(function (resposta) {
            return resposta.json();
        })

        .then(function (dados) {

            if (dados.logado) {

                let botao =
                    document.getElementById(
                        "btnUsuario"
                    );

                if (botao) {

                    botao.textContent =
                        dados.nome;

                    botao.onclick =
                        function () {
                            abrirCliente();
                        };
                }

                let nomePerfil =
                    document.querySelector(
                        ".perfil-info strong"
                    );

                if (nomePerfil) {

                    nomePerfil.textContent =
                        dados.nome ||
                        "Meu perfil";
                }
            }

        })

        .catch(function (erro) {

            console.log(
                "Erro ao verificar sessão:",
                erro
            );

        });
}


/* ========================================= */
/* SOBRE                                     */
/* ========================================= */

function abrirSobre() {

    fechar();

    let sobre =
        document.getElementById("sobre");

    if (sobre) {
        sobre.classList.add("ativo");
    }
}


/* ========================================= */
/* SEGURANÇA                                 */
/* ========================================= */

function abrirSeguranca() {

    fechar();

    let seguranca =
        document.getElementById("seguranca");

    if (seguranca) {
        seguranca.classList.add("ativo");
    }
}


/* ========================================= */
/* MENU DO PERFIL                            */
/* ========================================= */

function abrirMenuPerfil() {

    const menu =
        document.getElementById(
            "menuPerfil"
        );

    if (!menu) {
        return;
    }

    menu.classList.toggle("ativo");
}


/* ========================================= */
/* EDITAR PERFIL                             */
/* ========================================= */

function editarPerfil(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const menu =
        document.getElementById(
            "menuPerfil"
        );

    if (menu) {
        menu.classList.remove("ativo");
    }

    const modal =
        document.getElementById(
            "modalEditarPerfil"
        );

    if (modal) {
        modal.classList.add("ativo");
    }
}


/* ========================================= */
/* FECHAR EDITAR PERFIL                      */
/* ========================================= */

function fecharEditarPerfil() {

    const modal =
        document.getElementById(
            "modalEditarPerfil"
        );

    if (modal) {
        modal.classList.remove("ativo");
    }
}


/* ========================================= */
/* FORMULÁRIO EDITAR PERFIL                  */
/* ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const formulario =
            document.getElementById(
                "formEditarPerfil"
            );

        if (formulario) {

            formulario.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    alert(
                        "Alterações salvas com sucesso!"
                    );

                    fecharEditarPerfil();
                }
            );
        }
    }
);


/* ========================================= */
/* SAIR DA CONTA                             */
/* ========================================= */

function sairConta() {

    const menu =
        document.getElementById(
            "menuPerfil"
        );

    if (menu) {
        menu.classList.remove("ativo");
    }

    /* encerra a sessão (cliente e profissional) e volta ao início */

    Promise.all([
        fetch("../routes/cliente.php?acao=sair"),
        fetch("../routes/profissional.php?acao=sair")
    ])
        .catch(function () {})
        .then(function () {
            window.location.href = "index.html";
        });
}


/* ========================================= */
/* FECHAR MENU DO PERFIL AO CLICAR FORA      */
/* ========================================= */

document.addEventListener(
    "click",
    function (evento) {

        const menuPerfil =
            document.getElementById(
                "menuPerfil"
            );

        const botaoPerfil =
            document.querySelector(
                ".btn-perfil"
            );

        if (
            !menuPerfil ||
            !botaoPerfil
        ) {
            return;
        }

        if (
            !menuPerfil.contains(
                evento.target
            ) &&
            !botaoPerfil.contains(
                evento.target
            )
        ) {

            menuPerfil.classList.remove(
                "ativo"
            );
        }
    }
);


/* ========================================= */
/* FOTO - EDITAR PERFIL                      */
/* ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const inputFoto =
            document.getElementById(
                "fotoBalao"
            );

        const previaFoto =
            document.getElementById(
                "previaFotoPerfil"
            );

        const removerFoto =
            document.getElementById(
                "removerFotoPerfil"
            );

        if (
            !inputFoto ||
            !previaFoto
        ) {
            return;
        }


        /* ESCOLHER FOTO */

        inputFoto.addEventListener(
            "change",
            function () {

                const arquivo =
                    inputFoto.files[0];

                if (!arquivo) {
                    return;
                }

                if (
                    !arquivo.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Escolha uma imagem válida."
                    );

                    inputFoto.value = "";

                    return;
                }

                const leitor =
                    new FileReader();

                leitor.onload =
                    function (evento) {

                        previaFoto.innerHTML =
                            "";

                        const imagem =
                            document.createElement(
                                "img"
                            );

                        imagem.src =
                            evento.target.result;

                        imagem.alt =
                            "Foto do perfil";

                        previaFoto.appendChild(
                            imagem
                        );
                    };

                leitor.readAsDataURL(
                    arquivo
                );
            }
        );


        /* REMOVER FOTO */

        if (removerFoto) {

            removerFoto.addEventListener(
                "click",
                function () {

                    inputFoto.value = "";

                    previaFoto.innerHTML =
                        "👤";
                }
            );
        }
    }
);