<?php

require_once "../config/database.php";

class MensagemDAO
{
    private $conexao;

    public function __construct()
    {
        $this->conexao = Database::getConexao();
    }

    // Salva uma mensagem enviada pelo cliente
    public function enviarPeloCliente($idConversa, $idCliente, $mensagem)
    {
        $sql = "INSERT INTO mensagem
                (id_conversa, id_cliente, id_profissional, tipo_mensagem, mensagem)
                VALUES (?, ?, NULL, 'TEXTO', ?)";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $idConversa,
            $idCliente,
            $mensagem
        ]);
    }

    // Salva uma mensagem enviada pelo profissional
    public function enviarPeloProfissional($idConversa, $idProfissional, $mensagem)
    {
        $sql = "INSERT INTO mensagem
                (id_conversa, id_cliente, id_profissional, tipo_mensagem, mensagem)
                VALUES (?, NULL, ?, 'TEXTO', ?)";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $idConversa,
            $idProfissional,
            $mensagem
        ]);
    }

    // Busca todas as mensagens de uma conversa
    public function listarPorConversa($idConversa)
    {
        $sql = "SELECT
                    m.id_mensagem,
                    m.id_conversa,
                    m.id_cliente,
                    m.id_profissional,
                    m.tipo_mensagem,
                    m.mensagem,
                    m.data_envio
                FROM mensagem m
                WHERE m.id_conversa = ?
                ORDER BY m.data_envio ASC, m.id_mensagem ASC";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([$idConversa]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}