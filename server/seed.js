const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin'
    }
  });
  console.log('✅ Admin user created (admin / admin123)');

  // Check if products already exist
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const p1 = await prisma.product.create({
      data: {
        sku: 'J-001',
        name: 'Anillo de Compromiso Diamante 1ct',
        category: 'Anillos',
        description: 'Oro Blanco 18k',
        price: 4500,
        cost: 2000,
        stock: 3
      }
    });

    const p2 = await prisma.product.create({
      data: {
        sku: 'J-002',
        name: 'Collar de Perlas Cultivadas',
        category: 'Collares',
        description: 'Plata 925',
        price: 1200,
        cost: 500,
        stock: 5
      }
    });

    await prisma.expense.create({
      data: {
        amount: 4000,
        description: 'Alquiler Local Comercial',
        category: 'Operativos',
      }
    });

    await prisma.sale.create({
      data: {
        totalAmount: 4500,
        items: {
          create: [
            {
              productId: p1.id,
              quantity: 1,
              priceAtSale: 4500
            }
          ]
        }
      }
    });

    console.log('✅ Sample products, expenses and sales created');
  } else {
    console.log('ℹ️  Products already exist, skipping sample data');
  }

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
