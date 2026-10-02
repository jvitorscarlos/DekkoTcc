<?php

require_once "../dao/ProfissionalDAO.php";

class ProfissionalController
{
    private $profissionalDAO;

    public function __construct()
    {
        $this->profissionalDAO = new ProfissionalDAO();
    }

    public function cadastrar()
    {
        $profissional = new Profissional();

        $profissional->setNome($_POST["nome"]);
        $profissional->setEmail($_POST["email"]);

        $profissional->setSenha(
            password_hash($_POST["senha"], PASSWORD_DEFAULT)
        );

        $profissional->setTelefone($_POST["telefone"] ?? null);
        $profissional->setEndereco($_POST["endereco"] ?? null);
        $profissional->setRegiao($_POST["regiao"] ?? null);
        $profissional->setExperiencia($_POST["experiencia"] ?? null);
        $profissional->setDescricao($_POST["descricao"] ?? null);
        $profissional->setFoto($_POST["foto"] ?? null);

        // Pega o serviço escolhido no formulário

        $servico = $_POST["servico"] ?? null;

        if (!$servico) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Selecione um serviço."
            ]);

            return;
        }

        // Cadastra o profissional e o serviço

        $resultado = $this->profissionalDAO->cadastrar(
            $profissional,
            $servico
        );

        if ($resultado) {

            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Profissional cadastrado com sucesso!"
            ]);

        } else {

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao cadastrar profissional."
            ]);
        }
    }


    public function listar()
    {
        // Pega os filtros da URL

        $servico = $_GET["servico"] ?? "";
        $regiao = $_GET["regiao"] ?? "";

        // Busca usando os filtros

        $profissionais = $this->profissionalDAO->listarTodos(
            $servico,
            $regiao
        );

        echo json_encode([
            "sucesso" => true,
            "profissionais" => $profissionais
        ]);
    }


    public function buscarPorId()
    {
        $id = $_GET["id"] ?? null;

        if (!$id) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "ID do profissional não informado."
            ]);

            return;
        }

        $profissional = $this->profissionalDAO->buscarPorId($id);

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
}