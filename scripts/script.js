// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player setup
const spriteSheets = {
  idle: { src: "../assets/character/Fighter/Idle.png", frameWidth: 128, frameHeight: 128, frameCount: 6 },
  left: { src: "../assets/character/Fighter/Attack_3.png", frameWidth: 128, frameHeight: 128, frameCount: 4 },
  right: { src: "../assets/character/Fighter/Attack_1.png", frameWidth: 128, frameHeight: 128, frameCount: 4 },
  down: { src: "../assets/character/Fighter/Attack_2.png", frameWidth: 128, frameHeight: 128, frameCount: 2 },
  up: { src: "../assets/character/Fighter/Jump.png", frameWidth: 128, frameHeight: 128, frameCount: 10 },
  hit: { src: "../assets/character/Fighter/Hurt.png", frameWidth: 128, frameHeight: 128, frameCount: 3 },
  

};

const loadedSpriteSheets = {};
let loadedCount = 0;
const totalSprites = Object.keys(spriteSheets).length;

// Load player sprites
Object.keys(spriteSheets).forEach((action) => {
  const img = new Image();
  img.src = spriteSheets[action].src;
  img.onload = () => {
    loadedCount++;
    loadedSpriteSheets[action] = img;
    if (loadedCount === totalSprites + notes.length) {
      animate();
    }
  };
});

let currentFrame = 0;
let lastFrameChange = Date.now();

const playerX = 200;
const playerY = canvas.height - spriteSheets.idle.frameHeight - 200;
let characterState = "idle";
let lives = 10;
let score = 0;

function drawCharacter() {
  const currentTime = Date.now();

  if (currentTime - lastFrameChange > 110) {
    currentFrame = (currentFrame + 1) % spriteSheets[characterState].frameCount;
    lastFrameChange = currentTime;
  }

  const spriteSheet = loadedSpriteSheets[characterState];
  const { frameWidth, frameHeight } = spriteSheets[characterState];

  ctx.drawImage(
    spriteSheet,
    currentFrame * frameWidth,
    0,
    frameWidth,
    frameHeight,
    playerX,
    playerY,
    frameWidth,
    frameHeight
  );
}

function changeCharacterState(newState) {
  characterState = newState;
  currentFrame = 0;
  setTimeout(() => {
    characterState = "idle";
  }, spriteSheets[newState].frameCount * 110);
}


document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && characterState === "idle") {
    changeCharacterState("up");
  } else if (e.key === "ArrowLeft" && characterState === "idle") {
    changeCharacterState("left");
  } else if (e.key === "ArrowRight" && characterState === "idle") {
    changeCharacterState("right");
  } else if (e.key === "ArrowDown" && characterState === "idle") {
    changeCharacterState("down");
  } 
});

// Notes setup
const notes = [
  { type: "down", src: "../assets/Icons/Icon_15.png", speed: 3 },
  { type: "left", src: "../assets/Icons/Icon_14.png", speed: 4 },
  { type: "right", src: "../assets/Icons/Icon_12.png", speed: 5 },
  { type: "up", src: "../assets/Icons/Icon_13.png", speed: 3 },

];

const loadedNotes = [];
notes.forEach((note, index) => {
  const img = new Image();
  img.src = note.src;
  img.onload = () => {
    loadedCount++;
    loadedNotes[index] = img;
    if (loadedCount === totalSprites + notes.length) {
      animate();
    }
  };
});

let activeNotes = [];
const collisionLineX = playerX - 50; 
const noteLineX = playerX + 100; 


function spawnNote() {
  const randomIndex = Math.floor(Math.random() * notes.length);
  activeNotes.push({
    x: canvas.width,
    y: Math.random() * 150 + 550,
    speed: notes[randomIndex].speed,
    sprite: loadedNotes[randomIndex],
    type: notes[randomIndex].type,
    active: false,
  });
}

function drawNotes() {
  activeNotes.forEach((note, index) => {
    const noteWidth = 16;
    const noteHeight = 16;
    ctx.drawImage(note.sprite, note.x, note.y, noteWidth, noteHeight);

    note.x -= note.speed;

    if (note.x < noteLineX && !note.active) {
      note.active = true;
    }

    if (note.x < collisionLineX) {
      if (note.active) {
        changeCharacterState("hit");
        lives--;

        // Trigger screen shake and red overlay
        triggerScreenShake(20);
        triggerRedOverlay();

        if (lives <= 0) {
          alert("Game Over! Try again.");
          location.reload();
        }
      }
      activeNotes.splice(index, 1);
    }
  });
}

const backgroundMusic = new Audio("../assets/sounds/background-music.mp3");
backgroundMusic.loop = true; 
backgroundMusic.volume = 0.3; 

function playBackgroundMusic() {
  backgroundMusic.play();
}


function pauseBackgroundMusic() {
  backgroundMusic.pause();
}

