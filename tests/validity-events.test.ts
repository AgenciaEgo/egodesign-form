import { describe, it, expect, vi, beforeEach } from 'vitest';
import EgoForm from '../src/egodesign.form.ts';

describe('EgoForm Validity Events', () => {
    describe('Single Step Form - onValidityChange', () => {
        let formElement: HTMLFormElement;
        let formInstance: EgoForm;
        let onValidityChangeMock: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            document.body.innerHTML = `
                <form id="test-form" action="/submit" method="POST">
                    <div class="form__field --required">
                        <input type="text" name="name" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <div class="form__field --required" data-type="email">
                        <input type="email" name="email" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            `;
            formElement = document.getElementById('test-form') as HTMLFormElement;
            onValidityChangeMock = vi.fn();
            formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                debug: false,
                onValidityChange: onValidityChangeMock
            });
        });

        it('should fire onValidityChange on initialization with required fields', () => {
            expect(onValidityChangeMock).toHaveBeenCalledWith(false, formInstance);
        });

        it('should fire onValidityChange when form becomes valid', async () => {
            onValidityChangeMock.mockClear();

            const nameField = formElement.querySelector('input[name="name"]') as HTMLInputElement;
            const emailField = formElement.querySelector('input[name="email"]') as HTMLInputElement;

            nameField.value = 'John Doe';
            emailField.value = 'john@example.com';

            await formInstance.validateAllFields();

            expect(onValidityChangeMock).toHaveBeenCalledWith(true, formInstance);
        });

        it('should not fire onValidityChange when validation fails on submit if already invalid', async () => {
            onValidityChangeMock.mockClear();

            // Form is already invalid from initialization
            const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
            submitButton.click();

            await vi.waitFor(() => {
                // Should not fire because validity didn't change (was invalid, still invalid)
                expect(onValidityChangeMock).not.toHaveBeenCalled();
            });
        });

        it('should not fire onValidityChange if validity does not change', async () => {
            onValidityChangeMock.mockClear();

            // Form is already invalid
            await formInstance.validateAllFields();

            expect(onValidityChangeMock).not.toHaveBeenCalled();
        });

        it('should fire onValidityChange on blur validation', async () => {
            const formWithBlurValidation = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                debug: false,
                onValidityChange: onValidityChangeMock
            });

            // Add validate-onblur class
            const nameFieldContainer = formElement.querySelector('.form__field') as HTMLElement;
            nameFieldContainer.classList.add('--validate-onblur');
            formWithBlurValidation.refresh();

            onValidityChangeMock.mockClear();

            const nameField = formElement.querySelector('input[name="name"]') as HTMLInputElement;
            const emailField = formElement.querySelector('input[name="email"]') as HTMLInputElement;

            nameField.value = 'John Doe';
            emailField.value = 'john@example.com';

            // Trigger blur event
            const blurEvent = new Event('blur');
            nameField.dispatchEvent(blurEvent);

            await vi.waitFor(() => {
                expect(onValidityChangeMock).toHaveBeenCalled();
            });
        });
    });

    describe('Multi-Step Form - onCurrentStepValidityChange', () => {
        let formElement: HTMLFormElement;
        let formInstance: EgoForm;
        let onCurrentStepValidityChangeMock: ReturnType<typeof vi.fn>;
        let onValidityChangeMock: ReturnType<typeof vi.fn>;

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
                    </fieldset>
                    <button type="submit">Submit</button>
                </form>
            `;
            formElement = document.getElementById('testForm') as HTMLFormElement;
            onCurrentStepValidityChangeMock = vi.fn();
            onValidityChangeMock = vi.fn();
            formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                disbleStepsTransition: true,
                debug: false,
                onCurrentStepValidityChange: onCurrentStepValidityChangeMock,
                onValidityChange: onValidityChangeMock
            });
        });

        it('should fire onCurrentStepValidityChange on initialization', () => {
            expect(onCurrentStepValidityChangeMock).toHaveBeenCalledWith(false, 1, formInstance);
        });

        it('should fire onCurrentStepValidityChange when moving to next step with valid field', async () => {
            onCurrentStepValidityChangeMock.mockClear();

            const step1Field = formElement.querySelector('input[name="step1"]') as HTMLInputElement;
            step1Field.value = 'Step 1 Value';

            await formInstance.nextStep();

            expect(onCurrentStepValidityChangeMock).toHaveBeenCalledWith(true, 1, formInstance);
        });

        it('should fire onCurrentStepValidityChange with correct step number', async () => {
            onCurrentStepValidityChangeMock.mockClear();

            const step1Field = formElement.querySelector('input[name="step1"]') as HTMLInputElement;
            step1Field.value = 'Step 1 Value';

            await formInstance.nextStep();

            expect(formInstance.currentStep).toBe(2);
            expect(onCurrentStepValidityChangeMock).toHaveBeenCalledWith(true, 1, formInstance);
        });

        it('should not fire onCurrentStepValidityChange when validation fails if already invalid', async () => {
            onCurrentStepValidityChangeMock.mockClear();

            // Try to move to next step without filling required field
            // Form is already invalid from initialization
            await formInstance.nextStep();

            // Should not fire because validity didn't change (was invalid, still invalid)
            expect(onCurrentStepValidityChangeMock).not.toHaveBeenCalled();
            expect(formInstance.currentStep).toBe(1); // Should remain on step 1
        });

        it('should not fire onCurrentStepValidityChange if validity does not change', async () => {
            onCurrentStepValidityChangeMock.mockClear();

            // Try to move twice without filling - both times invalid
            await formInstance.nextStep();
            onCurrentStepValidityChangeMock.mockClear();

            await formInstance.nextStep();
            expect(onCurrentStepValidityChangeMock).not.toHaveBeenCalled();
        });

        it('should fire both events when step becomes valid but form is still invalid', async () => {
            onCurrentStepValidityChangeMock.mockClear();
            onValidityChangeMock.mockClear();

            const step1Field = formElement.querySelector('input[name="step1"]') as HTMLInputElement;
            step1Field.value = 'Step 1 Value';

            await formInstance.nextStep();

            // Current step validity should change from invalid to valid
            expect(onCurrentStepValidityChangeMock).toHaveBeenCalledWith(true, 1, formInstance);
            // Full form validity doesn't change (still invalid because step 2 and 3 are empty)
            // So onValidityChange should not be called
            expect(onValidityChangeMock).not.toHaveBeenCalled();
        });
    });

    describe('Multi-Step Form - Full Form Validity vs Current Step Validity', () => {
        let formElement: HTMLFormElement;
        let formInstance: EgoForm;
        let onValidityChangeMock: ReturnType<typeof vi.fn>;
        let onCurrentStepValidityChangeMock: ReturnType<typeof vi.fn>;

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
                    </fieldset>
                    <button type="submit">Submit</button>
                </form>
            `;
            formElement = document.getElementById('testForm') as HTMLFormElement;
            onValidityChangeMock = vi.fn();
            onCurrentStepValidityChangeMock = vi.fn();
            formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                disbleStepsTransition: true,
                debug: false,
                onValidityChange: onValidityChangeMock,
                onCurrentStepValidityChange: onCurrentStepValidityChangeMock
            });
        });

        it('should have current step valid but full form invalid when only first step is filled', async () => {
            onCurrentStepValidityChangeMock.mockClear();
            onValidityChangeMock.mockClear();

            const step1Field = formElement.querySelector('input[name="step1"]') as HTMLInputElement;
            step1Field.value = 'Step 1 Value';

            await formInstance.nextStep();

            // Current step should be valid
            expect(formInstance.isCurrentStepValid).toBe(true);
            expect(onCurrentStepValidityChangeMock).toHaveBeenCalledWith(true, 1, formInstance);

            // But full form should be invalid (step 2 is not filled)
            expect(formInstance.isValid).toBe(false);
        });

        it('should have both valid when all fields are filled', async () => {
            const step1Field = formElement.querySelector('input[name="step1"]') as HTMLInputElement;
            const step2Field = formElement.querySelector('input[name="step2"]') as HTMLInputElement;

            step1Field.value = 'Step 1 Value';
            step2Field.value = 'Step 2 Value';

            await formInstance.validateAllFields();

            expect(formInstance.isValid).toBe(true);
            expect(onValidityChangeMock).toHaveBeenCalledWith(true, formInstance);
        });

        it('should track both validities independently during submission', async () => {
            onValidityChangeMock.mockClear();
            onCurrentStepValidityChangeMock.mockClear();

            const step1Field = formElement.querySelector('input[name="step1"]') as HTMLInputElement;
            step1Field.value = 'Step 1 Value';

            // Move to step 2 (step 1 is now valid)
            await formInstance.nextStep();
            expect(formInstance.currentStep).toBe(2);

            // Submit from step 2 (step 2 is empty)
            formInstance.submit();

            await vi.waitFor(() => {
                // Current step (up to highest visited) should be invalid
                expect(formInstance.isCurrentStepValid).toBe(false);
                // Full form should also be invalid
                expect(formInstance.isValid).toBe(false);
            });
        });
    });

    describe('Silent Validation', () => {
        it('should not display errors on unvisited fields when validating all fields', async () => {
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
                        <div class="form__field --required" data-type="email">
                            <input type="email" name="step2" class="form__control" />
                            <p class="form__error"></p>
                        </div>
                        <button type="button" class="form__prev-step">Prev</button>
                    </fieldset>
                    <button type="submit">Submit</button>
                </form>
            `;

            const formElement = document.getElementById('testForm') as HTMLFormElement;
            const formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                disbleStepsTransition: true,
                debug: false
            });

            // Fill step 1 and move to step 2
            const step1Field = formElement.querySelector('input[name="step1"]') as HTMLInputElement;
            step1Field.value = 'Step 1 Value';
            await formInstance.nextStep();

            expect(formInstance.currentStep).toBe(2);

            // Validate all fields (should be silent for unvisited fields)
            await formInstance.validateAllFields();

            // Step 2 field should NOT have error class (silent validation)
            const step2FieldContainer = formElement.querySelector('.form__step[data-step="2"] .form__field') as HTMLElement;
            expect(step2FieldContainer.classList.contains('--has-error')).toBe(false);

            // Form should be invalid overall
            expect(formInstance.isValid).toBe(false);
        });

        it('should display errors on visited fields when validating', async () => {
            document.body.innerHTML = `
                <form id="testForm" action="/submit" method="POST">
                    <fieldset class="form__step --active" data-step="1">
                        <div class="form__field --required">
                            <input type="text" name="step1" class="form__control" />
                            <p class="form__error"></p>
                        </div>
                        <button type="button" class="form__next-step">Next</button>
                    </fieldset>
                    <button type="submit">Submit</button>
                </form>
            `;

            const formElement = document.getElementById('testForm') as HTMLFormElement;
            const formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                debug: false
            });

            // Try to submit without filling (should show errors)
            formInstance.submit();

            await vi.waitFor(() => {
                const step1FieldContainer = formElement.querySelector('.form__field') as HTMLElement;
                expect(step1FieldContainer.classList.contains('--has-error')).toBe(true);
            });
        });
    });

    describe('Required-If-Filled with Custom Validations', () => {
        it('should not run custom validation on empty required-if-filled field', async () => {
            const customValidationMock = vi.fn().mockResolvedValue(true);

            document.body.innerHTML = `
                <form id="testForm" action="/submit" method="POST">
                    <div class="form__field --required-if-filled" data-type="customType">
                        <input type="text" name="optional" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            `;

            const formElement = document.getElementById('testForm') as HTMLFormElement;
            const formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                debug: false,
                customValidations: {
                    customType: [{
                        name: 'test',
                        condition: customValidationMock,
                        message: 'Custom validation failed'
                    }]
                }
            });

            // Field is empty, should not run custom validation
            await formInstance.validateAllFields();

            expect(customValidationMock).not.toHaveBeenCalled();
            expect(formInstance.isValid).toBe(true);
        });

        it('should run custom validation on filled required-if-filled field', async () => {
            const customValidationMock = vi.fn().mockResolvedValue(false);

            document.body.innerHTML = `
                <form id="testForm" action="/submit" method="POST">
                    <div class="form__field --required-if-filled" data-type="customType">
                        <input type="text" name="optional" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            `;

            const formElement = document.getElementById('testForm') as HTMLFormElement;
            const formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                debug: false,
                customValidations: {
                    customType: [{
                        name: 'test',
                        condition: customValidationMock,
                        message: 'Custom validation failed'
                    }]
                }
            });

            const optionalField = formElement.querySelector('input[name="optional"]') as HTMLInputElement;
            optionalField.value = 'some value';

            // Field has value, should run custom validation
            await formInstance.validateAllFields();

            expect(customValidationMock).toHaveBeenCalledWith('some value', 'optional');
            expect(formInstance.isValid).toBe(false);
        });

        it('should not show errors in silent mode for required-if-filled with custom validation', async () => {
            const customValidationMock = vi.fn().mockResolvedValue(false);

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
                        <div class="form__field --required-if-filled" data-type="coupon">
                            <input type="text" name="coupon" class="form__control" />
                            <p class="form__error"></p>
                        </div>
                    </fieldset>
                    <button type="submit">Submit</button>
                </form>
            `;

            const formElement = document.getElementById('testForm') as HTMLFormElement;
            const formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                disbleStepsTransition: true,
                debug: false,
                customValidations: {
                    coupon: [{
                        name: 'validate',
                        condition: customValidationMock,
                        message: 'Invalid coupon'
                    }]
                }
            });

            // Fill step 1 and move to step 2
            const step1Field = formElement.querySelector('input[name="step1"]') as HTMLInputElement;
            step1Field.value = 'Step 1';

            // Fill the coupon field with invalid value
            const couponField = formElement.querySelector('input[name="coupon"]') as HTMLInputElement;
            couponField.value = 'INVALID';

            await formInstance.nextStep();

            // validateAllFields runs silently, should not show error on coupon field
            const couponFieldContainer = formElement.querySelector('.form__step[data-step="2"] .form__field') as HTMLElement;
            expect(couponFieldContainer.classList.contains('--has-error')).toBe(false);

            // But form should know it's invalid
            expect(formInstance.isValid).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle form with no required fields', () => {
            document.body.innerHTML = `
                <form id="test-form" action="/submit" method="POST">
                    <div class="form__field">
                        <input type="text" name="optional" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            `;

            const formElement = document.getElementById('test-form') as HTMLFormElement;
            const onValidityChangeMock = vi.fn();

            const formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                debug: false,
                onValidityChange: onValidityChangeMock
            });

            // Should not fire since form starts as valid
            expect(onValidityChangeMock).not.toHaveBeenCalled();
            expect(formInstance.isValid).toBe(true);
        });

        it('should handle multiple validity changes correctly', async () => {
            document.body.innerHTML = `
                <form id="test-form" action="/submit" method="POST">
                    <div class="form__field --required">
                        <input type="text" name="name" class="form__control" />
                        <p class="form__error"></p>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            `;

            const formElement = document.getElementById('test-form') as HTMLFormElement;
            const onValidityChangeMock = vi.fn();

            const formInstance = new EgoForm({
                element: formElement,
                submitType: 'fetch',
                debug: false,
                onValidityChange: onValidityChangeMock
            });

            onValidityChangeMock.mockClear();

            const nameField = formElement.querySelector('input[name="name"]') as HTMLInputElement;

            // Make valid
            nameField.value = 'John';
            await formInstance.validateAllFields();
            expect(onValidityChangeMock).toHaveBeenCalledTimes(1);
            expect(onValidityChangeMock).toHaveBeenLastCalledWith(true, formInstance);

            // Make invalid
            nameField.value = '';
            await formInstance.validateAllFields();
            expect(onValidityChangeMock).toHaveBeenCalledTimes(2);
            expect(onValidityChangeMock).toHaveBeenLastCalledWith(false, formInstance);

            // Make valid again
            nameField.value = 'Jane';
            await formInstance.validateAllFields();
            expect(onValidityChangeMock).toHaveBeenCalledTimes(3);
            expect(onValidityChangeMock).toHaveBeenLastCalledWith(true, formInstance);
        });
    });
});
