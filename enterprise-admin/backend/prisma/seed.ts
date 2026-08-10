// 种子数据脚本 / Seed script
// 运行：npm run seed
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始写入种子数据 / Seeding...');

  // 1. 部门 / Departments
  const rootDept = await prisma.dept.create({
    data: { name: '总公司', parentId: null, sort: 0, leader: '张总', status: 1 },
  });
  const techDept = await prisma.dept.create({
    data: { name: '研发部', parentId: rootDept.id, sort: 1, leader: '李工', status: 1 },
  });
  await prisma.dept.create({
    data: { name: '市场部', parentId: rootDept.id, sort: 2, leader: '王经理', status: 1 },
  });

  // 2. 角色 / Roles
  const superAdminRole = await prisma.role.create({
    data: { name: '超级管理员', code: 'super_admin', description: '拥有全部权限' },
  });
  const editorRole = await prisma.role.create({
    data: { name: '编辑', code: 'editor', description: '可编辑业务数据，不可管理账号' },
  });
  const viewerRole = await prisma.role.create({
    data: { name: '访客', code: 'viewer', description: '仅查看数据看板' },
  });

  // 3. 权限（菜单 + 按钮）/ Permissions tree
  // 一级目录
  const dashboardMenu = await prisma.permission.create({
    data: { name: '数据看板', code: 'dashboard', type: 'menu', parentId: null, path: '/dashboard', component: 'dashboard/index', icon: 'Odometer', sort: 1 },
  });
  const systemMenu = await prisma.permission.create({
    data: { name: '系统管理', code: 'system', type: 'menu', parentId: null, path: '/system', component: 'Layout', icon: 'Setting', sort: 2 },
  });

  // 二级菜单（系统管理下）/ Sub menus under system
  const userMenu = await prisma.permission.create({
    data: { name: '用户管理', code: 'system:user', type: 'menu', parentId: systemMenu.id, path: 'user', component: 'system/user/index', icon: 'User', sort: 1 },
  });
  const roleMenu = await prisma.permission.create({
    data: { name: '角色管理', code: 'system:role', type: 'menu', parentId: systemMenu.id, path: 'role', component: 'system/role/index', icon: 'UserFilled', sort: 2 },
  });
  const deptMenu = await prisma.permission.create({
    data: { name: '部门管理', code: 'system:dept', type: 'menu', parentId: systemMenu.id, path: 'dept', component: 'system/dept/index', icon: 'OfficeBuilding', sort: 3 },
  });
  const permissionMenu = await prisma.permission.create({
    data: { name: '菜单权限', code: 'system:permission', type: 'menu', parentId: systemMenu.id, path: 'permission', component: 'system/permission/index', icon: 'Grid', sort: 4 },
  });
  const configMenu = await prisma.permission.create({
    data: { name: '系统配置', code: 'system:config', type: 'menu', parentId: systemMenu.id, path: 'config', component: 'system/config/index', icon: 'Tools', sort: 5 },
  });
  const dictMenu = await prisma.permission.create({
    data: { name: '字典管理', code: 'system:dict', type: 'menu', parentId: systemMenu.id, path: 'dict', component: 'system/dict/index', icon: 'Document', sort: 6 },
  });
  const logMenu = await prisma.permission.create({
    data: { name: '操作日志', code: 'system:log', type: 'menu', parentId: systemMenu.id, path: 'log', component: 'system/log/index', icon: 'List', sort: 7 },
  });

  // 按钮权限 / Button permissions
  const buttons = [
    { name: '用户新增', code: 'system:user:add', parentId: userMenu.id },
    { name: '用户编辑', code: 'system:user:edit', parentId: userMenu.id },
    { name: '用户删除', code: 'system:user:delete', parentId: userMenu.id },
    { name: '用户重置密码', code: 'system:user:reset', parentId: userMenu.id },
    { name: '用户分配角色', code: 'system:user:assign', parentId: userMenu.id },
    { name: '角色新增', code: 'system:role:add', parentId: roleMenu.id },
    { name: '角色编辑', code: 'system:role:edit', parentId: roleMenu.id },
    { name: '角色删除', code: 'system:role:delete', parentId: roleMenu.id },
    { name: '角色分配权限', code: 'system:role:assign', parentId: roleMenu.id },
    { name: '部门新增', code: 'system:dept:add', parentId: deptMenu.id },
    { name: '部门编辑', code: 'system:dept:edit', parentId: deptMenu.id },
    { name: '部门删除', code: 'system:dept:delete', parentId: deptMenu.id },
    { name: '菜单新增', code: 'system:permission:add', parentId: permissionMenu.id },
    { name: '菜单编辑', code: 'system:permission:edit', parentId: permissionMenu.id },
    { name: '菜单删除', code: 'system:permission:delete', parentId: permissionMenu.id },
    { name: '配置新增', code: 'system:config:add', parentId: configMenu.id },
    { name: '配置编辑', code: 'system:config:edit', parentId: configMenu.id },
    { name: '配置删除', code: 'system:config:delete', parentId: configMenu.id },
    { name: '字典新增', code: 'system:dict:add', parentId: dictMenu.id },
    { name: '字典编辑', code: 'system:dict:edit', parentId: dictMenu.id },
    { name: '字典删除', code: 'system:dict:delete', parentId: dictMenu.id },
  ];
  const buttonPerms = [];
  for (const b of buttons) {
    buttonPerms.push(await prisma.permission.create({ data: { name: b.name, code: b.code, type: 'button', parentId: b.parentId, sort: 0 } }));
  }

  // 4. 给 super_admin 分配全部权限 / Assign all permissions to super_admin
  const allPerms = await prisma.permission.findMany();
  await prisma.rolePermission.createMany({
    data: allPerms.map((p) => ({ roleId: superAdminRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  // 5. editor：看板 + 系统管理（除账号/权限管理外）/ editor: dashboard + system minus user/permission
  const editorPermCodes = [
    'dashboard',
    'system',
    'system:dept', 'system:dept:add', 'system:dept:edit', 'system:dept:delete',
    'system:config', 'system:config:add', 'system:config:edit', 'system:config:delete',
    'system:dict', 'system:dict:add', 'system:dict:edit', 'system:dict:delete',
    'system:log',
  ];
  const editorPerms = await prisma.permission.findMany({ where: { code: { in: editorPermCodes } } });
  await prisma.rolePermission.createMany({
    data: editorPerms.map((p) => ({ roleId: editorRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  // 6. viewer：仅看板 / viewer: dashboard only
  const viewerPerms = await prisma.permission.findMany({ where: { code: { in: ['dashboard'] } } });
  await prisma.rolePermission.createMany({
    data: viewerPerms.map((p) => ({ roleId: viewerRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  // 7. 用户 / Users
  const adminPwd = await bcrypt.hash('admin123', 10);
  const userPwd = await bcrypt.hash('user123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPwd,
      name: '超级管理员',
      email: 'admin@enterprise.com',
      phone: '13800000000',
      deptId: rootDept.id,
      status: 1,
    },
  });
  await prisma.userRole.create({ data: { userId: admin.id, roleId: superAdminRole.id } });

  const normalUser = await prisma.user.create({
    data: {
      username: 'viewer',
      password: userPwd,
      name: '访客小李',
      email: 'viewer@enterprise.com',
      phone: '13800000001',
      deptId: techDept.id,
      status: 1,
    },
  });
  await prisma.userRole.create({ data: { userId: normalUser.id, roleId: viewerRole.id } });

  // 8. 系统配置 / System configs
  const configs = [
    { key: 'site_name', value: '企业后台管理系统', remark: '站点名称' },
    { key: 'site_version', value: '1.0.0', remark: '系统版本' },
    { key: 'default_password', value: '123456', remark: '新用户初始密码' },
    { key: 'login_max_retry', value: '5', remark: '登录最大重试次数' },
  ];
  for (const c of configs) {
    await prisma.systemConfig.create({ data: c });
  }

  // 9. 字典类型 + 字典项 / Dict types + items
  const statusDict = await prisma.dictType.create({ data: { name: '通用状态', code: 'common_status', status: 1 } });
  await prisma.dictItem.createMany({
    data: [
      { dictTypeId: statusDict.id, label: '启用', value: '1', sort: 1, status: 1 },
      { dictTypeId: statusDict.id, label: '禁用', value: '0', sort: 2, status: 1 },
    ],
  });
  const genderDict = await prisma.dictType.create({ data: { name: '性别', code: 'gender', status: 1 } });
  await prisma.dictItem.createMany({
    data: [
      { dictTypeId: genderDict.id, label: '男', value: 'male', sort: 1, status: 1 },
      { dictTypeId: genderDict.id, label: '女', value: 'female', sort: 2, status: 1 },
    ],
  });

  // 10. 一条登录日志示例 / One sample log
  await prisma.operationLog.create({
    data: { userId: admin.id, username: 'admin', action: 'login', target: 'auth/login', ip: '127.0.0.1', detail: '系统初始化登录' },
  });

  console.log('✅ 种子数据完成 / Seed done');
  console.log('   管理员账号 / Admin: admin / admin123');
  console.log('   访客账号 / Viewer: viewer / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
