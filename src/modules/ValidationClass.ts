import validationMessages from './validationMessages';
import { getParentByClassName, showLog } from './tools';

export default class EgoFormValidator implements EgoFormValidatorInterface {
    customValidations: Record<string, EgoFormCustomValidation[]>;
    classes: EgoFormCSSClassess;
    validationMessages: EgoFormValidationMessages | null;
    debug: boolean;

    constructor({
        customValidations,
        classes,
        customValidationMessages,
        debug
    }: EgoFormValidatorOptions) {
        this.customValidations = customValidations;
        this.validationMessages = { ...validationMessages, ...customValidationMessages };
        this.classes = classes;
        this.debug = debug;
    }

    async validateField({ field }: { field: EgoFormControl }): Promise<boolean> {
        const type: string = field.dataset.type || '',
            isMultipleChoice: boolean = ['radio', 'checkbox'].includes(type),
            isRequired: boolean = field.classList.contains(this.classes.requiredField),
            isRequiredIfFilled: boolean = field.classList.contains(this.classes.requiredIfFilledField),
            errorElement: HTMLElement | null = field.querySelector('.form__error'),
            control: EgoFormControl | null = field.querySelector('.form__control'),
            controlCheked: EgoFormControl | null = isMultipleChoice ? field.querySelector('.form__control:checked') : null,
            controlName: string | null = control ? control.getAttribute('name') : null,
            customTypes: string[] = Object.keys(this.customValidations),
            minLength: number | null = field.dataset.minLength ? Number(field.dataset.minLength) : null,
            maxLength: number | null = field.dataset.maxLength ? Number(field.dataset.maxLength) : null;

        if (!control) this.throwError('control not found.');
        if (!controlName) this.throwError('control name not found.');

        if (this.debug) showLog(`validating field "${controlName}"`);

        // If field is required-if-filled and empty, skip validation
        if (isRequiredIfFilled && !isRequired && !control?.value) {
            return true;
        }

        if (isRequired && !control?.value) {
            if (errorElement && this.validationMessages && controlName) {
                errorElement.textContent = this.validationMessages[controlName] ?
                    this.validationMessages[controlName].empty
                    :
                    this.validationMessages.default.empty;
            }
            this.displayFieldError({ control, field, errorElement });
            return false;
        }

        if (control?.value) {
            if (minLength) {
                if (control.value.length < minLength) {
                    if (errorElement && this.validationMessages) {
                        errorElement.textContent = this.validationMessages.default.minLength.replace('[[var]]', minLength.toString());
                    }
                    this.displayFieldError({ control, field, errorElement });
                    return false;
                }
            }
            if (maxLength) {
                if (control.value.length > maxLength) {
                    if (errorElement && this.validationMessages) {
                        errorElement.textContent = this.validationMessages.default.maxLength.replace('[[var]]', maxLength.toString());
                    }
                    this.displayFieldError({ control, field, errorElement });
                    return false;
                }
            }
        }

        if ((isMultipleChoice && !controlCheked)) {
            if (!isRequiredIfFilled) {
                this.displayFieldError({ control, field, errorElement });
                if (errorElement && this.validationMessages && controlName) {
                    errorElement.textContent = this.validationMessages[controlName] ?
                        this.validationMessages[controlName].empty
                        :
                        this.validationMessages.default.empty;
                }
                return false;
            }
        }
        else {
            // Content & Format validation
            switch (type) {
                case 'email':
                    if (control && control.value && !this.isValidEmail({ email: control.value })) {
                        if (errorElement && this.validationMessages) errorElement.textContent = this.validationMessages.email.invalid;
                        this.displayFieldError({ control, field, errorElement });
                        return false;
                    }
                    break;

                case 'password_repeat': {
                    const comparedTo: EgoFormControl | null = document.getElementById('password') as EgoFormControl;
                    if (comparedTo && (control?.value != comparedTo?.value)) {
                        if (errorElement && this.validationMessages) errorElement.textContent = this.validationMessages.password_repeat.unequal;
                        this.displayFieldError({ control, field, errorElement });
                        return false;
                    }
                    break;
                }

                case 'cuil':
                case 'cuit':
                    if (control && control.value && !this.isValidCuitCuil({ num: control.value })) {
                        if (errorElement && this.validationMessages) errorElement.textContent = this.validationMessages.cuil.invalid;
                        this.displayFieldError({ control, field, errorElement });
                        return false;
                    }
                    break;

                case 'url':
                    if (control && control.value && !this.isValidUrl({ urlString: control.value })) {
                        if (errorElement && this.validationMessages) errorElement.textContent = this.validationMessages.url.invalid;
                        this.displayFieldError({ control, field, errorElement });
                        return false;
                    }
                    break;

                case 'money':
                    if (control) {
                        const currency: string = control.dataset.currency ? control.dataset.currency : '$';
                        if (control.value == '' || control.value == currency) {
                            if (errorElement && this.validationMessages) errorElement.textContent = this.validationMessages.default.empty;
                            this.displayFieldError({ control, field, errorElement });
                            return false;
                        }
                    }
                    break;

                case 'single-checkbox':
                    if (control && control.hasOwnProperty('checked')) {
                        const checkbox = control as HTMLInputElement;
                        if (!checkbox.checked) {
                            this.displayFieldError({ control, field, errorElement });
                            if (errorElement && this.validationMessages && controlName) {
                                errorElement.textContent = this.validationMessages[controlName] ?
                                    this.validationMessages[controlName].empty
                                    :
                                    this.validationMessages.default.empty;
                            }
                            return false;
                        }
                    }
                    break;

                default: break;
            }

            // Custom validations
            for (const customType of customTypes) {
                if (type === customType) {
                    for (const validation of this.customValidations[type]) {
                        if (control) {
                            const result = await validation.condition(control.value, controlName);
                            if (!result) {
                                if (errorElement) errorElement.textContent = validation.message || '';
                                this.displayFieldError({ control, field, errorElement });
                                return false;
                            }
                        }
                    }
                }
            }
        }

        return true;
    }

