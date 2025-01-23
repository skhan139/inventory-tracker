import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const InvoicesContext = createContext();

export const useInvoices = () => {
  return useContext(InvoicesContext);
};

export const InvoicesProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "invoices"));
        const invoicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched invoices:", invoicesData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  const addInvoice = async (invoice) => {
    try {
      const docRef = await addDoc(collection(db, "invoices"), invoice);
      console.log("Added invoice:", { id: docRef.id, ...invoice });
      setInvoices([...invoices, { id: docRef.id, ...invoice }]);
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  const updateInvoice = async (id, updatedInvoice) => {
    try {
      const invoiceRef = doc(db, "invoices", id);
      await updateDoc(invoiceRef, updatedInvoice);
      console.log("Updated invoice:", { id, ...updatedInvoice });
      setInvoices(invoices.map(invoice => (invoice.id === id ? { id, ...updatedInvoice } : invoice)));
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await deleteDoc(doc(db, "invoices", id));
      console.log("Deleted invoice:", id);
      setInvoices(invoices.filter(invoice => invoice.id !== id));
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  return (
    <InvoicesContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice }}>
      {children}
    </InvoicesContext.Provider>
  );
};