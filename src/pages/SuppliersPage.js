import React from 'react';
import './SuppliersPage.css';

const SuppliersPage = () => {
  const suppliers = [
    { name: "Paramount Games", contact: "123-456-7890", email: "supplier1@example.com" },
    { name: "Bonanza", contact: "987-654-3210", email: "supplier2@example.com" },
    { name: "Muncie Novelty", contact: "987-654-3210", email: "supplier2@example.com" },
    { name: "Marty's Bingo Supply", contact: "987-654-3210", email: "supplier2@example.com" },
    { name: "Coins Unlimited", contact: "987-654-3210", email: "supplier2@example.com" },
    { name: "Coin Club International", contact: "987-654-3210", email: "supplier2@example.com" },
    // Add more suppliers as needed
  ];

  return (
    <div className="suppliers-page">
      <h1>Suppliers</h1>
      <ul className="supplier-list">
        {suppliers.map((supplier, index) => (
          <li key={index} className="supplier-item">
            <h2>{supplier.name}</h2>
            <p><strong>Contact:</strong> {supplier.contact}</p>
            <p><strong>Email:</strong> {supplier.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuppliersPage;