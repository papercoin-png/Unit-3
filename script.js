// ---------- TELEGRAM INTEGRATION ----------
let tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.enableClosingConfirmation?.();
    tg.setHeaderColor?.('#1a2f3f');
    console.log('Telegram WebApp initialized:', tg); // Debug log
} else {
    console.log('Telegram WebApp not available - running in browser mode');
}

// ---------- LOADING SCREEN ----------
const loadingTips = [
    '"Every word forged strengthens the crystal"',
    '"The forge remembers every letter"',
    '"Speed and accuracy forge the strongest words"',
    '"Ancient runes glow brighter with each completion"',
    '"The Word Crystal chooses its master wisely"',
    '"Patience tempers the strongest steel"',
    '"Even legends started as apprentices"',
    '"The guild watches your progress"',
    '"Each ingot tells a story"',
    '"Forgemasters never rush the craft"'
];

document.getElementById('loadingTip').innerText = 
    loadingTips[Math.floor(Math.random() * loadingTips.length)];

let loadingComplete = false;
let minimumTimePassed = false;

function simulateLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    const loadingTip = document.getElementById('loadingTip');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 3;
        
        if (progress >= 100) {
            progress = 100;
            loadingBar.style.width = progress + '%';
            loadingText.innerText = 'Forge ready!';
            
            loadingComplete = true;
            if (minimumTimePassed) {
                setTimeout(() => {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 300);
            }
            clearInterval(interval);
        } else {
            loadingBar.style.width = progress + '%';
            loadingText.innerText = `Loading forge... ${Math.floor(progress)}%`;
            
            if (Math.random() > 0.7) {
                const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
                loadingTip.innerText = randomTip;
            }
        }
    }, 200);
}

