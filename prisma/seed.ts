import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function CreateAdminRole() {
  //Se agrega el rol de usuario de administrador
  console.log('🔄 Insertando rol de administrador...');
  await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Rol de administrador con todos los permisos',
      IsSystemRole: true,
    },
  });

  console.log('✅ Rol de administrador insertado correctamente');
}

async function CreateBasePermissions() {
  // Se arma el array de permisos base
  const basePermissions = [
    { module: 'user', action: 'view', description: 'Ver usuario' },
    { module: 'user', action: 'create', description: 'Crear usuario' },
    { module: 'user', action: 'update', description: 'Actualizar usuario' },
    { module: 'user', action: 'delete', description: 'Eliminar usuario' },
    { module: 'role', action: 'view', description: 'Ver rol' },
    { module: 'role', action: 'create', description: 'Crear rol' },
    { module: 'role', action: 'update', description: 'Actualizar rol' },
    { module: 'role', action: 'delete', description: 'Eliminar rol' },
  ];

  console.log('🔄 Insertando permisos base...');
  for (const perm of basePermissions) {
    await prisma.permission.upsert({
      where: {
        module_action: {
          module: perm.module,
          action: perm.action,
        },
      },
      update: {},
      create: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
  }

  console.log('✅ Permisos base insertados correctamente');
}

async function main() {
  console.log('🌱 Iniciando seed .....');

  // Se crea el rol de administrador
  await CreateAdminRole();

  // Se crean los permisos base
  await CreateBasePermissions();

  console.log('🌱 Seed completado');
}

export default main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  });
