/**
 * Medication-related constants
 */

export const dosageFormCategories = [
  'Solid',
  'Liquid',
  'Semi-Solid',
  'Gaseous',
  'Other'
];

export const dosageFormsByCategory: Record<string, string[]> = {
  'Solid': [
    'Tablet',
    'Capsule',
    'Chewable Tablet',
    'Orally Disintegrating Tablet (ODT)',
    'Extended Release Tablet',
    'Sublingual Tablet (SL)',
    'Buccal Tablet',
    'Powder',
    'Granules'
  ],
  'Liquid': [
    'Solution',
    'Suspension',
    'Syrup',
    'Elixir',
    'Drops',
    'Injection',
    'Infusion'
  ],
  'Semi-Solid': [
    'Cream',
    'Ointment',
    'Gel',
    'Paste',
    'Lotion',
    'Suppository'
  ],
  'Gaseous': [
    'Inhaler',
    'Nebulizer Solution',
    'Aerosol',
    'Gas'
  ],
  'Other': [
    'Patch',
    'Implant',
    'Device',
    'Kit'
  ]
};

export const dosageUnitsByCategory: Record<string, string[]> = {
  'Solid': ['mg', 'g', 'mcg', 'units', 'IU'],
  'Liquid': ['ml', 'L', 'drops', 'tsp', 'tbsp'],
  'Semi-Solid': ['g', 'mg', '%', 'applications'],
  'Gaseous': ['puffs', 'inhalations', 'L/min'],
  'Other': ['patch', 'device', 'kit', 'each']
};

export const dosageFrequencies = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed (PRN)',
  'Once weekly',
  'Twice weekly',
  'Three times weekly',
  'Every other day',
  'Monthly'
];

export const dosageConditions = [
  'With food',
  'Without food',
  'Before meals',
  'After meals',
  'At bedtime',
  'In the morning',
  'In the evening',
  'Empty stomach',
  '30 minutes before meals',
  '1 hour after meals'
];