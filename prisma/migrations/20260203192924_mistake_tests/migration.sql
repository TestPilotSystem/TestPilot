-- DropForeignKey
ALTER TABLE `Test` DROP FOREIGN KEY `Test_topicId_fkey`;

-- AlterTable
ALTER TABLE `Test` ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('BASIC', 'ERROR', 'CUSTOM') NOT NULL DEFAULT 'BASIC',
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `topicId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `UserResponse` ADD COLUMN `isRectified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Test_userId_idx` ON `Test`(`userId`);

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