const noteHitSound = new Audio("../assets/sounds/note-hit.mp3");


function playNoteHitSound() {
  noteHitSound.currentTime = 0; 
  noteHitSound.play(); 
}

document.addEventListener("keydown", (e) => {
  activeNotes.forEach((note, index) => {
    if (note.active) {
      if (e.key === `Arrow${note.type.charAt(0).toUpperCase() + note.type.slice(1)}`) {
        const scoreIncrement = Math.round(10 / note.speed);
        score += scoreIncrement;
        playNoteHitSound();

        addFeedbackText(note.x, note.y, `+${scoreIncrement}`, "green");

        note.active = false;
        activeNotes.splice(index, 1);
      }
    }
  });
});


let feedbackTexts = [];
let shakeIntensity = 0;
let redOverlayOpacity = 0;


function addFeedbackText(x, y, text, color) {
  feedbackTexts.push({
    x,
    y,
    text,
    color,
    opacity: 1, 
    lifespan: 1000, 
  });
}


function triggerScreenShake(intensity) {
  shakeIntensity = intensity;
}


function triggerRedOverlay() {
  redOverlayOpacity = Math.min(0.5, 0.1 * (5 - lives)); 
}

// Update feedback texts
function updateFeedbackTexts(deltaTime) {
  feedbackTexts = feedbackTexts.filter((text) => {
    text.opacity -= deltaTime / text.lifespan;
    return text.opacity > 0;
  });
}

// Draw feedback texts
function drawFeedbackTexts() {
  feedbackTexts.forEach((text) => {
    ctx.globalAlpha = text.opacity;
    ctx.fillStyle = text.color;
    ctx.font = "20px ownFont";
    ctx.fillText(text.text, text.x, text.y);
  });
  ctx.globalAlpha = 1; 
}


