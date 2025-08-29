ALTER TABLE `reservations` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD `created_at` datetime DEFAULT '2025-08-29 19:28:29.064' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD `is_cancelled` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_room_id_rooms_id_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservations` DROP COLUMN `notes`;--> statement-breakpoint
ALTER TABLE `reservations` DROP COLUMN `deleted_at`;