CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT '2025-08-29 17:05:26.185',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `reservations` MODIFY COLUMN `deleted_at` datetime DEFAULT null;