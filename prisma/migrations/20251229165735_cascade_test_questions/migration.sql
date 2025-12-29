-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_testId_fkey`;

-- DropForeignKey
ALTER TABLE `UserResponse` DROP FOREIGN KEY `UserResponse_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `UserResponse` DROP FOREIGN KEY `UserResponse_userTestId_fkey`;

-- DropForeignKey
ALTER TABLE `UserTest` DROP FOREIGN KEY `UserTest_testId_fkey`;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTest` ADD CONSTRAINT `UserTest_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserResponse` ADD CONSTRAINT `UserResponse_userTestId_fkey` FOREIGN KEY (`userTestId`) REFERENCES `UserTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserResponse` ADD CONSTRAINT `UserResponse_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
