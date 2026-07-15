import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database cleanup...');

  // Step 1: Find and delete AdherenceRecord entries with invalid patientId
  const invalidAdherenceRecords = await prisma.adherenceRecord.findMany({
    include: { patient: true },
  });

  const adherenceRecordsToDelete = invalidAdherenceRecords.filter(ar => !ar.patient);
  if (adherenceRecordsToDelete.length > 0) {
    console.log(`Deleting ${adherenceRecordsToDelete.length} invalid AdherenceRecord entries...`);
    await prisma.adherenceRecord.deleteMany({
      where: { id: { in: adherenceRecordsToDelete.map(ar => ar.id) } },
    });
  }

  // Step 2: Find and delete Prescription entries with invalid patientId
  const invalidPrescriptions = await prisma.prescription.findMany({
    include: { patient: true },
  });

  const prescriptionsToDelete = invalidPrescriptions.filter(p => !p.patient);
  if (prescriptionsToDelete.length > 0) {
    console.log(`Deleting ${prescriptionsToDelete.length} invalid Prescription entries...`);
    await prisma.prescription.deleteMany({
      where: { id: { in: prescriptionsToDelete.map(p => p.id) } },
    });
  }

  // Step 3: Find and delete Reminder entries with invalid patientId
  const invalidReminders = await prisma.reminder.findMany({
    include: { patient: true },
  });

  const remindersToDelete = invalidReminders.filter(r => !r.patient);
  if (remindersToDelete.length > 0) {
    console.log(`Deleting ${remindersToDelete.length} invalid Reminder entries...`);
    await prisma.reminder.deleteMany({
      where: { id: { in: remindersToDelete.map(r => r.id) } },
    });
  }

  // Step 4: Find and delete HealthGoal entries with invalid patientId
  const invalidHealthGoals = await prisma.healthGoal.findMany({
    include: { patient: true },
  });

  const healthGoalsToDelete = invalidHealthGoals.filter(hg => !hg.patient);
  if (healthGoalsToDelete.length > 0) {
    console.log(`Deleting ${healthGoalsToDelete.length} invalid HealthGoal entries...`);
    await prisma.healthGoal.deleteMany({
      where: { id: { in: healthGoalsToDelete.map(hg => hg.id) } },
    });
  }

  // Step 5: Find and delete SideEffect entries with invalid patientId
  const invalidSideEffects = await prisma.sideEffect.findMany({
    include: { patient: true },
  });

  const sideEffectsToDelete = invalidSideEffects.filter(se => !se.patient);
  if (sideEffectsToDelete.length > 0) {
    console.log(`Deleting ${sideEffectsToDelete.length} invalid SideEffect entries...`);
    await prisma.sideEffect.deleteMany({
      where: { id: { in: sideEffectsToDelete.map(se => se.id) } },
    });
  }

  // Step 6: Find and delete Appointment entries with invalid patientId or hospitalId
  const invalidAppointments = await prisma.appointment.findMany({
    include: { patient: true, hospital: true },
  });

  const appointmentsToDelete = invalidAppointments.filter(a => !a.patient || !a.hospital);
  if (appointmentsToDelete.length > 0) {
    console.log(`Deleting ${appointmentsToDelete.length} invalid Appointment entries...`);
    await prisma.appointment.deleteMany({
      where: { id: { in: appointmentsToDelete.map(a => a.id) } },
    });
  }

  // Step 7: Find and delete FollowUp entries with invalid patientId or providerId
  const invalidFollowUps = await prisma.followUp.findMany({
    include: { patient: true, provider: true },
  });

  const followUpsToDelete = invalidFollowUps.filter(fu => !fu.patient || !fu.provider);
  if (followUpsToDelete.length > 0) {
    console.log(`Deleting ${followUpsToDelete.length} invalid FollowUp entries...`);
    await prisma.followUp.deleteMany({
      where: { id: { in: followUpsToDelete.map(fu => fu.id) } },
    });
  }

  console.log('Database cleanup complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
