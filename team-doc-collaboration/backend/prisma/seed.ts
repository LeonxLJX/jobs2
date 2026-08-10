// 种子数据：插入 1 个 super_admin 账号、1 个示例团队、2 个示例文档
// Seed data: insert 1 super_admin account, 1 sample team, 2 sample documents

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 创建 super_admin 账号 / Create super_admin account
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
    },
  });

  // 创建示例团队 / Create sample team
  const team = await prisma.team.upsert({
    where: { id: 'seed-team-1' },
    update: {},
    create: {
      id: 'seed-team-1',
      name: 'Demo Team',
      ownerId: admin.id,
    },
  });

  // 将 admin 加入团队 / Add admin as team member
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: admin.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: admin.id,
      role: 'team_admin',
    },
  });

  // 创建示例文档 1 / Create sample document 1
  const doc1 = await prisma.document.create({
    data: {
      teamId: team.id,
      title: 'Welcome to Team Doc Collaboration',
      content:
        '<h1>Welcome</h1><p>This is the first sample document. You can edit it freely.</p>',
      ownerId: admin.id,
      currentVersion: 1,
    },
  });
  await prisma.documentVersion.create({
    data: {
      documentId: doc1.id,
      version: 1,
      title: doc1.title,
      content: doc1.content,
      editorId: admin.id,
    },
  });

  // 创建示例文档 2 / Create sample document 2
  const doc2 = await prisma.document.create({
    data: {
      teamId: team.id,
      title: 'Project Roadmap',
      content:
        '<h1>Roadmap</h1><ul><li>Q1: MVP</li><li>Q2: Real-time sync</li><li>Q3: Mobile app</li></ul>',
      ownerId: admin.id,
      currentVersion: 1,
    },
  });
  await prisma.documentVersion.create({
    data: {
      documentId: doc2.id,
      version: 1,
      title: doc2.title,
      content: doc2.content,
      editorId: admin.id,
    },
  });

  console.log('Seed completed:');
  console.log('  Admin login: admin@example.com / admin123');
  console.log('  Team:', team.name);
  console.log('  Documents:', doc1.title, ',', doc2.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
