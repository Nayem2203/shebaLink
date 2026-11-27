import type { ServiceCategory, ServiceGroup } from '@/types';

export const SERVICE_GROUP_META: Record<
  ServiceGroup,
  { label: string; description: string }
> = {
  'home-repair': {
    label: 'Home Repair & Maintenance',
    description:
      'Licensed technicians for electrical wiring, plumbing, AC servicing, appliances, carpentry, and painting.',
  },
  'cleaning-household': {
    label: 'Cleaning & Household',
    description:
      'Deep home cleaning, pest control, water tank sanitization, and laundry care for homes and offices.',
  },
  'delivery-moving': {
    label: 'Delivery & Moving',
    description:
      'Local parcel couriers, grocery drops, full home shifting, and urgent roadside assistance.',
  },
};

export const INITIAL_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-electrician',
    name: 'Electrician',
    slug: 'electrician',
    group: 'home-repair',
    description:
      'Switchboard repairs, IPS & inverter wiring, ceiling fan installation, circuit breaker faults, and house rewiring.',
    icon: 'Zap',
    image: '/images/categories/electrician.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-plumber',
    name: 'Plumber',
    slug: 'plumber',
    group: 'home-repair',
    description:
      'Pipe leak fixes, water motor installation, kitchen sink unclogging, overhead tank lines, and tap replacements.',
    icon: 'Droplets',
    image: '/images/categories/plumber.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-ac-repair',
    name: 'AC Repair & Servicing',
    slug: 'ac-repair',
    group: 'home-repair',
    description:
      'Split & window AC master wash, gas refilling, compressor diagnostics, and seasonal maintenance.',
    icon: 'Wind',
    image: '/images/categories/ac-repair.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-home-cleaning',
    name: 'Home Cleaning',
    slug: 'home-cleaning',
    group: 'cleaning-household',
    description:
      'Full apartment deep cleaning, kitchen degreasing, bathroom descaling, and sofa/mattress vacuuming.',
    icon: 'Home',
    image: '/images/categories/home-cleaning.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-painter',
    name: 'Painter',
    slug: 'painter',
    group: 'home-repair',
    description:
      'Interior and exterior wall painting, dampness treatment, putty smoothing, and weather-coat finishing.',
    icon: 'Paintbrush',
    image: '/images/categories/painter.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-carpenter',
    name: 'Carpenter',
    slug: 'carpenter',
    group: 'home-repair',
    description:
      'Door lock fitting, wardrobe hinge repair, wooden furniture assembly, shelving, and custom woodwork.',
    icon: 'Hammer',
    image: '/images/categories/carpenter.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-pest-control',
    name: 'Pest Control',
    slug: 'pest-control',
    group: 'cleaning-household',
    description:
      'Safe gel & spray treatment for cockroaches, termites, bedbugs, mosquitoes, and rodents.',
    icon: 'Bug',
    image: '/images/categories/pest-control.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-home-shifting',
    name: 'Home Shifting',
    slug: 'home-shifting',
    group: 'delivery-moving',
    description:
      'Covered pickup van rental, careful furniture wrapping, loading crew, and apartment-to-apartment shifting.',
    icon: 'Truck',
    image: '/images/categories/home-shifting.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-refrigerator-repair',
    name: 'Refrigerator Repair',
    slug: 'refrigerator-repair',
    group: 'home-repair',
    description:
      'Cooling loss troubleshooting, thermostat replacement, compressor servicing, and door gasket sealing.',
    icon: 'ThermometerSnowflake',
    image: '/images/categories/refrigerator-repair.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-washing-machine-repair',
    name: 'Washing Machine Repair',
    slug: 'washing-machine-repair',
    group: 'home-repair',
    description:
      'Front-load and top-load drum servicing, drain pump clearing, PCB diagnostics, and spin motor fixes.',
    icon: 'WashingMachine',
    image: '/images/categories/washing-machine-repair.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-bathroom-fittings',
    name: 'Bathroom Fittings & Sanitary Repair',
    slug: 'bathroom-fittings',
    group: 'home-repair',
    description:
      'Commode & flush tank repair, geyser mounting, shower mixer installation, and basin drainage sealing.',
    icon: 'Pipette',
    image: '/images/categories/bathroom-fittings.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-laundry-ironing',
    name: 'Laundry & Ironing',
    slug: 'laundry-ironing',
    group: 'cleaning-household',
    description:
      'Doorstep pickup wash, steam ironing, curtain & blanket cleaning, and delicate fabric care.',
    icon: 'Shirt',
    image: '/images/categories/laundry-ironing.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-water-tank-cleaning',
    name: 'Water Tank Cleaning',
    slug: 'water-tank-cleaning',
    group: 'cleaning-household',
    description:
      'Mechanized sludge dewatering, high-pressure scrubbing, and food-grade antibacterial tank sanitization.',
    icon: 'Container',
    image: '/images/categories/water-tank-cleaning.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-parcel-delivery',
    name: 'Parcel Delivery',
    slug: 'parcel-delivery',
    group: 'delivery-moving',
    description:
      'Same-day city document & package pickup with verified rider handoff across Rajshahi and major hubs.',
    icon: 'Package',
    image: '/images/categories/parcel-delivery.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-grocery-delivery',
    name: 'Grocery Delivery',
    slug: 'grocery-delivery',
    group: 'delivery-moving',
    description:
      'Scheduled bazar runs, fresh produce sourcing, and pharmacy pickup delivered directly to your door.',
    icon: 'ShoppingBag',
    image: '/images/categories/grocery-delivery.svg',
    active: true,
    parentId: null,
  },
  {
    id: 'cat-roadside-assistance',
    name: 'Emergency Roadside Assistance',
    slug: 'roadside-assistance',
    group: 'delivery-moving',
    description:
      'On-spot battery jump-start, flat tire change, motorbike puncture repair, and emergency tow coordination.',
    icon: 'Wrench',
    image: '/images/categories/roadside-assistance.svg',
    active: true,
    parentId: null,
  },
];
