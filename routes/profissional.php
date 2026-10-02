<?php

header("Content-Type: application/json");

require_once "../controller/ProfissionalController.php";

$acao = $_GET["acao"] ?? "";

$controller = new ProfissionalController();

if ($acao === "cadastrar") {

    $controller->cadastrar();

} elseif ($acao === "listar") {

    $controller->listar();

} elseif ($acao === "buscar") {

    $controller->buscarPorId();

} else {

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Ação inválida."
    ]);
}