CREATE TABLE
	`confirmations` (
		`id` serial AUTO_INCREMENT NOT NULL,
		`user_id` varchar(36) NOT NULL,
		`reservation_id` varchar(36) NOT NULL,
		`status` tinyint NOT NULL DEFAULT 0,
		CONSTRAINT `confirmations_id` PRIMARY KEY (`id`)
	);

--> statement-breakpoint
ALTER TABLE `reservations` MODIFY COLUMN `created_at` datetime NOT NULL DEFAULT '2025-08-30 17:07:37.100';

--> statement-breakpoint
ALTER TABLE `confirmations` ADD CONSTRAINT `confirmations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE `confirmations` ADD CONSTRAINT `confirmations_reservation_id_reservations_id_fk` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE cascade ON UPDATE no action;