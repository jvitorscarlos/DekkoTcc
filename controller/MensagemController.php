<?php

require_once "../dao/MensagemDAO.php";
require_once "../dao/ConversaDAO.php";

class MensagemController
{
    private $mensagemDAO;
    private $conversaDAO;

    public function __construct()
    {
        $this->mensagemDAO = new MensagemDAO();
        $this->conversaDAO = new ConversaDAO();
    }

    // Envia mensagem como profissional
    public function enviarProfissional()
    {
        session_start();

        if (!isset($_SESSION["profissional_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Profissional não está logado."
            ]);
            return;
        }

        $idProfissional = $_SESSION["profissional_id"];
        $idConversa = $_POST["id_conversa"] ?? null;
        $mensagem = trim($_POST["mensagem"] ?? "");

        if (!$idConversa || $mensagem === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Conversa ou mensagem não informada."
            ]);
            return;
        }

        if (
            !$this->conversaDAO->pertenceAoProfissional(
                $idConversa,
                $idProfissional
            )
        ) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Você não participa desta conversa."
            ]);
            return;
        }

        $resultado =
            $this->mensagemDAO->enviarPeloProfissional(
                $idConversa,
                $idProfissional,
                $mensagem
            );

        echo json_encode([
            "sucesso" => $resultado,
            "mensagem" => $resultado
                ? "Mensagem enviada."
                : "Não foi possível enviar a mensagem."
        ]);
    }

    // Envia mensagem como cliente
    public function enviarCliente()
    {
        session_start();

        if (!isset($_SESSION["cliente_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Cliente não está logado."
            ]);
            return;
        }

        $idCliente = $_SESSION["cliente_id"];
        $idConversa = $_POST["id_conversa"] ?? null;
        $mensagem = trim($_POST["mensagem"] ?? "");

        if (!$idConversa || $mensagem === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Conversa ou mensagem não informada."
            ]);
            return;
        }

        if (
            !$this->conversaDAO->pertenceAoCliente(
                $idConversa,
                $idCliente
            )
        ) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Você não participa desta conversa."
            ]);
            return;
        }

        $resultado =
            $this->mensagemDAO->enviarPeloCliente(
                $idConversa,
                $idCliente,
                $mensagem
            );

        echo json_encode([
            "sucesso" => $resultado,
            "mensagem" => $resultado
                ? "Mensagem enviada."
                : "Não foi possível enviar a mensagem."
        ]);
    }

    // Lista as mensagens de uma conversa
    public function listar()
    {
        session_start();

        if (
            !isset($_SESSION["cliente_id"]) &&
            !isset($_SESSION["profissional_id"])
        ) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Usuário não está logado."
            ]);
            return;
        }

        $idConversa = $_GET["id_conversa"] ?? null;

        if (!$idConversa) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Conversa não informada."
            ]);
            return;
        }

        $conversa =
            $this->conversaDAO->buscarPorId(
                $idConversa
            );

        if (!$conversa) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Conversa não encontrada."
            ]);
            return;
        }

        // Verifica se o usuário pertence à conversa
        $temAcesso = false;

        if (
            isset($_SESSION["profissional_id"]) &&
            (int)$conversa["id_profissional"] ===
            (int)$_SESSION["profissional_id"]
        ) {
            $temAcesso = true;
        }

        if (
            isset($_SESSION["cliente_id"]) &&
            (int)$conversa["id_cliente"] ===
            (int)$_SESSION["cliente_id"]
        ) {
            $temAcesso = true;
        }

        if (!$temAcesso) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Você não tem acesso a esta conversa."
            ]);
            return;
        }

        $mensagens =
            $this->mensagemDAO->listarPorConversa(
                $idConversa
            );

        echo json_encode([
            "sucesso" => true,
            "mensagens" => $mensagens
        ]);
    }
}