<?php

class Database
{
    private static $conexao = null;

    public static function getConexao()
    {
        if (self::$conexao === null) {
            try {
                self::$conexao = new PDO(
                    "mysql:host=localhost;dbname=dekko_novo;charset=utf8mb4",
                    "root",
                    "",
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]
                );
            } catch (PDOException $e) {
                die("Erro na conexão: " . $e->getMessage());
            }
        }

        return self::$conexao;
    }
}