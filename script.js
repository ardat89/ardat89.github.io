document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let state = {
        activity: null, // 'studying', 'workout', 'relaxing'
        mood: null,     // 'happy', 'sad', 'angry', 'chill'
    };

    // --- DOM ELEMENTS ---
    const screens = document.querySelectorAll('.screen');
    const appContainer = document.querySelector('.app-container');
    const moodOptionsContainer = document.getElementById('mood-options');

    // --- DATA / RECOMMENDATIONS (from flowchart) ---
    const recommendations = {
        genres: {
            chill: ['Lounge', 'Jazz', 'Lo-Fi'],
            happy: ['Pop', 'Hip-Hop', 'Electronic'],
            sad: ['Alternative Rock', 'Ambient', 'Shoegaze'],
            angry: ['Metal', 'Grunge', 'Industrial'],
        },
        artists: {
            chill: ['Frank Sinatra', 'Chet Baker', 'Beethoven'],
            happy: ['Lady Gaga', 'Bruno Mars', 'Kendrick Lamar'],
            sad: ['Radiohead', 'Øneheart', 'Slowdive'],
            angry: ['Metallica', 'Alice in Chains', 'Pantera'],
        }
    };

    // --- CORE LOGIC ---

    /**
     * Hides all screens and shows the one with the specified ID.
     * @param {string} screenId - The ID of the screen to make visible.
     */
    const showScreen = (screenId) => {
        screens.forEach(screen => {
            screen.classList.remove('visible');
        });
        document.getElementById(screenId).classList.add('visible');
    };

    /**
     * Resets the application to its initial state.
     */
    const restartApp = () => {
        state = { activity: null, mood: null };
        showScreen('start-screen');
    };

    /**
     * Populates and displays the final screen.
     * @param {string} title - The title for the final screen.
     * @param {string} message - The message for the final screen.
     */
    const showFinalScreen = (title, message) => {
        document.getElementById('final-title').textContent = title;
        document.getElementById('final-message').textContent = message;
        showScreen('final-screen');
    };

    /**
     * Populates a list of recommendations (genres or artists)
     * @param {Array<string>} items - The list of items to display.
     * @returns {string} - The HTML string for the list.
     */
    const createRecoListHTML = (items) => {
        return items.map(item => `<div>${item}</div>`).join('');
    };
    
    /**
     * Displays genre recommendations and asks for artist recommendations.
     */
    const displayGenreRecommendations = () => {
        const recoTitle = document.getElementById('reco-title');
        const recoResults = document.getElementById('reco-results');
        const recoFollowUp = document.getElementById('reco-follow-up');

        recoTitle.textContent = `For a ${state.mood} mood, you might like:`;
        recoResults.innerHTML = createRecoListHTML(recommendations.genres[state.mood]);
        
        recoFollowUp.innerHTML = `
            <h3>Do you need specific artist/band recommendations?</h3>
            <div class="options">
                <button data-action="needs-artists" data-value="yes">Yes, please!</button>
                <button data-action="needs-artists" data-value="no">No, I'm good.</button>
            </div>
        `;
        showScreen('recommendation-screen');
    };
    
    /**
     * Displays artist recommendations and asks for satisfaction.
     */
    const displayArtistRecommendations = () => {
        const recoTitle = document.getElementById('reco-title');
        const recoResults = document.getElementById('reco-results');
        const recoFollowUp = document.getElementById('reco-follow-up');
        
        recoTitle.textContent = 'Here are some artist recommendations:';
        recoResults.innerHTML = createRecoListHTML(recommendations.artists[state.mood]);
        
        recoFollowUp.innerHTML = `
            <h3>Are you happy with these options?</h3>
            <div class="options">
                <button data-action="is-satisfied" data-value="yes">Yes!</button>
                <button data-action="is-satisfied" data-value="no">Not really.</button>
            </div>
        `;
        showScreen('recommendation-screen');
    };

    /**
     * Renders the mood selection screen based on the current activity.
     */
    const renderMoodScreen = () => {
        const question = document.getElementById('mood-question');
        const subtitle = document.getElementById('mood-subtitle');
        moodOptionsContainer.innerHTML = ''; // Clear previous options

        let availableMoods = ['happy', 'sad', 'angry'];
        if (state.activity !== 'studying') {
            availableMoods.unshift('chill'); // Add 'chill' for workout/relaxing
        }

        question.textContent = 'How are you feeling?';
        subtitle.textContent = '';
        if (state.activity === 'studying') {
            subtitle.textContent = "Remember, music for studying shouldn't be too distracting.";
        }
        
        availableMoods.forEach(mood => {
            const button = document.createElement('button');
            button.dataset.action = 'select-mood';
            button.dataset.value = mood;
            button.textContent = mood.charAt(0).toUpperCase() + mood.slice(1);
            moodOptionsContainer.appendChild(button);
        });

        showScreen('mood-screen');
    };

    // --- EVENT HANDLING ---
    appContainer.addEventListener('click', (e) => {
        if (!e.target.matches('button')) return;

        const { action, value } = e.target.dataset;

        switch (action) {
            case 'start':
                showScreen('activity-screen');
                break;

            case 'restart':
                restartApp();
                break;

            case 'select-activity':
                state.activity = value;
                if (state.activity === 'workout') {
                    showScreen('genre-in-mind-screen');
                } else {
                    renderMoodScreen();
                }
                break;

            case 'genre-in-mind':
                if (value === 'yes') {
                    showFinalScreen('Great!', "You know what you like. If you change your mind, just start over to get recommendations.");
                } else {
                    renderMoodScreen();
                }
                break;
            
            case 'select-mood':
                state.mood = value;
                if (state.activity === 'studying') {
                    displayArtistRecommendations();
                } else {
                    displayGenreRecommendations();
                }
                break;

            case 'needs-artists':
                if (value === 'yes') {
                    displayArtistRecommendations();
                } else {
                    showFinalScreen('Enjoy the music!', 'Happy listening! Feel free to start over for new recommendations.');
                }
                break;

            case 'is-satisfied':
                if (value === 'yes') {
                    showFinalScreen('Awesome!', 'Enjoy your personalized music session!');
                } else {
                    showFinalScreen('No worries!', 'Feel free to do some more research or simply restart the process to explore other options.');
                }
                break;
        }
    });

    // --- INITIALIZATION ---
    restartApp();
});