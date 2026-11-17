import type { PricingPlan } from '@/lib/supabase';

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 50,
    tagline: 'Great for personal pages and simple projects',
    features: [
      'Up to 3 pages',
      'Responsive mobile design',
      'Contact form',
      'Basic SEO setup',
      '1 round of revisions',
      '5-day delivery',
    ],
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 150,
    tagline: 'Perfect for small businesses',
    popular: true,
    features: [
      'Up to 8 pages',
      'Custom design',
      'Contact form + social links',
      'SEO optimization',
      '3 rounds of revisions',
      '10-day delivery',
      '14 days post-launch support',
    ],
    cta: 'Get Started',
  },
  {
    id: 'enterprise',
    name: 'Big Project',
    price: 300,
    tagline: 'For larger companies and complex builds',
    features: [
      'Up to 20 pages',
      'Full custom web app',
      'Database & user accounts',
      'E-commerce integration',
      'Unlimited revisions for 14 days',
      '30 days post-launch support',
    ],
    cta: 'Get a Quote',
  },
];

export const projectTypes = [
  { value: 'website', label: 'Business Website' },
  { value: 'web-app', label: 'Web Application' },
  { value: 'ecommerce', label: 'E-Commerce Store' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'other', label: 'Other' },
] as const;

export const budgetRanges = [
  'Under $50',
  '$50 - $150',
  '$150 - $300',
  '$300 - $500',
  '$500+',
];

export const timelineOptions = [
  'ASAP (Rush)',
  '1-2 weeks',
  '1 month',
  '2-3 months',
  'Flexible',
];
