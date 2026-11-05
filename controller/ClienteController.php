
<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/database.php";
require_once "../model/Cliente.php";
require_once "../dao/ClienteDAO.php";

class ClienteController
{
    private $clienteDAO;

    public function __construct()
    {
        $this->clienteDAO = new ClienteDAO();
    }

    /* =========================================
       CADASTRAR CLIENTE
    ========================================= */

    public function cadastrar()
    {
        try {

            $nome = trim($_POST["nome"] ?? "");
            $email = trim($_POST["email"] ?? "");
            $senha = $_POST["senha"] ?? "";
            $telefone = trim($_POST["telefone"] ?? "");
            $regiao = trim($_POST["regiao"] ?? "");

            if ($nome === "" || $email === "" || $senha === "" || $telefone === "") {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Preencha todos os campos."
                ]);
                return;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Digite um e-mail válido."
                ]);
                return;
            }

            /* VERIFICAR E-MAIL EXISTENTE */

            $emailExistente = $this->clienteDAO->buscarPorEmail($email);

            if ($emailExistente) {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Este e-mail já está cadastrado. Faça login ou utilize outro e-mail."
                ]);
                return;
            }

            /* BUSCAR REGIÃO */

            $idRegiao = $this->buscarIdRegiao($regiao);

            if (!$idRegiao) {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Região inválida."
                ]);
                return;
            }

            /* CRIAR CLIENTE */

            $cliente = new Cliente();

            $cliente->setNome($nome);
            $cliente->setEmail($email);
            $cliente->setSenha(
                password_hash($senha, PASSWORD_DEFAULT)
            );
            $cliente->setTelefone($telefone);
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

        } catch (PDOException $erro) {

            // Trata também a possibilidade de dois cadastros
            // tentarem utilizar o mesmo e-mail simultaneamente.

            if ($erro->getCode() === "23000") {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Este e-mail já está cadastrado. Utilize outro e-mail."
                ]);
                return;
            }

            error_log("Erro ao cadastrar cliente: " . $erro->getMessage());

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Ocorreu um erro no banco de dados ao cadastrar."
            ]);

        } catch (Throwable $erro) {

            error_log("Erro no cadastro do cliente: " . $erro->getMessage());

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Ocorreu um erro inesperado ao cadastrar."
            ]);
        }
    }


    /* =========================================
       BUSCAR ID DA REGIÃO
    ========================================= */

    private function buscarIdRegiao($nomeRegiao)
    {
        $sql = "SELECT id_regiao
                FROM regiao
                WHERE TRIM(LOWER(nome)) = LOWER(?)
                LIMIT 1";

        $conexao = Database::getConexao();

        $stmt = $conexao->prepare($sql);
        $stmt->execute([trim($nomeRegiao)]);

        $regiao = $stmt->fetch(PDO::FETCH_ASSOC);

        return $regiao ? (int) $regiao["id_regiao"] : null;
    }


    /* =========================================
       BUSCAR DADOS ATUAIS DO CLIENTE
    ========================================= */

    private function buscarDadosAtuais($idCliente)
    {
        $sql = "SELECT telefone, id_regiao, foto
                FROM cliente
                WHERE id_cliente = ?";

        $conexao = Database::getConexao();

        $stmt = $conexao->prepare($sql);
        $stmt->execute([$idCliente]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    /* =========================================
       ATUALIZAR PERFIL
    ========================================= */

    public function atualizarPerfil()
    {
        try {

            if (!isset($_SESSION["cliente_id"])) {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Cliente não está logado."
                ]);
                return;
            }

            $idCliente = $_SESSION["cliente_id"];

            $nome = trim($_POST["nome"] ?? "");
            $fotoBase64 = $_POST["foto"] ?? "";

            if ($nome === "") {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Digite seu nome."
                ]);
                return;
            }

            $atual = $this->buscarDadosAtuais($idCliente);

            if (!$atual) {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Cliente não encontrado."
                ]);
                return;
            }

            $foto = $atual["foto"];

            if ($fotoBase64 !== "") {

                if (
                    !preg_match(
                        '/^data:image\/(\w+);base64,/',
                        $fotoBase64,
                        $tipo
                    )
                ) {
                    echo json_encode([
                        "sucesso" => false,
                        "mensagem" => "Formato de foto inválido."
                    ]);
                    return;
                }

                $extensao = strtolower($tipo[1]);

                if ($extensao === "jpeg") {
                    $extensao = "jpg";
                }

                if (!in_array($extensao, ["jpg", "png", "gif", "webp"])) {
                    echo json_encode([
                        "sucesso" => false,
                        "mensagem" => "Use uma foto JPG, PNG, GIF ou WEBP."
                    ]);
                    return;
                }

                $dadosImagem = substr(
                    $fotoBase64,
                    strpos($fotoBase64, ",") + 1
                );

                $dadosImagem = base64_decode($dadosImagem, true);

                if ($dadosImagem === false || $dadosImagem === "") {
                    echo json_encode([
                        "sucesso" => false,
                        "mensagem" => "Não foi possível processar a foto."
                    ]);
                    return;
                }

                if (strlen($dadosImagem) > 5 * 1024 * 1024) {
                    echo json_encode([
                        "sucesso" => false,
                        "mensagem" => "A foto deve ter no máximo 5 MB."
                    ]);
                    return;
                }

                $pasta = "../img/clientes/";

                if (!is_dir($pasta)) {
                    mkdir($pasta, 0777, true);
                }

                $nomeArquivo = "cliente_" .
                    $idCliente .
                    "_" .
                    time() .
                    "." .
                    $extensao;

                $caminhoArquivo = $pasta . $nomeArquivo;

                if (file_put_contents($caminhoArquivo, $dadosImagem) === false) {
                    echo json_encode([
                        "sucesso" => false,
                        "mensagem" => "Não foi possível salvar a foto."
                    ]);
                    return;
                }

                $foto = "img/clientes/" . $nomeArquivo;

            } elseif (
                $foto === null ||
                $foto === "" ||
                $foto === "sem-foto.jpg"
            ) {

                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Escolha uma foto de perfil."
                ]);
                return;
            }

            $resultado = $this->clienteDAO->atualizarPerfil(
                $idCliente,
                $nome,
                $atual["telefone"],
                $atual["id_regiao"],
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

        } catch (Throwable $erro) {

            error_log("Erro ao atualizar perfil do cliente: " . $erro->getMessage());

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro inesperado ao atualizar perfil."
            ]);
        }
    }


    /* =========================================
       LOGIN
    ========================================= */

    public function login()
    {
        try {

            $email = trim($_POST["email"] ?? "");
            $senha = $_POST["senha"] ?? "";

            $cliente = $this->clienteDAO->buscarPorEmail($email);

            if (!$cliente || !password_verify($senha, $cliente["senha"])) {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "E-mail ou senha incorretos."
                ]);
                return;
            }

            unset($_SESSION["profissional_id"]);

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

        } catch (Throwable $erro) {

            error_log("Erro no login do cliente: " . $erro->getMessage());

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro inesperado ao realizar login."
            ]);
        }
    }


    /* =========================================
       MEU PERFIL
    ========================================= */

    public function meuPerfil()
    {
        try {

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

        } catch (Throwable $erro) {

            error_log("Erro ao buscar perfil do cliente: " . $erro->getMessage());

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao carregar perfil."
            ]);
        }
    }
}
