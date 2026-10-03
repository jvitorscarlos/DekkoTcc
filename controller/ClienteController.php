<?php

session_start();

require_once "../dao/ClienteDAO.php";

class ClienteController
{
    private $clienteDAO;

    public function __construct()
    {
        $this->clienteDAO = new ClienteDAO();
    }

    public function cadastrar()
    {
        $cliente = new Cliente();

        $cliente->setNome($_POST["nome"] ?? "");
        $cliente->setEmail($_POST["email"] ?? "");

        $cliente->setSenha(
            password_hash($_POST["senha"] ?? "", PASSWORD_DEFAULT)
        );

        $cliente->setTelefone($_POST["telefone"] ?? "");

        $regiao = $_POST["regiao"] ?? "";

        $idRegiao = $this->buscarIdRegiao($regiao);

        if (!$idRegiao) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Região inválida."
            ]);
            return;
        }

        $cliente->setIdRegiao($idRegiao);

        $cliente->setFoto("sem-foto.jpg");

        $resultado = $this->clienteDAO->cadastrar($cliente);

        if ($resultado) {
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Cliente cadastrado com sucesso!"
            ]);
        } else {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao cadastrar cliente."
            ]);
        }
    }

    private function buscarIdRegiao($nomeRegiao)
    {
        $sql = "SELECT id_regiao
                FROM regiao
                WHERE nome = ?";

        $conexao = Database::getConexao();

        $stmt = $conexao->prepare($sql);
        $stmt->execute([$nomeRegiao]);

        $regiao = $stmt->fetch(PDO::FETCH_ASSOC);

        return $regiao ? $regiao["id_regiao"] : null;
    }

    public function atualizarPerfil()
    {
        if (!isset($_SESSION["cliente_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Cliente não está logado."
            ]);
            return;
        }

        $idCliente = $_SESSION["cliente_id"];

        $nome = $_POST["nome"] ?? "";
        $telefone = $_POST["telefone"] ?? "";
        $regiao = $_POST["regiao"] ?? "";
        $fotoBase64 = $_POST["foto"] ?? "";

        if ($nome === "" || $telefone === "" || $regiao === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Preencha todos os campos."
            ]);
            return;
        }

        $idRegiao = $this->buscarIdRegiao($regiao);

        if (!$idRegiao) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Região inválida."
            ]);
            return;
        }

        if ($fotoBase64 === "") {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Escolha uma foto de perfil."
            ]);
            return;
        }

        /*
         * Descobre o tipo da imagem.
         */
        if (
            preg_match(
                '/^data:image\/(\w+);base64,/',
                $fotoBase64,
                $tipo
            )
        ) {
            $extensao = strtolower($tipo[1]);

            if ($extensao === "jpeg") {
                $extensao = "jpg";
            }

            $dadosImagem = substr(
                $fotoBase64,
                strpos($fotoBase64, ",") + 1
            );

            $dadosImagem = base64_decode($dadosImagem);

            if ($dadosImagem === false) {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Não foi possível processar a foto."
                ]);
                return;
            }
        } else {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Formato de foto inválido."
            ]);
            return;
        }

        /*
         * Cria a pasta de fotos dos clientes,
         * caso ela ainda não exista.
         */
        $pasta = "../img/clientes/";

        if (!is_dir($pasta)) {
            mkdir($pasta, 0777, true);
        }

        /*
         * Cria um nome único para a foto.
         */
        $nomeArquivo = "cliente_" .
            $idCliente .
            "_" .
            time() .
            "." .
            $extensao;

        $caminhoArquivo = $pasta . $nomeArquivo;

        /*
         * Salva a imagem fisicamente.
         */
        if (!file_put_contents($caminhoArquivo, $dadosImagem)) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Não foi possível salvar a foto."
            ]);
            return;
        }

        /*
         * Caminho que será salvo no banco.
         */
        $foto = "img/clientes/" . $nomeArquivo;

        $resultado = $this->clienteDAO->atualizarPerfil(
            $idCliente,
            $nome,
            $telefone,
            $idRegiao,
            $foto
        );

        if ($resultado) {

            $_SESSION["cliente_nome"] = $nome;

            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Perfil atualizado com sucesso!"
            ]);

        } else {

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao atualizar perfil."
            ]);
        }
    }

    public function login()
    {
        $email = $_POST["email"] ?? "";
        $senha = $_POST["senha"] ?? "";

        $cliente = $this->clienteDAO->buscarPorEmail($email);

        if (!$cliente) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "E-mail ou senha incorretos."
            ]);
            return;
        }

        if (!password_verify($senha, $cliente["senha"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "E-mail ou senha incorretos."
            ]);
            return;
        }
       
        $_SESSION["cliente_id"] = $cliente["id_cliente"];
        $_SESSION["cliente_nome"] = $cliente["nome"];
        $_SESSION["cliente_email"] = $cliente["email"];

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Login realizado com sucesso!",
            "cliente" => [
                "id" => $cliente["id_cliente"],
                "nome" => $cliente["nome"],
                "email" => $cliente["email"],
                "perfil_completo" => $cliente["perfil_completo"]
            ]
        ]);
    }



    public function meuPerfil()
    {
        if (!isset($_SESSION["cliente_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Cliente não está logado."
            ]);
            return;
        }

        $cliente = $this->clienteDAO->buscarPorId(
            $_SESSION["cliente_id"]
        );

        if (!$cliente) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Cliente não encontrado."
            ]);
            return;
        }

        echo json_encode([
            "sucesso" => true,
            "cliente" => [
                "id" => $cliente["id_cliente"],
                "nome" => $cliente["nome"],
                "foto" => $cliente["foto"]
            ]
        ]);
    }
}
