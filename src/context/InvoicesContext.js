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

  useEffect(() => {
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
        const querySnapshot = await getDocs(collection(db, "alleghenyCountyInvoices"));
        const invoicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched Allegheny County Invoices:", invoicesData); // Debug log
        setAlleghenyCountyInvoices(invoicesData);
      } catch (error) {
        console.error("Error fetching Allegheny County invoices:", error);
      }
    };

    fetchInvoices();
    fetchAlleghenyCountyInvoices();
  }, []);

  const addInvoice = async (invoice) => {
    try {
      const docRef = await addDoc(collection(db, "invoices"), invoice);
      setInvoices([...invoices, { id: docRef.id, ...invoice }]);
      console.log("Invoice added to Firestore:", invoice);
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  const addAlleghenyCountyInvoice = async (invoice) => {
    try {
      const docRef = await addDoc(collection(db, "alleghenyCountyInvoices"), invoice);
      setAlleghenyCountyInvoices([...alleghenyCountyInvoices, { id: docRef.id, ...invoice }]);
      console.log("Allegheny County Invoice added to Firestore:", invoice);
    } catch (error) {
      console.error("Error adding Allegheny County invoice:", error);
    }
  };

  const updateInvoice = async (id, updatedInvoice) => {
    try {
      const invoiceRef = doc(db, "invoices", id);
      await updateDoc(invoiceRef, updatedInvoice);
      setInvoices(invoices.map(invoice => (invoice.id === id ? { id, ...updatedInvoice } : invoice)));
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await deleteDoc(doc(db, "invoices", id));
      setInvoices(invoices.filter(invoice => invoice.id !== id));
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  return (
    <InvoicesContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice, alleghenyCountyInvoices, addAlleghenyCountyInvoice }}>
      {children}
    </InvoicesContext.Provider>
  );
};