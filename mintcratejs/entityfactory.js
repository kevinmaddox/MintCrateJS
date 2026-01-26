// -----------------------------------------------------------------------------
// MintCrate - Entity Factory
// Factory for creating game entities
// -----------------------------------------------------------------------------

'use strict';

import { Backdrop } from "./backdrop.js";

export class EntityFactory {
  #instanceCollection;
  #linearInstanceLists;
  #drawOrders
  
  constructor(instanceCollection, linearInstanceLists, drawOrders) {
    this.#instanceCollection = instanceCollection;
    this.#linearInstanceLists = linearInstanceLists;
    this.#drawOrders = drawOrders;
  }
  
  addBackdrop(name, x, y, options = {}) {
    let backdrop = new Backdrop(
      name,
      this.#instanceCollection,
      this.#linearInstanceLists.backdrops,
      this.#drawOrders,
      x,
      y,
      240,
      172
    );
    
    this.#linearInstanceLists.backdrops.push(backdrop);
    this.#drawOrders.push(backdrop);
    
    return backdrop;
  }
}