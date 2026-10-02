<?php

require_once "../config/database.php";
require_once "../model/Cliente.php";

class ClienteDAO
{
    private $conexao;

    public function __construct()
    {
        $this->conexao = Database::getConexao();
    }

    public function cadastrar(Cliente $cliente)
    {
        $sql = "INSERT INTO cliente
                (nome, email, telefone, senha, foto, id_regiao)
                VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $cliente->getNome(),
            $cliente->getEmail(),
            $cliente->getTelefone(),
            $cliente->getSenha(),
            $cliente->getFoto(),
            $cliente->getIdRegiao()
        ]);
    }

    public function buscarPorEmail($email)
    {
        $sql = "SELECT * FROM cliente WHERE email = ?";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([$email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function atualizarPerfil($idCliente, $nome, $telefone, $idRegiao, $foto)
    {
        $sql = "UPDATE cliente
        SET nome = ?,
            telefone = ?,
            id_regiao = ?,
            foto = ?,
            perfil_completo = 1
        WHERE id_cliente = ?";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $nome,
            $telefone,
            $idRegiao,
            $foto,
            $idCliente
        ]);
    }
}