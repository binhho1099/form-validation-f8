
function validator(object){

    function getParent(element, selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let selectorRule = {};

    // ham thuc hien validated
    function validate(inputElement, rule){
        
        let errorMessage;
        let errorElement = getParent(inputElement, object.formGroupSelector).querySelector(object.errorSelector);
        let rules = selectorRule[rule.selector];

        for(let i = 0; i < rules.length; i++){
            errorMessage = rules[i](inputElement.value)
            if(errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, object.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, object.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;
    }
    // lay element cua form can validated
    let formElement = document.querySelector(object.form);
    if(formElement){
        // submit form
        formElement.onsubmit = function(event){
            event.preventDefault();

            let isFormValid = true;


            object.rules.forEach(rule => {
                let inputElement = formElement.querySelector(rule.selector);
                let isValid = validate(inputElement,rule);
                if(!isValid){
                    isFormValid = false;
                }
            });

            

            if(isFormValid){
                // Trường hợp submit với javascript
                if(typeof object.onSubmit === 'function'){
                    let enableInput = formElement.querySelectorAll('[name]');

                    let formValue = Array.from(enableInput).reduce((value, input)=>{
                        value[input.name] = input.value;
                        return value;
                    },{})
                    object.onSubmit(formValue)
                } 
                // Trường hợp submit với mặc định
                else{
                    formElement.submit();
                }

            }
        }


        // lang nghe su kien
        object.rules.forEach(rule => {

            if(Array.isArray(selectorRule[rule.selector])){
                selectorRule[rule.selector].push(rule.test);
            }else{
                selectorRule[rule.selector] = [rule.test];
            }

            let inputElement = formElement.querySelector(rule.selector);  
            if(inputElement){
                // xử lí trường hợp blur khỏi input
                inputElement.onblur = () => {
                    validate(inputElement,rule);
                }

                // xử lí trường hợp mỗi khi user nhập
                inputElement.oninput = () => {
                    let errorElement = inputElement.parentElement.querySelector('.form-message');
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        })


    }
    
}


validator.isRequired = function (selector){
    return {
        selector,
        test: function(value){
            return value.trim() ? undefined: 'Nhập vô đây. LẸ!!!'
        }
    }
}

validator.isEmail = function (selector){
    return {
        selector,
        test: function(value){
            let rereg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return rereg.test(value) ? undefined : 'Mẹ mày!!! nhập email ok, đừng tưởng bố mày không biết'
        }
    }
}

validator.isPassword = function (selector, min){
    return {
        selector,
        test: function(value){
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    }
}

validator.isPasswordConfirmation = function (selector, getConfirmValue, message){
    return {
        selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message || 'Mật khẩu nhập lại chưa đúng thằng kia'
        }
    }
}

validator({
    form: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
        validator.isRequired('#fullname'),
        validator.isRequired('#email'),
        validator.isEmail('#email'),
        validator.isRequired('#password'),
        validator.isPassword('#password', 8),
        validator.isRequired('#password_confirmation'),
        validator.isPasswordConfirmation('#password_confirmation', () => document.querySelector('#password').value, 'Mày nhập sai mẹ mật khẩu rồi'),
    ],
    onSubmit:(data)=>{
        console.log(data);
    }
});