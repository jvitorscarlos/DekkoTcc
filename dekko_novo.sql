-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.27-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.17.0.7270
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para dekko_novo
CREATE DATABASE IF NOT EXISTS `dekko_novo` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `dekko_novo`;

-- Copiando estrutura para tabela dekko_novo.cliente
CREATE TABLE IF NOT EXISTS `cliente` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `foto` varchar(255) NOT NULL,
  `id_regiao` int(11) NOT NULL,
  `perfil_completo` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_cliente_regiao` (`id_regiao`),
  CONSTRAINT `fk_cliente_regiao` FOREIGN KEY (`id_regiao`) REFERENCES `regiao` (`id_regiao`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.cliente: ~1 rows (aproximadamente)
INSERT INTO `cliente` (`id_cliente`, `nome`, `email`, `telefone`, `senha`, `foto`, `id_regiao`, `perfil_completo`) VALUES
	(7, 'João', 'joao@gmail.com', '2222222', '$2y$10$YCGqEI/2dduT72JZvL3w0OYhtZg3pWCMgIjVrVC21yEXcRVucnkHG', 'img/clientes/cliente_7_1791323686.png', 1, 1);

-- Copiando estrutura para tabela dekko_novo.conversa
CREATE TABLE IF NOT EXISTS `conversa` (
  `id_conversa` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `id_profissional` int(11) NOT NULL,
  `status` enum('ABERTA','ENCERRADA') NOT NULL DEFAULT 'ABERTA',
  `data_inicio` datetime NOT NULL DEFAULT current_timestamp(),
  `data_encerramento` datetime DEFAULT NULL,
  PRIMARY KEY (`id_conversa`),
  UNIQUE KEY `uq_conversa` (`id_cliente`,`id_profissional`),
  UNIQUE KEY `uq_conversa_cliente` (`id_conversa`,`id_cliente`),
  UNIQUE KEY `uq_conversa_profissional` (`id_conversa`,`id_profissional`),
  KEY `fk_conversa_profissional` (`id_profissional`),
  CONSTRAINT `fk_conversa_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conversa_profissional` FOREIGN KEY (`id_profissional`) REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_conversa_data` CHECK (`status` = 'ABERTA' and `data_encerramento` is null or `status` = 'ENCERRADA' and `data_encerramento` is not null)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.conversa: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela dekko_novo.favorito
