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

} elseif ($acao === "meuPerfil") {

    $controller->meuPerfil();

} elseif ($acao === "sair") {

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $_SESSION = [];
    session_destroy();

    echo json_encode(["sucesso" => true]);

} else {

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Ação inválida."
    ]);
}