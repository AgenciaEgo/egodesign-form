import validationMessages from './validationMessages';
import { getParentByClassName } from './tools';

export default class EgoFormValidator {
    constructor({
        customValidations,
        classes,
        customValidationMessages
    }) {
        this.customValidations = customValidations;
        this.validationMessages = {...validationMessages, ...customValidationMessages} || validationMessages;
        this.classes = classes;
    }

    validateField(field) {
        const type = field.dataset.type,
            isMultipleChoice = ['radio', 'checkbox'].includes(type),
            isRequired = field.classList.contains(this.classes.requiredField),
            isRequiredIfFilled = field.classList.contains(this.classes.requiredIfFilledField),
            errorElement = field.querySelector('.form__error'),
            control = field.querySelector('.form__control'),
            controlCheked = isMultipleChoice ? field.querySelector('.form__control:checked') : null,
            controlName = control ? control.getAttribute('name') : '',
            customTypes = Object.keys(this.customValidations),
            minLength = field.dataset.minLength ? parseInt(field.dataset.minLength) : null,
            maxLength = field.dataset.maxLength ? parseInt(field.dataset.maxLength) : null;

        if (!control) this.throwError('control not found.');
        if (!controlName) this.throwError('control name not found.');
        
        if(isRequired && !control.value) {
            if (errorElement) errorElement.innerText = this.validationMessages[ controlName ] ? this.validationMessages[ controlName ].empty : this.validationMessages.default.empty;
            this.displayFieldError(control, field, errorElement);
            return false;
        }

        if(control.value) {
            if (minLength) {
                if (control.value.length < minLength) {
                    if (errorElement) errorElement.innerText = this.validationMessages.default.minLength.replace('[[var]]', minLength);
                    this.displayFieldError(control, field, errorElement);
                    return false;
                }
            }
            if (maxLength) {
                if (control.value.length > maxLength) {
                    if (errorElement) errorElement.innerText = this.validationMessages.default.maxLength.replace('[[var]]', maxLength);
                    this.displayFieldError(control, field, errorElement);
                    return false;
                }
            }
        }

        if ((isMultipleChoice && !controlCheked)) {
            if (!isRequiredIfFilled) {
                this.displayFieldError(control, field, errorElement);
                if (errorElement) errorElement.innerText = this.validationMessages[ controlName ] ? this.validationMessages[ controlName ].empty : this.validationMessages.default.empty;
                return false;
            }
        }
        else {
            // Content & Format validation
            switch (type) {
                case 'email':
                    if (control.value && !this.isValidEmail(control.value)) {
                        if (errorElement) errorElement.innerText = this.validationMessages.email.invalid;
                        this.displayFieldError(control, field, errorElement);
                        return false;
                    }
                    break;
                
                case 'password_repeat': {
                    const comparedTo = document.getElementById('password');
                    if (comparedTo && (control.value != comparedTo.value)) {
                        if (errorElement) errorElement.innerText = this.validationMessages.password_repeat.unequal;
                        this.displayFieldError(control, field, errorElement);
                        return false;
                    }
                    break;
                }

                case 'cuil':
                case 'cuit':
                    if (control.value && !this.isValidCuitCuil(control.value)) {
                        if (errorElement) errorElement.innerText = this.validationMessages.cuil.invalid;
                        this.displayFieldError(control, field, errorElement);
                        return false;
                    }
                    break;

                case 'url':
                    if (control.value && !this.isValidUrl(control.value)) {
                        if (errorElement) errorElement.innerText = this.validationMessages.url.invalid;
                        this.displayFieldError(control, field, errorElement);
                        return false;
                    }
                    break;
                
                case 'money':
                    const currency = control.dataset.currency ? control.dataset.currency : '$';
                    if (control.value == '' || control.value == currency) {
                        if (errorElement) errorElement.innerText = this.validationMessages.default.empty;
                        this.displayFieldError(control, field, errorElement);
                        return false;
                    }
                    break;
                
                case 'single-checkbox':
                    if (!control.checked) {
                        this.displayFieldError(control, field, errorElement);
                        if (errorElement) errorElement.innerText = this.validationMessages[ controlName ] ? this.validationMessages[ controlName ].empty : this.validationMessages.default.empty;
                        return false;
                    }
                    break;
                    
                default: break;
            }

            // Custom validations
            for (const customType of customTypes) {
                if (type === customType) {
                    for (const validation of this.customValidations[type]) {
                        if (!validation.condition(control.value)) {
                            if (errorElement) errorElement.innerText = validation.message || '';
                            this.displayFieldError(control, field, errorElement);
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    isValidEmail(email) {
        const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return expression.test(email.toLowerCase());
    }

    isValidCuitCuil(num) {
        const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        let digits = num.toString().split('');

        if (digits.length != 11) return false;

        digits = digits.map(digit => parseInt(digit));
        const validator = parseInt(digits.pop());

        const reduction = digits.reduce((carry, digit, index) => {
            return carry += digit * multipliers[ index ];
        }, 0);

        const modulo = reduction % 11;
        let result = 11 - modulo;
        if (result == 10) result = 9;
        if (result == 11) result = 0;

        return result == validator;
    }

    isValidUrl(urlString) {
        let urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
        '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
        return !!urlPattern.test(urlString);
    }

    isValidFileSize(field) {
        let errorMessage = null;
        const input = field.querySelector('.form__control'),
            minFileSize = parseFloat(field.dataset.minSize),
            maxFileSize = parseFloat(field.dataset.maxSize),
            errorElement = field.querySelector('.form__error'),
            fileName = input.files[0].name,
            fullFileSize = input.files[0].size,
            fileSize = parseFloat(input.files.length ? (fullFileSize / 1048576).toFixed(1) : 0); //MB

        if (fileSize > maxFileSize || !fullFileSize) {
            input.value = '';
            field.classList.remove('--has-file');
            input.setAttribute('aria-invalid', 'true');
            field.classList.add(this.classes.fieldHasError);
        }
        else if (fileName) {
            this.hasFile = true;
            field.classList.add('--has-file');
        }
        else {
            this.hasFile = false;
            field.classList.remove('--has-file');
        }

        // Set message
        if (!fullFileSize) {
            errorMessage = this.validationMessages.file.empty;
        }
        else if (fileSize < minFileSize) {
            errorMessage = this.validationMessages.file.min_size.replace('[[var]]', minFileSize + ' MB');
        }
        else if (fileSize > maxFileSize) {
            errorMessage = this.validationMessages.file.max_size.replace('[[var]]', maxFileSize + ' MB');
        }


        if (errorMessage) {
            errorElement.innerText = errorMessage;
            this.displayFieldError(input, field, errorElement);
        }
    }

    displayFieldError(control, field, errorElement) {
        control.setAttribute('aria-invalid', 'true');
        field.classList.add(this.classes.fieldHasError);
        if (this.classes.controlHasError) control.classList.add(this.classes.controlHasError);
        if (errorElement) errorElement.classList.remove(this.classes.hiddenErrorMessage);
    }

    clearControlError(control) {
        control.setAttribute('aria-invalid', 'false');
        if (this.classes.controlHasError) control.classList.remove(this.classes.controlHasError);

        const field = getParentByClassName({element: control, className: 'form__field'}),
            errorElement = field.querySelector('.form__error');
        field.classList.remove(this.classes.fieldHasError);

        if (errorElement) {
            errorElement.innerText = '';
            errorElement.classList.add(this.classes.hiddenErrorMessage);
        }
    }

    realTimeValidations(form) {
        form.querySelectorAll('.form__field[data-type="file"]')
            .forEach(field => {
                const input = field.querySelector('.form__control'); 
                input?.addEventListener('change', e => {
                    e.stopPropagation();
                    this.isValidFileSize(field);
                });
            });
    }

    throwError(msg) {
        throw new Error(`EgoForm Error: ${msg}`);
    }
}