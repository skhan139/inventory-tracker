// src/services/invoiceService.js
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const fetchInvoices = async () => {
  const invoicesCollection = collection(db, 'invoices');
  const invoiceSnapshot = await getDocs(invoicesCollection);
  const invoiceList = invoiceSnapshot.docs.map(doc => ({
    id: doc.id, // Include the ID
    ...doc.data() // Spread the rest of the document data
  }));
  return invoiceList;
};

export { fetchInvoices };