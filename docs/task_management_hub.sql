-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 24, 2026 at 12:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `task_management_hub`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `project_id`, `task_id`, `action`, `details`, `created_at`) VALUES
(1, 1, 3, NULL, 'project_created', 'Project \"My First Project\" was created', '2026-05-19 12:20:44'),
(2, 1, 3, 1, 'task_created', 'Task \"Set up the backend\" was created', '2026-05-19 12:22:13'),
(3, 1, 3, 2, 'task_created', 'Task \"Develop backend using node\" was created', '2026-05-20 10:38:58'),
(4, 1, 3, 2, 'task_moved', 'Task \"Develop backend using node\" moved to in_progress', '2026-05-20 10:39:30'),
(5, 1, 4, NULL, 'project_created', 'Project \"Internal stock Management\" was created', '2026-05-20 10:52:48'),
(6, 2, 5, NULL, 'project_created', 'Project \"E-commerce Platform\" was created', '2026-05-21 11:42:23'),
(7, 2, 3, 3, 'task_created', 'Task \"Create Login API\" was created', '2026-05-21 11:47:43'),
(8, 2, 4, 4, 'task_created', 'Task \"Design UI\" was created', '2026-05-21 11:51:17'),
(9, 2, 5, 5, 'task_created', 'Task \"UI DESIGN\" was created', '2026-05-21 11:52:43'),
(10, 1, 6, NULL, 'project_created', 'Project \"Website Design\" was created', '2026-05-23 23:07:39'),
(11, 1, 6, 6, 'task_created', 'Task \"User interfacewe\" was created', '2026-05-23 23:08:32'),
(12, 1, 4, NULL, 'project_archived', 'Project was archived', '2026-05-23 23:10:14'),
(13, 2, 5, 7, 'task_created', 'Task \"Report\" was created', '2026-05-24 07:54:09'),
(14, 1, 6, 8, 'task_created', 'Task \"Greeting\" was created', '2026-05-24 08:53:20'),
(15, 1, 7, NULL, 'project_created', 'Project \"Mining system\" was created', '2026-05-25 12:33:18'),
(16, 1, 7, 9, 'task_created', 'Task \"Database implementation\" was created', '2026-05-25 12:34:23'),
(17, 4, 5, 10, 'task_created', 'Task \"3eghj\" was created', '2026-05-25 15:46:00'),
(18, 1, 8, NULL, 'project_created', 'Project \"KorodeTech\" was created', '2026-05-26 12:21:10'),
(19, 1, 8, 11, 'task_created', 'Task \"electronics marjketing\" was created', '2026-05-26 12:22:01'),
(20, 1, 8, 12, 'task_created', 'Task \"ghvgh\" was created', '2026-05-26 12:23:03'),
(21, 1, 8, 13, 'task_created', 'Task \"we\" was created', '2026-05-26 12:23:19'),
(22, 1, 8, 14, 'task_created', 'Task \"were\" was created', '2026-05-26 12:23:37'),
(23, 1, 7, 9, 'task_moved', 'Task \"Database implementation\" moved to in_progress', '2026-05-28 09:49:58'),
(24, 1, 7, 9, 'task_moved', 'Task \"Database implementation\" moved to review', '2026-05-28 09:50:03'),
(25, 1, 7, 9, 'task_moved', 'Task \"Database implementation\" moved to done', '2026-05-28 09:50:08'),
(26, 1, 9, NULL, 'project_created', 'Project \"Mobile Banking App\" was created', '2026-05-28 09:56:50'),
(27, 1, 10, NULL, 'project_created', 'Project \"School Management System\" was created', '2026-05-28 09:57:43'),
(28, 1, 11, NULL, 'project_created', 'Project \"Hospital Patient Portal\" was created', '2026-05-28 09:58:26'),
(29, 1, 9, 15, 'task_created', 'Task \"Security architecture design\" was created', '2026-05-28 10:08:15'),
(30, 1, 9, 16, 'task_created', 'Task \"User login with biometrics\" was created', '2026-05-28 10:10:02'),
(31, 1, 9, 17, 'task_created', 'Task \"Account balance dashboard\" was created', '2026-05-28 10:10:50'),
(32, 1, 9, 18, 'task_created', 'Task \"Transaction history\" was created', '2026-05-28 10:11:39'),
(33, 1, 9, 19, 'task_created', 'Task \"Push notifications\" was created', '2026-05-28 10:12:22'),
(34, 1, 10, 20, 'task_created', 'Task \"Student registration module\" was created', '2026-05-28 10:17:00'),
(35, 1, 10, 21, 'task_created', 'Task \"Grade tracking system\" was created', '2026-05-28 10:17:52'),
(36, 1, 10, 22, 'task_created', 'Task \"Attendance tracker\" was created', '2026-05-28 10:18:44'),
(37, 1, 10, 23, 'task_created', 'Task \"Parent portal\" was created', '2026-05-28 10:19:11'),
(38, 1, 10, 24, 'task_created', 'Task \"Report card generation\" was created', '2026-05-28 10:20:15'),
(39, 1, 10, 25, 'task_created', 'Task \"SMS notifications\" was created', '2026-05-28 10:20:51'),
(40, 1, 11, 26, 'task_created', 'Task \"Patient registration\" was created', '2026-05-28 10:22:48'),
(41, 1, 11, 27, 'task_created', 'Task \"Appointment booking\" was created', '2026-05-28 10:23:23'),
(42, 1, 11, 28, 'task_created', 'Task \"Doctor availability calendar\" was created', '2026-05-28 10:23:51'),
(43, 1, 11, 29, 'task_created', 'Task \"Medical records access\" was created', '2026-05-28 10:24:26'),
(44, 1, 11, 30, 'task_created', 'Task \"Prescription management\" was created', '2026-05-28 10:25:07'),
(45, 1, 10, 25, 'task_moved', 'Task \"SMS notifications\" moved to done', '2026-05-28 10:27:22'),
(46, 1, 10, 25, 'task_moved', 'Task \"SMS notifications\" moved to todo', '2026-05-28 10:27:25'),
(47, 1, 8, 13, 'task_moved', 'Task \"we\" moved to done', '2026-05-28 10:27:58'),
(48, 1, 7, 9, 'task_moved', 'Task \"Database implementation\" moved to todo', '2026-05-28 10:28:13'),
(49, 4, 10, 23, 'task_moved', 'Task \"Parent portal\" moved to done', '2026-05-28 10:33:09'),
(50, 4, 10, 20, 'task_moved', 'Task \"Student registration module\" moved to todo', '2026-05-28 10:33:30'),
(51, 4, 10, 23, 'task_moved', 'Task \"Parent portal\" moved to todo', '2026-05-28 10:33:32'),
(52, 5, 11, 30, 'task_moved', 'Task \"Prescription management\" moved to done', '2026-05-28 10:34:24'),
(53, 5, 11, 30, 'task_moved', 'Task \"Prescription management\" moved to todo', '2026-05-28 10:34:25'),
(54, 1, 10, 23, 'task_moved', 'Task \"Parent portal\" moved to done', '2026-05-28 11:08:22'),
(55, 1, 10, 31, 'task_created', 'Task \"wewf\" was created', '2026-05-28 11:08:56'),
(56, 1, 12, NULL, 'project_created', 'Project \"Transport Management\" was created', '2026-05-28 13:58:32'),
(57, 1, 5, 10, 'task_moved', 'Task \"3eghj\" moved to done', '2026-05-28 13:59:42'),
(58, 1, 11, 27, 'task_moved', 'Task \"Appointment booking\" moved to review', '2026-05-28 14:30:41'),
(59, 4, 12, 32, 'task_created', 'Task \"ddeeee\" was created', '2026-05-29 11:06:22'),
(60, 1, 12, 32, 'task_moved', 'Task \"ddeeee\" moved to in_progress', '2026-06-01 09:55:55'),
(61, 1, 12, 32, 'task_moved', 'Task \"ddeeee\" moved to done', '2026-06-01 09:57:36'),
(62, 1, 12, NULL, 'project_archived', 'Project was archived', '2026-06-01 09:58:03'),
(63, 1, 12, 32, 'task_moved', 'Task \"ddeeee\" moved to in_progress', '2026-06-01 09:58:51'),
(64, 1, 3, NULL, 'project_archived', 'Project was archived', '2026-06-01 09:59:46'),
(65, 1, 3, 2, 'task_moved', 'Task \"Develop backend using node\" moved to review', '2026-06-01 09:59:51'),
(66, 1, 3, 3, 'task_moved', 'Task \"Create Login API\" moved to in_progress', '2026-06-01 09:59:54'),
(67, 1, 7, NULL, 'project_archived', 'Project was archived', '2026-06-01 10:00:38'),
(68, 1, 7, 9, 'task_moved', 'Task \"Database implementation\" moved to done', '2026-06-01 10:07:32'),
(69, 4, 11, 29, 'task_moved', 'Task \"Medical records access\" moved to in_progress', '2026-06-01 11:17:45'),
(70, 4, 11, 28, 'task_moved', 'Task \"Doctor availability calendar\" moved to in_progress', '2026-06-01 11:18:49'),
(71, 8, 11, 29, 'task_moved', 'Task \"Medical records access\" moved to review', '2026-06-02 11:00:58'),
(72, 8, 11, 27, 'task_moved', 'Task \"Appointment booking\" moved to done', '2026-06-02 11:01:06'),
(73, 2, 8, 33, 'task_created', 'Task \"technology\" was created', '2026-06-02 15:08:57'),
(74, 1, 13, NULL, 'project_created', 'Project \"Booking House Rent \" was created', '2026-06-02 15:25:45'),
(75, 1, 13, 34, 'task_created', 'Task \"Home\" was created', '2026-06-02 15:26:34'),
(76, 1, 13, 34, 'task_moved', 'Task \"Home\" moved to in_progress', '2026-06-02 15:26:54'),
(77, 1, 13, 34, 'task_moved', 'Task \"Home\" moved to review', '2026-06-02 15:27:10'),
(78, 2, 13, 35, 'task_created', 'Task \"Backend\" was created', '2026-06-02 15:28:35'),
(79, 1, 13, 34, 'task_moved', 'Task \"Home\" moved to done', '2026-06-02 16:25:59'),
(80, 2, 14, NULL, 'project_created', 'Project \"Inkomane web Portal\" was created', '2026-06-03 09:37:20'),
(81, 2, 14, 36, 'task_created', 'Task \"Advertisiment page\" was created', '2026-06-03 09:39:00'),
(82, 1, 14, 37, 'task_created', 'Task \"3e2wsd\" was created', '2026-06-03 09:39:51'),
(83, 2, 14, 36, 'task_moved', 'Task \"Advertisiment page\" moved to review', '2026-06-03 10:42:08'),
(84, 2, 14, 36, 'task_moved', 'Task \"Advertisiment page\" moved to done', '2026-06-03 10:43:04'),
(85, 1, 15, NULL, 'project_created', 'Project \"Trading\" was created', '2026-06-03 11:37:17'),
(86, 1, 15, 38, 'task_created', 'Task \"yty\" was created', '2026-06-03 11:38:01'),
(87, 1, 15, 38, 'task_moved', 'Task \"yty\" moved to in_progress', '2026-06-03 11:38:29'),
(88, 1, 15, 38, 'task_moved', 'Task \"yty\" moved to review', '2026-06-03 11:38:35'),
(89, 1, 15, 38, 'task_moved', 'Task \"yty\" moved to done', '2026-06-03 11:38:37'),
(90, 2, 13, 35, 'task_moved', 'Task \"Backend\" moved to in_progress', '2026-06-17 14:01:16'),
(91, 2, 13, 35, 'task_moved', 'Task \"Backend\" moved to review', '2026-06-17 14:01:18'),
(92, 2, 13, 35, 'task_moved', 'Task \"Backend\" moved to done', '2026-06-17 14:01:21');

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`id`, `task_id`, `uploaded_by`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES
(1, 7, 2, 'Internship Project Assignment 2 â Ndikumana Jeanpierre.pdf', 'uploads\\1779602079828-574828446.pdf', 173429, '2026-05-24 07:54:39'),
(2, 7, 2, 'SRS_StockSystem.docx', 'uploads\\1779602095213-692380556.docx', 39277, '2026-05-24 07:54:55'),
(3, 11, 1, 'SRS_StockSystem.docx', 'uploads\\1779790948971-829937726.docx', 39277, '2026-05-26 12:22:29'),
(4, 27, 1, 'SRS_StockSystem.docx', 'uploads\\1779956796439-332271417.docx', 39277, '2026-05-28 10:26:36'),
(5, 25, 1, 'Internship Project Assignment 2 â Ndikumana Jeanpierre.pdf', 'uploads\\1779959675807-128488862.pdf', 173429, '2026-05-28 11:14:35'),
(6, 38, 1, 'Internship Project Assignment 2 â Ndikumana Jeanpierre.pdf', 'uploads\\1780479500832-808219863.pdf', 173429, '2026-06-03 11:38:20');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `task_id`, `user_id`, `content`, `created_at`) VALUES
(1, 2, 1, 'good lucky', '2026-05-20 10:40:16'),
(2, 3, 2, 'Please complete before Friday”', '2026-05-21 11:49:04'),
(3, 8, 1, 'nice job', '2026-05-24 08:53:48'),
(4, 11, 1, 'hy', '2026-05-26 12:22:22'),
(5, 30, 1, 'Please make sure the filter works by category and price range', '2026-05-28 10:25:45'),
(6, 25, 1, 'please work on it', '2026-05-28 11:14:30'),
(7, 29, 5, 'Received well', '2026-05-29 10:56:34'),
(8, 32, 4, 'well', '2026-05-29 11:06:34'),
(9, 32, 1, 'okay', '2026-05-29 11:07:12'),
(10, 32, 2, 'dy', '2026-05-29 11:08:05'),
(11, 34, 2, 'good idea', '2026-06-02 15:28:00'),
(12, 34, 3, 'okay no matter', '2026-06-02 15:32:28'),
(13, 35, 4, 'affff', '2026-06-02 15:36:01'),
(14, 35, 5, 'thanks', '2026-06-02 15:36:41'),
(15, 37, 3, 'Thanks', '2026-06-03 09:40:20');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(60) NOT NULL,
  `message` text NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `reference_id`, `is_read`, `created_at`) VALUES
