export default function createInputManager () {

    const inputsInfo = {
        inputsList:[],
        focusedInput:null
    }

    /*
    Types of inputs:
    
    button:
        - (optional) execute the specified function
        - notify all observers

    textInput
        - has a function that returns the inserted value
    
    */

    const observers = [];

    function subscribe (observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll (command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }
    
    function createInput (type, x, y, width, height, command, inputId=null) {
        const newInput = {
            index: inputsInfo.inputsList.length, id: inputId ? inputId : inputsInfo.inputsList.length, 
            type:type,
            x, y, width, height,
        }

        if (type === "button") {
            newInput.value = command.value;
            newInput.inputFunction = command.inputFunction ? command.inputFunction : null;
            newInput.observers = [];

        } else if (type === "textInput") {
            newInput.value = command.defaultValue ? command.defaultValue : "";
            newInput.placeholderValue = command.placeholderValue  ? command.placeholderValue : null;

            newInput.getValue = function () {
                return newInput.value;
            }
        } else if (type === "textBox") {
            newInput.value = command.value;
        }
        
        inputsInfo.inputsList.push(newInput);

        return inputsInfo.inputsList[newInput.index];
    }

    function deleteInput (id) {
        inputsInfo.inputsList[id] = null;
        if (inputsInfo.focusedInput == id) {
            inputsInfo.focusedInput = null;
        }

    }

    function clearInputs () {
        inputsInfo.focusedInput = null;
        inputsInfo.inputsList = [];        
        
    }

    function inputInteraction (id) {
        inputsInfo.focusedInput = id;
        const input = inputsInfo.inputsList[id];

        
        if (input.type === "button") {
            if (input.inputFunction) {
                input.inputFunction();
            }

            const command = {
                event:"inputClicked", input
            }

        }

    }

    function inputClick (command) {
        // Verify if clicked in any input;
        const xClick = command.x;
        const yClick = command.y;

        inputsInfo.focusedInput = null;

        for (const input of inputsInfo.inputsList) {
            if (xClick > input.x && xClick < input.x + input.width) {
                if (yClick > input.y && yClick < input.y + input.height) {
                    inputInteraction(input.index)
                }
            }
        }

    }

    function inputKeyDown (command) {
        const key = command.key;
        const focusedInputIndex = inputsInfo.focusedInput;
        if (focusedInputIndex != null && inputsInfo.inputsList[focusedInputIndex].type == "textInput") {
            const focusedInput = inputsInfo.inputsList[focusedInputIndex]
            if (key == "Backspace") {
                focusedInput.value = focusedInput.value.slice(0, -1);

            } else if (key == "Enter") {
                inputsInfo.focusedInput++;

            } else if (/^[a-zA-Z0-9 ]$/.test(key)) {
                focusedInput.value += key

            }
        }
    }

    function getInputInfo () {
        return inputsInfo;
    }

    return {
        subscribe, notifyAll, 
        createInput, deleteInput, inputInteraction, inputClick, getInputInfo, inputKeyDown, clearInputs
    }
}