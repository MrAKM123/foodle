import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Foodle database with demo accounts, restaurants, and full menus...');

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

  // 4. Create Restaurant Partners & Comprehensive Menus
  
  // RESTAURANT 1: Delhi Darbar
  const partner1 = await prisma.user.upsert({
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
    },
  });

  let res1 = await prisma.restaurant.findUnique({
    where: { slug: 'delhi-darbar-royal-mughlai' },
  });

  if (!res1) {
    res1 = await prisma.restaurant.create({
      data: {
        ownerId: partner1.id,
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

    const cat1_1 = await prisma.menuCategory.create({
      data: { restaurantId: res1.id, name: 'Signature Biryanis', sortOrder: 1 },
    });
    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: res1.id,
          categoryId: cat1_1.id,
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
          restaurantId: res1.id,
          categoryId: cat1_1.id,
          name: 'Nawabi Paneer Tikka Dum Biryani',
          description: 'Char-grilled cottage cheese cubes layered with long-grain saffron basmati rice and caramelized onions.',
          price: 299.0,
          imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 15,
          spiceLevel: 1,
        },
        {
          restaurantId: res1.id,
          categoryId: cat1_1.id,
          name: 'Gosht Mutton Dum Biryani (Boneless)',
          description: 'Slow-braised tender goat meat cooked with whole spices, kewra water, and saffron ghee rice.',
          price: 469.0,
          imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80',
          isVeg: false,
          isAvailable: true,
          prepTimeMinutes: 25,
          spiceLevel: 2,
        },
      ],
    });

    const cat1_2 = await prisma.menuCategory.create({
      data: { restaurantId: res1.id, name: 'Main Course Curries', sortOrder: 2 },
    });
    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: res1.id,
          categoryId: cat1_2.id,
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
          restaurantId: res1.id,
          categoryId: cat1_2.id,
          name: 'Dal Makhani Bukhara Style',
          description: 'Black lentils slow-cooked overnight on charcoal with churned butter and Kashmiri chili.',
          price: 269.0,
          imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 10,
          spiceLevel: 1,
        },
        {
          restaurantId: res1.id,
          categoryId: cat1_2.id,
          name: 'Kadai Paneer Masaledar',
          description: 'Fresh paneer tossed with crunchy bell peppers, onions, and freshly pounded coriander seeds.',
          price: 289.0,
          imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 15,
          spiceLevel: 2,
        },
      ],
    });

    const cat1_3 = await prisma.menuCategory.create({
      data: { restaurantId: res1.id, name: 'Breads & Desserts', sortOrder: 3 },
    });
    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: res1.id,
          categoryId: cat1_3.id,
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
          restaurantId: res1.id,
          categoryId: cat1_3.id,
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

  // RESTAURANT 2: Punjab Grill & Tandoor
  const partner2 = await prisma.user.upsert({
    where: { email: 'partner@punjabigrill.com' },
    update: {},
    create: {
      email: 'partner@punjabigrill.com',
      passwordHash: defaultPassword,
      name: 'Harpreet Singh',
      phone: '+91 98111 22334',
      role: 'RESTAURANT',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  let res2 = await prisma.restaurant.findUnique({
    where: { slug: 'punjab-grill-tandoor' },
  });

  if (!res2) {
    res2 = await prisma.restaurant.create({
      data: {
        ownerId: partner2.id,
        name: 'Punjab Grill & Tandoor',
        slug: 'punjab-grill-tandoor',
        description: 'Iconic Punjabi dhaba flavors, sizzling tandoori platters, Sarson ka Saag & Makki Roti.',
        phone: '+91 11 4987 1122',
        email: 'orders@punjabigrill.com',
        address: 'Sector 18 Market, Atta Market',
        city: 'Noida',
        lat: 28.5708,
        lng: 77.3261,
        cuisineTypes: 'North Indian, Punjabi, Tandoor, Kebabs',
        isOpen: true,
        isApproved: true,
        openingTime: '12:00',
        closingTime: '23:00',
        commissionRate: 20.0,
        minOrderAmount: 199.0,
        avgPrepTimeMinutes: 30,
        rating: 4.7,
        ratingCount: 512,
        bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
      },
    });

    const cat2_1 = await prisma.menuCategory.create({
      data: { restaurantId: res2.id, name: 'Tandoori Starters', sortOrder: 1 },
    });
    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: res2.id,
          categoryId: cat2_1.id,
          name: 'Amritsari Bhatti Chicken Tikka',
          description: 'Succulent chicken morsels marinated in spiced mustard oil and roasted over red-hot coals.',
          price: 369.0,
          imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          isVeg: false,
          isAvailable: true,
          prepTimeMinutes: 20,
          spiceLevel: 2,
        },
        {
          restaurantId: res2.id,
          categoryId: cat2_1.id,
          name: 'Dahi Ke Sholay (Crispy Rolls)',
          description: 'Hung curd spiced with green chilies, coriander, and dry roasted cumin encased in crispy bread crust.',
          price: 249.0,
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 15,
          spiceLevel: 1,
        },
      ],
    });
  }

  // RESTAURANT 3: Dakshin Heritage Kitchen (Pure Veg)
  const partner3 = await prisma.user.upsert({
    where: { email: 'partner@dakshin.com' },
    update: {},
    create: {
      email: 'partner@dakshin.com',
      passwordHash: defaultPassword,
      name: 'Ananya Iyer',
      phone: '+91 97222 33445',
      role: 'RESTAURANT',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  let res3 = await prisma.restaurant.findUnique({
    where: { slug: 'dakshin-heritage' },
  });

  if (!res3) {
    res3 = await prisma.restaurant.create({
      data: {
        ownerId: partner3.id,
        name: 'Dakshin Heritage Kitchen',
        slug: 'dakshin-heritage',
        description: 'Authentic South Indian breakfast, crispy Ghee Podi Dosas, steamed Idlis, and Kumbakonam Degree Coffee.',
        phone: '+91 11 4655 8899',
        email: 'orders@dakshin.com',
        address: 'Defence Colony Main Market',
        city: 'New Delhi',
        lat: 28.5724,
        lng: 77.2319,
        cuisineTypes: 'South Indian, Dosas, Pure Veg, Filter Coffee',
        isOpen: true,
        isApproved: true,
        openingTime: '07:30',
        closingTime: '22:30',
        commissionRate: 18.0,
        minOrderAmount: 99.0,
        avgPrepTimeMinutes: 15,
        rating: 4.9,
        ratingCount: 640,
        bannerUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80',
        logoUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80',
      },
    });

    const cat3_1 = await prisma.menuCategory.create({
      data: { restaurantId: res3.id, name: 'Crispy Dosas & Tiffins', sortOrder: 1 },
    });
    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: res3.id,
          categoryId: cat3_1.id,
          name: 'Special Ghee Roast Podi Masala Dosa',
          description: 'Crispy fermented crepe smeared with aromatic spiced gunpowder podi, pure desi ghee, and spiced potato filling.',
          price: 189.0,
          imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 12,
          spiceLevel: 1,
        },
        {
          restaurantId: res3.id,
          categoryId: cat3_1.id,
          name: 'Steamed Ghee Idli Platter (3 Pcs)',
          description: 'Pillow-soft steamed rice cakes topped with melting ghee, served with 3 kinds of traditional chutneys & hot sambar.',
          price: 129.0,
          imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          isVeg: true,
          isAvailable: true,
          prepTimeMinutes: 8,
          spiceLevel: 0,
        },
      ],
    });
  }

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
