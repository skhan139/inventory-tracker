import React, { useEffect, useState } from 'react';
import { useInvoices } from '../context/InvoicesContext';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './RevenuePage.css';

const RevenuePage = () => {
  const { invoices } = useInvoices();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTaxRevenue, setTotalTaxRevenue] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);
  const [selectedGraph, setSelectedGraph] = useState('weekly');
  const [graphData, setGraphData] = useState({ labels: [], totalData: [], grossData: [], taxData: [] });

  useEffect(() => {
    const calculateRevenue = () => {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      let total = 0;
      let totalTax = 0;

      invoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.date);
        const invoiceTotal = invoice.totalPrice || 0;
        const taxAmount = (invoice.tax / 100) * invoiceTotal;

        total += invoiceTotal;
        totalTax += taxAmount;
      });

      setTotalRevenue(total);
      setTotalTaxRevenue(totalTax);
      setGrossProfit(total - totalTax);
    };

    calculateRevenue();
  }, [invoices]);

  useEffect(() => {
    const generateGraphData = () => {
      const now = new Date();
      const labels = [];
      const totalData = [];
      const grossData = [];
      const taxData = [];

      if (selectedGraph === 'weekly') {
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          labels.unshift(date.toLocaleDateString());

          const dailyTotal = invoices
            .filter(invoice => new Date(invoice.date).toLocaleDateString() === date.toLocaleDateString())
            .reduce((sum, invoice) => sum + (invoice.totalPrice || 0), 0);
          const dailyTax = invoices
            .filter(invoice => new Date(invoice.date).toLocaleDateString() === date.toLocaleDateString())
            .reduce((sum, invoice) => sum + ((invoice.tax / 100) * (invoice.totalPrice || 0)), 0);

          totalData.unshift(dailyTotal);
          grossData.unshift(dailyTotal - dailyTax);
          taxData.unshift(dailyTax);
        }
      } else if (selectedGraph === 'monthly') {
        for (let i = 0; i < 4; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - i * 7);
          labels.unshift(`Week ${4 - i}`);

          const weeklyTotal = invoices
            .filter(invoice => {
              const invoiceDate = new Date(invoice.date);
              return invoiceDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * 7) &&
                     invoiceDate < new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
            })
            .reduce((sum, invoice) => sum + (invoice.totalPrice || 0), 0);
          const weeklyTax = invoices
            .filter(invoice => {
              const invoiceDate = new Date(invoice.date);
              return invoiceDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * 7) &&
                     invoiceDate < new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
            })
            .reduce((sum, invoice) => sum + ((invoice.tax / 100) * (invoice.totalPrice || 0)), 0);

          totalData.unshift(weeklyTotal);
          grossData.unshift(weeklyTotal - weeklyTax);
          taxData.unshift(weeklyTax);
        }
      } else if (selectedGraph === 'quarterly') {
        for (let i = 0; i < 3; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          labels.unshift(date.toLocaleString('default', { month: 'short' }));

          const monthlyTotal = invoices
            .filter(invoice => {
              const invoiceDate = new Date(invoice.date);
              return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, invoice) => sum + (invoice.totalPrice || 0), 0);
          const monthlyTax = invoices
            .filter(invoice => {
              const invoiceDate = new Date(invoice.date);
              return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, invoice) => sum + ((invoice.tax / 100) * (invoice.totalPrice || 0)), 0);

          totalData.unshift(monthlyTotal);
          grossData.unshift(monthlyTotal - monthlyTax);
          taxData.unshift(monthlyTax);
        }
      } else if (selectedGraph === 'yearly') {
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          labels.unshift(date.toLocaleString('default', { month: 'short' }));

          const monthlyTotal = invoices
            .filter(invoice => {
              const invoiceDate = new Date(invoice.date);
              return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, invoice) => sum + (invoice.totalPrice || 0), 0);
          const monthlyTax = invoices
            .filter(invoice => {
              const invoiceDate = new Date(invoice.date);
              return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, invoice) => sum + ((invoice.tax / 100) * (invoice.totalPrice || 0)), 0);

          totalData.unshift(monthlyTotal);
          grossData.unshift(monthlyTotal - monthlyTax);
          taxData.unshift(monthlyTax);
        }
      }

      setGraphData({ labels, totalData, grossData, taxData });
    };

    generateGraphData();
  }, [selectedGraph, invoices]);

  const handleGraphChange = (e) => {
    setSelectedGraph(e.target.value);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
  };

  return (
    <div className="revenue-page">
      <div className="highlight-container">
        <button className="highlight">Revenue Statistics</button>
        <button className="highlight">Total Revenue: {formatNumber(totalRevenue)}</button>
        <button className="highlight">Total Tax Revenue: {formatNumber(totalTaxRevenue)}</button>
        <button className="highlight">Gross Profit: {formatNumber(grossProfit)}</button>
      </div>
      <div className="graph-selector">
        <label htmlFor="graphType">Select Graph Type: </label>
        <select id="graphType" value={selectedGraph} onChange={handleGraphChange}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <Line
        data={{
          labels: graphData.labels,
          datasets: [
            {
              label: 'Total Revenue',
              data: graphData.totalData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            },
            {
              label: 'Gross Profit',
              data: graphData.grossData,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
            },
            {
              label: 'Tax Revenue',
              data: graphData.taxData,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true,
            },
          ],
        }}
      />
    </div>
  );
};

export default RevenuePage;