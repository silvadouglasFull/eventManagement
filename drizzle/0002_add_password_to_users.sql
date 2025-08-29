ALTER TABLE `users` MODIFY COLUMN `created_at` datetime NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255) NOT NULL;