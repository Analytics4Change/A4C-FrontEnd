import { 
  DosageFormCategory, 
  DosageFormHierarchy,
  DosageFormType,
  DosageFormCategoryMap,
  SolidDosageForm,
  LiquidDosageForm,
  TopicalDosageForm,
  InhalationDosageForm,
  InjectableDosageForm,
  RectalVaginalDosageForm,
  OphthalmicOticDosageForm,
  MiscellaneousDosageForm
} from '@/types/models';

// Solid Dosage Forms with their units
const solidDosageForms: DosageFormType[] = [
  {
    name: 'Tablet' as SolidDosageForm,
    units: ['mg', 'g', 'mcg', 'tablet(s)', 'scored tablet(s)']
  },
  {
    name: 'Caplet' as SolidDosageForm,
    units: ['mg', 'g', 'caplet(s)']
  },
  {
    name: 'Capsule' as SolidDosageForm,
    units: ['mg', 'g', 'capsule(s)', 'mcg']
  },
  {
    name: 'Chewable Tablet' as SolidDosageForm,
    units: ['mg', 'chewable tablet(s)']
  },
  {
    name: 'Orally Disintegrating Tablet (ODT)' as SolidDosageForm,
    units: ['mg', 'ODT(s)']
  },
  {
    name: 'Sublingual Tablet (SL)' as SolidDosageForm,
    units: ['mg', 'SL tablet(s)']
  },
  {
    name: 'Buccal Tablet' as SolidDosageForm,
    units: ['mg', 'buccal tablet(s)']
  }
];

// Liquid Dosage Forms with their units
const liquidDosageForms: DosageFormType[] = [
  {
    name: 'Solution' as LiquidDosageForm,
    units: ['mg/mL', 'mcg/mL', 'mL', 'tsp', 'tbsp', 'drop(s)', 'L']
  },
  {
    name: 'Suspension' as LiquidDosageForm,
    units: ['mg/mL', 'mL', 'tsp', 'tbsp']
  },
  {
    name: 'Syrup' as LiquidDosageForm,
    units: ['mg/mL', 'mL', 'tsp', 'tbsp']
  },
  {
    name: 'Elixir' as LiquidDosageForm,
    units: ['mg/mL', 'mL']
  },
  {
    name: 'Concentrate' as LiquidDosageForm,
    units: ['mg/mL', 'mL']
  }
];

// Topical and Local Application Forms with their units
const topicalDosageForms: DosageFormType[] = [
  {
    name: 'Cream' as TopicalDosageForm,
    units: ['%', 'g', 'application(s)']
  },
  {
    name: 'Ointment' as TopicalDosageForm,
    units: ['%', 'g', 'application(s)']
  },
  {
    name: 'Gel' as TopicalDosageForm,
    units: ['%', 'g', 'application(s)']
  },
  {
    name: 'Lotion' as TopicalDosageForm,
    units: ['%', 'mL', 'application(s)']
  },
  {
    name: 'Patch (Transdermal)' as TopicalDosageForm,
    units: ['mcg/hr', 'mg/day', 'patch(es)']
  },
  {
    name: 'Foam' as TopicalDosageForm,
    units: ['%', 'g', 'mL']
  }
];

// Inhalation and Respiratory Forms with their units
const inhalationDosageForms: DosageFormType[] = [
  {
    name: 'Inhaler (MDI or DPI)' as InhalationDosageForm,
    units: ['puff(s)', 'mcg/puff', 'mg/puff', 'inhalation(s)']
  },
  {
    name: 'Nebulizer Solution' as InhalationDosageForm,
    units: ['mg/mL', 'mL', 'vial(s)', 'ampule(s)']
  },
  {
    name: 'Nasal Spray' as InhalationDosageForm,
    units: ['spray(s)', 'mcg/spray', 'mL', 'bottle(s)']
  }
];

// Injectable Forms with their units
const injectableDosageForms: DosageFormType[] = [
  {
    name: 'Injection (IV, IM, SubQ)' as InjectableDosageForm,
    units: ['mg/mL', 'mL', 'unit(s)', 'vial(s)', 'syringe(s)', 'ampule(s)']
  },
  {
    name: 'Prefilled Syringe' as InjectableDosageForm,
    units: ['mg', 'mL', 'unit(s)']
  }
];

