<?php

require_once "../dao/ConversaDAO.php";

class ConversaController
{
    private $dao;

    public function __construct()
    {
        $this->dao = new ConversaDAO();
    }

    // Cria ou recupera uma conversa
    public function criar()
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
        $idProfissional = $_POST["id_profissional"] ?? null;

        if (!$idProfissional) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Profissional não informado."
            ]);
            return;
        }

        $idConversa = $this->dao->criar(
            $idCliente,
            $idProfissional
        );

        echo json_encode([
            "sucesso" => true,
            "id_conversa" => $idConversa
        ]);
    }

    // Lista conversas do profissional logado
    public function minhasConversasProfissional()
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

        $conversas =
            $this->dao->listarPorProfissional(
                $idProfissional
            );

        echo json_encode([
            "sucesso" => true,
            "conversas" => $conversas
        ]);
    }

    // Lista conversas do cliente logado
    public function minhasConversasCliente()
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

        $conversas =
            $this->dao->listarPorCliente(
                $idCliente
            );

        echo json_encode([
            "sucesso" => true,
            "conversas" => $conversas
        ]);
    }

    // Busca uma conversa específica
    public function buscar()
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
            $this->dao->buscarPorId(
                $idConversa
            );

        if (!$conversa) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Conversa não encontrada."
            ]);
            return;
        }

        // Verifica se o usuário realmente participa da conversa
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

        echo json_encode([
            "sucesso" => true,
            "conversa" => $conversa
        ]);
    }

    // Encerra uma conversa
    public function encerrar()
    {
        session_start();

        if (!isset($_SESSION["profissional_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Profissional não está logado."
            ]);
            return;
        }

        $idConversa = $_POST["id_conversa"] ?? null;

        if (!$idConversa) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Conversa não informada."
            ]);
            return;
        }

        if (
            !$this->dao->pertenceAoProfissional(
                $idConversa,
                $_SESSION["profissional_id"]
            )
        ) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Você não participa desta conversa."
            ]);
            return;
        }

        $resultado =
            $this->dao->encerrar(
                $idConversa
            );

        echo json_encode([
            "sucesso" => $resultado,
            "mensagem" => $resultado
                ? "Conversa encerrada."
                : "Não foi possível encerrar a conversa."
        ]);
    }
}