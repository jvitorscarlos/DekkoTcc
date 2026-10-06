<?php

require_once "../dao/AdminDAO.php";

class AdminController
{
    private $dao;

    public function __construct()
    {
        $this->dao = new AdminDAO();
    }

    public function login()
    {
        $email = trim($_POST["email"] ?? "");
        $senha = $_POST["senha"] ?? "";

        if ($email === "" || $senha === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Preencha o e-mail e a senha."
            ]);
            return;
        }

        if (
            $email === "admin@dekko.com" &&
            $senha === "admin123"
        ) {
            $_SESSION["admin_logado"] = true;

            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Login realizado com sucesso!"
            ]);
            return;
        }

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "E-mail ou senha incorretos."
        ]);
    }

    public function verificarLogin()
    {
        if (
            !isset($_SESSION["admin_logado"]) ||
            $_SESSION["admin_logado"] !== true
        ) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Acesso não autorizado."
            ]);
            return;
        }

        echo json_encode([
            "sucesso" => true
        ]);
    }

    public function logout()
    {
        $_SESSION = [];

        session_destroy();

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Sessão encerrada com sucesso."
        ]);
    }

    public function dashboard()
    {
        echo json_encode([
            "sucesso" => true,
            "clientes" => $this->dao->contarClientes(),
            "profissionais" => $this->dao->contarProfissionais(),
            "conversas" => $this->dao->contarConversas(),
            "favoritos" => $this->dao->contarFavoritos()
        ]);
    }

    public function listarClientes()
    {
        echo json_encode([
            "sucesso" => true,
            "clientes" => $this->dao->listarClientes()
        ]);
    }

    public function listarProfissionais()
    {
        echo json_encode([
            "sucesso" => true,
            "profissionais" => $this->dao->listarProfissionais()
        ]);
    }

    public function visualizarCliente()
    {
        $idCliente = $_GET["id"] ?? "";

        if ($idCliente === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "ID do cliente não informado."
            ]);
            return;
        }

        $cliente = $this->dao->buscarClientePorId($idCliente);

        if (!$cliente) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Cliente não encontrado."
            ]);
            return;
        }

        echo json_encode([
            "sucesso" => true,
            "cliente" => $cliente
        ]);
    }

    public function atualizarCliente()
    {
        $idCliente = $_POST["id"] ?? "";
        $nome = trim($_POST["nome"] ?? "");
        $email = trim($_POST["email"] ?? "");
        $telefone = trim($_POST["telefone"] ?? "");
        $idRegiao = $_POST["id_regiao"] ?? "";

        if (
            $idCliente === "" ||
            $nome === "" ||
            $email === "" ||
            $idRegiao === ""
        ) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Preencha todos os campos obrigatórios."
            ]);
            return;
        }

        $resultado = $this->dao->atualizarCliente(
            $idCliente,
            $nome,
            $email,
            $telefone,
            $idRegiao
        );

        if ($resultado) {
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Cliente atualizado com sucesso!"
            ]);
        } else {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao atualizar cliente."
            ]);
        }
    }

    public function excluirCliente()
    {
        $idCliente = $_POST["id"] ?? "";

        if ($idCliente === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "ID do cliente não informado."
            ]);
            return;
        }

        $resultado = $this->dao->excluirCliente($idCliente);

        if ($resultado) {
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Cliente excluído com sucesso!"
            ]);
        } else {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao excluir o cliente."
            ]);
        }
    }

    public function visualizarProfissional()
    {
        $idProfissional = $_GET["id"] ?? "";

        if ($idProfissional === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "ID do profissional não informado."
            ]);
            return;
        }

        $profissional = $this->dao->buscarProfissionalPorId($idProfissional);

        if (!$profissional) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Profissional não encontrado."
            ]);
            return;
        }

        echo json_encode([
            "sucesso" => true,
            "profissional" => $profissional
        ]);
    }

    public function atualizarProfissional()
    {
        $idProfissional = $_POST["id"] ?? "";
        $nome = trim($_POST["nome"] ?? "");
        $email = trim($_POST["email"] ?? "");
        $telefone = trim($_POST["telefone"] ?? "");
        $endereco = trim($_POST["endereco"] ?? "");
        $biografia = trim($_POST["biografia"] ?? "");
        $idRegiao = $_POST["id_regiao"] ?? "";

        if (
            $idProfissional === "" ||
            $nome === "" ||
            $email === "" ||
            $telefone === "" ||
            $endereco === "" ||
            $idRegiao === ""
        ) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Preencha todos os campos obrigatórios."
            ]);
            return;
        }

        $resultado = $this->dao->atualizarProfissional(
            $idProfissional,
            $nome,
            $email,
            $telefone,
            $endereco,
            $biografia,
            $idRegiao
        );

        if ($resultado) {
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Profissional atualizado com sucesso!"
            ]);
        } else {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao atualizar profissional."
            ]);
        }
    }

    public function excluirProfissional()
    {
        $idProfissional = $_POST["id"] ?? "";

        if ($idProfissional === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "ID do profissional não informado."
            ]);
            return;
        }

        $resultado = $this->dao->excluirProfissional($idProfissional);

        if ($resultado) {
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Profissional excluído com sucesso!"
            ]);
        } else {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao excluir profissional."
            ]);
        }
    }
}
