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
        session_start();

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

            $arquivoTemporario =
                $_FILES["portfolio"]["tmp_name"][$i];

            $nomeOriginal =
                $_FILES["portfolio"]["name"][$i];

            $tipo =
                mime_content_type($arquivoTemporario);

            if (strpos($tipo, "image/") !== 0) {
                continue;
            }

            $extensao =
                strtolower(
                    pathinfo(
                        $nomeOriginal,
                        PATHINFO_EXTENSION
                    )
                );

            $nomeArquivo =
                "portfolio_" .
                $idProfissional .
                "_" .
                time() .
                "_" .
                ($i + 1) .
                "." .
                $extensao;

            $destino =
                $pasta . $nomeArquivo;

            if (
                !move_uploaded_file(
                    $arquivoTemporario,
                    $destino
                )
            ) {
                continue;
            }

            $caminhoBanco =
                "img/portfolio/" .
                $nomeArquivo;

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

    public function listar()
    {
        session_start();

        if (!isset($_SESSION["profissional_id"])) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Profissional não está logado."
            ]);
            return;
        }

        $idProfissional = $_SESSION["profissional_id"];

        $fotos =
            $this->portfolioDAO->listarFotos(
                $idProfissional
            );

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
