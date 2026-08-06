/**
 * BACKUP SCRIPT: Match Charter Data Export
 *
 * This script exports all Match Charter High School data to JSON
 * Run this regularly to create local backups
 * Usage: npx ts-node scripts/backup-match-charter.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backupMatchCharter() {
  try {
    console.log('💾 Backing up Match Charter High School data...\n');

    // Find Match Charter organization
    const org = await prisma.organization.findUnique({
      where: { slug: 'match-charter-high-school' },
    });

    if (!org) {
      console.error('❌ Match Charter organization not found');
      return;
    }

    console.log(`📦 Exporting organization: ${org.name}`);

    // Export all related data
    const backup = {
      exportDate: new Date().toISOString(),
      organization: org,
      departments: await prisma.organizationalUnit.findMany({
        where: { organizationId: org.id, type: 'Department' },
        include: { resourceLibrary: true, members: true },
      }),
      teachers: await prisma.user.findMany({
        where: {
          organizationRoles: {
            some: { organizationId: org.id, role: 'teacher' },
          },
        },
      }),
      classes: await prisma.k12Class.findMany({
        where: { organizationId: org.id },
        include: { instructor: true },
      }),
      units: await prisma.unit.findMany({
        where: { organizationId: org.id },
      }),
      standards: await prisma.standard.findMany({
        where: { organizationId: org.id },
        include: { unit: true, exampleObjectives: true },
      }),
      exampleObjectives: await prisma.exampleObjective.findMany({
        where: { standard: { organizationId: org.id } },
      }),
    };

    // Write to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(
      process.cwd(),
      `backups/match-charter-backup-${timestamp}.json`
    );

    // Create backups directory if it doesn't exist
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`\n✅ Backup complete!`);
    console.log(`📁 Saved to: ${backupPath}`);
    console.log(`\n📊 Backup contents:`);
    console.log(`  - 1 organization (Match Charter High School)`);
    console.log(`  - ${backup.departments.length} departments`);
    console.log(`  - ${backup.teachers.length} teachers`);
    console.log(`  - ${backup.classes.length} classes`);
    console.log(`  - ${backup.units.length} units`);
    console.log(`  - ${backup.standards.length} standards`);
    console.log(`  - ${backup.exampleObjectives.length} objectives`);

    // Also create a CSV for easier viewing
    const csvPath = backupPath.replace('.json', '.csv');
    const csv = [
      ['Standards Report', ''].join(','),
      ['Export Date', backup.exportDate].join(','),
      ['Organization', org.name].join(','),
      [''].join(','),
      ['Code', 'Standard Name', 'Type', 'Unit', 'Objectives Count'].join(','),
      ...backup.standards.map(s => [
        s.code,
        s.name,
        s.type,
        backup.units.find(u => u.id === s.unitId)?.name || 'N/A',
        backup.exampleObjectives.filter(eo => eo.standardId === s.id).length,
      ].join(',')),
    ].join('\n');

    fs.writeFileSync(csvPath, csv);
    console.log(`📊 CSV report: ${csvPath}`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupMatchCharter();
