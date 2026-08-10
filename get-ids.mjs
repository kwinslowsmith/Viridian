import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getIds() {
  const parentChild = await prisma.parentChild.findFirst({
    include: {
      parent: { select: { id: true, name: true, email: true } },
      child: { select: { id: true, name: true, email: true } }
    }
  });

  if (parentChild) {
    console.log('Parent ID:', parentChild.parent.id);
    console.log('Parent Name:', parentChild.parent.name);
    console.log('Parent Email:', parentChild.parent.email);
    console.log('---');
    console.log('Child ID:', parentChild.child.id);
    console.log('Child Name:', parentChild.child.name);
    console.log('Child Email:', parentChild.child.email);
    console.log('\nTest URL: http://localhost:3000/app/parents/child/' + parentChild.child.id + '/dashboard-k12');
  } else {
    console.log('No parent-child relationships found');
  }

  await prisma.$disconnect();
}

getIds().catch(e => {
  console.error(e);
  process.exit(1);
});
