<?php

require_once "../config/database.php";

class AdminDAO
{
    private $conexao;

    public function __construct()
    {
        $this->conexao = Database::getConexao();
    }

    public function contarClientes()
    {
        $sql = "SELECT COUNT(*) FROM cliente";

        return (int) $this->conexao
            ->query($sql)
            ->fetchColumn();
    }

    public function contarProfissionais()
    {
        $sql = "SELECT COUNT(*) FROM profissional";

        return (int) $this->conexao
            ->query($sql)
            ->fetchColumn();
    }

    public function contarConversas()
    {
        $sql = "SELECT COUNT(*) FROM conversa";

        return (int) $this->conexao
            ->query($sql)
            ->fetchColumn();
    }

    public function contarFavoritos()
    {
        $sql = "SELECT COUNT(*) FROM favorito";

        return (int) $this->conexao
            ->query($sql)
            ->fetchColumn();
    }

    public function listarClientes()
    {
        $sql = "SELECT
                    c.id_cliente,
                    c.nome,
                    c.email,
                    c.telefone,
                    c.foto,
                    c.id_regiao,
                    r.nome AS regiao
                FROM cliente c
                LEFT JOIN regiao r
                    ON c.id_regiao = r.id_regiao
                ORDER BY c.nome ASC";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function listarProfissionais()
    {
        $sql = "SELECT
                    p.id_profissional,
                    p.nome,
                    p.email,
                    p.telefone,
                    p.foto,
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
                    ON p.id_profissional = ps.id_profissional
                LEFT JOIN servico s
                    ON ps.id_servico = s.id_servico
                GROUP BY p.id_profissional
                ORDER BY p.nome ASC";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function buscarClientePorId($idCliente)
    {
        $sql = "SELECT
                    c.id_cliente,
                    c.nome,
                    c.email,
                    c.telefone,
                    c.foto,
                    c.id_regiao,
                    r.nome AS regiao
                FROM cliente c
                LEFT JOIN regiao r
                    ON c.id_regiao = r.id_regiao
                WHERE c.id_cliente = ?";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $idCliente
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function atualizarCliente(
        $idCliente,
        $nome,
        $email,
        $telefone,
        $idRegiao
    ) {
        $sql = "UPDATE cliente
                SET nome = ?,
                    email = ?,
                    telefone = ?,
                    id_regiao = ?
                WHERE id_cliente = ?";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $nome,
            $email,
            $telefone,
            $idRegiao,
            $idCliente
        ]);
    }

    public function excluirCliente($idCliente)
    {
        $sql = "DELETE FROM cliente
                WHERE id_cliente = ?";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $idCliente
        ]);
    }

    public function buscarProfissionalPorId($idProfissional)
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
                    ON p.id_profissional = ps.id_profissional
                LEFT JOIN servico s
                    ON ps.id_servico = s.id_servico
                WHERE p.id_profissional = ?
                GROUP BY p.id_profissional";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $idProfissional
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function atualizarProfissional(
        $idProfissional,
        $nome,
        $email,
        $telefone,
        $endereco,
        $biografia,
        $idRegiao
    ) {
        $sql = "UPDATE profissional
                SET nome = ?,
                    email = ?,
                    telefone = ?,
                    endereco = ?,
                    biografia = ?,
                    id_regiao = ?
                WHERE id_profissional = ?";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $nome,
            $email,
            $telefone,
            $endereco,
            $biografia,
            $idRegiao,
            $idProfissional
        ]);
    }

    public function excluirProfissional($idProfissional)
    {
        $sql = "DELETE FROM profissional
                WHERE id_profissional = ?";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $idProfissional
        ]);
    }
}
