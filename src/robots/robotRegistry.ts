import type { Robot } from './Robot';

export const ROBOTS: Robot[] = [
  {
    id: 'clanky',
    name: 'Clanky',
    tagline: 'Rusty but trusty!',
    primaryColor: '#FF6B35',
    primaryHex: 0xff6b35,
    voicePitch: 0.8,
    personality: 'grumpy',
  },
  {
    id: 'sparks',
    name: 'Sparks',
    tagline: 'Zappy and happy!',
    primaryColor: '#00E5FF',
    primaryHex: 0x00e5ff,
    voicePitch: 1.2,
    personality: 'cheerful',
  },
  {
    id: 'boltz',
    name: 'Boltz',
    tagline: 'Faster than lightning!',
    primaryColor: '#76FF03',
    primaryHex: 0x76ff03,
    voicePitch: 1.5,
    personality: 'hyper',
  },
  {
    id: 'gizmo',
    name: 'Gizmo',
    tagline: 'Beep... boop... zzz...',
    primaryColor: '#E040FB',
    primaryHex: 0xe040fb,
    voicePitch: 0.6,
    personality: 'sleepy',
  },
];
