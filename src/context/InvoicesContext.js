import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const InvoicesContext = createContext();

export const useInvoices = () => {
  return useContext(InvoicesContext);
};

export const InvoicesProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [alleghenyCountyInvoices, setAlleghenyCountyInvoices] = useState([]);

  const fetchInvoices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "invoices"));
      const invoicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched Standard Invoices:", invoicesData); // Debug log
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchAlleghenyCountyInvoices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "alleghenyInvoices"));
      const invoicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched Allegheny County Invoices:", invoicesData); // Debug log
      setAlleghenyCountyInvoices(invoicesData);
    } catch (error) {
      console.error("Error fetching Allegheny County invoices:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchAlleghenyCountyInvoices();
  }, []);

  const addInvoice = async (invoice, isAllegheny = false) => {
    try {
      const collectionName = isAllegheny ? "alleghenyInvoices" : "invoices";
      const docRef = await addDoc(collection(db, collectionName), invoice);
      if (isAllegheny) {
        setAlleghenyCountyInvoices([...alleghenyCountyInvoices, { id: docRef.id, ...invoice }]);
      } else {
        setInvoices([...invoices, { id: docRef.id, ...invoice }]);
      }
      console.log(`${isAllegheny ? "Allegheny Invoice" : "Invoice"} added to Firestore:`, invoice);
    } catch (error) {
      console.error(`Error adding ${isAllegheny ? "Allegheny invoice" : "invoice"}:`, error);
    }
  };

  const updateInvoice = async (id, updatedInvoice, isAllegheny = false) => {
    try {
      const collectionName = isAllegheny ? "alleghenyInvoices" : "invoices";
      const invoiceRef = doc(db, collectionName, id);
      await updateDoc(invoiceRef, updatedInvoice);
      if (isAllegheny) {
        setAlleghenyCountyInvoices(alleghenyCountyInvoices.map(invoice => (invoice.id === id ? { id, ...updatedInvoice } : invoice)));
      } else {
        setInvoices(invoices.map(invoice => (invoice.id === id ? { id, ...updatedInvoice } : invoice)));
      }
      console.log(`${isAllegheny ? "Allegheny Invoice" : "Invoice"} with ID ${id} updated:`, updatedInvoice);
    } catch (error) {
      console.error(`Error updating ${isAllegheny ? "Allegheny invoice" : "invoice"}:`, error);
    }
  };

  const deleteInvoice = async (id, isAllegheny = false) => {
    try {
      const collectionName = isAllegheny ? "alleghenyInvoices" : "invoices";
      console.log(`Attempting to delete ${isAllegheny ? "Allegheny invoice" : "invoice"} with ID: ${id} from collection: ${collectionName}`);
      await deleteDoc(doc(db, collectionName, id));
      if (isAllegheny) {
        setAlleghenyCountyInvoices(alleghenyCountyInvoices.filter(invoice => invoice.id !== id));
      } else {
        setInvoices(invoices.filter(invoice => invoice.id !== id));
      }
      console.log(`${isAllegheny ? "Allegheny Invoice" : "Invoice"} with ID ${id} deleted.`);
    } catch (error) {
      console.error(`Error deleting ${isAllegheny ? "Allegheny invoice" : "invoice"}:`, error);
    }
  };

  return (
    <InvoicesContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice, alleghenyCountyInvoices, fetchInvoices }}>
      {children}
    </InvoicesContext.Provider>
  );
};