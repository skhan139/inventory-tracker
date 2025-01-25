import React from 'react';
import './SuppliersPage.css';

const SuppliersPage = () => {
  const suppliers = [
    { name: "Paramount Games", contact: "(800) 282-5766", email: "csteam@paramountgames.us", website: "https://www.paramountgames.us" },
    { name: "Bonanza", contact: "(800) 233-0008", email: "supplier2@example.com", website: "https://www.bonanzapress.com/index.php" },
    { name: "Muncie Novelty", contact: "800-428-8640", email: "info@muncienovelty.com", website: "https://www.muncienovelty.com/cms/" },
    { name: "Marty's Bingo Supply", contact: "(814) 592-2432.", email: "supplier2@example.com", website: "https://www.martysbingo.com" },
    { name: "Coins Unlimited", contact: "987-654-3210", email: "supplier2@example.com", website: "https://www.facebook.com/coinboardmechanicsburg/" },
    { name: "Coin Club International", contact: "987-654-3210", email: "supplier2@example.com", website: "https://www.coinclubinternational.com" },
    // Add more suppliers as needed
  ];

  return (
    <div className="suppliers-page">
      <h1>Suppliers</h1>
      <ul className="supplier-list">
        {suppliers.map((supplier, index) => (
          <li key={index} className="supplier-item">
            <h2>
              <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                {supplier.name}
              </a>
            </h2>
            <p><strong>Contact:</strong> {supplier.contact}</p>
            <p><strong>Email:</strong> {supplier.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuppliersPage;