import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EgoForm from '../src/egodesign.form.ts';

window.HTMLElement.prototype.scrollIntoView = function () { };

describe('EgoForm filters', () => {
    let formElement: HTMLFormElement;
    let formInstance: EgoForm;

    beforeEach(() => {
        document.body.innerHTML = `
            <form id="test-form" action="/submit" method="POST">
                <div class="form__field --required">
                    <input type="text" name="name" class="form__control" />
                    <p class="form__error"></p>
                </div>
                <button type="submit">Submit</button>
            </form>
        `;
        formElement = document.getElementById('test-form') as HTMLFormElement;
        formInstance = new EgoForm({
            element: formElement,
            debug: false,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should filter number input', () => {
        expect(formInstance.filterNumber({ value: '123abc456' })).toBe('123456');
    });

    it('should filter formatted quantity', () => {
        expect(formInstance.filterFormattedQuantity({ num: '1234567 ', thousands: '.', decimals: ',' })).toBe('1.234.567');
    });

    it('should filter money amount', () => {
        expect(formInstance.filterMoneyAmount({ num: '1234567', currency: '$', thousands: '.', decimals: ',' })).toBe('$ 1.234.567');
    });

    it('should filter phone number', () => {
        expect(formInstance.filterPhoneNumber({ number: '+1 (123) 456-7890 abc' })).toBe('+1 (123) 456-7890');
    });
});