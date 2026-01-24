// -----------------------------------------------------------------------------
// MintCrate - Math
// A utility library for assorted mathematical functions.
// -----------------------------------------------------------------------------

export class MathX {
  constructor() {
    
  }
  
  static clamp(value, limitLower, limitUpper) {
    return Math.max(limitLower, Math.min(limitUpper, value))
  }
}