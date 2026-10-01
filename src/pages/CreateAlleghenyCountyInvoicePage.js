import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './CreateAlleghenyCountyInvoicePage.css';

const OPERATOR_TYPES = {
  FOR_PROFIT: 'for-profit',
  QUALIFIED_ORGANIZATION: 'qualified-organization',
};

const TAX_RATES = {
  [OPERATOR_TYPES.FOR_PROFIT]: 40,
  [OPERATOR_TYPES.QUALIFIED_ORGANIZATION]: 10,
};

const createRowId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getLocalDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

const createEmptyPacket = () => ({
  id: createRowId(),
  name: '',
  manufacturer: '',
  stickerNumber: '',
  serialNumber: '',
  grossProfit: '',
  productPrice: '',
});

const createInitialFormData = () => ({
  invoiceNumber: '',
  date: getLocalDate(),
  wholesalerName: '',
  wholesalerLicenseNumber: '',
  customerName: '',
  operatorLicenseNumber: '',
  customerLocation: '',
  operatorType: OPERATOR_TYPES.FOR_PROFIT,
  products: [createEmptyPacket()],
  notes: '',
});

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(toAmount(value));

const CreateAlleghenyCountyInvoicePage = () => {
  const [formData, setFormData] = useState(createInitialFormData);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const taxRate = TAX_RATES[formData.operatorType];

  const totals = useMemo(() => {
    const productPrice = formData.products.reduce(
      (sum, packet) => sum + toAmount(packet.productPrice),
      0,
    );
    const grossProfit = formData.products.reduce(
      (sum, packet) => sum + toAmount(packet.grossProfit),
      0,
    );
    const gamingTax = grossProfit * (taxRate / 100);

    return {
      productPrice: roundCurrency(productPrice),
      grossProfit: roundCurrency(grossProfit),
      gamingTax: roundCurrency(gamingTax),
      totalDue: roundCurrency(productPrice + gamingTax),
    };
  }, [formData.products, taxRate]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handlePacketChange = (packetId, field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      products: currentData.products.map((packet) =>
        packet.id === packetId ? { ...packet, [field]: value } : packet,
      ),
    }));
  };

  const handleAddPacket = () => {
    setFormData((currentData) => ({
      ...currentData,
      products: [...currentData.products, createEmptyPacket()],
    }));
  };

  const handleDeletePacket = (packetId) => {
    setFormData((currentData) => ({
      ...currentData,
      products: currentData.products.filter((packet) => packet.id !== packetId),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitStatus('submitting');
    setMessage('');

    const normalizedStickerNumbers = formData.products.map((packet) =>
      packet.stickerNumber.trim().toLocaleUpperCase(),
    );
    const normalizedSerialNumbers = formData.products.map((packet) =>
      packet.serialNumber.trim().toLocaleUpperCase(),
    );
    const hasDuplicateSticker =
      new Set(normalizedStickerNumbers).size !== normalizedStickerNumbers.length;
    const hasDuplicateSerial =
      new Set(normalizedSerialNumbers).size !== normalizedSerialNumbers.length;

    if (hasDuplicateSticker || hasDuplicateSerial) {
      setSubmitStatus('error');
      setMessage(
        'Each packet must have a unique county sticker number and packet serial number.',
      );
      return;
    }

    const normalizedProducts = formData.products.map((packet) => {
      const grossProfit = roundCurrency(toAmount(packet.grossProfit));
      const gamingTax = roundCurrency(grossProfit * (taxRate / 100));

      return {
        ...packet,
        quantity: 1,
        grossProfit,
        productPrice: roundCurrency(toAmount(packet.productPrice)),
        gamingTax,
        // Retained for compatibility with older invoice/PDF code.
        taxableProfit: gamingTax,
      };
    });

    const invoice = {
      ...formData,
      products: normalizedProducts,
      taxRate,
      gamingTaxRate: taxRate,
      totalGrossProfit: totals.grossProfit,
      subTotal: totals.productPrice,
      totalGamingTax: totals.gamingTax,
      total: totals.totalDue,
      // Retained for compatibility; this represents gaming tax, not sales tax.
      salesTax: taxRate,
      createdAt: serverTimestamp(),
      reportingJurisdiction: 'Allegany County, Maryland',
    };

    try {
      await addDoc(collection(db, 'alleghenyInvoices'), invoice);
      setFormData(createInitialFormData());
      setSubmitStatus('success');
      setMessage('Paper gaming invoice created successfully.');
    } catch (error) {
      console.error('Unable to create paper gaming invoice:', error);
      setSubmitStatus('error');
      setMessage('The invoice could not be saved. Please review it and try again.');
    }
  };

  return (
    <main className="create-allegheny-county-invoice-page">
      <header className="page-header">
        <p className="eyebrow">Allegany County paper gaming</p>
        <h1>Create Gaming Invoice</h1>
        <p className="page-introduction">
          Record each paper gaming packet separately so its county sticker and
          manufacturer serial number remain traceable.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="invoice-form">
        {message && (
          <div
            className={submitStatus === 'error' ? 'error-message' : 'success-message'}
            role={submitStatus === 'error' ? 'alert' : 'status'}
          >
            {message}
          </div>
        )}

        <section className="form-section" aria-labelledby="invoice-details-heading">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2 id="invoice-details-heading">Invoice details</h2>
              <p>Identify the transaction and licensed parties.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="invoiceNumber">Invoice number</label>
              <input
                id="invoiceNumber"
                name="invoiceNumber"
                type="text"
                value={formData.invoiceNumber}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Sale date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="wholesalerName">Wholesaler licensee name</label>
              <input
                id="wholesalerName"
                name="wholesalerName"
                type="text"
                value={formData.wholesalerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="wholesalerLicenseNumber">Wholesaler license number</label>
              <input
                id="wholesalerLicenseNumber"
                name="wholesalerLicenseNumber"
                type="text"
                value={formData.wholesalerLicenseNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerName">Paper gaming operator name</label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="operatorLicenseNumber">Operator license number</label>
              <input
                id="operatorLicenseNumber"
                name="operatorLicenseNumber"
                type="text"
                value={formData.operatorLicenseNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group-wide">
              <label htmlFor="customerLocation">Licensed premises / operator address</label>
              <input
                id="customerLocation"
                name="customerLocation"
                type="text"
                value={formData.customerLocation}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group-wide">
              <label htmlFor="operatorType">Operator classification</label>
              <select
                id="operatorType"
                name="operatorType"
                value={formData.operatorType}
                onChange={handleChange}
                required
              >
                <option value={OPERATOR_TYPES.FOR_PROFIT}>
                  For-profit business — 40% gaming tax
                </option>
                <option value={OPERATOR_TYPES.QUALIFIED_ORGANIZATION}>
                  Qualified organization — 10% gaming tax
                </option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section" aria-labelledby="packets-heading">
          <div className="section-heading section-heading-with-action">
            <span>02</span>
            <div>
              <h2 id="packets-heading">Paper gaming packets</h2>
              <p>Use one row per packet; sticker and packet serial numbers must be unique.</p>
            </div>
            <button type="button" className="add-product" onClick={handleAddPacket}>
              Add packet
            </button>
          </div>

          <div className="packet-list">
            {formData.products.map((packet, index) => (
              <fieldset key={packet.id} className="product-group">
                <legend>Packet {index + 1}</legend>

                <div className="form-grid packet-grid">
                  <div className="form-group">
                    <label htmlFor={`name-${packet.id}`}>Game description</label>
                    <input
                      id={`name-${packet.id}`}
                      type="text"
                      value={packet.name}
                      onChange={(event) =>
                        handlePacketChange(packet.id, 'name', event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`manufacturer-${packet.id}`}>Manufacturer</label>
                    <input
                      id={`manufacturer-${packet.id}`}
                      type="text"
                      value={packet.manufacturer}
                      onChange={(event) =>
                        handlePacketChange(packet.id, 'manufacturer', event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`sticker-${packet.id}`}>County gaming sticker number</label>
                    <input
                      id={`sticker-${packet.id}`}
                      type="text"
                      value={packet.stickerNumber}
                      onChange={(event) =>
                        handlePacketChange(packet.id, 'stickerNumber', event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`serial-${packet.id}`}>Packet serial number</label>
                    <input
                      id={`serial-${packet.id}`}
                      type="text"
                      value={packet.serialNumber}
                      onChange={(event) =>
                        handlePacketChange(packet.id, 'serialNumber', event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`gross-profit-${packet.id}`}>Gross profit</label>
                    <div className="currency-input">
                      <span>$</span>
                      <input
                        id={`gross-profit-${packet.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={packet.grossProfit}
                        onChange={(event) =>
                          handlePacketChange(packet.id, 'grossProfit', event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`price-${packet.id}`}>Packet sale price</label>
                    <div className="currency-input">
                      <span>$</span>
                      <input
                        id={`price-${packet.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={packet.productPrice}
                        onChange={(event) =>
                          handlePacketChange(packet.id, 'productPrice', event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="packet-summary">
                  Gaming tax for this packet: {' '}
                  <strong>
                    {formatCurrency(toAmount(packet.grossProfit) * (taxRate / 100))}
                  </strong>
                </div>

                {formData.products.length > 1 && (
                  <button
                    type="button"
                    className="delete-product"
                    onClick={() => handleDeletePacket(packet.id)}
                    aria-label={`Delete packet ${index + 1}`}
                  >
                    Delete packet
                  </button>
                )}
              </fieldset>
            ))}
          </div>
        </section>

        <section className="form-section totals-section" aria-labelledby="totals-heading">
          <div className="section-heading">
            <span>03</span>
            <div>
              <h2 id="totals-heading">Invoice totals</h2>
              <p>Gaming tax is calculated from gross profit, not the packet sale price.</p>
            </div>
          </div>

          <dl className="totals-grid">
            <div>
              <dt>Packet subtotal</dt>
              <dd>{formatCurrency(totals.productPrice)}</dd>
            </div>
            <div>
              <dt>Total gross profit</dt>
              <dd>{formatCurrency(totals.grossProfit)}</dd>
            </div>
            <div>
              <dt>Gaming tax ({taxRate}%)</dt>
              <dd>{formatCurrency(totals.gamingTax)}</dd>
            </div>
            <div className="grand-total">
              <dt>Total amount due</dt>
              <dd>{formatCurrency(totals.totalDue)}</dd>
            </div>
          </dl>

          <div className="form-group notes-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </section>

        <div className="form-actions">
          <Link to="/create-invoice" className="back-button">
            Back to invoice types
          </Link>
          <button
            type="submit"
            className="invoice-button"
            disabled={submitStatus === 'submitting'}
          >
            {submitStatus === 'submitting' ? 'Saving invoice…' : 'Create gaming invoice'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateAlleghenyCountyInvoicePage;
