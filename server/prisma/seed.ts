import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Foodle database with demo accounts and restaurants...');

  const defaultPassword = await bcrypt.hash('Demo@123', 12);
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  // 1. Create Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@foodle.app' },
    update: {},
    create: {
      email: 'admin@foodle.app',
      passwordHash: adminPassword,
      name: 'Super Admin',
      phone: '+91 98765 43210',
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });
  console.log('✅ Admin user ready: admin@foodle.app (Admin@123)');

  // 2. Create Customer
  await prisma.user.upsert({
    where: { email: 'customer@foodle.app' },
    update: {},
    create: {
      email: 'customer@foodle.app',
      passwordHash: defaultPassword,
      name: 'Aarav Sharma',
      phone: '+91 98123 45678',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      addresses: {
        create: [
          {
            label: 'Home',
            street: 'Flat 402, Royale Palms, Sector 62',
            city: 'Noida',
            state: 'Uttar Pradesh',
            postalCode: '201309',
            landmark: 'Near Fortis Hospital',
            lat: 28.6258,
            lng: 77.3653,
            isDefault: true,
          },
          {
            label: 'Work',
            street: 'Tower B, Cyber City, DLF Phase 2',
            city: 'Gurugram',
            state: 'Haryana',
            postalCode: '122002',
            landmark: 'Opposite IndusInd Cyber Hub',
            lat: 28.4908,
            lng: 77.0911,
            isDefault: false,
          },
        ],
      },
    },
  });
  console.log('✅ Customer user ready: customer@foodle.app (Demo@123)');

  // 3. Create Delivery Rider
  await prisma.user.upsert({
    where: { email: 'rider@foodle.app' },
    update: {},
    create: {
      email: 'rider@foodle.app',
      passwordHash: defaultPassword,
      name: 'Rahul Kumar',
      phone: '+91 98989 12345',
      role: 'RIDER',
      status: 'ACTIVE',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      riderProfile: {
        create: {
          vehicleType: 'Electric Scooter (Ather 450X)',
          vehicleNumber: 'DL 03 EV 8899',
          licenseNumber: 'DL-042022009812',
          documentsVerified: true,
          isOnline: true,
          currentLat: 28.6289,
          currentLng: 77.3621,
          totalDeliveries: 142,
          totalEarnings: 8450.0,
          rating: 4.9,
          ratingCount: 118,
        },
      },
    },
  });
  console.log('✅ Rider user ready: rider@foodle.app (Demo@123)');

  // 4. Create Restaurant Partner User
  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@delhidarbar.com' },
    update: {},
    create: {
      email: 'partner@delhidarbar.com',
      passwordHash: defaultPassword,
      name: 'Vikram Malhotra',
      phone: '+91 99112 33445',
      role: 'RESTAURANT',
      status: 'ACTIVE',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  // Create or update Restaurant
  let restaurant = await prisma.restaurant.findUnique({
    where: { slug: 'delhi-darbar-royal-mughlai' },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        ownerId: partnerUser.id,
        name: 'Delhi Darbar & Royal Mughlai',
        slug: 'delhi-darbar-royal-mughlai',
        description: 'Authentic Dum Biryanis, Butter Chicken, and Handi delicacies prepared using heritage slow-cooking recipes.',
        phone: '+91 11 4123 9999',
        email: 'orders@delhidarbar.com',
        address: 'Block M, Outer Circle, Connaught Place',
        city: 'New Delhi',
        lat: 28.6328,
        lng: 77.2195,
        cuisineTypes: 'Biryani, North Indian, Mughlai, Kebabs',
        isOpen: true,
        isApproved: true,
        openingTime: '11:00',
        closingTime: '23:30',
        commissionRate: 20.0,
        minOrderAmount: 149.0,
        avgPrepTimeMinutes: 25,
        rating: 4.8,
        ratingCount: 384,
        bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      },
    });

    // Create Categories & Dishes
    const cat1 = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Signature Biryanis',
        sortOrder: 1,
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          categoryId: cat1.id,
          name: 'Royal Dum Hyderabadi Chicken Biryani',
          description: 'Fragrant Basmati rice cooked with marinated chicken pieces, saffron, and aromatic secret spices. Served with Mirchi ka Salan & Burrani Raita.',
          price: 349.0,
          imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
          isVeg: false,
          isAvailable: true,
          prepTimeMinutes: 20,
          spiceLevel: 2,
        },
        {
          restaurantId: restaurant.id,
          categoryId: cat1.id,
          name: 'Nawabi Paneer Tikka Dum Biryani',
          description: 'Char-grilled cottage cheese cubes layered with long-grain saffron basmati rice and caramelized onions.',
          price: 299.0,
          imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 15,
          spiceLevel: 1,
        },
      ],
    });

    const cat2 = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Main Course Curries',
        sortOrder: 2,
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          categoryId: cat2.id,
          name: 'Old Delhi Butter Chicken (Boneless)',
          description: 'Tender tandoori chicken cooked in a rich, buttery tomato gravy with dried fenugreek leaves and fresh cream.',
          price: 389.0,
          imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
          isVeg: false,
          isAvailable: true,
          prepTimeMinutes: 20,
          spiceLevel: 1,
        },
        {
          restaurantId: restaurant.id,
          categoryId: cat2.id,
          name: 'Dal Makhani Bukhara Style',
          description: 'Black lentils slow-cooked overnight on charcoal with churned butter and Kashmiri chili.',
          price: 269.0,
          imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 10,
          spiceLevel: 1,
        },
      ],
    });

    const cat3 = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Tandoori Breads & Desserts',
        sortOrder: 3,
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          categoryId: cat3.id,
          name: 'Garlic Butter Naan (2 Pcs)',
          description: 'Clay-oven baked leavened bread topped with roasted minced garlic and fresh coriander.',
          price: 99.0,
          imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 8,
          spiceLevel: 0,
        },
        {
          restaurantId: restaurant.id,
          categoryId: cat3.id,
          name: 'Shahi Gulab Jamun with Rabri',
          description: 'Warm melt-in-mouth milk dumplings served in saffron sugar syrup with thickened malai rabri.',
          price: 139.0,
          imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 5,
          spiceLevel: 0,
        },
      ],
    });
  }

  console.log('✅ Restaurant partner ready: partner@delhidarbar.com (Delhi Darbar)');

  // 5. Create promotional coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME50' },
    update: {},
    create: {
      code: 'WELCOME50',
      description: '50% Flat OFF on your first 3 food orders',
      discountType: 'PERCENTAGE',
      discountValue: 50.0,
      minOrderValue: 199.0,
      maxDiscount: 100.0,
      validTill: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FEAST100' },
    update: {},
    create: {
      code: 'FEAST100',
      description: 'Flat ₹100 OFF on orders above ₹399',
      discountType: 'FLAT',
      discountValue: 100.0,
      minOrderValue: 399.0,
      maxDiscount: 100.0,
      validTill: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });
  console.log('✅ Promotional coupons ready: WELCOME50, FEAST100');

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
