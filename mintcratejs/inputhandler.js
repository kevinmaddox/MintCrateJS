// ---------------------------------------------------------------------------
// MintCrate - InputHandler
// Handles player input and provides abstractions for keyboard inputs.
// ---------------------------------------------------------------------------

'use strict';

export class InputHandler {
  
  //----------------------------------------------------------------------------
  // Member variables
  //----------------------------------------------------------------------------
  
  #inputs;
  #repeatWaitTime;
  #repeatDelay;
  
  //----------------------------------------------------------------------------
  // Constructor
  //----------------------------------------------------------------------------
  
  constructor() {
    this.#inputs         = {};
    this.#repeatWaitTime = 25;
    this.#repeatDelay    = 3;
  }
  
  // ---------------------------------------------------------------------------
  // 
  // ---------------------------------------------------------------------------
  
  mapInput(inputName, inputCode) {
    // Create data for input mapping if it doesn't exist yet
    if (!this.#inputs[inputName]) {
      this.#inputs[inputName] = {
        code        : "",
        held        : false,
        pressed     : false,
        released    : false,
        repeatTimer : 0
      };
    }
    
    // Check if input already exists, and effectively flip the entries if so
    // Imagine the controller options in a video game, how if you set two
    // inputs to the same button, it'll flip them around
    // This is to avoid two inputs being mapped to the same key or button
    for (const name in this.#inputs) {
      let input = this.#inputs[name];
      if (
        input.code == inputCode
        && name != inputName
      ) {
        input.code = this.#inputs[inputName].code;
      }
    }
    
    // Map input
    this.#inputs[inputName].code = inputCode;
  }
  
  _update(keyStates) {
    // Go through each input and update the input states
    for (const inputName in this.#inputs) {
      let input = this.#inputs[inputName];
      
      // Reset states
      input.pressed  = false;
      input.released = false;
      
      // Prepare to check for states
      let down = false;
      
      // Handle keyboard keys
      let kbCode = input.code;
      if (
        kbCode in keyStates
        && keyStates[kbCode].held
      ) {
        down = true;
      }
      
      // Handle setting held/pressed/released values
      // Input pressed
      if (down) {
        if (!input.held) {
          input.pressed     = true;
          input.repeatTimer = 0;
        }
        
        input.held = true;
      // Input released
      } else {
        if (input.held) {
          input.released    = true;
          input.repeatTimer = 0;
        }
        
        input.held = false;
      }
      
      // Handle press & release timer
      if (input.held) {
        // Backtrack timer if it's hit the repeat point
        if (input.repeatTimer >= this.#repeatWaitTime) {
          input.repeatTimer -= this.#repeatDelay;
        }
        
        // Tick timer
        input.repeatTimer++;
      }
    }
  }
  
  pressed(inputName, enableRepeat = false) {
    // Check state
    let state = false;
    let input = this.#inputs[inputName];
    
    if (
      input.pressed
      || (enableRepeat && input.repeatTimer == this.#repeatWaitTime)
    ) {
      state = true;
    }
    
    // Return pressed state
    return state;
  }
  
  released(inputName) {
    // Return released state
    return this.#inputs[inputName].released;
  }
  
  held(inputName) {
    // Return held state
    return this.#inputs[inputName].held;
  }
}