CREATE TABLE IF NOT EXISTS `favorito` (
  `id_favorito` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `id_profissional` int(11) NOT NULL,
  `data_favorito` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_favorito`),
  UNIQUE KEY `uq_favorito` (`id_cliente`,`id_profissional`),
  KEY `fk_favorito_profissional` (`id_profissional`),
  CONSTRAINT `fk_favorito_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorito_profissional` FOREIGN KEY (`id_profissional`) REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.favorito: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela dekko_novo.mensagem
CREATE TABLE IF NOT EXISTS `mensagem` (
  `id_mensagem` int(11) NOT NULL AUTO_INCREMENT,
  `id_conversa` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_profissional` int(11) DEFAULT NULL,
  `tipo_mensagem` enum('TEXTO','ENCERRAMENTO') NOT NULL DEFAULT 'TEXTO',
  `mensagem` text NOT NULL,
  `data_envio` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_mensagem`),
  KEY `fk_mensagem_cliente_conversa` (`id_conversa`,`id_cliente`),
  KEY `fk_mensagem_profissional_conversa` (`id_conversa`,`id_profissional`),
  CONSTRAINT `fk_mensagem_cliente_conversa` FOREIGN KEY (`id_conversa`, `id_cliente`) REFERENCES `conversa` (`id_conversa`, `id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mensagem_conversa` FOREIGN KEY (`id_conversa`) REFERENCES `conversa` (`id_conversa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mensagem_profissional_conversa` FOREIGN KEY (`id_conversa`, `id_profissional`) REFERENCES `conversa` (`id_conversa`, `id_profissional`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_mensagem_remetente` CHECK (`id_cliente` is not null and `id_profissional` is null or `id_cliente` is null and `id_profissional` is not null),
  CONSTRAINT `chk_mensagem_tipo` CHECK (`tipo_mensagem` = 'TEXTO' or `tipo_mensagem` = 'ENCERRAMENTO' and `id_profissional` is not null)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.mensagem: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela dekko_novo.portfolio
CREATE TABLE IF NOT EXISTS `portfolio` (
  `id_portfolio` int(11) NOT NULL AUTO_INCREMENT,
  `id_profissional` int(11) NOT NULL,
  `foto` varchar(255) NOT NULL,
  PRIMARY KEY (`id_portfolio`),
  KEY `fk_portfolio_profissional` (`id_profissional`),
  CONSTRAINT `fk_portfolio_profissional` FOREIGN KEY (`id_profissional`) REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.portfolio: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela dekko_novo.profissional
CREATE TABLE IF NOT EXISTS `profissional` (
  `id_profissional` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `foto` varchar(255) NOT NULL,
  `biografia` text DEFAULT NULL,
  `id_regiao` int(11) NOT NULL,
  `perfil_completo` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_profissional`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_profissional_regiao` (`id_regiao`),
  CONSTRAINT `fk_profissional_regiao` FOREIGN KEY (`id_regiao`) REFERENCES `regiao` (`id_regiao`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.profissional: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela dekko_novo.profissional_servico
CREATE TABLE IF NOT EXISTS `profissional_servico` (
  `id_profissional` int(11) NOT NULL,
  `id_servico` int(11) NOT NULL,
  PRIMARY KEY (`id_profissional`,`id_servico`),
  KEY `fk_ps_servico` (`id_servico`),
  CONSTRAINT `fk_ps_profissional` FOREIGN KEY (`id_profissional`) REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ps_servico` FOREIGN KEY (`id_servico`) REFERENCES `servico` (`id_servico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.profissional_servico: ~8 rows (aproximadamente)
INSERT INTO `profissional_servico` (`id_profissional`, `id_servico`) VALUES
	(1, 1),
	(1, 2),
	(1, 3),
	(2, 1),
	(2, 2),
	(2, 3),
	(3, 1),
	(3, 4);

-- Copiando estrutura para tabela dekko_novo.regiao
CREATE TABLE IF NOT EXISTS `regiao` (
  `id_regiao` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id_regiao`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.regiao: ~4 rows (aproximadamente)
INSERT INTO `regiao` (`id_regiao`, `nome`) VALUES
	(1, 'Paracambi'),
	(2, 'Seropédica'),
	(3, 'Japeri'),
	(4, 'Queimados');

-- Copiando estrutura para tabela dekko_novo.servico
CREATE TABLE IF NOT EXISTS `servico` (
  `id_servico` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `categoria` varchar(100) NOT NULL,
  PRIMARY KEY (`id_servico`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela dekko_novo.servico: ~5 rows (aproximadamente)
INSERT INTO `servico` (`id_servico`, `nome`, `descricao`, `categoria`) VALUES
	(5, 'Fotógrafo', NULL, 'Outros'),
	(6, 'Designer', NULL, 'Outros'),
	(7, 'Cachaceiro', NULL, 'Outros'),
	(8, 'Cabeleireira', NULL, 'Outros'),
	(9, 'Transista', NULL, 'Outros');

-- Copiando estrutura para trigger dekko_novo.trg_portfolio_limite_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER trg_portfolio_limite_insert
BEFORE INSERT ON portfolio
FOR EACH ROW
BEGIN
    DECLARE quantidade INT;

    SELECT COUNT(*)
    INTO quantidade
    FROM portfolio
    WHERE id_profissional = NEW.id_profissional;

    IF quantidade >= 6 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'O profissional pode ter no maximo 6 fotos no portfolio.';
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Copiando estrutura para trigger dekko_novo.trg_portfolio_limite_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER trg_portfolio_limite_update
BEFORE UPDATE ON portfolio
FOR EACH ROW
BEGIN
    DECLARE quantidade INT;

    IF NEW.id_profissional <> OLD.id_profissional THEN

        SELECT COUNT(*)
        INTO quantidade
        FROM portfolio
        WHERE id_profissional = NEW.id_profissional;

        IF quantidade >= 6 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'O profissional pode ter no maximo 6 fotos no portfolio.';
        END IF;

    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
