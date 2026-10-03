<?php

session_start();

require_once "../dao/ProfissionalDAO.php";

class ProfissionalController
{
    private $profissionalDAO;

    public function __construct()
    {
        $this->profissionalDAO = new ProfissionalDAO();
    }


    /*
    =========================================
    CADASTRAR PROFISSIONAL
    =========================================
    */

    public function cadastrar()
    {
        $profissional = new Profissional();

        $profissional->setNome(
            $_POST["nome"] ?? ""
        );

        $profissional->setEmail(
            $_POST["email"] ?? ""
        );

        $profissional->setSenha(
            password_hash(
                $_POST["senha"] ?? "",
                PASSWORD_DEFAULT
            )
        );

        $profissional->setTelefone(
            $_POST["telefone"] ?? ""
        );

        $profissional->setEndereco(
            $_POST["endereco"] ?? ""
        );

        /*
        O cadastro inicial ainda não tem foto.
        */

        $profissional->setFoto(
            "sem-foto.jpg"
        );

        $profissional->setBiografia(
            null
        );


        /*
        =========================================
        REGIÃO
        =========================================
        */

        $regiao =
            $_POST["regiao"] ?? "";

        $idRegiao =
            $this->buscarIdRegiao($regiao);

        if (!$idRegiao) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Região inválida."
            ]);

            return;
        }

        $profissional->setIdRegiao(
            $idRegiao
        );


        /*
        =========================================
        SERVIÇOS
        =========================================
        */

        $servicos =
            $_POST["servicos"] ?? [];

        if (!is_array($servicos)) {
            $servicos = [$servicos];
        }


        /*
        Remove serviços vazios.
        */

        $servicos = array_filter(
            $servicos,
            function ($servico) {
                return trim($servico) !== "";
            }
        );


        /*
        =========================================
        OUTRO SERVIÇO
        =========================================
        */

        if (in_array("outro", $servicos)) {

            $outroServico =
                trim(
                    $_POST["servico_outro"] ?? ""
                );

            if ($outroServico === "") {

                echo json_encode([
                    "sucesso" => false,
                    "mensagem" =>
                        "Digite qual é o outro serviço."
                ]);

                return;
            }


            /*
            Remove "outro" e coloca
            o nome real do serviço.
            */

            $servicos = array_filter(
                $servicos,
                function ($servico) {
                    return $servico !== "outro";
                }
            );

            $servicos[] = $outroServico;
        }


        /*
        =========================================
        VERIFICA SERVIÇOS
        =========================================
        */

        if (empty($servicos)) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "Selecione pelo menos um serviço."
            ]);

            return;
        }


        /*
        Remove possíveis serviços duplicados.
        */

        $servicos = array_values(
            array_unique($servicos)
        );


        /*
        =========================================
        CADASTRA NO DAO
        =========================================
        */

        $resultado =
            $this->profissionalDAO->cadastrar(
                $profissional,
                $servicos
            );


        if ($resultado) {

            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                    "Profissional cadastrado com sucesso!"
            ]);

        } else {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "Erro ao cadastrar profissional."
            ]);
        }
    }


    /*
    =========================================
    BUSCAR ID DA REGIÃO
    =========================================
    */

    private function buscarIdRegiao($nomeRegiao)
    {
        $sql = "SELECT id_regiao
                FROM regiao
                WHERE nome = ?";

        $conexao =
            Database::getConexao();

        $stmt =
            $conexao->prepare($sql);

        $stmt->execute([
            $nomeRegiao
        ]);

        $regiao =
            $stmt->fetch(PDO::FETCH_ASSOC);

        return $regiao
            ? $regiao["id_regiao"]
            : null;
    }


    /*
    =========================================
    LOGIN
    =========================================
    */

    public function login()
    {
        $email =
            $_POST["email"] ?? "";

        $senha =
            $_POST["senha"] ?? "";


        $profissional =
            $this->profissionalDAO
                ->buscarPorEmail($email);


        if (!$profissional) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "E-mail ou senha incorretos."
            ]);

            return;
        }


        if (
            !password_verify(
                $senha,
                $profissional["senha"]
            )
        ) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "E-mail ou senha incorretos."
            ]);

            return;
        }


        $_SESSION["profissional_id"] =
            $profissional["id_profissional"];

        $_SESSION["profissional_nome"] =
            $profissional["nome"];

        $_SESSION["profissional_email"] =
            $profissional["email"];


        echo json_encode([
            "sucesso" => true,
            "mensagem" =>
                "Login realizado com sucesso!",
            "profissional" => [
                "id" =>
                    $profissional["id_profissional"],
                "nome" =>
                    $profissional["nome"],
                "email" =>
                    $profissional["email"],
                "perfil_completo" =>
                    $profissional["perfil_completo"]
            ]
        ]);
    }


    /*
    =========================================
    ATUALIZAR PERFIL
    =========================================
    */


