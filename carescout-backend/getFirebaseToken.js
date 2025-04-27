const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');  // Path to your Firebase service account JSON file

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function getFirebaseToken() {
  // Replace with the UID of an existing Firebase user (you can get it from the Firebase console or create one)
  const uid = '1lTrS86vj2QjjecVf2vX4tfKKPJ3';  // Put the UID of a real Firebase user here

  try {
    // Generate a custom Firebase token for the user
    const customToken = await admin.auth().createCustomToken(uid);
    console.log('Custom Token:', customToken);  // Log the custom token

    // Use this token in Postman (Authorization: Bearer <your_custom_token>)
  } catch (error) {
    console.error('Error creating custom token:', error);
  }
}

getFirebaseToken();
