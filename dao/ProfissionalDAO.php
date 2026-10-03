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

    /*
    =========================================
    CADASTRAR PROFISSIONAL
    =========================================
    */

    public function cadastrar(Profissional $profissional, $servicos)
    {
        try {

            $this->conexao->beginTransaction();

            /*
            =========================================
            1. CADASTRA O PROFISSIONAL
            =========================================
            */

            $sql = "INSERT INTO profissional
                    (
                        nome,
                        email,
                        telefone,
                        senha,
                        endereco,
                        foto,
                        biografia,
                        id_regiao
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->conexao->prepare($sql);

            $stmt->execute([
                $profissional->getNome(),
                $profissional->getEmail(),
                $profissional->getTelefone(),
                $profissional->getSenha(),
                $profissional->getEndereco(),
                $profissional->getFoto(),
                $profissional->getBiografia(),
                $profissional->getIdRegiao()
            ]);

            $profissionalId = $this->conexao->lastInsertId();


            /*
            =========================================
            2. CADASTRA OS SERVIÇOS
            =========================================
            */

            foreach ($servicos as $servico) {

                $servico = trim($servico);

                if ($servico === "") {
                    continue;
                }


                /*
                Procura se o serviço já existe.
                */

                $sql = "SELECT id_servico
                        FROM servico
                        WHERE nome = ?";

                $stmt = $this->conexao->prepare($sql);
                $stmt->execute([$servico]);

                $servicoExistente =
                    $stmt->fetch(PDO::FETCH_ASSOC);


                /*
                Se não existir, cria.
                */

                if (!$servicoExistente) {

                    $sql = "INSERT INTO servico
                            (
                                nome,
                                descricao,
                                categoria
                            )
                            VALUES (?, ?, ?)";

                    $stmt =
                        $this->conexao->prepare($sql);

                    $stmt->execute([
                        $servico,
                        null,
                        "Outros"
                    ]);

                    $servicoId =
                        $this->conexao->lastInsertId();

                } else {

                    $servicoId =
                        $servicoExistente["id_servico"];
                }


                /*
                =========================================
                3. LIGA PROFISSIONAL AO SERVIÇO
                =========================================
                */

                $sql = "INSERT INTO profissional_servico
                        (
                            id_profissional,
                            id_servico
                        )
                        VALUES (?, ?)";

                $stmt =
                    $this->conexao->prepare($sql);

                $stmt->execute([
                    $profissionalId,
                    $servicoId
                ]);
            }


            /*
            =========================================
            4. FINALIZA
            =========================================
            */

            $this->conexao->commit();

            return true;

        } catch (Exception $e) {

            if ($this->conexao->inTransaction()) {
                $this->conexao->rollBack();
            }

            return false;
        }
    }


    /*
    =========================================
    BUSCAR POR EMAIL
    =========================================
    */

    public function buscarPorEmail($email)
    {
        $sql = "SELECT *
                FROM profissional
                WHERE email = ?";

        $stmt =
            $this->conexao->prepare($sql);

        $stmt->execute([$email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    /*
    =========================================
    BUSCAR PROFISSIONAL POR ID
    =========================================
    */

    public function buscarPorId($id)
    {
        $sql = "SELECT
                    p.id_profissional,
                    p.nome,
                    p.email,
                    p.telefone,
                    p.endereco,
                    p.foto,
                    p.biografia,
                    p.id_regiao,
                    r.nome AS regiao,
                    GROUP_CONCAT(
                        s.nome
                        SEPARATOR ', '
                    ) AS servico

                FROM profissional p

                LEFT JOIN regiao r
                    ON p.id_regiao = r.id_regiao

                LEFT JOIN profissional_servico ps
                    ON p.id_profissional =
                       ps.id_profissional

                LEFT JOIN servico s
                    ON ps.id_servico =
                       s.id_servico

                WHERE p.id_profissional = ?

                GROUP BY p.id_profissional";

        $stmt =
            $this->conexao->prepare($sql);

        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    /*
    =========================================
    LISTAR PROFISSIONAIS
    =========================================
    */

    public function listarTodos(
        $servico = "",
        $regiao = ""
    ) {

        $sql = "SELECT
                    p.id_profissional,
                    p.nome,
                    p.email,
                    p.telefone,
                    p.endereco,
                    p.foto,
                    p.biografia,
                    p.id_regiao,
                    r.nome AS regiao,
                    GROUP_CONCAT(
                        s.nome
                        SEPARATOR ', '
                    ) AS servico

                FROM profissional p

                LEFT JOIN regiao r
                    ON p.id_regiao =
                       r.id_regiao

                LEFT JOIN profissional_servico ps
                    ON p.id_profissional =
                       ps.id_profissional

                LEFT JOIN servico s
                    ON ps.id_servico =
                       s.id_servico

                WHERE 1 = 1";

        $parametros = [];


        /*
        =========================================
        FILTRO POR SERVIÇO
        =========================================
        */

        if (!empty($servico)) {

            $sql .= " AND s.nome LIKE ?";

            $parametros[] =
                "%" . $servico . "%";
        }


        /*
        =========================================
        FILTRO POR REGIÃO
        =========================================
        */

        if (!empty($regiao)) {

            $sql .= " AND r.nome = ?";

            $parametros[] =
                $regiao;
        }


        $sql .= " GROUP BY p.id_profissional";


        $stmt =
            $this->conexao->prepare($sql);

        $stmt->execute($parametros);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    /*
    =========================================
    ATUALIZAR PERFIL
    =========================================
    */

    public function atualizarPerfil(
        $idProfissional,
        $nome,
        $telefone,
        $endereco,
        $biografia,
        $idRegiao,
        $foto
    ) {

        $sql = "UPDATE profissional
                SET nome = ?,
                    telefone = ?,
                    endereco = ?,
                    biografia = ?,
                    id_regiao = ?,
                    foto = ?,
                    perfil_completo = 1
                WHERE id_profissional = ?";

        $stmt =
            $this->conexao->prepare($sql);

        return $stmt->execute([
            $nome,
            $telefone,
            $endereco,
            $biografia,
            $idRegiao,
            $foto,
            $idProfissional
        ]);
    }
}