    isValidEmail({ email }: { email: string }): boolean {
        const expression: RegExp = /(?!.*\.{2})^([a-z\d!#$%&'*+\-/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return expression.test(email.toLowerCase());
    }

    isValidCuitCuil({ num }: { num: string | number }): boolean {
        const multipliers: number[] = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

        let digits: (string | number)[] = num.toString().replace(/[^0-9]/g, '').split('');

        if (digits.length != 11) return false;

        digits = digits.map(digit => Number(digit));
        const validator: number = Number(digits.pop());

        const reduction: number = digits.reduce((carry: number, digit: number | string, index: number) => {
            return carry += Number(digit) * multipliers[index];
        }, 0);

        const modulo: number = reduction % 11;
        let result: number = 11 - modulo;
        if (result == 10) result = 9;
        if (result == 11) result = 0;

        return result == validator;
    }

    isValidUrl({ urlString }: { urlString: string }): boolean {
        let urlPattern: RegExp = new RegExp('^(https?:\\/\\/)?' + // validate protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
        return !!urlPattern.test(urlString);
    }

    isValidFileSize({ field }: { field: EgoFormControl }): void {
        let errorMessage: string | null = null;
        const input: HTMLInputElement | null = field.querySelector('.form__control'),
            minFileSize: number = Number(field.dataset.minSize),
            maxFileSize: number = Number(field.dataset.maxSize),
            errorElement: HTMLElement | null = field.querySelector('.form__error'),
            fileName: string | null = input && input.files ? input.files[0].name : null,
            fullFileSize: number = input && input.files ? input.files[0].size : 0,
            fileSize: number = input && input.files ? parseFloat((fullFileSize / 1048576).toFixed(1)) : 0; //MB

        if (fileSize > maxFileSize || !fullFileSize) {
            if (input) {
                input.value = '';
                input.setAttribute('aria-invalid', 'true');
            }
            field.classList.remove('--has-file');
            field.classList.add(this.classes.fieldHasError);
        }
        else if (fileName) {
            field.classList.add('--has-file');
        }
        else {
            field.classList.remove('--has-file');
        }

        // Set message
        if (this.validationMessages) {
            if (!fullFileSize) {
                errorMessage = this.validationMessages.file.empty;
            }
            else if (fileSize < minFileSize) {
                errorMessage = this.validationMessages.file.min_size.replace('[[var]]', minFileSize + ' MB');
            }
            else if (fileSize > maxFileSize) {
                errorMessage = this.validationMessages.file.max_size.replace('[[var]]', maxFileSize + ' MB');
            }
        }

        if (errorMessage && errorElement) {
            errorElement.textContent = errorMessage;
            this.displayFieldError({ control: input, field, errorElement });
        }
    }

    displayFieldError({
        control, field, errorElement
    }: {
        control: EgoFormControl | null, field: HTMLElement, errorElement: HTMLElement | null
    }): void {
        if (!control) return;
        control.setAttribute('aria-invalid', 'true');
        field.classList.add(this.classes.fieldHasError);
        if (this.classes.controlHasError) control.classList.add(this.classes.controlHasError);
        if (errorElement) errorElement.classList.remove(this.classes.hiddenErrorMessage);
    }

    clearControlError({ control }: { control: EgoFormControl | null }): void {
        if (!control) return;
        control.setAttribute('aria-invalid', 'false');
        if (this.classes.controlHasError) control.classList.remove(this.classes.controlHasError);

        const field: HTMLElement | null = getParentByClassName({ element: control, className: 'form__field' }),
            errorElement: HTMLElement | null | undefined = field?.querySelector('.form__error');
        field?.classList.remove(this.classes.fieldHasError);

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add(this.classes.hiddenErrorMessage);
        }
    }

    realTimeValidations({ form }: { form: HTMLFormElement }): void {
        form.querySelectorAll<EgoFormControl>('.form__field[data-type="file"]')
            .forEach(field => {
                const input: EgoFormControl | null = field.querySelector('.form__control');
                input?.addEventListener('change', e => {
                    e.stopPropagation();
                    this.isValidFileSize({ field });
                });
            });
    }

    throwError(msg: string): void {
        throw new Error(`EgoForm Error: ${msg}`);
    }
}