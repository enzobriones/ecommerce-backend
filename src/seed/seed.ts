// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Categorías principales
    const moscas = await prisma.category.create({
      data: {
        name: 'Moscas',
        description: 'Moscas atadas a mano para pesca con mosca',
        slug: 'moscas',
      },
    });

    const cañas = await prisma.category.create({
      data: {
        name: 'Cañas',
        description: 'Cañas para pesca con mosca',
        slug: 'canas',
      },
    });

    const carretes = await prisma.category.create({
      data: {
        name: 'Carretes',
        description: 'Carretes para pesca con mosca',
        slug: 'carretes',
      },
    });

    const accesorios = await prisma.category.create({
      data: {
        name: 'Accesorios',
        description: 'Accesorios para pesca con mosca',
        slug: 'accesorios',
      },
    });

    // Subcategorías de moscas
    const secas = await prisma.category.create({
      data: {
        name: 'Moscas Secas',
        description: 'Moscas secas para pesca en superficie',
        slug: 'moscas-secas',
        parentId: moscas.id,
      },
    });

    const ninfas = await prisma.category.create({
      data: {
        name: 'Ninfas',
        description: 'Moscas que imitan insectos bajo el agua',
        slug: 'ninfas',
        parentId: moscas.id,
      },
    });

    const streamers = await prisma.category.create({
      data: {
        name: 'Streamers',
        description: 'Moscas que imitan peces y otros organismos acuáticos',
        slug: 'streamers',
        parentId: moscas.id,
      },
    });

    // Productos de ejemplo
    await prisma.product.create({
      data: {
        name: 'Adams #14',
        description:
          'Mosca seca clásica, excelente imitación de efímeras con alas grises',
        price: 3500,
        stock: 50,
        slug: 'adams-14',
        categoryId: secas.id,
        attributes: {
          size: 14,
          hook: 'Dry Fly Hook',
          materials: ['Gallo de León', 'Pluma de Pato', 'Hackle de Gallo'],
          floatability: 'Alta',
        },
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://example.com/images/adams-14.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Copper John #16',
        description:
          'Ninfa efectiva en ríos chilenos, con cuerpo de alambre de cobre',
        price: 3800,
        stock: 40,
        slug: 'copper-john-16',
        categoryId: ninfas.id,
        attributes: {
          size: 16,
          hook: 'Nymph Hook',
          materials: ['Alambre de Cobre', 'Dubbing', 'Bead Head'],
          weight: 'Media',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/copper-john-16.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Woolly Bugger Negro #8',
        description:
          'Streamer versátil para truchas y salmones en lagos y ríos de Chile',
        price: 4200,
        stock: 35,
        slug: 'woolly-bugger-negro-8',
        categoryId: streamers.id,
        attributes: {
          size: 8,
          hook: 'Streamer Hook',
          materials: ['Marabú', 'Chenille', 'Hackle de Gallo'],
          weight: 'Alta',
        },
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://example.com/images/woolly-bugger-negro-8.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Usuario administrador
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@flyfishing.cl',
        passwordHash: adminPasswordHash,
        firstName: 'Admin',
        lastName: 'Usuario',
        role: 'ADMIN',
      },
    });

    // Usuario cliente
    const customerPasswordHash = await bcrypt.hash('cliente123', 10);
    await prisma.user.create({
      data: {
        email: 'cliente@example.com',
        passwordHash: customerPasswordHash,
        firstName: 'Cliente',
        lastName: 'Ejemplo',
        role: 'CUSTOMER',
        address: {
          create: {
            street: 'Av. Apoquindo 123',
            city: 'Santiago',
            commune: 'Maipú',
            province: 'Santiago',
            region: 'Región Metropolitana',
            zipCode: '7550000',
          },
        },
      },
    });

    console.log('Base de datos inicializada con datos de ejemplo');
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
