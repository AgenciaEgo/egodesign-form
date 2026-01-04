import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EgoForm from '../src/egodesign.form.ts';

window.HTMLElement.prototype.scrollIntoView = function () { };

describe('EgoForm', () => {
    let formElement: HTMLFormElement;
    let nameControl: HTMLInputElement;
    let emailControl: HTMLInputElement;
    let submitButton: HTMLButtonElement;
    let toggleButton: HTMLButtonElement;
    let formInstance: EgoForm;

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
                <div class="form__field">
                    <input type="password" name="password" class="form__control" />
                    <button type="button" class="form__toggle-password-visibility">Toggle</button>
                </div>
                <button type="submit">Submit</button>
            </form>
        `;
        formElement = document.getElementById('test-form') as HTMLFormElement;
        nameControl = formElement.querySelector('input[name="name"]') as HTMLInputElement;
        emailControl = formElement.querySelector('input[name="email"]') as HTMLInputElement;
        toggleButton = formElement.querySelector('.form__toggle-password-visibility') as HTMLButtonElement;
        submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
        formInstance = new EgoForm({
            element: formElement,
            submitType: 'fetch',
            debug: false,
            onValidationError: vi.fn(),
            onSuccess: vi.fn(),
            onError: vi.fn()
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize correctly', () => {
        expect(formInstance.form).toBe(formElement);
        expect(formInstance.submitBtn).toBe(submitButton);
        expect(formInstance.actionUrl).toBe('/submit');
        expect(formInstance.submitMethod).toBe('POST');
        expect(formInstance.isValid).toBe(false); // false because form has required fields that are empty
        expect(formInstance.currentStep).toBe(0);
    });

    it('should call submit when submit button is clicked', () => {
        const submitSpy = vi.spyOn(formInstance, 'submit');
        submitButton.click();
        expect(submitSpy).toHaveBeenCalled();
    });

    it('should validate fields on submit', async () => {
        const validateFieldSpy = vi.spyOn(formInstance.validator, 'validateField');
        submitButton.click();
        // Fields are validated twice: once for current step validity, once for full form validity
        await vi.waitFor(() => expect(validateFieldSpy).toHaveBeenCalledTimes(6));
    });

    it('should set isValid to false if validation fails', async () => {
        submitButton.click();
        await vi.waitFor(() => expect(formInstance.isValid).toBe(false));
    });

    it('should call onValidationError if validation fails', async () => {
        submitButton.click();
        await vi.waitFor(() => expect(formInstance.onValidationError).toHaveBeenCalled());
    });

    describe('Specific Test Group', () => {
        beforeEach(() => {
            nameControl.value = 'John Doe';
            emailControl.value = 'rXy0M@example.com';
        });

        it('should call fetch on successful submit', async () => {
            const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: () => Promise.resolve({}) });
            vi.stubGlobal('fetch', fetchMock);
            submitButton.click();
            await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
        });

        it('should call onSuccess on successful fetch', async () => {
            const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: () => Promise.resolve({}) });
            vi.stubGlobal('fetch', fetchMock);
            formInstance.resumeSubmit();
            await vi.waitFor(() => expect(formInstance.onSuccess).toHaveBeenCalled());
        });

        it('should call onError on failed fetch', async () => {
            const fetchMock = vi.fn().mockResolvedValue({ status: 500, json: () => Promise.resolve({}) });
            vi.stubGlobal('fetch', fetchMock);
            formInstance.submit();
            await vi.waitFor(() => expect(formInstance.onError).toHaveBeenCalled());
        });

        it('should serialize form data', () => {
            const serializedData = formInstance.serializeData({ returnFormData: false });
            expect(serializedData).toBe('{"name":"John Doe","email":"rXy0M@example.com","password":""}');
        });

        it('should reset the form', () => {
            formInstance.reset();
            expect(nameControl.value).toBe('');
            expect(emailControl.value).toBe('');
        });

        it('should toggle password visibility', () => {
            toggleButton.click();
            expect(formElement.querySelector('input[name="password"]')?.getAttribute('type')).toBe('text');
        });
    });
});