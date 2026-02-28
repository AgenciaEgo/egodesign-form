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
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);
    });

    it('should move to the previous step when prevStep is called', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon Doe';
        await formInstance.nextStep();
        await formInstance.prevStep();
        expect(formInstance.currentStep).toBe(1);
    });

    it('should move to the optional step when optionalStep is called', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        await formInstance.nextStep();
        const lastnameField = document.querySelector('.form__control[name="lastname"]') as HTMLInputElement;
        lastnameField.value = 'Doe';
        await formInstance.optionalStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.currentStepOptional).toBe(true);
    });

    it('should prevent step change if validation fails', async () => {
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(1);
    });

    it('should trigger onStepChange callback when step changes', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        await formInstance.nextStep();
        expect(formInstance.onStepChange).toHaveBeenCalled();
    });

    it('should correctly handle optional steps', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        await formInstance.nextStep();
        const lastnameField = document.querySelector('.form__control[name="lastname"]') as HTMLInputElement;
        lastnameField.value = 'Doe';
        await formInstance.optionalStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.currentStepOptional).toBe(true);
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(3);
    });

    it('should avoid optional steps if ignored', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        await formInstance.nextStep();
        const lastnameField = document.querySelector('.form__control[name="lastname"]') as HTMLInputElement;
        lastnameField.value = 'Doe';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(3);
    });

    it('should prevent multiple step changes at the same time', async () => {
        formInstance.stepChanging = true;
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(1);
    });

    it('should handle prevStep correctly when in an optional step', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'Jhon';
        await formInstance.nextStep();
        const lastnameField = document.querySelector('.form__control[name="lastname"]') as HTMLInputElement;
        lastnameField.value = 'Doe';
        await formInstance.optionalStep();
        await formInstance.prevStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.currentStepOptional).toBe(false);
    });
});

describe('EgoForm --required-if-filled Validation in Multi-step Forms', () => {
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
                    <div class="form__field --required-if-filled" data-type="email">
                        <input type="email" name="email" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="button" class="form__prev-step">Prev</button>
                    <button type="button" class="form__next-step">Next</button>
                </fieldset>
                <fieldset class="form__step" data-step="3">
                    <div class="form__field --required">
                        <input type="text" name="confirmation" class="form__control" />
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

    it('should not validate empty --required-if-filled fields when moving forward', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);

        // Email field is empty and --required-if-filled, should allow moving to next step
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(3);
    });

    it('should validate filled --required-if-filled fields when moving forward', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);

        // Fill email field with invalid email
        const emailField = document.querySelector('.form__control[name="email"]') as HTMLInputElement;
        emailField.value = 'invalid-email';

        // Should not move to next step because email is invalid
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.onValidationError).toHaveBeenCalled();
    });

    it('should not validate empty --required-if-filled fields when going back', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);

        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(3);

        // Go back to step 2, email field is still empty and --required-if-filled
        await formInstance.prevStep();
        expect(formInstance.currentStep).toBe(2);
    });

    it('should validate filled --required-if-filled fields with correct value when moving forward', async () => {
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);

        // Fill email field with valid email
        const emailField = document.querySelector('.form__control[name="email"]') as HTMLInputElement;
        emailField.value = 'test@example.com';

        // Should move to next step because email is valid
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(3);
    });
});

