-- DropForeignKey
ALTER TABLE `adherencerecord` DROP FOREIGN KEY `AdherenceRecord_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_hospitalId_fkey`;

-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `followup` DROP FOREIGN KEY `FollowUp_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `followup` DROP FOREIGN KEY `FollowUp_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `healthgoal` DROP FOREIGN KEY `HealthGoal_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `patient` DROP FOREIGN KEY `Patient_userId_fkey`;

-- DropForeignKey
ALTER TABLE `prescription` DROP FOREIGN KEY `Prescription_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `reminder` DROP FOREIGN KEY `Reminder_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `sideeffect` DROP FOREIGN KEY `SideEffect_patientId_fkey`;

-- DropIndex
DROP INDEX `AdherenceRecord_patientId_fkey` ON `adherencerecord`;

-- DropIndex
DROP INDEX `Appointment_hospitalId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `Appointment_patientId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `FollowUp_patientId_fkey` ON `followup`;

-- DropIndex
DROP INDEX `FollowUp_providerId_fkey` ON `followup`;

-- DropIndex
DROP INDEX `HealthGoal_patientId_fkey` ON `healthgoal`;

-- DropIndex
DROP INDEX `Prescription_patientId_fkey` ON `prescription`;

-- DropIndex
DROP INDEX `Reminder_patientId_fkey` ON `reminder`;

-- DropIndex
DROP INDEX `SideEffect_patientId_fkey` ON `sideeffect`;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HealthGoal` ADD CONSTRAINT `HealthGoal_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SideEffect` ADD CONSTRAINT `SideEffect_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `Hospital`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowUp` ADD CONSTRAINT `FollowUp_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowUp` ADD CONSTRAINT `FollowUp_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdherenceRecord` ADD CONSTRAINT `AdherenceRecord_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