(1, 5, 'task_assigned', 'You have been assigned a new task: \"Security architecture design\"', 15, 0, '2026-05-28 10:08:15'),
(2, 4, 'task_assigned', 'You have been assigned a new task: \"User login with biometrics\"', 16, 0, '2026-05-28 10:10:02'),
(5, 4, 'task_assigned', 'You have been assigned a new task: \"Student registration module\"', 20, 0, '2026-05-28 10:17:00'),
(7, 1, 'task_assigned', 'You have been assigned a new task: \"Attendance tracker\"', 22, 1, '2026-05-28 10:18:44'),
(8, 4, 'task_assigned', 'You have been assigned a new task: \"Parent portal\"', 23, 0, '2026-05-28 10:19:11'),
(11, 2, 'task_assigned', 'You have been assigned a new task: \"Patient registration\"', 26, 0, '2026-05-28 10:22:48'),
(12, 3, 'task_assigned', 'You have been assigned a new task: \"Appointment booking\"', 27, 0, '2026-05-28 10:23:23'),
(13, 5, 'task_assigned', 'You have been assigned a new task: \"Doctor availability calendar\"', 28, 0, '2026-05-28 10:23:51'),
(14, 5, 'task_assigned', 'You have been assigned a new task: \"Medical records access\"', 29, 0, '2026-05-28 10:24:26'),
(15, 5, 'task_assigned', 'You have been assigned a new task: \"Prescription management\"', 30, 0, '2026-05-28 10:25:07'),
(18, 4, 'task_updated', 'Task \"Parent portal\" status changed to done', 23, 0, '2026-05-28 10:33:09'),
(19, 4, 'task_updated', 'Task \"Student registration module\" status changed to todo', 20, 0, '2026-05-28 10:33:30'),
(20, 4, 'task_updated', 'Task \"Parent portal\" status changed to todo', 23, 0, '2026-05-28 10:33:32'),
(21, 5, 'task_updated', 'Task \"Prescription management\" status changed to done', 30, 0, '2026-05-28 10:34:24'),
(22, 5, 'task_updated', 'Task \"Prescription management\" status changed to todo', 30, 0, '2026-05-28 10:34:25'),
(23, 4, 'task_updated', 'Task \"Parent portal\" status changed to done', 23, 0, '2026-05-28 11:08:22'),
(24, 1, 'task_assigned', 'You have been assigned a new task: \"wewf\"', 31, 1, '2026-05-28 11:08:56'),
(25, 3, 'task_updated', 'Task \"Appointment booking\" status changed to review', 27, 0, '2026-05-28 14:30:41'),
(26, 2, 'task_assigned', 'You have been assigned a new task: \"ddeeee\"', 32, 0, '2026-05-29 11:06:22'),
(27, 1, 'system', 'New task created: \"ddeeee\" in project by Mugisha Prince Ben', 32, 1, '2026-05-29 11:06:22'),
(28, 2, 'system', 'New task created: \"ddeeee\" in project by Mugisha Prince Ben', 32, 0, '2026-05-29 11:06:22'),
(29, 5, 'system', 'New task created: \"ddeeee\" in project by Mugisha Prince Ben', 32, 0, '2026-05-29 11:06:22'),
(30, 2, 'comment', 'Mugisha Prince Ben commented on task \"ddeeee\": \"well\"', 32, 0, '2026-05-29 11:06:34'),
(31, 1, 'system', 'Mugisha Prince Ben commented on task \"ddeeee\": \"well\"', 32, 1, '2026-05-29 11:06:34'),
(32, 2, 'system', 'Mugisha Prince Ben commented on task \"ddeeee\": \"well\"', 32, 0, '2026-05-29 11:06:34'),
(33, 5, 'system', 'Mugisha Prince Ben commented on task \"ddeeee\": \"well\"', 32, 0, '2026-05-29 11:06:34'),
(34, 2, 'comment', 'Jean Pierre commented on task \"ddeeee\": \"okay\"', 32, 0, '2026-05-29 11:07:12'),
(35, 2, 'system', 'Jean Pierre commented on task \"ddeeee\": \"okay\"', 32, 0, '2026-05-29 11:07:12'),
(36, 5, 'system', 'Jean Pierre commented on task \"ddeeee\": \"okay\"', 32, 0, '2026-05-29 11:07:12'),
(37, 1, 'system', 'ISHIMWE Jeanpierre commented on task \"ddeeee\": \"dy\"', 32, 1, '2026-05-29 11:08:05'),
(38, 5, 'system', 'ISHIMWE Jeanpierre commented on task \"ddeeee\": \"dy\"', 32, 0, '2026-05-29 11:08:05'),
(39, 5, 'team', 'You have been added to team \"Inventory System\" by Jean Pierre', 3, 0, '2026-05-29 11:09:25'),
(40, 2, 'team', 'Alice Uwase was added to team \"Inventory System\" by Jean Pierre', 3, 0, '2026-05-29 11:09:25'),
(41, 5, 'team', 'Alice Uwase was added to team \"Inventory System\" by Jean Pierre', 3, 0, '2026-05-29 11:09:25'),
(42, 3, 'team', 'You have been added to team \"Inventory System\" by Jean Pierre', 3, 0, '2026-05-29 11:09:30'),
(43, 2, 'team', 'UWIZEYE Enock was added to team \"Inventory System\" by Jean Pierre', 3, 0, '2026-05-29 11:09:30'),
(44, 5, 'team', 'UWIZEYE Enock was added to team \"Inventory System\" by Jean Pierre', 3, 0, '2026-05-29 11:09:30'),
(45, 2, 'task_updated', 'Task \"ddeeee\" status changed to in_progress', 32, 0, '2026-06-01 09:55:55'),
(46, 2, 'system', 'Task \"ddeeee\" status changed to in_progress by Jean Pierre', 32, 0, '2026-06-01 09:55:55'),
(47, 5, 'system', 'Task \"ddeeee\" status changed to in_progress by Jean Pierre', 32, 0, '2026-06-01 09:55:55'),
(48, 2, 'task_updated', 'Task \"ddeeee\" status changed to done', 32, 0, '2026-06-01 09:57:36'),
(49, 2, 'system', 'Task \"ddeeee\" status changed to done by Jean Pierre', 32, 0, '2026-06-01 09:57:36'),
(50, 5, 'system', 'Task \"ddeeee\" status changed to done by Jean Pierre', 32, 0, '2026-06-01 09:57:36'),
(51, 2, 'system', 'Project \"Transport Management\" has been archived by Jean Pierre', 12, 0, '2026-06-01 09:58:03'),
(52, 5, 'system', 'Project \"Transport Management\" has been archived by Jean Pierre', 12, 0, '2026-06-01 09:58:03'),
(53, 3, 'system', 'Project \"Transport Management\" has been archived by Jean Pierre', 12, 1, '2026-06-01 09:58:03'),
(54, 2, 'task_updated', 'Task \"ddeeee\" status changed to in_progress', 32, 0, '2026-06-01 09:58:51'),
(55, 2, 'system', 'Task \"ddeeee\" status changed to in_progress by Jean Pierre', 32, 0, '2026-06-01 09:58:51'),
(56, 5, 'system', 'Task \"ddeeee\" status changed to in_progress by Jean Pierre', 32, 0, '2026-06-01 09:58:51'),
(57, 3, 'system', 'Project \"My First Project\" has been archived by Jean Pierre', 3, 0, '2026-06-01 09:59:46'),
(58, 2, 'system', 'Task \"Develop backend using node\" status changed to review by Jean Pierre', 2, 0, '2026-06-01 09:59:51'),
(59, 5, 'system', 'Task \"Develop backend using node\" status changed to review by Jean Pierre', 2, 0, '2026-06-01 09:59:51'),
(60, 2, 'system', 'Task \"Create Login API\" status changed to in_progress by Jean Pierre', 3, 0, '2026-06-01 09:59:54'),
(61, 5, 'system', 'Task \"Create Login API\" status changed to in_progress by Jean Pierre', 3, 0, '2026-06-01 09:59:54'),
(62, 2, 'system', 'Project \"Mining system\" has been archived by Jean Pierre', 7, 0, '2026-06-01 10:00:38'),
(63, 5, 'system', 'Project \"Mining system\" has been archived by Jean Pierre', 7, 0, '2026-06-01 10:00:38'),
(64, 3, 'system', 'Project \"Mining system\" has been archived by Jean Pierre', 7, 0, '2026-06-01 10:00:38'),
(65, 2, 'system', 'Task \"Database implementation\" status changed to done by Jean Pierre', 9, 0, '2026-06-01 10:07:32'),
(66, 5, 'system', 'Task \"Database implementation\" status changed to done by Jean Pierre', 9, 0, '2026-06-01 10:07:32'),
(67, 5, 'task_updated', 'Task \"Medical records access\" status changed to in_progress', 29, 0, '2026-06-01 11:17:45'),
(68, 1, 'system', 'Task \"Medical records access\" status changed to in_progress by Mugisha Prince Ben', 29, 1, '2026-06-01 11:17:45'),
(69, 2, 'system', 'Task \"Medical records access\" status changed to in_progress by Mugisha Prince Ben', 29, 0, '2026-06-01 11:17:45'),
(70, 5, 'system', 'Task \"Medical records access\" status changed to in_progress by Mugisha Prince Ben', 29, 0, '2026-06-01 11:17:45'),
(71, 5, 'task_updated', 'Task \"Doctor availability calendar\" status changed to in_progress', 28, 0, '2026-06-01 11:18:49'),
(72, 1, 'system', 'Task \"Doctor availability calendar\" status changed to in_progress by Mugisha Prince Ben', 28, 1, '2026-06-01 11:18:49'),
(73, 2, 'system', 'Task \"Doctor availability calendar\" status changed to in_progress by Mugisha Prince Ben', 28, 0, '2026-06-01 11:18:49'),
(74, 5, 'system', 'Task \"Doctor availability calendar\" status changed to in_progress by Mugisha Prince Ben', 28, 0, '2026-06-01 11:18:49'),
(75, 2, 'system', 'Project \"Hospital Patient Portal\" status changed to on hold by Jean Pierre', 11, 0, '2026-06-01 11:28:56'),
(76, 5, 'system', 'Project \"Hospital Patient Portal\" status changed to on hold by Jean Pierre', 11, 0, '2026-06-01 11:28:56'),
(77, 3, 'system', 'Project \"Hospital Patient Portal\" status changed to on hold by Jean Pierre', 11, 0, '2026-06-01 11:28:56'),
(78, 4, 'system', 'Project \"Hospital Patient Portal\" status changed to on hold by Jean Pierre', 11, 1, '2026-06-01 11:28:56'),
(79, 2, 'system', 'Project \"Hospital Patient Portal\" status changed to on hold by Jean Pierre', 11, 0, '2026-06-01 11:28:56'),
(80, 5, 'system', 'Project \"Hospital Patient Portal\" status changed to on hold by Jean Pierre', 11, 0, '2026-06-01 11:28:56'),
(81, 5, 'task_updated', 'Task \"Medical records access\" status changed to review', 29, 0, '2026-06-02 11:00:58'),
(82, 1, 'system', 'Task \"Medical records access\" status changed to review by kayishema Robert', 29, 1, '2026-06-02 11:00:58'),
(83, 2, 'system', 'Task \"Medical records access\" status changed to review by kayishema Robert', 29, 0, '2026-06-02 11:00:58'),
(84, 5, 'system', 'Task \"Medical records access\" status changed to review by kayishema Robert', 29, 0, '2026-06-02 11:00:58'),
(85, 3, 'task_updated', 'Task \"Appointment booking\" status changed to done', 27, 0, '2026-06-02 11:01:06'),
(86, 1, 'system', 'Task \"Appointment booking\" status changed to done by kayishema Robert', 27, 1, '2026-06-02 11:01:06'),
(87, 2, 'system', 'Task \"Appointment booking\" status changed to done by kayishema Robert', 27, 0, '2026-06-02 11:01:06'),
(88, 5, 'system', 'Task \"Appointment booking\" status changed to done by kayishema Robert', 27, 0, '2026-06-02 11:01:06'),
(89, 3, 'task_assigned', 'You have been assigned a new task: \"technology\"', 33, 0, '2026-06-02 15:08:57'),
(90, 1, 'system', 'New task created: \"technology\" in project by ISHIMWE Jeanpierre', 33, 1, '2026-06-02 15:08:57'),
(91, 5, 'system', 'New task created: \"technology\" in project by ISHIMWE Jeanpierre', 33, 0, '2026-06-02 15:08:57'),
(92, 2, 'system', 'New project \"Booking House Rent \" has been created by Jean Pierre', 13, 0, '2026-06-02 15:25:45'),
(93, 5, 'system', 'New project \"Booking House Rent \" has been created by Jean Pierre', 13, 0, '2026-06-02 15:25:45'),
(94, 3, 'system', 'New project \"Booking House Rent \" has been created by Jean Pierre', 13, 1, '2026-06-02 15:25:45'),
(95, 3, 'task_assigned', 'You have been assigned a new task: \"Home\"', 34, 1, '2026-06-02 15:26:34'),
(96, 2, 'system', 'New task created: \"Home\" in project by Jean Pierre', 34, 0, '2026-06-02 15:26:34'),
(97, 5, 'system', 'New task created: \"Home\" in project by Jean Pierre', 34, 0, '2026-06-02 15:26:34'),
(98, 3, 'task_updated', 'Task \"Home\" status changed to in_progress', 34, 0, '2026-06-02 15:26:54'),
(99, 2, 'system', 'Task \"Home\" status changed to in_progress by Jean Pierre', 34, 0, '2026-06-02 15:26:54'),
(100, 5, 'system', 'Task \"Home\" status changed to in_progress by Jean Pierre', 34, 0, '2026-06-02 15:26:54'),
(101, 3, 'task_updated', 'Task \"Home\" status changed to review', 34, 1, '2026-06-02 15:27:10'),
(102, 2, 'system', 'Task \"Home\" status changed to review by Jean Pierre', 34, 0, '2026-06-02 15:27:10'),
(103, 5, 'system', 'Task \"Home\" status changed to review by Jean Pierre', 34, 0, '2026-06-02 15:27:10'),
(104, 3, 'comment', 'ISHIMWE Jeanpierre commented on task \"Home\": \"good idea\"', 34, 0, '2026-06-02 15:28:00'),
(105, 1, 'system', 'ISHIMWE Jeanpierre commented on task \"Home\": \"good idea\"', 34, 1, '2026-06-02 15:28:00'),
(106, 5, 'system', 'ISHIMWE Jeanpierre commented on task \"Home\": \"good idea\"', 34, 0, '2026-06-02 15:28:00'),
(107, 5, 'task_assigned', 'You have been assigned a new task: \"Backend\"', 35, 0, '2026-06-02 15:28:35'),
(108, 1, 'system', 'New task created: \"Backend\" in project by ISHIMWE Jeanpierre', 35, 1, '2026-06-02 15:28:35'),
(109, 5, 'system', 'New task created: \"Backend\" in project by ISHIMWE Jeanpierre', 35, 0, '2026-06-02 15:28:35'),
(110, 1, 'system', 'UWIZEYE Enock commented on task \"Home\": \"okay no matter\"', 34, 1, '2026-06-02 15:32:28'),
(111, 2, 'system', 'UWIZEYE Enock commented on task \"Home\": \"okay no matter\"', 34, 0, '2026-06-02 15:32:28'),
(112, 5, 'system', 'UWIZEYE Enock commented on task \"Home\": \"okay no matter\"', 34, 0, '2026-06-02 15:32:28'),
(113, 5, 'comment', 'Mugisha Prince Ben commented on task \"Backend\": \"affff\"', 35, 0, '2026-06-02 15:36:01'),
(114, 1, 'system', 'Mugisha Prince Ben commented on task \"Backend\": \"affff\"', 35, 1, '2026-06-02 15:36:01'),
(115, 2, 'system', 'Mugisha Prince Ben commented on task \"Backend\": \"affff\"', 35, 0, '2026-06-02 15:36:01'),
(116, 5, 'system', 'Mugisha Prince Ben commented on task \"Backend\": \"affff\"', 35, 0, '2026-06-02 15:36:01'),
(117, 1, 'system', 'Alice Uwase commented on task \"Backend\": \"thanks\"', 35, 1, '2026-06-02 15:36:41'),
(118, 2, 'system', 'Alice Uwase commented on task \"Backend\": \"thanks\"', 35, 0, '2026-06-02 15:36:41'),
(119, 3, 'task_updated', 'Task \"Home\" status changed to done', 34, 0, '2026-06-02 16:25:59'),
(120, 2, 'system', 'Task \"Home\" status changed to done by Jean Pierre', 34, 0, '2026-06-02 16:25:59'),
(121, 5, 'system', 'Task \"Home\" status changed to done by Jean Pierre', 34, 0, '2026-06-02 16:25:59'),
(122, 1, 'system', 'New project \"Inkomane web Portal\" has been created by ISHIMWE Jeanpierre', 14, 1, '2026-06-03 09:37:20'),
(123, 3, 'system', 'New project \"Inkomane web Portal\" has been created by ISHIMWE Jeanpierre', 14, 1, '2026-06-03 09:37:20'),
(124, 1, 'task_assigned', 'You have been assigned a new task: \"Advertisiment page\"', 36, 1, '2026-06-03 09:39:00'),
(125, 1, 'system', 'New task created: \"Advertisiment page\" by ISHIMWE Jeanpierre', 36, 1, '2026-06-03 09:39:00'),
(126, 2, 'system', 'New task created: \"Advertisiment page\" by ISHIMWE Jeanpierre', 36, 0, '2026-06-03 09:39:00'),
(127, 5, 'system', 'New task created: \"Advertisiment page\" by ISHIMWE Jeanpierre', 36, 0, '2026-06-03 09:39:00'),
(128, 3, 'task_assigned', 'You have been assigned a new task: \"3e2wsd\"', 37, 1, '2026-06-03 09:39:51'),
(129, 1, 'system', 'New task created: \"3e2wsd\" by Jean Pierre', 37, 1, '2026-06-03 09:39:51'),
(130, 2, 'system', 'New task created: \"3e2wsd\" by Jean Pierre', 37, 0, '2026-06-03 09:39:51'),
(131, 5, 'system', 'New task created: \"3e2wsd\" by Jean Pierre', 37, 0, '2026-06-03 09:39:51'),
(132, 1, 'comment', 'UWIZEYE Enock commented on task \"3e2wsd\": \"Thanks\"', 37, 1, '2026-06-03 09:40:20'),
(133, 2, 'comment', 'UWIZEYE Enock commented on task \"3e2wsd\": \"Thanks\"', 37, 0, '2026-06-03 09:40:20'),
(134, 5, 'comment', 'UWIZEYE Enock commented on task \"3e2wsd\": \"Thanks\"', 37, 0, '2026-06-03 09:40:20'),
(135, 1, 'task_updated', 'Task \"Advertisiment page\" status changed to review by ISHIMWE Jeanpierre', 36, 1, '2026-06-03 10:42:08'),
(136, 1, 'task_updated', 'Task \"Advertisiment page\" status changed to review by ISHIMWE Jeanpierre', 36, 1, '2026-06-03 10:42:08'),
(137, 2, 'task_updated', 'Task \"Advertisiment page\" status changed to review by ISHIMWE Jeanpierre', 36, 0, '2026-06-03 10:42:08'),
(138, 5, 'task_updated', 'Task \"Advertisiment page\" status changed to review by ISHIMWE Jeanpierre', 36, 0, '2026-06-03 10:42:08'),
(139, 1, 'task_updated', 'Task \"Advertisiment page\" status changed to done by ISHIMWE Jeanpierre', 36, 1, '2026-06-03 10:43:04'),
(140, 1, 'task_updated', 'Task \"Advertisiment page\" status changed to done by ISHIMWE Jeanpierre', 36, 0, '2026-06-03 10:43:04'),
(141, 2, 'task_updated', 'Task \"Advertisiment page\" status changed to done by ISHIMWE Jeanpierre', 36, 1, '2026-06-03 10:43:04'),
(142, 5, 'task_updated', 'Task \"Advertisiment page\" status changed to done by ISHIMWE Jeanpierre', 36, 0, '2026-06-03 10:43:04'),
(143, 4, 'system', 'New project \"Trading\" has been created by Jean Pierre', 15, 0, '2026-06-03 11:37:17'),
(144, 4, 'task_assigned', 'You have been assigned a new task: \"yty\"', 38, 1, '2026-06-03 11:38:01'),
(145, 1, 'system', 'New task created: \"yty\" by Jean Pierre', 38, 0, '2026-06-03 11:38:01'),
(146, 2, 'system', 'New task created: \"yty\" by Jean Pierre', 38, 0, '2026-06-03 11:38:01'),
(147, 5, 'system', 'New task created: \"yty\" by Jean Pierre', 38, 0, '2026-06-03 11:38:01'),
(148, 4, 'task_updated', 'Task \"yty\" status changed to in_progress by Jean Pierre', 38, 0, '2026-06-03 11:38:29'),
(149, 1, 'task_updated', 'Task \"yty\" status changed to in_progress by Jean Pierre', 38, 0, '2026-06-03 11:38:29'),
(150, 2, 'task_updated', 'Task \"yty\" status changed to in_progress by Jean Pierre', 38, 0, '2026-06-03 11:38:29'),
(151, 5, 'task_updated', 'Task \"yty\" status changed to in_progress by Jean Pierre', 38, 0, '2026-06-03 11:38:29'),
(152, 4, 'task_updated', 'Task \"yty\" status changed to review by Jean Pierre', 38, 0, '2026-06-03 11:38:35'),
(153, 1, 'task_updated', 'Task \"yty\" status changed to review by Jean Pierre', 38, 0, '2026-06-03 11:38:35'),
(154, 2, 'task_updated', 'Task \"yty\" status changed to review by Jean Pierre', 38, 0, '2026-06-03 11:38:35'),
(155, 5, 'task_updated', 'Task \"yty\" status changed to review by Jean Pierre', 38, 0, '2026-06-03 11:38:35'),
(156, 4, 'task_updated', 'Task \"yty\" status changed to done by Jean Pierre', 38, 0, '2026-06-03 11:38:37'),
(157, 1, 'task_updated', 'Task \"yty\" status changed to done by Jean Pierre', 38, 1, '2026-06-03 11:38:37'),
(158, 2, 'task_updated', 'Task \"yty\" status changed to done by Jean Pierre', 38, 0, '2026-06-03 11:38:37'),
(159, 5, 'task_updated', 'Task \"yty\" status changed to done by Jean Pierre', 38, 0, '2026-06-03 11:38:37'),
(160, 5, 'task_updated', 'Task \"Backend\" status changed to in_progress by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:16'),
(161, 1, 'task_updated', 'Task \"Backend\" status changed to in_progress by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:16'),
(162, 5, 'task_updated', 'Task \"Backend\" status changed to in_progress by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:16'),
(163, 5, 'task_updated', 'Task \"Backend\" status changed to review by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:18'),
(164, 1, 'task_updated', 'Task \"Backend\" status changed to review by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:18'),
(165, 5, 'task_updated', 'Task \"Backend\" status changed to review by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:18'),
(166, 5, 'task_updated', 'Task \"Backend\" status changed to done by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:21'),
(167, 1, 'task_updated', 'Task \"Backend\" status changed to done by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:21'),
(168, 5, 'task_updated', 'Task \"Backend\" status changed to done by ISHIMWE Jeanpierre', 35, 0, '2026-06-17 14:01:21');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `team_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('active','completed','on_hold') DEFAULT 'active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `team_id`, `created_by`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(3, 'My First Project', 'Building the task management app', 1, 1, 'completed', NULL, NULL, '2026-05-19 12:20:44', '2026-06-01 09:59:46'),
(4, 'Internal stock Management', 'about stock management organisation', 1, 1, 'completed', '2026-05-21', '2026-06-06', '2026-05-20 10:52:48', '2026-05-23 23:10:14'),
(5, 'E-commerce Platform', 'Online shopping system', 1, 2, 'active', '2026-05-21', '2026-05-22', '2026-05-21 11:42:23', '2026-05-21 11:42:23'),
(6, 'Website Design', 'School smart attendance', 2, 1, 'active', '2026-05-23', '2026-06-05', '2026-05-23 23:07:39', '2026-05-23 23:07:39'),
(7, 'Mining system', 'system that will use to manage mining activities', 3, 1, 'completed', '2026-05-26', '2026-05-29', '2026-05-25 12:33:18', '2026-06-01 10:00:38'),
(8, 'KorodeTech', 'about online trading', 1, 1, 'active', '2026-05-26', '2026-06-05', '2026-05-26 12:21:10', '2026-05-26 12:21:10'),
(9, 'Mobile Banking App', 'Develop a secure mobile banking application for Android and iOS', 4, 1, 'active', '2026-05-29', '2026-05-30', '2026-05-28 09:56:50', '2026-05-28 09:56:50'),
(10, 'School Management System', 'System to manage students, teachers, grades and attendance', 5, 1, 'active', '2026-05-28', '2026-05-28', '2026-05-28 09:57:43', '2026-06-01 11:46:19'),
(11, 'Hospital Patient Portal', 'Online portal for patients to book appointments and view records', 2, 1, 'on_hold', '2026-05-29', '2026-05-30', '2026-05-28 09:58:26', '2026-06-01 11:28:56'),
(12, 'Transport Management', 'Driving people', 3, 1, 'completed', '2026-05-29', '2026-06-04', '2026-05-28 13:58:32', '2026-06-01 09:58:03'),
(13, 'Booking House Rent ', 'every where you go book house you want', 3, 1, 'active', '2026-06-26', '2026-06-25', '2026-06-02 15:25:45', '2026-06-02 15:25:45'),
(14, 'Inkomane web Portal', 'vbhj', 1, 2, 'active', '2026-07-03', '2026-06-25', '2026-06-03 09:37:20', '2026-06-03 09:37:20'),
(15, 'Trading', 'fghj', 5, 1, 'active', '2026-06-26', '2026-06-27', '2026-06-03 11:37:17', '2026-06-03 11:37:17');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('todo','in_progress','review','done') DEFAULT 'todo',
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `position` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `labels` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `project_id`, `assigned_to`, `created_by`, `status`, `priority`, `due_date`, `position`, `created_at`, `updated_at`, `labels`) VALUES
(1, 'Set up the backend', 'Initialize Node.js and Express', 3, NULL, 1, 'done', 'high', NULL, 0, '2026-05-19 12:22:13', '2026-05-19 12:22:13', NULL),
(2, 'Develop backend using node', 'task management-hub', 3, NULL, 1, 'review', 'high', '2026-04-01', 0, '2026-05-20 10:38:58', '2026-06-01 10:20:35', NULL),
(3, 'Create Login API', 'Backend authentication', 3, NULL, 2, 'in_progress', 'medium', '2026-04-01', 0, '2026-05-21 11:47:43', '2026-06-01 10:20:35', NULL),
(4, 'Design UI', 'Setup Backend', 4, NULL, 2, 'todo', 'medium', '2026-04-01', 0, '2026-05-21 11:51:17', '2026-06-01 10:20:35', NULL),
(5, 'UI DESIGN', 'Professional looks', 5, NULL, 2, 'todo', 'medium', '2026-06-06', 0, '2026-05-21 11:52:43', '2026-05-21 11:52:43', NULL),
(6, 'User interface', 'ef', 6, NULL, 1, 'todo', 'critical', '2026-05-29', 0, '2026-05-23 23:08:32', '2026-05-25 10:57:04', NULL),
(7, 'Report', 'ghj', 5, NULL, 2, 'todo', 'medium', '2026-05-23', 0, '2026-05-24 07:54:09', '2026-05-24 07:54:09', NULL),
(8, 'Greeting', 'rtwyui', 6, NULL, 1, 'in_progress', 'medium', '2026-05-29', 0, '2026-05-24 08:53:20', '2026-05-24 08:53:20', 'fronted quick'),
(9, 'Database implementation', 'using MYSQL', 7, NULL, 1, 'done', 'high', '2026-05-25', 0, '2026-05-25 12:34:23', '2026-06-01 10:07:32', 'Minig DB'),
(10, '3eghj', 'gehj', 5, NULL, 4, 'done', 'medium', '2026-05-28', 0, '2026-05-25 15:46:00', '2026-05-28 13:59:42', 'er'),
(11, 'electronics marjketing', 'vbdn', 8, NULL, 1, 'todo', 'high', '2026-06-05', 0, '2026-05-26 12:22:01', '2026-05-26 12:22:01', NULL),
(12, 'ghvgh', 'cvbh', 8, NULL, 1, 'in_progress', 'medium', '2026-05-30', 0, '2026-05-26 12:23:03', '2026-05-26 12:23:03', NULL),
(13, 'we', 'dsa', 8, NULL, 1, 'done', 'medium', '2026-06-06', 0, '2026-05-26 12:23:19', '2026-05-28 10:27:58', NULL),
(14, 'were', 'dvb', 8, NULL, 1, 'done', 'medium', '2026-05-30', 0, '2026-05-26 12:23:37', '2026-05-26 12:23:37', NULL),
(15, 'Security architecture design', 'Plan encryption and security protocols', 9, 5, 1, 'done', 'high', '2026-05-30', 0, '2026-05-28 10:08:15', '2026-05-28 10:08:15', 'GH'),
(16, 'User login with biometrics', 'Implement fingerprint and face ID login', 9, 4, 1, 'in_progress', 'high', '2026-05-30', 0, '2026-05-28 10:10:02', '2026-05-28 10:10:02', 'FGH'),
(17, 'Account balance dashboard', 'Show account balance and recent transactions', 9, NULL, 1, 'in_progress', 'medium', '2026-06-06', 0, '2026-05-28 10:10:50', '2026-05-28 10:10:50', NULL),
(18, 'Transaction history', 'List all transactions with date and amount', 9, NULL, 1, 'review', 'medium', '2026-06-04', 0, '2026-05-28 10:11:39', '2026-05-28 10:11:39', NULL),
(19, 'Push notifications', 'Notify users on every transaction', 9, NULL, 1, 'todo', 'low', '2026-06-04', 0, '2026-05-28 10:12:22', '2026-05-28 10:12:22', NULL),
(20, 'Student registration module', 'Form to register new students with all details', 10, 4, 1, 'todo', 'high', '2026-05-30', 0, '2026-05-28 10:17:00', '2026-05-28 10:33:30', NULL),
(21, 'Grade tracking system', 'Record and display student grades per subject', 10, NULL, 1, 'in_progress', 'high', '2026-05-30', 0, '2026-05-28 10:17:52', '2026-05-28 10:17:52', NULL),
(22, 'Attendance tracker', 'Mark daily attendance for each class', 10, 1, 1, 'in_progress', 'medium', '2026-06-06', 0, '2026-05-28 10:18:44', '2026-05-28 10:18:44', NULL),
(23, 'Parent portal', 'Allow parents to view their child\'s progress', 10, 4, 1, 'done', 'medium', '2026-05-30', 0, '2026-05-28 10:19:11', '2026-05-28 11:08:22', NULL),
(24, 'Report card generation', 'Auto-generate PDF report cards each term', 10, NULL, 1, 'todo', 'critical', '2026-06-06', 0, '2026-05-28 10:20:15', '2026-05-28 10:20:15', NULL),
(25, 'SMS notifications', 'Send attendance alerts to parents via SMS', 10, NULL, 1, 'todo', 'low', '2026-05-28', 0, '2026-05-28 10:20:51', '2026-05-28 10:27:25', NULL),
(26, 'Patient registration', 'Online form to register new patients', 11, 2, 1, 'done', 'high', '2026-06-06', 0, '2026-05-28 10:22:48', '2026-05-28 10:22:48', NULL),
(27, 'Appointment booking', 'Book, reschedule and cancel appointments', 11, 3, 1, 'done', 'high', '2026-06-06', 0, '2026-05-28 10:23:23', '2026-06-02 11:01:06', NULL),
(28, 'Doctor availability calendar', 'Show available slots for each doctor', 11, 5, 1, 'in_progress', 'medium', '2026-06-05', 0, '2026-05-28 10:23:51', '2026-06-01 11:18:49', NULL),
(29, 'Medical records access', 'Patients view their own medical history', 11, 5, 1, 'review', 'critical', '2026-06-03', 0, '2026-05-28 10:24:26', '2026-06-02 11:00:58', NULL),
(30, 'Prescription management', 'Doctors issue and patients view prescriptions', 11, 5, 1, 'todo', 'high', '2026-05-30', 0, '2026-05-28 10:25:07', '2026-05-28 10:34:25', NULL),
(31, 'wewf', 'fddf', 10, 1, 1, 'review', 'medium', '2026-05-30', 0, '2026-05-28 11:08:56', '2026-05-28 11:08:56', NULL),
(32, 'ddeeee', 'dghjk', 12, 2, 4, 'in_progress', 'medium', '2026-05-23', 0, '2026-05-29 11:06:22', '2026-06-01 09:58:51', NULL),
(33, 'technology', 'rty', 8, 3, 2, 'todo', 'medium', '2026-07-04', 0, '2026-06-02 15:08:57', '2026-06-02 15:08:57', NULL),
(34, 'Home', ' welcome to everyone', 13, 3, 1, 'done', 'medium', '2026-06-27', 0, '2026-06-02 15:26:34', '2026-06-02 16:25:59', NULL),
(35, 'Backend', 'dd', 13, 5, 2, 'done', 'medium', '2026-07-10', 0, '2026-06-02 15:28:35', '2026-06-17 14:01:21', NULL),
(36, 'Advertisiment page', 'fghj', 14, 1, 2, 'done', 'medium', '2026-06-27', 0, '2026-06-03 09:39:00', '2026-06-03 10:43:04', NULL),
(37, '3e2wsd', 'ds', 14, 3, 1, 'in_progress', 'medium', '2026-06-27', 0, '2026-06-03 09:39:51', '2026-06-03 09:39:51', NULL),
(38, 'yty', 'vbn', 15, 4, 1, 'done', 'high', '2026-07-04', 0, '2026-06-03 11:38:01', '2026-06-03 11:38:37', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `description`, `created_by`, `created_at`) VALUES
(1, 'Development Team', 'Our main dev team', 1, '2026-05-19 12:18:53'),
(2, 'UI/UX Team', 'Handles frontend designs', 2, '2026-05-21 11:43:18'),
(3, 'Inventory System', 'stock', 2, '2026-05-21 11:50:18'),
(4, 'QA Team', 'Quality assurance and testing team', 1, '2026-05-28 09:54:42'),
(5, 'Management Team', 'Project managers and team leads', 1, '2026-05-28 09:55:38'),
(6, 'Backup Team', 'Emergency work', 2, '2026-05-28 12:35:48');

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('owner','manager','member') DEFAULT 'member',
  `joined_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `team_id`, `user_id`, `role`, `joined_at`) VALUES
