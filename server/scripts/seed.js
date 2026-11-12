const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables from server/.env
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

// Import models
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Request = require('../src/models/Request');
const Review = require('../src/models/Review');
const Message = require('../src/models/Message');
const Notification = require('../src/models/Notification');

const seedData = async () => {
  try {
    // Check MongoDB URI
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        'MONGODB_URI is missing. Please check server/.env'
      );
    }

    // Mask password in connection logs
    const maskedUri = mongoUri.replace(
      /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/,
      '$1*****$3'
    );

    console.log(`Connecting to MongoDB at ${maskedUri}...`);

    // Connect to MongoDB Atlas
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000
    });

    console.log('MongoDB connected successfully for seeding.');

    // Clear existing collections
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Request.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    console.log('Previous data cleared.');

    // Prepare Indian college demo users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        name: 'Sanskar Bhanderi',
        email: 'sanskarbhanderi08@gmail.com',
        password: hashedPassword,
        college: 'IISc Bangalore',
        role: 'admin',
        isVerifiedStudent: true,
        reputationScore: 98,
        sustainabilityPoints: 125,
        badges: ['Top Exchange Partner', 'Verified Campus Student', 'Eco Champion'],
        avatar: '🦁'
      },
      {
        name: 'Ananya Sharma',
        email: 'ananya@rvce.edu.in',
        password: hashedPassword,
        college: 'RV College of Engineering (RVCE)',
        role: 'user',
        isVerifiedStudent: true,
        reputationScore: 94,
        sustainabilityPoints: 105,
        badges: ['Eco Champion', 'Verified Campus Student'],
        avatar: '🦊'
      },
      {
        name: 'Rohan Mehta',
        email: 'rohan@pes.edu',
        password: hashedPassword,
        college: 'PES University, Ring Road',
        role: 'user',
        isVerifiedStudent: true,
        reputationScore: 91,
        sustainabilityPoints: 90,
        badges: ['Trusted Seller', 'Verified Campus Student'],
        avatar: '🦉'
      },
      {
        name: 'Pooja Iyer',
        email: 'pooja@bmsce.ac.in',
        password: hashedPassword,
        college: 'BMS College of Engineering (BMSCE)',
        role: 'user',
        isVerifiedStudent: true,
        reputationScore: 89,
        sustainabilityPoints: 85,
        badges: ['Active Campus Member', 'Verified Campus Student'],
        avatar: '🐼'
      },
      {
        name: 'Dev Patel',
        email: 'dev@presidencyuniversity.in',
        password: hashedPassword,
        college: 'Presidency University, Bangalore',
        role: 'user',
        isVerifiedStudent: true,
        reputationScore: 96,
        sustainabilityPoints: 115,
        badges: ['Top Exchange Partner', 'Eco Champion', 'Verified Campus Student'],
        avatar: '🐨'
      }
    ]);

    const [adminUser, ananya, rohan, pooja, dev] = users;

    console.log(`Created ${users.length} demo users.`);

    // Prepare listings with reasonable campus student prices
    const listingsData = [
      {
        title: 'Vintage Oversized Denim Trucker Jacket',
        description: 'Classic 90s vintage Levi’s denim jacket with authentic wash and brass buttons. Worn lightly during fall semester, super comfortable with warm inner lining. Great layering piece.',
        category: 'Clothing',
        price: 18,
        size: 'L',
        condition: 'Like New',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=800&q=80'
        ],
        seller: ananya._id,
        status: 'active'
      },
      {
        title: 'Chunky Knit Wool Turtleneck Sweater',
        description: 'Cozy cream fisherman knit sweater. Made from 100% breathable organic wool blend. Perfect for winter finals season on cold campus mornings. Looking to exchange for oversized fleece hoodie or dark blazer.',
        category: 'Clothing',
        price: 0,
        size: 'M',
        condition: 'Good',
        listingType: 'For Exchange',
        images: [
          'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&w=800&q=80'
        ],
        exchangePreference: 'Looking for a vintage carhartt hoodie or structured wool coat in Size M/L',
        seller: pooja._id,
        status: 'active'
      },
      {
        title: 'Nike Air Force 1 07 Low (Triple White)',
        description: 'Authentic Nike AF1s in clean condition. Soles have minimal wear, cleaned with Crep sneaker protect. Comes with clean laces. Great staple for everyday campus walks.',
        category: 'Shoes',
        price: 24,
        size: 'US 10',
        condition: 'Good',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=800&q=80'
        ],
        seller: rohan._id,
        status: 'active'
      },
      {
        title: 'Doc Martens 1460 Smooth Leather Combat Boots',
        description: 'Iconic 8-eye boots in black smooth leather. Fully broken in so you will not get blisters! Selling only because I bought a platform pair. Well maintained with Wonder Balsam.',
        category: 'Shoes',
        price: 32,
        size: 'US 8',
        condition: 'Like New',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80'
        ],
        seller: ananya._id,
        status: 'active'
      },
      {
        title: 'Fjällräven Kånken Classic Laptop Backpack (Frost Green)',
        description: 'Durable Vinylon F fabric backpack with 15-inch padded laptop compartment. Clean interior, no ink marks. Used for one semester before upgrading.',
        category: 'Bags',
        price: 16,
        size: '16L',
        condition: 'Good',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
        ],
        seller: dev._id,
        status: 'active'
      },
      {
        title: 'Minimalist Full-Grain Brown Leather Tote Bag',
        description: 'Handcrafted genuine leather shoulder bag. Fits 14-inch MacBook, notebooks, and water bottle. Soft patina developing nicely. Willing to exchange for black messenger bag.',
        category: 'Bags',
        price: 0,
        size: 'One Size',
        condition: 'Like New',
        listingType: 'For Exchange',
        images: [
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
        ],
        exchangePreference: 'Open to structured waterproof commuter bags or high-grade tech packs',
        seller: pooja._id,
        status: 'active'
      },
      {
        title: 'Ray-Ban Classic Round Metal Sunglasses (Gold/G-15)',
        description: 'Authentic unisex gold metal frames with classic green crystal lenses. 100% UV protection. Includes leather case and cleaning cloth.',
        category: 'Accessories',
        price: 19,
        size: '50mm',
        condition: 'Like New',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
        ],
        seller: rohan._id,
        status: 'active'
      },
      {
        title: 'Corduroy Cap with Embroidered Botanical Motif',
        description: 'Unstructured 6-panel strapback hat in forest green corduroy. Brass buckle strap closure at back. Never worn, tag still attached.',
        category: 'Accessories',
        price: 7,
        size: 'Adjustable',
        condition: 'New',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
        ],
        seller: dev._id,
        status: 'active'
      },
      {
        title: 'Introduction to Algorithms (CLRS) 4th Edition',
        description: 'Required reading for CS courses. Hardcover copy in pristine condition. No highlighting or bent dog-ears. Essential textbook for campus computer science students.',
        category: 'Books',
        price: 14,
        size: 'Hardcover',
        condition: 'Like New',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
        ],
        seller: dev._id,
        status: 'active'
      },
      {
        title: 'The Design of Everyday Things by Don Norman + Atomic Habits',
        description: 'Two bestselling design and productivity books. Highlighting in first chapter only. Looking to swap for psychology or economics textbooks.',
        category: 'Books',
        price: 0,
        size: 'Paperback',
        condition: 'Good',
        listingType: 'For Exchange',
        images: [
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
        ],
        exchangePreference: 'Looking for behavioral economics or UI/UX case study books',
        seller: ananya._id,
        status: 'active'
      },
      {
        title: 'Patagonia Better Sweater Fleece Quarter-Zip (Oatmeal)',
        description: 'Versatile heathered fleece with soft brushed interior. Moisture-wicking and bluesign approved. Great condition with smooth YKK zipper.',
        category: 'Clothing',
        price: 20,
        size: 'M',
        condition: 'Good',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
        ],
        seller: rohan._id,
        status: 'reserved'
      },
      {
        title: 'Hydro Flask 32oz Wide Mouth with Straw Lid',
        description: 'Double-wall vacuum insulated stainless steel water bottle. Pacific blue color. Minor surface scuffs on bottom, seals tightly without leaks.',
        category: 'Other',
        price: 9,
        size: '32 oz',
        condition: 'Good',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
        ],
        seller: pooja._id,
        status: 'active'
      },
      {
        title: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
        description: 'Top tier active noise cancellation for campus library study sessions. Clean ear cushions and battery lasts over 25 hours. Original carrying case and auxiliary cable included.',
        category: 'Other',
        price: 45,
        size: 'Over-Ear',
        condition: 'Like New',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
        ],
        seller: dev._id,
        status: 'active'
      },
      {
        title: 'High-Waisted Wide Leg Pleated Trousers (Olive Green)',
        description: 'Tailored drape pants with elasticated back waist. Looks great dressed up with boots or casually with sneakers. Worn once for a conference presentation.',
        category: 'Clothing',
        price: 12,
        size: 'S',
        condition: 'Like New',
        listingType: 'For Sale',
        images: [
          'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80'
        ],
        seller: ananya._id,
        status: 'active'
      }
    ];

    const insertedListings = await Listing.insertMany(listingsData);

    console.log(`Created ${insertedListings.length} demo listings.`);

    // Add wishlist items
    ananya.wishlist = [
      insertedListings[2]._id,
      insertedListings[4]._id
    ];

    await ananya.save();

    rohan.wishlist = [insertedListings[0]._id];

    await rohan.save();

    // Find listings
    const patagoniaListing = insertedListings.find(
      listing => listing.title.includes('Patagonia')
    );

    const denimListing = insertedListings.find(
      listing => listing.title.includes('Denim')
    );

    const woolListing = insertedListings.find(
      listing => listing.title.includes('Knit Wool')
    );

    // Create sample requests
    await Request.insertMany([
      {
        listing: patagoniaListing._id,
        buyer: dev._id,
        seller: rohan._id,
        type: 'purchase',
        message: 'Hey Rohan! I can meet you at the central campus library tomorrow afternoon to pick this up.',
        status: 'accepted'
      },
      {
        listing: denimListing._id,
        buyer: rohan._id,
        seller: ananya._id,
        type: 'purchase',
        message: 'Hi Ananya, love this vintage denim piece. Would ₹1,400 work? Can pay in cash or UPI.',
        status: 'pending'
      },
      {
        listing: woolListing._id,
        buyer: ananya._id,
        seller: pooja._id,
        type: 'exchange',
        message: 'Hi Pooja, I have a warm dark blazer in Size M that fits your preference! Would love to trade.',
        status: 'pending'
      }
    ]);

    console.log('Sample requests created successfully.');

    // Create sample reviews
    await Review.insertMany([
      {
        seller: rohan._id,
        buyer: dev._id,
        listing: patagoniaListing._id,
        rating: 5,
        comment: 'Super fast meetup at the campus center! Jacket was exactly as described in pristine condition.',
        tags: ['⚡ Fast Responder', '📦 Item as Described', '🤝 Friendly Meetup']
      },
      {
        seller: ananya._id,
        buyer: pooja._id,
        listing: denimListing._id,
        rating: 5,
        comment: 'Great classmate to trade with! Highly recommended for any campus exchanges.',
        tags: ['💯 Highly Recommended', '⏱️ Punctual', '🌟 Great Condition']
      }
    ]);

    console.log('Sample reviews created.');

    // Create sample messages
    await Message.insertMany([
      {
        sender: dev._id,
        recipient: rohan._id,
        listing: patagoniaListing._id,
        text: 'Hey Rohan! Are you available around 3 PM near the campus canteen?',
        read: true
      },
      {
        sender: rohan._id,
        recipient: dev._id,
        listing: patagoniaListing._id,
        text: 'Yes! 3 PM works perfectly for me. See you near the main entrance.',
        read: false
      }
    ]);

    console.log('Sample campus messages created.');

    // Create sample notifications
    await Notification.insertMany([
      {
        recipient: adminUser._id,
        sender: ananya._id,
        title: 'New campus listing published',
        message: 'Vintage Oversized Denim Trucker Jacket listed for sale.',
        link: '/marketplace',
        type: 'listing',
        read: false
      },
      {
        recipient: dev._id,
        sender: rohan._id,
        title: 'Trade Request Accepted!',
        message: 'Rohan accepted your purchase request for Patagonia Fleece.',
        link: '/my-requests',
        type: 'request',
        read: false
      }
    ]);

    console.log('Sample campus notifications created.');

    console.log('----------------------------------------------------');
    console.log('Seed completed successfully!');
    console.log('Demo Credentials:');
    console.log('Admin: sanskarbhanderi08@gmail.com / password123');
    console.log('User:  ananya@rvce.edu.in / password123');
    console.log('User:  rohan@pes.edu / password123');
    console.log('User:  pooja@bmsce.ac.in / password123');
    console.log('User:  dev@presidencyuniversity.in / password123');
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('Error during database seed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedData();