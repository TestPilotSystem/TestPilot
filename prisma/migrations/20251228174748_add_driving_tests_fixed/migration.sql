/*
  Warnings:

  - You are about to drop the column `esCorrecta` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `respuestaUsuario` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Test` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Test` DROP FOREIGN KEY `Test_userId_fkey`;

-- DropIndex
DROP INDEX `Test_userId_idx` ON `Test`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `esCorrecta`,
    DROP COLUMN `respuestaUsuario`;

-- AlterTable
ALTER TABLE `Test` DROP COLUMN `completed`,
    DROP COLUMN `score`,
    DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `UserTest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `testId` VARCHAR(191) NOT NULL,
    `score` INTEGER NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,

    INDEX `UserTest_userId_idx`(`userId`),
    INDEX `UserTest_testId_idx`(`testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserResponse` (
    `id` VARCHAR(191) NOT NULL,
    `userTestId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `respuestaDada` VARCHAR(191) NOT NULL,
    `esCorrecta` BOOLEAN NOT NULL,

    INDEX `UserResponse_userTestId_idx`(`userTestId`),
    INDEX `UserResponse_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserTest` ADD CONSTRAINT `UserTest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTest` ADD CONSTRAINT `UserTest_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserResponse` ADD CONSTRAINT `UserResponse_userTestId_fkey` FOREIGN KEY (`userTestId`) REFERENCES `UserTest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserResponse` ADD CONSTRAINT `UserResponse_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
