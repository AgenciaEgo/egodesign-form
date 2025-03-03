interface EgoFormCSSClassess {
    requiredField: string;
    requiredIfFilledField: string;
    fieldHasError: string;
    hiddenErrorMessage: string;
    formSubmittingState: string;
    buttonSubmittingState: string;
    clearFieldError: string;
    validateOnBlur: string;
    validateOnInput: string;
    controlHasError?: string;
}

type EgoFormSubmitType = 'fetch' | 'get' | 'post';

type EgoFormDataFormat = 'json' | 'formData';

type EgoFormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type EgoFormValidationMessages = Record<string, Record<string, string>>;

interface EgoFormCustomValidation {
    name: string;
    condition: Function;
    message: string;
}

interface EgoFormOptions {
    element: HTMLFormElement;
    classes?: EgoFormCSSClassess;
    submitType?: EgoFormSubmitType;
    submitDataFormat?: EgoFormDataFormat;
    submitUrl?: string;
    requestHeaders?: Record<string, string>;
    fieldGroups?: Record<string, string[]>;
    extraFields?: { name: string, value: string }[];
    serializerIgnoreList?: string[];
    customValidations?: Record<string, EgoFormCustomValidation[]>;
    customValidationMessages?: EgoFormValidationMessages;
    onStepChange?: Function;
    onValidationError?: Function;
    onSubmitStart?: Function;
    onSubmitEnd?: Function;
    onSuccess?: Function;
    onError?: Function;
    onBeforeSubmit?: Function;
    resetOnSuccess?: boolean;
    resetLoaderOnSuccess?: boolean;
    scrollOnError?: boolean;
    preventSubmit?: boolean;
    debug?: boolean;
}

interface EgoFormInterface {
    form: HTMLFormElement;
    submitBtn: HTMLButtonElement | null;
    classes: EgoFormCSSClassess;
    submitType: EgoFormSubmitType;
    submitMethod: 'GET' | 'POST';
    submitDataFormat: EgoFormDataFormat;
    actionUrl: RequestInfo | URL | null;
    requestHeaders: Record<string, string>;
    fieldGroups: Record<string, string[]> | null;
    extraFields: { name: string, value: string }[];
    serializerIgnoreList: string[];
    validator: any;
    onStepChange: Function | null;
    onValidationError: Function | null;
    onSubmitStart: Function | null;
    onSubmitEnd: Function | null;
    onSuccess: Function | null;
    onError: Function | null;
    onBeforeSubmit: Function | null;
    currentStep: number;
    currentStepOptional: boolean;
    stepChanging: boolean;
    isValid: boolean;
    hasFile: boolean;
    resetOnSuccess: boolean;
    resetLoaderOnSuccess: boolean;
    scrollOnError: boolean;
    preventSubmit: boolean;
    debug: boolean;
}

interface EgoFormValidatorOptions {
    customValidations: Record<string, EgoFormCustomValidation[]>;
    classes: EgoFormCSSClassess;
    customValidationMessages: EgoFormValidationMessages | null;
    debug: boolean;
}

interface EgoFormValidatorInterface {
    customValidations: Record<string, EgoFormCustomValidation[]>;
    classes: EgoFormCSSClassess;
    validationMessages: EgoFormValidationMessages | null;
    debug: boolean;
}