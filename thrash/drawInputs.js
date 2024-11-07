export default function drawInputs (ctx, inputs) {
    // Draw inputs
    for (const inputIndex in inputs.inputsList) {
        const input = inputs.inputsList[inputIndex];
        
        ctx.fillStyle = 'gray';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        ctx.fillRect(input.x, input.y, input.width, input.height);
        ctx.strokeRect(input.x, input.y, input.width, input.height);

        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = input.value != "" ? input.value : input.placeholderValue ? input.placeholderValue : "";

        if (input.value == "") {
            ctx.fillStyle = '#333';
        }

        ctx.fillText(text, input.x + input.width / 2, input.y + input.height / 2);

        if (inputIndex == inputs.focusedInput && input.type === "textInput") {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 4;
            ctx.strokeRect(input.x, input.y, input.width, input.height);
        }
    }

}
