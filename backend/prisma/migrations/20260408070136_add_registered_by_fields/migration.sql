/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `patient` ADD COLUMN `registeredByHospitalId` INTEGER NULL,
    ADD COLUMN `registeredByUserId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Patient_phone_key` ON `Patient`(`phone`);

-- CreateIndex
CREATE UNIQUE INDEX `Patient_email_key` ON `Patient`(`email`);

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_registeredByUserId_fkey` FOREIGN KEY (`registeredByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_registeredByHospitalId_fkey` FOREIGN KEY (`registeredByHospitalId`) REFERENCES `Hospital`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
