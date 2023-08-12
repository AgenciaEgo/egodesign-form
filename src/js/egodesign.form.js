import { vanillaFade, isInViewport, getParentByClassName } from './modules/tools';
import EgoFormValidator from './modules/ValidationClass';

export default class EgoForm {
    constructor({
        element,
        classes,
        submitType,
        submitDataFormat,
        requestHeaders,
        fieldGroups,
        serializerIgnoreList,
        customValidations,
        customValidationMessages,
        onStepChange, 
        onValidationError, 
        onSubmitStart, 
        onSubmitEnd, 
        onSuccess, 
        onError,
        resetOnSuccess,
        scrollOnError,
        debug
    }) {
        this.form = element;
        this.submitType = submitType || 'fetch';
        this.submitDataFormat = submitDataFormat || 'fromData' // formData - json
        this.requestHeaders = requestHeaders || {};
        this.actionUrl = this.form.getAttribute('action');
        this.submitMethod = this.form.getAttribute('method') || 'POST';
        this.submitBtn = this.form.querySelector('button[type="submit"]') || null;
        this.classes = {
            requiredField: '--required',
            requiredIfFilledField: '--required-if-filled',
            fieldHasError: '--has-error',
            controlHasError: false,
            hiddenErrorMessage: '--hidden',
            formSubmittingState: '--submitting',
            buttonSubmittingState: '--loading',
            ...classes
        }
        this.isValid = true;
        this.validator = new EgoFormValidator({ 
            customValidations: customValidations || {},
            classes: this.classes,
            customValidationMessages: customValidationMessages || null,
        });
        this.onValidationError = onValidationError || false;
        this.onStepChange = onStepChange || false;
        this.onSubmitStart = onSubmitStart || false;
        this.onSubmitEnd = onSubmitEnd || false;
        this.onSuccess = onSuccess || false;
        this.onError = onError || false;
        this.fieldGroups = fieldGroups || false;
        this.hasFile = false;
        this.serializerIgnoreList = serializerIgnoreList || [];
        this.resetOnSuccess = resetOnSuccess || true;
        this.scrollOnError = scrollOnError || true;
        this.currentStep = this.form.querySelector('.form__step') ? parseInt(this.form.querySelector('.form__step.--active').dataset.step) : 0;
        this.currentStepOptional = false;
        this.stepChanging = false;
        this.debug = debug || false;


        this.declareHandlers();
        if (this.debug) this.showLog('initialized!');
    }

    submit() {
        if (this.debug) this.showLog(`submitting using ${this.submitType}!`);

        this.submittingForm(true);

        // Validate each required field
        this.isValid = true;
        const invalidFields = [];
        this.form.querySelectorAll(`.${this.classes.requiredField}, .${this.classes.requiredIfFilledField}`).forEach(field => {
            const fieldValid = this.validator.validateField(field);
            if (!fieldValid) {
                invalidFields.push(field.querySelector('.form__control')?.name);
                this.isValid = false;
            }
        });

        if (!this.isValid) {
            this.submittingForm(false);
            if (typeof this.onValidationError === 'function') this.onValidationError(invalidFields);
            if (this.debug) this.showLog(`this fields have failed validation: ${invalidFields.toString().replace(/,/g, ', ')}.`);

            if (this.scrollOnError) {
                const firstInvalidField = this.form.querySelector('.form__field.--has-error');
                if (!isInViewport(firstInvalidField)) firstInvalidField.scrollIntoView({behavior: 'smooth'});
            }
            if (this.debug) this.showLog(`there are invalid fields.`);
        }
        else {
            if (this.debug) {
                this.showLog(`the form was submitted!`);
                this.showLog(this.serializeData(), 'data');
                setTimeout(() => {
                    this.submittingForm(false);
                }, 1000);
            }
            else {
                if (this.submitType == 'fetch') {
                    fetch(this.actionUrl, {
                        method: this.submitMethod,
                        headers: {
                            'Content-type': this.submitDataFormat === 'json' ? 'application/json' : 'multipart/form-data',
                            ...this.requestHeaders
                        },
                        body: this.submitDataFormat === 'json' ? JSON.stringify(this.serializeData()) : this.serializeData(),
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
                        this.submittingForm(false);
                    });
                }
                else {
                    this.form.submit();
                }
            }
        }
    }

