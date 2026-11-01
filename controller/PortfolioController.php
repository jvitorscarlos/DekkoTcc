
<?php

require_once "../dao/PortfolioDAO.php";

class PortfolioController
{
    private $portfolioDAO;

    public function __construct()
    {
        $this->portfolioDAO = new PortfolioDAO();
    }

    public function adicionar()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION["profissional_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Profissional não está logado."
            ]);
            return;
        }

        $idProfissional = $_SESSION["profissional_id"];

        if (
            !isset($_FILES["portfolio"]) ||
            count($_FILES["portfolio"]["name"]) < 3
        ) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Adicione pelo menos 3 fotos."
            ]);
            return;
        }

        $quantidade = count($_FILES["portfolio"]["name"]);

        if ($quantidade > 6) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Você pode adicionar no máximo 6 fotos."
            ]);
            return;
        }

        $pasta = "../img/portfolio/";

        if (!is_dir($pasta)) {
            mkdir($pasta, 0777, true);
        }

        $this->portfolioDAO->excluirFotos($idProfissional);

        for ($i = 0; $i < $quantidade; $i++) {

            if ($_FILES["portfolio"]["error"][$i] !== UPLOAD_ERR_OK) {
                continue;
            }

            $arquivoTemporario = $_FILES["portfolio"]["tmp_name"][$i];
            $nomeOriginal = $_FILES["portfolio"]["name"][$i];
            $tipo = mime_content_type($arquivoTemporario);

            if (strpos($tipo, "image/") !== 0) {
                continue;
            }

            $extensao = strtolower(
                pathinfo($nomeOriginal, PATHINFO_EXTENSION)
            );

            $nomeArquivo = "portfolio_" . $idProfissional . "_" .
                time() . "_" . ($i + 1) . "." . $extensao;

            $destino = $pasta . $nomeArquivo;

            if (!move_uploaded_file($arquivoTemporario, $destino)) {
                continue;
            }

            $caminhoBanco = "img/portfolio/" . $nomeArquivo;

            $this->portfolioDAO->adicionarFoto(
                $idProfissional,
                $caminhoBanco
            );
        }

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Portfólio salvo com sucesso!"
        ]);
    }

    public function atualizar()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION["profissional_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Profissional não está logado."
            ]);
            return;
        }

        $idProfissional = $_SESSION["profissional_id"];

        // Busca as fotos atuais do profissional.
        $fotosAtuais = $this->portfolioDAO->listarFotos($idProfissional);

        // IDs das fotos que o usuário decidiu manter.
        $idsMantidos = $_POST["fotos_mantidas"] ?? [];

        if (!is_array($idsMantidos)) {
            $idsMantidos = [];
        }

        // Confere se cada foto enviada realmente pertence ao profissional.
        $fotosParaManter = [];

        foreach ($fotosAtuais as $foto) {
            if (in_array((string)$foto["id_portfolio"], array_map("strval", $idsMantidos), true)) {
                $fotosParaManter[] = $foto;
            }
        }

        // Conta as novas imagens enviadas.
        $novasFotos = [];

        if (isset($_FILES["portfolio_novas"])) {
            foreach ($_FILES["portfolio_novas"]["name"] as $i => $nome) {
                if ($_FILES["portfolio_novas"]["error"][$i] === UPLOAD_ERR_NO_FILE) {
                    continue;
                }

                if ($_FILES["portfolio_novas"]["error"][$i] !== UPLOAD_ERR_OK) {
                    echo json_encode([
                        "sucesso" => false,
                        "mensagem" => "Erro ao enviar uma das fotos."
                    ]);
                    return;
                }

                $novasFotos[] = [
                    "tmp_name" => $_FILES["portfolio_novas"]["tmp_name"][$i]
                ];
            }
        }

        $quantidadeFinal = count($fotosParaManter) + count($novasFotos);

        if ($quantidadeFinal < 3 || $quantidadeFinal > 6) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "O portfólio precisa ter entre 3 e 6 fotos."
            ]);
            return;
        }

        $pasta = "../img/portfolio/";

        if (!is_dir($pasta)) {
            mkdir($pasta, 0777, true);
        }

        // Valida e salva as novas imagens antes de excluir as antigas.
        $arquivosSalvos = [];

        foreach ($novasFotos as $i => $novaFoto) {
            $arquivoTemporario = $novaFoto["tmp_name"];

            $tipo = mime_content_type($arquivoTemporario);

            $extensoesPermitidas = [
                "image/jpeg" => "jpg",
                "image/png" => "png",
                "image/webp" => "webp",
                "image/gif" => "gif"
            ];

            if (!isset($extensoesPermitidas[$tipo])) {
                foreach ($arquivosSalvos as $arquivo) {
                    if (file_exists($arquivo["destino"])) {
                        unlink($arquivo["destino"]);
                    }
                }

                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Formato de imagem não permitido."
                ]);
                return;
            }

            if (filesize($arquivoTemporario) > 5 * 1024 * 1024) {
                foreach ($arquivosSalvos as $arquivo) {
                    if (file_exists($arquivo["destino"])) {
                        unlink($arquivo["destino"]);
                    }
                }

                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Cada imagem deve ter no máximo 5 MB."
                ]);
                return;
            }

            $extensao = $extensoesPermitidas[$tipo];

            $nomeArquivo = "portfolio_" . $idProfissional . "_" .
                uniqid() . "_" . ($i + 1) . "." . $extensao;

            $destino = $pasta . $nomeArquivo;

            if (!move_uploaded_file($arquivoTemporario, $destino)) {
                foreach ($arquivosSalvos as $arquivo) {
                    if (file_exists($arquivo["destino"])) {
                        unlink($arquivo["destino"]);
                    }
                }

                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Não foi possível salvar uma das fotos."
                ]);
                return;
            }

            $arquivosSalvos[] = [
                "destino" => $destino,
                "caminho" => "img/portfolio/" . $nomeArquivo
            ];
        }

        // Adiciona as novas fotos ao banco.
        foreach ($arquivosSalvos as $arquivo) {
            if (!$this->portfolioDAO->adicionarFoto(
                $idProfissional,
                $arquivo["caminho"]
            )) {
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Erro ao registrar uma das fotos."
                ]);
                return;
            }
        }

        // Exclui as fotos antigas que não foram mantidas.
        foreach ($fotosAtuais as $foto) {
            $idFoto = (string)$foto["id_portfolio"];

            if (!in_array($idFoto, array_map("strval", $idsMantidos), true)) {
                $this->portfolioDAO->excluirFotoPorId(
                    $foto["id_portfolio"],
                    $idProfissional
                );

                $caminhoArquivo = "../" . $foto["foto"];

                if (file_exists($caminhoArquivo)) {
                    unlink($caminhoArquivo);
                }
            }
        }

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Portfólio atualizado com sucesso!"
        ]);
    }

    public function listar()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION["profissional_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Profissional não está logado."
            ]);
            return;
        }

        $idProfissional = $_SESSION["profissional_id"];

        $fotos = $this->portfolioDAO->listarFotos($idProfissional);

        echo json_encode([
            "sucesso" => true,
            "fotos" => $fotos
        ]);
    }

    public function listarPorId()
    {
        $idProfissional = $_GET["id"] ?? null;

        if (!$idProfissional) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "ID do profissional não informado."
            ]);
            return;
        }

        $fotos = $this->portfolioDAO->listarFotos($idProfissional);

        echo json_encode([
            "sucesso" => true,
            "fotos" => $fotos
        ]);
    }
}
