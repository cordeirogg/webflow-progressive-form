class MSF {
    constructor(data) {
        this.currentStep = 0;
        this.form = document.getElementById(data.formID);
        this.next = document.getElementById(data.nextButtonID);
        this.back = document.getElementById(data.backButtonID);
        this.submitButton = this.form.querySelector('input[type="submit"]');
        this.mask = this.form.querySelector(".w-slider-mask");
        this.steps = this.form.querySelectorAll(".w-slide");
        this.rightArrow = this.form.querySelector(".w-slider-arrow-right");
        this.leftArrow = this.form.querySelector(".w-slider-arrow-left");
        this.nextText = data.nextButtonText;
        this.submitText = data.submitButtonText;
        this.warningClass = data.warningClass;
        //this.alertText = data.alertText;
        if (data.alertElementID) {
            this.alertElement = document.getElementById(data.alertElementID);
        }
    }

    getInputs(index) {
        const inputs = this.steps[index].querySelectorAll(
            "input, select, textarea"
        );
        return Array.from(inputs);
    }

    setMaskHeight() {
        this.mask.style.height = "";
        this.mask.style.height = `${this.steps[this.currentStep].offsetHeight}px`;
    }

    setNextButtonText() {
        if (this.currentStep === this.steps.length - 1) {
            this.next.textContent = this.submitText;
        }
        if (this.currentStep === this.steps.length - 2) {
            this.next.textContent = this.nextText;
        }
    }

    goNext() {
        this.rightArrow.click();
    }

    goBack() {
        this.leftArrow.click();
    }

    submitForm() {
        this.submitButton.click();
    }

    hideButtons() {
        this.next.style.display = "none";
        this.back.style.display = "none";
    }

    addWarningClass(target) {
        if (this.warningClass) {
            target.classList.add(this.warningClass);
        }
    }

    removeWarningClass(target) {
        if (this.warningClass) {
            target.classList.remove(this.warningClass);
        }
    }

    showAlert() {
        if (this.alertText) {
            alert(this.alertText);
        }

        if (this.alertElement) {
            this.alertElement.classList.remove("hidden");
        }
    }

    hideAlert() {
        if (this.alertElement) {
            this.alertElement.classList.add("hidden");
        }
    }

    setConfirmValues(index) {
        const inputs = this.getInputs(index);

        inputs.forEach((el) => {
            let value, confirmElement;
            if (el.type === "radio") {
                const radioGroup = el.getAttribute("name");
                const isChecked = document.querySelector(
                    `input[name="${radioGroup}"]:checked`
                );

                if (isChecked) {
                    value = isChecked.value;
                    confirmElement = document.getElementById(`${radioGroup}-value`);
                }
            } else {
                value = el.value;
                confirmElement = document.getElementById(`${el.id}-value`);
            }

            if (value && confirmElement) {
                confirmElement.textContent = value;
            } else if (!value && confirmElement) {
                confirmElement.textContent = "-";
            }
        });
    }
}

