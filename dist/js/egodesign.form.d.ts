export default class EgoForm implements EgoFormInterface {
    form: HTMLFormElement;
    submitBtn: HTMLButtonElement | null;
    classes: EgoFormCSSClassess;
    submitType: EgoFormSubmitType;
    submitMethod: 'GET' | 'POST';
    submitDataFormat: EgoFormDataFormat;
    actionUrl: RequestInfo | URL | null;
    requestHeaders: Record<string, string>;
    fieldGroups: Record<string, string[]> | null;
    extraFields: {
        name: string;
        value: string;
    }[];
    serializerIgnoreList: string[];
    validator: any;
    onStepChange: Function | null;
    onValidationError: Function | null;
    onSubmitStart: Function | null;
    onSubmitEnd: Function | null;
    onSuccess: Function | null;
    onError: Function | null;
    onBeforeValidation: Function | null;
    onBeforeSubmit: Function | null;
    onBeforeSubmission: Function | null;
    currentStep: number;
    currentStepOptional: boolean;
    stepChanging: boolean;
    disbleStepsTransition: boolean;
    isValid: boolean;
    hasFile: boolean;
    resetOnSuccess: boolean;
    resetLoaderOnSuccess: boolean;
    scrollOnError: boolean;
    scrollOnErrorOffset: number;
    preventValidation: boolean;
    preventSubmit: boolean;
    preventSubmission: boolean;
    debug: boolean;
    constructor({ element, classes, submitType, submitDataFormat, submitUrl, requestHeaders, fieldGroups, extraFields, serializerIgnoreList, customValidations, customValidationMessages, onStepChange, onValidationError, onSubmitStart, onSubmitEnd, onSuccess, onError, onBeforeValidation, onBeforeSubmit, onBeforeSubmission, resetOnSuccess, resetLoaderOnSuccess, scrollOnError, scrollOnErrorOffset, preventValidation, preventSubmit, preventSubmission, disbleStepsTransition, debug }: EgoFormOptions);
    submit(): void;
    resumeSubmit(): void;
    resumeValidation(): void;
    resumeSubmission(): void;
    submittingForm({ submitting, force }: {
        submitting: boolean;
        force?: boolean;
    }): void;
    serializeData({ returnFormData }: {
        returnFormData?: boolean;
    }): BodyInit | FormData;
    reset(): void;
    changeStep({ step }: {
        step: 'next' | 'prev' | 'optional' | number;
    }): void;
    nextStep(): void;
    optionalStep(): void;
    prevStep(): void;
    isControlFilled({ control }: {
        control: EgoFormControl;
    }): void;
    filterNumber({ value, ignoreList }: {
        value: string | number;
        ignoreList?: string[];
    }): string;
    filterFormattedQuantity({ num, thousands, decimals, decimalSteps }: {
        num: string | number;
        thousands?: string;
        decimals?: string;
        decimalSteps?: number;
    }): string;
    filterMoneyAmount({ num, currency, thousands, decimals, decimalSteps }: {
        num: string | number;
        currency?: string;
        thousands?: string;
        decimals?: string;
        decimalSteps?: number;
    }): string;
    filterPhoneNumber({ number }: {
        number: string;
    }): string;
    togglePasswordVisibility({ btn }: {
        btn: HTMLElement;
    }): void;
    declareHandlers(isRefresh?: boolean): void;
    refresh(): void;
}
