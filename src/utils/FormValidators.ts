import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EventDto, EventMember, PurchaseMember } from '../models/Event';
import { ReceiptPurchase } from '../models/Receipt';

export interface AllValidationErrors {
  control_name: string;
  error_name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error_value: any;
}

export type FormGroupControls = Record<string, AbstractControl>;

export function duplicateMembersValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const members = form.get('members')?.value.map((x: EventMember) => x.name);

    return members.length > 1 && members.length !== new Set(members).size
      ? { hasMembersDuplicates: true }
      : null;
  };
}

export function notDeleteMemberExistedInPurchase(event: EventDto): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    if (!event) {
      return null;
    }

    const allPurchasesMembers = event.purchases.reduce((acc, x) => {
      x.members.forEach(m => {
        if (!acc.includes(m)) {
          acc.push(m);
        }
      });

      return acc;
    }, Array<string>());

    const members = (form.get('members')?.value as EventMember[])
      .filter(x => x.name !== '')
      .map(x => x.name);

    const organizer = form.get('organizer')?.value;
    if (!members.includes(organizer)) {
      members.push(organizer);
    }

    return !allPurchasesMembers.every(r => members.includes(r))
      ? { notDeleteMemberExistedInPurchase: true }
      : null;
  };
}

export function organizerInMembersValidation(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const organizer = form.get('organizer')?.value;
    const members = form.get('members')?.value.map((x: EventMember) => x.name);

    return members.length > 1 && members.includes(organizer) ? { organizerInMembers: true } : null;
  };
}

export function sumGreaterZero(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const sum = form.get('sum')?.value;
    return Number(sum) === 0 ? { minimalSum: true } : null;
  };
}

export function minMembersCountInPurchase(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const members = form.get('members')?.value.filter((x: PurchaseMember) => x.selected);

    return members?.length === 0 ? { minimalMembersCount: true } : null;
  };
}

export function sumLessOrEqualDebt(debtSum: number): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const sum = form.get('sum')?.value;
    return Number(sum) > debtSum ? { sumLessOrEqualDebt: true } : null;
  };
}

export function calculateFormValidationErrors(
  form: UntypedFormGroup,
  translation: Record<string, string>
): string[] {
  const errors = getFormValidationErrors(form.controls);

  return errors.map(error => {
    const getErrorName = (error: AllValidationErrors) =>
      error.control_name.charAt(0).toUpperCase() + error.control_name.slice(1);

    switch (error.error_name) {
      case 'required':
        return `${getErrorName(error)} ${translation['isRequired']}`;
      case 'pattern':
        return `${getErrorName(error)} ${translation['hasWrongPattern']}`;
      case 'email':
        return `${getErrorName(error)} ${translation['hasWrongEmailFormat']}`;
      case 'minlength':
        return `${getErrorName(error)} ${translation['hasWrongLength']} ${
          error.error_value.requiredLength
        }`;
      case 'areEqual':
        return `${getErrorName(error)} ${translation['mustBeEqual']}`;
      default:
        return `${getErrorName(error)}: ${error.error_name}: ${error.error_value}`;
    }
  });
}

export function getFormValidationErrors(controls: FormGroupControls): AllValidationErrors[] {
  let errors: AllValidationErrors[] = [];
  Object.keys(controls).forEach(key => {
    const control = controls[key];

    if (control instanceof UntypedFormGroup) {
      errors = errors.concat(getFormValidationErrors(control.controls));
    }

    const controlErrors = controls[key]?.errors;
    if (controlErrors !== null) {
      Object.keys(controlErrors).forEach(keyError => {
        errors.push({
          control_name: key,
          error_name: keyError,
          error_value: controlErrors[keyError],
        });
      });
    }
  });

  return errors;
}

export function minLengthArray(min: number, field: string): ValidatorFn {
  return (c: AbstractControl) => {
    if (c.value[field].length >= min) return null;
    return { minLengthArray: true };
  };
}

export function minPurchaseInReceipt(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const purchases = form.get('purchases')?.value.filter((x: ReceiptPurchase) => x.selected);

    return purchases?.length === 0 ? { minPurchaseInReceipt: true } : null;
  };
}