setTimeout(() => {
    minimumTimePassed = true;
    if (loadingComplete) {
        document.getElementById('loadingScreen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 500);
    }
}, 4000);

window.addEventListener('load', simulateLoading);

// ---------- FORGE MESSAGE FUNCTIONS ----------
const forgeMessageOverlay = document.getElementById('forgeMessageOverlay');
const forgeMessageIcon = document.getElementById('forgeMessageIcon');
const forgeMessageText = document.getElementById('forgeMessageText');
const forgeProgressFill = document.getElementById('forgeProgressFill');

function showForgeMessage(text, icon = '⚒️', duration = 4000) {
    forgeMessageIcon.innerText = icon;
    forgeMessageText.innerText = text;
    forgeMessageOverlay.style.display = 'flex';
    
    forgeProgressFill.style.animation = 'none';
    forgeProgressFill.offsetHeight;
    forgeProgressFill.style.animation = 'progressFill ' + (duration/1000) + 's linear forwards';
}

function updateForgeMessage(text, icon = '⚒️') {
    forgeMessageIcon.innerText = icon;
    forgeMessageText.innerText = text;
}

function hideForgeMessage() {
    forgeMessageOverlay.style.display = 'none';
}

// ---------- QUICK RESUME SYSTEM ----------
const QUICK_RESUME = {
    saveSession() {
        const sessionData = {
            currentWorld: currentWorld,
            currentUnit: currentUnit,
            completedWords: [...completedWords],
            currentLetters: [...currentLetters],
            activeWordIndex: activeWordIndex,
            currentPosition: currentPosition,
            tempUsedLetters: [...tempUsedLetters],
            gameStartTime: gameStartTime,
            totalTaps: totalTaps,
            correctTaps: correctTaps,
            worlds: JSON.parse(JSON.stringify(worlds)),
            lastPlayed: new Date().toISOString(),
            version: '1.1'
        };
        
        try {
            localStorage.setItem('spellforge_quicksave', JSON.stringify(sessionData));
        } catch (e) {
            console.warn('Could not save session:', e);
        }
    },
    
    loadSession() {
        try {
            const saved = localStorage.getItem('spellforge_quicksave');
            if (!saved) return null;
            
            const session = JSON.parse(saved);
            if (!session.version) return null;
            
            const lastPlayed = new Date(session.lastPlayed);
            const daysSince = (Date.now() - lastPlayed) / (1000 * 60 * 60 * 24);
            if (daysSince > 7) {
                return null;
            }
            
            if (session.worlds && session.version >= '1.1') {
                Object.keys(session.worlds).forEach(key => {
                    if (worlds[key]) {
                        const savedWorld = session.worlds[key];
                        worlds[key].unlocked = savedWorld.unlocked;
                        worlds[key].completed = savedWorld.completed;
                        
                        savedWorld.units.forEach(savedUnit => {
                            const unit = worlds[key].units.find(u => u.id === savedUnit.id);
                            if (unit) {
                                unit.wordsCompleted = savedUnit.wordsCompleted;
                                unit.unlocked = savedUnit.unlocked;
                            }
                        });
                    }
                });
            }
            
            return session;
        } catch (e) {
            console.warn('Could not load session:', e);
            return null;
        }
    },
    
    restoreSession(session) {
        if (!session) return false;
        
        currentWorld = session.currentWorld || 1;
        currentUnit = session.currentUnit || 1;
        completedWords = session.completedWords || [];
        currentLetters = session.currentLetters || [];
        activeWordIndex = session.activeWordIndex !== undefined ? session.activeWordIndex : null;
        currentPosition = session.currentPosition || 0;
        tempUsedLetters = session.tempUsedLetters || [];
        gameStartTime = session.gameStartTime || null;
        totalTaps = session.totalTaps || 0;
        correctTaps = session.correctTaps || 0;
        
        const world = worlds[currentWorld];
        if (world) {
            if (session.worlds && session.worlds[currentWorld]) {
                const savedWorld = session.worlds[currentWorld];
                savedWorld.units.forEach(savedUnit => {
                    const unit = world.units.find(u => u.id === savedUnit.id);
                    if (unit) {
                        unit.wordsCompleted = savedUnit.wordsCompleted;
                        unit.unlocked = savedUnit.unlocked;
                    }
                });
            }
            
            for (let i = 1; i < currentUnit; i++) {
                const unit = world.units.find(u => u.id === i);
                if (unit) {
                    unit.wordsCompleted = 20;
                    unit.unlocked = true;
                }
            }
            
            const currentUnitObj = world.units.find(u => u.id === currentUnit);
            if (currentUnitObj) {
                currentUnitObj.unlocked = true;
            }
            
            world.units.forEach(unit => {
                if (unit.wordsCompleted === 20) {
                    unit.unlocked = true;
                    const nextUnit = world.units.find(u => u.id === unit.id + 1);
                    if (nextUnit && !nextUnit.unlocked) {
                        nextUnit.unlocked = true;
                    }
                }
            });
        }
        
        updateWorldDisplay();
        renderAll();
        this.showResumeNotification(session);
        return true;
    },
    
    showResumeNotification(session) {
        const lastPlayed = new Date(session.lastPlayed);
        const timeDiff = Math.floor((Date.now() - lastPlayed) / 1000);
        
        let timeMessage = '';
        if (timeDiff < 60) timeMessage = 'just now';
        else if (timeDiff < 3600) timeMessage = `${Math.floor(timeDiff / 60)} minutes ago`;
        else if (timeDiff < 86400) timeMessage = `${Math.floor(timeDiff / 3600)} hours ago`;
        else timeMessage = `${Math.floor(timeDiff / 86400)} days ago`;
        
        const notification = document.createElement('div');
        notification.className = 'resume-notification';
        notification.innerHTML = `
            <div class="resume-content">
                <span class="resume-icon">⚒️</span>
                <div class="resume-text">
                    <strong>Welcome back, Forgemaster!</strong>
                    <small>Resumed from ${timeMessage} · Ingot ${session.currentUnit}</small>
                </div>
                <button class="resume-dismiss">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        const dismissTimer = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        notification.querySelector('.resume-dismiss').addEventListener('click', () => {
            clearTimeout(dismissTimer);
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    },
    
    clearSession() {
        localStorage.removeItem('spellforge_quicksave');
    }
};

// ---------- MASTER WORD BANK · 3,600 WORDS ----------
const MASTER_WORDS = {
    // WORLD 1: GRAND FORGE (600 words)
    world1: {
        name: "Grand Forge",
        icon: "⚒️",
        unitType: "Ingot",
        units: {
            1: { // Ingot 01: First Spark
                name: "First Spark",
                words: [
                    { word: "alien", emoji: "👽", sentence: "The friendly alien played guitar with astronauts." },
                    { word: "among", emoji: "🕵️", sentence: "A red mushroom stood among the green ferns." },
                    { word: "chart", emoji: "📊", sentence: "We made a chart of everyone's favorite pizza." },
                    { word: "cloud", emoji: "☁️", sentence: "That cloud looks exactly like a dragon." },
                    { word: "comprehend", emoji: "🧠", sentence: "It's hard to comprehend how big the universe is." },
                    { word: "describe", emoji: "🗣️", sentence: "Can you describe your perfect day?" },
                    { word: "ever", emoji: "🌟", sentence: "This is the most beautiful sunset ever." },
                    { word: "fail", emoji: "😤", sentence: "It's okay to fail when you're learning something new." },
                    { word: "friendly", emoji: "🐕", sentence: "The friendly dog wagged its tail at everyone." },
                    { word: "grade", emoji: "📝", sentence: "She got an A+ on her spelling grade." },
                    { word: "instead", emoji: "🔄", sentence: "Let's play outside instead of watching TV." },
                    { word: "library", emoji: "📚", sentence: "The library has a story hour every Tuesday." },
                    { word: "planet", emoji: "🪐", sentence: "Which planet has the most beautiful rings?" },
                    { word: "report", emoji: "📰", sentence: "I need to write a report about frogs." },
                    { word: "several", emoji: "🧮", sentence: "I've read several books by that author." },
                    { word: "solve", emoji: "🧩", sentence: "Together we can solve any puzzle." },
                    { word: "suddenly", emoji: "⚡", sentence: "Suddenly, the room filled with colorful light." },
                    { word: "suppose", emoji: "🤔", sentence: "I suppose we could share the last cookie." },
                    { word: "universe", emoji: "🌌", sentence: "How many stars are in the universe?" },
                    { word: "view", emoji: "🏞️", sentence: "The view from the mountain was incredible." }
                ]
            },
            2: { // Ingot 02: Kindling
                name: "Kindling",
                words: [
                    { word: "afraid", emoji: "😨", sentence: "The mouse was afraid of the cat." },
                    { word: "agree", emoji: "🤝", sentence: "We all agree that pizza is delicious." },
                    { word: "angry", emoji: "😠", sentence: "He was angry when his ice cream fell." },
                    { word: "arrive", emoji: "🚪", sentence: "We will arrive at the party soon." },
                    { word: "attack", emoji: "⚔️", sentence: "The knight prepared to attack." },
                    { word: "bottom", emoji: "⬇️", sentence: "The treasure was at the bottom of the sea." },
                    { word: "clever", emoji: "🦊", sentence: "The clever fox solved the puzzle." },
                    { word: "cruel", emoji: "👿", sentence: "The cruel witch cast a spell." },
                    { word: "finally", emoji: "🎉", sentence: "Finally, summer vacation arrived!" },
                    { word: "hide", emoji: "🙈", sentence: "Let's hide behind the big tree." },
                    { word: "hunt", emoji: "🏹", sentence: "They hunt for hidden treasure." },
                    { word: "lot", emoji: "📦", sentence: "I have a lot of homework today." },
                    { word: "middle", emoji: "🎯", sentence: "She sat in the middle of the row." },
                    { word: "moment", emoji: "⏰", sentence: "Wait a moment, I'm almost ready." },
                    { word: "pleased", emoji: "😊", sentence: "Mother was pleased with the gift." },
                    { word: "promise", emoji: "🤞", sentence: "I promise to share my cookies." },
                    { word: "reply", emoji: "💬", sentence: "Please reply to my message." },
                    { word: "safe", emoji: "🛡️", sentence: "We are safe inside the castle." },
                    { word: "trick", emoji: "🎩", sentence: "The magician performed a clever trick." },
                    { word: "well", emoji: "💧", sentence: "The water from the well is cold." }
                ]
            },
            3: { // Ingot 03: Ember
                name: "Ember",
                words: [
                    { word: "adventure", emoji: "🗺️", sentence: "The adventure through the forest was exciting." },
                    { word: "approach", emoji: "🚶", sentence: "We watched the lion approach slowly." },
                    { word: "carefully", emoji: "👣", sentence: "She carefully placed the eggs in the basket." },
                    { word: "chemical", emoji: "🧪", sentence: "The chemical turned blue when mixed." },
                    { word: "create", emoji: "🎨", sentence: "Let's create a beautiful painting." },
                    { word: "evil", emoji: "😈", sentence: "The evil villain laughed loudly." },
                    { word: "experiment", emoji: "🔬", sentence: "Our science experiment bubbled and fizzed." },
                    { word: "kill", emoji: "💀", sentence: "The knight did not want to kill the dragon." },
                    { word: "laboratory", emoji: "🥼", sentence: "The laboratory was full of strange equipment." },
                    { word: "laugh", emoji: "😂", sentence: "The joke made everyone laugh." },
                    { word: "loud", emoji: "🔊", sentence: "The thunder was so loud it shook the house." },
                    { word: "nervous", emoji: "😰", sentence: "She felt nervous before her speech." },
                    { word: "noise", emoji: "📢", sentence: "The noise from the construction was distracting." },
                    { word: "project", emoji: "📋", sentence: "Our school project is about volcanoes." },
                    { word: "scare", emoji: "👻", sentence: "The loud noise might scare the cat." },
                    { word: "secret", emoji: "🤫", sentence: "They shared a secret whispered in the dark." },
                    { word: "shout", emoji: "📣", sentence: "Don't shout in the library." },
                    { word: "smell", emoji: "👃", sentence: "I can smell fresh bread baking." },
                    { word: "terrible", emoji: "💔", sentence: "The news was terrible and made us sad." },
                    { word: "worse", emoji: "⬇️", sentence: "The storm got worse as the night went on." }
                ]
            },
            4: { // Ingot 04: Bellows
                name: "Bellows",
                words: [
                    { word: "appropriate", emoji: "✅", sentence: "Wear appropriate clothes for cold weather." },
                    { word: "avoid", emoji: "🚫", sentence: "Try to avoid walking in puddles." },
                    { word: "behave", emoji: "🐕", sentence: "The dog learned to behave at the park." },
                    { word: "calm", emoji: "😌", sentence: "Take deep breaths to stay calm." },
                    { word: "concern", emoji: "🤔", sentence: "My concern is that we might be late." },
                    { word: "content", emoji: "😊", sentence: "The cat was content in the sunny spot." },
                    { word: "expect", emoji: "🔮", sentence: "I expect you to finish your homework." },
                    { word: "frequently", emoji: "⏱️", sentence: "We frequently visit grandma on Sundays." },
                    { word: "habit", emoji: "🔄", sentence: "Brushing teeth is a good habit." },
                    { word: "instruct", emoji: "📝", sentence: "The coach will instruct us on the rules." },
                    { word: "issue", emoji: "⚠️", sentence: "There was an issue with the computer." },
                    { word: "none", emoji: "0️⃣", sentence: "None of the cookies were left." },
                    { word: "patient", emoji: "🧘", sentence: "Be patient, your turn will come." },
                    { word: "positive", emoji: "➕", sentence: "Stay positive even when things are hard." },
                    { word: "punish", emoji: "⛔", sentence: "Parents should not punish too harshly." },
                    { word: "represent", emoji: "🏛️", sentence: "The flag represents our country." },
                    { word: "shake", emoji: "👋", sentence: "Shake hands when you meet someone new." },
                    { word: "spread", emoji: "🦋", sentence: "Butterflies spread their wings to fly." },
                    { word: "stroll", emoji: "🚶", sentence: "Let's stroll through the park together." },
                    { word: "village", emoji: "🏘️", sentence: "The village had one small store." }
                ]
            },
            5: { // Ingot 05: Tongs
                name: "Tongs",
                words: [
                    { word: "aware", emoji: "👀", sentence: "Be aware of the slippery floor." },
                    { word: "badly", emoji: "💔", sentence: "The car was badly damaged in the accident." },
                    { word: "belong", emoji: "🏠", sentence: "This book belongs on the top shelf." },
                    { word: "continue", emoji: "⏩", sentence: "Please continue with your story." },
                    { word: "error", emoji: "⚠️", sentence: "There was an error in the calculation." },
                    { word: "experience", emoji: "🧠", sentence: "Traveling gives you new experiences." },
                    { word: "field", emoji: "🌾", sentence: "The cows grazed in the green field." },
                    { word: "hurt", emoji: "🤕", sentence: "My knee hurts from falling." },
                    { word: "judgment", emoji: "⚖️", sentence: "Use good judgment when crossing the street." },
                    { word: "likely", emoji: "📊", sentence: "It will likely rain tomorrow." },
                    { word: "normal", emoji: "✅", sentence: "It's normal to feel nervous." },
                    { word: "rare", emoji: "🦄", sentence: "Seeing a rainbow at night is rare." },
                    { word: "relax", emoji: "😌", sentence: "I like to relax in a warm bath." },
                    { word: "request", emoji: "🙏", sentence: "She made a request for more information." },
                    { word: "reside", emoji: "🏡", sentence: "They reside in a small cottage." },
                    { word: "result", emoji: "📋", sentence: "The result of the test was positive." },
                    { word: "roll", emoji: "🥖", sentence: "Watch the ball roll down the hill." },
                    { word: "since", emoji: "⏰", sentence: "I've been waiting since morning." },
                    { word: "visible", emoji: "👁️", sentence: "The stars are visible tonight." },
                    { word: "wild", emoji: "🐺", sentence: "Wild animals live in the forest." }
                ]
            },
            6: { // Ingot 06: Hammer
                name: "Hammer",
                words: [
                    { word: "advantage", emoji: "🎯", sentence: "Being tall is an advantage in basketball." },
                    { word: "cause", emoji: "🔍", sentence: "What caused the accident?" },
                    { word: "choice", emoji: "🤔", sentence: "You have a choice between two options." },
                    { word: "community", emoji: "🏘️", sentence: "Our community helps each other." },
                    { word: "dead", emoji: "💀", sentence: "The batteries are dead." },
                    { word: "distance", emoji: "📏", sentence: "Measure the distance between the two trees." },
                    { word: "escape", emoji: "🏃", sentence: "The prisoner tried to escape." },
                    { word: "face", emoji: "😊", sentence: "She has a friendly face." },
                    { word: "follow", emoji: "👣", sentence: "Follow me, I know the way." },
                    { word: "fright", emoji: "😱", sentence: "The loud noise gave me a fright." },
                    { word: "ghost", emoji: "👻", sentence: "Do you believe in ghosts?" },
                    { word: "individual", emoji: "🧑", sentence: "Each individual has unique talents." },
                    { word: "pet", emoji: "🐶", sentence: "My pet dog loves to play." },
                    { word: "reach", emoji: "🤚", sentence: "Can you reach the top shelf?" },
                    { word: "return", emoji: "↩️", sentence: "Please return your library books on time." },
                    { word: "survive", emoji: "🛡️", sentence: "We need water to survive." },
                    { word: "upset", emoji: "😟", sentence: "She was upset about losing her toy." },
                    { word: "voice", emoji: "🗣️", sentence: "He has a loud, deep voice." },
                    { word: "weather", emoji: "☀️", sentence: "The weather today is sunny and warm." },
                    { word: "wise", emoji: "🦉", sentence: "My grandmother is very wise." }
                ]
            },
            7: { // Ingot 07: Anvil
                name: "Anvil",
                words: [
                    { word: "allow", emoji: "✅", sentence: "Parents allow their children to play outside." },
                    { word: "announce", emoji: "📢", sentence: "They will announce the winner tomorrow." },
                    { word: "beside", emoji: "👈", sentence: "Come sit beside me." },
                    { word: "challenge", emoji: "🏆", sentence: "Climbing the mountain was a big challenge." },
                    { word: "claim", emoji: "📝", sentence: "She claimed the prize as her own." },
                    { word: "condition", emoji: "🏥", sentence: "The car is in excellent condition." },
                    { word: "contribute", emoji: "🤝", sentence: "Everyone should contribute to the project." },
                    { word: "difference", emoji: "🔄", sentence: "What's the difference between these two?" },
                    { word: "divide", emoji: "➗", sentence: "Divide the pizza into equal slices." },
                    { word: "expert", emoji: "🎓", sentence: "She is an expert in ancient history." },
                    { word: "famous", emoji: "⭐", sentence: "The famous actor waved to fans." },
                    { word: "force", emoji: "💪", sentence: "The wind forced the door open." },
                    { word: "harm", emoji: "⚠️", sentence: "Too much sun can harm your skin." },
                    { word: "lay", emoji: "😴", sentence: "Lay the blanket on the grass." },
                    { word: "peace", emoji: "🕊️", sentence: "Everyone wants world peace." },
                    { word: "prince", emoji: "👑", sentence: "The prince lived in a castle." },
                    { word: "protect", emoji: "🛡️", sentence: "Sunscreen protects your skin." },
                    { word: "sense", emoji: "🧠", sentence: "It makes sense to study for the test." },
                    { word: "sudden", emoji: "⚡", sentence: "There was a sudden change in weather." },
                    { word: "therefore", emoji: "➡️", sentence: "I think, therefore I am." }
                ]
            },
            8: { // Ingot 08: Quench
                name: "Quench",
                words: [
                    { word: "accept", emoji: "👍", sentence: "Please accept this gift." },
                    { word: "arrange", emoji: "📅", sentence: "Let's arrange a meeting for Monday." },
                    { word: "attend", emoji: "📋", sentence: "Will you attend the party?" },
                    { word: "balance", emoji: "⚖️", sentence: "Try to balance on one foot." },
                    { word: "contrast", emoji: "🌓", sentence: "The contrast between light and dark." },
                    { word: "encourage", emoji: "🎉", sentence: "Parents encourage their children to try new things." },
                    { word: "familiar", emoji: "👋", sentence: "Your face looks familiar." },
                    { word: "grab", emoji: "✊", sentence: "Grab my hand before you fall." },
                    { word: "hang", emoji: "🖼️", sentence: "Hang your coat on the hook." },
                    { word: "huge", emoji: "🐳", sentence: "The whale was huge." },
                    { word: "necessary", emoji: "❗", sentence: "Water is necessary for life." },
                    { word: "pattern", emoji: "🔷", sentence: "The pattern on the wallpaper is pretty." },
                    { word: "propose", emoji: "💍", sentence: "He plans to propose marriage." },
                    { word: "purpose", emoji: "🎯", sentence: "What is the purpose of this tool?" },
                    { word: "release", emoji: "🕊️", sentence: "Release the bird from its cage." },
                    { word: "require", emoji: "📝", sentence: "All students require a pencil." },
                    { word: "single", emoji: "1️⃣", sentence: "She found a single coin on the ground." },
                    { word: "success", emoji: "🏆", sentence: "Hard work leads to success." },
                    { word: "tear", emoji: "😢", sentence: "A tear rolled down her cheek." },
                    { word: "theory", emoji: "📚", sentence: "Einstein's theory of relativity." }
                ]
            },
            9: { // Ingot 09: Temper
                name: "Temper",
                words: [
                    { word: "against", emoji: "🚫", sentence: "Lean the ladder against the wall." },
                    { word: "beach", emoji: "🏖️", sentence: "Let's build a sandcastle at the beach." },
                    { word: "damage", emoji: "💥", sentence: "The storm caused damage to the roof." },
                    { word: "discover", emoji: "🔍", sentence: "Explorers discover new lands." },
                    { word: "emotion", emoji: "😊", sentence: "Happiness is a positive emotion." },
                    { word: "fix", emoji: "🔧", sentence: "Can you fix my broken toy?" },
                    { word: "frank", emoji: "💬", sentence: "Be frank and tell me the truth." },
                    { word: "identify", emoji: "🔎", sentence: "Can you identify this bird?" },
                    { word: "island", emoji: "🏝️", sentence: "They live on a remote island." },
                    { word: "ocean", emoji: "🌊", sentence: "The ocean is vast and deep." },
                    { word: "perhaps", emoji: "🤔", sentence: "Perhaps we'll go to the park tomorrow." },
                    { word: "pleasant", emoji: "😊", sentence: "We had a pleasant conversation." },
                    { word: "prevent", emoji: "🛑", sentence: "Washing hands prevents illness." },
                    { word: "rock", emoji: "🪨", sentence: "He skipped a rock across the water." },
                    { word: "save", emoji: "💰", sentence: "Save your money for something special." },
                    { word: "step", emoji: "👣", sentence: "Watch your step on the stairs." },
                    { word: "still", emoji: "🤫", sentence: "Sit still during the movie." },
                    { word: "taste", emoji: "👅", sentence: "The soup has a salty taste." },
                    { word: "throw", emoji: "⚾", sentence: "Throw the ball to me." },
                    { word: "wave", emoji: "🌊", sentence: "Watch the wave crash on the shore." }
                ]
            },
            10: { // Ingot 10: Forgefire
                name: "Forgefire",
                words: [
                    { word: "benefit", emoji: "💪", sentence: "Exercise has many health benefits." },
                    { word: "certain", emoji: "✅", sentence: "I am certain I locked the door." },
                    { word: "chance", emoji: "🎲", sentence: "Take a chance and try something new." },
                    { word: "effect", emoji: "✨", sentence: "The medicine had an immediate effect." },
                    { word: "essential", emoji: "❗", sentence: "Food is essential for life." },
                    { word: "far", emoji: "📏", sentence: "How far is the store from here?" },
                    { word: "focus", emoji: "🎯", sentence: "Focus on your homework." },
                    { word: "function", emoji: "⚙️", sentence: "The function of a heart is to pump blood." },
                    { word: "grass", emoji: "🌱", sentence: "The grass is soft under your feet." },
                    { word: "guard", emoji: "🛡️", sentence: "The guard protects the castle." },
                    { word: "image", emoji: "🖼️", sentence: "The image in the mirror is clear." },
                    { word: "immediate", emoji: "⏱️", sentence: "Call for immediate help." },
                    { word: "primary", emoji: "🥇", sentence: "His primary goal is to graduate." },
                    { word: "proud", emoji: "😊", sentence: "She was proud of her artwork." },
                    { word: "remain", emoji: "⏳", sentence: "Please remain in your seats." },
                    { word: "rest", emoji: "😴", sentence: "You need to rest after working hard." },
                    { word: "separate", emoji: "🔀", sentence: "Separate the laundry into piles." },
                    { word: "site", emoji: "📍", sentence: "This is the site of the new school." },
                    { word: "tail", emoji: "🐕", sentence: "The dog wagged its tail." },
                    { word: "trouble", emoji: "⚠️", sentence: "Stay out of trouble." }
                ]
            },
            11: { // Ingot 11: Raw Iron
                name: "Raw Iron",
                words: [
                    { word: "anymore", emoji: "⏰", sentence: "I don't want to wait anymore." },
                    { word: "asleep", emoji: "😴", sentence: "The baby is fast asleep." },
                    { word: "berry", emoji: "🫐", sentence: "She picked a fresh berry from the bush." },
                    { word: "collect", emoji: "📦", sentence: "I collect stamps from around the world." },
                    { word: "compete", emoji: "🏆", sentence: "Athletes compete for gold medals." },
                    { word: "conversation", emoji: "💬", sentence: "We had a long conversation about life." },
                    { word: "creature", emoji: "🦄", sentence: "The forest creature hid behind the trees." },
                    { word: "decision", emoji: "🤔", sentence: "Making the right decision takes courage." },
                    { word: "either", emoji: "🔄", sentence: "You can choose either the red or blue one." },
                    { word: "forest", emoji: "🌲", sentence: "The forest is home to many animals." },
                    { word: "ground", emoji: "🌍", sentence: "The leaves fell to the ground." },
                    { word: "introduce", emoji: "🤝", sentence: "Let me introduce you to my friend." },
                    { word: "marry", emoji: "💍", sentence: "They plan to marry in the spring." },
                    { word: "prepare", emoji: "📝", sentence: "We need to prepare for the exam." },
                    { word: "sail", emoji: "⛵", sentence: "They sail across the calm lake." },
                    { word: "serious", emoji: "😐", sentence: "This is a serious matter." },
                    { word: "spend", emoji: "💰", sentence: "Don't spend all your money at once." },
                    { word: "strange", emoji: "🪄", sentence: "A strange noise came from the attic." },
                    { word: "truth", emoji: "⚖️", sentence: "Always tell the truth." },
                    { word: "wake", emoji: "⏰", sentence: "I wake up early every morning." }
                ]
            },
            12: { // Ingot 12: Steel Blend
                name: "Steel Blend",
                words: [
                    { word: "alone", emoji: "🧍", sentence: "He likes to walk alone in the park." },
                    { word: "apartment", emoji: "🏢", sentence: "They live in a small apartment." },
                    { word: "article", emoji: "📰", sentence: "She wrote an article for the school paper." },
                    { word: "artist", emoji: "🎨", sentence: "The artist painted a beautiful landscape." },
                    { word: "attitude", emoji: "😎", sentence: "A positive attitude makes a difference." },
                    { word: "compare", emoji: "🔍", sentence: "Compare these two pictures carefully." },
                    { word: "judge", emoji: "⚖️", sentence: "The judge listened to both sides." },
                    { word: "magazine", emoji: "📚", sentence: "The magazine has interesting articles." },
                    { word: "material", emoji: "🧵", sentence: "What material is this dress made of?" },
                    { word: "meal", emoji: "🍽️", sentence: "We shared a delicious meal together." },
                    { word: "method", emoji: "🔬", sentence: "This method works better than the old one." },
                    { word: "neighbor", emoji: "🏘️", sentence: "Our neighbor helped us carry groceries." },
                    { word: "professional", emoji: "👔", sentence: "She is a professional photographer." },
                    { word: "profit", emoji: "📈", sentence: "The company made a large profit this year." },
                    { word: "quality", emoji: "⭐", sentence: "This product is known for its quality." },
                    { word: "shape", emoji: "🔵", sentence: "The cloud had a strange shape." },
                    { word: "space", emoji: "🚀", sentence: "Astronauts travel through space." },
                    { word: "stair", emoji: "🪜", sentence: "Be careful on the steep stair." },
                    { word: "symbol", emoji: "🔣", sentence: "The heart is a symbol of love." },
                    { word: "thin", emoji: "📏", sentence: "The ice was too thin to walk on." }
                ]
            },
            13: { // Ingot 13: Fold
                name: "Fold",
                words: [
                    { word: "blood", emoji: "🩸", sentence: "The doctor tested his blood." },
                    { word: "burn", emoji: "🔥", sentence: "Be careful not to burn the toast." },
                    { word: "cell", emoji: "🔬", sentence: "Every living thing is made of cells." },
                    { word: "contain", emoji: "📦", sentence: "This box contains old photographs." },
                    { word: "correct", emoji: "✅", sentence: "Your answer is correct." },
                    { word: "crop", emoji: "🌾", sentence: "Farmers harvest their crops in autumn." },
                    { word: "demand", emoji: "📊", sentence: "There is high demand for fresh fruit." },
                    { word: "equal", emoji: "⚖️", sentence: "All people deserve equal rights." },
                    { word: "feed", emoji: "🍲", sentence: "We need to feed the hungry cat." },
                    { word: "hole", emoji: "🕳️", sentence: "There's a hole in my sock." },
                    { word: "increase", emoji: "📈", sentence: "The price of gas continues to increase." },
                    { word: "lord", emoji: "👑", sentence: "The lord lived in a large castle." },
                    { word: "owe", emoji: "💰", sentence: "I owe you ten dollars." },
                    { word: "position", emoji: "📍", sentence: "Apply for the position if you're qualified." },
                    { word: "raise", emoji: "📈", sentence: "They plan to raise the flag at dawn." },
                    { word: "responsible", emoji: "✅", sentence: "Parents are responsible for their children." },
                    { word: "sight", emoji: "👁️", sentence: "The sunset was a beautiful sight." },
                    { word: "spot", emoji: "🔴", sentence: "I spotted a deer in the woods." },
                    { word: "structure", emoji: "🏛️", sentence: "The building has a steel structure." },
                    { word: "whole", emoji: "🟤", sentence: "She ate the whole pizza by herself." }
                ]
            },
            14: { // Ingot 14: Shape
                name: "Shape",
                words: [
                    { word: "coach", emoji: "🏋️", sentence: "The coach taught us how to play better." },
                    { word: "control", emoji: "🎮", sentence: "Learn to control your emotions." },
                    { word: "description", emoji: "📝", sentence: "Give a detailed description of the thief." },
                    { word: "direct", emoji: "⬆️", sentence: "Can you direct me to the station?" },
                    { word: "exam", emoji: "📋", sentence: "She studied hard for the final exam." },
                    { word: "example", emoji: "📌", sentence: "Let me give you an example." },
                    { word: "limit", emoji: "⏱️", sentence: "There's a limit to how much we can carry." },
                    { word: "local", emoji: "🏠", sentence: "We buy our food from local farmers." },
                    { word: "magical", emoji: "✨", sentence: "The fairy tale had a magical ending." },
                    { word: "mail", emoji: "📬", sentence: "I need to mail this letter today." },
                    { word: "novel", emoji: "📖", sentence: "She's reading a novel about pirates." },
                    { word: "outline", emoji: "✏️", sentence: "Draw an outline of the map first." },
                    { word: "poet", emoji: "🖋️", sentence: "The poet wrote beautiful verses." },
                    { word: "print", emoji: "🖨️", sentence: "Please print your name clearly." },
                    { word: "scene", emoji: "🎬", sentence: "The movie's opening scene was exciting." },
                    { word: "sheet", emoji: "📄", sentence: "Write your answers on this sheet." },
                    { word: "silly", emoji: "🤪", sentence: "That's a silly joke." },
                    { word: "store", emoji: "🏪", sentence: "We went to the store to buy milk." },
                    { word: "suffer", emoji: "😔", sentence: "Many people suffer from allergies." },
                    { word: "technology", emoji: "💻", sentence: "Technology changes so fast." }
                ]
            },
            15: { // Ingot 15: Edge
                name: "Edge",
                words: [
                    { word: "across", emoji: "↔️", sentence: "We swam across the river." },
                    { word: "breathe", emoji: "🌬️", sentence: "Remember to breathe deeply when stressed." },
                    { word: "characteristic", emoji: "🔍", sentence: "Politeness is a characteristic of a good person." },
                    { word: "consume", emoji: "🍽️", sentence: "Americans consume a lot of coffee." },
                    { word: "excite", emoji: "🎉", sentence: "The news will excite the whole family." },
                    { word: "extreme", emoji: "⚠️", sentence: "Don't take extreme risks." },
                    { word: "fear", emoji: "😨", sentence: "She has a fear of heights." },
                    { word: "fortunate", emoji: "🍀", sentence: "We were fortunate to find a parking spot." },
                    { word: "happen", emoji: "✨", sentence: "Good things happen when you least expect them." },
                    { word: "length", emoji: "📏", sentence: "The length of the table is six feet." },
                    { word: "mistake", emoji: "❌", sentence: "Everyone makes a mistake sometimes." },
                    { word: "observe", emoji: "👀", sentence: "Scientists observe the stars through telescopes." },
                    { word: "opportunity", emoji: "🚪", sentence: "Don't miss this opportunity to learn." },
                    { word: "prize", emoji: "🏆", sentence: "She won first prize in the contest." },
                    { word: "race", emoji: "🏃", sentence: "He won the race by a second." },
                    { word: "realize", emoji: "💡", sentence: "I didn't realize how late it was." },
                    { word: "respond", emoji: "📢", sentence: "Please respond to my message." },
                    { word: "risk", emoji: "⚠️", sentence: "Don't risk your safety." },
                    { word: "wonder", emoji: "🤔", sentence: "I wonder what will happen next." },
                    { word: "yet", emoji: "⏳", sentence: "She hasn't arrived yet." }
                ]
            },
            16: { // Ingot 16: Curve
                name: "Curve",
                words: [
                    { word: "academy", emoji: "🏫", sentence: "She attends the music academy." },
                    { word: "ancient", emoji: "🏛️", sentence: "We visited ancient ruins in Greece." },
                    { word: "board", emoji: "📋", sentence: "Write your ideas on the board." },
                    { word: "century", emoji: "📅", sentence: "The building is over a century old." },
                    { word: "clue", emoji: "🔍", sentence: "The detective found an important clue." },
                    { word: "concert", emoji: "🎵", sentence: "We went to a rock concert last night." },
                    { word: "county", emoji: "🗺️", sentence: "They live in a small county." },
                    { word: "dictionary", emoji: "📚", sentence: "Look up the word in the dictionary." },
                    { word: "exist", emoji: "✨", sentence: "Do ghosts really exist?" },
                    { word: "flat", emoji: "🏢", sentence: "They live in a flat in the city." },
                    { word: "gentleman", emoji: "🎩", sentence: "He's a true gentleman." },
                    { word: "hidden", emoji: "🕵️", sentence: "There's a hidden treasure on the island." },
                    { word: "maybe", emoji: "🤔", sentence: "Maybe we'll go to the beach tomorrow." },
                    { word: "officer", emoji: "👮", sentence: "The officer helped us cross the street." },
                    { word: "original", emoji: "🖼️", sentence: "This is the original painting." },
                    { word: "pound", emoji: "💷", sentence: "The cake weighs two pounds." },
                    { word: "process", emoji: "⚙️", sentence: "Learning is a slow process." },
                    { word: "publish", emoji: "📰", sentence: "They will publish the book next month." },
                    { word: "theater", emoji: "🎭", sentence: "We saw a play at the theater." },
                    { word: "wealth", emoji: "💰", sentence: "His wealth comes from hard work." }
                ]
            },
            17: { // Ingot 17: Point
                name: "Point",
                words: [
                    { word: "appreciate", emoji: "🙏", sentence: "I appreciate all your help." },
                    { word: "available", emoji: "✅", sentence: "Is this seat available?" },
                    { word: "beat", emoji: "🥁", sentence: "The drummer beat the drum loudly." },
                    { word: "bright", emoji: "💡", sentence: "The sun is very bright today." },
                    { word: "celebrate", emoji: "🎉", sentence: "Let's celebrate your birthday!" },
                    { word: "determine", emoji: "🔍", sentence: "We need to determine the cause." },
                    { word: "disappear", emoji: "👻", sentence: "The magician made the coin disappear." },
                    { word: "else", emoji: "🤷", sentence: "What else do you need?" },
                    { word: "fair", emoji: "⚖️", sentence: "That's not fair!" },
                    { word: "flow", emoji: "🌊", sentence: "The river flows to the sea." },
                    { word: "forward", emoji: "⬆️", sentence: "Please step forward." },
                    { word: "hill", emoji: "⛰️", sentence: "They rolled down the hill." },
                    { word: "level", emoji: "📊", sentence: "What level are you in the game?" },
                    { word: "lone", emoji: "🧍", sentence: "A lone tree stood in the field." },
                    { word: "puddle", emoji: "💧", sentence: "The child jumped in the puddle." },
                    { word: "response", emoji: "💬", sentence: "I'm waiting for a response." },
                    { word: "season", emoji: "🍂", sentence: "Autumn is my favorite season." },
                    { word: "solution", emoji: "🧪", sentence: "We found a solution to the problem." },
                    { word: "waste", emoji: "🗑️", sentence: "Don't waste food." },
                    { word: "whether", emoji: "🤔", sentence: "I don't know whether to go or stay." }
                ]
            },
            18: { // Ingot 18: Balance
                name: "Balance",
                words: [
                    { word: "argue", emoji: "🗣️", sentence: "Don't argue with your sister." },
                    { word: "communicate", emoji: "📞", sentence: "We communicate by email." },
                    { word: "crowd", emoji: "👥", sentence: "There was a large crowd at the concert." },
                    { word: "depend", emoji: "🤝", sentence: "You can depend on me." },
                    { word: "dish", emoji: "🍽️", sentence: "Please wash the dishes." },
                    { word: "empty", emoji: "📦", sentence: "The box is empty." },
                    { word: "exact", emoji: "🎯", sentence: "Tell me the exact time." },
                    { word: "fresh", emoji: "🥗", sentence: "We bought fresh vegetables." },
                    { word: "gather", emoji: "👥", sentence: "Let's gather around the fire." },
                    { word: "indicate", emoji: "👉", sentence: "The sign indicates the way out." },
                    { word: "item", emoji: "📦", sentence: "Each item has a price tag." },
                    { word: "offer", emoji: "🎁", sentence: "They made me a job offer." },
                    { word: "price", emoji: "💰", sentence: "The price of gas is rising." },
                    { word: "product", emoji: "📦", sentence: "This product is made in China." },
                    { word: "property", emoji: "🏠", sentence: "That house is my property." },
                    { word: "purchase", emoji: "💳", sentence: "I need to purchase a new phone." },
                    { word: "recommend", emoji: "👍", sentence: "I recommend this restaurant." },
                    { word: "select", emoji: "✅", sentence: "Select your favorite color." },
                    { word: "tool", emoji: "🔧", sentence: "A hammer is a useful tool." },
                    { word: "treat", emoji: "🍬", sentence: "Grandma gave us a treat." }
                ]
            },
            19: { // Ingot 19: Polish
                name: "Polish",
                words: [
                    { word: "alive", emoji: "💚", sentence: "The plant is still alive." },
                    { word: "bone", emoji: "🦴", sentence: "The dog buried a bone." },
                    { word: "bother", emoji: "😤", sentence: "Don't bother me while I'm working." },
                    { word: "captain", emoji: "👨‍✈️", sentence: "The captain welcomed us aboard." },
                    { word: "conclusion", emoji: "🔚", sentence: "What conclusion did you reach?" },
                    { word: "doubt", emoji: "🤨", sentence: "I doubt he'll arrive on time." },
                    { word: "explore", emoji: "🧭", sentence: "Let's explore the forest." },
                    { word: "foreign", emoji: "🌍", sentence: "She speaks two foreign languages." },
                    { word: "glad", emoji: "😊", sentence: "I'm glad you came." },
                    { word: "however", emoji: "🔄", sentence: "It's raining; however, we'll still go." },
                    { word: "injustice", emoji: "⚖️", sentence: "They fought against injustice." },
                    { word: "international", emoji: "🌐", sentence: "She works for an international company." },
                    { word: "lawyer", emoji: "⚖️", sentence: "The lawyer defended her client." },
                    { word: "mention", emoji: "🗣️", sentence: "Did she mention the party?" },
                    { word: "policy", emoji: "📋", sentence: "The school has a strict policy." },
                    { word: "social", emoji: "👥", sentence: "Humans are social creatures." },
                    { word: "speech", emoji: "🎤", sentence: "He gave an inspiring speech." },
                    { word: "staff", emoji: "👔", sentence: "The hotel staff are friendly." },
                    { word: "toward", emoji: "➡️", sentence: "She walked toward the door." },
                    { word: "wood", emoji: "🪵", sentence: "The table is made of wood." }
                ]
            },
            20: { // Ingot 20: Gleam
                name: "Gleam",
                words: [
                    { word: "achieve", emoji: "🏆", sentence: "You can achieve anything with hard work." },
                    { word: "advise", emoji: "💬", sentence: "I advise you to study harder." },
                    { word: "already", emoji: "✅", sentence: "I've already eaten lunch." },
                    { word: "basic", emoji: "📚", sentence: "These are the basic rules." },
                    { word: "bit", emoji: "🔹", sentence: "Just a bit of sugar, please." },
                    { word: "consider", emoji: "🤔", sentence: "Consider all your options." },
                    { word: "destroy", emoji: "💥", sentence: "The fire destroyed the building." },
                    { word: "entertain", emoji: "🎪", sentence: "The clown entertained the children." },
                    { word: "extra", emoji: "➕", sentence: "Do you have an extra pencil?" },
                    { word: "goal", emoji: "🥅", sentence: "Her goal is to become a doctor." },
                    { word: "lie", emoji: "🤥", sentence: "Never tell a lie." },
                    { word: "meat", emoji: "🥩", sentence: "They don't eat meat." },
                    { word: "opinion", emoji: "💭", sentence: "In my opinion, it's a bad idea." },
                    { word: "real", emoji: "✅", sentence: "Is that a real diamond?" },
                    { word: "reflect", emoji: "🪞", sentence: "The water reflected the trees." },
                    { word: "regard", emoji: "👀", sentence: "Please regard the rules carefully." },
                    { word: "serve", emoji: "🍽️", sentence: "They serve breakfast until 11." },
                    { word: "vegetable", emoji: "🥕", sentence: "Eat your vegetables." },
                    { word: "war", emoji: "⚔️", sentence: "The war lasted five years." },
                    { word: "worth", emoji: "💰", sentence: "How much is it worth?" }
                ]
            },
            21: { // Ingot 21: Pattern
                name: "Pattern",
                words: [
                    { word: "appear", emoji: "👻", sentence: "A figure appeared in the fog." },
                    { word: "base", emoji: "🏛️", sentence: "The base of the mountain is rocky." },
                    { word: "brain", emoji: "🧠", sentence: "The brain controls the body." },
                    { word: "career", emoji: "💼", sentence: "She has a successful career in law." },
                    { word: "clerk", emoji: "🧑‍💼", sentence: "The clerk helped me find the book." },
                    { word: "effort", emoji: "💪", sentence: "Put some effort into your work." },
                    { word: "enter", emoji: "🚪", sentence: "Please enter through the front door." },
                    { word: "excellent", emoji: "🌟", sentence: "You did an excellent job." },
                    { word: "hero", emoji: "🦸", sentence: "The firefighter is a hero." },
                    { word: "hurry", emoji: "⏰", sentence: "We need to hurry or we'll be late." },
                    { word: "inform", emoji: "📢", sentence: "I must inform you of the news." },
                    { word: "later", emoji: "⏱️", sentence: "I'll call you later." },
                    { word: "leave", emoji: "👋", sentence: "Don't leave your bags unattended." },
                    { word: "locate", emoji: "📍", sentence: "I can't locate my keys." },
                    { word: "nurse", emoji: "👩‍⚕️", sentence: "The nurse took my temperature." },
                    { word: "operation", emoji: "🏥", sentence: "He needs an operation on his knee." },
                    { word: "pain", emoji: "🤕", sentence: "I have a pain in my back." },
                    { word: "refuse", emoji: "🚫", sentence: "I refuse to answer that question." },
                    { word: "though", emoji: "🤔", sentence: "Though it's late, I'm not tired." },
                    { word: "various", emoji: "🌈", sentence: "We saw various birds at the park." }
                ]
            },
            22: { // Ingot 22: Inlay
                name: "Inlay",
                words: [
                    { word: "actual", emoji: "✅", sentence: "The actual cost was higher than expected." },
                    { word: "amaze", emoji: "😲", sentence: "Magicians amaze their audiences." },
                    { word: "charge", emoji: "🔋", sentence: "Don't forget to charge your phone." },
                    { word: "comfort", emoji: "😌", sentence: "A soft pillow provides comfort." },
                    { word: "contact", emoji: "📞", sentence: "I'll contact you tomorrow." },
                    { word: "customer", emoji: "🛒", sentence: "The customer is always right." },
                    { word: "deliver", emoji: "📦", sentence: "They deliver pizza in 30 minutes." },
                    { word: "earn", emoji: "💰", sentence: "You need to earn your allowance." },
                    { word: "gate", emoji: "🚪", sentence: "Meet me at the airport gate." },
                    { word: "include", emoji: "📋", sentence: "Does the price include tax?" },
                    { word: "manage", emoji: "📊", sentence: "Can you manage the project?" },
                    { word: "mystery", emoji: "🕵️", sentence: "The mystery was finally solved." },
                    { word: "occur", emoji: "✨", sentence: "When did the accident occur?" },
                    { word: "opposite", emoji: "🔄", sentence: "Hot is the opposite of cold." },
                    { word: "plate", emoji: "🍽️", sentence: "He cleaned his plate." },
                    { word: "receive", emoji: "📨", sentence: "Did you receive my letter?" },
                    { word: "reward", emoji: "🎁", sentence: "There's a reward for finding the dog." },
                    { word: "set", emoji: "🎬", sentence: "The movie set was enormous." },
                    { word: "steal", emoji: "🚫", sentence: "It's wrong to steal." },
                    { word: "thief", emoji: "🦹", sentence: "The thief was caught on camera." }
                ]
            },
            23: { // Ingot 23: Filigree
                name: "Filigree",
                words: [
                    { word: "advance", emoji: "⬆️", sentence: "Technology continues to advance." },
                    { word: "athlete", emoji: "🏃", sentence: "The athlete trained for months." },
                    { word: "average", emoji: "📊", sentence: "His grades are above average." },
                    { word: "behavior", emoji: "😊", sentence: "Good behavior is rewarded." },
                    { word: "behind", emoji: "⬅️", sentence: "The sun is behind the clouds." },
                    { word: "course", emoji: "⛳", sentence: "Of course you can come!" },
                    { word: "lower", emoji: "⬇️", sentence: "Please lower your voice." },
                    { word: "match", emoji: "🏆", sentence: "The colors match perfectly." },
                    { word: "member", emoji: "👥", sentence: "She's a member of the club." },
                    { word: "mental", emoji: "🧠", sentence: "Mental health is important." },
                    { word: "passenger", emoji: "🚗", sentence: "The passenger fell asleep." },
                    { word: "personality", emoji: "🌟", sentence: "She has a bright personality." },
                    { word: "poem", emoji: "📝", sentence: "He wrote a poem for her." },
                    { word: "pole", emoji: "🎣", sentence: "The flag flew on the pole." },
                    { word: "remove", emoji: "❌", sentence: "Please remove your shoes." },
                    { word: "safety", emoji: "🛡️", sentence: "Safety comes first." },
                    { word: "shoot", emoji: "📸", sentence: "I'll shoot some photos." },
                    { word: "sound", emoji: "🔊", sentence: "I heard a strange sound." },
                    { word: "swim", emoji: "🏊", sentence: "Let's swim in the lake." },
                    { word: "web", emoji: "🕸️", sentence: "The spider spun a web." }
                ]
            },
            24: { // Ingot 24: Engrave
                name: "Engrave",
                words: [
                    { word: "block", emoji: "🧱", sentence: "There's a block in the road." },
                    { word: "cheer", emoji: "🎉", sentence: "The crowd began to cheer." },
                    { word: "complex", emoji: "🔷", sentence: "This puzzle is too complex." },
                    { word: "critic", emoji: "🎬", sentence: "The critic loved the movie." },
                    { word: "event", emoji: "📅", sentence: "The event starts at 8." },
                    { word: "exercise", emoji: "🏋️", sentence: "Daily exercise is healthy." },
                    { word: "fit", emoji: "💪", sentence: "These shoes don't fit me." },
                    { word: "friendship", emoji: "🤝", sentence: "True friendship lasts forever." },
                    { word: "guide", emoji: "🧭", sentence: "The guide showed us around." },
                    { word: "lack", emoji: "❌", sentence: "A lack of sleep makes you tired." },
                    { word: "passage", emoji: "📖", sentence: "Read the passage aloud." },
                    { word: "perform", emoji: "🎭", sentence: "The band will perform tonight." },
                    { word: "pressure", emoji: "⚙️", sentence: "Don't put pressure on yourself." },
                    { word: "probable", emoji: "📊", sentence: "It's probable that it will rain." },
                    { word: "public", emoji: "👥", sentence: "The library is a public place." },
                    { word: "strike", emoji: "⚡", sentence: "Lightning might strike." },
                    { word: "support", emoji: "🤝", sentence: "Friends support each other." },
                    { word: "task", emoji: "📋", sentence: "Finish your task first." },
                    { word: "term", emoji: "📚", sentence: "This term ends in June." },
                    { word: "unite", emoji: "🤝", sentence: "Let's unite for a common cause." }
                ]
            },
            25: { // Ingot 25: Harden
                name: "Harden",
                words: [
                    { word: "associate", emoji: "👥", sentence: "I associate summer with beach trips." },
                    { word: "environment", emoji: "🌍", sentence: "Protect the environment." },
                    { word: "factory", emoji: "🏭", sentence: "He works in a shoe factory." },
                    { word: "feature", emoji: "📱", sentence: "The new phone has many features." },
                    { word: "instance", emoji: "📌", sentence: "For instance, take this example." },
                    { word: "involve", emoji: "🔄", sentence: "Don't involve me in your argument." },
                    { word: "medicine", emoji: "💊", sentence: "Take this medicine twice a day." },
                    { word: "mix", emoji: "🔄", sentence: "Mix the ingredients together." },
                    { word: "organize", emoji: "📋", sentence: "Help me organize the closet." },
                    { word: "period", emoji: "⏰", sentence: "The class lasts for a period." },
                    { word: "populate", emoji: "👥", sentence: "Birds populate the island." },
                    { word: "produce", emoji: "🍎", sentence: "The farm produces fresh vegetables." },
                    { word: "range", emoji: "📏", sentence: "The price range is wide." },
                    { word: "recognize", emoji: "👤", sentence: "I didn't recognize you with glasses." },
                    { word: "regular", emoji: "🔄", sentence: "He's a regular customer." },
                    { word: "sign", emoji: "🪧", sentence: "The sign said 'No Parking'." },
                    { word: "tip", emoji: "💡", sentence: "Here's a helpful tip." },
                    { word: "tradition", emoji: "🎭", sentence: "It's a family tradition." },
                    { word: "trash", emoji: "🗑️", sentence: "Take out the trash." },
                    { word: "wide", emoji: "📏", sentence: "The river is very wide." }
                ]
            },
            26: { // Ingot 26: Resilience
                name: "Resilience",
                words: [
                    { word: "advice", emoji: "💬", sentence: "Take my advice and study." },
                    { word: "along", emoji: "➡️", sentence: "Walk along the path." },
                    { word: "attention", emoji: "👀", sentence: "Pay attention in class." },
                    { word: "attract", emoji: "🧲", sentence: "Flowers attract bees." },
                    { word: "climb", emoji: "🧗", sentence: "Let's climb that mountain." },
                    { word: "drop", emoji: "💧", sentence: "Don't drop the glass." },
                    { word: "final", emoji: "🏁", sentence: "This is the final question." },
                    { word: "further", emoji: "➡️", sentence: "Let's discuss this further." },
                    { word: "imply", emoji: "🤔", sentence: "What are you trying to imply?" },
                    { word: "maintain", emoji: "🔧", sentence: "Maintain your car regularly." },
                    { word: "neither", emoji: "🚫", sentence: "Neither answer is correct." },
                    { word: "otherwise", emoji: "🔄", sentence: "Hurry, otherwise we'll be late." },
                    { word: "physical", emoji: "💪", sentence: "Physical exercise is important." },
                    { word: "prove", emoji: "✅", sentence: "Can you prove your theory?" },
                    { word: "react", emoji: "⚡", sentence: "How did she react to the news?" },
                    { word: "ride", emoji: "🚲", sentence: "I ride my bike to school." },
                    { word: "situated", emoji: "📍", sentence: "The hotel is situated by the lake." },
                    { word: "society", emoji: "👥", sentence: "Society expects good behavior." },
                    { word: "standard", emoji: "📏", sentence: "This meets the standard." },
                    { word: "suggest", emoji: "💡", sentence: "I suggest we leave now." }
                ]
            },
            27: { // Ingot 27: Legacy
                name: "Legacy",
                words: [
                    { word: "actually", emoji: "✅", sentence: "I actually finished the whole book." },
                    { word: "bite", emoji: "🦷", sentence: "Don't bite your nails." },
                    { word: "coast", emoji: "🏖️", sentence: "We drove along the coast." },
                    { word: "deal", emoji: "🤝", sentence: "It's a deal!" },
                    { word: "desert", emoji: "🏜️", sentence: "Camels live in the desert." },
                    { word: "earthquake", emoji: "🌋", sentence: "The earthquake shook the city." },
                    { word: "effective", emoji: "✅", sentence: "This medicine is effective." },
                    { word: "examine", emoji: "🔍", sentence: "The doctor will examine you." },
                    { word: "false", emoji: "❌", sentence: "Her statement was false." },
                    { word: "gift", emoji: "🎁", sentence: "She received a lovely gift." },
                    { word: "hunger", emoji: "🍽️", sentence: "Hunger made him irritable." },
                    { word: "imagine", emoji: "💭", sentence: "Imagine a world without war." },
                    { word: "journey", emoji: "🧳", sentence: "The journey took three days." },
                    { word: "puzzle", emoji: "🧩", sentence: "This puzzle has 100 pieces." },
                    { word: "quite", emoji: "✅", sentence: "It's quite cold today." },
                    { word: "rather", emoji: "🤔", sentence: "I'd rather stay home." },
                    { word: "specific", emoji: "🎯", sentence: "Be more specific about what you want." },
                    { word: "tour", emoji: "🚌", sentence: "We took a tour of the city." },
                    { word: "trip", emoji: "✈️", sentence: "Have a safe trip." },
                    { word: "value", emoji: "💰", sentence: "This ring has great value." }
                ]
            },
            28: { // Ingot 28: Masterpiece
                name: "Masterpiece",
                words: [
                    { word: "band", emoji: "🎸", sentence: "The band played our favorite song." },
                    { word: "barely", emoji: "📏", sentence: "I barely passed the test." },
                    { word: "boring", emoji: "😴", sentence: "The movie was so boring." },
                    { word: "cancel", emoji: "❌", sentence: "They had to cancel the game." },
                    { word: "driveway", emoji: "🚗", sentence: "The car is in the driveway." },
                    { word: "garbage", emoji: "🗑️", sentence: "Take out the garbage." },
                    { word: "instrument", emoji: "🎻", sentence: "The violin is a beautiful instrument." },
                    { word: "list", emoji: "📝", sentence: "Make a list of things to do." },
                    { word: "magic", emoji: "✨", sentence: "The magic trick amazed everyone." },
                    { word: "message", emoji: "💬", sentence: "I got your message." },
                    { word: "notice", emoji: "👀", sentence: "Did you notice the sign?" },
                    { word: "own", emoji: "🏠", sentence: "I own my own house." },
                    { word: "predict", emoji: "🔮", sentence: "Can you predict the future?" },
                    { word: "professor", emoji: "👨‍🏫", sentence: "The professor gave a lecture." },
                    { word: "rush", emoji: "⏰", sentence: "Don't rush; take your time." },
                    { word: "schedule", emoji: "📅", sentence: "Check the schedule for train times." },
                    { word: "share", emoji: "🤝", sentence: "Let's share our snacks." },
                    { word: "stage", emoji: "🎭", sentence: "She danced on the stage." },
                    { word: "storm", emoji: "⛈️", sentence: "The storm knocked down trees." },
                    { word: "within", emoji: "🔲", sentence: "Stay within the lines." }
                ]
            },
            29: { // Ingot 29: Legendary
                name: "Legendary",
                words: [
                    { word: "advertise", emoji: "📢", sentence: "Companies advertise on TV." },
                    { word: "assign", emoji: "📝", sentence: "The teacher will assign homework." },
                    { word: "audience", emoji: "👥", sentence: "The audience clapped loudly." },
                    { word: "breakfast", emoji: "🍳", sentence: "Breakfast is the most important meal." },
                    { word: "competition", emoji: "🏆", sentence: "She won the singing competition." },
                    { word: "cool", emoji: "😎", sentence: "That's a cool hat." },
                    { word: "gain", emoji: "📈", sentence: "You'll gain experience." },
                    { word: "importance", emoji: "⭐", sentence: "Health is of great importance." },
                    { word: "knowledge", emoji: "📚", sentence: "Knowledge is power." },
                    { word: "major", emoji: "📚", sentence: "What's your major in college?" },
                    { word: "mean", emoji: "😠", sentence: "Don't be so mean." },
                    { word: "prefer", emoji: "👍", sentence: "I prefer tea over coffee." },
                    { word: "president", emoji: "👔", sentence: "The president gave a speech." },
                    { word: "progress", emoji: "📈", sentence: "You're making good progress." },
                    { word: "respect", emoji: "🙏", sentence: "Respect your elders." },
                    { word: "rich", emoji: "💰", sentence: "He became rich from his business." },
                    { word: "skill", emoji: "🎯", sentence: "Cooking is a useful skill." },
                    { word: "somehow", emoji: "🤷", sentence: "We'll finish somehow." },
                    { word: "strength", emoji: "💪", sentence: "Exercise builds strength." },
                    { word: "vote", emoji: "🗳️", sentence: "Don't forget to vote." }
                ]
            },
            30: { // Ingot 30: Soulforge
                name: "Soulforge",
                words: [
                    { word: "above", emoji: "⬆️", sentence: "The stars are above us." },
                    { word: "ahead", emoji: "⬆️", sentence: "There's a storm ahead." },
                    { word: "amount", emoji: "📏", sentence: "A small amount of sugar." },
                    { word: "belief", emoji: "🙏", sentence: "She has strong beliefs." },
                    { word: "center", emoji: "🎯", sentence: "Meet me at the town center." },
                    { word: "common", emoji: "👥", sentence: "It's common to feel nervous." },
                    { word: "cost", emoji: "💰", sentence: "The cost is too high." },
                    { word: "demonstrate", emoji: "📢", sentence: "Let me demonstrate how it works." },
                    { word: "different", emoji: "🔄", sentence: "We have different opinions." },
                    { word: "evidence", emoji: "🔍", sentence: "The police found evidence." },
                    { word: "honesty", emoji: "⚖️", sentence: "Honesty is the best policy." },
                    { word: "idiom", emoji: "📚", sentence: "'Break a leg' is an idiom." },
                    { word: "independent", emoji: "🦸", sentence: "She's very independent." },
                    { word: "inside", emoji: "🏠", sentence: "Come inside; it's cold out." },
                    { word: "master", emoji: "👑", sentence: "He's a master of chess." },
                    { word: "memory", emoji: "🧠", sentence: "I have fond memories of childhood." },
                    { word: "proper", emoji: "✅", sentence: "Use the proper tools." },
                    { word: "scan", emoji: "📱", sentence: "Scan the QR code." },
                    { word: "section", emoji: "📚", sentence: "This section is for fiction." },
                    { word: "surface", emoji: "📏", sentence: "The surface is smooth." }
                ]
            }
        }
    },
    // WORLD 2: ENCHANTED FOREST (600 words) - Placeholder structure
    world2: {
        name: "Enchanted Forest",
        icon: "🌳",
        unitType: "Seed",
        units: {}
    },
    // WORLD 3: CRYSTAL CAVERNS (600 words) - Placeholder structure
    world3: {
        name: "Crystal Caverns",
        icon: "💎",
        unitType: "Geode",
        units: {}
    },
    // WORLD 4: SKY CITADEL (600 words) - Placeholder structure
    world4: {
        name: "Sky Citadel",
        icon: "☁️",
        unitType: "Cloud",
        units: {}
    },
    // WORLD 5: DRAGON'S PEAK (600 words) - Placeholder structure
    world5: {
        name: "Dragon's Peak",
        icon: "🐉",
        unitType: "Scale",
        units: {}
    },
    // WORLD 6: STAR FORGE (600 words) - Placeholder structure
    world6: {
        name: "Star Forge",
        icon: "⭐",
        unitType: "Star",
        units: {}
    }
};

// Add placeholder units for world2
for (let i = 31; i <= 60; i++) {
    MASTER_WORDS.world2.units[i] = {
        name: `Seed ${i-30}`,
        words: []
    };
}

// Add placeholder units for world3
for (let i = 61; i <= 90; i++) {
    MASTER_WORDS.world3.units[i] = {
        name: `Geode ${i-60}`,
        words: []
    };
}

// Add placeholder units for world4
for (let i = 91; i <= 120; i++) {
    MASTER_WORDS.world4.units[i] = {
        name: `Cloud ${i-90}`,
        words: []
    };
}

// Add placeholder units for world5
for (let i = 121; i <= 150; i++) {
    MASTER_WORDS.world5.units[i] = {
        name: `Scale ${i-120}`,
        words: []
    };
}

// Add placeholder units for world6
for (let i = 151; i <= 180; i++) {
    MASTER_WORDS.world6.units[i] = {
        name: `Star ${i-150}`,
        words: []
    };
}

// ---------- INGOT DIFFICULTY DATABASE ----------
const ingotDifficulty = {
    // WORLD 1: Grand Forge (Ingots 1-30)
    1: { baseChance: 100, tier: "Foundation" },
    2: { baseChance: 99, tier: "Foundation" },
    3: { baseChance: 98, tier: "Foundation" },
    4: { baseChance: 97, tier: "Foundation" },
    5: { baseChance: 96, tier: "Foundation" },
    6: { baseChance: 95, tier: "Foundation" },
    7: { baseChance: 94, tier: "Foundation" },
    8: { baseChance: 93, tier: "Foundation" },
    9: { baseChance: 92, tier: "Foundation" },
    10: { baseChance: 91, tier: "Foundation" },
    11: { baseChance: 90, tier: "Crafting" },
    12: { baseChance: 89, tier: "Crafting" },
    13: { baseChance: 88, tier: "Crafting" },
    14: { baseChance: 87, tier: "Crafting" },
    15: { baseChance: 86, tier: "Crafting" },
    16: { baseChance: 85, tier: "Crafting" },
    17: { baseChance: 84, tier: "Crafting" },
    18: { baseChance: 83, tier: "Crafting" },
    19: { baseChance: 82, tier: "Crafting" },
    20: { baseChance: 81, tier: "Crafting" },
    21: { baseChance: 80, tier: "Masterwork" },
    22: { baseChance: 79, tier: "Masterwork" },
    23: { baseChance: 78, tier: "Masterwork" },
    24: { baseChance: 77, tier: "Masterwork" },
    25: { baseChance: 76, tier: "Masterwork" },
    26: { baseChance: 75, tier: "Masterwork" },
    27: { baseChance: 74, tier: "Masterwork" },
    28: { baseChance: 73, tier: "Masterwork" },
    29: { baseChance: 72, tier: "Masterwork" },
    30: { baseChance: 71, tier: "Masterwork" },
    
    // WORLD 2: Enchanted Forest (Seeds 31-60)
    31: { baseChance: 70, tier: "Sprouting" },
    32: { baseChance: 69, tier: "Sprouting" },
    33: { baseChance: 68, tier: "Sprouting" },
    34: { baseChance: 67, tier: "Sprouting" },
    35: { baseChance: 66, tier: "Sprouting" },
    36: { baseChance: 65, tier: "Sprouting" },
    37: { baseChance: 64, tier: "Sprouting" },
    38: { baseChance: 63, tier: "Sprouting" },
    39: { baseChance: 62, tier: "Sprouting" },
    40: { baseChance: 61, tier: "Sprouting" },
    41: { baseChance: 60, tier: "Blooming" },
    42: { baseChance: 59, tier: "Blooming" },
    43: { baseChance: 58, tier: "Blooming" },
    44: { baseChance: 57, tier: "Blooming" },
    45: { baseChance: 56, tier: "Blooming" },
    46: { baseChance: 55, tier: "Blooming" },
    47: { baseChance: 54, tier: "Blooming" },
    48: { baseChance: 53, tier: "Blooming" },
    49: { baseChance: 52, tier: "Blooming" },
    50: { baseChance: 51, tier: "Blooming" },
    51: { baseChance: 50, tier: "Ancient" },
    52: { baseChance: 49, tier: "Ancient" },
    53: { baseChance: 48, tier: "Ancient" },
    54: { baseChance: 47, tier: "Ancient" },
    55: { baseChance: 46, tier: "Ancient" },
    56: { baseChance: 45, tier: "Ancient" },
    57: { baseChance: 44, tier: "Ancient" },
    58: { baseChance: 43, tier: "Ancient" },
    59: { baseChance: 42, tier: "Ancient" },
    60: { baseChance: 41, tier: "Ancient" },
    
    // WORLD 3: Crystal Caverns (Geodes 61-90)
    61: { baseChance: 40, tier: "Rough" },
    62: { baseChance: 39, tier: "Rough" },
    63: { baseChance: 38, tier: "Rough" },
    64: { baseChance: 37, tier: "Rough" },
    65: { baseChance: 36, tier: "Rough" },
    66: { baseChance: 35, tier: "Rough" },
    67: { baseChance: 34, tier: "Rough" },
    68: { baseChance: 33, tier: "Rough" },
    69: { baseChance: 32, tier: "Rough" },
    70: { baseChance: 31, tier: "Rough" },
    71: { baseChance: 30, tier: "Revealed" },
    72: { baseChance: 29, tier: "Revealed" },
    73: { baseChance: 28, tier: "Revealed" },
    74: { baseChance: 27, tier: "Revealed" },
    75: { baseChance: 26, tier: "Revealed" },
    76: { baseChance: 25, tier: "Revealed" },
    77: { baseChance: 24, tier: "Revealed" },
    78: { baseChance: 23, tier: "Revealed" },
    79: { baseChance: 22, tier: "Revealed" },
    80: { baseChance: 21, tier: "Revealed" },
    81: { baseChance: 20, tier: "Perfect" },
    82: { baseChance: 19, tier: "Perfect" },
    83: { baseChance: 18, tier: "Perfect" },
    84: { baseChance: 17, tier: "Perfect" },
    85: { baseChance: 16, tier: "Perfect" },
    86: { baseChance: 15, tier: "Perfect" },
    87: { baseChance: 14, tier: "Perfect" },
    88: { baseChance: 13, tier: "Perfect" },
    89: { baseChance: 12, tier: "Perfect" },
    90: { baseChance: 11, tier: "Perfect" },
    
    // WORLD 4: Sky Citadel (Clouds 91-120)
    91: { baseChance: 10, tier: "Drifting" },
    92: { baseChance: 10, tier: "Drifting" },
    93: { baseChance: 10, tier: "Drifting" },
    94: { baseChance: 10, tier: "Drifting" },
    95: { baseChance: 10, tier: "Drifting" },
    96: { baseChance: 9, tier: "Drifting" },
    97: { baseChance: 9, tier: "Drifting" },
    98: { baseChance: 9, tier: "Drifting" },
    99: { baseChance: 9, tier: "Drifting" },
    100: { baseChance: 9, tier: "Drifting" },
    101: { baseChance: 8, tier: "Powerful" },
    102: { baseChance: 8, tier: "Powerful" },
    103: { baseChance: 8, tier: "Powerful" },
    104: { baseChance: 8, tier: "Powerful" },
    105: { baseChance: 8, tier: "Powerful" },
    106: { baseChance: 7, tier: "Powerful" },
    107: { baseChance: 7, tier: "Powerful" },
    108: { baseChance: 7, tier: "Powerful" },
    109: { baseChance: 7, tier: "Powerful" },
    110: { baseChance: 7, tier: "Powerful" },
    111: { baseChance: 6, tier: "Masterful" },
    112: { baseChance: 6, tier: "Masterful" },
    113: { baseChance: 6, tier: "Masterful" },
    114: { baseChance: 6, tier: "Masterful" },
    115: { baseChance: 6, tier: "Masterful" },
    116: { baseChance: 5, tier: "Masterful" },
    117: { baseChance: 5, tier: "Masterful" },
    118: { baseChance: 5, tier: "Masterful" },
    119: { baseChance: 5, tier: "Masterful" },
    120: { baseChance: 5, tier: "Masterful" },
    
    // WORLD 5: Dragon's Peak (Scales 121-150)
    121: { baseChance: 5, tier: "Hatchling" },
    122: { baseChance: 5, tier: "Hatchling" },
    123: { baseChance: 5, tier: "Hatchling" },
    124: { baseChance: 5, tier: "Hatchling" },
    125: { baseChance: 5, tier: "Hatchling" },
    126: { baseChance: 4, tier: "Hatchling" },
    127: { baseChance: 4, tier: "Hatchling" },
    128: { baseChance: 4, tier: "Hatchling" },
    129: { baseChance: 4, tier: "Hatchling" },
    130: { baseChance: 4, tier: "Hatchling" },
    131: { baseChance: 4, tier: "Growing" },
    132: { baseChance: 4, tier: "Growing" },
    133: { baseChance: 4, tier: "Growing" },
    134: { baseChance: 4, tier: "Growing" },
    135: { baseChance: 4, tier: "Growing" },
    136: { baseChance: 3, tier: "Growing" },
    137: { baseChance: 3, tier: "Growing" },
    138: { baseChance: 3, tier: "Growing" },
    139: { baseChance: 3, tier: "Growing" },
    140: { baseChance: 3, tier: "Growing" },
    141: { baseChance: 3, tier: "Elder" },
    142: { baseChance: 3, tier: "Elder" },
    143: { baseChance: 3, tier: "Elder" },
    144: { baseChance: 3, tier: "Elder" },
    145: { baseChance: 3, tier: "Elder" },
    146: { baseChance: 2, tier: "Elder" },
    147: { baseChance: 2, tier: "Elder" },
    148: { baseChance: 2, tier: "Elder" },
    149: { baseChance: 2, tier: "Elder" },
    150: { baseChance: 2, tier: "Elder" },
    
    // WORLD 6: Star Forge (Stars 151-180)
    151: { baseChance: 2, tier: "Twinkling" },
    152: { baseChance: 2, tier: "Twinkling" },
    153: { baseChance: 2, tier: "Twinkling" },
    154: { baseChance: 2, tier: "Twinkling" },
    155: { baseChance: 2, tier: "Twinkling" },
    156: { baseChance: 2, tier: "Twinkling" },
    157: { baseChance: 2, tier: "Twinkling" },
    158: { baseChance: 2, tier: "Twinkling" },
    159: { baseChance: 2, tier: "Twinkling" },
    160: { baseChance: 2, tier: "Twinkling" },
    161: { baseChance: 1, tier: "Bright" },
    162: { baseChance: 1, tier: "Bright" },
    163: { baseChance: 1, tier: "Bright" },
    164: { baseChance: 1, tier: "Bright" },
    165: { baseChance: 1, tier: "Bright" },
    166: { baseChance: 1, tier: "Bright" },
    167: { baseChance: 1, tier: "Bright" },
    168: { baseChance: 1, tier: "Bright" },
    169: { baseChance: 1, tier: "Bright" },
    170: { baseChance: 1, tier: "Bright" },
    171: { baseChance: 1, tier: "Cosmic" },
    172: { baseChance: 1, tier: "Cosmic" },
    173: { baseChance: 1, tier: "Cosmic" },
    174: { baseChance: 1, tier: "Cosmic" },
    175: { baseChance: 1, tier: "Cosmic" },
    176: { baseChance: 1, tier: "Cosmic" },
    177: { baseChance: 1, tier: "Cosmic" },
    178: { baseChance: 1, tier: "Cosmic" },
    179: { baseChance: 1, tier: "Cosmic" },
    180: { baseChance: 1, tier: "Cosmic" }
};

// ---------- GRACE SYSTEM ----------
const ingotGrace = {};
for (let i = 1; i <= 180; i++) {
    ingotGrace[i] = 0;
}

function calculateSuccessChance(ingotId) {
    const difficulty = ingotDifficulty[ingotId] || { baseChance: 50, tier: "Unknown" };
    const grace = ingotGrace[ingotId] || 0;
    const finalChance = Math.min(difficulty.baseChance + grace, 99);
    
    return {
        final: finalChance,
        base: difficulty.baseChance,
        grace: grace,
        tier: difficulty.tier,
        maxed: finalChance === 99
    };
}

function onFailure(ingotId) {
    if (ingotGrace[ingotId] < 98) {
        ingotGrace[ingotId]++;
    }
    saveProgress();
}

function onSuccess(ingotId) {
    ingotGrace[ingotId] = 0;
    saveProgress();
}

// ---------- FIXED PLAYER PROFILE ----------
let playerProfile = {
    displayName: "Forgemaster",
    telegramId: null,
    firstName: "",
    lastName: "",
    username: ""
};

function loadProfile() {
    try {
        // Get Telegram user data FIRST
        let telegramUser = null;
        if (tg?.initDataUnsafe?.user) {
            telegramUser = tg.initDataUnsafe.user;
            console.log('Telegram user found:', telegramUser.id); // Debug log
        } else {
            console.log('No Telegram user data - are you testing outside Telegram?');
        }
        
        // Try to load saved profile
        const saved = localStorage.getItem('spellforge_profile');
        
        if (saved) {
            // Load saved profile
            playerProfile = JSON.parse(saved);
            
            // ALWAYS update with latest Telegram data if available
            if (telegramUser) {
                playerProfile.telegramId = telegramUser.id;
                playerProfile.firstName = telegramUser.first_name || "";
                playerProfile.lastName = telegramUser.last_name || "";
                playerProfile.username = telegramUser.username || "";
                
                // Only update display name if it's still default or empty
                if (!playerProfile.displayName || playerProfile.displayName === "Forgemaster") {
                    playerProfile.displayName = telegramUser.first_name || "Forgemaster";
                }
            }
        } else {
            // No saved profile, create from Telegram user if available
            if (telegramUser) {
                playerProfile = {
                    displayName: telegramUser.first_name || "Forgemaster",
                    telegramId: telegramUser.id,
                    firstName: telegramUser.first_name || "",
                    lastName: telegramUser.last_name || "",
                    username: telegramUser.username || ""
                };
            } else {
                // Fallback to default
                playerProfile = {
                    displayName: "Forgemaster",
                    telegramId: null,
                    firstName: "",
                    lastName: "",
                    username: ""
                };
            }
        }
        
        // Save the updated profile
        saveProfile();
        console.log('Profile loaded:', playerProfile); // Debug log
        
    } catch (e) {
        console.log('Profile load error, using defaults', e);
        playerProfile = {
            displayName: "Forgemaster",
            telegramId: null,
            firstName: "",
            lastName: "",
            username: ""
        };
    }
}

function saveProfile() {
    localStorage.setItem('spellforge_profile', JSON.stringify(playerProfile));
}

function validateDisplayName(name) {
    name = name.trim();
    if (name.length < 3 || name.length > 20) return false;
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) return false;
    return true;
}

// ---------- PLAYER PERFORMANCE TRACKING ----------
let playerPerformance = {
    currentStreak: 0,
    bestStreak: 0,
    lastAccuracy: 100,
    lastAttemptFailed: false,
    lastPlayedDate: new Date().toISOString(),
    totalRiskBonus: 0,
    ingotHistory: [],
    worldProgress: {
        1: { completed: 0, failed: 0, bestTime: null },
        2: { completed: 0, failed: 0, bestTime: null },
        3: { completed: 0, failed: 0, bestTime: null },
        4: { completed: 0, failed: 0, bestTime: null },
        5: { completed: 0, failed: 0, bestTime: null },
        6: { completed: 0, failed: 0, bestTime: null }
    }
};

// ---------- WORLD DATA STRUCTURE ----------
const worlds = {
    1: {
        id: 1,
        name: "Grand Forge",
        icon: "⚒️",
        unitName: "INGOT",
        unlocked: true,
        completed: false,
        totalWords: 600,
        units: Array.from({ length: 30 }, (_, i) => {
            const unitId = i + 1;
            const unitData = MASTER_WORDS.world1.units[unitId];
            return {
                id: unitId,
                name: unitData ? unitData.name : "???",
                wordsCompleted: 0,
                totalWords: 20,
                unlocked: unitId === 1
            };
        })
    },
    2: {
        id: 2,
        name: "Enchanted Forest",
        icon: "🌳",
        unitName: "SEED",
        unlocked: false,
        completed: false,
        totalWords: 600,
        units: Array.from({ length: 30 }, (_, i) => {
            const unitId = i + 31;
            const unitData = MASTER_WORDS.world2.units[unitId];
            return {
                id: unitId,
                name: unitData ? unitData.name : "???",
                wordsCompleted: 0,
                totalWords: 20,
                unlocked: false
            };
        })
    },
    3: {
        id: 3,
        name: "Crystal Caverns",
        icon: "💎",
        unitName: "GEODE",
        unlocked: false,
        completed: false,
        totalWords: 600,
        units: Array.from({ length: 30 }, (_, i) => {
            const unitId = i + 61;
            const unitData = MASTER_WORDS.world3.units[unitId];
            return {
                id: unitId,
                name: unitData ? unitData.name : "???",
                wordsCompleted: 0,
                totalWords: 20,
                unlocked: false
            };
        })
    },
    4: {
        id: 4,
        name: "Sky Citadel",
        icon: "☁️",
        unitName: "CLOUD",
        unlocked: false,
        completed: false,
        totalWords: 600,
        units: Array.from({ length: 30 }, (_, i) => {
            const unitId = i + 91;
            const unitData = MASTER_WORDS.world4.units[unitId];
            return {
                id: unitId,
                name: unitData ? unitData.name : "???",
                wordsCompleted: 0,
                totalWords: 20,
                unlocked: false
            };
        })
    },
    5: {
        id: 5,
        name: "Dragon's Peak",
        icon: "🐉",
        unitName: "SCALE",
        unlocked: false,
        completed: false,
        totalWords: 600,
        units: Array.from({ length: 30 }, (_, i) => {
            const unitId = i + 121;
            const unitData = MASTER_WORDS.world5.units[unitId];
            return {
                id: unitId,
                name: unitData ? unitData.name : "???",
                wordsCompleted: 0,
                totalWords: 20,
                unlocked: false
            };
        })
    },
    6: {
        id: 6,
        name: "Star Forge",
        icon: "⭐",
        unitName: "STAR",
        unlocked: false,
        completed: false,
        totalWords: 600,
        units: Array.from({ length: 30 }, (_, i) => {
            const unitId = i + 151;
            const unitData = MASTER_WORDS.world6.units[unitId];
            return {
                id: unitId,
                name: unitData ? unitData.name : "???",
                wordsCompleted: 0,
                totalWords: 20,
                unlocked: false
            };
        })
    }
};

// ---------- GAME STATE ----------
let currentWorld = 1;
let currentUnit = 1;
let currentLetters = [];
let completedWords = [];
let activeWordIndex = null;
let currentPosition = 0;
let tempUsedLetters = [];
let gameStartTime = null;
let totalTaps = 0;
let correctTaps = 0;
let gameCompleted = false;
let wordCardQueue = [];
let showingWordCard = false;

// ---------- MOCK LEADERBOARD ----------
const mockLeaderboard = [
    { name: "LIAM", words: 580, rank: 1 },
    { name: "ELENA", words: 580, rank: 2 },
    { name: "SOFIA", words: 560, rank: 3 },
    { name: "NOAH", words: 560, rank: 4 },
    { name: "OLIVER", words: 540, rank: 5 },
    { name: "MIA", words: 540, rank: 6 },
    { name: "LUCAS", words: 520, rank: 7 },
    { name: "AMELIA", words: 520, rank: 8 },
    { name: "ELIJAH", words: 500, rank: 9 },
    { name: "HARPER", words: 500, rank: 10 },
    { name: "JAMES", words: 480, rank: 11 },
    { name: "EVELYN", words: 480, rank: 12 },
    { name: "BENJAMIN", words: 460, rank: 13 },
    { name: "ABIGAIL", words: 460, rank: 14 },
    { name: "ALEXANDER", words: 440, rank: 15 },
    { name: "ELIZABETH", words: 440, rank: 16 },
    { name: "HENRY", words: 420, rank: 17 },
    { name: "SOPHIA", words: 420, rank: 18 },
    { name: "DANIEL", words: 400, rank: 19 },
    { name: "CHARLOTTE", words: 400, rank: 20 },
    { name: "MATTHEW", words: 380, rank: 21 },
    { name: "AVA", words: 380, rank: 22 },
    { name: "JACKSON", words: 360, rank: 23 },
    { name: "SCARLETT", words: 360, rank: 24 },
    { name: "SEBASTIAN", words: 340, rank: 25 },
    { name: "GRACE", words: 340, rank: 26 },
    { name: "DAVID", words: 320, rank: 27 },
    { name: "CHLOE", words: 320, rank: 28 },
    { name: "JOSEPH", words: 300, rank: 29 },
    { name: "VICTORIA", words: 300, rank: 30 }
];

// ---------- HELPER FUNCTIONS ----------
function calculateTotalWords() {
    let total = 0;
    for (let worldId = 1; worldId <= 6; worldId++) {
        if (worlds[worldId]) {
            total += worlds[worldId].units.reduce((sum, unit) => sum + unit.wordsCompleted, 0);
        }
    }
    return total;
}

function getWordsByWorld() {
    const wordsByWorld = [];
    for (let worldId = 1; worldId <= 6; worldId++) {
        if (worlds[worldId]) {
            const worldTotal = worlds[worldId].units.reduce((sum, unit) => sum + unit.wordsCompleted, 0);
            wordsByWorld.push(worldTotal);
        } else {
            wordsByWorld.push(0);
        }
    }
    return wordsByWorld;
}

function getPlayerStats() {
    const wordsByWorld = getWordsByWorld();
    const totalWords = wordsByWorld.reduce((a, b) => a + b, 0);
    const ingotsMastered = worlds[1].units.filter(u => u.wordsCompleted === 20).length;
    const totalAttempts = playerPerformance.ingotHistory.length;
    const successfulAttempts = playerPerformance.ingotHistory.filter(h => h.success).length;
    const successRate = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 100;
    
    return {
        worlds: wordsByWorld,
        totalWords: totalWords,
        ingotsMastered: ingotsMastered,
        successRate: successRate
    };
}

// ---------- Always generates 30 tiles (6 rows × 5 columns) ----------
function generateInitialLetters() {
    const words = getCurrentUnitWords();
    if (!words || words.length === 0) return [];
    
    // Get the active word if one is selected, otherwise use the first word
    let targetWord = '';
    if (activeWordIndex !== null && words[activeWordIndex]) {
        targetWord = words[activeWordIndex].word;
    } else {
        targetWord = words[0]?.word || '';
    }
    
    if (!targetWord) return [];
    
    // Total tiles needed: 30 (6 rows × 5 columns)
    const TOTAL_TILES = 30;
    
    // Start with all letters from the target word
    const letters = targetWord.split('');
    
    // Add random letters until we reach 30
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    while (letters.length < TOTAL_TILES) {
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        letters.push(randomLetter);
    }
    
    // Shuffle thoroughly
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    return letters;
}

function getCurrentUnitWords() {
    try {
        return MASTER_WORDS[`world${currentWorld}`].units[currentUnit].words || [];
    } catch (e) {
        return [];
    }
}

function getWorldTier() {
    if (currentWorld === 1) {
        if (currentUnit <= 10) return "Foundation";
        if (currentUnit <= 20) return "Crafting";
        return "Masterwork";
    }
    return "";
}

function updateHeaderForGameplay() {
    const world = worlds[currentWorld];
    const unitData = MASTER_WORDS[`world${currentWorld}`].units[currentUnit];
    const unitName = unitData ? unitData.name : "Unknown";
    document.getElementById('worldIcon').innerText = world.icon;
    document.getElementById('worldName').innerText = `${world.unitName} ${currentUnit.toString().padStart(2, '0')}: ${unitName}`;
    document.getElementById('tierBadge').style.display = 'none';
    document.getElementById('progressDisplay').innerText = `${completedWords.length}/20`;
}

function updateHeaderForSelection() {
    const world = worlds[currentWorld];
    const tier = getWorldTier();
    const totalProgress = world.units.reduce((sum, unit) => sum + unit.wordsCompleted, 0);
    document.getElementById('worldIcon').innerText = world.icon;
    document.getElementById('worldName').innerText = world.name;
    document.getElementById('tierBadge').style.display = 'inline-block';
    document.getElementById('tierBadge').innerText = tier;
    document.getElementById('progressDisplay').innerText = `${totalProgress}/${world.totalWords}`;
}

function setUnitSectionVisibility(visible) {
    const unitSection = document.getElementById('unitSection');
    if (visible) {
        unitSection.classList.remove('hidden');
    } else {
        unitSection.classList.add('hidden');
    }
}

function returnTempLetters() {
    if (tempUsedLetters.length > 0) {
        currentLetters.push(...tempUsedLetters);
        tempUsedLetters = [];
        currentPosition = 0;
    }
}

function calculateRiskBonus(baseChance, actualChance, success) {
    if (!success) return 0;
    const riskFactor = 100 - actualChance;
    return Math.min(riskFactor * 10, 1000);
}

function updateWorldDisplay() {
    const world = worlds[currentWorld];
    
    const selector = document.getElementById('unitSelector');
    selector.innerHTML = '';
    world.units.forEach((unit) => {
        if (unit.unlocked) {
            const option = document.createElement('option');
            option.value = unit.id;
            const unitData = MASTER_WORDS[`world${currentWorld}`].units[unit.id];
            const unitName = unitData ? unitData.name : "???";
            option.innerText = `${world.unitName} ${unit.id.toString().padStart(2, '0')} · ${unitName}`;
            if (unit.id === currentUnit) option.selected = true;
            selector.appendChild(option);
        }
    });

    const grid = document.getElementById('unitGrid');
    grid.innerHTML = '';
    world.units.forEach(unit => {
        if (unit.unlocked) {
            const unitData = MASTER_WORDS[`world${currentWorld}`].units[unit.id];
            const unitName = unitData ? unitData.name : "???";
            const card = document.createElement('div');
            card.className = `unit-card ${unit.id === currentUnit ? 'active-unit' : ''} ${unit.wordsCompleted === 20 ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="unit-number">${world.unitName} ${unit.id.toString().padStart(2, '0')}</div>
                <div class="unit-name">${unitName}</div>
                <div class="unit-progress">${unit.wordsCompleted}/20</div>
                <div class="unit-progress-bar">
                    <div class="unit-progress-fill" style="width: ${(unit.wordsCompleted/20)*100}%"></div>
                </div>
            `;
            card.addEventListener('click', () => {
                if (unit.id !== currentUnit) {
                    currentUnit = unit.id;
                    resetForNewUnit();
                    updateWorldDisplay();
                    saveProgress();
                }
            });
            grid.appendChild(card);
        }
    });

    if (activeWordIndex !== null) {
        updateHeaderForGameplay();
    } else {
        updateHeaderForSelection();
    }
}

// ---------- Show current ingot preview for FORGE AGAIN ----------
function showCurrentIngotPreview() {
    const world = worlds[currentWorld];
    const unitData = MASTER_WORDS[`world${currentWorld}`].units[currentUnit];
    if (!unitData) return;
    
    const chance = calculateSuccessChance(currentUnit);
    let chanceColorClass = 'chance-medium';
    if (chance.final >= 80) chanceColorClass = 'chance-high';
    else if (chance.final < 50) chanceColorClass = 'chance-low';
    
    const unitName = unitData.name || "Unknown";
    const graceMessage = chance.grace > 0 
        ? `+${chance.grace}% from ${chance.grace} failed attempt${chance.grace > 1 ? 's' : ''}` 
        : 'No failures yet';
    
    const overlay = document.getElementById('popupOverlay');
    overlay.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'preview-card';
    card.innerHTML = `
        <div class="preview-title">⚒️ FORGE AGAIN?</div>
        <div class="preview-ingot">${world.unitName} ${currentUnit.toString().padStart(2, '0')} · ${unitName}</div>
        <div class="chance-container">
            <div class="chance-label">CURRENT SUCCESS CHANCE</div>
            <div class="chance-value ${chanceColorClass}">${chance.final}%</div>
            <div class="chance-bar">
                <div class="chance-bar-fill" style="width: ${chance.final}%"></div>
            </div>
            <div class="grace-info">
                Base: ${chance.base}% · Grace: +${chance.grace}%
                <div class="grace-badge">${graceMessage}</div>
                ${chance.maxed ? '<div style="color: #ffd966; margin-top: 5px;">⚡ MAXIMUM GRACE REACHED! ⚡</div>' : ''}
            </div>
        </div>
        <div class="preview-buttons">
            <button class="preview-btn" id="confirmResetBtn">⚒️ FORGE AGAIN</button>
            <button class="preview-btn secondary" id="cancelResetBtn">✕ CANCEL</button>
        </div>
    `;
    
    overlay.appendChild(card);
    overlay.classList.remove('hidden');
    
    document.getElementById('confirmResetBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        resetForNewUnit();
        tg?.HapticFeedback?.impactOccurred?.('heavy');
    });
    
    document.getElementById('cancelResetBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
    });
}

// ---------- resetForNewUnit FUNCTION ----------
function resetForNewUnit() {
    currentLetters = generateInitialLetters();
    completedWords = [];
    activeWordIndex = null;
    currentPosition = 0;
    tempUsedLetters = [];
    gameStartTime = Date.now();
    totalTaps = 0;
    correctTaps = 0;
    gameCompleted = false;
    wordCardQueue = [];
    showingWordCard = false;
    renderAll();
    saveProgress();
    setUnitSectionVisibility(true);
    updateHeaderForSelection();
    
    QUICK_RESUME.saveSession();
}

function calculateSFR(timeSeconds, accuracy, totalTapsCount, correctTapsCount) {
    const accuracyScore = Math.round(accuracy * 2);
    const speedScore = timeSeconds > 0 ? Math.round(100000 / timeSeconds) : 2000;
    const perfectionBonus = (accuracy === 100 && totalTapsCount === correctTapsCount) ? 100 : 0;
    return Math.min(accuracyScore + speedScore + perfectionBonus, 1600);
}

function getRatingFromScore(score) {
    if (score >= 1400) return { title: "LEGEND", emoji: "🔥" };
    if (score >= 1200) return { title: "MASTER", emoji: "👑" };
    if (score >= 1000) return { title: "EXPERT", emoji: "⚡" };
    if (score >= 800) return { title: "ADVANCED", emoji: "🛡️" };
    if (score >= 600) return { title: "INTERMEDIATE", emoji: "📘" };
    return { title: "NOVICE", emoji: "🌱" };
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function saveProgress() {
    const saveData = {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        currentWorld: currentWorld,
        currentUnit: currentUnit,
        completedWords: completedWords,
        playerPerformance: playerPerformance,
        worlds: worlds,
        ingotGrace: ingotGrace
    };
    try {
        localStorage.setItem('spellforge_save', JSON.stringify(saveData));
    } catch (e) {}
}

function loadProgress() {
    try {
        const saved = localStorage.getItem('spellforge_save');
        if (saved) {
            const saveData = JSON.parse(saved);
            if (saveData.worlds) {
                Object.keys(saveData.worlds).forEach(key => {
                    if (worlds[key]) {
                        const savedWorld = saveData.worlds[key];
                        worlds[key].unlocked = savedWorld.unlocked;
                        worlds[key].completed = savedWorld.completed;
                        savedWorld.units.forEach(savedUnit => {
                            const unit = worlds[key].units.find(u => u.id === savedUnit.id);
                            if (unit) {
                                unit.wordsCompleted = savedUnit.wordsCompleted;
                                unit.unlocked = savedUnit.unlocked;
                            }
                        });
                    }
                });
            }
            if (saveData.ingotGrace) {
                Object.keys(saveData.ingotGrace).forEach(key => {
                    ingotGrace[key] = saveData.ingotGrace[key];
                });
            }
            if (saveData.currentWorld) currentWorld = saveData.currentWorld;
            if (saveData.currentUnit) currentUnit = saveData.currentUnit;
            if (saveData.completedWords) completedWords = saveData.completedWords;
            if (saveData.playerPerformance) {
                playerPerformance = { ...playerPerformance, ...saveData.playerPerformance };
            }
        }
    } catch (e) {}
}

function startAutoSave() {
    setInterval(saveProgress, 60000);
}

// ---------- DEBUG PROFILE POPUP with Telegram info ----------
function showProfilePopup(returnToLeaderboard = false) {
    const overlay = document.getElementById('popupOverlay');
    const stats = getPlayerStats();
    const worldNames = ['Grand Forge', 'Enchanted Forest', 'Crystal Caverns', 'Sky Citadel', 'Dragon\'s Peak', 'Star Forge'];
    const worldIcons = ['⚒️', '🌳', '💎', '☁️', '🐉', '⭐'];
    
    // DEBUG: Log current profile
    console.log('Current profile when opening popup:', playerProfile);
    console.log('Telegram user data:', tg?.initDataUnsafe?.user);
    
    let statsHtml = '';
    for (let i = 0; i < 6; i++) {
        statsHtml += `
            <div class="profile-stat-row">
                <span class="profile-stat-label">${worldIcons[i]} ${worldNames[i]}</span>
                <span class="profile-stat-value">${stats.worlds[i]}/600</span>
            </div>
        `;
    }
    
    overlay.innerHTML = `
        <div class="profile-card">
            <button class="profile-close" id="profileCloseBtn">✕</button>
            <div class="profile-title">👤 FORGEMASTER PROFILE</div>
            
            <div class="profile-avatar">🪪</div>
            
            <div class="profile-field">
                <div class="profile-label">DISPLAY NAME</div>
                <input type="text" class="profile-input" id="profileNameInput" value="${playerProfile.displayName}" maxlength="20">
                <div class="error-message" id="nameError"></div>
                <div style="color: #acccdd; font-size: 12px; margin-top: 5px;">3-20 characters, letters and spaces only</div>
            </div>
            
            <div class="profile-field">
                <div class="profile-label">TELEGRAM ID</div>
                <div class="profile-id">${playerProfile.telegramId || 'Not available'}</div>
                <!-- DEBUG INFO - REMOVE LATER -->
                <div style="font-size: 10px; color: #888; margin-top: 5px; border-top: 1px solid #333; padding-top: 5px;">
                    Debug: Telegram WebApp ${tg ? '✓ Loaded' : '✗ Missing'}<br>
                    User Data: ${tg?.initDataUnsafe?.user ? '✓ Present' : '✗ None'}<br>
                    User ID: ${tg?.initDataUnsafe?.user?.id || 'N/A'}<br>
                    Profile ID: ${playerProfile.telegramId || 'N/A'}
                </div>
            </div>
            
            <div class="profile-field">
                <div class="profile-label">STATISTICS</div>
                <div class="profile-stats-grid">
                    ${statsHtml}
                    <div class="profile-stat-row">
                        <span class="profile-stat-label">📊 Total Words</span>
                        <span class="profile-stat-value">${stats.totalWords}</span>
                    </div>
                    <div class="profile-stat-row">
                        <span class="profile-stat-label">⚒️ Ingots Mastered</span>
                        <span class="profile-stat-value">${stats.ingotsMastered}</span>
                    </div>
                    <div class="profile-stat-row">
                        <span class="profile-stat-label">📈 Success Rate</span>
                        <span class="profile-stat-value">${stats.successRate}%</span>
                    </div>
                </div>
            </div>
            
            <div class="button-group">
                <button class="action-btn" id="profileSaveBtn">💾 SAVE</button>
                <button class="action-btn cancel" id="profileCancelBtn">✕ CANCEL</button>
            </div>
        </div>
    `;
    
    overlay.classList.remove('hidden');
    
    const nameInput = document.getElementById('profileNameInput');
    const errorDiv = document.getElementById('nameError');
    
    function validateAndSave() {
        const newName = nameInput.value;
        if (validateDisplayName(newName)) {
            playerProfile.displayName = newName.trim();
            saveProfile();
            overlay.classList.add('hidden');
            returnToPreviousScreen(returnToLeaderboard);
        } else {
            errorDiv.innerText = 'Invalid name. Use 3-20 letters and spaces.';
            nameInput.classList.add('error');
        }
    }
    
    document.getElementById('profileCloseBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        returnToPreviousScreen(returnToLeaderboard);
    });
    
    document.getElementById('profileCancelBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        returnToPreviousScreen(returnToLeaderboard);
    });
    
    document.getElementById('profileSaveBtn').addEventListener('click', validateAndSave);
    
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            validateAndSave();
        }
    });
}

function returnToPreviousScreen(returnToLeaderboard) {
    if (returnToLeaderboard) {
        showLeaderboardPopup(true);
    } else {
        renderAll();
    }
}

// ---------- LEADERBOARD POPUP ----------
function showLeaderboardPopup(fromCompletion = false) {
    const overlay = document.getElementById('popupOverlay');
    const playerTotal = calculateTotalWords();
    const playerWordsByWorld = getWordsByWorld();
    const worldIcons = ['⚒️', '🌳', '💎', '☁️', '🐉', '⭐'];
    
    const leaderboardWithPlayer = [...mockLeaderboard];
    const yourEntry = {
        name: playerProfile.displayName,
        words: playerTotal,
        rank: 0
    };
    
    leaderboardWithPlayer.push(yourEntry);
    leaderboardWithPlayer.sort((a, b) => b.words - a.words);
    leaderboardWithPlayer.forEach((entry, index) => {
        entry.rank = index + 1;
    });
    
    const yourRank = leaderboardWithPlayer.find(e => e.name === playerProfile.displayName).rank;
    const playerAhead = leaderboardWithPlayer.find(e => e.rank === yourRank - 1);
    const wordsToCatch = playerAhead ? playerAhead.words - playerTotal : 0;
    
    let leaderboardHtml = '';
    leaderboardWithPlayer.slice(0, 20).forEach(entry => {
        const youClass = entry.name === playerProfile.displayName ? ' you' : '';
        let crownEmoji = '';
        if (entry.rank === 1) crownEmoji = '👑';
        else if (entry.rank === 2) crownEmoji = '⚡';
        else if (entry.rank === 3) crownEmoji = '🥉';
        
        leaderboardHtml += `
            <div class="leaderboard-row${youClass}" data-player="${entry.name}">
                <span class="rank">${entry.rank}.</span>
                <span class="player-name">${entry.name}</span>
                <span class="score">${entry.words}</span>
                <span class="crown">${crownEmoji}</span>
            </div>
        `;
    });
    
    overlay.innerHTML = `
        <div class="leaderboard-card">
            <div class="leaderboard-title">🏆 FORGEMASTER RANKINGS</div>
            
            <div class="world-stats-row">
                ${worldIcons.map((icon, i) => `
                    <div class="world-stat-item">
                        <div class="world-stat-icon">${icon}</div>
                        <div class="world-stat-value">${playerWordsByWorld[i]}</div>
                        <div class="world-stat-label">${i === 0 ? 'Grand' : ''}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="score-highlight">
                <div class="score-title">YOUR TOTAL</div>
                <div class="score-number">${playerTotal}</div>
                <div class="score-rating">of 600 words</div>
            </div>
            
            <div class="leaderboard-title">🏆 TOP FORGEMASTERS</div>
            <div class="leaderboard-list" id="leaderboardList">
                ${leaderboardHtml}
            </div>
            
            <div class="leaderboard-footer">
                You're #${yourRank} of ${leaderboardWithPlayer.length} forgemasters!
                ${wordsToCatch > 0 ? `<br>${wordsToCatch} words to catch #${yourRank-1} ${playerAhead.name}!` : ''}
                ${yourRank === 1 ? '<br>👑 CHAMPION! You are the greatest!' : ''}
            </div>
            
            <div class="button-group">
                <button class="action-btn" id="backBtn">← BACK</button>
            </div>
        </div>
    `;
    
    overlay.classList.remove('hidden');
    
    const yourRow = overlay.querySelector('.leaderboard-row.you');
    if (yourRow) {
        yourRow.style.cursor = 'pointer';
        yourRow.addEventListener('click', () => {
            overlay.classList.add('hidden');
            showProfilePopup(true);
        });
    }
    
    document.getElementById('backBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        if (fromCompletion) {
            const world = worlds[currentWorld];
            const allUnitsCompleted = world.units.every(u => u.wordsCompleted === 20);
            if (allUnitsCompleted) {
                setTimeout(() => showWorldArtifactPopup(), 100);
            } else {
                const nextIngotId = currentUnit + 1;
                const nextUnit = world.units.find(u => u.id === nextIngotId);
                if (nextUnit && nextUnit.unlocked) {
                    setTimeout(() => showNextIngotPreview(), 100);
                } else {
                    renderAll();
                    setUnitSectionVisibility(true);
                    updateHeaderForSelection();
                }
            }
        } else {
            renderAll();
            setUnitSectionVisibility(true);
            updateHeaderForSelection();
        }
    });
}

// ---------- POPUP FUNCTIONS ----------
function showWordCard(wordData) {
    wordCardQueue.push(wordData);
    processWordCardQueue();
}

function processWordCardQueue() {
    if (showingWordCard || wordCardQueue.length === 0) return;
    showingWordCard = true;
    const wordData = wordCardQueue.shift();
    const overlay = document.getElementById('popupOverlay');
    overlay.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'word-card';
    
    const wordLength = wordData.word.length;
    const fontSize = Math.max(32, Math.min(58, 58 - (wordLength * 2)));
    
    card.innerHTML = `
        <div class="word-emoji">${wordData.emoji}</div>
        <div class="word-title" style="font-size: ${fontSize}px;">${wordData.word.toUpperCase()}</div>
        <div class="word-sentence">${wordData.sentence}</div>
        <button class="collect-btn" id="collectWordBtn">✨ COLLECT</button>
    `;
    
    overlay.appendChild(card);
    overlay.classList.remove('hidden');
    
    document.getElementById('collectWordBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        showingWordCard = false;
        processWordCardQueue();
        saveProgress();
    });
    
    tg?.HapticFeedback?.notificationOccurred?.('success');
}

function showFailurePopup() {
    const overlay = document.getElementById('popupOverlay');
    overlay.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'failure-card';
    card.innerHTML = `
        <div class="failure-emoji">💔</div>
        <div class="failure-title">INGOT CRACKED</div>
        <div class="failure-sub">The forge was not kind today</div>
        <div class="failure-buttons">
            <button class="failure-btn" id="viewLeaderboardBtn">🏆 LEADERBOARD</button>
            <button class="failure-btn secondary" id="tryAgainBtn">🔄 TRY AGAIN</button>
        </div>
    `;
    
    overlay.appendChild(card);
    overlay.classList.remove('hidden');
    
    document.getElementById('viewLeaderboardBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        setTimeout(() => showLeaderboardPopup(true), 100);
    });
    
    document.getElementById('tryAgainBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        resetForNewUnit();
        QUICK_RESUME.clearSession();
    });
    
    tg?.HapticFeedback?.notificationOccurred?.('error');
}

function showIngotCompletePopup() {
    const overlay = document.getElementById('popupOverlay');
    const world = worlds[currentWorld];
    const unit = world.units.find(u => u.id === currentUnit);
    const unitData = MASTER_WORDS[`world${currentWorld}`].units[currentUnit];
    
    const timeElapsed = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
    const accuracy = totalTaps === 0 ? 100 : Math.round((correctTaps / totalTaps) * 100);
    const playerSFR = calculateSFR(timeElapsed, accuracy, totalTaps, correctTaps);
    const playerRating = getRatingFromScore(playerSFR);
    
    overlay.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'ingot-card';
    card.innerHTML = `
        <div class="ingot-emoji">⚒️</div>
        <div class="ingot-title">INGOT COMPLETE!</div>
        <div class="ingot-sub">${world.unitName} ${currentUnit.toString().padStart(2, '0')} · ${unitData.name}</div>
        <div class="ingot-stats">
            <div class="ingot-stat">
                <div class="ingot-stat-value">${playerSFR}</div>
                <div class="ingot-stat-label">SFR</div>
            </div>
            <div class="ingot-stat">
                <div class="ingot-stat-value">${playerRating.emoji}</div>
                <div class="ingot-stat-label">${playerRating.title}</div>
            </div>
            <div class="ingot-stat">
                <div class="ingot-stat-value">${formatTime(timeElapsed)}</div>
                <div class="ingot-stat-label">TIME</div>
            </div>
        </div>
        <div class="ingot-buttons">
            <button class="ingot-btn" id="viewLeaderboardBtn">🏆 LEADERBOARD</button>
            <button class="ingot-btn secondary" id="continueBtn">⏩ CONTINUE</button>
        </div>
    `;
    
    overlay.appendChild(card);
    overlay.classList.remove('hidden');
    
    document.getElementById('viewLeaderboardBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        setTimeout(() => showLeaderboardPopup(true), 100);
    });
    
    document.getElementById('continueBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        const allUnitsCompleted = world.units.every(u => u.wordsCompleted === 20);
        if (allUnitsCompleted) {
            setTimeout(() => showWorldArtifactPopup(), 100);
        } else {
            const nextIngotId = currentUnit + 1;
            const nextUnit = world.units.find(u => u.id === nextIngotId);
            if (nextUnit) {
                nextUnit.unlocked = true;
                setTimeout(() => showNextIngotPreview(), 100);
            }
        }
        saveProgress();
        QUICK_RESUME.saveSession();
    });
    
    tg?.HapticFeedback?.notificationOccurred?.('success');
}

function showNextIngotPreview() {
    const nextIngotId = currentUnit + 1;
    const world = worlds[currentWorld];
    if (!world) return;
    
    const nextUnitData = MASTER_WORDS[`world${currentWorld}`].units[nextIngotId];
    if (!nextUnitData) return;
    
    const chance = calculateSuccessChance(nextIngotId);
    let chanceColorClass = 'chance-medium';
    if (chance.final >= 80) chanceColorClass = 'chance-high';
    else if (chance.final < 50) chanceColorClass = 'chance-low';
    
    const unitName = nextUnitData.name || "Unknown";
    const graceMessage = chance.grace > 0 
        ? `+${chance.grace}% from ${chance.grace} failed attempt${chance.grace > 1 ? 's' : ''}` 
        : 'First attempt';
    
    const overlay = document.getElementById('popupOverlay');
    overlay.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'preview-card';
    card.innerHTML = `
        <div class="preview-title">⚒️ NEXT INGOT</div>
        <div class="preview-ingot">${world.unitName} ${nextIngotId.toString().padStart(2, '0')} · ${unitName}</div>
        <div class="chance-container">
            <div class="chance-label">CHANCE OF SUCCESS</div>
            <div class="chance-value ${chanceColorClass}">${chance.final}%</div>
            <div class="chance-bar">
                <div class="chance-bar-fill" style="width: ${chance.final}%"></div>
            </div>
            <div class="grace-info">
                Base: ${chance.base}% · Grace: +${chance.grace}%
                <div class="grace-badge">${graceMessage}</div>
                ${chance.maxed ? '<div style="color: #ffd966; margin-top: 5px;">⚡ MAXIMUM GRACE REACHED! ⚡</div>' : ''}
            </div>
        </div>
        <div class="preview-buttons">
            <button class="preview-btn" id="forgeAheadBtn">⚒️ FORGE AHEAD</button>
            <button class="preview-btn secondary" id="practiceBtn">🔨 PRACTICE</button>
        </div>
    `;
    
    overlay.appendChild(card);
    overlay.classList.remove('hidden');
    
    document.getElementById('forgeAheadBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        currentUnit = nextIngotId;
        resetForNewUnit();
        updateWorldDisplay();
        saveProgress();
    });
    
    document.getElementById('practiceBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        showPracticeMode();
    });
    
    tg?.HapticFeedback?.notificationOccurred?.('success');
}

function showPracticeMode() {
    const world = worlds[currentWorld];
    const overlay = document.getElementById('popupOverlay');
    const completedIngots = world.units.filter(u => u.wordsCompleted === 20 && u.id !== currentUnit);
    
    overlay.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'practice-card';
    card.innerHTML = `
        <div class="practice-title">🔨 PRACTICE MODE</div>
        <div class="practice-list" id="practiceList">
            ${completedIngots.map(unit => {
                const unitData = MASTER_WORDS[`world${currentWorld}`].units[unit.id];
                const unitName = unitData ? unitData.name : "Unknown";
                return `
                    <div class="practice-item" data-id="${unit.id}">
                        <div class="practice-item-left">
                            <span class="practice-icon">⚒️</span>
                            <span class="practice-name">${world.unitName} ${unit.id.toString().padStart(2, '0')} · ${unitName}</span>
                        </div>
                        <span class="practice-chance">${unit.wordsCompleted}/20</span>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="preview-buttons">
            <button class="preview-btn secondary" id="backBtn">← BACK</button>
        </div>
    `;
    
    overlay.appendChild(card);
    overlay.classList.remove('hidden');
    
    document.querySelectorAll('.practice-item').forEach(item => {
        item.addEventListener('click', () => {
            const practiceId = parseInt(item.dataset.id);
            overlay.classList.add('hidden');
            currentUnit = practiceId;
            resetForNewUnit();
            updateWorldDisplay();
            saveProgress();
        });
    });
    
    document.getElementById('backBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        showNextIngotPreview();
    });
}

function showWorldArtifactPopup() {
    const overlay = document.getElementById('popupOverlay');
    const world = worlds[currentWorld];
    
    overlay.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'world-card';
    card.innerHTML = `
        <div class="world-emoji">🏆</div>
        <div class="world-title">WORLD COMPLETE!</div>
        <div class="world-sub">${world.name}</div>
        <div class="ingot-stats">
            <div class="ingot-stat">
                <div class="ingot-stat-value">${world.totalWords}</div>
                <div class="ingot-stat-label">WORDS</div>
            </div>
            <div class="ingot-stat">
                <div class="ingot-stat-value">30</div>
                <div class="ingot-stat-label">INGOTS</div>
            </div>
        </div>
        <div class="artifact-tap">✨ All 30 ingots forged · tap for leaderboard ✨</div>
    `;
    
    overlay.appendChild(card);
    overlay.classList.remove('hidden');
    
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.classList.add('hidden');
        if (currentWorld < 6) {
            worlds[currentWorld + 1].unlocked = true;
            setTimeout(() => showWorldUnlockPopup(currentWorld + 1), 100);
        } else {
            showLeaderboardPopup();
        }
        saveProgress();
    });
    
    tg?.HapticFeedback?.notificationOccurred?.('success');
}

function showWorldUnlockPopup(worldId) {
    const world = worlds[worldId];
    const overlay = document.getElementById('popupOverlay');
    
    const card = document.createElement('div');
    card.className = 'artifact-card';
    card.innerHTML = `
        <div class="artifact-emoji">${world.icon}</div>
        <div class="artifact-title">NEW WORLD</div>
        <div class="artifact-title">UNLOCKED!</div>
        <div class="artifact-sub">${world.name}</div>
        <div class="artifact-tap">✨ tap to continue ✨</div>
    `;
    
    overlay.innerHTML = '';
    overlay.appendChild(card);
    overlay.classList.remove('hidden');
    
    card.addEventListener('click', () => {
        overlay.classList.add('hidden');
    });
}

// ---------- handleWordCompletion FUNCTION ----------
function handleWordCompletion(wordIndex) {
    if (!completedWords.includes(wordIndex)) {
        completedWords.push(wordIndex);
        const unit = worlds[currentWorld].units.find(u => u.id === currentUnit);
        if (unit) unit.wordsCompleted = completedWords.length;
        
        const words = getCurrentUnitWords();
        if (words && words.length > 0 && words[wordIndex]) {
            showWordCard(words[wordIndex]);
        }
        
        QUICK_RESUME.saveSession();
    }

    activeWordIndex = null;
    currentPosition = 0;
    tempUsedLetters = [];
    
    if (activeWordIndex === null) {
        setUnitSectionVisibility(true);
        updateHeaderForSelection();
    }
    
    renderAll();
    updateWorldDisplay();
    
    const unit = worlds[currentWorld].units.find(u => u.id === currentUnit);
    if (unit && unit.wordsCompleted === 20) {
        const accuracy = totalTaps === 0 ? 100 : Math.round((correctTaps / totalTaps) * 100);
        const chance = calculateSuccessChance(currentUnit);
        const roll = Math.random() * 100;
        const success = roll <= chance.final;
        
        tg?.HapticFeedback?.impactOccurred?.('heavy');
        showForgeMessage('Hammer strikes the anvil...', '⚒️', 4000);
        document.body.style.transition = 'background-color 0.5s';
        document.body.style.backgroundColor = success ? '#4ade80' : '#f87171';
        
        setTimeout(() => {
            updateForgeMessage(success ? 'The metal holds...' : 'A crack forms...', success ? '✨' : '💔');
        }, 2000);
        
        setTimeout(() => {
            document.body.style.backgroundColor = '';
            hideForgeMessage();
            
            if (success) {
                playerPerformance.currentStreak++;
                playerPerformance.bestStreak = Math.max(playerPerformance.bestStreak, playerPerformance.currentStreak);
                playerPerformance.lastAccuracy = accuracy;
                playerPerformance.lastAttemptFailed = false;
                playerPerformance.lastPlayedDate = new Date().toISOString();
                playerPerformance.worldProgress[currentWorld].completed++;
                playerPerformance.totalRiskBonus += calculateRiskBonus(chance.base, chance.final, true);
                playerPerformance.ingotHistory.push({
                    id: currentUnit,
                    success: true,
                    accuracy: accuracy,
                    time: gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0,
                    sfr: calculateSFR(gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0, accuracy, totalTaps, correctTaps),
                    date: new Date().toISOString()
                });
                onSuccess(currentUnit);
                showIngotCompletePopup();
                const nextUnit = worlds[currentWorld].units.find(u => u.id === currentUnit + 1);
                if (nextUnit) nextUnit.unlocked = true;
                saveProgress();
            } else {
                onFailure(currentUnit);
                playerPerformance.lastAttemptFailed = true;
                playerPerformance.lastPlayedDate = new Date().toISOString();
                playerPerformance.worldProgress[currentWorld].failed++;
                playerPerformance.ingotHistory.push({
                    id: currentUnit,
                    success: false,
                    accuracy: accuracy,
                    time: gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0,
                    sfr: 0,
                    date: new Date().toISOString()
                });
                showFailurePopup();
            }
        }, 4000);
    }
}

// ---------- OPTIMIZED handleLetterTap FUNCTION with Simple Flash & Reduced Renders ----------
function handleLetterTap(letter, indexInGrid) {
    if (gameCompleted) return;
    totalTaps++;
    
    if (activeWordIndex === null) {
        tg?.HapticFeedback?.notificationOccurred?.('warning');
        return;
    }
    
    if (completedWords.includes(activeWordIndex)) {
        activeWordIndex = null;
        currentPosition = 0;
        renderAll();
        return;
    }

    const words = getCurrentUnitWords();
    if (!words || words.length === 0) return;
    
    const targetWord = words[activeWordIndex].word;
    const neededLetter = targetWord[currentPosition];

    if (letter.toLowerCase() !== neededLetter.toLowerCase()) {
        tg?.HapticFeedback?.notificationOccurred?.('error');
        renderAll();
        return;
    }

    // CORRECT TAP - Simple visual feedback (guaranteed to work in Telegram)
    const tile = document.querySelector(`.letter-tile:nth-child(${indexInGrid + 1})`);
    if (tile) {
        // Store original styles
        const originalBg = tile.style.backgroundColor;
        const originalTransform = tile.style.transform;
        const originalBoxShadow = tile.style.boxShadow;
        
        // Apply flash effect
        tile.style.backgroundColor = '#A5D6A5';
        tile.style.transform = 'translateY(4px)';
        tile.style.boxShadow = '0 4px 0 #2A5A2A, 0 8px 15px rgba(0, 0, 0, 0.5)';
        tile.style.transition = 'all 0.1s ease';
        
        // Reset after short delay
        setTimeout(() => {
            tile.style.backgroundColor = originalBg;
            tile.style.transform = originalTransform;
            tile.style.boxShadow = originalBoxShadow;
            tile.style.transition = '';
        }, 150);
    }
    
    // Haptic feedback
    tg?.HapticFeedback?.impactOccurred?.('light');
    
    // Update game state
    correctTaps++;
    const removed = currentLetters.splice(indexInGrid, 1)[0];
    tempUsedLetters.push(removed);
    currentPosition++;
    
    // OPTIMIZATION: Only update the letter grid, not the whole game
    updateLetterGridOnly();
    
    // Update active word display without full render
    updateActiveWordDisplay(targetWord);
    
    // QUICK RESUME: Save after each correct letter tap (do this async)
    setTimeout(() => {
        QUICK_RESUME.saveSession();
    }, 50);

    if (currentPosition === targetWord.length) {
        handleWordCompletion(activeWordIndex);
    }
}

// ---------- OPTIMIZED: Update only the letter grid ----------
function updateLetterGridOnly() {
    const gridContainer = document.getElementById('letterGridContainer');
    
    // Clear existing tiles
    gridContainer.innerHTML = '';
    
    // Recreate tiles
    if (currentLetters.length > 0) {
        currentLetters.forEach((letter, idx) => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.innerText = letter.toUpperCase();
            tile.addEventListener('click', (e) => {
                e.preventDefault();
                handleLetterTap(letter, idx);
            });
            gridContainer.appendChild(tile);
        });
    }
}

// ---------- OPTIMIZED: Update only the active word display ----------
function updateActiveWordDisplay(targetWord) {
    const progressWord = targetWord.split('').map((l, i) => 
        i < currentPosition ? l.toUpperCase() : '_'
    ).join(' ');
    
    document.getElementById('activeWordDisplay').innerText = progressWord || '—';
    document.getElementById('nextLetterDisplay').innerText = 
        (currentPosition < targetWord.length) ? targetWord[currentPosition].toUpperCase() : '✅';
}

// ---------- OPTIMIZED RENDER UI (full render when needed) ----------
function renderAll() {
    const words = getCurrentUnitWords();
    
    // Update word list
    const wordContainer = document.getElementById('wordListContainer');
    if (wordContainer) {
        wordContainer.innerHTML = '';
        if (words && words.length > 0) {
            words.forEach((w, idx) => {
                const chip = document.createElement('div');
                chip.className = 'word-chip';
                if (completedWords.includes(idx)) chip.classList.add('completed');
                else if (activeWordIndex === idx) chip.classList.add('active-word');
                chip.innerText = w.word;
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (completedWords.includes(idx) || gameCompleted) return;
                    if (activeWordIndex !== null && activeWordIndex !== idx) returnTempLetters();
                    activeWordIndex = idx;
                    currentPosition = 0;
                    
                    // IMPORTANT: When selecting a new word, regenerate letters
                    currentLetters = generateInitialLetters();
                    
                    setUnitSectionVisibility(false);
                    updateHeaderForGameplay();
                    renderAll();
                    tg?.HapticFeedback?.selectionChanged?.();
                });
                wordContainer.appendChild(chip);
            });
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'word-chip';
            placeholder.innerText = "Coming Soon";
            wordContainer.appendChild(placeholder);
        }
    }

    // Update active word display
    if (activeWordIndex !== null && !completedWords.includes(activeWordIndex) && !gameCompleted && words && words.length > 0) {
        const w = words[activeWordIndex].word;
        updateActiveWordDisplay(w);
    } else {
        document.getElementById('activeWordDisplay').innerText = '—';
        document.getElementById('nextLetterDisplay').innerText = '?';
    }

    // Update letter grid
    updateLetterGridOnly();

    // Update artifact
    const artifactEl = document.getElementById('artifactText');
    const unit = worlds[currentWorld].units.find(u => u.id === currentUnit);
    if (unit) {
        artifactEl.innerText = unit.wordsCompleted === 20 ? '🌟 UNIT COMPLETE! 🌟' : `🔒 ${unit.wordsCompleted}/20`;
    }
}

// ---------- RESET HANDLER ----------
function handleReset() {
    if (tg) {
        tg.showConfirm('View success chance before resetting?', (ok) => {
            if (ok) {
                showCurrentIngotPreview();
            }
        });
    } else {
        if (confirm('View success chance before resetting?')) {
            showCurrentIngotPreview();
        }
    }
}

// ---------- INITIALIZATION FUNCTION ----------
function initializeGame() {
    const savedSession = QUICK_RESUME.loadSession();
    
    if (savedSession) {
        if (tg) {
            tg.showConfirm('Resume your last forging session?', (resume) => {
                if (resume) {
                    QUICK_RESUME.restoreSession(savedSession);
                } else {
                    loadProgress();
                    resetForNewUnit();
                    QUICK_RESUME.clearSession();
                }
            });
        } else {
            if (confirm('Resume your last forging session?')) {
                QUICK_RESUME.restoreSession(savedSession);
            } else {
                loadProgress();
                resetForNewUnit();
                QUICK_RESUME.clearSession();
            }
        }
    } else {
        loadProgress();
        resetForNewUnit();
    }
    
    setInterval(() => {
        if (!gameCompleted && activeWordIndex !== null) {
            QUICK_RESUME.saveSession();
        }
    }, 30000);
}

// ---------- EVENT LISTENERS ----------
document.getElementById('resetButton').addEventListener('click', handleReset);
document.getElementById('profileIconBtn').addEventListener('click', () => showProfilePopup(false));

document.getElementById('unitSelector').addEventListener('change', (e) => {
    currentUnit = parseInt(e.target.value);
    resetForNewUnit();
    updateWorldDisplay();
    saveProgress();
});

document.addEventListener('click', (e) => {
    if (activeWordIndex !== null && 
        !e.target.closest('.word-chip') && 
        !e.target.closest('.letter-tile')) {
        returnTempLetters();
        activeWordIndex = null;
        currentPosition = 0;
        setUnitSectionVisibility(true);
        updateHeaderForSelection();
        
        // Regenerate letters when returning to selection mode
        currentLetters = generateInitialLetters();
        renderAll();
    }
});

// ---------- INITIALIZATION ----------
loadProfile();
initializeGame();

if (tg) {
    tg.onEvent('backButtonClicked', () => {
        saveProgress();
        QUICK_RESUME.saveSession();
        setTimeout(() => tg.close(), 100);
    });
    tg.BackButton?.show();
    tg.ready();
}
