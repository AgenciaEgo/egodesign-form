/**
 * @jest-environment jsdom
*/
const EgoForm = require('../dist/js/egodesign.form.cjs.min.js');

describe('EgoForm', () => {
    let testForm;
    let mockFormElement;
    let mockSubmitBtn;
    let mockCallback;
    
    beforeEach(() => {
        mockFormElement = document.createElement('form');
        mockFormElement.setAttribute('action', '/submit-url');
        mockSubmitBtn = document.createElement('button');
        mockSubmitBtn.type = 'submit';
        mockFormElement.appendChild(mockSubmitBtn);
        mockCallback = jest.fn();
    
        testForm = new EgoForm({
            element: mockFormElement,
            onValidationError: mockCallback,
        });
    });

    it('should be an instance of EgoForm', () => {
        expect(testForm).toBeInstanceOf(EgoForm);
    });

    it('should set the form element on the instance', () => {
        expect(testForm.form).toBe(mockFormElement);
    });

    it('should set the action url from the form element attribute', () => {
        expect(testForm.actionUrl).toBe('/submit-url');
    });
});