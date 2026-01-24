// -----------------------------------------------------------------------------
// MintCrate - Core
// Framework core
// -----------------------------------------------------------------------------

'use strict';

import { Room } from "./room.js";

import { SYSTEM_MEDIA_B64 } from "./img/b64.js";

export class MintCrate {
  
  //----------------------------------------------------------------------------
  // Private variables
  //----------------------------------------------------------------------------
  
  #frontCanvas;
  #frontContext;
  #backCanvas;
  #backContext;
  
  #RES_PATHS;
  
  #BASE_WIDTH;
  #BASE_HEIGHT;
  
  #SCREEN_SCALE;
  
  #colorKeys;
  #colorKeyCanvas;
  #colorKeyContext;
  
  #systemImages;
  
  #queuedFunctions;
  
  #inputHandlers;
  #keyStates;
  #keyboard;
  
  #mouseStates;
  #mousePositions;
  #mouseButtons;
  
  #camera;
  #cameraBounds;
  #cameraIsBound;
  
  #tilemapIsLoaded;
  #tilemapFullName;
  #tilemapName;
  #layoutName;
  
  #quickBoot;
  #showFps;
  #showRoomInfo;
  #showActiveCollisionMasks;
  #showActiveInfo;
  #showActiveOriginPoints;
  #showActiveActionPoints;
  
  #currentFps;    // Current FPS value
  #fpsTimeLast;   // Time snapshot logger for throttling FPS
  #frameInterval; //
  #fpsFrameLast;  // Time snapshot logger for calculating FPS
  #frameCounter;  // Counts frames to calculate FPS
  
  #ROOM_LIST;
  #STARTING_ROOM;
  #currentRoom;
  #roomHasChanged;
  #isChangingRooms;
  
  #masterBgmVolume;
  #masterSfxVolume;
  #masterBgmPitch;
  
  #COLLIDER_SHAPES;
  #loadingQueue;
  #data;
  #instances;
  #drawOrders;
  
  //----------------------------------------------------------------------------
  // Constructor
  //----------------------------------------------------------------------------
  
  constructor(
    divTargetId,
    baseWidth,
    baseHeight,
    roomList,
    screenScale = 1
  ) {
    // Initialize render canvases/contexts
    this.#frontCanvas = document.createElement('canvas');
    this.#frontCanvas.addEventListener('contextmenu',
      event => event.preventDefault());
    this.#frontCanvas.width = baseWidth;
    this.#frontCanvas.height = baseHeight;
    
    this.#frontContext = this.#frontCanvas.getContext('2d');
    this.#frontContext.imageSmoothingEnabled = false;
    
    this.#backCanvas = new OffscreenCanvas(baseWidth, baseHeight);
    
    this.#backContext = this.#backCanvas.getContext('2d');
    this.#backContext.imageSmoothingEnabled = false;
    
    document.querySelector(`#${divTargetId}`).append(this.#frontCanvas);
    
    // Paths for loading media resources
    this.#RES_PATHS = {
      actives   : "res/actives",
      backdrops : "res/backdrops",
      fonts     : "res/fonts",
      music     : "res/music",
      sounds    : "res/sounds",
      tilemaps  : "res/tilemaps"
    };
    
    // Game's base pixel resolution
    this.#BASE_WIDTH = baseWidth;
    this.#BASE_HEIGHT = baseHeight;
    
    // Graphics scaling values
    this.#SCREEN_SCALE = screenScale;
    
    // RGB value sets and rendering context for color keying sprites
    this.#colorKeys = [];
    this.#colorKeyCanvas = document.createElement('canvas');
    this.#colorKeyContext = this.#colorKeyCanvas.getContext('2d');
    
    // System graphics for debugging purposes
    this.#systemImages = {};
    
    // Functions that get called after a delay
    this.#queuedFunctions = [];
    
    // Stores input handlers for managing player input
    this.#inputHandlers = [];
    
    // Used for keeping track of keyboard data
    this.#keyStates     = {};
    
    // document.addEventListener('keydown', (e) => Inu.#keyboardHandler(e), false);
    // document.addEventListener('keyup',   (e) => Inu.#keyboardHandler(e), false);
    
