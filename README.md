# @egodesign/form
A lightweight Javascript component to fully validate and send forms.
</br></br>

## Usage:
Import the **`EgoForm`** class into your file and then create as many instances as needed.
```js
import EgoForm from '@egodesign/form';

const myForm = new EgoForm({
    element: document.getElementById('myForm'),
    submitType: 'fetch',
    debug: true,
    onSuccess: resp => console.log('Success', resp),
    onError: err => console.log('Error', err)
});
```

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
| *classes* | Customize some classes to match your own. Should recieve an object containig the replaced classnames. See [customizable classes] | Object or `null`.
| *customValidations* | Define your own validations. Should recieve an object containig key-value pairs, where the key is the name of the custom `data-type`, and the value an array of validations defining a condition to be passed and a message in case it's not. | Object or `null`.
| *resetOnSuccess* | This option completely resets the form and its fields. | Boolean, default `true`.
| *scrollOnError* | This option smoothly scrolls the page to show the first field with errors. Useful when building long forms to make sure the user sees the errors. | Boolean, default `true`.
| *debug* | On debug mode, the form won't be submitted. Intead, every step will be logged into the dev console of the browser. | Boolean, default `false`.
<br>

### Events
| Name | Description | Accepted values |
| --- | ----------- | ----------- |
| *onSubmitStart* | Event triggered when the submit starts. | An anonymous function or `null`.
| *onSubmitEnd* | Event triggered when the submit ends, regardless of the outcome. | An anonymous function or `null`.
| *onSuccess* | Event triggered when the request results successful. | An anonymous function or `null`.
| *onError* | Event triggered when the response returns an error. | An anonymous function or `null`.
<br>

### Validation:
In order to use validations, you must set the correct data type for each field. You can do so by adding a `type` data attribute to the field element, e.g; `<div class="form__field" data-type="text">`. This attribute will be used by the validator to run certain tests. Here's a list of the different available data types:
| Name | Description | Extra attributes |
| ---| --- | ----------- |
| `text` | This can be considered as the default type. It's use for simple text input and it doesn't have any special validation appart from the required ones. |  |
| `email` | Used for email inputs. It validates the value to comply the requirement for a well formed email address. |  |
| `url` | Used for URL inputs. It validates the value to comply the requirement for a well formed URL. |  |
| `cuit`/`cuil` | It validates the value to comply the requirement for a valid CUIT or CUIL number, applying the official formula. |  |
| `money` | It validates the value to comply the requirement for a valid CUIT or CUIL number, applying the official formula. |  |

