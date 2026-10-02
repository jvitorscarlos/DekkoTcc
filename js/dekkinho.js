const dkPainel = document.getElementById("dkPainel");
const dkConversa = document.getElementById("dkConversa");

const dkRespostas = {

    sobre: {
        pergunta: "Sobre o Dekko",
        html: `
            <p>A Dekko é uma plataforma criada para aproximar clientes e profissionais. 🤝</p>
            <p>O cliente encontra profissionais de diferentes áreas e regiões, e o profissional divulga seu trabalho e encontra novos clientes.</p>
            <p>A Dekko funciona como uma ponte entre os dois, facilitando o contato e a comunicação.</p>
        `
    },

    seguranca: {
        pergunta: "Dicas de segurança",
        html: `
            <p>Fique atento a estas dicas:</p>
            <ul>
                <li>🔒 Nunca compartilhe sua senha ou códigos de acesso.</li>
                <li>💰 Evite pagamentos antecipados sem verificar o profissional.</li>
                <li>📱 Confira as informações de contato antes de combinar um serviço.</li>
                <li>⚠️ Desconfie de ofertas com preços muito abaixo do normal.</li>
                <li>🤝 Combine o serviço e o valor antes de qualquer pagamento.</li>
            </ul>
            <p style="margin-top:10px">A Dekko não realiza pagamentos pelos usuários. A negociação acontece diretamente entre cliente e profissional.</p>
        `
    },

    como: {
        pergunta: "Como usar",
        html: `
            <p>É simples! 🧭</p>
            <p><strong>Cliente:</strong> crie sua conta, busque o serviço e a região, veja o perfil e converse pelo chat.</p>
            <p><strong>Profissional:</strong> crie sua conta, monte seu perfil, envie fotos do portfólio e responda os clientes.</p>
            <p>O passo a passo completo está logo abaixo na página. 👇</p>
            <button class="dk-acao" type="button" onclick="irParaComoUsar()">Ir para "Como usar"</button>
        `
    }

};


function dkAdicionar(tipo, html) {

    const msg = document.createElement("div");

    msg.className = "dk-msg " + tipo;
    msg.innerHTML = html;

    dkConversa.appendChild(msg);
    dkConversa.scrollTop = dkConversa.scrollHeight;

    return msg;

}


function abrirDekkinho() {

    dkPainel.classList.add("aberto");

}


function fecharDekkinho() {

    dkPainel.classList.remove("aberto");

}


function alternarDekkinho() {

    dkPainel.classList.toggle("aberto");

}


function dekkinhoFalar(chave) {

    const resposta = dkRespostas[chave];

    if (!resposta) {
        return;
    }

    abrirDekkinho();

    dkAdicionar("usuario", resposta.pergunta);

    const digitando = dkAdicionar(
        "bot dk-digitando",
        "Dekkinho está digitando..."
    );

    setTimeout(function () {

        digitando.remove();

        dkAdicionar("bot", resposta.html);

    }, 600);

}


function irParaComoUsar() {

    fecharDekkinho();

    document
        .getElementById("como-usar")
        .scrollIntoView({ behavior: "smooth" });

}


// Mensagem de boas-vindas
dkAdicionar(
    "bot",
    "<p>Oi! Eu sou o <strong>Dekkinho</strong> 👋</p>" +
    "<p>Posso te ajudar com o Dekko. Sobre o que você quer saber?</p>"
);