function drawRedOverlay() {
  if (redOverlayOpacity > 0) {
    ctx.fillStyle = `rgba(255, 0, 0, ${redOverlayOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}



function applyScreenShake() {
  if (shakeIntensity > 0) {
    const offsetX = (Math.random() - 0.5) * shakeIntensity;
    const offsetY = (Math.random() - 0.5) * shakeIntensity;
    ctx.save(); 
    ctx.translate(offsetX, offsetY);
    shakeIntensity *= 0.9; 
    if (shakeIntensity < 0.5) shakeIntensity = 0; 
  } else {
    ctx.restore(); 
  }
}


function drawCollisionLine() {
  ctx.beginPath();
  ctx.moveTo(collisionLineX, 0);
  ctx.lineTo(collisionLineX, canvas.height);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawNoteLine() {
  ctx.beginPath();
  ctx.moveTo(noteLineX, 0);
  ctx.lineTo(noteLineX, canvas.height);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
}

setInterval(spawnNote, 1000);


const menuOverlay = new Image();
menuOverlay.src = "../assets/gui/menus/Menu.png"; 

const menuText = {
  text: "Welcome to the Game!",
  x: canvas.width / 2,
  y: 200,
  font: "48px ownFont",
  color: "white",
  align: "center",
};

const menuButtons = {
  start: { x: canvas.width / 2 - 75, y: 350, width: 150, height: 50, text: "Start", font: "24px ownFont", color: "black", bgColor: "white" },
  options: { x: canvas.width / 2 - 75, y: 450, width: 150, height: 50, text: "Options", font: "24px ownFont", color: "black", bgColor: "white" },
  quit: { x: canvas.width / 2 - 75, y: 789, width: 150, height: 50, text: "Quit", font: "24px ownFont", color: "black", bgColor: "white" },

};

let inMenu = true;


function drawStartMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(menuOverlay, canvas.width / 2 - 234, 250, 472, 596);


  ctx.font = menuText.font;
  ctx.fillStyle = menuText.color;
  ctx.textAlign = menuText.align;
  ctx.fillText(menuText.text, menuText.x, menuText.y);

  Object.keys(menuButtons).forEach((key) => {
    const button = menuButtons[key];

    ctx.fillStyle = button.bgColor;
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.font = button.font;
    ctx.fillStyle = button.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
  });
}

canvas.addEventListener("click", (e) => {
  if (!inMenu) return;

  const clickX = e.clientX;
  const clickY = e.clientY;

  Object.keys(menuButtons).forEach((key) => {
    const button = menuButtons[key];
    if (
      clickX >= button.x &&
      clickX <= button.x + button.width &&
      clickY >= button.y &&
      clickY <= button.y + button.height
    ) {
      if (key === "start") {
        inMenu = false; 
        startGame(); 
      }else if (key === "quit") {
         location.replace("https://highseas.hackclub.com/");
      }else if (key === "options") {
        inMenu = false; 
        inOptionsMenu = true; 
        drawOptionsMenu();
      }
      
    }
  });
});

function startGame() {
  console.log("Game Started!");
  playBackgroundMusic(); 
  animate(); 
}



menuOverlay.onload = () => {
  drawStartMenu();
};

// Options menu buttons
const optionsMenuButtons = {
  toggleMusic: {
    x: canvas.width / 2 - 75,
    y: 350,
    width: 150,
    height: 50,
    text: "Toggle Music",
    font: "24px ownFont",
    color: "black",
    bgColor: "white",
  },
  volumeUp: {
    x: canvas.width / 2 - 75,
    y: 450,
    width: 150,
    height: 50,
    text: "Volume +",
    font: "24px ownFont",
    color: "black",
    bgColor: "white",
  },
  volumeDown: {
    x: canvas.width / 2 - 75,
    y: 550,
    width: 150,
    height: 50,
    text: "Volume -",
    font: "24px ownFont",
    color: "black",
    bgColor: "white",
  },
  back: {
    x: canvas.width / 2 - 75,
    y: 650,
    width: 150,
    height: 50,
    text: "Back",
    font: "24px ownFont",
    color: "black",
    bgColor: "white",
  },
};

let inOptionsMenu = false; 




function drawOptionsMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw "Options" title
  ctx.font = "48px ownFont";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Options", canvas.width / 2, 200);

  // Draw buttons
  Object.keys(optionsMenuButtons).forEach((key) => {
    const button = optionsMenuButtons[key];

    ctx.fillStyle = button.bgColor;
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.font = button.font;
    ctx.fillStyle = button.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
  });
}


canvas.addEventListener("click", (e) => {
  if (!inOptionsMenu) return;

  const clickX = e.clientX;
  const clickY = e.clientY;

  Object.keys(optionsMenuButtons).forEach((key) => {
    const button = optionsMenuButtons[key];
    if (
      clickX >= button.x &&
      clickX <= button.x + button.width &&
      clickY >= button.y &&
      clickY <= button.y + button.height
    ) {
      if (key === "toggleMusic") {
        if (backgroundMusic.paused) {
          backgroundMusic.play(); // Resume music
        } else {
          backgroundMusic.pause(); // Pause music
        }
      } else if (key === "volumeUp") {
        backgroundMusic.volume = Math.min(backgroundMusic.volume + 0.1, 1); 
      } else if (key === "volumeDown") {
        backgroundMusic.volume = Math.max(backgroundMusic.volume - 0.1, 0); 
      } else if (key === "back") {
        inMenu = true;
        inOptionsMenu = false; 
        drawStartMenu(); 
      }
    }
  });
});


let paused = false; 

// Pause menu buttons
const pauseMenuButtons = {
  resume: { x: canvas.width / 2 - 75, y: 350, width: 150, height: 50, text: "Resume", font: "24px ownFont", color: "black", bgColor: "white" },
  quit: { x: canvas.width / 2 - 75, y: 450, width: 150, height: 50, text: "Quit", font: "24px ownFont", color: "black", bgColor: "white" },
};


function drawPauseMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  
  ctx.font = "48px ownFont";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Paused", canvas.width / 2, 200);

 
  Object.keys(pauseMenuButtons).forEach((key) => {
    const button = pauseMenuButtons[key];

    ctx.fillStyle = button.bgColor;
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.font = button.font;
    ctx.fillStyle = button.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
  });
}



document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    paused = !paused;
    if (paused) {
      pauseBackgroundMusic(); // Pause music
      drawPauseMenu();
    } else {
      playBackgroundMusic(); // Resume music
      animate();
    }
  }
});


canvas.addEventListener("click", (e) => {
  if (!paused) return;

  const clickX = e.clientX;
  const clickY = e.clientY;

  Object.keys(pauseMenuButtons).forEach((key) => {
    const button = pauseMenuButtons[key];
    if (
      clickX >= button.x &&
      clickX <= button.x + button.width &&
      clickY >= button.y &&
      clickY <= button.y + button.height
    ) {
      if (key === "resume") {
        paused = false;
        playBackgroundMusic(); // Resume background music
        animate();
      } else if (key === "quit") {
        backgroundMusic.pause(); // Stop music when quitting
        location.replace("https://highseas.hackclub.com/");
      }
    }
  });
});


function animate() {
  if (inMenu) {
    drawStartMenu();
  } else if (inOptionsMenu) {
    drawOptionsMenu();
  } else if (paused) {
    drawPauseMenu();
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save(); 
    applyScreenShake();

    drawCharacter();
    drawNotes();
    drawCollisionLine();
    drawNoteLine();
    drawFeedbackTexts(); 

    ctx.restore(); 

    drawRedOverlay(); 

    
    ctx.font = "20px ownFont";
    ctx.fillStyle = "white";
    ctx.fillText(`Lives: ${lives}`, 250, 60);
    ctx.fillText(`Score: ${score}`, 250, 120);

    updateFeedbackTexts(16); // Update feedback texts (assuming ~60 FPS)

    requestAnimationFrame(animate);
  }
}
