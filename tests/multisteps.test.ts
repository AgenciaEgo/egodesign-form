import { describe, it, expect, beforeEach, vi } from 'vitest';
import EgoForm from '../src/egodesign.form.ts';

describe('EgoForm Multistep Functionality', () => {
    let formElement: HTMLFormElement;
    let formInstance: EgoForm;

    beforeEach(() => {
        document.body.innerHTML = `
            <form id="testForm" action="/submit" method="POST">
                <fieldset class="form__step --active" data-step="1">
                    <div class="form__field --required">
                        <input type="text" name="name" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="button" class="form__next-step">Next</button>
                </fieldset>
                <fieldset class="form__step" data-step="2">
                    <div class="form__field --required">
                        <input type="text" name="lastname" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="button" class="form__prev-step">Prev</button>
                    <button type="button" class="form__optional-step">Optional</button>
                    <button type="button" class="form__next-step">Next</button>
                </fieldset>
                <fieldset class="form__step" data-step="2b">
                    <div class="form__field">
                        <input type="text" name="optional" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="button" class="form__prev-step">Prev</button>
                    <button type="button" class="form__next-step">Next</button>
                </fieldset>
                <fieldset class="form__step" data-step="3">
                    <div class="form__field --required" data-type="email">
                        <input type="email" name="email" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="button" class="form__prev-step">Prev</button>
                </fieldset>
                <button type="submit">Submit</button>
            </form>
        `;
        formElement = document.getElementById('testForm') as HTMLFormElement;
        formInstance = new EgoForm({
            element: formElement,
            submitType: 'fetch',
            disbleStepsTransition: true,
            debug: false,
            onStepChange: vi.fn(),
            onValidationError: vi.fn(),
            onSuccess: vi.fn(),
            onError: vi.fn()
        });
    });

    it('should initialize with the correct current step', () => {
        expect(formInstance.currentStep).toBe(1);
    });

    it('should move to the next step when nextStep is called', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon Doe';
        formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);
    });

    it('should move to the previous step when prevStep is called', () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon Doe';
        formInstance.nextStep();
        formInstance.prevStep();
        expect(formInstance.currentStep).toBe(1);
    });

    it('should move to the optional step when optionalStep is called', () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        formInstance.nextStep();
        const lastnameField = document.querySelector('.form__control[name="lastname"]') as HTMLInputElement;
        lastnameField.value = 'Doe';
        formInstance.optionalStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.currentStepOptional).toBe(true);
    });

    it('should prevent step change if validation fails', () => {
        formInstance.nextStep();
        expect(formInstance.currentStep).toBe(1);
    });

    it('should trigger onStepChange callback when step changes', () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        formInstance.nextStep();
        expect(formInstance.onStepChange).toHaveBeenCalled();
    });

    it('should correctly handle optional steps', () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        formInstance.nextStep();
        const lastnameField = document.querySelector('.form__control[name="lastname"]') as HTMLInputElement;
        lastnameField.value = 'Doe';
        formInstance.optionalStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.currentStepOptional).toBe(true);
        formInstance.nextStep();
        expect(formInstance.currentStep).toBe(3);
    });

    it('should avoid optional steps if ignored', () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        formInstance.nextStep();
        const lastnameField = document.querySelector('.form__control[name="lastname"]') as HTMLInputElement;
        lastnameField.value = 'Doe';
        formInstance.nextStep();
        expect(formInstance.currentStep).toBe(3);
    });

    it('should prevent multiple step changes at the same time', () => {
        formInstance.stepChanging = true;
        formInstance.nextStep();
        expect(formInstance.currentStep).toBe(1);
    });

    it('should handle prevStep correctly when in an optional step', () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        formInstance.nextStep();
        const lastnameField = document.querySelector('.form__control[name="lastname"]') as HTMLInputElement;
        lastnameField.value = 'Doe';
        formInstance.optionalStep();
        formInstance.prevStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.currentStepOptional).toBe(false);
    });
});