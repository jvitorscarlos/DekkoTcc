<?php

require_once "../config/database.php";

class PortfolioDAO
{
    private $conexao;

    public function __construct()
    {
        $this->conexao = Database::getConexao();
    }

    public function adicionarFoto($idProfissional, $foto)
    {
        $sql = "INSERT INTO portfolio
                (id_profissional, foto)
                VALUES (?, ?)";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $idProfissional,
            $foto
        ]);
    }

    public function listarFotos($idProfissional)
    {
        $sql = "SELECT *
                FROM portfolio
                WHERE id_profissional = ?
                ORDER BY id_portfolio ASC";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([$idProfissional]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function excluirFotos($idProfissional)
    {
        $sql = "DELETE FROM portfolio
                WHERE id_profissional = ?";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $idProfissional
        ]);
    }
}
