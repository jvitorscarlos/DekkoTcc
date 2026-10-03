<?php

require_once "../config/database.php";

class ConversaDAO
{
    private $conexao;

    public function __construct()
    {
        $this->conexao = Database::getConexao();
    }

    // Cria uma conversa entre cliente e profissional
    public function criar($idCliente, $idProfissional)
    {
        // Verifica se já existe uma conversa
        $sql = "SELECT id_conversa
                FROM conversa
                WHERE id_cliente = ?
                AND id_profissional = ?
                LIMIT 1";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $idCliente,
            $idProfissional
        ]);

        $conversa = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($conversa) {
            return $conversa["id_conversa"];
        }

        // Cria uma nova conversa
        $sql = "INSERT INTO conversa
                (id_cliente, id_profissional, status)
                VALUES (?, ?, 'ABERTA')";

        $stmt = $this->conexao->prepare($sql);

        $stmt->execute([
            $idCliente,
            $idProfissional
        ]);

        return $this->conexao->lastInsertId();
    }

    // Busca uma conversa específica
    public function buscarPorId($idConversa)
    {
        $sql = "SELECT
                    c.id_conversa,
                    c.id_cliente,
                    c.id_profissional,
                    c.status,
                    c.data_inicio,
                    c.data_encerramento,
                    cl.nome AS cliente_nome,
                    cl.foto AS cliente_foto,
                    p.nome AS profissional_nome,
                    p.foto AS profissional_foto,

                    (
                        SELECT GROUP_CONCAT(s.nome SEPARATOR ', ')
                        FROM profissional_servico ps
                        INNER JOIN servico s
                            ON s.id_servico = ps.id_servico
                        WHERE ps.id_profissional = p.id_profissional
                    ) AS profissional_servicos

                FROM conversa c

                INNER JOIN cliente cl
                    ON cl.id_cliente = c.id_cliente

                INNER JOIN profissional p
                    ON p.id_profissional = c.id_profissional

                WHERE c.id_conversa = ?

                LIMIT 1";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $idConversa
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Lista todas as conversas de um profissional
    public function listarPorProfissional($idProfissional)
    {
        $sql = "SELECT
                    c.id_conversa,
                    c.id_cliente,
                    c.id_profissional,
                    c.status,
                    c.data_inicio,
                    c.data_encerramento,

                    cl.nome AS cliente_nome,
                    cl.foto AS cliente_foto,

                    (
                        SELECT m.mensagem
                        FROM mensagem m
                        WHERE m.id_conversa = c.id_conversa
                        ORDER BY m.data_envio DESC, m.id_mensagem DESC
                        LIMIT 1
                    ) AS ultima_mensagem,

                    (
                        SELECT m.data_envio
                        FROM mensagem m
                        WHERE m.id_conversa = c.id_conversa
                        ORDER BY m.data_envio DESC, m.id_mensagem DESC
                        LIMIT 1
                    ) AS ultima_data

                FROM conversa c

                INNER JOIN cliente cl
                    ON cl.id_cliente = c.id_cliente

                WHERE c.id_profissional = ?

                ORDER BY
                    ultima_data DESC,
                    c.data_inicio DESC";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $idProfissional
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lista todas as conversas de um cliente
    public function listarPorCliente($idCliente)
    {
        $sql = "SELECT
                    c.id_conversa,
                    c.id_cliente,
                    c.id_profissional,
                    c.status,
                    c.data_inicio,
                    c.data_encerramento,

                    p.nome AS profissional_nome,
                    p.foto AS profissional_foto,

                    (
                        SELECT GROUP_CONCAT(s.nome SEPARATOR ', ')
                        FROM profissional_servico ps
                        INNER JOIN servico s
                            ON s.id_servico = ps.id_servico
                        WHERE ps.id_profissional = p.id_profissional
                    ) AS profissional_servicos,

                    (
                        SELECT m.mensagem
                        FROM mensagem m
                        WHERE m.id_conversa = c.id_conversa
                        ORDER BY m.data_envio DESC, m.id_mensagem DESC
                        LIMIT 1
                    ) AS ultima_mensagem,

                    (
                        SELECT m.data_envio
                        FROM mensagem m
                        WHERE m.id_conversa = c.id_conversa
                        ORDER BY m.data_envio DESC, m.id_mensagem DESC
                        LIMIT 1
                    ) AS ultima_data

                FROM conversa c

                INNER JOIN profissional p
                    ON p.id_profissional = c.id_profissional

                WHERE c.id_cliente = ?

                ORDER BY
                    ultima_data DESC,
                    c.data_inicio DESC";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $idCliente
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Verifica se o profissional participa da conversa
    public function pertenceAoProfissional($idConversa, $idProfissional)
    {
        $sql = "SELECT id_conversa
                FROM conversa
                WHERE id_conversa = ?
                AND id_profissional = ?
                LIMIT 1";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $idConversa,
            $idProfissional
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    // Verifica se o cliente participa da conversa
    public function pertenceAoCliente($idConversa, $idCliente)
    {
        $sql = "SELECT id_conversa
                FROM conversa
                WHERE id_conversa = ?
                AND id_cliente = ?
                LIMIT 1";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $idConversa,
            $idCliente
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    // Encerra uma conversa
    public function encerrar($idConversa)
    {
        $sql = "UPDATE conversa
                SET
                    status = 'ENCERRADA',
                    data_encerramento = NOW()
                WHERE id_conversa = ?";

        $stmt = $this->conexao->prepare($sql);

        return $stmt->execute([
            $idConversa
        ]);
    }
}