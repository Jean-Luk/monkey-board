export default function createKeyboardListener () {
    const state = {
        observers: []
    }

    function subscribe (observerFunction) {
        state.observers.push(observerFunction)
        return state.observers.length - 1
    }

    function unsubscribe (index) {
        state.observers[index] = null;
    }

    function notifyAll (command) {
        for (const observerFunction of state.observers) {
            if (observerFunction) {
                observerFunction(command)
            }
        }
    }

    document.addEventListener('keydown', handleKeyDown)

    function handleKeyDown (event) {
        const command = {
            key: event.key
        }

        notifyAll(command);

    }

    return {
        subscribe, unsubscribe
    }

}