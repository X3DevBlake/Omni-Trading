/**
 * Omni Audio Engine
 * Handles global sound effects for a premium trading experience.
 */

class AudioEngine {
  constructor() {
    this.sounds = {
      zip: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), // Spaceship Flyby
      pick: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'), // Clean UI Click
      success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'), // Mission Accomplished / Claim
    };

    this.muted = localStorage.getItem('omni_audio_muted') === 'true';
    
    // Set volumes
    this.sounds.zip.volume = 0.4;
    this.sounds.pick.volume = 0.5;
    this.sounds.success.volume = 0.6;
  }

  play(soundName) {
    if (this.muted) return;
    const s = this.sounds[soundName];
    if (s) {
      s.currentTime = 0;
      s.play().catch(e => console.warn('AudioEngine: Play blocked by browser policy.', e));
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('omni_audio_muted', this.muted);
    return this.muted;
  }
}

export const audio = new AudioEngine();
