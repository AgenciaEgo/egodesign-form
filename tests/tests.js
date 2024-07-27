describe('EgoForm', () => {
  let testForm;
  let mockFormElement;
  let mockSubmitBtn;
  
  beforeEach(() => {
    mockFormElement = document.createElement('form');
    mockSubmitBtn = document.createElement('button');
    mockSubmitBtn.type = 'submit';
    mockFormElement.appendChild(mockSubmitBtn);
    mockCallback = jest.fn();

    testForm = new EgoForm({
      element: mockFormElement,
      onValidationError: mockCallback,
    });
  });
  
  it('should construct an EgoForm instance', () => {
    expect(testForm).toBeInstanceOf(EgoForm);
  });
  
  it('should set the form element on the instance', () => {
    expect(testForm.form).toBe(mockFormElement);
  });
  
  it('should set the submit type to fetch by default', () => {
    expect(testForm.submitType).toBe('fetch');
  });
  
  it('should set the submit data format to formData by default', () => {
    expect(testForm.submitDataFormat).toBe('formData');
  });
  
  it('should set the action url from the form element attribute', () => {
    mockFormElement.setAttribute('action', '/submit-url');
    expect(testForm.actionUrl).toBe('/submit-url');
  });
  
  it('should set the submit method from the form element attribute', () => {
    mockFormElement.setAttribute('method', 'POST');
    expect(testForm.submitMethod).toBe('POST');
  });
  
  it('should find the submit button from the form element', () => {
    expect(testForm.submitBtn).toBe(mockSubmitBtn);
  });
  
  it('should set default classes on the instance', () => {
    expect(testForm.classes).toEqual({
      requiredField: '--required',
      requiredIfFilledField: '--required-if-filled',
      fieldHasError: '--has-error',
      controlHasError: false,
      hiddenErrorMessage: '--hidden',
      formSubmittingState: '--submitting',
      buttonSubmittingState: '--loading',
      clearFieldError: '--clear-error',
      validateOnBlur: '--validate-onblur',
    });
  });
  
  it('should set isvalid to true by default', () => {
    expect(testForm.isValid).toBe(true);
  });
  
  it('should create a new EgoFormValidator instance', () => {
    expect(testForm.validator instanceof EgoFormValidator).toBe(true);
  });
  
  it('should set onValidationError callback based on argument', () => {
    expect(testForm.onValidationError).toBe(mockCallback);
  });
  
  // ... write more tests for other methods and functionalities of EgoForm
});