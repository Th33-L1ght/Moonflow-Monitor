import { type Child } from './types';
import { subDays, addDays } from 'date-fns';

const today = new Date();

export const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Olivia',
    avatarUrl: 'https://placehold.co/100x100.png',
    cycles: [
      {
        id: 'c1-1',
        startDate: subDays(today, 2),
        endDate: addDays(today, 3),
        symptoms: [
          { date: subDays(today, 2), crampLevel: 3, mood: 'Irritable' },
          { date: subDays(today, 1), crampLevel: 2, mood: 'Sad' },
          { date: today, crampLevel: 1, mood: 'Calm' },
        ],
      },
      {
        id: 'c1-2',
        startDate: subDays(today, 32),
        endDate: subDays(today, 27),
        symptoms: [],
      },
    ],
  },
  {
    id: '2',
    name: 'Sophia',
    avatarUrl: 'https://placehold.co/100x100.png',
    cycles: [
      {
        id: 'c2-1',
        startDate: subDays(today, 18),
        endDate: subDays(today, 13),
        symptoms: [],
      },
      {
        id: 'c2-2',
        startDate: subDays(today, 48),
        endDate: subDays(today, 42),
        symptoms: [],
      },
    ],
  },
  {
    id: '3',
    name: 'Emma',
    avatarUrl: 'https://placehold.co/100x100.png',
    cycles: [
      {
        id: 'c3-1',
        startDate: subDays(today, 25),
        endDate: subDays(today, 20),
        symptoms: [
            { date: subDays(today, 25), crampLevel: 4, mood: 'Anxious' }
        ],
      },
      {
        id: 'c3-2',
        startDate: subDays(today, 55),
        endDate: subDays(today, 50),
        symptoms: [],
      },
    ],
  },
];
