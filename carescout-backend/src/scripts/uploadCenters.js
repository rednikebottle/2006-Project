const fs = require('fs');
const csv = require('csv-parser');
const admin = require('firebase-admin');
require('dotenv').config();

// Load your Firebase service account key
const serviceAccount = require('../../../chillie-66965-firebase-adminsdk-fbsvc-ddd9b7f8a5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Path to your CSV file
const csvFilePath = '../../../500_Unique_Childcare_Centres_With_Min_Max_Age.csv';

const uploadCenters = async () => {
  const centers = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      centers.push(row);
    })
    .on('end', async () => {
      console.log(`Uploading ${centers.length} centers...`);

      const batch = db.batch();

      centers.forEach((center) => {
        const monthly = parseFloat(center.monthly_fee_others) || 0;
        const daily = Math.round(monthly / 30);
        const hourly = Math.round(daily / 2);

        const centerRef = db.collection('centers').doc();

        batch.set(centerRef, {
          name: center.centre_name || '',
          address: center.centre_address || '',
          ageRange: {
            Min: center.min_age || '',
            Max: Number(center.max_age) || 0,
          },
          capacity: Number(center.capacity) || 0,
          description: center.levels_summary || '',
          fees: {
            monthly: center.monthly_fee_others || '',
            daily: daily.toString(),
            hourly: hourly.toString(),
          },
          openingHours: center.opening_hours || '',
          rating: center.rating || '',
        });
      });

      await batch.commit();
      console.log('Upload complete ✅');
    });
};

uploadCenters();
