function mostrarFotoPerfil(event) {

    const arquivo =
        event.target.files[0];

    if (!arquivo) {
        return;
    }

    const preview =
        document.getElementById("avatarPreview");

    const leitor =
        new FileReader();

    leitor.onload = function (e) {

        preview.innerHTML = `
            <img
                src="${e.target.result}"
                alt="Prévia da foto de perfil"
            >
        `;
    };

    leitor.readAsDataURL(arquivo);
}


function irParaPortfolio(event) {

    event.preventDefault();

    const foto =
        document.getElementById("fotoPerfil");

    const nome =
        document.getElementById("nomePerfil");

    const bio =
        document.getElementById("bio");


    /*
    =========================================
    VERIFICAR FOTO
    =========================================
    */

    if (
        !foto ||
        foto.files.length === 0
    ) {

        alert(
            "Escolha uma foto de perfil para continuar."
        );

        return;
    }


    /*
    =========================================
    PEGAR A IMAGEM
    =========================================
    */

    const arquivo =
        foto.files[0];

    const leitor =
        new FileReader();


    leitor.onload = function (e) {

        const dados =
            new FormData();


        /*
        =========================================
        CAMPOS DO PERFIL
        =========================================
        */

        dados.append(
            "nome",
            nome.value
        );

        dados.append(
            "biografia",
            bio.value
        );

        /*
        O endereço e a região já foram
        cadastrados na criação da conta.
        */


        /*
        =========================================
        FOTO EM BASE64
        =========================================
        */

        dados.append(
            "foto",
            e.target.result
        );


        /*
        =========================================
        ENVIAR PARA O PHP
        =========================================
        */

        fetch(
            "../routes/profissional.php?acao=atualizarPerfil",
            {
                method: "POST",
                body: dados
            }
        )

            .then(function (resposta) {

                return resposta.json();

            })

            .then(function (resultado) {

                console.log(
                    "Resposta do perfil:",
                    resultado
                );


                if (!resultado.sucesso) {

                    alert(
                        resultado.mensagem
                    );

                    return;
                }


                /*
                =========================================
                PERFIL SALVO
                =========================================
                */

                alert(
                    resultado.mensagem
                );


                /*
                Agora vai para o portfólio.
                */

                window.location.href =
                    "portfolio.html";

            })

            .catch(function (erro) {

                console.log(
                    "Erro ao salvar perfil:",
                    erro
                );

                alert(
                    "Erro ao salvar o perfil. Veja o Console (F12)."
                );

            });
    };


    leitor.readAsDataURL(arquivo);
}
