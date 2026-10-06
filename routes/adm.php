<?php

session_start();

header("Content-Type: application/json");

require_once "../controller/AdminController.php";

$acao = $_GET["acao"] ?? "";

$controller = new AdminController();

if ($acao === "login") {

    $controller->login();

} elseif ($acao === "verificarLogin") {

    $controller->verificarLogin();

} elseif ($acao === "logout") {

    $controller->logout();

} elseif ($acao === "dashboard") {

    $controller->dashboard();

} elseif ($acao === "listarClientes") {

    $controller->listarClientes();

} elseif ($acao === "listarProfissionais") {

    $controller->listarProfissionais();

} elseif ($acao === "visualizarCliente") {

    $controller->visualizarCliente();

} elseif ($acao === "visualizarProfissional") {

    $controller->visualizarProfissional();

} elseif ($acao === "atualizarCliente") {

    $controller->atualizarCliente();

} elseif ($acao === "excluirCliente") {

    $controller->excluirCliente();

} elseif ($acao === "atualizarProfissional") {

    $controller->atualizarProfissional();

} elseif ($acao === "excluirProfissional") {

    $controller->excluirProfissional();

} else {

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Ação inválida."
    ]);
}
