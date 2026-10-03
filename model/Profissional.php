<?php

class Profissional
{
    private $id_profissional;
    private $nome;
    private $email;
    private $senha;
    private $telefone;
    private $endereco;
    private $foto;
    private $biografia;
    private $id_regiao;

    public function getIdProfissional()
    {
        return $this->id_profissional;
    }

    public function setIdProfissional($id_profissional)
    {
        $this->id_profissional = $id_profissional;
    }

    public function getNome()
    {
        return $this->nome;
    }

    public function setNome($nome)
    {
        $this->nome = $nome;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function setEmail($email)
    {
        $this->email = $email;
    }

    public function getSenha()
    {
        return $this->senha;
    }

    public function setSenha($senha)
    {
        $this->senha = $senha;
    }

    public function getTelefone()
    {
        return $this->telefone;
    }

    public function setTelefone($telefone)
    {
        $this->telefone = $telefone;
    }

    public function getEndereco()
    {
        return $this->endereco;
    }

    public function setEndereco($endereco)
    {
        $this->endereco = $endereco;
    }

    public function getFoto()
    {
        return $this->foto;
    }

    public function setFoto($foto)
    {
        $this->foto = $foto;
    }

    public function getBiografia()
    {
        return $this->biografia;
    }

    public function setBiografia($biografia)
    {
        $this->biografia = $biografia;
    }

    public function getIdRegiao()
    {
        return $this->id_regiao;
    }

    public function setIdRegiao($id_regiao)
    {
        $this->id_regiao = $id_regiao;
    }
}
