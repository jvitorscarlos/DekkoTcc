<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Content-Type: text/plain");
require_once "../controller/PortfolioController.php";

$acao = $_GET["acao"] ?? "";

$controller = new PortfolioController();

if ($acao === "adicionar") {

    $controller->adicionar();

} elseif ($acao === "listar") {

    $controller->listar();

} elseif ($acao === "listarPorId") {

    $controller->listarPorId();

} else {

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Ação inválida."
    ]);
}
