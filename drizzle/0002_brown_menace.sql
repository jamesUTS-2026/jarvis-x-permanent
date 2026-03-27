CREATE TABLE `ai_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`engine` enum('local','cloud') NOT NULL,
	`provider` varchar(100) NOT NULL,
	`costPer1kTokens` int NOT NULL DEFAULT 0,
	`avgLatencyMs` int NOT NULL DEFAULT 0,
	`maxTokens` int NOT NULL DEFAULT 4096,
	`supportsVision` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_models_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_models_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `interaction_traces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`modelId` int NOT NULL,
	`inputText` text NOT NULL,
	`outputText` text NOT NULL,
	`latencyMs` int NOT NULL,
	`costUsd` int NOT NULL DEFAULT 0,
	`energyWh` int NOT NULL DEFAULT 0,
	`qualityScore` int,
	`userFeedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interaction_traces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`modelId` int,
	`metricType` enum('latency','cost','energy','accuracy') NOT NULL,
	`value` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_model_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredModelId` int,
	`enginePreference` enum('local','cloud','auto') NOT NULL DEFAULT 'auto',
	`costOptimization` int NOT NULL DEFAULT 0,
	`latencyOptimization` int NOT NULL DEFAULT 0,
	`energyOptimization` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_model_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_model_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `interaction_traces` ADD CONSTRAINT `interaction_traces_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interaction_traces` ADD CONSTRAINT `interaction_traces_modelId_ai_models_id_fk` FOREIGN KEY (`modelId`) REFERENCES `ai_models`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_metrics` ADD CONSTRAINT `performance_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_metrics` ADD CONSTRAINT `performance_metrics_modelId_ai_models_id_fk` FOREIGN KEY (`modelId`) REFERENCES `ai_models`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_model_preferences` ADD CONSTRAINT `user_model_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_model_preferences` ADD CONSTRAINT `user_model_preferences_preferredModelId_ai_models_id_fk` FOREIGN KEY (`preferredModelId`) REFERENCES `ai_models`(`id`) ON DELETE no action ON UPDATE no action;