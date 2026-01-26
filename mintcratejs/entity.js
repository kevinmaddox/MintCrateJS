// ---------------------------------------------------------------------------
// MintCrate - Entity
// A visual game object that can be manipulated in various ways
// ---------------------------------------------------------------------------

'use strict';

import { MintUtil } from "./mintutil.js";
import { MintMath } from "./mintmath.js";

export class Entity {
  
  //----------------------------------------------------------------------------
  // Private variables
  //----------------------------------------------------------------------------
  
  #entityType;
  #name;
  
  #instances;
  #linearInstanceList;
  #drawOrder;
  
  #wasDestroyed;
  #isVisible;
  #opacity;
  
  _x;
  _y;
  
  //----------------------------------------------------------------------------
  // Constructor
  //----------------------------------------------------------------------------
  
  constructor(entityType, name, instances, linearInstanceList, drawOrder, x, y) {
    this.#entityType = entityType;
    this.#name = name;
    
    this.#instances = instances;
    this.#linearInstanceList = linearInstanceList;
    this.#drawOrder = drawOrder;
    
    this.#isVisible = true;
    this.#opacity = 1.0;
    
    this._x = x;
    this._y = y;
  }
  
  // ---------------------------------------------------------------------------
  // Methods for management
  // ---------------------------------------------------------------------------
  
  #getInstanceIndex() {
    // this.#
  }
  
  destroy() {
    // Remove entity from Mintcrate's instance list
    // TODO: Implement recursive function for finding object and removing it
    MintUtil.deleteInCollection(this, this.#instances);
    
    // Remove entity from MintCrate's linear instance list
    let linearInstanceIndex =
      this.#linearInstanceList.findIndex((entity) => entity === this);
    this.#linearInstanceList.splice(linearInstanceIndex, 1);
    
    // Remove entity from MintCrate's draw order table
    let drawIndex = this.#drawOrder.findIndex((entity) => entity === this);
    this.#drawOrder.splice(drawIndex, 1);
    console.log(this.#instances);
  }
  
  getName() {
    return this.#name;
  }
  
  getEntityType() {
    return this.#entityType;
  }
  
  // ---------------------------------------------------------------------------
  // Methods for managing positions
  // ---------------------------------------------------------------------------
  
  getX() {
    return this._x;
  }
  
  getY() {
    return this._y;
  }
  
  setX(x) {
    // Update position
    this._x = x;
    
    // Update collider's position
    if (this._collider) {
      this._collider.x = this._x + this._colliderOffsetX
    }
  }
  
  setY(y) {
    // Update position
    this._y = y;
    
    // Update collider's position
    if (this._collider) {
      this._collider.y = this._y + this._colliderOffsetY
    }
  }
  
  moveX(pixels) {
    this.setX(this._x + pixels);
  }
  
  moveY(pixels) {
    this.setY(this._y + pixels);
  }
  
  // ---------------------------------------------------------------------------
  // Methods for managing draw order
  // ---------------------------------------------------------------------------
  
  bringForward() {
    let index = this.#drawOrder.findIndex((entity) => entity === this);
    MintUtil.array.moveItemRight(this.#drawOrder, index);
  }
  
  sendBackward() {
    let index = this.#drawOrder.findIndex((entity) => entity === this);
    MintUtil.array.moveItemLeft(this.#drawOrder, index);
  }
  
  bringToFront() {
    let index = this.#drawOrder.findIndex((entity) => entity === this);
    MintUtil.array.moveItemToEnd(this.#drawOrder, index);
  }
  
  sendToBack() {
    let index = this.#drawOrder.findIndex((entity) => entity === this);
    MintUtil.array.moveItemToStart(this.#drawOrder, index);
  }
  
  // ---------------------------------------------------------------------------
  // Methods for managing visibility
  // ---------------------------------------------------------------------------
  
  isVisible() {
    return this.#isVisible;
  }
  
  setVisibility(isVisible) {
    this.#isVisible = isVisible;
  }
  
  getOpacity() {
    return this.#opacity;
  }
  
  setOpacity(opacity) {
    this.#opacity = MintMath.clamp(opacity, 0, 1);
  }
  
  adjustOpacity(opacity) {
    this.#opacity = MintMath.clamp(this.#opacity + opacity, 0, 1);
  }
}

/*
for (let i = 0; i < enemies.length; i++)
  
for (let i = 0; i < this.mint.actives.enemies; i++)
  
this.mint.actives.harpy = this.mint.addActive(blahblah);
this.mint.actives.harpy.x += 1
harpy.x += 1

this.mint.iterate(this.mint.actives.enemies, (enemy) => {
  enemy.destroy();
});
*/