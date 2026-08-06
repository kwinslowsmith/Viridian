import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface EKStatement {
  code: string;
  statement: string;
}

interface Unit {
  unitCode: string;
  unitTitle: string;
  learningObjectives: string[];
  essentialKnowledge: EKStatement[];
}

interface Course {
  courseCode: string;
  courseName: string;
  units: Unit[];
}

interface StandardsData {
  courses: Course[];
}

async function importAPStandards() {
  try {
    // Read Sophia's JSON file
    const filePath = path.join(
      process.cwd(),
      "..",
      "KyleOS",
      "owners-inbox",
      "ALIGNMENT-Sophia-AP-Standards-6Courses.json"
    );

    console.log(`📖 Reading standards from: ${filePath}`);
    const data: StandardsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    let coursesCreated = 0;
    let unitsCreated = 0;
    let standardsCreated = 0;
    let objectivesCreated = 0;

    // Process each course
    for (const course of data.courses) {
      console.log(`\n📚 Creating course: ${course.courseName}`);

      // 1. Create StandardsBank (course)
      const standardsBank = await prisma.standardsBank.upsert({
        where: {
          id: `bank-${course.courseCode.toLowerCase()}`,
        },
        update: {
          name: course.courseName,
          subject: course.courseCode.includes("AP") ? "History" : "History",
          source: "AP",
        },
        create: {
          id: `bank-${course.courseCode.toLowerCase()}`,
          name: course.courseName,
          subject: course.courseCode.includes("AP") ? "History" : "History",
          source: "AP",
          description: `College Board ${course.courseName} Course Exam Description`,
        },
      });
      coursesCreated++;
      console.log(`  ✅ StandardsBank created: ${standardsBank.id}`);

      // 2. Create Units for this course
      for (let i = 0; i < course.units.length; i++) {
        const unit = course.units[i];
        console.log(
          `   📖 Creating unit: ${unit.unitCode} - ${unit.unitTitle}`
        );

        const createdUnit = await prisma.unit.upsert({
          where: {
            id: `unit-${course.courseCode.toLowerCase()}-${unit.unitCode}`,
          },
          update: {
            name: unit.unitTitle,
            sequenceNum: i + 1,
          },
          create: {
            id: `unit-${course.courseCode.toLowerCase()}-${unit.unitCode}`,
            standardsBankId: standardsBank.id,
            code: unit.unitCode,
            name: unit.unitTitle,
            sequenceNum: i + 1,
          },
        });
        unitsCreated++;
        console.log(`    ✅ Unit created: ${createdUnit.code}`);

        // 3. Create Standards for each unit
        // Group EK statements: each one becomes a Standard
        // (In real scenario, these might be grouped differently)

        // For now, create one Standard per unit containing all EK statements as objectives
        const unitStandard = await prisma.standard.upsert({
          where: {
            id: `std-${course.courseCode.toLowerCase()}-${unit.unitCode}`,
          },
          update: {
            name: unit.unitTitle,
          },
          create: {
            id: `std-${course.courseCode.toLowerCase()}-${unit.unitCode}`,
            standardsBankId: standardsBank.id,
            unitId: createdUnit.id,
            type: "content",
            code: unit.unitCode,
            name: unit.unitTitle,
            description: `Standards for ${unit.unitTitle}`,
            passPercentage: 80,
          },
        });
        standardsCreated++;
        console.log(`     ✅ Standard created: ${unitStandard.code}`);

        // 4. Create ExampleObjectives for each EK statement
        for (let j = 0; j < unit.essentialKnowledge.length; j++) {
          const ek = unit.essentialKnowledge[j];

          // Label: A, B, C, etc.
          const label = String.fromCharCode(65 + j); // 65 is 'A'

          await prisma.exampleObjective.upsert({
            where: {
              id: `obj-${course.courseCode.toLowerCase()}-${unit.unitCode}-${ek.code}`,
            },
            update: {
              text: ek.statement,
            },
            create: {
              id: `obj-${course.courseCode.toLowerCase()}-${unit.unitCode}-${ek.code}`,
              standardId: unitStandard.id,
              label: ek.code, // Use EK code as label (e.g., "1.1.A", "1.1.B")
              text: ek.statement,
              learningTarget: ek.statement,
              source: "curriculum",
              sequenceNum: j + 1,
            },
          });
          objectivesCreated++;
        }
        console.log(
          `     ✅ ${unit.essentialKnowledge.length} objectives created`
        );
      }
    }

    console.log(`\n✨ IMPORT COMPLETE ✨`);
    console.log(`  📚 Courses: ${coursesCreated}`);
    console.log(`  📖 Units: ${unitsCreated}`);
    console.log(`  📋 Standards: ${standardsCreated}`);
    console.log(`  🎯 Objectives/EK Statements: ${objectivesCreated}`);
    console.log(
      `\n✅ All AP standards imported and ready for Hephaestus API queries!`
    );
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importAPStandards();
