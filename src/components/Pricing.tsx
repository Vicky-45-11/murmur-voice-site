import { useState } from 'react';
import { PLANS } from '../content';
import SectionHeading from './SectionHeading';

export default function Pricing({ onChoose }: { onChoose: (plan: string) => void }) {
  const [yearly, setYearly] = useState(true);
  return (
    <section className="section pricing-section" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <SectionHeading
          id="pricing-title"
          eyebrow="Pricing"
          title={
            <>
              Start free. <em>Upgrade when it sticks.</em>
            </>
          }
          body="Illustrative pricing for a concept product. Nothing is for sale yet."
        />
        <div className="billing-toggle" role="radiogroup" aria-label="Billing period">
          <button type="button" role="radio" aria-checked={!yearly} className={!yearly ? 'is-active' : ''} onClick={() => setYearly(false)}>
            Monthly
          </button>
          <button type="button" role="radio" aria-checked={yearly} className={yearly ? 'is-active' : ''} onClick={() => setYearly(true)}>
            Yearly <span className="save">save ~20%</span>
          </button>
        </div>
        <ul className="plans">
          {PLANS.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <li key={plan.id} className={`plan ${plan.featured ? 'is-featured' : ''}`}>
                {plan.featured && <span className="plan-flag">Most popular</span>}
                <h3>{plan.name}</h3>
                <p className="plan-blurb">{plan.blurb}</p>
                <p className="plan-price">
                  <span className="amount">${price}</span>
                  <span className="per">{price === 0 ? 'forever' : `per ${plan.perSeat ? 'seat / ' : ''}month${yearly ? ', billed yearly' : ''}`}</span>
                </p>
                <button type="button" className={`btn btn-lg ${plan.featured ? 'btn-primary' : 'btn-outline'}`} onClick={() => onChoose(plan.name)}>
                  {plan.cta}
                </button>
                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
