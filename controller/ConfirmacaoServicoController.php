
<?php

require_once "../dao/ConfirmacaoServicoDAO.php";
require_once "../dao/ConversaDAO.php";

class ConfirmacaoServicoController
{
    private $confirmacaoDAO;
    private $conversaDAO;

    public function __construct()
    {
        $this->confirmacaoDAO = new ConfirmacaoServicoDAO();
        $this->conversaDAO = new ConversaDAO();
    }

    // Profissional envia o pedido de confirmação
    public function solicitar()
    {
        session_start();

        if (!isset($_SESSION["profissional_id"])) {
            $this->responderJSON(false, "Profissional não está logado.");
            return;
        }

        $idConversa = $_POST["id_conversa"] ?? null;

        if (!$idConversa) {
            $this->responderJSON(false, "Conversa não informada.");
            return;
        }

        if (!$this->conversaDAO->pertenceAoProfissional(
            $idConversa,
            $_SESSION["profissional_id"]
        )) {
            $this->responderJSON(false, "Você não participa desta conversa.");
            return;
        }

        $resultado = $this->confirmacaoDAO->solicitar($idConversa);

        $this->responderJSON(
            $resultado,
            $resultado
                ? "Pedido de confirmação enviado."
                : "Não foi possível enviar o pedido. Verifique se já existe um pedido pendente ou se a conversa está encerrada."
        );
    }

    // Cliente aceita ou recusa o pedido
    public function responder()
    {
        session_start();

        if (!isset($_SESSION["cliente_id"])) {
            $this->responderJSON(false, "Cliente não está logado.");
            return;
        }

        $idConversa = $_POST["id_conversa"] ?? null;
        $resposta = $_POST["resposta"] ?? "";

        if (!$idConversa || !in_array($resposta, ["ACEITA", "RECUSADA"], true)) {
            $this->responderJSON(false, "Dados inválidos.");
            return;
        }

        if (!$this->conversaDAO->pertenceAoCliente(
            $idConversa,
            $_SESSION["cliente_id"]
        )) {
            $this->responderJSON(false, "Você não participa desta conversa.");
            return;
        }

        $resultado = $this->confirmacaoDAO->responder(
            $idConversa,
            $resposta
        );

        $this->responderJSON(
            $resultado,
            $resultado
                ? ($resposta === "ACEITA"
                    ? "Serviço confirmado. Conversa encerrada."
                    : "Pedido recusado. A conversa continua aberta.")
                : "Não foi possível registrar a resposta. Talvez não exista pedido pendente."
        );
    }

    // Lista os pedidos de confirmação
    public function listar()
    {
        session_start();

        if (
            !isset($_SESSION["cliente_id"]) &&
            !isset($_SESSION["profissional_id"])
        ) {
            $this->responderJSON(false, "Usuário não está logado.");
            return;
        }

        $idConversa = $_GET["id_conversa"] ?? null;

        if (!$idConversa) {
            $this->responderJSON(false, "Conversa não informada.");
            return;
        }

        $conversa = $this->conversaDAO->buscarPorId($idConversa);

        if (!$conversa) {
            $this->responderJSON(false, "Conversa não encontrada.");
            return;
        }

        $temAcesso = (
            isset($_SESSION["cliente_id"]) &&
            (int)$conversa["id_cliente"] === (int)$_SESSION["cliente_id"]
        ) || (
            isset($_SESSION["profissional_id"]) &&
            (int)$conversa["id_profissional"] === (int)$_SESSION["profissional_id"]
        );

        if (!$temAcesso) {
            $this->responderJSON(false, "Você não tem acesso a esta conversa.");
            return;
        }

        $confirmacoes = $this->confirmacaoDAO->listarPorConversa($idConversa);

        echo json_encode([
            "sucesso" => true,
            "confirmacoes" => $confirmacoes
        ]);
    }

    private function responderJSON($sucesso, $mensagem)
    {
        echo json_encode([
            "sucesso" => $sucesso,
            "mensagem" => $mensagem
        ]);
    }
    // Cliente escolhe o que fazer depois de recusar
public function decidirRecusa()
{
    session_start();

    if (!isset($_SESSION["cliente_id"])) {
        $this->responderJSON(false, "Cliente não está logado.");
        return;
    }

    $idConversa = $_POST["id_conversa"] ?? null;
    $decisao = $_POST["decisao"] ?? "";

    if (
        !$idConversa ||
        !in_array($decisao, ["CONTINUAR", "ENCERRAR"], true)
    ) {
        $this->responderJSON(false, "Dados inválidos.");
        return;
    }

    if (!$this->conversaDAO->pertenceAoCliente(
        $idConversa,
        $_SESSION["cliente_id"]
    )) {
        $this->responderJSON(false, "Você não participa desta conversa.");
        return;
    }

    $resultado = $this->confirmacaoDAO->decidirRecusa(
        $idConversa,
        $decisao
    );

    $this->responderJSON(
        $resultado,
        $resultado
            ? ($decisao === "CONTINUAR"
                ? "Você escolheu continuar conversando."
                : "Conversa encerrada.")
            : "Não foi possível registrar sua decisão."
    );
}
}
