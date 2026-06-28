CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barcode` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracked_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clerk_user_id` varchar(255),
	`product_id` int NOT NULL,
	`expiry_date` date NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`notes` text NOT NULL,
	CONSTRAINT `tracked_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`clerk_user_id` varchar(255),
	`role` varchar(20) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_clerk_user_id_unique` UNIQUE(`clerk_user_id`)
);
--> statement-breakpoint
ALTER TABLE `tracked_items` ADD CONSTRAINT `tracked_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;