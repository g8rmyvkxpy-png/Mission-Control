import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 4900, // $49.00
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      '5 AI Agents',
      '1,000 tasks/month',
      '3 Workflows',
      'Email Support'
    ]
  },
  growth: {
    name: 'Growth',
    price: 14900, // $149.00
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    features: [
      '20 AI Agents',
      'Unlimited tasks',
      '10 Workflows',
      'Priority Support',
      'API Access'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 0, // Custom pricing
    priceId: undefined,
    features: [
      'Unlimited Agents',
      'Unlimited Tasks',
      'Unlimited Workflows',
      '24/7 Support',
      'Custom Integrations',
      'Dedicated Instance'
    ]
  }
};

export async function createCheckoutSession(customerId: string, priceId: string, successUrl: string) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`
  });
  
  return session;
}

export async function createCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'mission-control'
    }
  });
  
  return customer;
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}

export default stripe;
