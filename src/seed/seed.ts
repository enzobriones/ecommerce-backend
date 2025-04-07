import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Eliminar en orden para respetar las restricciones de clave foránea
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Base de datos limpiada correctamente');
}

async function main() {
  try {
    await cleanDatabase();
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

    // Subcategorías de cañas
    const canasAgua = await prisma.category.create({
      data: {
        name: 'Cañas de Agua Dulce',
        description: 'Cañas diseñadas para pesca en ríos y lagos',
        slug: 'canas-agua-dulce',
        parentId: cañas.id,
      },
    });

    const canasMar = await prisma.category.create({
      data: {
        name: 'Cañas de Agua Salada',
        description: 'Cañas resistentes a la corrosión para pesca en mar',
        slug: 'canas-agua-salada',
        parentId: cañas.id,
      },
    });

    // Subcategorías de carretes
    const carretesLigeros = await prisma.category.create({
      data: {
        name: 'Carretes Ligeros',
        description: 'Carretes para líneas #1-5',
        slug: 'carretes-ligeros',
        parentId: carretes.id,
      },
    });

    const carretesMedianos = await prisma.category.create({
      data: {
        name: 'Carretes Medianos',
        description: 'Carretes para líneas #5-8',
        slug: 'carretes-medianos',
        parentId: carretes.id,
      },
    });

    const carretesPesados = await prisma.category.create({
      data: {
        name: 'Carretes Pesados',
        description: 'Carretes para líneas #8 y superiores',
        slug: 'carretes-pesados',
        parentId: carretes.id,
      },
    });

    // Subcategorías de accesorios
    const lineas = await prisma.category.create({
      data: {
        name: 'Líneas',
        description: 'Líneas de pesca con mosca',
        slug: 'lineas',
        parentId: accesorios.id,
      },
    });

    const leaders = await prisma.category.create({
      data: {
        name: 'Leaders y Tippets',
        description: 'Leaders y tippets para pesca con mosca',
        slug: 'leaders-tippets',
        parentId: accesorios.id,
      },
    });

    const cajas = await prisma.category.create({
      data: {
        name: 'Cajas para Moscas',
        description: 'Cajas para almacenar y transportar moscas',
        slug: 'cajas-moscas',
        parentId: accesorios.id,
      },
    });

    const vestimenta = await prisma.category.create({
      data: {
        name: 'Vestimenta',
        description: 'Ropa y calzado para pesca con mosca',
        slug: 'vestimenta',
        parentId: accesorios.id,
      },
    });

    // Productos de moscas secas
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
            {
              url: 'https://example.com/images/adams-14-alt.jpg',
              isMain: false,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Royal Wulff #12',
        description: 'Mosca de atracción visible incluso en aguas turbulentas',
        price: 3700,
        stock: 45,
        slug: 'royal-wulff-12',
        categoryId: secas.id,
        attributes: {
          size: 12,
          hook: 'Dry Fly Hook',
          materials: ['Cola de Ciervo', 'Floss Rojo', 'Hackle Blanco'],
          floatability: 'Muy Alta',
        },
        isFeatured: true,
        discount: 10,
        images: {
          create: [
            {
              url: 'https://example.com/images/royal-wulff-12.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Elk Hair Caddis #16',
        description: 'Imitación realista de tricópteros adultos',
        price: 3200,
        stock: 60,
        slug: 'elk-hair-caddis-16',
        categoryId: secas.id,
        attributes: {
          size: 16,
          hook: 'Dry Fly Hook',
          materials: ['Pelo de Alce', 'Dubbing', 'Hackle de Gallo'],
          floatability: 'Alta',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/elk-hair-caddis-16.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Parachute Hopper #10',
        description: 'Imitación de saltamontes ideal para temporada de verano',
        price: 4000,
        stock: 30,
        slug: 'parachute-hopper-10',
        categoryId: secas.id,
        attributes: {
          size: 10,
          hook: 'Dry Fly Hook',
          materials: ['Foam', 'Rubber Legs', 'Parachute Hackle'],
          floatability: 'Muy Alta',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/parachute-hopper-10.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de ninfas
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
        name: 'Pheasant Tail #18',
        description:
          'Clásica ninfa que imita varias especies de insectos acuáticos',
        price: 3500,
        stock: 55,
        slug: 'pheasant-tail-18',
        categoryId: ninfas.id,
        attributes: {
          size: 18,
          hook: 'Nymph Hook',
          materials: ['Cola de Faisán', 'Alambre de Cobre', 'Bead Head'],
          weight: 'Ligera',
        },
        discount: 15,
        images: {
          create: [
            {
              url: 'https://example.com/images/pheasant-tail-18.jpg',
              isMain: true,
            },
            {
              url: 'https://example.com/images/pheasant-tail-18-alt.jpg',
              isMain: false,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: "Hare's Ear #14",
        description:
          'Ninfa versátil efectiva en casi cualquier corriente de agua',
        price: 3600,
        stock: 48,
        slug: 'hares-ear-14',
        categoryId: ninfas.id,
        attributes: {
          size: 14,
          hook: 'Nymph Hook',
          materials: ['Dubbing de Liebre', 'Pluma de Perdiz', 'Bead Head'],
          weight: 'Media',
        },
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://example.com/images/hares-ear-14.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Prince Nymph #12',
        description: 'Ninfa atractiva con alas blancas distintivas',
        price: 3900,
        stock: 35,
        slug: 'prince-nymph-12',
        categoryId: ninfas.id,
        attributes: {
          size: 12,
          hook: 'Nymph Hook',
          materials: ['Biots de Ganso', 'Peacock Herl', 'Hackle Marrón'],
          weight: 'Media-Alta',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/prince-nymph-12.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de streamers
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

    await prisma.product.create({
      data: {
        name: 'Woolly Bugger Oliva #6',
        description: 'Variante en color oliva efectiva en aguas de montaña',
        price: 4200,
        stock: 30,
        slug: 'woolly-bugger-oliva-6',
        categoryId: streamers.id,
        attributes: {
          size: 6,
          hook: 'Streamer Hook',
          materials: ['Marabú Oliva', 'Chenille Oliva', 'Hackle Oliva'],
          weight: 'Alta',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/woolly-bugger-oliva-6.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Zonker Conejo Blanco #4',
        description: 'Streamer grande que imita peces pequeños',
        price: 4500,
        stock: 25,
        slug: 'zonker-conejo-blanco-4',
        categoryId: streamers.id,
        attributes: {
          size: 4,
          hook: 'Streamer Hook',
          materials: ['Tira de Conejo', 'Flash', 'Ojos 3D'],
          weight: 'Muy Alta',
        },
        discount: 10,
        images: {
          create: [
            {
              url: 'https://example.com/images/zonker-conejo-blanco-4.jpg',
              isMain: true,
            },
            {
              url: 'https://example.com/images/zonker-conejo-blanco-4-alt.jpg',
              isMain: false,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Clouser Minnow #2',
        description: 'Streamer efectivo tanto en agua dulce como salada',
        price: 4300,
        stock: 32,
        slug: 'clouser-minnow-2',
        categoryId: streamers.id,
        attributes: {
          size: 2,
          hook: 'Streamer Hook',
          materials: ['Bucktail', 'Flash', 'Ojos de Cadena'],
          weight: 'Alta',
        },
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://example.com/images/clouser-minnow-2.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de cañas de agua dulce
    await prisma.product.create({
      data: {
        name: "Caña Orvis Clearwater 9' #5",
        description:
          'Caña versátil para ríos y lagos, ideal para principiantes y expertos',
        price: 189000,
        stock: 8,
        slug: 'cana-orvis-clearwater-9-5',
        categoryId: canasAgua.id,
        attributes: {
          length: '9 pies',
          line: '#5',
          pieces: 4,
          action: 'Media',
          warranty: '25 años',
        },
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://example.com/images/orvis-clearwater-9-5.jpg',
              isMain: true,
            },
            {
              url: 'https://example.com/images/orvis-clearwater-9-5-detail.jpg',
              isMain: false,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Caña Sage X 8\'6" #4',
        description:
          'Caña premium para pesca técnica en ríos pequeños y medianos',
        price: 350000,
        stock: 5,
        slug: 'cana-sage-x-86-4',
        categoryId: canasAgua.id,
        attributes: {
          length: '8 pies 6 pulgadas',
          line: '#4',
          pieces: 4,
          action: 'Rápida',
          warranty: 'Lifetime',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/sage-x-86-4.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de cañas de agua salada
    await prisma.product.create({
      data: {
        name: "Caña Scott Sector 9' #8",
        description:
          'Caña potente para pesca en agua salada, resistente a la corrosión',
        price: 420000,
        stock: 4,
        slug: 'cana-scott-sector-9-8',
        categoryId: canasMar.id,
        attributes: {
          length: '9 pies',
          line: '#8',
          pieces: 4,
          action: 'Rápida',
          warranty: 'Lifetime',
        },
        discount: 50000,
        images: {
          create: [
            {
              url: 'https://example.com/images/scott-sector-9-8.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: "Caña TFO Axiom II-X 9' #10",
        description: 'Caña robusta para pesca de especies grandes en costa',
        price: 280000,
        stock: 6,
        slug: 'cana-tfo-axiom-9-10',
        categoryId: canasMar.id,
        attributes: {
          length: '9 pies',
          line: '#10',
          pieces: 4,
          action: 'Extra-Rápida',
          warranty: 'Lifetime',
        },
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://example.com/images/tfo-axiom-9-10.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de carretes ligeros
    await prisma.product.create({
      data: {
        name: 'Carrete Lamson Litespeed F #3',
        description: 'Carrete ultraligero con freno sellado para líneas #2-4',
        price: 180000,
        stock: 7,
        slug: 'carrete-lamson-litespeed-3',
        categoryId: carretesLigeros.id,
        attributes: {
          weight: '96g',
          material: 'Aluminio Mecanizado',
          drag: 'Sellado Conical',
          capacity: 'WF3 + 100m backing',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/lamson-litespeed-3.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de carretes medianos
    await prisma.product.create({
      data: {
        name: 'Carrete Redington Behemoth #5/6',
        description: 'Excelente relación calidad-precio con potente freno',
        price: 130000,
        stock: 10,
        slug: 'carrete-redington-behemoth-5-6',
        categoryId: carretesMedianos.id,
        attributes: {
          weight: '155g',
          material: 'Die-cast',
          drag: 'Carbon Fiber',
          capacity: 'WF6 + 150m backing',
        },
        isFeatured: true,
        discount: 15000,
        images: {
          create: [
            {
              url: 'https://example.com/images/redington-behemoth-5-6.jpg',
              isMain: true,
            },
            {
              url: 'https://example.com/images/redington-behemoth-detail.jpg',
              isMain: false,
            },
          ],
        },
      },
    });

    // Productos de carretes pesados
    await prisma.product.create({
      data: {
        name: 'Carrete Nautilus NV-G 8/9',
        description: 'Carrete premium de alto rendimiento para pesca exigente',
        price: 450000,
        stock: 4,
        slug: 'carrete-nautilus-nvg-8-9',
        categoryId: carretesPesados.id,
        attributes: {
          weight: '228g',
          material: 'Aluminio Aeroespacial',
          drag: 'NV-G CCF Disc',
          capacity: 'WF9 + 250m backing',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/nautilus-nvg-8-9.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de líneas
    await prisma.product.create({
      data: {
        name: 'Línea Rio Gold WF5F',
        description:
          'Línea flotante de alta visibilidad con tecnología SlickCast',
        price: 65000,
        stock: 15,
        slug: 'linea-rio-gold-wf5f',
        categoryId: lineas.id,
        attributes: {
          peso: '#5',
          tipo: 'Flotante',
          color: 'Amarillo/Naranja',
          longitud: '90 pies',
        },
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://example.com/images/rio-gold-wf5f.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de leaders
    await prisma.product.create({
      data: {
        name: "Leader Trout SA 9' 5X",
        description: 'Leader cónico para presentaciones delicadas',
        price: 8500,
        stock: 30,
        slug: 'leader-sa-9-5x',
        categoryId: leaders.id,
        attributes: {
          longitud: '9 pies',
          diámetro: '5X (0.15mm)',
          material: 'Nylon',
          resistencia: '4.6 lb',
        },
        images: {
          create: [
            {
              url: 'https://example.com/images/leader-sa-9-5x.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de cajas
    await prisma.product.create({
      data: {
        name: 'Caja Wheatley Aluminio 12 Compartimentos',
        description: 'Caja premium impermeable con espuma de alta densidad',
        price: 42000,
        stock: 8,
        slug: 'caja-wheatley-aluminio-12',
        categoryId: cajas.id,
        attributes: {
          material: 'Aluminio Anodizado',
          compartimentos: 12,
          impermeabilidad: 'Alta',
          dimensiones: '12 x 8 x 3 cm',
        },
        discount: 5000,
        images: {
          create: [
            {
              url: 'https://example.com/images/wheatley-aluminio-12.jpg',
              isMain: true,
            },
          ],
        },
      },
    });

    // Productos de vestimenta
    await prisma.product.create({
      data: {
        name: 'Wader Simms G3 Guide',
        description: 'Wader de alta durabilidad con 4 capas GORE-TEX Pro',
        price: 280000,
        stock: 6,
        slug: 'wader-simms-g3-guide',
        categoryId: vestimenta.id,
        attributes: {
          material: 'GORE-TEX Pro 4 capas',
          tallas: ['M', 'L', 'XL'],
          color: 'Gris Oscuro',
          características: [
            'Tirantes Convertibles',
            'Bolsillos Impermeables',
            'Cinturón',
          ],
        },
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://example.com/images/wader-simms-g3.jpg',
              isMain: true,
            },
            {
              url: 'https://example.com/images/wader-simms-g3-detail.jpg',
              isMain: false,
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
        phone: '+56912345678',
      },
    });

    // Usuario staff
    const staffPasswordHash = await bcrypt.hash('staff123', 10);
    await prisma.user.create({
      data: {
        email: 'staff@flyfishing.cl',
        passwordHash: staffPasswordHash,
        firstName: 'Staff',
        lastName: 'Tienda',
        role: 'STAFF',
        phone: '+56987654321',
      },
    });

    // Usuarios clientes
    const customerPasswordHash = await bcrypt.hash('cliente123', 10);
    const customer1 = await prisma.user.create({
      data: {
        email: 'cliente@example.com',
        passwordHash: customerPasswordHash,
        firstName: 'Cliente',
        lastName: 'Ejemplo',
        role: 'CUSTOMER',
        phone: '+56922334455',
        address: {
          create: {
            street: 'Av. Apoquindo 123',
            city: 'Santiago',
            commune: 'Las Condes',
            province: 'Santiago',
            region: 'Región Metropolitana',
            zipCode: '7550000',
          },
        },
      },
    });

    const customer2 = await prisma.user.create({
      data: {
        email: 'juan.perez@gmail.com',
        passwordHash: await bcrypt.hash('juan123', 10),
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'CUSTOMER',
        phone: '+56933445566',
        address: {
          create: [
            {
              street: 'Calle Los Pinos 456',
              city: 'Concepción',
              commune: 'Concepción',
              province: 'Concepción',
              region: 'Región del Bío Bío',
              zipCode: '4030000',
            },
            {
              street: 'Camino El Alto Km 5',
              city: 'Pucón',
              commune: 'Pucón',
              province: 'Cautín',
              region: 'Región de La Araucanía',
              zipCode: '4920000',
            },
          ],
        },
      },
    });

    const customer3 = await prisma.user.create({
      data: {
        email: 'maria.rodriguez@hotmail.com',
        passwordHash: await bcrypt.hash('maria456', 10),
        firstName: 'María',
        lastName: 'Rodríguez',
        role: 'CUSTOMER',
        phone: '+56944556677',
        address: {
          create: {
            street: 'Av. Costanera 789',
            city: 'Puerto Varas',
            commune: 'Puerto Varas',
            province: 'Llanquihue',
            region: 'Región de Los Lagos',
            zipCode: '5550000',
          },
        },
      },
    });

    const customer4 = await prisma.user.create({
      data: {
        email: 'carlos.gomez@yahoo.com',
        passwordHash: await bcrypt.hash('carlos789', 10),
        firstName: 'Carlos',
        lastName: 'Gómez',
        role: 'CUSTOMER',
        phone: '+56955667788',
        address: {
          create: {
            street: 'Pasaje Las Truchas 234',
            city: 'Coyhaique',
            commune: 'Coyhaique',
            province: 'Coyhaique',
            region: 'Región de Aysén',
            zipCode: '5780000',
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
