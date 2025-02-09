export default function createMouseListener () {

    const observers = []

    function subscribe (observerFunction) {
        if (observers.indexOf(observerFunction) === -1) { // Prevents the same observer from being added twice
            observers.push(observerFunction)
        }
    }

    function unsubscribe (observerFunction) {
        observers.splice(observers.indexOf(observerFunction), 1);
    }

    function notifyAll (command) {
        for (const observerFunction of observers) {
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