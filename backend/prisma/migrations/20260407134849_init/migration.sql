/*
  Warnings:

  - The primary key for the `adherencerecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `adherencerecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `patientId` on the `adherencerecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `prescriptionId` on the `adherencerecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `apikey` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `apikey` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `externalsystem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `externalsystem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `hospital` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `hospital` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `patient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `patient` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `userId` on the `patient` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `hospitalId` on the `patient` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `prescription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `prescription` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `patientId` on the `prescription` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `providerId` on the `prescription` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `reminder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `reminder` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `patientId` on the `reminder` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `prescriptionId` on the `reminder` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `smslog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `smslog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `patientId` on the `smslog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `hospitalId` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the `accessrequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `accessrequest` DROP FOREIGN KEY `AccessRequest_hospitalId_fkey`;

-- DropForeignKey
ALTER TABLE `adherencerecord` DROP FOREIGN KEY `AdherenceRecord_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `adherencerecord` DROP FOREIGN KEY `AdherenceRecord_prescriptionId_fkey`;

-- DropForeignKey
ALTER TABLE `patient` DROP FOREIGN KEY `Patient_hospitalId_fkey`;

-- DropForeignKey
ALTER TABLE `patient` DROP FOREIGN KEY `Patient_userId_fkey`;

-- DropForeignKey
ALTER TABLE `prescription` DROP FOREIGN KEY `Prescription_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `prescription` DROP FOREIGN KEY `Prescription_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `reminder` DROP FOREIGN KEY `Reminder_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `reminder` DROP FOREIGN KEY `Reminder_prescriptionId_fkey`;

-- DropForeignKey
ALTER TABLE `smslog` DROP FOREIGN KEY `SmsLog_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_hospitalId_fkey`;

-- DropIndex
DROP INDEX `AdherenceRecord_patientId_fkey` ON `adherencerecord`;

-- DropIndex
DROP INDEX `AdherenceRecord_prescriptionId_fkey` ON `adherencerecord`;

-- DropIndex
DROP INDEX `Patient_hospitalId_fkey` ON `patient`;

-- DropIndex
DROP INDEX `Prescription_patientId_fkey` ON `prescription`;

-- DropIndex
DROP INDEX `Prescription_providerId_fkey` ON `prescription`;

-- DropIndex
DROP INDEX `Reminder_patientId_fkey` ON `reminder`;

-- DropIndex
DROP INDEX `Reminder_prescriptionId_fkey` ON `reminder`;

-- DropIndex
DROP INDEX `SmsLog_patientId_fkey` ON `smslog`;

-- DropIndex
DROP INDEX `User_hospitalId_fkey` ON `user`;

-- AlterTable
ALTER TABLE `adherencerecord` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `patientId` INTEGER NOT NULL,
    MODIFY `prescriptionId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `apikey` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `externalsystem` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `hospital` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `patient` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `userId` INTEGER NULL,
    MODIFY `hospitalId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `prescription` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `patientId` INTEGER NOT NULL,
    MODIFY `providerId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `reminder` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `patientId` INTEGER NOT NULL,
    MODIFY `prescriptionId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `smslog` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `patientId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    ADD COLUMN `reason` VARCHAR(191) NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `status` ENUM('pending', 'active', 'inactive') NOT NULL DEFAULT 'pending',
    MODIFY `hospitalId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `accessrequest`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `Hospital`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `Hospital`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdherenceRecord` ADD CONSTRAINT `AdherenceRecord_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdherenceRecord` ADD CONSTRAINT `AdherenceRecord_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SmsLog` ADD CONSTRAINT `SmsLog_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
