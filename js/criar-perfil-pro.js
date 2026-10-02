function mostrarFotoPerfil(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) {
        return;
    }

    const preview = document.getElementById("avatarPreview");

    const leitor = new FileReader();

    leitor.onload = function (e) {
        preview.innerHTML = `
            <img src="${e.target.result}" alt="Prévia da foto de perfil">
        `;
    };

    leitor.readAsDataURL(arquivo);
}

function irParaPortfolio(event) {
    event.preventDefault();

    const foto = document.getElementById("fotoPerfil");

    if (!foto || foto.files.length === 0) {
        alert("Escolha uma foto de perfil para continuar.");
        return;
    }

    window.location.href = "portifolio.html";
}