(1, 1, 1, 'owner', '2026-05-19 12:19:59'),
(2, 1, 3, 'member', '2026-05-21 10:47:50'),
(3, 2, 2, 'owner', '2026-05-21 11:43:18'),
(4, 3, 2, 'owner', '2026-05-21 11:50:18'),
(5, 4, 1, 'owner', '2026-05-28 09:54:42'),
(6, 5, 1, 'owner', '2026-05-28 09:55:38'),
(7, 4, 4, 'member', '2026-05-28 10:02:59'),
(8, 4, 5, 'member', '2026-05-28 10:03:05'),
(10, 5, 4, 'member', '2026-05-28 10:16:01'),
(12, 2, 5, 'member', '2026-05-28 10:21:23'),
(13, 2, 3, 'member', '2026-05-28 10:21:30'),
(14, 2, 4, 'member', '2026-05-28 10:21:38'),
(15, 6, 2, 'owner', '2026-05-28 12:35:48'),
(16, 3, 5, 'member', '2026-05-29 11:09:25'),
(17, 3, 3, 'member', '2026-05-29 11:09:30');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','manager','member') DEFAULT 'member',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `avatar`) VALUES
(1, 'Jean Pierre', 'jean@example.com', '$2b$10$/penpXJiINCDjFBW9.63ye5zhXRTK.bHcWuTULQjyhVuPsxV9gtne', 'admin', '2026-05-19 11:21:42', '2026-05-29 09:45:14', NULL, NULL, '/uploads/avatar_1_1780040714585.jpeg'),
(2, 'ISHIMWE Jeanpierre', 'ndikumanajeanpierre81@gmail.com', '$2b$10$wCFjZknn4Jr5.gTc7xTgteTMhg0Y4dpwJajGH1x4CmnvqNHVoHK9W', 'member', '2026-05-19 12:44:33', '2026-06-17 14:00:22', '82184320679bfbc3347651e3917c976426626853d2876fb4b9743aa8a13f582a', '2026-05-29 11:39:04', '/uploads/avatar_2_1780041107322.jpeg'),
(3, 'UWIZEYE Enock', 'uwizeye@gmail.com', '$2b$10$JwQxxSip1zKGzy9kAR3jBuBGqAgERJlyBX8eDS5gT9LcI3YmW7JVm', 'member', '2026-05-20 11:15:50', '2026-05-28 14:51:45', NULL, NULL, '/uploads/avatar_3_1779972705809.jpeg'),
(4, 'Mugisha Prince Ben', 'safariclement792@gmail.com', '$2b$10$d3ri9zWJR9h0xWQrKefi4eMNE3SwOuCjC3lcj6TPvRuq2748DBDDq', 'member', '2026-05-21 10:55:04', '2026-05-29 10:06:46', NULL, NULL, '/uploads/avatar_4_1780042006640.jpeg'),
(5, 'Alice Uwase', 'alice@example.com', '$2b$10$WxZKvxJ15cBsyC9MKcqsfOscXyn8RnZ3FWKYTp43kTeSjJ6W9Gqe.', 'manager', '2026-05-28 10:00:14', '2026-05-29 10:47:49', NULL, NULL, '/uploads/avatar_5_1779971293646.jpg'),
(7, 'Niyibizi  Jaquesi', 'ishimwejeanpierre97@gmail.com', '$2b$10$R0m7wU3anivOZdNjeCxGKuTTokVzQmO/Gqcj0eSnAcjyZGVY4aczO', 'member', '2026-05-28 12:39:11', '2026-05-28 12:39:42', '91e71d80597b2d871f3a6bfbdf20e172a518104f2511825051d3c697b21728a0', '2026-05-28 13:39:42', NULL),
(8, 'kayishema Robert', 'kayishema@gmail.com', '$2b$10$jMCypseG1ZQrmEOrTyph8earsjeBTUFjvpDjrbWRpXTaQblgqLpb.', 'member', '2026-06-02 11:00:27', '2026-06-02 11:00:27', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `idx_activity_project` (`project_id`);

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user` (`user_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_tasks_project` (`project_id`),
  ADD KEY `idx_tasks_assigned` (`assigned_to`),
  ADD KEY `idx_tasks_status` (`status`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activity_logs_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activity_logs_ibfk_3` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
