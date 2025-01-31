// uploadProducts.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const products = require('./src/Products.js'); // Ensure the correct path and file extension
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uploadProducts = async () => {
  const productsCollection = collection(db, 'products');

  for (const product of products) {
    try {
      await addDoc(productsCollection, product);
      console.log(`Uploaded product: ${product.name}`);
    } catch (error) {
      console.error(`Error uploading product: ${product.name}`, error);
    }
  }
};

uploadProducts().then(() => {
  console.log('All products uploaded successfully');
}).catch((error) => {
  console.error('Error uploading products', error);
});