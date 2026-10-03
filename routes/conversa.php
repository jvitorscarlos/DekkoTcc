<?php

header("Content-Type: application/json");

require_once "../controller/ConversaController.php";

$acao = $_GET["acao"] ?? "";

$controller = new ConversaController();

if ($acao === "criar") {
    $controller->criar();

} elseif ($acao === "minhasProfissional") {
    $controller->minhasConversasProfissional();

} elseif ($acao === "minhasCliente") {
    $controller->minhasConversasCliente();

} elseif ($acao === "buscar") {
    $controller->buscar();

} elseif ($acao === "encerrar") {
    $controller->encerrar();

} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Ação inválida."
    ]);
}