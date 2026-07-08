-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: inventory_sales
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Electronics','Electronic devices and accessories');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `low_stock_alerts`
--

DROP TABLE IF EXISTS `low_stock_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `low_stock_alerts` (
  `alert_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `found_qty` int NOT NULL,
  `sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`alert_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `low_stock_alerts_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `low_stock_alerts`
--

LOCK TABLES `low_stock_alerts` WRITE;
/*!40000 ALTER TABLE `low_stock_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `low_stock_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `reorder_level` int NOT NULL DEFAULT '0',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'SKU1001','Mineral Water',NULL,75,10,0.50,1,'2025-09-15 18:53:31','2025-09-21 13:31:05'),(2,'SKU1002','Chocolate Bar',NULL,175,20,1.25,1,'2025-09-15 18:53:31','2025-09-21 15:22:59'),(3,'SKU1003','USB Mouse',1,35,5,7.99,1,'2025-09-15 18:53:31','2025-09-21 12:30:49'),(4,'SKU1004','Pendrive ',NULL,15,0,25.00,1,'2025-09-15 18:57:08','2025-09-18 21:24:20'),(5,'SKU1005','Chocolate Syrup',NULL,112,0,2.50,1,'2025-09-15 19:29:21','2025-09-21 15:22:59'),(6,'SKU1006','USB Keyboard',NULL,0,0,15.99,1,'2025-09-15 21:16:14','2025-09-21 12:30:49'),(9,'SKU1008','Biscuits',NULL,135,0,20.00,1,'2025-09-16 13:05:57','2025-09-21 15:22:58'),(11,'SKU1009','Chips',NULL,128,0,10.00,1,'2025-09-16 14:30:42','2025-09-21 15:22:59'),(12,'SKU1010','Cheese Slices',NULL,45,0,50.00,1,'2025-09-17 23:59:42','2025-09-21 15:22:59'),(14,'SKU1011','Cheese Cubes',NULL,70,0,35.00,1,'2025-09-18 00:00:54','2025-09-21 15:22:58'),(15,'SKU1012','Smart Watch',NULL,22,0,150.00,1,'2025-09-18 00:01:30','2025-09-18 21:24:20'),(16,'SKU1013','White Bread Loaf',NULL,45,0,65.00,1,'2025-09-18 00:04:12','2025-09-21 15:22:59'),(18,'SKU1014','USB cable Type A',NULL,42,0,60.00,1,'2025-09-18 21:22:22','2025-09-21 15:22:59'),(20,'SKU1015','USB cable Type C',NULL,42,0,80.00,1,'2025-09-18 21:23:41','2025-09-21 15:22:59');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `sale_item_id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`sale_item_id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`sale_id`) ON DELETE CASCADE,
  CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (1,1,2,1,1.25,1.25),(2,1,1,1,0.50,0.50),(3,1,4,1,25.00,25.00),(4,1,3,1,7.99,7.99),(5,2,1,3,0.50,1.50),(6,2,4,1,25.00,25.00),(7,2,5,2,2.00,4.00),(8,3,1,1,0.50,0.50),(9,4,1,2,0.50,1.00),(10,4,2,1,1.25,1.25),(11,4,5,1,2.00,2.00),(12,5,5,1,2.00,2.00),(13,5,2,1,1.25,1.25),(14,6,3,4,7.99,31.96),(15,7,2,2,1.25,2.50),(16,7,5,2,2.00,4.00),(17,8,2,2,1.25,2.50),(18,8,5,2,2.00,4.00),(19,9,2,3,1.25,3.75),(20,10,6,2,15.99,31.98),(21,11,2,5,1.25,6.25),(22,11,5,2,2.00,4.00),(23,12,5,3,2.00,6.00),(24,13,5,1,2.00,2.00),(25,14,5,74,2.00,148.00),(26,15,9,1,20.00,20.00),(27,15,11,1,10.00,10.00),(28,15,2,1,1.25,1.25),(29,16,11,1,10.00,10.00),(30,16,9,1,20.00,20.00),(31,16,2,1,1.25,1.25),(32,16,5,1,2.50,2.50),(33,16,4,1,25.00,25.00),(34,16,1,1,0.50,0.50),(35,17,6,2,15.99,31.98),(36,17,3,2,7.99,15.98),(37,17,4,2,25.00,50.00),(38,17,11,1,10.00,10.00),(39,17,2,1,1.25,1.25),(40,17,1,2,0.50,1.00),(41,18,9,1,20.00,20.00),(42,18,4,2,25.00,50.00),(43,18,6,1,15.99,15.99),(44,18,3,3,7.99,23.97),(45,18,1,2,0.50,1.00),(46,18,11,2,10.00,20.00),(47,18,2,2,1.25,2.50),(48,19,1,3,0.50,1.50),(49,19,9,2,20.00,40.00),(50,19,11,3,10.00,30.00),(51,19,5,1,2.50,2.50),(52,20,16,1,65.00,65.00),(53,20,14,2,35.00,70.00),(54,20,12,2,50.00,100.00),(55,20,9,1,20.00,20.00),(56,21,1,1,0.50,0.50),(57,22,9,1,20.00,20.00),(58,22,14,1,35.00,35.00),(59,22,12,1,50.00,50.00),(60,22,11,1,10.00,10.00),(61,22,2,1,1.25,1.25),(62,23,3,2,7.99,15.98),(63,23,6,2,15.99,31.98),(64,23,15,2,150.00,300.00),(65,23,4,2,25.00,50.00),(66,23,9,1,20.00,20.00),(67,23,1,4,0.50,2.00),(68,24,18,2,60.00,120.00),(69,24,20,2,80.00,160.00),(70,24,6,2,15.99,31.98),(71,24,3,2,7.99,15.98),(72,24,15,1,150.00,150.00),(73,24,4,1,25.00,25.00),(74,24,11,3,10.00,30.00),(75,24,9,2,20.00,40.00),(76,24,12,2,50.00,100.00),(77,24,16,2,65.00,130.00),(78,25,11,6,10.00,60.00),(79,25,2,2,1.25,2.50),(80,25,5,2,2.50,5.00),(81,25,1,2,0.50,1.00),(82,25,16,2,65.00,130.00),(83,25,9,2,20.00,40.00),(84,25,14,2,35.00,70.00),(85,26,14,2,35.00,70.00),(86,26,12,2,50.00,100.00),(87,26,11,2,10.00,20.00),(88,26,16,2,65.00,130.00),(89,26,5,1,2.50,2.50),(90,27,3,1,7.99,7.99),(91,27,6,3,15.99,47.97),(92,28,11,1,10.00,10.00),(93,28,2,1,1.25,1.25),(94,28,9,1,20.00,20.00),(95,28,1,3,0.50,1.50),(96,28,16,1,65.00,65.00),(97,28,5,1,2.50,2.50),(98,29,9,2,20.00,40.00),(99,29,14,3,35.00,105.00),(100,29,12,3,50.00,150.00),(101,29,11,1,10.00,10.00),(102,29,2,1,1.25,1.25),(103,29,5,2,2.50,5.00),(104,29,16,2,65.00,130.00),(105,29,20,1,80.00,80.00),(106,29,18,1,60.00,60.00);
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `sale_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `sale_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('completed','pending','canceled') COLLATE utf8mb4_unicode_ci DEFAULT 'completed',
  PRIMARY KEY (`sale_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,NULL,'2025-09-15 19:18:52',34.74,'completed'),(2,NULL,'2025-09-15 19:41:47',30.50,'completed'),(3,NULL,'2025-09-15 19:42:47',0.50,'completed'),(4,NULL,'2025-09-15 19:46:40',4.25,'completed'),(5,NULL,'2025-09-15 19:48:43',3.25,'completed'),(6,1,'2025-09-15 20:04:56',31.96,'completed'),(7,1,'2025-09-15 20:13:22',6.50,'completed'),(8,1,'2025-09-15 20:14:21',6.50,'completed'),(9,1,'2025-09-15 20:17:28',3.75,'completed'),(10,1,'2025-09-15 21:17:32',31.98,'completed'),(11,1,'2025-09-15 21:38:40',10.25,'completed'),(12,1,'2025-09-15 21:58:04',6.00,'completed'),(13,1,'2025-09-15 22:41:34',2.00,'completed'),(14,1,'2025-09-16 13:03:28',148.00,'completed'),(15,1,'2025-09-16 18:25:39',31.25,'completed'),(16,1,'2025-09-16 20:03:44',59.25,'completed'),(17,1,'2025-09-16 21:47:18',110.21,'completed'),(18,1,'2025-09-17 22:41:32',133.46,'completed'),(19,1,'2025-09-17 22:47:26',74.00,'completed'),(20,1,'2025-09-18 00:05:31',255.00,'completed'),(21,1,'2025-09-18 00:16:24',0.50,'completed'),(22,1,'2025-09-18 21:17:38',116.25,'completed'),(23,1,'2025-09-18 21:18:35',419.96,'completed'),(24,1,'2025-09-18 21:24:20',802.96,'completed'),(25,1,'2025-09-18 21:53:51',308.50,'completed'),(26,1,'2025-09-21 12:29:47',322.50,'completed'),(27,1,'2025-09-21 12:30:49',55.96,'completed'),(28,1,'2025-09-21 13:31:05',100.25,'completed'),(29,1,'2025-09-21 15:22:59',581.25,'completed');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `movement_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `change_qty` int NOT NULL,
  `movement_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` int DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`movement_id`),
  KEY `product_id` (`product_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