const msfController = {
    init: (msf) => {
        const start = () => {
            setEventListeners();
            msf.setMaskHeight(0);
        };

        const setEventListeners = () => {
            msf.next.addEventListener("click", nextClick);
            msf.back.addEventListener("click", backClick);
        };

        const nextClick = () => {
            const filledFields = checkRequiredInputs(msf.currentStep);
            if (filledFields) {
                msf.setConfirmValues(msf.currentStep);
                msf.currentStep++;

                console.log("Current Step")
                console.log(msf.currentStep)
                console.log("Steps length")
                console.log(msf.steps.length)

                if (msf.currentStep === msf.steps.length) {
                    msf.submitForm();
                    msf.hideButtons();
                    msf.hideAlert();
                } else {
                    msf.goNext();
                    
                    msf.setNextButtonText();
                    msf.hideAlert();
                }
            } else {
                msf.showAlert();
            }
        };

        const backClick = () => {
            const previousStep = msf.currentStep - 1;

            if (previousStep >= 0) {
                msf.goBack();
                msf.currentStep = previousStep;
                msf.setMaskHeight();
                msf.setNextButtonText();
                msf.hideAlert();
            }
        };

        const checkRequiredInputs = (index) => {
            const inputs = msf.getInputs(index);
            const requiredInputs = inputs.filter((el) => el.required);
            const requiredCheckboxes = requiredInputs.filter((el) => el.type === "checkbox");
            const requiredRadios = requiredInputs.filter((el) => el.type === "radio");
            let filledInputs = 0;

            requiredInputs.forEach((el) => {
                console.log(el);
                switch (el.id) {
                    case "email":
                        valid = validateEmail(el.value);
                        break;
                    case "phone":
                        valid = validatePhone(el.value);
                        break;
                    case "cnpj":
                        valid = validateCNPJ(el.value);
                        break;
                    case "cpf":
                        valid = validateCPF(el.value);
                        break;
                    case "cep":
                        valid = validateCEP(el.value);
                        break;
                    case "username":
                        valid = validateLength(el.value, 3, "");
                        break;
                    case "mini-bio":
                        valid = validateLength(el.value, 12, 161);
                        break;
                    default:
                        valid = el.value !== "";
                }
                console.log(valid)
                if (valid) {
                    msf.removeWarningClass(el);
                    filledInputs++;
                } else {
                    msf.addWarningClass(el);
                }
            });

            requiredCheckboxes.forEach((el) => {
                const checkbox = el.parentNode.querySelector(".w-checkbox-input");

                if (el.checked) {
                    if (checkbox) {
                        msf.removeWarningClass(checkbox);
                    }
                    filledInputs++;
                } else {
                    if (checkbox) {
                        msf.addWarningClass(checkbox);
                    }
                }
            });

            requiredRadios.forEach((el) => {
                const radio = el.parentNode.querySelector(".w-radio-input");
                const radioGroup = el.getAttribute("name");
                const isChecked = document.querySelector(
                    `input[name="${radioGroup}"]:checked`
                );

                if (isChecked) {
                    msf.removeWarningClass(radio);
                    filledInputs++;
                } else {
                    msf.addWarningClass(radio);
                }
            });

            return filledInputs ===
                requiredInputs.length +
                requiredCheckboxes.length +
                requiredRadios.length ?
                true :
                false;
        };

        const validateEmail = (email) => {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        };

        const validatePhone = (phone) => {
            const re = /^\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}\-[0-9]{4}$/;
            return re.test(String(phone));
        };

        const validateLength = (el, min_len, max_len) => {
            const re = new RegExp("^.{" + String(min_len) + "," + String(max_len) + "}$");
            return re.test(String(el).toLowerCase());
        };

        const validateCEP = (cep) => {
            const re = /^[0-9]{5}-[0-9]{3}$/;
            return re.test(cep);
        }

        const validateCPF = (strCPF) => {
            strCPF = strCPF.replace(/[^\d]+/g, '');
            if (strCPF == '') return false;

            var Soma;
            var Resto;
            Soma = 0;
            if (strCPF == "00000000000") return false;

            for (i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
            Resto = (Soma * 10) % 11;

            if ((Resto == 10) || (Resto == 11)) Resto = 0;
            if (Resto != parseInt(strCPF.substring(9, 10))) return false;

            Soma = 0;
            for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
            Resto = (Soma * 10) % 11;

            if ((Resto == 10) || (Resto == 11)) Resto = 0;
            if (Resto != parseInt(strCPF.substring(10, 11))) return false;
            return true;
        };

        const validateCNPJ = (cnpj) => {
            cnpj = cnpj.replace(/[^\d]+/g, '');
            if (cnpj == '') return false;
            if (cnpj.length != 14)
                return false;

            // Elimina CNPJs invalidos conhecidos
            if (cnpj == "00000000000000" ||
                cnpj == "11111111111111" ||
                cnpj == "22222222222222" ||
                cnpj == "33333333333333" ||
                cnpj == "44444444444444" ||
                cnpj == "55555555555555" ||
                cnpj == "66666666666666" ||
                cnpj == "77777777777777" ||
                cnpj == "88888888888888" ||
                cnpj == "99999999999999")
                return false;

            // Valida DVs
            tamanho = cnpj.length - 2
            numeros = cnpj.substring(0, tamanho);
            digitos = cnpj.substring(tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return false;

            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return false;

            return true;
        }


        start();
    },
};
