<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "../controller/ConfirmacaoServicoController.php";

$acao = $_GET["acao"] ?? "";

$controller = new ConfirmacaoServicoController();

if ($acao === "solicitar") {
    $controller->solicitar();

} elseif ($acao === "responder") {
    $controller->responder();

} elseif ($acao === "listar") {
    $controller->listar();

} elseif ($acao === "decidirRecusa") {
    $controller->decidirRecusa();

} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Ação inválida."
    ]);
}
