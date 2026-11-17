import {
  Globe,
  ShoppingCart,
  Smartphone,
  Database,
  Palette,
  Wrench,
} from 'lucide-react';

const services = [
  {
    icon: Globe,
    title: 'Business Websites',
    description:
      'Clean, fast-loading websites that show off your brand and help customers find you.',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Stores',
    description:
      'Online stores with product listings, shopping carts, and secure checkout.',
  },
  {
    icon: Smartphone,
    title: 'Web Applications',
    description:
      'Custom web apps with user accounts, dashboards, and interactive features.',
  },
  {
    icon: Palette,
    title: 'Landing Pages',
    description:
      'Eye-catching landing pages designed to grab attention and drive sign-ups.',
  },
  {
    icon: Database,
    title: 'API & Backend',
    description:
      'Databases, APIs, and server-side logic to power your app behind the scenes.',
  },
  {
    icon: Wrench,
    title: 'Maintenance & Support',
    description:
      'Updates, bug fixes, and tech support for websites you already have running.',
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What I Do
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            From simple landing pages to full web apps, I handle a wide range of
            web development work.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-2xl border border-pink-100 bg-pink-50/50 p-7 transition-all hover:border-pink-300 hover:bg-pink-50 hover:shadow-lg hover:shadow-pink-200/50"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400/20 to-rose-500/20 text-pink-500 transition-transform group-hover:scale-110">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
