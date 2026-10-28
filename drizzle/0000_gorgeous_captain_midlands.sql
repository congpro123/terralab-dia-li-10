CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`version` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`author_id` text NOT NULL,
	`reviewer_id` text,
	`status` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`salt` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);