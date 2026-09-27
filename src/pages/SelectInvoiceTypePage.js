import React from 'react';
import { Link } from 'react-router-dom';
import './SelectInvoiceTypePage.css';

const invoiceTypes = [
  {
    title: 'Allegheny County',
    description:
      'Create an invoice with fields for county-specific serial and sticker numbers.',
    route: '/create-invoice/allegheny-county',
    label: 'County invoice',
    number: '01',
  },
  {
    title: 'Standard Invoice',
    description:
      'Create a standard customer invoice with products, taxes, and discounts.',
    route: '/create-invoice/standard',
    label: 'General invoice',
    number: '02',
  },
];

const ruleGroups = [
  {
    title: 'Bars and Restaurants',
    tag: 'WV',
    rules: [
      '20% standard tax for West Virginia customers, plus 6% raffle tax.',
      'Merchandise such as boards is not taxed; all other applicable items are taxed.',
      'Every applicable item must include a serial number on the invoice.',
    ],
  },
  {
    title: 'West Virginia',
    tag: '20% tax',
    rules: [
      'Apply 20% tax to all taxable items.',
      'Every game must have its serial number recorded on the invoice.',
      'Merchandise items such as boards are not taxed.',
    ],
  },
  {
    title: 'Allegheny County',
    tag: 'Serial + sticker',
    rules: [
      'Every game must include both a serial number and a sticker number.',
    ],
  },
  {
    title: 'Garrett County',
    tag: 'Tax exempt',
    rules: [
      'Do not apply taxes.',
      'Serial numbers are not required.',
    ],
  },
];

const SelectInvoiceTypePage = () => {
  return (
    <main className="select-invoice-type-page">
      <div className="select-page-glow select-page-glow--one" />
      <div className="select-page-glow select-page-glow--two" />

      <section className="invoice-type-hero">
        <p className="section-eyebrow">Invoice workspace</p>
        <h1>Select an invoice type</h1>
        <p className="hero-description">
          Choose the format that matches the customer’s location and
          requirements.
        </p>

        <div className="button-container">
          {invoiceTypes.map((invoiceType) => (
            <Link
              key={invoiceType.route}
              to={invoiceType.route}
              className="invoice-type-card"
            >
              <div className="invoice-type-card__top">
                <span className="invoice-type-number">
                  {invoiceType.number}
                </span>
                <span className="invoice-type-label">
                  {invoiceType.label}
                </span>
              </div>

              <div className="invoice-type-card__content">
                <h2>{invoiceType.title}</h2>
                <p>{invoiceType.description}</p>
              </div>

              <div className="invoice-type-card__action">
                <span>Create invoice</span>
                <span className="invoice-type-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rules-section" aria-labelledby="rules-heading">
        <div className="rules-heading">
          <div>
            <p className="section-eyebrow">Quick reference</p>
            <h2 id="rules-heading">Rules, regulations, and taxes</h2>
          </div>

          <p>
            Review the applicable requirements before creating an invoice.
          </p>
        </div>

        <div className="rules-container">
          {ruleGroups.map((group) => (
            <article className="rule" key={group.title}>
              <div className="rule__header">
                <span className="rule__icon" aria-hidden="true">
                  ✓
                </span>
                <span className="rule__tag">{group.tag}</span>
              </div>

              <h3>{group.title}</h3>

              <ul>
                {group.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="rules-disclaimer">
          Confirm unusual or unclear tax situations with an administrator
          before finalizing an invoice.
        </p>
      </section>
    </main>
  );
};

export default SelectInvoiceTypePage;