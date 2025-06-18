# EgoForm
Lightweight, dependency-free JavaScript/Typescript library for comprehensive form validation and submission. Customize validation rules with ease and seamlessly integrate into any vanilla project.
</br></br>

![NPM Version](https://img.shields.io/npm/v/@egodesign/form)
![NPM Downloads](https://img.shields.io/npm/dm/@egodesign/form)

### Main features:

- Comprehensive Validation: Supports various data types, custom validations, and minimum/maximum length checks.
- Customization: Control class names and error messages to match your design.
- Flexible Submission: Choose between fetch, get, or post methods for form submission.
- Event Handling: Respond to validation errors, form submission events, and successful/failed responses.
- TypeScript Support: Fully typed and well-documented.


## Usage:

1. Download or install it using the most popular PMs:

```
npm install @egodesign/form
````
or
```
yarn add @egodesign/form
```
<br>

2. Import the **`EgoForm`** class into your file and create as many instances as needed.

<details>
<summary>JavaScript</summary>

```js
import EgoForm from '@egodesign/form';

const myForm = new EgoForm({
    element: document.getElementById('myForm'),
    submitType: 'fetch',
    debug: true,
    submitDataFormat: 'formData',
    requestHeaders: {},
    fieldGroups: {
        phone_numbers: [
            'phone',
            'mobile'
        ]
    },
    extraFields: [
        {
            name: 'extra',
            value: 'value'
        }
    ],
    serializerIgnoreList: ['ignore'],
    classes: {
        requiredField: '--required',
        requiredIfFilledField: '--required-if-filled',
        fieldHasError: '--has-error',
        controlHasError: 'is-danger',
        hiddenErrorMessage: 'is-hidden',
        formSubmittingState: '--submitting',
        buttonSubmittingState: 'is-loading'
    },
    customValidations: {
        test: [{
            name: 'isValid',
            condition: (value, fieldName) => value === 'testing',
            message: 'This field value should be "testing".'
        }]
    },
    customValidationsMessages: {
        "fieldName": {
            "empty": "message",
            "invalid": "message",
        }
    },
    onStepChange: (previous, next) => console.log(current, next),
    onBeforeValidation: instance => instance.resumeValidation(),
    onValidationError: fields => console.log(fields),
    onSubmitStart: () => console.log('Submit start'),
    onBeforeSubmission: instance => instance.resumeSubmission(),
    onSubmitEnd: () => console.log('Submit end'),
    onSuccess: resp => console.log('Success', resp),
    onError: err => console.log('Error', err)
});
```
</details>

<details>
<summary>TypeScript</summary>

```ts
import EgoForm from '@egodesign/form';

const myForm: EgoForm = new EgoForm({
    element: document.getElementById('myForm'),
    submitType: 'fetch',
    debug: true,
    submitDataFormat: 'formData',
    requestHeaders: {},
    fieldGroups: {
        phone_numbers: [
            'phone',
            'mobile'
        ]
    },
    extraFields: [
        {
            name: 'extra',
            value: 'value'
        }
    ],
    serializerIgnoreList: ['ignore'],
    classes: {
        requiredField: '--required',
        requiredIfFilledField: '--required-if-filled',
        fieldHasError: '--has-error',
        controlHasError: 'is-danger',
        hiddenErrorMessage: 'is-hidden',
        formSubmittingState: '--submitting',
        buttonSubmittingState: 'is-loading'
    },
    customValidations: {
        test: [{
            name: 'isValid',
            condition: (value: string | number, fieldName: string) => value === 'testing',
            message: 'This field value should be "testing".'
        }]
    },
    customValidationsMessages: {
        "fieldName": {
            "empty": "message",
            "invalid": "message",
        }
    },
    onStepChange: (prev: string, next: string) => console.log(prev, next),
    onBeforeValidation: (instance: EgoForm) => instance.resumeValidation(),
    onValidationError: (fields: string[], instance: EgoForm) => console.log(instance, fields),
    onSubmitStart: () => console.log('Submit start'),
    onBeforeSubmission: (instance: EgoForm) => instance.resumeSubmission(),
    onSubmitEnd: () => console.log('Submit end'),
    onSuccess: (resp: Response) => console.log('Success', resp),
    onError: (err: Error) => console.log('Error', err)
});
```
</details>

## HTML structure sample:
```html
<form method="GET" action="https://jsonplaceholder.typicode.com/todos/1" id="myForm" novalidate>
    <div class="form__field --required" data-type="text">
        <label for="nameInput">Name</label>
        <input class="form__control" 
            type="text" 
            name="name" 
            id="nameInput" 
            placeholder="Text input"
            aria-invalid="false" 
            aria-errormessage="nameInputError"
            required>
            <p class="form__error" id="nameInputError"></p>
    </div>
    
    <div class="form__field --required" data-type="email">
        <label for="emailInput">Email</label>
        <input class="form__control" 
            type="email" 
            name="email" 
            id="emailInput" 
            placeholder="Email input"
            aria-invalid="false" 
            aria-errormessage="emailInputError"
            required>
        <p class="form__error" id="emailInputError"></p>
    </div>

    <div class="form__field" data-type="file" data-max-size="15">
        <label for="fileInput">File upload</label>
        <small>Max. file size 2MB</small>
        <input class="file-input form__control" 
            type="file" 
            name="resume"
            id="fileInput" 
            aria-invalid="false" 
            aria-errormessage="fileInputError">
        <p class="form__error" id="fileInputError"></p>
    </div>
    
    <div class="form__field" data-type="text">
        <label>Message</label>
        <textarea class="form__control" 
            name="message" 
            placeholder="Textarea"
            aria-errormessage="msgTextError">
        </textarea>
        <p class="form__error" id="msgTextError"></p>
    </div>
    
    <button type="submit">Submit</button>
</form>
```

### Required Classes
| Class | Description |
| --- | ----------- |
| `form__field` | This is the element that wraps the label, the control and the error message of a specific field. |
| `form__control` | This is a control element. It could be either an input, a select, a textarea, etc. |
| `form__error` | This is the element which will be used to display error messages for a specific field. |  
<br>

### Customizable Classes
| Name | Default | Description |
| --- | --- | ----------- |
| *requiredField* | `--required` | Use this class to mark required fields. |
| *requiredIfFilledField* | `--required-if-filled` | Use this class to mark those fields that should be validated only when filled. For example, an email field that is not required but should be a valid email if filled. |
| *validateOnBlur* | `--validate-onblur` | Use this class to mark those fields that should be validated when the control is blurred. |
| *validateOnInput* | `--validate-oninput` | Use this class to mark those fields that should be validated in real time as the control gets new input. |
| *fieldHasError* | `--has-error` | This class is added to the fields that has errors after validation and removed when the field is focused. |
| *controlHasError* | - | You can set this class to be added to the controls that has errors. Works similar to *fieldHasError*. |
| *hiddenErrorMessage* | `--hidden` | This class is removed from the error messages when it's parent field has errors and added back when the field is focused. |
| *formSubmittingState* | `--submitting` | This class is added to the form while it's being submited. |  
| *buttonSubmittingState* | `--loading` | This class is added to the submit button while the form is being submited. |
<br>

### Options
| Name | Description | Accepted values |
| --- | ----------- | ----------- |
| *element* | The form element. I.g. `document.getElementById('myform')` | A DOM element
| *submitType* | The method that will be used to submit the form. **IMPORTANT**: the action attribute is required in any case. | `fetch`, `get` and `post`
| *submitDataFormat* | If submitTypes is fetch, this option will be use to define de content type of the request. | `json` and `formData`
| *requestHeaders* | If submitTypes is fetch, this option lets you pass your own headers. Should recieve an object containing valid HTTP headers. See [reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers). | Object or `null`.
| *fieldGroups* | Group fields as nestes objects inside the body of the request. Should recieve an object containing key-value pairs, where the key is the name of the group and the value an array listing the field names. | Object or `null`.
| *extraFields* | Add extra fields to the request body. Should recieve an array containing objects with the name and value of the field. This fields are **NOT** validated. | Array of objects or empty array.
| *classes* | Customize some classes to match your own. Should recieve an object containig the replaced classnames. See [customizable classes] | Object or `null`.
| *customValidations* | Define your own validations. Should recieve an object containig key-value pairs, where the key is the name of the custom `data-type`, and the value an array of validations defining a condition function to be passed and a message in case it's not. | Object or `null`.
| *customValidationMessages* | Lets you customize existing validation messages. It expects an object containing the name of the field and the custom messages inside. Refer to [Usage](#usage) to see an example. | Object or `null`.
| *resetOnSuccess* | This option completely resets the form and its fields. | Boolean, default `true`.
| *scrollOnError* | This option smoothly scrolls the page to show the first field with errors. Useful when building long forms to make sure the user sees the errors. | Boolean, default `true`.
| *disbleStepsTransition* | When building a multistep form, this option disables the built-in fade transition applied to each step change. If set to true it can be used together with the onStepChange event to apply your own method. | Boolean, default `false`.
| *preventValidation* | Prevents the form from being validated. Useful in combination with onBeforeValidation event and the `resumeValidation()` method. | Boolean, default `false`.
| *preventSubmission* | After validation passed, it prevents the form from being submitted. Useful in combination with onBeforeSubmission event and the `resumeSubmission()` method. | Boolean, default `false`.
| *debug* | On debug mode, the form won't be submitted. Intead, every step will be logged into the dev console of the browser. | Boolean, default `false`.
<br>

### Events
| Name | Description | Accepted values |
| --- | ----------- | ----------- |
| *onStepChange* | Event triggered every time there's a step change. Only available for stepped forms. It returns the previous and the next steps. | An anonymous function or `null`.
| *onValidationError* | Event triggered when there's any validation error. The callback function receives an array containing the names of invalid fields and a reference to the instance itself. | An anonymous function or `null`.
| *onBeforeValidation* | Event triggered before the validation starts. The callback function receives a reference to the instance itself | An anonymous function or `null`.
| *onSubmitStart* | Event triggered when the submit starts. | An anonymous function or `null`.
| *onBeforeSubmission* | Event triggered before the submission starts, right after successful validation. The callback function receives a reference to the instance itself | An anonymous function or `null`.
| *onSubmitEnd* | Event triggered when the submit ends, regardless of the outcome. | An anonymous function or `null`.
| *onSuccess* | Event triggered when the request results successful. | An anonymous function or `null`.
| *onError* | Event triggered when the response returns an error. | An anonymous function or `null`.
<br>

### Validation:
In order to use validations, you must set the correct data type for each field. You can do so by adding a `type` data attribute to the field element, e.g; `<div class="form__field" data-type="text">`. This attribute will be used by the validator to run certain tests. Here's a list of the different available data types:
| Name | Description |
| ---| --- |
| `text` | This can be considered as the default type. It's use for simple text input and it doesn't have any special validation appart from the required ones. |
| `email` | Used for email inputs. It validates the value to comply the requirement for a well formed email address. |
| `url` | Used for URL inputs. It validates the value to comply the requirement for a well formed URL. |
| `cuit` / `cuil` | It validates the value to comply the requirement for a valid CUIT or CUIL number, applying the official formula. |
| `password_repeat` | Use this type alogn with a password field whit an ID of `password`, to validate that both fields have the same value. Mostly intended for password reset forms. |
| `single_checkbox` | This type validates that a specific checkbox is checked. Useful for cases like terms and conditions acceptance. |

In addition you can validate the minimum and maximum length of a field. You can do so by adding the `data-min-length` and `data-max-length` attributes to the field element.
| Attribute | Description |
| ---| --- |
| `data-min-length` | The minimum length of the field. |
| `data-max-length` | The maximum length of the field. |

### Masks:
Add this class names to the field element in order to apply some masks and filters to your inputs.

| Class name | Description | Extra attributes |
| ---| --- | ----------- |
| `--number` | It converts the value to only numbers, with the option of being formated and support decimals. | `data-thousands-separator`: if declared it will be used to separate thousands.<br />`data-decimal-separator`: if declared it will be used to separate decimals.<br />`data-decimals`: the number of decimal places, defaults to 2. |
| `--money-amount` | It converts the input into a valid currency expression. | `data-currency`: this attribute is use to mask the field value adding the currency at the begining. Defualts to '$'. |
| `--phone` | It filters the value using a (opinionated) regular expression, which only allows numbers, plus symbols, hyphens, parentheses and white spaces. | |
<br />

## Extras
### Toggle password visibility
Add a button with the class name `form__toggle-password-visibility` inside the field element to toggle the control (input) type between `password` and `text`. Note: the control and the button must be siblings.

### Serialization
When the `submitDataFormat` option is set to `json`, **EgoForm** will serialize the form data using its own logic. For example, if any field with multiple values is present (like a select with the `multiple` attribute on) it will be serialized to an array.
