const { createElement: h, useEffect, useMemo, useState } = React;

const unlockDate = new Date('2026-05-10T00:00:00+05:30');
const previewMode = new URLSearchParams(window.location.search).get('preview') === 'true';
const photos = {
  momPortrait: './assets/image11.png',
  dhanyaPortrait: './assets/image10.png',
  momAndDhanyaSelfie: './assets/image1.png',
  mirrorMemory: './assets/image2.png',
  matchingOutfits: './assets/image3.png',
  babyMemory: './assets/image4.png',
  childhoodRide: './assets/image5.png',
  caveTrip: './assets/image6.png',
  beachMemory: './assets/image7.png',
  childhoodSofa: './assets/image8.png',
  momWindow: './assets/image9.png',
};

const memories = [
  {
    title: 'Tiny Me, Safe With You',
    caption: 'From the very beginning, your arms have been my safest place.',
    image: photos.babyMemory,
  },
  {
    title: 'Our Little Adventures',
    caption: 'Every trip with you becomes a memory I want to keep forever.',
    image: photos.caveTrip,
  },
  {
    title: 'My Happiest Place',
    caption: 'The best memories are the ones where I am laughing beside you.',
    image: photos.beachMemory,
  },
];

const popupLines = [
  'I love you, Mom',
  'You are my whole world',
  'Best mom ever',
  'Thank you for everything',
  'Happy Mother\'s Day',
];

const floatingPhotoHearts = [
  photos.momAndDhanyaSelfie,
  photos.mirrorMemory,
  photos.matchingOutfits,
  photos.childhoodSofa,
  photos.momWindow,
];

const screens = ['hero', 'wish', 'memories', 'final'];
let musicEngine = null;

function createMusicEngine() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  const context = new AudioContext();
  const master = context.createGain();
  const delay = context.createDelay();
  const feedback = context.createGain();
  const filter = context.createBiquadFilter();

  master.gain.value = 0.085;
  delay.delayTime.value = 0.32;
  feedback.gain.value = 0.24;
  filter.type = 'lowpass';
  filter.frequency.value = 1400;

  master.connect(filter);
  filter.connect(context.destination);
  master.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(filter);

  const notes = [
    [523.25, 0],
    [659.25, 0.45],
    [783.99, 0.9],
    [659.25, 1.35],
    [587.33, 1.8],
    [698.46, 2.25],
    [880, 2.7],
    [783.99, 3.15],
  ];
  let interval = null;

  function playNote(frequency, startTime) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.42, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.72);

    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.78);
  }

  function playChord(frequencies, startTime) {
    frequencies.forEach((frequency) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.8);

      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(startTime);
      oscillator.stop(startTime + 4);
    });
  }

  function scheduleLoop() {
    const now = context.currentTime + 0.05;
    playChord([261.63, 329.63, 392], now);
    playChord([293.66, 349.23, 440], now + 4);

    notes.forEach(([frequency, offset]) => playNote(frequency, now + offset));
    notes.forEach(([frequency, offset]) => playNote(frequency * 0.5, now + 4 + offset));
  }

  return {
    async start() {
      if (context.state === 'suspended') await context.resume();
      scheduleLoop();
      interval = window.setInterval(scheduleLoop, 8000);
    },
    stop() {
      if (interval) {
        window.clearInterval(interval);
        interval = null;
      }
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0, context.currentTime, 0.08);
      window.setTimeout(() => context.close(), 450);
    },
  };
}

async function toggleBackgroundMusic(shouldPlay) {
  if (shouldPlay) {
    musicEngine = createMusicEngine();
    if (!musicEngine) return false;
    await musicEngine.start();
    return true;
  }

  if (musicEngine) {
    musicEngine.stop();
    musicEngine = null;
  }
  return false;
}