    submittingForm(submitting) {
        let body = document.getElementsByTagName('body').item(0);
        if (submitting) {
            this.form.classList.add(this.classes.formSubmittingState);
            this.submitBtn.classList.add(this.classes.buttonSubmittingState);
            body.classList.add('--block');
            if (typeof this.onSubmitStart == 'function') this.onSubmitStart();
        }
        else {
            this.form.classList.remove(this.classes.formSubmittingState);
            this.submitBtn.classList.remove(this.classes.buttonSubmittingState);
            body.classList.remove('--block');
            if (typeof this.onSubmitEnd == 'function') this.onSubmitEnd();
        }
    }

    serializeData(returnFormData = false) {
        const formData = new FormData(this.form);
        const jsonData = {};

        for (const pair of formData) {
            if (!this.serializerIgnoreList.includes(pair[0])) {
                if (pair[1] instanceof File && !pair[1].size && !pair[1].name) {
                    continue;
                } else {
                    jsonData[pair[0]] = pair[1];
                }
            }
        }

        if (this.fieldGroups) {
            for (const groupName in this.fieldGroups) {
                if (Object.hasOwnProperty.call(this.fieldGroups, groupName)) {
                    let group = [{}];
                    for (const field of this.fieldGroups[ groupName ]) {
                        group[ 0 ][ field ] = formData.get(field);
                        delete jsonData[ field ];
                    }
                    jsonData[ groupName ] = group;
                }
            }
        }
        return returnFormData ? formData : jsonData;
    }

    reset() {
        this.form.reset();
        this.form.querySelectorAll('.form__field').forEach(field => 
            field.classList.remove('--filled', '--has-error')
        );
        this.form.querySelectorAll('.form__control').forEach(field => 
            field.setAttribute('aria-invalid', 'false')
        );
        if (this.currentStep) this.changeStep(1);
    }

