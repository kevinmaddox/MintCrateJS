// ---------------------------------------------------------------------------
// MintCrate - Sound
// Provides a convenient way to work with sound data
// ---------------------------------------------------------------------------

'use strict';

import { MintMath } from "./mintmath.js";

export class Sound {
  
  //----------------------------------------------------------------------------
  // Member variables
  //----------------------------------------------------------------------------
  
  static PLAYBACK_STATES = {
    STOPPED: 0,
    PAUSED : 1,
    PLAYING: 2
  };
  
  #state;
  
  #audioContext;
  #audioBuffer;
  
  #sourceNode;
  #gainNode;
  #endCallback;
  #hasEnded;
  
  #totalTimeElapsed;
  #startedTimestamp;
  
  //----------------------------------------------------------------------------
  // Constructor
  //----------------------------------------------------------------------------
  
  constructor(audioContext, audioBuffer) {
    this.#audioContext = audioContext;
    this.#audioBuffer = audioBuffer;
    
    this.#hasEnded = false;
    
    this.#totalTimeElapsed = 0;
    this.#startedTimestamp = 0;
    
    this.#state = Sound.PLAYBACK_STATES.STOPPED;
  }
  
  play(volume, pitch, loopData) {
    this.#hasEnded = false;
    this.#totalTimeElapsed = 0;
    
    this.#play(volume, pitch, loopData, 0);
    
    this.#state = Sound.PLAYBACK_STATES.PLAYING;
  }
  
  stop() {
    this.#cleanUp();
    
    this.#state = Sound.PLAYBACK_STATES.STOPPED;
  }
  
  pause() {
    if (
      this.#state === Sound.PLAYBACK_STATES.PAUSED
      || this.#state === Sound.PLAYBACK_STATES.STOPPED
    ) {
      return;
    }
    
    
    let timeElapsed = this.#audioContext.currentTime - this.#startedTimestamp;
    this.#totalTimeElapsed += timeElapsed;
    
    this.#cleanUp();
    
    this.#state = Sound.PLAYBACK_STATES.PAUSED;
  }
  
  resume(volume, pitch, loopData) {
    if (this.#state !== Sound.PLAYBACK_STATES.PAUSED) {
      return;
    }
    
    this.#play(
      volume,
      pitch,
      loopData,
      (this.#totalTimeElapsed % this.#audioBuffer.duration)
    );
    
    this.#state = Sound.PLAYBACK_STATES.PLAYING;
  }
  
  #play(volume, pitch, loopData, startOffset) {
    // Stop and clean up old audio data in case it's already playing
    this.#cleanUp();
    
    // Create new source node for playing the audio
    this.#sourceNode = this.#audioContext.createBufferSource();
    this.#sourceNode.buffer = this.#audioBuffer;
    
    // Set volume
    this.#gainNode = this.#audioContext.createGain();
    this.setVolume(volume);
    
    // Set pitch
    this.setPitch(pitch);
    
    // Set looping properties
    this.#sourceNode.loop      = loopData.enabled;
    if (loopData.enabled) {
      this.#sourceNode.loopStart = loopData.start;
      this.#sourceNode.loopEnd   = loopData.end;
    }
    
    // Set up callback to destroy sound when it's done playing
    this.#endCallback = () => {
      this.#cleanUp();
      this.#hasEnded = true;
    };
    this.#sourceNode.addEventListener('ended', this.#endCallback);
    
    // Play sound
    this.#sourceNode.connect(this.#gainNode);
    this.#gainNode.connect(this.#audioContext.destination);
    this.#sourceNode.start(0, startOffset);
    
    // Store timestamp at which point this sound started playing
    this.#startedTimestamp = this.#audioContext.currentTime;
  }
  
  isPaused() {
    return (this.#state === Sound.PLAYBACK_STATES.PAUSED);
  }
  
  hasEnded() {
    return this.#hasEnded;
  }
  
  setVolume(volume) {
    // TODO: Test these values
    volume = MintMath.clamp(volume, 0, 1);
    
    if (this.#gainNode) {
      this.#gainNode.gain.value = volume;
    }
  }
  
  setPitch(pitch) {
    // TODO: Test these values
    pitch = MintMath.clamp(pitch, 0.1, 30);
    
    if (this.#sourceNode) {
      this.#sourceNode.playbackRate.value = pitch;
    }
  }
  
  #cleanUp() {
    if (this.#sourceNode) {
      this.#sourceNode.stop();
      this.#sourceNode.disconnect();
      this.#sourceNode.removeEventListener('ended', this.#endCallback);
    }
    
    if (this.#gainNode) {
      this.#gainNode.gain.value = 0;
      this.#gainNode.disconnect();
    }
    
    this.#state = Sound.PLAYBACK_STATES.STOPPED;
  }
  
}