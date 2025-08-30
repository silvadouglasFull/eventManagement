CREATE TABLE
	`guests` (
		`user_id` varchar(36) NOT NULL,
		`reservation_id` varchar(36) NOT NULL,
		CONSTRAINT `guests_user_id_reservation_id_pk` PRIMARY KEY (`user_id`, `reservation_id`)
	);

--> statement-breakpoint
ALTER TABLE `reservations` MODIFY COLUMN `created_at` datetime NOT NULL DEFAULT '2025-08-30 16:38:13.045';

--> statement-breakpoint
ALTER TABLE `guests` ADD CONSTRAINT `guests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE `guests` ADD CONSTRAINT `guests_reservation_id_reservations_id_fk` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE cascade ON UPDATE no action;