describe('EgoForm onBeforeStepChange', () => {
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
                    <button type="button" class="form__next-step">Next</button>
                </fieldset>
                <fieldset class="form__step" data-step="3">
                    <button type="button" class="form__prev-step">Prev</button>
                </fieldset>
                <button type="submit">Submit</button>
            </form>
        `;
        formElement = document.getElementById('testForm') as HTMLFormElement;
    });

    it('should allow step change when onBeforeStepChange returns true', async () => {
        formInstance = new EgoForm({
            element: formElement,
            submitType: 'fetch',
            disbleStepsTransition: true,
            onBeforeStepChange: () => true,
        });
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);
    });

    it('should block next step when onBeforeStepChange returns false', async () => {
        formInstance = new EgoForm({
            element: formElement,
            submitType: 'fetch',
            disbleStepsTransition: true,
            onBeforeStepChange: () => false,
        });
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(1);
    });

    it('should block prev step when onBeforeStepChange returns false', async () => {
        formInstance = new EgoForm({
            element: formElement,
            submitType: 'fetch',
            disbleStepsTransition: true,
            onBeforeStepChange: vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false),
        });
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);
        await formInstance.prevStep();
        expect(formInstance.currentStep).toBe(2);
    });

    it('should receive current and next step numbers as strings', async () => {
        const callback = vi.fn().mockReturnValue(true);
        formInstance = new EgoForm({
            element: formElement,
            submitType: 'fetch',
            disbleStepsTransition: true,
            onBeforeStepChange: callback,
        });
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(callback).toHaveBeenCalledWith('1', '2', formInstance);
    });

    it('should not block step change when onBeforeStepChange is not set', async () => {
        formInstance = new EgoForm({
            element: formElement,
            submitType: 'fetch',
            disbleStepsTransition: true,
        });
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);
    });

    it('should reset stepChanging flag when blocked', async () => {
        formInstance = new EgoForm({
            element: formElement,
            submitType: 'fetch',
            disbleStepsTransition: true,
            onBeforeStepChange: () => false,
        });
        const nameField = document.querySelector('.form__control[name="name"]') as HTMLInputElement;
        nameField.value = 'John';
        await formInstance.nextStep();
        expect(formInstance.stepChanging).toBe(false);
    });
});

describe('EgoForm Highest Visited Step Tracking', () => {
    let formElement: HTMLFormElement;
    let formInstance: EgoForm;

    beforeEach(() => {
        document.body.innerHTML = `
            <form id="testForm" action="/submit" method="POST">
                <fieldset class="form__step --active" data-step="1">
                    <div class="form__field --required">
                        <input type="text" name="step1" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="button" class="form__next-step">Next</button>
                </fieldset>
                <fieldset class="form__step" data-step="2">
                    <div class="form__field --required">
                        <input type="text" name="step2" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="button" class="form__prev-step">Prev</button>
                    <button type="button" class="form__next-step">Next</button>
                </fieldset>
                <fieldset class="form__step" data-step="3">
                    <div class="form__field --required">
                        <input type="text" name="step3" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="button" class="form__prev-step">Prev</button>
                    <button type="button" class="form__next-step">Next</button>
                </fieldset>
                <fieldset class="form__step" data-step="4">
                    <div class="form__field --required">
                        <input type="text" name="step4" class="form__control" />
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

    it('should initialize highestVisitedStep to currentStep', () => {
        expect(formInstance.highestVisitedStep).toBe(1);
        expect(formInstance.currentStep).toBe(1);
    });

    it('should update highestVisitedStep when moving forward', async () => {
        const step1Field = document.querySelector('.form__control[name="step1"]') as HTMLInputElement;
        step1Field.value = 'Step 1';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.highestVisitedStep).toBe(2);

        const step2Field = document.querySelector('.form__control[name="step2"]') as HTMLInputElement;
        step2Field.value = 'Step 2';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(3);
        expect(formInstance.highestVisitedStep).toBe(3);
    });

    it('should not update highestVisitedStep when going back', async () => {
        const step1Field = document.querySelector('.form__control[name="step1"]') as HTMLInputElement;
        step1Field.value = 'Step 1';
        await formInstance.nextStep();

        const step2Field = document.querySelector('.form__control[name="step2"]') as HTMLInputElement;
        step2Field.value = 'Step 2';
        await formInstance.nextStep();
        expect(formInstance.highestVisitedStep).toBe(3);

        await formInstance.prevStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.highestVisitedStep).toBe(3);

        await formInstance.prevStep();
        expect(formInstance.currentStep).toBe(1);
        expect(formInstance.highestVisitedStep).toBe(3);
    });

    it('should only validate fields up to highestVisitedStep on submit', async () => {
        // Move to step 2
        const step1Field = document.querySelector('.form__control[name="step1"]') as HTMLInputElement;
        step1Field.value = 'Step 1';
        await formInstance.nextStep();
        expect(formInstance.currentStep).toBe(2);
        expect(formInstance.highestVisitedStep).toBe(2);

        // Go back to step 1
        await formInstance.prevStep();
        expect(formInstance.currentStep).toBe(1);

        // Submit - should only validate steps 1 and 2, not 3 and 4
        formInstance.submit();

        // Wait for async validation to complete
        await new Promise(resolve => setTimeout(resolve, 10));

        // Step2 field is empty, so validation should fail
        expect(formInstance.isValid).toBe(false);
        expect(formInstance.onValidationError).toHaveBeenCalledWith(['step2'], formInstance);
    });

    it('should validate all visited steps even when going back', async () => {
        // Navigate through steps
        const step1Field = document.querySelector('.form__control[name="step1"]') as HTMLInputElement;
        step1Field.value = 'Step 1';
        await formInstance.nextStep();

        const step2Field = document.querySelector('.form__control[name="step2"]') as HTMLInputElement;
        step2Field.value = 'Step 2';
        await formInstance.nextStep();
        expect(formInstance.highestVisitedStep).toBe(3);

        // Go back to step 2
        await formInstance.prevStep();

        // Clear step2 field
        step2Field.value = '';

        // Submit - should validate steps 1, 2, and 3 (all visited)
        formInstance.submit();

        // Wait for async validation to complete
        await new Promise(resolve => setTimeout(resolve, 10));

        // Should fail because step2 and step3 are empty
        expect(formInstance.isValid).toBe(false);
    });

    it('should reset highestVisitedStep when form is reset', async () => {
        const step1Field = document.querySelector('.form__control[name="step1"]') as HTMLInputElement;
        step1Field.value = 'Step 1';
        await formInstance.nextStep();

        const step2Field = document.querySelector('.form__control[name="step2"]') as HTMLInputElement;
        step2Field.value = 'Step 2';
        await formInstance.nextStep();
        expect(formInstance.highestVisitedStep).toBe(3);

        formInstance.reset();

        // Wait for async changeStep to complete
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(formInstance.currentStep).toBe(1);
        expect(formInstance.highestVisitedStep).toBe(1);
    });
});