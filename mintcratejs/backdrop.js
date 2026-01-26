// ---------------------------------------------------------------------------
// MintCrate - Backdrop
// A static entity intended for background visuals
// ---------------------------------------------------------------------------

'use strict';

import { Entity } from "./entity.js";

export class Backdrop extends Entity {
  
  //----------------------------------------------------------------------------
  // Member variables
  //----------------------------------------------------------------------------
  
  #name;
  #x;
  #y;
  
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