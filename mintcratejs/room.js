// -----------------------------------------------------------------------------
// MintCrate - Room
// A scene or level in the game (a game state).
// -----------------------------------------------------------------------------

'use strict';

import { MathX } from "./mathx.js";

export class Room {
  
  //----------------------------------------------------------------------------
  // Private variables
  //----------------------------------------------------------------------------
  
  #name;
  #width;
  #height;
  #backgroundColor;
  
  #fadeLevel;
  #fadeType;
  #fadeInConfig;
  #fadeOutConfig;
  
  //----------------------------------------------------------------------------
  // Constructor
  //----------------------------------------------------------------------------
  
  constructor(name, width, height) {
    // Set room name
    this.#name = name;
    
    // Set room dimensions
    this.#width = width;
    this.#height = height;
    
    // Initialize background color (clear color)
    this.#backgroundColor = {r: 0, g: 0, b: 0};
    
    // Initialize fade in/out settings
    this.#fadeLevel     = 100;
    this.#fadeType      = "fadeIn";
    this.#fadeInConfig  = {enabled: false};
    this.#fadeOutConfig = {enabled: false};
  }
  
  // ---------------------------------------------------------------------------
  // Methods for getting information about the room
  // ---------------------------------------------------------------------------
  
  getRoomName() {
    return this.#name;
  }
  
  getRoomWidth() {
    return this.#width;
  }
  
  getRoomHeight() {
    return this.#height;
  }
  
  // -----------------------------------------------------------------------------
  // Methods for configuring the room's fade in/out settings
  // -----------------------------------------------------------------------------
  
  getRoomFadeInfo() {
    return {
      fadeLevel    : this.#fadeLevel,
      fadeType     : this.#fadeType,
      fadeInConfig : this.#fadeInConfig,
      fadeOutConfig: this.#fadeOutConfig
    };
  }
  
  configureRoomFadeIn(fadeDuration, pauseDuration, color) {
    
  }
  
  configureRoomFadeOut(fadeDuration, pauseDuration, color) {
    
  }
  
  // ---------------------------------------------------------------------------
  // Methods for changing room visuals
  // ---------------------------------------------------------------------------
  
  getRoomBackgroundColor() {
    return {
      r: this.#backgroundColor.r,
      g: this.#backgroundColor.g,
      b: this.#backgroundColor.b
    };
  }
  
  setRoomBackgroundColor(r, g, b) {
    // Constrain color values
    r = MathX.clamp(r, 0, 255);
    g = MathX.clamp(g, 0, 255);
    b = MathX.clamp(b, 0, 255);
    
    // Set background clear color
    this.#backgroundColor = {r: r, g: g, b: b};
  }
}