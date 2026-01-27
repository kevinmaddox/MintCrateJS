// ---------------------------------------------------------------------------
// MintCrate - Backdrop
// A static entity intended for background visuals
// ---------------------------------------------------------------------------

// TODO: Add mosaic feature where you can scroll the background without moving it

'use strict';

import { Entity } from "./entity.js";

export class Backdrop extends Entity {
  
  //----------------------------------------------------------------------------
  // Member variables
  //----------------------------------------------------------------------------
  
  #name;
  
  #width;
  #height;
  
  //----------------------------------------------------------------------------
  // Constructor
  //----------------------------------------------------------------------------
  
  constructor(
    name,
    instances,
    linearInstanceList,
    drawOrder,
    x,
    y,
    width,
    height
  ) {
    super("backdrop", name, instances, linearInstanceList, drawOrder, x, y);
    
    this.#width = width;
    this.#height = height;
  }
  
  // ---------------------------------------------------------------------------
  // Methods for retrieving data about the Backdrop
  // ---------------------------------------------------------------------------
  
  getWidth() {
    return this.#width;
  }
  
  getHeight() {
    return this.#height;
  }
}