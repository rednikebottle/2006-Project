import { db } from '../config/firebase';

const sampleCenters = [
  {
    name: "Bright Beginnings Daycare",
    address: "123 Main St, City, State 12345",
    capacity: 50,
    rating: 4.5,
    openingHours: "7:00 AM - 6:00 PM",
    description: "A nurturing environment for children to learn and grow.",
    ageRange: {
      min: 0,
      max: 5
    },
    fees: {
      hourly: 15,
      daily: 80,
      monthly: 1200
    }
  },
  {
    name: "Little Learners Academy",
    address: "456 Oak Ave, City, State 12345",
    capacity: 75,
    rating: 4.8,
    openingHours: "6:30 AM - 6:30 PM",
    description: "Focused on early childhood development and education.",
    ageRange: {
      min: 1,
      max: 6
    },
    fees: {
      hourly: 18,
      daily: 90,
      monthly: 1400
    }
  },
  {
    name: "Sunshine Kids Care",
    address: "789 Pine Rd, City, State 12345",
    capacity: 40,
    rating: 4.2,
    openingHours: "7:30 AM - 5:30 PM",
    description: "Creating happy memories in a safe, fun environment.",
    ageRange: {
      min: 0,
      max: 4
    },
    fees: {
      hourly: 12,
      daily: 70,
      monthly: 1000
    }
  }
];

async function seedCenters() {
  try {
    // Clear existing centers
    const snapshot = await db.collection('centers').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Add new centers
    for (const center of sampleCenters) {
      await db.collection('centers').add(center);
    }

    console.log('Successfully seeded centers data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding centers:', error);
    process.exit(1);
  }
}

seedCenters(); 