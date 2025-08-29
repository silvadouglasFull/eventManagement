CREATE TABLE
	`reservations` (
		`id` varchar(36) NOT NULL,
		`room_id` varchar(36) NOT NULL,
		`start_time` datetime NOT NULL,
		`end_time` datetime NOT NULL,
		`notes` varchar(255),
		`deleted_at` datetime DEFAULT null,
		CONSTRAINT `reservations_id` PRIMARY KEY (`id`)
	);

--> statement-breakpoint
CREATE TABLE
	`rooms` (
		`id` varchar(36) NOT NULL,
		`name` varchar(255) NOT NULL,
		CONSTRAINT `rooms_id` PRIMARY KEY (`id`)
	);