
document.addEventListener("DOMContentLoaded", carregarPerfil);

const form = document.getElementById("formEditarPerfil");
const inputFoto = document.getElementById("fotoPerfil");
const avatarPreview = document.getElementById("avatarPreview");
const btnVoltar = document.getElementById("btnVoltar");
const btnSalvar = document.getElementById("btnSalvar");

let fotoAtual = "";

const paginaMensagens = "mensagens.html";

// Carregar dados atuais do profissional
async function carregarPerfil() {
    try {
        const resposta = await fetch(
            "../routes/profissional.php?acao=meuPerfil"
        );

        const dados = await resposta.json();

        if (!dados.sucesso) {
            alert(dados.mensagem || "Não foi possível carregar seu perfil.");
            return;
        }

        const profissional = dados.profissional;

        document.getElementById("nomePerfil").value =
            profissional.nome || "";

        document.getElementById("bio").value =
            profissional.biografia || "";

        document.getElementById("redeSocial").value =
            profissional.rede_social || "";

        fotoAtual = profissional.foto || "";

        if (fotoAtual) {
            avatarPreview.innerHTML = `
                <img
                    src="../${fotoAtual}"
                    alt="Foto do profissional"
                    style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                >
            `;
        }

    } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);
        alert("Erro ao carregar os dados do perfil.");
    }
}

// Pré-visualizar nova foto
inputFoto.addEventListener("change", function () {
    const arquivo = this.files[0];

    if (!arquivo) {
        return;
    }

    if (!arquivo.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem válido.");
        this.value = "";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function (evento) {
        avatarPreview.innerHTML = `
            <img
                src="${evento.target.result}"
                alt="Nova foto"
                style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
            >
        `;
    };

    leitor.readAsDataURL(arquivo);
});

// Salvar alterações
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    try {
        const formulario = new FormData();

        formulario.append(
            "nome",
            document.getElementById("nomePerfil").value.trim()
        );

        formulario.append(
            "biografia",
            document.getElementById("bio").value.trim()
        );

        formulario.append(
            "rede_social",
            document.getElementById("redeSocial").value.trim()
        );

        // Só enviar foto se uma nova tiver sido escolhida
        const arquivo = inputFoto.files[0];

        if (arquivo) {
            const fotoBase64 = await converterImagemBase64(arquivo);
            formulario.append("foto", fotoBase64);
        }

        const resposta = await fetch(
            "../routes/profissional.php?acao=atualizarPerfil",
            {
                method: "POST",
                body: formulario
            }
        );

        const dados = await resposta.json();

        if (!dados.sucesso) {
            alert(dados.mensagem || "Não foi possível atualizar o perfil.");
            return;
        }

        alert("Perfil atualizado com sucesso!");

        window.location.href = paginaMensagens;

    } catch (erro) {
        console.error("Erro ao salvar perfil:", erro);
        alert("Ocorreu um erro ao salvar as alterações.");

    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar alterações";
    }
});

// Converter imagem para Base64
function converterImagemBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(new Error("Erro ao ler imagem."));

        leitor.readAsDataURL(arquivo);
    });
}

// Voltar sem salvar
btnVoltar.addEventListener("click", function () {
    window.location.href = paginaMensagens;
});
