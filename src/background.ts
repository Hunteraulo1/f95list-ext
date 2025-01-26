import type { GameType, UpdateType } from '$lib/schemas';
import { action, browserAction, runtime, storage } from 'webextension-polyfill';

const call = {
  async get<T extends keyof CallType>(query: T): Promise<CallType[T]> {
    try {
      const data = await storage.local.get([query]);

      return data[query] as CallType[T];
    } catch (error) {
      console.error(error);

      throw new Error(`${query} not found`);
    }
  },

  async set<T extends keyof CallType>(query: T, value: CallType[T]): Promise<void> {
    try {
      await storage.local.set({ [query]: value });
    } catch (error) {
      console.error(error);
    }
  },
};

runtime.onInstalled.addListener(async () => {
  const integrate = await call.get('f95list_ext_integrate');

  if (integrate === undefined) await call.set('f95list_ext_integrate', true);

  const data = await dataInit();

  if (data) await badgeState(data);
});

runtime.onStartup.addListener(async () => {
  const data = await dataInit();

  if (data) await badgeState(data);
});

interface UpdateData {
  date: UpdateType['date'];
  type: UpdateType['type'];
  names: GameType['name'][];
}

interface Data {
  updates: UpdateData[];
  games: GameType[];
}

interface CallType {
  f95list_ext_data: Data | undefined;
  f95list_ext_badge: UpdateData[] | undefined;
  f95list_ext_time: number | undefined;
  f95list_ext_integrate: boolean | undefined;
}

const badgeState = async (data: CallType['f95list_ext_data']) => {
  if (!data || data.updates.length === 0) throw new Error('data not defined or empty');

  const updatesData = data.updates;
  const badge = (await call.get('f95list_ext_badge')) ?? [];

  let index = 0;

  updatesData?.every((updateData: UpdateData) => {
    if (badge[0] && updateData.date < badge[0].date) return false;

    index += updateData.names.length;

    return true;
  });

  badge.map((update: UpdateData) => {
    index -= update.names.length;
  });

  const definedAction = browserAction ?? action;
  definedAction.setBadgeText({ text: index === 0 ? null : index.toString() });
  definedAction.setBadgeBackgroundColor({ color: '#CC0000' });
};

const badgeReset = async (data: CallType['f95list_ext_data']) => {
  if (!data || data.updates.length === 0) throw new Error('data not defined or empty');

  try {
    const updates = [data.updates[0]];

    if (data.updates[0].date === data.updates[1].date) updates.push(data.updates[1]);

    await call.set('f95list_ext_badge', updates);
    await badgeState(data);
  } catch (error) {
    console.error(error);
  }
};

let wait = false;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const dataInit = async (): Promise<CallType['f95list_ext_data'] | null> => {
  while (wait) {
    await sleep(1000); // 1 second
  }

  let data = await call.get('f95list_ext_data');

  if (wait) return null;
  wait = true;

  const date = new Date().getTime();
  const time = (await call.get('f95list_ext_time')) ?? 0;

  if (data && date < time) {
    wait = false;

    return data;
  }

  data = await query();

  if (!data) throw new Error('data not found');

  await call.set('f95list_ext_time', date + 1000 * 60 * 60 * 2); // 2 hours
  await call.set('f95list_ext_data', data);

  await badgeState(data);

  wait = false;

  return data;
};

runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.info(message);

  (async () => {
    const data = await dataInit();
    console.log('🚀 ~ data:', data);

    if (!data || typeof message !== 'string') {
      console.error('data not found');

      return false;
    }

    switch (message) {
      case 'f95list-script': {
        const integrate = await call.get('f95list_ext_integrate');

        if (!integrate) break;

        sendResponse(data.games);

        break;
      }
      case 'f95list-ext':
        sendResponse(data);

        break;
      case 'f95list-badge':
        await badgeReset(data);

        break;
      case message.startsWith('f95list-integrate') ? message : 'f95list-integrate':
        await call.set('f95list_ext_integrate', message.endsWith('true'));

        break;
    }
  })();

  return true;
});

const query = async () => {
  try {
    console.info('🚀 ~ query: ~ fetch');

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbybvrFy6B2L7rkLWJnrwRHhP0F6Sv0uk6V9zUTZibwEzUjKXf-abOK_N6jUhqFPs9US/execF',
    );
    const data = await response.json();

    if (!data?.data) throw new Error('fetch not data');

    return data.data;
  } catch (error) {
    console.error(error);

    await call.set('f95list_ext_time', 0);

    wait = false;
  }
};