    // Used for keeping track of mouse data
    this.#mouseStates = {};
    this.#mousePositions = {
      localX  : 0, localY  : 0,
      globalX : 0, globalY : 0
    };
    this.#mouseButtons = [
      {pressed : false, held : false, released : false},
      {pressed : false, held : false, released : false},
      {pressed : false, held : false, released : false}
    ];
    
    // canvas.addEventListener('mousedown', (e) => Inu.#mouseButtonHandler(e), false);
    // canvas.addEventListener('mouseup',   (e) => Inu.#mouseButtonHandler(e), false);
    // canvas.addEventListener('mousemove', (e) => Inu.#mouseMoveHandler(e), false);
    
    // Camera
    this.#camera        = {x : 0, y : 0};
    this.#cameraBounds  = {x1 : 0, x2 : 0, y1 : 0, y2 : 0};
    this.#cameraIsBound = false;
    
    // Tilemap
    this.#tilemapIsLoaded = false;
    this.#tilemapFullName = "";
    this.#tilemapName     = "";
    this.#layoutName      = "";
    
    // Debug functionality
    this.#quickBoot                = false;
    this.#showFps                  = false;
    this.#showRoomInfo             = false;
    this.#showActiveCollisionMasks = false;
    this.#showActiveInfo           = false;
    this.#showActiveOriginPoints   = false;
    this.#showActiveActionPoints   = false;
    
    // FPS limiter
    this.#currentFps    = 0;
    this.#frameCounter  = 0;
    this.#fpsTimeLast   = 0;
    this.#frameInterval = 1000 / 60;
    this.#fpsFrameLast  = 0;
    
    // Room/gamestate management
    this.#ROOM_LIST = {};
    for (const room of roomList) {
      this.#ROOM_LIST[room.name] = room;
    }
    this.#STARTING_ROOM   = roomList[0];
    this.#isChangingRooms = false;
    this.#roomHasChanged = false;
    
    // Music/SFX global volume levels
    this.#masterBgmVolume = 1;
    this.#masterSfxVolume = 1;
    this.#masterBgmPitch  = 1;
    
    // Game data
    this.#COLLIDER_SHAPES = {NONE: 0, RECTANGLE: 1, CIRCLE: 2};
    
    this.#loadingQueue = {};
    
    this.#data = {
      actives   : {},
      backdrops : {},
      fonts     : {},
      tilemaps  : {},
      sounds    : {},
      music     : {}
    };
    
    this.#instances = {
      actives    : [],
      backdrops  : [],
      paragraphs : [],
      tiles      : []
    };
    
    this.#drawOrders = {
      backdrops : [],
      main      : []
    };
    
    // Prepare canvas.
    this.#clearCanvas();
    this.#renderFrame();
  }
  
  //----------------------------------------------------------------------------
  // System initialization methods
  //----------------------------------------------------------------------------
  
  // Signifies that all loading has been completed and that the game should run.
  ready() {
    let promises = [];
    
    // Load system images
    // for (const basename of ['point_origin', 'point_action']) {
    for (const mediaName in SYSTEM_MEDIA_B64.graphics) {
      promises.push(this.#loadImage(SYSTEM_MEDIA_B64.graphics[mediaName])
        .then((img) => {
          this.#systemImages[mediaName] = this.#colorKeyImage(img, true);
        })
      );
    }
    
    // Load system fonts
    for (const mediaName in SYSTEM_MEDIA_B64.fonts) {
      promises.push(this.#loadImage(SYSTEM_MEDIA_B64.fonts[mediaName])
        .then((img) => {
          this.#data.fonts[mediaName] = this.#formatFont(img, true);
        })
      );
    }
    
    // Present "ready to play" screen for user to trigger loading process
    Promise.allSettled(promises).then((results) => {
      if (this.#initFailed(results)) {
        return;
      }
      
      if (this.#quickBoot) {
        // this.#loadActives();
        this.#loadBackdrops();
      } else {
        let over = () => { this.#displayReadyScreen(1); };
        let out  = () => { this.#displayReadyScreen(0); };
        
        let click = () => {
          this.#frontCanvas.style.cursor = '';
          
          this.#frontCanvas.removeEventListener('mouseover', over);
          this.#frontCanvas.removeEventListener('mouseout', out);
          this.#frontCanvas.removeEventListener('click', click);
          
          this.#clearCanvas();
          this.#renderFrame();
          
          // setTimeout(() => this.#loadActives(), 250);
          setTimeout(() => this.#loadBackdrops(), 250);
        }
        
        this.#frontCanvas.addEventListener('mouseover', over);
        this.#frontCanvas.addEventListener('mouseout', out);
        this.#frontCanvas.addEventListener('click', click);
        
        this.#displayReadyScreen(0);
        this.#frontCanvas.style.cursor = 'pointer';
      }
    });
  }
  
  #displayReadyScreen(state) {
    // state = 0: Mouse not hovering
    // state = 1: Mouse hovering
    
    let graphic = this.#systemImages['start'];
    
    this.#clearCanvas();
    
    this.#backContext.drawImage(
      this.#systemImages['start'],                    // image
      (graphic.width / 2) * state,                    // sx
      0,                                              // sy
      graphic.width / 2,                              // sWidth
      graphic.height,                                 // sHeight
      (this.#BASE_WIDTH  / 2) - (graphic.width  / 2), // dx
      (this.#BASE_HEIGHT / 2) - (graphic.height / 2), // dy
      graphic.width / 2,                              // dWidth,
      graphic.height                                  // dHeight
    );
    
    this.#renderFrame();
  }
  
  #displayLoadingScreen(statusMessage) {
    let font = this.#data.fonts['system_boot'];
    let msgWidth = font.charWidth * statusMessage.length;
    
    this.#clearCanvas();
    
    this.#backContext.fillStyle = 'gray';
    this.#backContext.fillRect(0, 0, this.#BASE_WIDTH, this.#BASE_HEIGHT);
    
    this.#drawText(
      [statusMessage],
      font,
      (this.#BASE_WIDTH  / 2) - (msgWidth        / 2),
      (this.#BASE_HEIGHT / 2) - (font.charHeight / 2)
    );
    
    this.#renderFrame();
  }
  
  //----------------------------------------------------------------------------
  // Methods for loading game resources
  //----------------------------------------------------------------------------
  
  // Works with B64 image strings, too.
  #loadImage(url) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.addEventListener('load', () => { resolve(img); });
      img.addEventListener('error', (err) => { reject(err); });
      img.src = url;
    });
  }
  
  #formatFont(img, isSystemResource = false) {
    return {
      img: this.#colorKeyImage(img, isSystemResource),
      charWidth: img.width / 32,
      charHeight: img.height / 3
    };
  }
  
  defineColorKeys(rgbSets) {
    // TODO: This
  }
  
  #colorKeyImage(img, isSystemResource = false) {
    this.#colorKeyCanvas.width = img.width;
    this.#colorKeyCanvas.height = img.height;
    this.#colorKeyContext.clearRect(0, 0, img.width, img.height);
    
    this.#colorKeyContext.drawImage(img, 0, 0);
    
    let imgData = this.#colorKeyContext.getImageData(
      0,
      0,
      img.width,
      img.height
    );
    
    let colorKeys = this.#colorKeys;
    if (isSystemResource) {
      colorKeys = [
        {r:  82, g: 173, b: 154},
        {r: 140, g: 222, b: 205}
      ];
    }
    
    for (const color of colorKeys) {
      for (let i = 0; i < imgData.data.length; i += 4) {
        
        if (
          imgData.data[i]   === color.r &&
          imgData.data[i+1] === color.g &&
          imgData.data[i+2] === color.b
        ) {
          imgData.data[i]   = 0;
          imgData.data[i+1] = 0;
          imgData.data[i+2] = 0;
          imgData.data[i+3] = 0;
        }
      }
    }
    
    this.#colorKeyContext.putImageData(imgData, 0, 0);
    
    img.src = this.#colorKeyCanvas.toDataURL();
    
    return img;
  }
  
  defineBackdrops(data) {
    this.#loadingQueue.backdrops = data;
  }
  
  #loadBackdrops() {
    console.log('Loading Backdrops');
    this.#displayLoadingScreen('Loading Backdrops');
    
    let promises = [];
    for (const item of this.#loadingQueue.backdrops ?? []) {
      // Load and store backdrop image
      promises.push(this.#loadImage(`${this.#RES_PATHS.backdrops}/${item.name}.png`)
        .then((img) =>
          this.#data.backdrops[item.name] = {
            img: this.#colorKeyImage(img),
            repeat: item.repeat ?? false
          }));
    }
    
    // Proceed when loading is done
    Promise.allSettled(promises).then((results) => {
      if (this.#initFailed(results))
        return;
      
      // this.#loadFonts();
      this.#initDone();
    });
  }
  
  #initFailed(results) {
    if (results.filter((res) => res.status === 'rejected').length === 0)
      return false;
    else {
      console.log('Failed to initialize MintCrateJS.');
      console.log(results);
      return true;
    }
  }
  
  #initDone() {
    console.log(this.#data);
    console.log('Loading Complete!');
    this.#displayLoadingScreen('Loading Complete!');
    this.#loadingQueue = null;
    this.changeRoom(this.#STARTING_ROOM);
    
    if (this.#quickBoot) {
      window.requestAnimationFrame(this.#gameLoop.bind(this));
    } else {
      // Wipe the screen after a moment
      setTimeout(() => {
        this.#clearCanvas();
        this.#renderFrame();
      }, 1000);
      
      // Pause for a further moment before starting the game
      setTimeout(
        () => window.requestAnimationFrame(this.#gameLoop.bind(this)),
        1500
      );
    }
  }
  
  // ---------------------------------------------------------------------------
  // Room management
  // ---------------------------------------------------------------------------
  
  changeRoom(room, options = {}) {
    options.fadeMusic    = options.fadeMusic    ?? false;
    options.persistAudio = options.persistAudio ?? false;
    console.log('a', this.#isChangingRooms);
    // Only change room if we're not currently transitioning to another one.
    if (!this.#isChangingRooms) {
      // Indicate we're now changing rooms.
      this.#isChangingRooms = true;
      console.log('b', this.#isChangingRooms);
      
      // Handle fade-out before changing room (if configured).
      if (this.#currentRoom && this.#currentRoom.getRoomFadeInfo().fadeOutConfig.enabled) {
        // Trigger the fade-out effect, then change room when it's done.
        this.#triggerRoomFade('fadeOut', () => {
            this.#performRoomChange(room, options.persistAudio)
          },
          options.fadeMusic
        )
      // Otherwise, simply change room.
      } else {
        this.#performRoomChange(room, options.persistAudio)
      }
      console.log('c', this.#isChangingRooms);
    }
  }
  
  #performRoomChange(room, persistAudio) {
    // Wipe current entity instances
    for (const key in this.#instances) {
      this.#instances[key] = [];
    }
    
    // Wipe draw-order tables
    for (const key in this.#drawOrders) {
      this.#drawOrders[key] = [];
    }
    
    // Stop all audio
    if (!persistAudio) {
      this.stopAllSounds();
      this.stopMusic();
    }
    
    // Reset camera
    this.#camera        = {x: 0, y: 0};
    this.#cameraBounds  = {x1: 0, x2: 0, y1: 0, y2: 0};
    this.#cameraIsBound = false;
    
    // Remove tilemap from scene
    this.#tilemapFullName = "";
    this.#tilemapName     = "";
    this.#layoutName      = "";
    
    // Mark delayed/repeated functions to be cleared out
    for (let i = 0; i < this.#queuedFunctions.length; i++) {
      this.#queuedFunctions[i].cancelled = true;
    }
    
    // Indicate we're done changing rooms
    this.#isChangingRooms = false;
    
    // Create new room
    let newRoom = new room(this, this.#ROOM_LIST);
    
    // Store reference to new room, but only if it's the last in a queue.
    // This can happen if a room calls changeRoom() from its constructor.
    // It's to avoid issues when the functions bubble up from being nested.
    if (!this.#roomHasChanged) {
      this.#currentRoom = newRoom;
      this.#roomHasChanged = true;
      
      // Trigger fade in for fresh room (if configured)
      if (this.#currentRoom.getRoomFadeInfo().fadeInConfig.enabled) {
        this.#triggerRoomFade('fadeIn');
      }
    }
  }
  
  #triggerRoomFade(fadeType, finishedCallback, fadeMusic) {
    return;
    // TODO: All this
    /*
    let fade = this.#currentRoom.getRoomFadeInfo();
    
    // Cancel any current fades
    if (this.#fadeEffectFunc) {
      this.clearFunction(this.#fadeEffectFunc)
    }
    
    if (this.#fadeDoneFunc) {
      this.clearFunction(this.#fadeDoneFunc)
    }
    
    // Set the room's current fade type (used for rendering the fade overlay)
    this._currentRoom._currentFade = fadeType
    
    // Get the configuration for this fade
    local fadeConf = self._currentRoom._fadeConf[fadeType]
    
    // Set up function to handle fade-in/out
    local fadeEffectFunc = function()
      self._currentRoom._fadeLevel =
        self._currentRoom._fadeLevel + fadeConf.fadeValue
    end
    
    // Run it every frame, and store it in case we need to cancel it early
    self:repeatFunction(fadeEffectFunc, 1)
    self._currentRoom._fadeEffectFunc = fadeEffectFunc
    
    // Set up delayed function to clear fade-effect function when fade is done
    local fadeDoneFunc = function()
      -- Clear fade-effect function
      self:clearFunction(fadeEffectFunc)
      
      -- Ensure fade overlay is either completely hidden or completely shown
      if (fadeType == "fadeIn") then
        self._currentRoom._fadeLevel = 100
      else
        self._currentRoom._fadeLevel = 0
      end
    end
    
    // Run it when fade's done, and store it in case we need to cancel it early
    self:delayFunction(fadeDoneFunc, fadeConf.fadeFrames + fadeConf.pauseFrames)
    self._currentRoom._fadeDoneFunc = fadeDoneFunc
    
    // Calculate how long until we need to wait until we execute the callback
    // This value changes if we're in the midst of a fade-in
    local totalDuration = fadeConf.fadeFrames
    totalDuration       = totalDuration * (self._currentRoom._fadeLevel / 100)
    totalDuration       = math.max(totalDuration, 0)
    
    // Fade music (if specified)
    if (fadeMusic) then
      self:stopMusic(totalDuration)
    end
    
    // Set delayed function to execute when fade is finished
    // This is currently only for fade-outs
    if (finishedCallback) then
      -- Include the pause frames so we don't run the function early
      totalDuration = totalDuration + fadeConf.pauseFrames
      
      -- Execute callback
      self:delayFunction(finishedCallback, totalDuration)
    end
    */
  }
  
  // ---------------------------------------------------------------------------
  // Queued functions
  // ---------------------------------------------------------------------------
  
  // TODO: This
  
  // ---------------------------------------------------------------------------
  // Creating game objects
  // ---------------------------------------------------------------------------
  
  // TODO: This
  
  // ---------------------------------------------------------------------------
  // Camera management
  // ---------------------------------------------------------------------------
  
  // TODO: This
  
  // ---------------------------------------------------------------------------
  // Managing tilemaps
  // ---------------------------------------------------------------------------
  
  // TODO: This
  
  // ---------------------------------------------------------------------------
  // Collision testing
  // ---------------------------------------------------------------------------
  
  // TODO: This
  
  // ---------------------------------------------------------------------------
  // Mouse input
  // ---------------------------------------------------------------------------
  
  // TODO: This
  
  //----------------------------------------------------------------------------
  // Keyboard input
  //----------------------------------------------------------------------------
  
  // TODO: This
  
  // ---------------------------------------------------------------------------
  // Audio
  // ---------------------------------------------------------------------------
  
  stopAllSounds() {
    
  }
  
  stopMusic() {
    
  }
  
  // ---------------------------------------------------------------------------
  // Debugging
  // ---------------------------------------------------------------------------
  
  setQuickBoot(enabled) {
    this.#quickBoot = enabled;
  }
  
  setFpsVisibility(enabled) {
    this.#showFps = enabled;
  }
  
  setRoomInfoVisibility(enabled) {
    this.#showRoomInfo = enabled;
  }
  
  // ---------------------------------------------------------------------------
  // Runtime
  // ---------------------------------------------------------------------------
  
  #gameLoop(fpsTimeNow) {
    requestAnimationFrame(this.#gameLoop.bind(this));
    
    this.#update(fpsTimeNow);
    this.#draw();
  }
  
  #update(fpsTimeNow) {
    // Throttle FPS
    const delta = fpsTimeNow - this.#fpsTimeLast;
    
    if (delta <= this.#frameInterval)
      return;
    
    this.#fpsTimeLast = fpsTimeNow - (delta % this.#frameInterval);
    
    // Calculate FPS
    this.#frameCounter++;
    if (fpsTimeNow >= (this.#fpsFrameLast + 1000)) {
      this.#currentFps = this.#frameCounter;
      this.#frameCounter = 0;
      this.#fpsFrameLast = fpsTimeNow;
    }
    
    // Run room update code
    this.#roomHasChanged = false;
    if (this.#currentRoom && this.#currentRoom.update) {
      this.#currentRoom.update();
    }
  }
  
  //----------------------------------------------------------------------------
  // Graphics rendering
  //----------------------------------------------------------------------------
  
  #clearCanvas() {
    if (this.#currentRoom) {
      let rgb = this.#currentRoom.getRoomBackgroundColor();
      this.#backContext.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    } else {
      this.#backContext.fillStyle = 'black';
    }
    
    this.#backContext.fillRect(0, 0, this.#BASE_WIDTH, this.#BASE_HEIGHT);
  }
  
  #renderFrame() {
    this.#frontContext.drawImage(
      this.#backCanvas,                       // Image
      0,                                      // sx
      0,                                      // sy
      this.#BASE_WIDTH,                       // sWidth
      this.#BASE_HEIGHT,                      // sHeight
      0,                                      // dx
      0,                                      // dy
      this.#BASE_WIDTH  * this.#SCREEN_SCALE, // dWidth
      this.#BASE_HEIGHT * this.#SCREEN_SCALE  // dHeight
    );
  }
  
  #draw() {
    // Prepare canvas for rendering frame
    this.#clearCanvas();
    
    // Draw FPS debug overlay
    this.#drawText(
      [this.#currentFps.toString()],
      this.#data.fonts['system_counter'],
      this.#camera.x,
      this.#camera.y
    );
    
    // Draw debug info for current room
    if (this.#showRoomInfo) {
      this.#drawText(
        [
          this.#currentRoom.getRoomName(),
          this.#currentRoom.getRoomWidth() +
            " x " +
            this.#currentRoom.getRoomHeight(),
          "ACTS: " + this.#instances.actives.length,
          "BAKS: " + this.#instances.backdrops.length,
          "TEXT: " + this.#instances.paragraphs.length
        ],
        this.#data.fonts['system_counter'],
        this.#camera.x,
        this.#camera.y + this.#BASE_HEIGHT -
          (5 * this.#data.fonts['system_counter'].charHeight)
      );
    }
    
    // Copy offscreen canvas to visible canvas
    this.#renderFrame();
  }
  
  #drawText(
    textLines,
    font,
    x,
    y,
    lineSpacing = 0,
    alignment = "left"
  ) {
    // Draw lines of text, character-by-character
    for (let lineNum = 0; lineNum < textLines.length; lineNum++) {
      // Get line text
      const line = textLines[lineNum];
      
      // Figure out base offset based on text alignment
      let xOffset = 0
      
      if (alignment === "right") {
        xOffset = line.length * font.charWidth
      } else if (alignment === "center") {
        xOffset = Math.floor(line.length * font.charWidth / 2)
      }
      
      // Draw characters
      for (let charNum = 0; charNum < line.length; charNum++) {
        // Get ASCII character
        const character = line.charAt(charNum);
        
        // Get linear position of tile based on ASCII key code.
        // Our map starts at the // whitespace character, which is 32.
        // Look up an ASCII map for details.
        const asciiCode = line.charCodeAt(charNum) - 32;
        
        // Determine character tile position in bitmap font image
        const charTile = {
          row: Math.floor((asciiCode / 32)),
          col: asciiCode % 32
        };
        
        // Draw character
        this.#backContext.drawImage(
          font.img,                                                  // image
          charTile.col * font.charWidth,                             // sx
          charTile.row * font.charHeight,                            // sy
          font.charWidth,                                            // sWidth
          font.charHeight,                                           // sHeight
          x + (font.charWidth * charNum) - xOffset,                  // dx
          y + (font.charHeight * lineNum) + (lineSpacing * lineNum), // dy
          font.charWidth,                                            // dWidth
          font.charHeight                                            // dHeight
        );
      }
    }
  }
}