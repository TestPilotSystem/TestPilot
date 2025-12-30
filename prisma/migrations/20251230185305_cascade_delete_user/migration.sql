-- DropForeignKey
ALTER TABLE `Request` DROP FOREIGN KEY `Request_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserTest` DROP FOREIGN KEY `UserTest_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTest` ADD CONSTRAINT `UserTest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
