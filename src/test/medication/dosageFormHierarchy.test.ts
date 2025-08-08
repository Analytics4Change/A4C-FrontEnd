import { describe, it, expect } from 'vitest';
import {
  dosageFormHierarchy,
  dosageFormCategoryMap,
  getDosageFormsByCategory,
  getUnitsForDosageForm,
  getCategoryForDosageForm,
  getAllCategories,
  getAllDosageForms,
  getAllUnits
} from '@/mocks/data/dosageFormHierarchy.mock';

describe('Dosage Form Hierarchy', () => {
  describe('Structure', () => {
    it('should have 8 dosage form categories', () => {
      expect(dosageFormHierarchy).toHaveLength(8);
      expect(getAllCategories()).toHaveLength(8);
    });

    it('should have the correct categories', () => {
      const categories = getAllCategories();
      expect(categories).toContain('Solid');
      expect(categories).toContain('Liquid');
      expect(categories).toContain('Topical/Local');
      expect(categories).toContain('Inhalation');
      expect(categories).toContain('Injectable');
      expect(categories).toContain('Rectal/Vaginal');
      expect(categories).toContain('Ophthalmic/Otic');
      expect(categories).toContain('Miscellaneous');
    });

    it('should have form types for each category', () => {
      dosageFormHierarchy.forEach(hierarchy => {
        expect(hierarchy.forms.length).toBeGreaterThan(0);
      });
    });

    it('should have units for each form type', () => {
      dosageFormHierarchy.forEach(hierarchy => {
        hierarchy.forms.forEach(form => {
          expect(form.units.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Solid Dosage Forms', () => {
    it('should have correct solid dosage forms', () => {
      const solidForms = getDosageFormsByCategory('Solid');
      const formNames = solidForms.map(f => f.name);
      
      expect(formNames).toContain('Tablet');
      expect(formNames).toContain('Caplet');
      expect(formNames).toContain('Capsule');
      expect(formNames).toContain('Chewable Tablet');
      expect(formNames).toContain('Orally Disintegrating Tablet (ODT)');
      expect(formNames).toContain('Sublingual Tablet (SL)');
      expect(formNames).toContain('Buccal Tablet');
    });

    it('should have correct units for Tablet', () => {
      const units = getUnitsForDosageForm('Tablet');
      expect(units).toContain('mg');
      expect(units).toContain('g');
      expect(units).toContain('mcg');
      expect(units).toContain('tablet(s)');
      expect(units).toContain('scored tablet(s)');
    });

    it('should have correct units for Capsule', () => {
      const units = getUnitsForDosageForm('Capsule');
      expect(units).toContain('mg');
      expect(units).toContain('g');
      expect(units).toContain('capsule(s)');
      expect(units).toContain('mcg');
    });
  });

  describe('Liquid Dosage Forms', () => {
    it('should have correct liquid dosage forms', () => {
      const liquidForms = getDosageFormsByCategory('Liquid');
      const formNames = liquidForms.map(f => f.name);
      
      expect(formNames).toContain('Solution');
      expect(formNames).toContain('Suspension');
      expect(formNames).toContain('Syrup');
      expect(formNames).toContain('Elixir');
      expect(formNames).toContain('Concentrate');
    });

    it('should have correct units for Solution', () => {
      const units = getUnitsForDosageForm('Solution');
      expect(units).toContain('mg/mL');
      expect(units).toContain('mcg/mL');
      expect(units).toContain('mL');
      expect(units).toContain('tsp');
      expect(units).toContain('tbsp');
      expect(units).toContain('drop(s)');
      expect(units).toContain('L');
    });
  });

  describe('Topical/Local Dosage Forms', () => {
    it('should have correct topical forms', () => {
      const topicalForms = getDosageFormsByCategory('Topical/Local');
      const formNames = topicalForms.map(f => f.name);
      
      expect(formNames).toContain('Cream');
      expect(formNames).toContain('Ointment');
      expect(formNames).toContain('Gel');
      expect(formNames).toContain('Lotion');
      expect(formNames).toContain('Patch (Transdermal)');
      expect(formNames).toContain('Foam');
    });

    it('should have correct units for Patch (Transdermal)', () => {
      const units = getUnitsForDosageForm('Patch (Transdermal)');
      expect(units).toContain('mcg/hr');
      expect(units).toContain('mg/day');
      expect(units).toContain('patch(es)');
    });
  });

  describe('Inhalation Dosage Forms', () => {
    it('should have correct inhalation forms', () => {
      const inhalationForms = getDosageFormsByCategory('Inhalation');
      const formNames = inhalationForms.map(f => f.name);
      
      expect(formNames).toContain('Inhaler (MDI or DPI)');
      expect(formNames).toContain('Nebulizer Solution');
      expect(formNames).toContain('Nasal Spray');
    });

    it('should have correct units for Inhaler', () => {
      const units = getUnitsForDosageForm('Inhaler (MDI or DPI)');
      expect(units).toContain('puff(s)');
      expect(units).toContain('mcg/puff');
      expect(units).toContain('mg/puff');
      expect(units).toContain('inhalation(s)');
    });
  });

  describe('Injectable Dosage Forms', () => {
    it('should have correct injectable forms', () => {
      const injectableForms = getDosageFormsByCategory('Injectable');
      const formNames = injectableForms.map(f => f.name);
      
      expect(formNames).toContain('Injection (IV, IM, SubQ)');
      expect(formNames).toContain('Prefilled Syringe');
    });

    it('should have correct units for Injection', () => {
      const units = getUnitsForDosageForm('Injection (IV, IM, SubQ)');
      expect(units).toContain('mg/mL');
      expect(units).toContain('mL');
      expect(units).toContain('unit(s)');
      expect(units).toContain('vial(s)');
      expect(units).toContain('syringe(s)');
      expect(units).toContain('ampule(s)');
    });
  });

  describe('Helper Functions', () => {
    it('should get category for a dosage form', () => {
      expect(getCategoryForDosageForm('Tablet')).toBe('Solid');
      expect(getCategoryForDosageForm('Solution')).toBe('Liquid');
      expect(getCategoryForDosageForm('Cream')).toBe('Topical/Local');
      expect(getCategoryForDosageForm('Inhaler (MDI or DPI)')).toBe('Inhalation');
      expect(getCategoryForDosageForm('Suppository')).toBe('Rectal/Vaginal');
    });

    it('should return null for non-existent form', () => {
      expect(getCategoryForDosageForm('NonExistentForm')).toBeNull();
    });

    it('should get all dosage forms', () => {
      const allForms = getAllDosageForms();
      expect(allForms.length).toBeGreaterThan(30);
      expect(allForms).toContain('Tablet');
      expect(allForms).toContain('Solution');
      expect(allForms).toContain('Cream');
      expect(allForms).toContain('Inhaler (MDI or DPI)');
    });

    it('should get all unique units', () => {
      const allUnits = getAllUnits();
      expect(allUnits.length).toBeGreaterThan(20);
      expect(allUnits).toContain('mg');
      expect(allUnits).toContain('mL');
      expect(allUnits).toContain('tablet(s)');
      expect(allUnits).toContain('mcg/hr');
      expect(allUnits).toContain('suppository(ies)');
    });
  });

  describe('Category Map', () => {
    it('should have correct mapping for all categories', () => {
      const categories = getAllCategories();
      categories.forEach(category => {
        expect(dosageFormCategoryMap[category]).toBeDefined();
        expect(dosageFormCategoryMap[category].length).toBeGreaterThan(0);
      });
    });

    it('should match getDosageFormsByCategory results', () => {
      const categories = getAllCategories();
      categories.forEach(category => {
        const fromMap = dosageFormCategoryMap[category];
        const fromFunction = getDosageFormsByCategory(category);
        expect(fromMap).toEqual(fromFunction);
      });
    });
  });

  describe('Specialized Units', () => {
    it('should have specialized units for specific forms', () => {
      // Check for specialized count units
      const tabletUnits = getUnitsForDosageForm('Tablet');
      expect(tabletUnits).toContain('scored tablet(s)');

      // Check for rate units
      const patchUnits = getUnitsForDosageForm('Patch (Transdermal)');
      expect(patchUnits).toContain('mcg/hr');
      expect(patchUnits).toContain('mg/day');

      // Check for specialized delivery units
      const inhalerUnits = getUnitsForDosageForm('Inhaler (MDI or DPI)');
      expect(inhalerUnits).toContain('mcg/puff');
      
      // Check for rectal/vaginal specific units
      const suppositoryUnits = getUnitsForDosageForm('Suppository');
      expect(suppositoryUnits).toContain('suppository(ies)');

      // Check for miscellaneous specialized units
      const lollipopUnits = getUnitsForDosageForm('Lollipop (medicated)');
      expect(lollipopUnits).toContain('lollipop(s)');
    });
  });
});