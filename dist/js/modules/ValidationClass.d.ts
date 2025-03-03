export default class EgoFormValidator implements EgoFormValidatorInterface {
    customValidations: Record<string, EgoFormCustomValidation[]>;
    classes: EgoFormCSSClassess;
    validationMessages: EgoFormValidationMessages | null;
    debug: boolean;
    constructor({ customValidations, classes, customValidationMessages, debug }: EgoFormValidatorOptions);
    validateField({ field }: {
        field: EgoFormControl;
    }): boolean;
    isValidEmail({ email }: {
        email: string;
    }): boolean;
    isValidCuitCuil({ num }: {
        num: string | number;
    }): boolean;
    isValidUrl({ urlString }: {
        urlString: string;
    }): boolean;
    isValidFileSize({ field }: {
        field: EgoFormControl;
    }): void;
    displayFieldError({ control, field, errorElement }: {
        control: EgoFormControl | null;
        field: HTMLElement;
        errorElement: HTMLElement | null;
    }): void;
    clearControlError({ control }: {
        control: EgoFormControl | null;
    }): void;
    realTimeValidations({ form }: {
        form: HTMLFormElement;
    }): void;
    throwError(msg: string): void;
}
