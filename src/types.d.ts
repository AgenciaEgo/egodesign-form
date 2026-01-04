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

type EgoFormSubmitType = 'fetch' | 'get' | 'post' | 'put' | 'delete' | 'patch';

type EgoFormDataFormat = 'json' | 'formData';

type EgoFormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type EgoFormValidationMessages = Record<string, Record<string, string>>;

interface EgoFormCustomValidation {
    name: string;
    condition: (value: string, controlName: string | null) => boolean | Promise<boolean>;
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
    onBeforeValidation?: Function;
    onBeforeSubmit?: Function; // For backward compatibility 1.8
    onBeforeSubmission?: Function;
    onValidityChange?: Function;
    onCurrentStepValidityChange?: Function;
    disbleStepsTransition?: boolean;
    resetOnSuccess?: boolean;
    resetLoaderOnSuccess?: boolean;
    scrollOnError?: boolean;
    scrollOnErrorOffset?: number;
    preventValidation?: boolean;
    preventSubmit?: boolean; // For backward compatibility 1.8
    preventSubmission?: boolean;
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
    onBeforeValidation: Function | null;
    onBeforeSubmit: Function | null; // For backward compatibility 1.8
    onBeforeSubmission: Function | null;
    onValidityChange: Function | null;
    onCurrentStepValidityChange: Function | null;
    currentStep: number;
    currentStepOptional: boolean;
    highestVisitedStep: number;
    stepChanging: boolean;
    disbleStepsTransition?: boolean;
    isValid: boolean;
    isCurrentStepValid: boolean;
    hasFile: boolean;
    resetOnSuccess: boolean;
    resetLoaderOnSuccess: boolean;
    scrollOnError: boolean;
    scrollOnErrorOffset: number | null;
    preventValidation: boolean;
    preventSubmit: boolean; // For backward compatibility 1.8
    preventSubmission: boolean;
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