public function atualizarPerfil()
{
    if (!isset($_SESSION["profissional_id"])) {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Profissional não está logado."
        ]);

        return;
    }

    $idProfissional =
        $_SESSION["profissional_id"];


    /*
    =========================================
    PEGAR DADOS QUE JÁ ESTÃO NO BANCO
    =========================================
    */

    $profissional =
        $this->profissionalDAO->buscarPorId(
            $idProfissional
        );

    if (!$profissional) {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Profissional não encontrado."
        ]);

        return;
    }


    /*
    =========================================
    DADOS DO FORMULÁRIO
    =========================================
    */

    $nome =
        trim($_POST["nome"] ?? "");

    $biografia =
        trim($_POST["biografia"] ?? "");

    $fotoBase64 =
        $_POST["foto"] ?? "";


    if ($nome === "") {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Digite seu nome profissional."
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
    =========================================
    PEGAR DADOS ANTIGOS
    =========================================
    */

    $telefone =
        $profissional["telefone"];

    $endereco =
        $profissional["endereco"];

    $idRegiao =
        $profissional["id_regiao"];


    /*
    =========================================
    PROCESSAR FOTO
    =========================================
    */

    if (
        preg_match(
            '/^data\:image\/(\w+);base64,/',
            $fotoBase64,
            $tipo
        )
    ) {

        $extensao =
            strtolower($tipo[1]);

        if ($extensao === "jpeg") {
            $extensao = "jpg";
        }


        $dadosImagem =
            substr(
                $fotoBase64,
                strpos($fotoBase64, ",") + 1
            );


        $dadosImagem =
            base64_decode($dadosImagem);


        if ($dadosImagem === false) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "Não foi possível processar a foto."
            ]);

            return;
        }

    } else {

        echo json_encode([
            "sucesso" => false,
            "mensagem" =>
                "Formato de foto inválido."
        ]);

        return;
    }


    /*
    =========================================
    CRIAR PASTA
    =========================================
    */

    $pasta =
        "../img/profissionais/";

    if (!is_dir($pasta)) {

        mkdir(
            $pasta,
            0777,
            true
        );
    }


    /*
    =========================================
    NOME DA FOTO
    =========================================
    */

    $nomeArquivo =
        "profissional_" .
        $idProfissional .
        "_" .
        time() .
        "." .
        $extensao;


    $caminhoArquivo =
        $pasta . $nomeArquivo;


    if (
        !file_put_contents(
            $caminhoArquivo,
            $dadosImagem
        )
    ) {

        echo json_encode([
            "sucesso" => false,
            "mensagem" =>
                "Não foi possível salvar a foto."
        ]);

        return;
    }


    $foto =
        "img/profissionais/" .
        $nomeArquivo;


    /*
    =========================================
    ATUALIZAR PERFIL
    =========================================
    */

    $resultado =
        $this->profissionalDAO->atualizarPerfil(
            $idProfissional,
            $nome,
            $telefone,
            $endereco,
            $biografia,
            $idRegiao,
            $foto
        );


    if ($resultado) {

        $_SESSION["profissional_nome"] =
            $nome;


        echo json_encode([
            "sucesso" => true,
            "mensagem" =>
                "Perfil atualizado com sucesso!"
        ]);

    } else {

        echo json_encode([
            "sucesso" => false,
            "mensagem" =>
                "Erro ao atualizar perfil."
        ]);
    }
}



    /*
    =========================================
    MEU PERFIL
    =========================================
    */

    public function meuPerfil()
    {
        if (
            !isset(
                $_SESSION["profissional_id"]
            )
        ) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "Profissional não está logado."
            ]);

            return;
        }


        $profissional =
            $this->profissionalDAO
                ->buscarPorId(
                    $_SESSION["profissional_id"]
                );


        if (!$profissional) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "Profissional não encontrado."
            ]);

            return;
        }


        echo json_encode([
            "sucesso" => true,
            "profissional" => [
                "id" =>
                    $profissional["id_profissional"],
                "nome" =>
                    $profissional["nome"],
                "foto" =>
                    $profissional["foto"]
            ]
        ]);
    }


    /*
    =========================================
    LISTAR
    =========================================
    */

    public function listar()
    {
        $servico =
            $_GET["servico"] ?? "";

        $regiao =
            $_GET["regiao"] ?? "";


        $profissionais =
            $this->profissionalDAO
                ->listarTodos(
                    $servico,
                    $regiao
                );


        echo json_encode([
            "sucesso" => true,
            "profissionais" =>
                $profissionais
        ]);
    }


    /*
    =========================================
    BUSCAR POR ID
    =========================================
    */

    public function buscarPorId()
    {
        $id =
            $_GET["id"] ?? null;


        if (!$id) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "ID do profissional não informado."
            ]);

            return;
        }


        $profissional =
            $this->profissionalDAO
                ->buscarPorId($id);


        if (!$profissional) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "Profissional não encontrado."
            ]);

            return;
        }


        echo json_encode([
            "sucesso" => true,
            "profissional" =>
                $profissional
        ]);
    }
}
