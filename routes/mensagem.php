<?php

header("Content-Type: application/json");

require_once "../controller/MensagemController.php";

$acao = $_GET["acao"] ?? "";

$controller = new MensagemController();

if ($acao === "enviarProfissional") {
    $controller->enviarProfissional();

} elseif ($acao === "enviarCliente") {
    $controller->enviarCliente();

} elseif ($acao === "listar") {
    $controller->listar();

} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Ação inválida."
    ]);
}