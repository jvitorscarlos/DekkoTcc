
<?php

require_once "../config/database.php";

class ConfirmacaoServicoDAO
{
    private $conexao;

    public function __construct()
    {
        $this->conexao = Database::getConexao();
    }

    // Profissional solicita a confirmação do serviço
    public function solicitar($idConversa)
    {
        try {
            $this->conexao->beginTransaction();

            // Bloqueia a conversa durante a operação
            $sql = "SELECT status
                    FROM conversa
                    WHERE id_conversa = ?
                    FOR UPDATE";

            $stmt = $this->conexao->prepare($sql);
            $stmt->execute([$idConversa]);

            $conversa = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$conversa || $conversa["status"] !== "ABERTA") {
                $this->conexao->rollBack();
                return false;
            }

            // Verifica se já existe pedido pendente
            $sql = "SELECT id_confirmacao
                    FROM confirmacao_servico
                    WHERE id_conversa = ?
                    AND status = 'PENDENTE'
                    LIMIT 1";

            $stmt = $this->conexao->prepare($sql);
            $stmt->execute([$idConversa]);

            if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                $this->conexao->rollBack();
                return false;
            }

            // Cria o pedido
            $sql = "INSERT INTO confirmacao_servico
                    (id_conversa, status)
                    VALUES (?, 'PENDENTE')";

            $stmt = $this->conexao->prepare($sql);
            $resultado = $stmt->execute([$idConversa]);

            $this->conexao->commit();

            return $resultado;

        } catch (Exception $e) {
            if ($this->conexao->inTransaction()) {
                $this->conexao->rollBack();
            }

            return false;
        }
    }

    // Cliente aceita ou recusa o pedido
    public function responder($idConversa, $resposta)
    {
        if (!in_array($resposta, ["ACEITA", "RECUSADA"], true)) {
            return false;
        }

        try {
            $this->conexao->beginTransaction();

            $sql = "SELECT status
                    FROM conversa
                    WHERE id_conversa = ?
                    FOR UPDATE";

            $stmt = $this->conexao->prepare($sql);
            $stmt->execute([$idConversa]);

            $conversa = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$conversa || $conversa["status"] !== "ABERTA") {
                $this->conexao->rollBack();
                return false;
            }

            // Localiza o pedido pendente
            $sql = "SELECT id_confirmacao
                    FROM confirmacao_servico
                    WHERE id_conversa = ?
                    AND status = 'PENDENTE'
                    ORDER BY id_confirmacao DESC
                    LIMIT 1
                    FOR UPDATE";

            $stmt = $this->conexao->prepare($sql);
            $stmt->execute([$idConversa]);

            $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$pedido) {
                $this->conexao->rollBack();
                return false;
            }

            // Registra a resposta do cliente
            $sql = "UPDATE confirmacao_servico
                    SET status = ?,
                        data_resposta = NOW()
                    WHERE id_confirmacao = ?";

            $stmt = $this->conexao->prepare($sql);
            $stmt->execute([
                $resposta,
                $pedido["id_confirmacao"]
            ]);

            // Se aceitou, encerra a conversa
            if ($resposta === "ACEITA") {
                $sql = "UPDATE conversa
                        SET status = 'ENCERRADA',
                            data_encerramento = NOW()
                        WHERE id_conversa = ?";

                $stmt = $this->conexao->prepare($sql);
                $stmt->execute([$idConversa]);
            }

            $this->conexao->commit();

            return true;

        } catch (Exception $e) {
            if ($this->conexao->inTransaction()) {
                $this->conexao->rollBack();
            }

            return false;
        }
    }

    // Lista os pedidos de confirmação da conversa
    public function listarPorConversa($idConversa)
    {
      $sql = "SELECT
            id_confirmacao,
            id_conversa,
            status,
            decisao_cliente,
            data_solicitacao,
            data_resposta
        FROM confirmacao_servico
        WHERE id_conversa = ?
        ORDER BY id_confirmacao ASC";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([$idConversa]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    // Registra a decisão do cliente depois de recusar
public function decidirRecusa($idConversa, $decisao)
{
    if (!in_array($decisao, ["CONTINUAR", "ENCERRAR"], true)) {
        return false;
    }

    try {
        $this->conexao->beginTransaction();

        $sql = "SELECT id_confirmacao
                FROM confirmacao_servico
                WHERE id_conversa = ?
                AND status = 'RECUSADA'
                AND decisao_cliente IS NULL
                ORDER BY id_confirmacao DESC
                LIMIT 1
                FOR UPDATE";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([$idConversa]);

        $confirmacao = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$confirmacao) {
            $this->conexao->rollBack();
            return false;
        }

        $sql = "UPDATE confirmacao_servico
                SET decisao_cliente = ?
                WHERE id_confirmacao = ?";

        $stmt = $this->conexao->prepare($sql);
        $stmt->execute([
            $decisao,
            $confirmacao["id_confirmacao"]
        ]);

        if ($decisao === "ENCERRAR") {
            $sql = "UPDATE conversa
                    SET status = 'ENCERRADA',
                        data_encerramento = NOW()
                    WHERE id_conversa = ?";

            $stmt = $this->conexao->prepare($sql);
            $stmt->execute([$idConversa]);
        }

        $this->conexao->commit();
        return true;

    } catch (Exception $e) {
        if ($this->conexao->inTransaction()) {
            $this->conexao->rollBack();
        }

        return false;
    }
}
}
