export class SoundService {
    static play(soundType) {
        const sounds = {
            'zip': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Sci-fi zip
            'claim': 'https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3', // Success ding
            'burn': 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'  // Fire/Whoosh
        };

        const audio = new Audio(sounds[soundType]);
        audio.volume = 0.3;
        audio.play().catch(e => console.warn("Audio play blocked by browser. User must interact first."));
        
        if (navigator.vibrate) {
            navigator.vibrate(soundType === 'zip' ? [50, 30, 50] : 100);
        }
    }
}
