export default function createMouseListener () {
    const state = {
        observers: []
    }

    function subscribe (observerFunction) {
        state.observers.push(observerFunction)
    }

    function unsubscribe (observerFunction) {
        state.observers.splice(state.observers.indexOf(observerFunction), 1);
    }

    function notifyAll (command) {
        for (const observerFunction of state.observers) {
            observerFunction(command)
        }
    }

    canvas.addEventListener('click', handleClick)

    function handleClick (event) {

        const command = {
            x: event.offsetX,
            y: event.offsetY,
            event:event            
        }

        notifyAll(command);

    }

    return {
        subscribe, unsubscribe
    }

}