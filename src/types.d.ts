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
    onBeforeStepChange?: (currentStep: string, nextStep: string, instance: any) => boolean;
    onStepChange?: (currentStep: string, nextStep: string) => void;
    onValidationError?: (fields: string[], instance: any) => void;
    onSubmitStart?: () => void;
    onSubmitEnd?: () => void;
    onSuccess?: (response: Response) => void;
    onError?: (error: Response | Error) => void;
    onBeforeValidation?: (instance: any) => void;
    onBeforeSubmit?: (instance: any) => void; // For backward compatibility 1.8
    onBeforeSubmission?: (instance: any) => void;
    onValidityChange?: (isValid: boolean, instance: any) => void;
    onCurrentStepValidityChange?: (isValid: boolean, step: number, instance: any) => void;
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
    onBeforeStepChange: ((currentStep: string, nextStep: string, instance: any) => boolean) | null;
    onStepChange: ((currentStep: string, nextStep: string) => void) | null;
    onValidationError: ((fields: string[], instance: any) => void) | null;
    onSubmitStart: (() => void) | null;
    onSubmitEnd: (() => void) | null;
    onSuccess: ((response: Response) => void) | null;
    onError: ((error: Response | Error) => void) | null;
    onBeforeValidation: ((instance: any) => void) | null;
    onBeforeSubmit: ((instance: any) => void) | null; // For backward compatibility 1.8
    onBeforeSubmission: ((instance: any) => void) | null;
    onValidityChange: ((isValid: boolean, instance: any) => void) | null;
    onCurrentStepValidityChange: ((isValid: boolean, step: number, instance: any) => void) | null;
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