INSERT INTO `stock_movements` VALUES (1,2,-1,'sale',1,NULL,NULL,'2025-09-15 19:18:52'),(2,1,-1,'sale',1,NULL,NULL,'2025-09-15 19:18:52'),(3,4,-1,'sale',1,NULL,NULL,'2025-09-15 19:18:52'),(4,3,-1,'sale',1,NULL,NULL,'2025-09-15 19:18:52'),(5,1,-3,'sale',2,NULL,NULL,'2025-09-15 19:41:47'),(6,4,-1,'sale',2,NULL,NULL,'2025-09-15 19:41:47'),(7,5,-2,'sale',2,NULL,NULL,'2025-09-15 19:41:47'),(8,1,-1,'sale',3,NULL,NULL,'2025-09-15 19:42:47'),(9,1,-2,'sale',4,NULL,NULL,'2025-09-15 19:46:40'),(10,2,-1,'sale',4,NULL,NULL,'2025-09-15 19:46:40'),(11,5,-1,'sale',4,NULL,NULL,'2025-09-15 19:46:40'),(12,5,-1,'sale',5,NULL,NULL,'2025-09-15 19:48:43'),(13,2,-1,'sale',5,NULL,NULL,'2025-09-15 19:48:43'),(14,3,-4,'sale',6,NULL,1,'2025-09-15 20:04:56'),(15,2,-2,'sale',7,NULL,1,'2025-09-15 20:13:22'),(16,5,-2,'sale',7,NULL,1,'2025-09-15 20:13:22'),(17,2,-2,'sale',8,NULL,1,'2025-09-15 20:14:21'),(18,5,-2,'sale',8,NULL,1,'2025-09-15 20:14:21'),(19,2,-3,'sale',9,NULL,1,'2025-09-15 20:17:28'),(20,6,-2,'sale',10,NULL,1,'2025-09-15 21:17:32'),(21,2,-5,'sale',11,NULL,1,'2025-09-15 21:38:40'),(22,5,-2,'sale',11,NULL,1,'2025-09-15 21:38:40'),(23,5,-3,'sale',12,NULL,1,'2025-09-15 21:58:04'),(24,5,-1,'sale',13,NULL,1,'2025-09-15 22:41:34'),(25,5,-74,'sale',14,NULL,1,'2025-09-16 13:03:28'),(26,9,-1,'sale',15,NULL,1,'2025-09-16 18:25:39'),(27,11,-1,'sale',15,NULL,1,'2025-09-16 18:25:39'),(28,2,-1,'sale',15,NULL,1,'2025-09-16 18:25:39'),(29,11,-1,'sale',16,NULL,1,'2025-09-16 20:03:44'),(30,9,-1,'sale',16,NULL,1,'2025-09-16 20:03:44'),(31,2,-1,'sale',16,NULL,1,'2025-09-16 20:03:44'),(32,5,-1,'sale',16,NULL,1,'2025-09-16 20:03:44'),(33,4,-1,'sale',16,NULL,1,'2025-09-16 20:03:44'),(34,1,-1,'sale',16,NULL,1,'2025-09-16 20:03:44'),(35,6,-2,'sale',17,NULL,1,'2025-09-16 21:47:18'),(36,3,-2,'sale',17,NULL,1,'2025-09-16 21:47:18'),(37,4,-2,'sale',17,NULL,1,'2025-09-16 21:47:18'),(38,11,-1,'sale',17,NULL,1,'2025-09-16 21:47:18'),(39,2,-1,'sale',17,NULL,1,'2025-09-16 21:47:18'),(40,1,-2,'sale',17,NULL,1,'2025-09-16 21:47:18'),(41,9,-1,'sale',18,NULL,1,'2025-09-17 22:41:32'),(42,4,-2,'sale',18,NULL,1,'2025-09-17 22:41:32'),(43,6,-1,'sale',18,NULL,1,'2025-09-17 22:41:32'),(44,3,-3,'sale',18,NULL,1,'2025-09-17 22:41:32'),(45,1,-2,'sale',18,NULL,1,'2025-09-17 22:41:32'),(46,11,-2,'sale',18,NULL,1,'2025-09-17 22:41:32'),(47,2,-2,'sale',18,NULL,1,'2025-09-17 22:41:32'),(48,1,-3,'sale',19,NULL,1,'2025-09-17 22:47:26'),(49,9,-2,'sale',19,NULL,1,'2025-09-17 22:47:26'),(50,11,-3,'sale',19,NULL,1,'2025-09-17 22:47:26'),(51,5,-1,'sale',19,NULL,1,'2025-09-17 22:47:26'),(52,16,-1,'sale',20,NULL,1,'2025-09-18 00:05:31'),(53,14,-2,'sale',20,NULL,1,'2025-09-18 00:05:31'),(54,12,-2,'sale',20,NULL,1,'2025-09-18 00:05:31'),(55,9,-1,'sale',20,NULL,1,'2025-09-18 00:05:31'),(56,1,-1,'sale',21,NULL,1,'2025-09-18 00:16:24'),(57,9,-1,'sale',22,NULL,1,'2025-09-18 21:17:38'),(58,14,-1,'sale',22,NULL,1,'2025-09-18 21:17:38'),(59,12,-1,'sale',22,NULL,1,'2025-09-18 21:17:38'),(60,11,-1,'sale',22,NULL,1,'2025-09-18 21:17:38'),(61,2,-1,'sale',22,NULL,1,'2025-09-18 21:17:38'),(62,3,-2,'sale',23,NULL,1,'2025-09-18 21:18:35'),(63,6,-2,'sale',23,NULL,1,'2025-09-18 21:18:35'),(64,15,-2,'sale',23,NULL,1,'2025-09-18 21:18:35'),(65,4,-2,'sale',23,NULL,1,'2025-09-18 21:18:35'),(66,9,-1,'sale',23,NULL,1,'2025-09-18 21:18:35'),(67,1,-4,'sale',23,NULL,1,'2025-09-18 21:18:35'),(68,18,-2,'sale',24,NULL,1,'2025-09-18 21:24:20'),(69,20,-2,'sale',24,NULL,1,'2025-09-18 21:24:20'),(70,6,-2,'sale',24,NULL,1,'2025-09-18 21:24:20'),(71,3,-2,'sale',24,NULL,1,'2025-09-18 21:24:20'),(72,15,-1,'sale',24,NULL,1,'2025-09-18 21:24:20'),(73,4,-1,'sale',24,NULL,1,'2025-09-18 21:24:20'),(74,11,-3,'sale',24,NULL,1,'2025-09-18 21:24:20'),(75,9,-2,'sale',24,NULL,1,'2025-09-18 21:24:20'),(76,12,-2,'sale',24,NULL,1,'2025-09-18 21:24:20'),(77,16,-2,'sale',24,NULL,1,'2025-09-18 21:24:20'),(78,11,-6,'sale',25,NULL,1,'2025-09-18 21:53:51'),(79,2,-2,'sale',25,NULL,1,'2025-09-18 21:53:51'),(80,5,-2,'sale',25,NULL,1,'2025-09-18 21:53:51'),(81,1,-2,'sale',25,NULL,1,'2025-09-18 21:53:51'),(82,16,-2,'sale',25,NULL,1,'2025-09-18 21:53:51'),(83,9,-2,'sale',25,NULL,1,'2025-09-18 21:53:51'),(84,14,-2,'sale',25,NULL,1,'2025-09-18 21:53:51'),(85,14,-2,'sale',26,NULL,1,'2025-09-21 12:29:47'),(86,12,-2,'sale',26,NULL,1,'2025-09-21 12:29:47'),(87,11,-2,'sale',26,NULL,1,'2025-09-21 12:29:47'),(88,16,-2,'sale',26,NULL,1,'2025-09-21 12:29:47'),(89,5,-1,'sale',26,NULL,1,'2025-09-21 12:29:47'),(90,3,-1,'sale',27,NULL,1,'2025-09-21 12:30:49'),(91,6,-3,'sale',27,NULL,1,'2025-09-21 12:30:49'),(92,11,-1,'sale',28,NULL,1,'2025-09-21 13:31:05'),(93,2,-1,'sale',28,NULL,1,'2025-09-21 13:31:05'),(94,9,-1,'sale',28,NULL,1,'2025-09-21 13:31:05'),(95,1,-3,'sale',28,NULL,1,'2025-09-21 13:31:05'),(96,16,-1,'sale',28,NULL,1,'2025-09-21 13:31:05'),(97,5,-1,'sale',28,NULL,1,'2025-09-21 13:31:05'),(98,9,-2,'sale',29,NULL,1,'2025-09-21 15:22:59'),(99,14,-3,'sale',29,NULL,1,'2025-09-21 15:22:59'),(100,12,-3,'sale',29,NULL,1,'2025-09-21 15:22:59'),(101,11,-1,'sale',29,NULL,1,'2025-09-21 15:22:59'),(102,2,-1,'sale',29,NULL,1,'2025-09-21 15:22:59'),(103,5,-2,'sale',29,NULL,1,'2025-09-21 15:22:59'),(104,16,-2,'sale',29,NULL,1,'2025-09-21 15:22:59'),(105,20,-1,'sale',29,NULL,1,'2025-09-21 15:22:59'),(106,18,-1,'sale',29,NULL,1,'2025-09-21 15:22:59');
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','inventory','clerk') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'clerk',
  `full_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$AdVJ59TY6P4WCjcWHwI6X..sSjcxgR3mFzIYJhJRe1gO6fzN8V89i','admin','Administrator','admin@example.com','2025-09-15 19:06:51'),(2,'invent','$2b$10$NWvpVPdePWk7tOVZ7UGozO0SOTGdY55XLj40pComi.meLqKF5Wbn2','inventory','Inventory','inventory@example.com','2025-09-21 15:19:23'),(3,'clerk','$2b$10$pz6lq/x0FXq1p8gvVRYyveHnKi8iu735RMeHwuMp7nx2wixf0FzFS','clerk','Sales Clerk','clerk@example.com','2025-09-21 15:20:33');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-21 21:41:23
