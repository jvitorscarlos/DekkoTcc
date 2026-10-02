<?php

header("Content-Type: application/json");

require_once "../controller/ClienteController.php";

$acao = $_GET["acao"] ?? "";

$controller = new ClienteController();

if ($acao === "cadastrar") {

    $controller->cadastrar();

} elseif ($acao === "login") {

    $controller->login();

} elseif ($acao === "atualizarPerfil") {

    $controller->atualizarPerfil();

} else {

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Ação inválida."
    ]);
}