    changeStep(step) {
        if (!this.stepChanging) {
            const current = this.currentStepOptional ? this.currentStep + 'b' : this.currentStep,
                currentElement = this.form.querySelector('[data-step="'+ current +'"]'),
                requiredFields = currentElement.querySelectorAll(`.${this.classes.requiredField}`),
                nextStepNumber = step === 'next' ? 
                        this.currentStep + 1 
                    : step === 'prev' && !this.currentStepOptional ? 
                        this.currentStep - 1
                    : step === 'optional' ?
                        this.currentStep + 'b'
                    : this.currentStep,
                nextElement = this.form.querySelector('[data-step="'+ nextStepNumber +'"]'); 

            if (this.currentStep !== nextStepNumber || this.currentStepOptional) {
                this.stepChanging = true;
                this.isValid = true;
                
                setTimeout(() => {
                    if (requiredFields && (step === 'next' || step === 'optional')) {
                        requiredFields.forEach((field) => {
                            if (this.isValid) this.isValid = this.validator.validateField(field);
                        })
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
                                        this.currentStep = parseInt(nextStepNumber);
                                        if (typeof this.onStepChange == 'function') this.onStepChange(current, nextStepNumber);
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
        this.changeStep('next');
    }

    optionalStep() {
        this.changeStep('optional');
    }

    prevStep() {
        this.changeStep('prev');
    }

    isControlFilled(control) {
        let parent = control.parentElement;
        if(control.value !== '') {
            parent.classList.add('--filled');
        } else {
            parent.classList.remove('--filled');
        }
    }

    filterNumber(value, ignoreList = []) {
        const ignore = ignoreList.join('');
        const reg = new RegExp("[^" + ignore + "0-9]", "g");
        return value.toString().replace(reg, '');
    }

    filterFormattedQuantity(num, thousands = '.', decimals = ',', decimalSteps) {
        const sliced = decimals ? num.toString().split(decimals) : [num];
        const root = sliced[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);

        let fullNumber = '';
        if (decimalSteps > 0 && sliced[1] && sliced[1].length) {
            fullNumber = root + decimals + sliced[1].slice(0, decimalSteps);
        }
        else fullNumber = root;

        return fullNumber;
    }

    filterMoneyAmount(num, currency = '$', thousands = '.', decimals = ',', decimalSteps) {
        if (!num || num == currency) return '';
        let result = this.filterNumber(num, [decimals || '']);
        result = this.filterFormattedQuantity(result, thousands, decimals, decimalSteps);
        return `${currency} ${result}`;
    }
    
    filterPhoneNumber(value) {
        let reg = /[^\d+\-() ]*/g;
        return value.replace(reg, '');
    }

    togglePasswordVisibility(btn) {
        const input = btn.parentElement.querySelector('.form__control');
        if (input) {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            btn.classList.toggle('--hide');
        }
    }

    declareHandlers() {
        const self = this;
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', function(e) { 
                e.preventDefault();
                self.submit();
            });
        }
        else {
            throw new Error(`There's no submit button in this form "${this.form.id}".`);
        }

        this.validator.realTimeValidations(this.form);

        this.form.querySelectorAll('.form__next-step').forEach(element => {
            element.addEventListener('click', self.nextStep.bind(self));
        });

        this.form.querySelectorAll('.form__optional-step').forEach(element => {
            element.addEventListener('click', self.optionalStep.bind(self));
        });

        this.form.querySelectorAll('.form__prev-step').forEach(element => {
            element.addEventListener('click', self.prevStep.bind(self));
        });

        this.form.querySelectorAll('.form__control')
            .forEach(element => {
                this.isControlFilled(element);

                element.addEventListener('keyup', () => {
                    this.isControlFilled(element);
                });
                element.addEventListener('change', () => {
                    this.isControlFilled(element);
                });
            });
        
        this.form.querySelectorAll('.form__control')
            .forEach(element => {
                element.addEventListener('focus', () => {
                    this.validator.clearControlError(element);
                });
            });
        
        // Filter number input
        this.form.querySelectorAll('.form__field.--number input')
            .forEach(element => {
                const mainClass = this;
                const field = getParentByClassName({element: element, className: 'form__field'});
                const thousandsSep = field && field.dataset.thousandsSeparator ? field.dataset.thousandsSeparator : null;
                const decimalsSep = field && field.dataset.decimalSeparator ? field.dataset.decimalSeparator : '';
                const decimals = field && field.dataset.decimals ? field.dataset.decimals : '';

                function resetBumberField() {
                    element.value = mainClass.filterNumber(element.value, [decimalsSep]);
                }

                element.addEventListener('focus', resetBumberField);
                element.addEventListener('input', resetBumberField);
                element.addEventListener('paste', resetBumberField);
                element.addEventListener('blur', () => {
                    element.value = (thousandsSep) ?
                        mainClass.filterFormattedQuantity(element.value, thousandsSep, decimalsSep, parseInt(decimals))
                        : 
                        mainClass.filterNumber(element.value);
                });
            });
        
        // Filter money input
        this.form.querySelectorAll('.form__field.--money-amount input')
            .forEach(element => {
                const mainClass = this;
                const field = getParentByClassName({element: element, className: 'form__field'});
                const currency = field && field.dataset.currency ? field.dataset.currency : '$';
                const thousandsSep = field && field.dataset.thousandsSeparator ? field.dataset.thousandsSeparator : '.';
                const decimalsSep = field && field.dataset.decimalSeparator ? field.dataset.decimalSeparator : '';
                const decimals = field && field.dataset.decimals ? field.dataset.decimals : '';

                function resetMoneyField() {
                    element.value = mainClass.filterNumber(element.value, [decimalsSep]);
                }

                element.addEventListener('focus',resetMoneyField);
                element.addEventListener('input', resetMoneyField);
                element.addEventListener('paste', resetMoneyField);
                element.addEventListener('blur', () => {
                    element.value = this.filterMoneyAmount(element.value, currency, thousandsSep, decimalsSep, parseInt(decimals));
                });
            });

        // Filter phone input
        this.form.querySelectorAll('.form__field.--phone input')
            .forEach(element => {
                element.addEventListener('input', () => {
                    element.value = this.filterPhoneNumber(element.value);
                });
                element.addEventListener('paste', () => {
                    element.value = this.filterPhoneNumber(element.value);
                });
            });

        this.form.querySelectorAll('.form__toggle-password-visibility').forEach(element => {
            element.addEventListener('click', this.togglePasswordVisibility(element));
        });
    }

    showLog(msg, type = 'log') {
        if (type == 'log') {
            console.log('::EgoForm:: ' + msg);
        }
        else if (type == 'data') {
            console.log('::EgoForm:: DATA');
            console.table(msg);
        }
    }
}