function getRemaining() {
  if (previewMode) {
    return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const difference = Math.max(0, unlockDate.getTime() - Date.now());
  const totalSeconds = Math.floor(difference / 1000);

  return {
    done: difference === 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function Icon({ name, size = 18, filled = false, className = '' }) {
  const icons = {
    arrow: h('path', { d: 'M5 12h14M13 5l7 7-7 7' }),
    gift: h('path', { d: 'M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 2.2-3.7C10.8 4.6 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0-2.2-3.7C13.2 4.6 12 7 12 7z' }),
    heart: h('path', { d: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z' }),
    music: h('path', { d: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-2-2.83M21 16a3 3 0 1 1-2-2.83' }),
    pause: h('path', { d: 'M8 5v14M16 5v14' }),
    sparkles: h('path', { d: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM5 3v4M3 5h4M19 17v4M17 19h4' }),
  };

  return h(
    'svg',
    {
      className,
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: filled ? 'currentColor' : 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
    },
    icons[name],
  );
}

function App() {
  const [remaining, setRemaining] = useState(getRemaining);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [screenIndex, setScreenIndex] = useState(0);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [activePopup, setActivePopup] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [partyKey, setPartyKey] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = getRemaining();
      setRemaining(next);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return undefined;
    const popupTimer = window.setInterval(() => {
      setActivePopup((current) => (current + 1) % popupLines.length);
    }, 2600);

    return () => window.clearInterval(popupTimer);
  }, [isUnlocked]);

  const floatingHearts = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        id: index,
        left: `${(index * 17) % 100}%`,
        delay: `${(index % 8) * 0.45}s`,
        duration: `${8 + (index % 5)}s`,
        size: `${14 + (index % 4) * 6}px`,
      })),
    [],
  );

  const floatingPhotoItems = useMemo(
    () =>
      floatingPhotoHearts.map((image, index) => ({
        id: image,
        image,
        left: `${10 + ((index * 19) % 78)}%`,
        delay: `${1.2 + index * 1.35}s`,
        duration: `${12 + (index % 3) * 2}s`,
        size: `${58 + (index % 3) * 14}px`,
      })),
    [],
  );

  const triggerParty = () => setPartyKey((current) => current + 1);

  const goNext = () => {
    triggerParty();
    setScreenIndex((current) => Math.min(current + 1, screens.length - 1));
  };

  const goNextMemory = () => {
    if (memoryIndex < memories.length - 1) {
      setMemoryIndex((current) => current + 1);
      return;
    }

    setMemoryIndex(0);
    goNext();
  };

  const handleMusicToggle = async () => {
    const next = !musicOn;
    setMusicOn(next);
    const playing = await toggleBackgroundMusic(next);
    setMusicOn(playing);
  };

  const handleOpenSurprise = async () => {
    triggerParty();
    setIsUnlocked(true);
    setScreenIndex(0);
    const playing = await toggleBackgroundMusic(true);
    setMusicOn(playing);
  };

  return h(
    'main',
    { className: 'app-shell' },
    h('div', { className: 'background-glow background-glow-one' }),
    h('div', { className: 'background-glow background-glow-two' }),
    h('div', { className: 'signature-mark' }, h('span', null, 'with love,'), h('strong', null, 'Dhanya')),
    floatingHearts.map((heart) =>
      h(
        'span',
        {
          className: 'floating-heart',
          key: heart.id,
          style: {
            '--left': heart.left,
            '--delay': heart.delay,
            '--duration': heart.duration,
            '--size': heart.size,
          },
        },
        '♥',
      ),
    ),
    floatingPhotoItems.map((item) =>
      h(
        'span',
        {
          className: 'floating-photo-heart',
          key: item.id,
          style: {
            '--left': item.left,
            '--delay': item.delay,
            '--duration': item.duration,
            '--size': item.size,
            '--photo': `url("${item.image}")`,
          },
        },
        h('span', { className: 'floating-photo-heart-inner' }),
      ),
    ),
    !isUnlocked
      ? h(Countdown, { remaining, onOpen: handleOpenSurprise })
      : h(
          React.Fragment,
          null,
          h(Popup, { text: popupLines[activePopup] }),
          h(PartyBurst, { key: partyKey }),
          h(
            'button',
            {
              className: 'music-button',
              type: 'button',
              onClick: handleMusicToggle,
              'aria-label': 'Toggle music',
            },
            h(Icon, { name: musicOn ? 'pause' : 'music', size: 18 }),
          ),
          musicOn && h('div', { className: 'soft-music' }, 'Soft background music is playing'),
          screens[screenIndex] === 'hero' && h(Hero, { onNext: goNext }),
          screens[screenIndex] === 'wish' && h(Wish, { onNext: goNext }),
          screens[screenIndex] === 'memories' && h(Memories, { memoryIndex, onNext: goNextMemory }),
          screens[screenIndex] === 'final' && h(Finale),
        ),
  );
}

function PartyBurst() {
  const confetti = Array.from({ length: 34 }, (_, index) => ({
    id: index,
    left: `${7 + ((index * 11) % 86)}%`,
    delay: `${(index % 8) * 0.045}s`,
    color: ['#ff2f7d', '#ffd166', '#ffffff', '#ff7ab6', '#ba0c47', '#ff9f1c'][index % 6],
    drift: `${-42 + (index % 7) * 14}px`,
  }));

  const balloons = Array.from({ length: 6 }, (_, index) => ({
    id: index,
    left: `${10 + index * 15}%`,
    delay: `${index * 0.08}s`,
    color: ['#e91e63', '#ff6fae', '#c2185b', '#ffb3d0', '#ad1457', '#ff477e'][index],
  }));

  return h(
    'div',
    { className: 'party-layer', 'aria-hidden': 'true' },
    h('div', { className: 'party-flash' }),
    h('div', { className: 'party-ring' }),
    confetti.map((piece) =>
      h('span', {
        className: 'confetti-piece',
        key: `c-${piece.id}`,
        style: {
          '--left': piece.left,
          '--delay': piece.delay,
          '--color': piece.color,
          '--drift': piece.drift,
        },
      }),
    ),
    balloons.map((balloon) =>
      h(
        'span',
        {
          className: 'party-balloon',
          key: `b-${balloon.id}`,
          style: {
            '--left': balloon.left,
            '--delay': balloon.delay,
            '--color': balloon.color,
          },
        },
        h('span', { className: 'balloon-string' }),
      ),
    ),
  );
}

function Countdown({ remaining, onOpen }) {
  return h(
    'section',
    { className: 'screen countdown-screen' },
    h('div', { className: 'surprise-badge' }, h(Icon, { name: 'gift', size: 18 }), 'Mother\'s Day surprise'),
    remaining.done
      ? h(
          React.Fragment,
          null,
          h('h1', null, 'Surprise ready hai'),
          h('p', { className: 'lead' }, 'Mumma ke liye special Mother\'s Day wish open karne ke liye button dabao.'),
          h('button', { className: 'primary-button open-now-button', type: 'button', onClick: onOpen }, 'Open now ', h(Icon, { name: 'heart', size: 18, filled: true })),
        )
      : h(
          React.Fragment,
          null,
          h('h1', null, 'Bas thoda wait, Mumma'),
          h('p', { className: 'lead' }, 'Aapke liye ek chhota sa pink-red surprise 12 baje unlock hoga.'),
          h(
            'div',
            { className: 'countdown-grid', 'aria-label': 'Countdown to Mother\'s Day' },
            h(TimeBlock, { label: 'Days', value: remaining.days }),
            h(TimeBlock, { label: 'Hours', value: remaining.hours }),
            h(TimeBlock, { label: 'Minutes', value: remaining.minutes }),
            h(TimeBlock, { label: 'Seconds', value: remaining.seconds }),
          ),
          h('p', { className: 'tiny-note' }, 'Unlock time: 10 May 2026, 12:00 AM'),
        ),
  );
}

function TimeBlock({ label, value }) {
  return h('div', { className: 'time-block' }, h('strong', null, String(value).padStart(2, '0')), h('span', null, label));
}

function Hero({ onNext }) {
  return h(
    'section',
    { className: 'screen hero-screen' },
    h('div', { className: 'photo-orbit' }, h('img', { src: photos.momAndDhanyaSelfie, alt: 'Maa and Dhanya together' })),
    h(
      'div',
      { className: 'hero-copy' },
      h('p', { className: 'eyebrow' }, 'For my beautiful mom'),
      h('h1', null, 'Happy Mother\'s Day'),
      h('p', { className: 'lead' }, 'Happy Mother\'s Day, Maa - your love is my safest place and my biggest strength.'),
      h('button', { className: 'primary-button', type: 'button', onClick: onNext }, 'Read my wish ', h(Icon, { name: 'arrow', size: 18 })),
    ),
  );
}

function Wish({ onNext }) {
  return h(
    'section',
    { className: 'screen wish-screen' },
    h(
      'div',
      { className: 'wish-panel' },
      h(Icon, { name: 'sparkles', size: 34, className: 'wish-icon' }),
      h('p', { className: 'eyebrow' }, 'A big wish for you'),
      h('h2', null, 'Mumma, thank you for being my safest place.'),
      h('p', null, 'Happy Mother\'s Day, Mumma. 🤍'),
      h('p', null, 'You have always loved me unconditionally, understood me through every mistake, celebrated my smallest joys, and believed in me even during the moments when I doubted myself. Your constant love, care, and support have shaped me into the person I am today.'),
      h('p', null, 'You are my first teacher, my greatest strength, and one of the biggest blessings in my life. I may not always express it properly, but from the bottom of my heart, thank you for every hug, every prayer, every sacrifice, every smile, and every moment you chose my happiness before your own.'),
      h('p', null, 'I love you more than words can ever explain. I hope you always stay happy, healthy, and continue to be the most beautiful light in my life. ✨'),
      h('button', { className: 'primary-button', type: 'button', onClick: onNext }, 'See memories ', h(Icon, { name: 'arrow', size: 18 })),
    ),
  );
}

function Memories({ memoryIndex, onNext }) {
  const memory = memories[memoryIndex];
  const isLast = memoryIndex === memories.length - 1;

  return h(
    'section',
    { className: 'screen memories-screen' },
    h('div', { className: 'section-heading' }, h('p', { className: 'eyebrow' }, `Memory ${memoryIndex + 1} of ${memories.length}`), h('h2', null, 'Little photo, big feeling')),
    h(
      'article',
      { className: 'memory-card memory-card-single', key: memory.title },
      h('img', { src: memory.image, alt: memory.title }),
      h(
        'div',
        null,
        h('h3', null, memory.title),
        h('p', null, memory.caption),
        h(
          'div',
          { className: 'memory-dots', 'aria-label': 'Memory progress' },
          memories.map((item, index) => h('span', { key: item.title, className: index === memoryIndex ? 'active' : '' })),
        ),
      ),
    ),
    h('button', { className: 'primary-button', type: 'button', onClick: onNext }, isLast ? 'Final surprise ' : 'Next memory ', h(Icon, { name: 'arrow', size: 18 })),
  );
}

function Finale() {
  return h(
    'section',
    { className: 'screen final-screen' },
    h(
      'div',
      { className: 'final-photos' },
      h('img', { src: photos.dhanyaPortrait, alt: 'Dhanya portrait' }),
      h(Icon, { name: 'heart', size: 52, filled: true, className: 'final-heart' }),
      h('img', { src: photos.momPortrait, alt: 'Maa portrait' }),
    ),
    h('p', { className: 'eyebrow' }, 'Forever and always'),
    h('h2', null, 'I love you, Mumma'),
    h('p', { className: 'lead' }, 'Aap meri duniya ho. Happy Mother\'s Day from your child, with all the love in my heart.'),
  );
}

function Popup({ text }) {
  return h('div', { className: 'popup-wish', role: 'status' }, h(Icon, { name: 'heart', size: 16, filled: true }), text);
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