// Rectal and Vaginal Forms with their units
const rectalVaginalDosageForms: DosageFormType[] = [
  {
    name: 'Suppository' as RectalVaginalDosageForm,
    units: ['mg', 'suppository(ies)']
  },
  {
    name: 'Enema' as RectalVaginalDosageForm,
    units: ['mL', 'unit(s)', 'enema(s)']
  },
  {
    name: 'Vaginal Cream or Tablet' as RectalVaginalDosageForm,
    units: ['mg', '%', 'application(s)', 'tablet(s)', 'insert(s)']
  }
];

// Ophthalmic and Otic Forms with their units
const ophthalmicOticDosageForms: DosageFormType[] = [
  {
    name: 'Eye Drops / Ear Drops' as OphthalmicOticDosageForm,
    units: ['drop(s)', 'mL', '%']
  },
  {
    name: 'Ophthalmic Ointment' as OphthalmicOticDosageForm,
    units: ['%', 'g', 'application(s)']
  }
];

// Miscellaneous Forms with their units
const miscellaneousDosageForms: DosageFormType[] = [
  {
    name: 'Lozenge / Troche' as MiscellaneousDosageForm,
    units: ['mg', 'lozenge(s)', 'troche(s)']
  },
  {
    name: 'Powder' as MiscellaneousDosageForm,
    units: ['mg', 'g', 'scoop(s)', 'application(s)']
  },
  {
    name: 'Spray' as MiscellaneousDosageForm,
    units: ['spray(s)', '%']
  },
  {
    name: 'Implant' as MiscellaneousDosageForm,
    units: ['mg', 'implant(s)', 'rod(s)']
  },
  {
    name: 'Lollipop (medicated)' as MiscellaneousDosageForm,
    units: ['mcg', 'lollipop(s)']
  }
];

// Complete hierarchical structure
export const dosageFormHierarchy: DosageFormHierarchy[] = [
  {
    category: 'Solid',
    forms: solidDosageForms
  },
  {
    category: 'Liquid',
    forms: liquidDosageForms
  },
  {
    category: 'Topical/Local',
    forms: topicalDosageForms
  },
  {
    category: 'Inhalation',
    forms: inhalationDosageForms
  },
  {
    category: 'Injectable',
    forms: injectableDosageForms
  },
  {
    category: 'Rectal/Vaginal',
    forms: rectalVaginalDosageForms
  },
  {
    category: 'Ophthalmic/Otic',
    forms: ophthalmicOticDosageForms
  },
  {
    category: 'Miscellaneous',
    forms: miscellaneousDosageForms
  }
];

// Category map for easy lookup
export const dosageFormCategoryMap: DosageFormCategoryMap = {
  'Solid': solidDosageForms,
  'Liquid': liquidDosageForms,
  'Topical/Local': topicalDosageForms,
  'Inhalation': inhalationDosageForms,
  'Injectable': injectableDosageForms,
  'Rectal/Vaginal': rectalVaginalDosageForms,
  'Ophthalmic/Otic': ophthalmicOticDosageForms,
  'Miscellaneous': miscellaneousDosageForms
};

// Helper function to get dosage forms by category
export function getDosageFormsByCategory(category: DosageFormCategory): DosageFormType[] {
  return dosageFormCategoryMap[category] || [];
}

// Helper function to get units for a specific dosage form
export function getUnitsForDosageForm(formName: string): string[] {
  for (const hierarchy of dosageFormHierarchy) {
    const form = hierarchy.forms.find(f => f.name === formName);
    if (form) {
      return form.units;
    }
  }
  return [];
}

// Helper function to get the category for a dosage form
export function getCategoryForDosageForm(formName: string): DosageFormCategory | null {
  for (const hierarchy of dosageFormHierarchy) {
    const form = hierarchy.forms.find(f => f.name === formName);
    if (form) {
      return hierarchy.category;
    }
  }
  return null;
}

// Get all categories
export function getAllCategories(): DosageFormCategory[] {
  return dosageFormHierarchy.map(h => h.category);
}

// Get all dosage forms (flattened)
export function getAllDosageForms(): string[] {
  const forms: string[] = [];
  for (const hierarchy of dosageFormHierarchy) {
    forms.push(...hierarchy.forms.map(f => f.name));
  }
  return forms;
}

// Get all unique units
export function getAllUnits(): string[] {
  const unitsSet = new Set<string>();
  for (const hierarchy of dosageFormHierarchy) {
    for (const form of hierarchy.forms) {
      form.units.forEach(unit => unitsSet.add(unit));
    }
  }
  return Array.from(unitsSet).sort();
}