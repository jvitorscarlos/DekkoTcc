<?php

require_once "../config/database.php";
require_once "../model/Profissional.php";

class ProfissionalDAO
{
    private $conexao;

    public function __construct()
    {
        $this->conexao = Database::getConexao();
    }

    public function cadastrar(Profissional $profissional, $servico)
    {
        try {

            $this->conexao->beginTransaction();

            // 1. Cadastra o profissional

            $sql = "INSERT INTO profissional
                    (nome, email, senha, telefone, endereco, regiao, experiencia, descricao, foto)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->conexao->prepare($sql);

            $stmt->execute([
                $profissional->getNome(),
                $profissional->getEmail(),
                $profissional->getSenha(),
                $profissional->getTelefone(),
                $profissional->getEndereco(),
                $profissional->getRegiao(),
                $profissional->getExperiencia(),
                $profissional->getDescricao(),
                $profissional->getFoto()
            ]);

            // 2. Pega o ID do profissional

            $profissionalId = $this->conexao->lastInsertId();

            // 3. Procura o serviço

            $sql = "SELECT id_servico
                    FROM servico
                    WHERE nome = ?";

            $stmt = $this->conexao->prepare($sql);

            $stmt->execute([$servico]);

            $servicoExistente = $stmt->fetch(PDO::FETCH_ASSOC);

            // 4. Se o serviço não existir, cadastra

            if (!$servicoExistente) {

                $sql = "INSERT INTO servico (nome)
                        VALUES (?)";

                $stmt = $this->conexao->prepare($sql);

                $stmt->execute([$servico]);

                $servicoId = $this->conexao->lastInsertId();

            } else {

                $servicoId = $servicoExistente["id_servico"];

            }

            // 5. Liga profissional ao serviço

            $sql = "INSERT INTO especialidade
                    (profissional_id, servico_id)
                    VALUES (?, ?)";

            $stmt = $this->conexao->prepare($sql);

            $stmt->execute([
                $profissionalId,
                $servicoId
            ]);

            $this->conexao->commit();

            return true;

        } catch (Exception $e) {

            $this->conexao->rollBack();

            return false;
        }
    }


    public function listarTodos($servico = "", $regiao = "")
    {
        $sql = "SELECT
                    p.id_profissional,
                    p.nome,
                    p.email,
                    p.telefone,
                    p.endereco,
                    p.regiao,
                    p.experiencia,
                    p.descricao,
                    p.foto,
                    s.nome AS servico
                FROM profissional p
                LEFT JOIN especialidade e
                    ON p.id_profissional = e.profissional_id
                LEFT JOIN servico s
                    ON e.servico_id = s.id_servico
                WHERE 1=1";

        $parametros = [];

        if (!empty($servico)) {

            $sql .= " AND s.nome LIKE ?";

            $parametros[] = "%" . $servico . "%";
        }

        if (!empty($regiao)) {

            $sql .= " AND p.regiao = ?";

            $parametros[] = $regiao;
        }

        $stmt = $this->conexao->prepare($sql);

        $stmt->execute($parametros);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function buscarPorId($id)
    {
        $sql = "SELECT
                    p.id_profissional,
                    p.nome,
                    p.email,
                    p.telefone,
                    p.endereco,
                    p.regiao,
                    p.experiencia,
                    p.descricao,
                    p.foto,
                    s.nome AS servico
                FROM profissional p
                LEFT JOIN especialidade e
                    ON p.id_profissional = e.profissional_id
                LEFT JOIN servico s
                    ON e.servico_id = s.id_servico
                WHERE p.id_profissional = ?";

        $stmt = $this->conexao->prepare($sql);

        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}