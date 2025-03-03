import { vanillaFade, isInViewport, getParentByClassName, showLog } from './modules/tools';
import EgoFormValidator from './modules/ValidationClass';

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

    constructor({
        element,
        classes,
        submitType,
        submitDataFormat,
        submitUrl,
        requestHeaders,
        fieldGroups,
        extraFields,
        serializerIgnoreList,
        customValidations,
        customValidationMessages,
        onStepChange,
        onValidationError,
        onSubmitStart,
        onSubmitEnd,
        onSuccess,
        onError,
        onBeforeSubmit,
        resetOnSuccess,
        resetLoaderOnSuccess,
        scrollOnError,
        preventSubmit,
        debug
    }: EgoFormOptions) {
        this.form = element;
        this.submitType = submitType || 'fetch';
        this.submitDataFormat = submitDataFormat || 'formData' // formData - json
        this.requestHeaders = requestHeaders || {};
        this.actionUrl = this.form.getAttribute('action') || submitUrl || null;
        this.submitMethod = (this.form.getAttribute('method') as 'GET' | 'POST' | null) || 'POST';
        this.submitBtn = this.form.querySelector('button[type="submit"]') || null;
        this.classes = {
            requiredField: '--required',
            requiredIfFilledField: '--required-if-filled',
            fieldHasError: '--has-error',
            hiddenErrorMessage: '--hidden',
            formSubmittingState: '--submitting',
            buttonSubmittingState: '--loading',
            clearFieldError: '--clear-error',
            validateOnBlur: '--validate-onblur',
            validateOnInput: '--validate-oninput',
            ...classes
        }
        this.isValid = true;
        this.validator = new EgoFormValidator({
            customValidations: customValidations || {},
            classes: this.classes,
            customValidationMessages: customValidationMessages || null,
            debug: debug ?? false
        });
        this.onValidationError = onValidationError ?? null;
        this.onStepChange = onStepChange ?? null;
        this.onSubmitStart = onSubmitStart ?? null;
        this.onSubmitEnd = onSubmitEnd ?? null;
        this.onSuccess = onSuccess ?? null;
        this.onError = onError ?? null;
        this.onBeforeSubmit = onBeforeSubmit ?? null;
        this.fieldGroups = fieldGroups ?? null;
        this.extraFields = extraFields ?? [];
        this.hasFile = false;
        this.serializerIgnoreList = serializerIgnoreList || [];
        this.resetOnSuccess = resetOnSuccess ?? true;
        this.resetLoaderOnSuccess = resetLoaderOnSuccess ?? true;
        this.scrollOnError = scrollOnError ?? true;
        const currentStepElement: HTMLElement | null = this.form.querySelector('.form__step.--active')
        this.currentStep = currentStepElement ? Number(currentStepElement.dataset.step) : 0;
        this.currentStepOptional = false;
        this.stepChanging = false;
        this.preventSubmit = preventSubmit ?? false;
        this.debug = debug ?? false;

        this.declareHandlers();
        if (!this.actionUrl || this.actionUrl === '') throw new Error("The form doesn't have an action attribute or submitUrl wasn't provided.");

        if (this.debug) showLog('initialized!');
    }


    submit() {
        if (!this.preventSubmit) this.resumeSubmit();
    }

    resumeSubmit() {
        if (this.debug) showLog(`submitting using ${this.submitType}!`);

        this.submittingForm({ submitting: true });

        // Validate each required field
        this.isValid = true;
        const invalidFields: string[] = [];
        this.form.querySelectorAll(`.form__field`).forEach(field => {
            const fieldValid: boolean = this.validator.validateField({ field });
            if (!fieldValid) {
                const thisControl: EgoFormControl | null = field.querySelector('.form__control');
                if (thisControl) invalidFields.push(thisControl.name);
                this.isValid = false;
            }
        });
        if (!this.isValid) {
            this.submittingForm({ submitting: false, force: true });

            if (typeof this.onValidationError === 'function') this.onValidationError(invalidFields, this);
            if (this.debug) showLog(`this fields have failed validation: ${invalidFields.toString().replace(/,/g, ', ')}.`);

            if (this.scrollOnError) {
                const firstInvalidField: HTMLElement | null = this.form.querySelector(`.form__field.${this.classes.fieldHasError}`);
                if (firstInvalidField && !isInViewport({ element: firstInvalidField })) firstInvalidField.scrollIntoView({ behavior: 'smooth' });
            }
        }
        else {
            if (this.debug) {
                showLog(`the form was submitted!`);
                showLog(JSON.parse(this.serializeData({ returnFormData: false }) as string), 'data');
                setTimeout(() => {
                    this.submittingForm({ submitting: false, force: true });
                }, 1000);
            }
            else {
                if (this.submitType == 'fetch' && this.actionUrl) {
                    const body: BodyInit | FormData = this.serializeData({ returnFormData: this.submitDataFormat === 'json' });
                    fetch(this.actionUrl, {
                        method: this.submitMethod,
                        headers: this.submitDataFormat === 'json' ? { 'Content-Type': 'application/json', ...this.requestHeaders } : { ...this.requestHeaders },
                        body: body,
                    })
                        .then((resp) => {
                            if (resp.status === 200 || resp.status === 201) {
                                if (this.resetOnSuccess) this.reset();
                                if (typeof this.onSuccess == 'function') this.onSuccess(resp);
                            }
                            else {
                                if (typeof this.onError == 'function') this.onError(resp);
                            }
                        })
                        .catch((err) => {
                            if (typeof this.onError == 'function') this.onError(err);
                        })
                        .finally(() => {
                            this.submittingForm({ submitting: false });
                        });
                }
                else if (this.submitType == 'fetch' && !this.actionUrl) {
                    throw new Error(`Missing submit URL: When using 'fetch' submitType, specify either the form's 'action' or the 'submitUrl' option.`);
                }
                else {
                    this.form.submit();
                }
            }
        }
    }

    submittingForm({ submitting, force = false }: { submitting: boolean, force?: boolean }) {
        let body = document.getElementsByTagName('body').item(0);
        if (submitting) {
            this.form.classList.add(this.classes.formSubmittingState);
            if (this.submitBtn) this.submitBtn.classList.add(this.classes.buttonSubmittingState);
            if (body) body.classList.add('--block');
            if (typeof this.onSubmitStart == 'function') this.onSubmitStart();
        }
        else {
            if (this.resetLoaderOnSuccess || force) {
                this.form.classList.remove(this.classes.formSubmittingState);
                if (this.submitBtn) this.submitBtn.classList.remove(this.classes.buttonSubmittingState);
                if (body) body.classList.remove('--block');
            }
            if (typeof this.onSubmitEnd == 'function') this.onSubmitEnd();
        }
    }

    serializeData({ returnFormData = false }: { returnFormData?: boolean }): BodyInit | FormData {
        const formData: FormData = new FormData(this.form);
        const jsonData: Record<string, any> = {};

        for (const pair of formData) {
            const [fieldName, fieldValue] = pair;

            if (!this.serializerIgnoreList.includes(fieldName)) {
                if (fieldValue instanceof File && !fieldValue.size && !fieldValue.name) {
                    continue;
                } else {
                    if (jsonData.hasOwnProperty(fieldName)) {
                        jsonData[fieldName] = [...jsonData[fieldName], fieldValue];
                    }
                    else jsonData[fieldName] = fieldValue;
                }
            }
        }

        if (this.fieldGroups) {
            for (const groupName in this.fieldGroups) {
                if (Object.hasOwnProperty.call(this.fieldGroups, groupName)) {
                    let group: Record<string, any>[] = [{}];
                    for (const field of this.fieldGroups[groupName]) {
                        group[0][field] = formData.get(field);
                        delete jsonData[field];
                    }
                    jsonData[groupName] = group;
                }
            }
        }

        if (this.extraFields.length) {
            for (const field of this.extraFields) {
                if (field.hasOwnProperty('name') && field.hasOwnProperty('value')) {
                    formData.append(field.name, field.value);
                    jsonData[field.name] = field.value;
                }
            }
        }

        return returnFormData ? formData : JSON.stringify(jsonData);
    }

    reset() {
        this.form.reset();
        this.form.querySelectorAll('.form__field').forEach(field =>
            field.classList.remove('--filled', `${this.classes.fieldHasError}`)
        );
        this.form.querySelectorAll('.form__control').forEach(field =>
            field.setAttribute('aria-invalid', 'false')
        );
        if (this.currentStep) this.changeStep({ step: 1 });
    }

    changeStep({ step }: { step: 'next' | 'prev' | 'optional' | number }) {
        if (!this.stepChanging) {
            const current: string = this.currentStepOptional ? this.currentStep.toString() + 'b' : this.currentStep.toString(),
                currentElement: HTMLElement | null = this.form.querySelector('[data-step="' + current + '"]'),
                requiredFields: NodeListOf<HTMLElement> | undefined = currentElement?.querySelectorAll(`.${this.classes.requiredField}`),
                nextStepNumber: number | string = step === 'next' ?
                    this.currentStep + 1
                    : step === 'prev' && !this.currentStepOptional ?
                        this.currentStep - 1
                        : step === 'optional' ?
                            this.currentStep + 'b'
                            : this.currentStep,
                nextElement: HTMLElement | null = this.form.querySelector('[data-step="' + nextStepNumber + '"]');

            if (this.currentStep !== nextStepNumber || this.currentStepOptional) {
                this.stepChanging = true;
                this.isValid = true;

                setTimeout(() => {
                    // Validate each required field
                    if (requiredFields && (step === 'next' || step === 'optional')) {
                        requiredFields.forEach(field => {
                            let fieldValid = this.validator.validateField({ field });
                            if (!fieldValid) this.isValid = false;
                        });
                    }

                    if (currentElement && nextElement && this.isValid) {
                        vanillaFade({
                            element: currentElement,
                            enter: false,
                            time: 200,
                            displayType: 'flex',
                            callback: () => {
                                currentElement.classList.remove('--active');
                                vanillaFade({
                                    element: nextElement,
                                    enter: true,
                                    time: 200,
                                    displayType: 'flex',
                                    callback: () => {
                                        nextElement.classList.add('--active');
                                        this.stepChanging = false;
                                        this.currentStepOptional = step === 'optional';
                                        this.currentStep = parseInt(nextStepNumber as string);
                                        if (typeof this.onStepChange == 'function') this.onStepChange(current.toString(), nextStepNumber.toString());
                                    }
                                });
                            }
                        });
                    }
                    else this.stepChanging = false;
                }, 50);
            }
        }
    }

    nextStep() {
        this.changeStep({ step: 'next' });
    }

    optionalStep() {
        this.changeStep({ step: 'optional' });
    }

    prevStep() {
        this.changeStep({ step: 'prev' });
    }

    isControlFilled({ control }: { control: EgoFormControl }) {
        let parent: HTMLElement | null = control.parentElement;
        if (parent) {
            if (control.value !== '') {
                parent.classList.add('--filled');
            } else {
                parent.classList.remove('--filled');
            }
        }
    }

    filterNumber({ value, ignoreList = [] }: { value: string | number, ignoreList?: string[] }): string {
        const ignore: string = ignoreList.join('');
        const reg: RegExp = new RegExp("[^" + ignore + "0-9]", "g");
        return value.toString().replace(reg, '');
    }

    filterFormattedQuantity({
        num,
        thousands = '.',
        decimals = ',',
        decimalSteps
    }: {
        num: string | number,
        thousands?: string,
        decimals?: string,
        decimalSteps?: number
    }): string {
        const sliced: string[] = decimals ? num.toString().split(decimals) : [num.toString()];
        const reg: RegExp = new RegExp(/\B(?=(\d{3})+(?!\d))/g);
        const root: string = sliced[0].replace(reg, thousands);

        let fullNumber: string = '';
        if (decimalSteps && decimalSteps > 0 && sliced[1] && sliced[1].length) {
            fullNumber = root + decimals + sliced[1].slice(0, decimalSteps);
        }
        else fullNumber = root;

        return fullNumber;
    }

    filterMoneyAmount({
        num,
        currency = '$',
        thousands = '.',
        decimals = ',',
        decimalSteps
    }: {
        num: string | number,
        currency?: string,
        thousands?: string,
        decimals?: string,
        decimalSteps?: number
    }): string {
        if (!num || num == currency) return '';
        let result: string = this.filterNumber({ value: num, ignoreList: [decimals || ''] });
        result = this.filterFormattedQuantity({ num: result, thousands, decimals, decimalSteps });
        return `${currency} ${result}`;
    }

    filterPhoneNumber({ number }: { number: string }): string {
        let reg = new RegExp(/[^\d+\-() ]*/g);
        return number.replace(reg, '');
    }

    togglePasswordVisibility({ btn }: { btn: HTMLElement }) {
        if (this.debug) showLog('Password visibility toggled!');
        const input: HTMLInputElement | null | undefined = btn?.parentElement?.querySelector('.form__control');
        if (input) {
            const type: 'password' | 'text' = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            btn.classList.toggle('--hide');
        }
    }

    declareHandlers() {
        const self: EgoForm = this;

        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', function (e: Event) {
                e.preventDefault();
                if (typeof self.onBeforeSubmit == 'function') self.onBeforeSubmit(self);
                self.submit();
            });
        }
        else {
            throw new Error(`There's no submit button in this form "${this.form.id}".`);
        }

        this.validator.realTimeValidations({ form: this.form });

        // OnBlur validation
        this.form.querySelectorAll<HTMLElement>(`.form__field.${this.classes.validateOnBlur}`)
            .forEach(field => {
                field.querySelector('.form__control')?.addEventListener('blur', () => {
                    const fieldValid: boolean = this.validator.validateField({ field });
                    if (!fieldValid) this.isValid = false;
                });
            });

        // OnInput validation
        this.form.querySelectorAll<HTMLElement>(`.form__field.${this.classes.validateOnInput}`)
            .forEach(field => {
                const control: EgoFormControl | null = field.querySelector('.form__control');
                const eventFunction = () => {
                    const fieldValid: boolean = this.validator.validateField({ field });
                    if (fieldValid) this.validator.clearControlError({ control });
                }
                control?.addEventListener('input', eventFunction);
            });

        this.form.querySelectorAll('.form__next-step').forEach((element: Element) => {
            element.addEventListener('click', self.nextStep.bind(self));
        });

        this.form.querySelectorAll('.form__optional-step').forEach((element: Element) => {
            element.addEventListener('click', self.optionalStep.bind(self));
        });

        this.form.querySelectorAll('.form__prev-step').forEach((element: Element) => {
            element.addEventListener('click', self.prevStep.bind(self));
        });

        this.form.querySelectorAll<EgoFormControl>('.form__control')
            .forEach(element => {
                this.isControlFilled({ control: element });

                element.addEventListener('keyup', () => {
                    this.isControlFilled({ control: element });
                });
                element.addEventListener('change', () => {
                    this.isControlFilled({ control: element });
                });
            });

        this.form.querySelectorAll<EgoFormControl>('.form__control')
            .forEach(control => {
                control.addEventListener('focus', () => {
                    this.validator.clearControlError({ control });
                });
            });

        this.form.querySelectorAll<HTMLElement>('.' + this.classes.clearFieldError)
            .forEach(element => {
                element.addEventListener('click', () => {
                    const field: HTMLElement | null = getParentByClassName({ element, className: 'form__field' });
                    if (field) self.validator.clearControlError({ control: field.querySelector('.form__control') });
                });
            });

        // Filter number input
        this.form.querySelectorAll<EgoFormControl>('.form__field.--number input')
            .forEach(element => {
                const mainClass: EgoForm = this;
                const field: HTMLElement | null = getParentByClassName({ element: element, className: 'form__field' });
                const thousandsSep: string = field && field.dataset.thousandsSeparator ? field.dataset.thousandsSeparator : '';
                const decimalsSep: string = field && field.dataset.decimalSeparator ? field.dataset.decimalSeparator : '';
                const decimals: string = field && field.dataset.decimals ? field.dataset.decimals : '';

                function resetNumberField() {
                    element.value = mainClass.filterNumber({ value: element.value, ignoreList: [decimalsSep] });
                }

                element.addEventListener('focus', resetNumberField);
                element.addEventListener('input', resetNumberField);
                element.addEventListener('paste', resetNumberField);
                element.addEventListener('blur', () => {
                    element.value = (thousandsSep) ?
                        mainClass.filterFormattedQuantity({ num: element.value, thousands: thousandsSep, decimals: decimalsSep, decimalSteps: parseInt(decimals) })
                        :
                        mainClass.filterNumber({ value: element.value });
                });
            });

        // Filter money input
        this.form.querySelectorAll<EgoFormControl>('.form__field.--money-amount input')
            .forEach(element => {
                const mainClass: EgoForm = this;
                const field: HTMLElement | null = getParentByClassName({ element: element, className: 'form__field' });
                const currency: string = field && field.dataset.currency ? field.dataset.currency : '$';
                const thousandsSep: string = field && field.dataset.thousandsSeparator ? field.dataset.thousandsSeparator : '.';
                const decimalsSep: string = field && field.dataset.decimalSeparator ? field.dataset.decimalSeparator : '';
                const decimals: string = field && field.dataset.decimals ? field.dataset.decimals : '';

                function resetMoneyField() {
                    element.value = mainClass.filterNumber({ value: element.value, ignoreList: [decimalsSep] });
                }

                element.addEventListener('focus', resetMoneyField);
                element.addEventListener('input', resetMoneyField);
                element.addEventListener('paste', resetMoneyField);
                element.addEventListener('blur', () => {
                    element.value = this.filterMoneyAmount({
                        num: element.value,
                        currency,
                        thousands: thousandsSep,
                        decimals: decimalsSep,
                        decimalSteps: parseInt(decimals)
                    });
                });
            });

        // Filter phone input
        this.form.querySelectorAll<EgoFormControl>('.form__field.--phone input')
            .forEach(element => {
                element.addEventListener('input', () => {
                    element.value = this.filterPhoneNumber({ number: element.value });
                });
                element.addEventListener('paste', () => {
                    element.value = this.filterPhoneNumber({ number: element.value });
                });
            });

        this.form.querySelectorAll<HTMLElement>('.form__toggle-password-visibility')
            .forEach(btn => {
                btn.addEventListener('click', () => this.togglePasswordVisibility({ btn }));
            });
    }
}