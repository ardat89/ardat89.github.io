document.addEventListener('DOMContentLoaded', () => {
    const questionTextElement = document.getElementById('question-text');
    const optionsAreaElement = document.getElementById('options-area');
    const resultAreaElement = document.getElementById('result-area');
    const resultTextElement = document.getElementById('result-text');
    const restartButton = document.getElementById('restart-button');
    const decisionAreaElement = document.getElementById('decision-area');

    // Define all states and transitions based on the flowchart
    // Each key is a state ID.
    // 'question' is the text displayed to the user.
    // 'options' is an array of choices. Each choice has 'text' for the button and 'next' for the ID of the next state,
    // or 'result' for a final outcome message.
    // 'action' can be a function to call for special logic (like presenting multiple transport choices).
    const flowchart = {
        START: {
            question: "Have you decided on a location yet?",
            options: [
                { text: "Yes", next: "ASK_WITHIN_BUDGET" },
                { text: "No", next: "ASK_PREFERENCE" }
            ]
        },
        // Path: Decided Location = Yes
        ASK_WITHIN_BUDGET: {
            question: "Is it within your budget?",
            options: [
                { text: "Yes", next: "ASK_MONEY_LEFT_OVER" },
                { text: "No", next: "ASK_SITUATION_BADNESS" }
            ]
        },
        ASK_MONEY_LEFT_OVER: {
            question: "Do you have money left over?",
            options: [
                { text: "Yes", result: "Go by plane. Enjoy your trip!" },
                { text: "No", result: "Use a cheaper way of transport, so you have some left for the trip. Consider a bus or train if appropriate, or driving." }
            ]
        },
        ASK_SITUATION_BADNESS: {
            question: "How bad is the situation?",
            options: [
                { text: "No money at all", result: "Cancel the trip, start saving up for the next time." },
                { text: "I have enough for transport", result: "Use a cheaper way of transport, so you have some left for the trip. Prioritize essential transport." }
            ]
        },
        // Path: Decided Location = No
        ASK_PREFERENCE: {
            question: "What do you prefer for this undecided trip?",
            options: [
                { text: "The cheaper alternative", next: "CHOOSE_TRANSPORT_CHEAPER" },
                { text: "Something more expensive", next: "ASK_LUXURY_OR_MONEY" }
            ]
        },
        ASK_LUXURY_OR_MONEY: {
            question: "Should it prioritize luxury or your money?",
            options: [
                { text: "Luxury", result: "Go by plane, first class if possible too. Live it up!" },
                { text: "Money saving", result: "Take your car. It offers flexibility and can be cost-effective." }
            ]
        },
        CHOOSE_TRANSPORT_CHEAPER: {
            question: "Choose your preferred cheaper transport:",
            action: 'presentTransportOptions',
            options: [ // These will be turned into buttons by the action
                { text: "Go by boat", result: "Go by boat. Enjoy the scenic route!" },
                { text: "Go by train", result: "Go by train. Relax and watch the world go by!" },
                { text: "Take your car", result: "Take your car. Road trip!" }
            ]
        }
    };

    let currentStateKey = 'START';

    function renderState(stateKey) {
        const state = flowchart[stateKey];
        if (!state) {
            console.error("Error: State not found -", stateKey);
            displayResult("An error occurred. Please restart.");
            return;
        }

        questionTextElement.textContent = state.question;
        optionsAreaElement.innerHTML = ''; // Clear previous options

        if (state.action === 'presentTransportOptions') {
            state.options.forEach(optionData => {
                const button = document.createElement('button');
                button.textContent = optionData.text;
                button.addEventListener('click', () => displayResult(optionData.result));
                optionsAreaElement.appendChild(button);
            });
        } else if (state.options) {
            state.options.forEach(optionData => {
                const button = document.createElement('button');
                button.textContent = optionData.text;
                button.addEventListener('click', () => {
                    if (optionData.next) {
                        currentStateKey = optionData.next;
                        renderState(currentStateKey);
                    } else if (optionData.result) {
                        displayResult(optionData.result);
                    }
                });
                optionsAreaElement.appendChild(button);
            });
        } else if (state.result) { // Should not happen if options/action is present, but good fallback
            displayResult(state.result);
        }
    }

    function displayResult(message) {
        decisionAreaElement.classList.add('hidden');
        resultAreaElement.classList.remove('hidden');
        resultTextElement.textContent = message + " (If done successfully)"; // Adding the common suffix
    }

    restartButton.addEventListener('click', () => {
        decisionAreaElement.classList.remove('hidden');
        resultAreaElement.classList.add('hidden');
        currentStateKey = 'START';
        renderState(currentStateKey);
    });

    // Initial render
    renderState(currentStateKey);
});