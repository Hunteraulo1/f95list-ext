import type { GameType } from '$lib/schemas';

export const typeColor = (name: GameType['type']): string => {
  let result = '';

  switch (name) {
    case 'RenPy':
      result = '#b069e8';
      break;
    case 'RPGM':
      result = '#349ff4';
      break;
    case 'Unity':
      result = '#fe5901';
      break;
    case 'Unreal':
      result = '#0f4fb4';
      break;
    case 'HTLM':
      result = '#72ae3d';
      break;
    case 'Autre':
      result = '#72ae3d';
      break;
    case 'QSP':
      result = '#d74040';
      break;
    default:
      result = '#6b6b6b';
  }

  return `background-color: ${result}`;
};

export const statusColor = (name: GameType['status']): string => {
  let result = '';

  switch (name) {
    case 'EN COURS':
      result = '#72ae3d';
      break;
    case 'TERMINÉ':
      result = '#2196f3';
      break;
    case 'ABANDONNÉ':
      result = '#ffa014';
      break;
    default:
      result = '#6b6b6b';
  }

  return `background-color: ${result}`;
};
