var background = function() {
  "use strict";
  var _a, _b, _c, _d;
  function defineBackground(arg) {
    if (arg == null || typeof arg === "function") return { main: arg };
    return arg;
  }
  var _MatchPattern = class {
    constructor(matchPattern) {
      if (matchPattern === "<all_urls>") {
        this.isAllUrls = true;
        this.protocolMatches = [..._MatchPattern.PROTOCOLS];
        this.hostnameMatch = "*";
        this.pathnameMatch = "*";
      } else {
        const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
        if (groups == null)
          throw new InvalidMatchPattern(matchPattern, "Incorrect format");
        const [_, protocol, hostname, pathname] = groups;
        validateProtocol(matchPattern, protocol);
        validateHostname(matchPattern, hostname);
        this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
        this.hostnameMatch = hostname;
        this.pathnameMatch = pathname;
      }
    }
    includes(url) {
      if (this.isAllUrls)
        return true;
      const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
      return !!this.protocolMatches.find((protocol) => {
        if (protocol === "http")
          return this.isHttpMatch(u);
        if (protocol === "https")
          return this.isHttpsMatch(u);
        if (protocol === "file")
          return this.isFileMatch(u);
        if (protocol === "ftp")
          return this.isFtpMatch(u);
        if (protocol === "urn")
          return this.isUrnMatch(u);
      });
    }
    isHttpMatch(url) {
      return url.protocol === "http:" && this.isHostPathMatch(url);
    }
    isHttpsMatch(url) {
      return url.protocol === "https:" && this.isHostPathMatch(url);
    }
    isHostPathMatch(url) {
      if (!this.hostnameMatch || !this.pathnameMatch)
        return false;
      const hostnameMatchRegexs = [
        this.convertPatternToRegex(this.hostnameMatch),
        this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))
      ];
      const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
      return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
    }
    isFileMatch(url) {
      throw Error("Not implemented: file:// pattern matching. Open a PR to add support");
    }
    isFtpMatch(url) {
      throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
    }
    isUrnMatch(url) {
      throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
    }
    convertPatternToRegex(pattern) {
      const escaped = this.escapeForRegex(pattern);
      const starsReplaced = escaped.replace(/\\\*/g, ".*");
      return RegExp(`^${starsReplaced}$`);
    }
    escapeForRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };
  var MatchPattern = _MatchPattern;
  MatchPattern.PROTOCOLS = ["http", "https", "file", "ftp", "urn"];
  var InvalidMatchPattern = class extends Error {
    constructor(matchPattern, reason) {
      super(`Invalid match pattern "${matchPattern}": ${reason}`);
    }
  };
  function validateProtocol(matchPattern, protocol) {
    if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*")
      throw new InvalidMatchPattern(
        matchPattern,
        `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`
      );
  }
  function validateHostname(matchPattern, hostname) {
    if (hostname.includes(":"))
      throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
    if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*."))
      throw new InvalidMatchPattern(
        matchPattern,
        `If using a wildcard (*), it must go at the start of the hostname`
      );
  }
  const browser$1 = (
    // @ts-expect-error
    ((_b = (_a = globalThis.browser) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id) == null ? globalThis.chrome : (
      // @ts-expect-error
      globalThis.browser
    )
  );
  var has = Object.prototype.hasOwnProperty;
  function dequal(foo, bar) {
    var ctor, len;
    if (foo === bar) return true;
    if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
      if (ctor === Date) return foo.getTime() === bar.getTime();
      if (ctor === RegExp) return foo.toString() === bar.toString();
      if (ctor === Array) {
        if ((len = foo.length) === bar.length) {
          while (len-- && dequal(foo[len], bar[len])) ;
        }
        return len === -1;
      }
      if (!ctor || typeof foo === "object") {
        len = 0;
        for (ctor in foo) {
          if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
          if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
        }
        return Object.keys(bar).length === len;
      }
    }
    return foo !== foo && bar !== bar;
  }
  const E_CANCELED = new Error("request for lock canceled");
  var __awaiter$2 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result2) {
        result2.done ? resolve(result2.value) : adopt(result2.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  class Semaphore {
    constructor(_value, _cancelError = E_CANCELED) {
      this._value = _value;
      this._cancelError = _cancelError;
      this._queue = [];
      this._weightedWaiters = [];
    }
    acquire(weight = 1, priority = 0) {
      if (weight <= 0)
        throw new Error(`invalid weight ${weight}: must be positive`);
      return new Promise((resolve, reject) => {
        const task = { resolve, reject, weight, priority };
        const i = findIndexFromEnd(this._queue, (other) => priority <= other.priority);
        if (i === -1 && weight <= this._value) {
          this._dispatchItem(task);
        } else {
          this._queue.splice(i + 1, 0, task);
        }
      });
    }
    runExclusive(callback_1) {
      return __awaiter$2(this, arguments, void 0, function* (callback, weight = 1, priority = 0) {
        const [value, release] = yield this.acquire(weight, priority);
        try {
          return yield callback(value);
        } finally {
          release();
        }
      });
    }
    waitForUnlock(weight = 1, priority = 0) {
      if (weight <= 0)
        throw new Error(`invalid weight ${weight}: must be positive`);
      if (this._couldLockImmediately(weight, priority)) {
        return Promise.resolve();
      } else {
        return new Promise((resolve) => {
          if (!this._weightedWaiters[weight - 1])
            this._weightedWaiters[weight - 1] = [];
          insertSorted(this._weightedWaiters[weight - 1], { resolve, priority });
        });
      }
    }
    isLocked() {
      return this._value <= 0;
    }
    getValue() {
      return this._value;
    }
    setValue(value) {
      this._value = value;
      this._dispatchQueue();
    }
    release(weight = 1) {
      if (weight <= 0)
        throw new Error(`invalid weight ${weight}: must be positive`);
      this._value += weight;
      this._dispatchQueue();
    }
    cancel() {
      this._queue.forEach((entry) => entry.reject(this._cancelError));
      this._queue = [];
    }
    _dispatchQueue() {
      this._drainUnlockWaiters();
      while (this._queue.length > 0 && this._queue[0].weight <= this._value) {
        this._dispatchItem(this._queue.shift());
        this._drainUnlockWaiters();
      }
    }
    _dispatchItem(item) {
      const previousValue = this._value;
      this._value -= item.weight;
      item.resolve([previousValue, this._newReleaser(item.weight)]);
    }
    _newReleaser(weight) {
      let called = false;
      return () => {
        if (called)
          return;
        called = true;
        this.release(weight);
      };
    }
    _drainUnlockWaiters() {
      if (this._queue.length === 0) {
        for (let weight = this._value; weight > 0; weight--) {
          const waiters = this._weightedWaiters[weight - 1];
          if (!waiters)
            continue;
          waiters.forEach((waiter) => waiter.resolve());
          this._weightedWaiters[weight - 1] = [];
        }
      } else {
        const queuedPriority = this._queue[0].priority;
        for (let weight = this._value; weight > 0; weight--) {
          const waiters = this._weightedWaiters[weight - 1];
          if (!waiters)
            continue;
          const i = waiters.findIndex((waiter) => waiter.priority <= queuedPriority);
          (i === -1 ? waiters : waiters.splice(0, i)).forEach((waiter) => waiter.resolve());
        }
      }
    }
    _couldLockImmediately(weight, priority) {
      return (this._queue.length === 0 || this._queue[0].priority < priority) && weight <= this._value;
    }
  }
  function insertSorted(a, v) {
    const i = findIndexFromEnd(a, (other) => v.priority <= other.priority);
    a.splice(i + 1, 0, v);
  }
  function findIndexFromEnd(a, predicate) {
    for (let i = a.length - 1; i >= 0; i--) {
      if (predicate(a[i])) {
        return i;
      }
    }
    return -1;
  }
  var __awaiter$1 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result2) {
        result2.done ? resolve(result2.value) : adopt(result2.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  class Mutex {
    constructor(cancelError) {
      this._semaphore = new Semaphore(1, cancelError);
    }
    acquire() {
      return __awaiter$1(this, arguments, void 0, function* (priority = 0) {
        const [, releaser] = yield this._semaphore.acquire(1, priority);
        return releaser;
      });
    }
    runExclusive(callback, priority = 0) {
      return this._semaphore.runExclusive(() => callback(), 1, priority);
    }
    isLocked() {
      return this._semaphore.isLocked();
    }
    waitForUnlock(priority = 0) {
      return this._semaphore.waitForUnlock(1, priority);
    }
    release() {
      if (this._semaphore.isLocked())
        this._semaphore.release();
    }
    cancel() {
      return this._semaphore.cancel();
    }
  }
  const browser = (
    // @ts-expect-error
    ((_d = (_c = globalThis.browser) == null ? void 0 : _c.runtime) == null ? void 0 : _d.id) == null ? globalThis.chrome : (
      // @ts-expect-error
      globalThis.browser
    )
  );
  const storage = createStorage();
  function createStorage() {
    const drivers = {
      local: createDriver("local"),
      session: createDriver("session"),
      sync: createDriver("sync"),
      managed: createDriver("managed")
    };
    const getDriver = (area) => {
      const driver = drivers[area];
      if (driver == null) {
        const areaNames = Object.keys(drivers).join(", ");
        throw Error(`Invalid area "${area}". Options: ${areaNames}`);
      }
      return driver;
    };
    const resolveKey = (key) => {
      const deliminatorIndex = key.indexOf(":");
      const driverArea = key.substring(0, deliminatorIndex);
      const driverKey = key.substring(deliminatorIndex + 1);
      if (driverKey == null)
        throw Error(
          `Storage key should be in the form of "area:key", but received "${key}"`
        );
      return {
        driverArea,
        driverKey,
        driver: getDriver(driverArea)
      };
    };
    const getMetaKey = (key) => key + "$";
    const mergeMeta = (oldMeta, newMeta) => {
      const newFields = { ...oldMeta };
      Object.entries(newMeta).forEach(([key, value]) => {
        if (value == null)
          delete newFields[key];
        else
          newFields[key] = value;
      });
      return newFields;
    };
    const getValueOrFallback = (value, fallback) => value ?? fallback ?? null;
    const getMetaValue = (properties) => typeof properties === "object" && !Array.isArray(properties) ? properties : {};
    const getItem = async (driver, driverKey, opts) => {
      const res = await driver.getItem(driverKey);
      return getValueOrFallback(res, (opts == null ? void 0 : opts.fallback) ?? (opts == null ? void 0 : opts.defaultValue));
    };
    const getMeta = async (driver, driverKey) => {
      const metaKey = getMetaKey(driverKey);
      const res = await driver.getItem(metaKey);
      return getMetaValue(res);
    };
    const setItem = async (driver, driverKey, value) => {
      await driver.setItem(driverKey, value ?? null);
    };
    const setMeta = async (driver, driverKey, properties) => {
      const metaKey = getMetaKey(driverKey);
      const existingFields = getMetaValue(await driver.getItem(metaKey));
      await driver.setItem(metaKey, mergeMeta(existingFields, properties));
    };
    const removeItem = async (driver, driverKey, opts) => {
      await driver.removeItem(driverKey);
      if (opts == null ? void 0 : opts.removeMeta) {
        const metaKey = getMetaKey(driverKey);
        await driver.removeItem(metaKey);
      }
    };
    const removeMeta = async (driver, driverKey, properties) => {
      const metaKey = getMetaKey(driverKey);
      if (properties == null) {
        await driver.removeItem(metaKey);
      } else {
        const newFields = getMetaValue(await driver.getItem(metaKey));
        [properties].flat().forEach((field) => delete newFields[field]);
        await driver.setItem(metaKey, newFields);
      }
    };
    const watch = (driver, driverKey, cb) => {
      return driver.watch(driverKey, cb);
    };
    const storage2 = {
      getItem: async (key, opts) => {
        const { driver, driverKey } = resolveKey(key);
        return await getItem(driver, driverKey, opts);
      },
      getItems: async (keys) => {
        const areaToKeyMap = /* @__PURE__ */ new Map();
        const keyToOptsMap = /* @__PURE__ */ new Map();
        const orderedKeys = [];
        keys.forEach((key) => {
          let keyStr;
          let opts;
          if (typeof key === "string") {
            keyStr = key;
          } else if ("getValue" in key) {
            keyStr = key.key;
            opts = { fallback: key.fallback };
          } else {
            keyStr = key.key;
            opts = key.options;
          }
          orderedKeys.push(keyStr);
          const { driverArea, driverKey } = resolveKey(keyStr);
          const areaKeys = areaToKeyMap.get(driverArea) ?? [];
          areaToKeyMap.set(driverArea, areaKeys.concat(driverKey));
          keyToOptsMap.set(keyStr, opts);
        });
        const resultsMap = /* @__PURE__ */ new Map();
        await Promise.all(
          Array.from(areaToKeyMap.entries()).map(async ([driverArea, keys2]) => {
            const driverResults = await drivers[driverArea].getItems(keys2);
            driverResults.forEach((driverResult) => {
              const key = `${driverArea}:${driverResult.key}`;
              const opts = keyToOptsMap.get(key);
              const value = getValueOrFallback(
                driverResult.value,
                (opts == null ? void 0 : opts.fallback) ?? (opts == null ? void 0 : opts.defaultValue)
              );
              resultsMap.set(key, value);
            });
          })
        );
        return orderedKeys.map((key) => ({
          key,
          value: resultsMap.get(key)
        }));
      },
      getMeta: async (key) => {
        const { driver, driverKey } = resolveKey(key);
        return await getMeta(driver, driverKey);
      },
      getMetas: async (args) => {
        const keys = args.map((arg) => {
          const key = typeof arg === "string" ? arg : arg.key;
          const { driverArea, driverKey } = resolveKey(key);
          return {
            key,
            driverArea,
            driverKey,
            driverMetaKey: getMetaKey(driverKey)
          };
        });
        const areaToDriverMetaKeysMap = keys.reduce((map, key) => {
          var _a2;
          map[_a2 = key.driverArea] ?? (map[_a2] = []);
          map[key.driverArea].push(key);
          return map;
        }, {});
        const resultsMap = {};
        await Promise.all(
          Object.entries(areaToDriverMetaKeysMap).map(async ([area, keys2]) => {
            const areaRes = await browser.storage[area].get(
              keys2.map((key) => key.driverMetaKey)
            );
            keys2.forEach((key) => {
              resultsMap[key.key] = areaRes[key.driverMetaKey] ?? {};
            });
          })
        );
        return keys.map((key) => ({
          key: key.key,
          meta: resultsMap[key.key]
        }));
      },
      setItem: async (key, value) => {
        const { driver, driverKey } = resolveKey(key);
        await setItem(driver, driverKey, value);
      },
      setItems: async (items) => {
        const areaToKeyValueMap = {};
        items.forEach((item) => {
          const { driverArea, driverKey } = resolveKey(
            "key" in item ? item.key : item.item.key
          );
          areaToKeyValueMap[driverArea] ?? (areaToKeyValueMap[driverArea] = []);
          areaToKeyValueMap[driverArea].push({
            key: driverKey,
            value: item.value
          });
        });
        await Promise.all(
          Object.entries(areaToKeyValueMap).map(async ([driverArea, values]) => {
            const driver = getDriver(driverArea);
            await driver.setItems(values);
          })
        );
      },
      setMeta: async (key, properties) => {
        const { driver, driverKey } = resolveKey(key);
        await setMeta(driver, driverKey, properties);
      },
      setMetas: async (items) => {
        const areaToMetaUpdatesMap = {};
        items.forEach((item) => {
          const { driverArea, driverKey } = resolveKey(
            "key" in item ? item.key : item.item.key
          );
          areaToMetaUpdatesMap[driverArea] ?? (areaToMetaUpdatesMap[driverArea] = []);
          areaToMetaUpdatesMap[driverArea].push({
            key: driverKey,
            properties: item.meta
          });
        });
        await Promise.all(
          Object.entries(areaToMetaUpdatesMap).map(
            async ([storageArea, updates]) => {
              const driver = getDriver(storageArea);
              const metaKeys = updates.map(({ key }) => getMetaKey(key));
              console.log(storageArea, metaKeys);
              const existingMetas = await driver.getItems(metaKeys);
              const existingMetaMap = Object.fromEntries(
                existingMetas.map(({ key, value }) => [key, getMetaValue(value)])
              );
              const metaUpdates = updates.map(({ key, properties }) => {
                const metaKey = getMetaKey(key);
                return {
                  key: metaKey,
                  value: mergeMeta(existingMetaMap[metaKey] ?? {}, properties)
                };
              });
              await driver.setItems(metaUpdates);
            }
          )
        );
      },
      removeItem: async (key, opts) => {
        const { driver, driverKey } = resolveKey(key);
        await removeItem(driver, driverKey, opts);
      },
      removeItems: async (keys) => {
        const areaToKeysMap = {};
        keys.forEach((key) => {
          let keyStr;
          let opts;
          if (typeof key === "string") {
            keyStr = key;
          } else if ("getValue" in key) {
            keyStr = key.key;
          } else if ("item" in key) {
            keyStr = key.item.key;
            opts = key.options;
          } else {
            keyStr = key.key;
            opts = key.options;
          }
          const { driverArea, driverKey } = resolveKey(keyStr);
          areaToKeysMap[driverArea] ?? (areaToKeysMap[driverArea] = []);
          areaToKeysMap[driverArea].push(driverKey);
          if (opts == null ? void 0 : opts.removeMeta) {
            areaToKeysMap[driverArea].push(getMetaKey(driverKey));
          }
        });
        await Promise.all(
          Object.entries(areaToKeysMap).map(async ([driverArea, keys2]) => {
            const driver = getDriver(driverArea);
            await driver.removeItems(keys2);
          })
        );
      },
      clear: async (base) => {
        const driver = getDriver(base);
        await driver.clear();
      },
      removeMeta: async (key, properties) => {
        const { driver, driverKey } = resolveKey(key);
        await removeMeta(driver, driverKey, properties);
      },
      snapshot: async (base, opts) => {
        var _a2;
        const driver = getDriver(base);
        const data = await driver.snapshot();
        (_a2 = opts == null ? void 0 : opts.excludeKeys) == null ? void 0 : _a2.forEach((key) => {
          delete data[key];
          delete data[getMetaKey(key)];
        });
        return data;
      },
      restoreSnapshot: async (base, data) => {
        const driver = getDriver(base);
        await driver.restoreSnapshot(data);
      },
      watch: (key, cb) => {
        const { driver, driverKey } = resolveKey(key);
        return watch(driver, driverKey, cb);
      },
      unwatch() {
        Object.values(drivers).forEach((driver) => {
          driver.unwatch();
        });
      },
      defineItem: (key, opts) => {
        const { driver, driverKey } = resolveKey(key);
        const { version: targetVersion = 1, migrations = {} } = opts ?? {};
        if (targetVersion < 1) {
          throw Error(
            "Storage item version cannot be less than 1. Initial versions should be set to 1, not 0."
          );
        }
        const migrate = async () => {
          var _a2;
          const driverMetaKey = getMetaKey(driverKey);
          const [{ value }, { value: meta }] = await driver.getItems([
            driverKey,
            driverMetaKey
          ]);
          if (value == null)
            return;
          const currentVersion = (meta == null ? void 0 : meta.v) ?? 1;
          if (currentVersion > targetVersion) {
            throw Error(
              `Version downgrade detected (v${currentVersion} -> v${targetVersion}) for "${key}"`
            );
          }
          console.debug(
            `[@wxt-dev/storage] Running storage migration for ${key}: v${currentVersion} -> v${targetVersion}`
          );
          const migrationsToRun = Array.from(
            { length: targetVersion - currentVersion },
            (_, i) => currentVersion + i + 1
          );
          let migratedValue = value;
          for (const migrateToVersion of migrationsToRun) {
            try {
              migratedValue = await ((_a2 = migrations == null ? void 0 : migrations[migrateToVersion]) == null ? void 0 : _a2.call(migrations, migratedValue)) ?? migratedValue;
            } catch (err) {
              throw Error(`v${migrateToVersion} migration failed for "${key}"`, {
                cause: err
              });
            }
          }
          await driver.setItems([
            { key: driverKey, value: migratedValue },
            { key: driverMetaKey, value: { ...meta, v: targetVersion } }
          ]);
          console.debug(
            `[@wxt-dev/storage] Storage migration completed for ${key} v${targetVersion}`,
            { migratedValue }
          );
        };
        const migrationsDone = (opts == null ? void 0 : opts.migrations) == null ? Promise.resolve() : migrate().catch((err) => {
          console.error(
            `[@wxt-dev/storage] Migration failed for ${key}`,
            err
          );
        });
        const initMutex = new Mutex();
        const getFallback = () => (opts == null ? void 0 : opts.fallback) ?? (opts == null ? void 0 : opts.defaultValue) ?? null;
        const getOrInitValue = () => initMutex.runExclusive(async () => {
          const value = await driver.getItem(driverKey);
          if (value != null || (opts == null ? void 0 : opts.init) == null)
            return value;
          const newValue = await opts.init();
          await driver.setItem(driverKey, newValue);
          return newValue;
        });
        migrationsDone.then(getOrInitValue);
        return {
          key,
          get defaultValue() {
            return getFallback();
          },
          get fallback() {
            return getFallback();
          },
          getValue: async () => {
            await migrationsDone;
            if (opts == null ? void 0 : opts.init) {
              return await getOrInitValue();
            } else {
              return await getItem(driver, driverKey, opts);
            }
          },
          getMeta: async () => {
            await migrationsDone;
            return await getMeta(driver, driverKey);
          },
          setValue: async (value) => {
            await migrationsDone;
            return await setItem(driver, driverKey, value);
          },
          setMeta: async (properties) => {
            await migrationsDone;
            return await setMeta(driver, driverKey, properties);
          },
          removeValue: async (opts2) => {
            await migrationsDone;
            return await removeItem(driver, driverKey, opts2);
          },
          removeMeta: async (properties) => {
            await migrationsDone;
            return await removeMeta(driver, driverKey, properties);
          },
          watch: (cb) => watch(
            driver,
            driverKey,
            (newValue, oldValue) => cb(newValue ?? getFallback(), oldValue ?? getFallback())
          ),
          migrate
        };
      }
    };
    return storage2;
  }
  function createDriver(storageArea) {
    const getStorageArea = () => {
      if (browser.runtime == null) {
        throw Error(
          [
            "'wxt/storage' must be loaded in a web extension environment",
            "\n - If thrown during a build, see https://github.com/wxt-dev/wxt/issues/371",
            " - If thrown during tests, mock 'wxt/browser' correctly. See https://wxt.dev/guide/go-further/testing.html\n"
          ].join("\n")
        );
      }
      if (browser.storage == null) {
        throw Error(
          "You must add the 'storage' permission to your manifest to use 'wxt/storage'"
        );
      }
      const area = browser.storage[storageArea];
      if (area == null)
        throw Error(`"browser.storage.${storageArea}" is undefined`);
      return area;
    };
    const watchListeners = /* @__PURE__ */ new Set();
    return {
      getItem: async (key) => {
        const res = await getStorageArea().get(key);
        return res[key];
      },
      getItems: async (keys) => {
        const result2 = await getStorageArea().get(keys);
        return keys.map((key) => ({ key, value: result2[key] ?? null }));
      },
      setItem: async (key, value) => {
        if (value == null) {
          await getStorageArea().remove(key);
        } else {
          await getStorageArea().set({ [key]: value });
        }
      },
      setItems: async (values) => {
        const map = values.reduce(
          (map2, { key, value }) => {
            map2[key] = value;
            return map2;
          },
          {}
        );
        await getStorageArea().set(map);
      },
      removeItem: async (key) => {
        await getStorageArea().remove(key);
      },
      removeItems: async (keys) => {
        await getStorageArea().remove(keys);
      },
      clear: async () => {
        await getStorageArea().clear();
      },
      snapshot: async () => {
        return await getStorageArea().get();
      },
      restoreSnapshot: async (data) => {
        await getStorageArea().set(data);
      },
      watch(key, cb) {
        const listener = (changes) => {
          const change = changes[key];
          if (change == null)
            return;
          if (dequal(change.newValue, change.oldValue))
            return;
          cb(change.newValue ?? null, change.oldValue ?? null);
        };
        getStorageArea().onChanged.addListener(listener);
        watchListeners.add(listener);
        return () => {
          getStorageArea().onChanged.removeListener(listener);
          watchListeners.delete(listener);
        };
      },
      unwatch() {
        watchListeners.forEach((listener) => {
          getStorageArea().onChanged.removeListener(listener);
        });
        watchListeners.clear();
      }
    };
  }
  const definition = defineBackground(async () => {
    const data = await dataInit();
    if (data) await badgeState(data);
  });
  const badgeState = async (data) => {
    if (!data || data.updates.length === 0) throw new Error("data not defined or empty");
    const updatesData = data.updates;
    const badge = await storage.getItem("local:f95list_ext_badge") ?? [];
    let index = 0;
    updatesData == null ? void 0 : updatesData.every((updateData) => {
      if (badge[0] && updateData.date < badge[0].date) return false;
      index += updateData.names.length;
      return true;
    });
    badge.map((update) => {
      index -= update.names.length;
    });
    const definedAction = browser$1.browserAction ?? browser$1.action;
    definedAction.setBadgeText({ text: index === 0 ? null : index.toString() });
    definedAction.setBadgeBackgroundColor({ color: "#CC0000" });
  };
  const badgeReset = async (data) => {
    if (!data || data.updates.length === 0) throw new Error("data not defined or empty");
    try {
      const updates = [data.updates[0]];
      if (data.updates[0].date === data.updates[1].date) updates.push(data.updates[1]);
      await storage.setItem("local:f95list_ext_badge", updates);
      await badgeState(data);
    } catch (error) {
      console.error(error);
    }
  };
  let wait = false;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const dataInit = async () => {
    while (wait) {
      await sleep(1e3);
    }
    let data = await storage.getItem("local:f95list_ext_data");
    if (wait) return null;
    wait = true;
    const date = (/* @__PURE__ */ new Date()).getTime();
    const time = await storage.getItem("local:f95list_ext_time") ?? 0;
    if (data && date < time) {
      wait = false;
      return data;
    }
    data = await query();
    if (!data) throw new Error("data not found");
    await storage.setItem("local:f95list_ext_time", date + 1e3 * 60 * 60 * 2);
    await storage.setItem("local:f95list_ext_data", data);
    await badgeState(data);
    wait = false;
    return data;
  };
  browser$1.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.info(message);
    (async () => {
      const data = await dataInit();
      console.log("🚀 ~ data:", data);
      if (!data || typeof message !== "string") {
        console.error("data not found");
        return false;
      }
      switch (message) {
        case "f95list-script": {
          const integrate = await storage.getItem("local:f95list_ext_integrate");
          console.log("🚀 ~ integrate:", integrate);
          if (integrate === void 0) storage.setItem("local:f95list_ext_integrate", true);
          else if (!integrate) break;
          sendResponse(data.games);
          break;
        }
        case "f95list-ext":
          sendResponse(data);
          break;
        case "f95list-badge":
          await badgeReset(data);
          break;
        case (message.startsWith("f95list-integrate") ? message : "f95list-integrate"):
          await storage.setItem("local:f95list_ext_integrate", message.endsWith("true"));
          break;
      }
    })();
    return true;
  });
  const query = async () => {
    try {
      console.info("🚀 ~ query: ~ fetch");
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbybvrFy6B2L7rkLWJnrwRHhP0F6Sv0uk6V9zUTZibwEzUjKXf-abOK_N6jUhqFPs9US/exec"
      );
      const data = await response.json();
      if (!(data == null ? void 0 : data.data)) throw new Error("fetch not data");
      return data.data;
    } catch (error) {
      console.error(error);
      await storage.setItem("local:f95list_ext_time", 0);
      wait = false;
    }
  };
  background;
  function initPlugins() {
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  let ws;
  function getDevServerWebSocket() {
    if (ws == null) {
      const serverUrl = `${"ws:"}//${"localhost"}:${3e3}`;
      logger.debug("Connecting to dev server @", serverUrl);
      ws = new WebSocket(serverUrl, "vite-hmr");
      ws.addWxtEventListener = ws.addEventListener.bind(ws);
      ws.sendCustom = (event, payload) => ws == null ? void 0 : ws.send(JSON.stringify({ type: "custom", event, payload }));
      ws.addEventListener("open", () => {
        logger.debug("Connected to dev server");
      });
      ws.addEventListener("close", () => {
        logger.debug("Disconnected from dev server");
      });
      ws.addEventListener("error", (event) => {
        logger.error("Failed to connect to dev server", event);
      });
      ws.addEventListener("message", (e) => {
        try {
          const message = JSON.parse(e.data);
          if (message.type === "custom") {
            ws == null ? void 0 : ws.dispatchEvent(
              new CustomEvent(message.event, { detail: message.data })
            );
          }
        } catch (err) {
          logger.error("Failed to handle message", err);
        }
      });
    }
    return ws;
  }
  function keepServiceWorkerAlive() {
    setInterval(async () => {
      await browser$1.runtime.getPlatformInfo();
    }, 5e3);
  }
  function reloadContentScript(payload) {
    const manifest = browser$1.runtime.getManifest();
    if (manifest.manifest_version == 2) {
      void reloadContentScriptMv2();
    } else {
      void reloadContentScriptMv3(payload);
    }
  }
  async function reloadContentScriptMv3({
    registration,
    contentScript
  }) {
    if (registration === "runtime") {
      await reloadRuntimeContentScriptMv3(contentScript);
    } else {
      await reloadManifestContentScriptMv3(contentScript);
    }
  }
  async function reloadManifestContentScriptMv3(contentScript) {
    const id = `wxt:${contentScript.js[0]}`;
    logger.log("Reloading content script:", contentScript);
    const registered = await browser$1.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const existing = registered.find((cs) => cs.id === id);
    if (existing) {
      logger.debug("Updating content script", existing);
      await browser$1.scripting.updateContentScripts([{ ...contentScript, id }]);
    } else {
      logger.debug("Registering new content script...");
      await browser$1.scripting.registerContentScripts([{ ...contentScript, id }]);
    }
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadRuntimeContentScriptMv3(contentScript) {
    logger.log("Reloading content script:", contentScript);
    const registered = await browser$1.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const matches = registered.filter((cs) => {
      var _a2, _b2;
      const hasJs = (_a2 = contentScript.js) == null ? void 0 : _a2.find((js) => {
        var _a3;
        return (_a3 = cs.js) == null ? void 0 : _a3.includes(js);
      });
      const hasCss = (_b2 = contentScript.css) == null ? void 0 : _b2.find((css) => {
        var _a3;
        return (_a3 = cs.css) == null ? void 0 : _a3.includes(css);
      });
      return hasJs || hasCss;
    });
    if (matches.length === 0) {
      logger.log(
        "Content script is not registered yet, nothing to reload",
        contentScript
      );
      return;
    }
    await browser$1.scripting.updateContentScripts(matches);
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadTabsForContentScript(contentScript) {
    const allTabs = await browser$1.tabs.query({});
    const matchPatterns = contentScript.matches.map(
      (match) => new MatchPattern(match)
    );
    const matchingTabs = allTabs.filter((tab) => {
      const url = tab.url;
      if (!url)
        return false;
      return !!matchPatterns.find((pattern) => pattern.includes(url));
    });
    await Promise.all(
      matchingTabs.map(async (tab) => {
        try {
          await browser$1.tabs.reload(tab.id);
        } catch (err) {
          logger.warn("Failed to reload tab:", err);
        }
      })
    );
  }
  async function reloadContentScriptMv2(_payload) {
    throw Error("TODO: reloadContentScriptMv2");
  }
  {
    try {
      const ws2 = getDevServerWebSocket();
      ws2.addWxtEventListener("wxt:reload-extension", () => {
        browser$1.runtime.reload();
      });
      ws2.addWxtEventListener("wxt:reload-content-script", (event) => {
        reloadContentScript(event.detail);
      });
      if (true) {
        ws2.addEventListener(
          "open",
          () => ws2.sendCustom("wxt:background-initialized")
        );
        keepServiceWorkerAlive();
      }
    } catch (err) {
      logger.error("Failed to setup web socket connection with dev server", err);
    }
    browser$1.commands.onCommand.addListener((command) => {
      if (command === "wxt:reload-extension") {
        browser$1.runtime.reload();
      }
    });
  }
  let result;
  try {
    initPlugins();
    result = definition.main();
    if (result instanceof Promise) {
      console.warn(
        "The background's main() function return a promise, but it must be synchronous"
      );
    }
  } catch (err) {
    logger.error("The background crashed on startup!");
    throw err;
  }
  const result$1 = result;
  return result$1;
}();
background;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3NhbmRib3gvZGVmaW5lLWJhY2tncm91bmQubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0B3ZWJleHQtY29yZS9tYXRjaC1wYXR0ZXJucy9saWIvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvYnJvd3Nlci9jaHJvbWUubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2RlcXVhbC9saXRlL2luZGV4Lm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9hc3luYy1tdXRleC9pbmRleC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQHd4dC1kZXYvc3RvcmFnZS9kaXN0L2luZGV4Lm1qcyIsIi4uLy4uL3NyYy9lbnRyeXBvaW50cy9iYWNrZ3JvdW5kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVCYWNrZ3JvdW5kKGFyZykge1xuICBpZiAoYXJnID09IG51bGwgfHwgdHlwZW9mIGFyZyA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4geyBtYWluOiBhcmcgfTtcbiAgcmV0dXJuIGFyZztcbn1cbiIsIi8vIHNyYy9pbmRleC50c1xudmFyIF9NYXRjaFBhdHRlcm4gPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKG1hdGNoUGF0dGVybikge1xuICAgIGlmIChtYXRjaFBhdHRlcm4gPT09IFwiPGFsbF91cmxzPlwiKSB7XG4gICAgICB0aGlzLmlzQWxsVXJscyA9IHRydWU7XG4gICAgICB0aGlzLnByb3RvY29sTWF0Y2hlcyA9IFsuLi5fTWF0Y2hQYXR0ZXJuLlBST1RPQ09MU107XG4gICAgICB0aGlzLmhvc3RuYW1lTWF0Y2ggPSBcIipcIjtcbiAgICAgIHRoaXMucGF0aG5hbWVNYXRjaCA9IFwiKlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBncm91cHMgPSAvKC4qKTpcXC9cXC8oLio/KShcXC8uKikvLmV4ZWMobWF0Y2hQYXR0ZXJuKTtcbiAgICAgIGlmIChncm91cHMgPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBcIkluY29ycmVjdCBmb3JtYXRcIik7XG4gICAgICBjb25zdCBbXywgcHJvdG9jb2wsIGhvc3RuYW1lLCBwYXRobmFtZV0gPSBncm91cHM7XG4gICAgICB2YWxpZGF0ZVByb3RvY29sKG1hdGNoUGF0dGVybiwgcHJvdG9jb2wpO1xuICAgICAgdmFsaWRhdGVIb3N0bmFtZShtYXRjaFBhdHRlcm4sIGhvc3RuYW1lKTtcbiAgICAgIHZhbGlkYXRlUGF0aG5hbWUobWF0Y2hQYXR0ZXJuLCBwYXRobmFtZSk7XG4gICAgICB0aGlzLnByb3RvY29sTWF0Y2hlcyA9IHByb3RvY29sID09PSBcIipcIiA/IFtcImh0dHBcIiwgXCJodHRwc1wiXSA6IFtwcm90b2NvbF07XG4gICAgICB0aGlzLmhvc3RuYW1lTWF0Y2ggPSBob3N0bmFtZTtcbiAgICAgIHRoaXMucGF0aG5hbWVNYXRjaCA9IHBhdGhuYW1lO1xuICAgIH1cbiAgfVxuICBpbmNsdWRlcyh1cmwpIHtcbiAgICBpZiAodGhpcy5pc0FsbFVybHMpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBjb25zdCB1ID0gdHlwZW9mIHVybCA9PT0gXCJzdHJpbmdcIiA/IG5ldyBVUkwodXJsKSA6IHVybCBpbnN0YW5jZW9mIExvY2F0aW9uID8gbmV3IFVSTCh1cmwuaHJlZikgOiB1cmw7XG4gICAgcmV0dXJuICEhdGhpcy5wcm90b2NvbE1hdGNoZXMuZmluZCgocHJvdG9jb2wpID0+IHtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJodHRwXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzSHR0cE1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcImh0dHBzXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzSHR0cHNNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJmaWxlXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzRmlsZU1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcImZ0cFwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0Z0cE1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcInVyblwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc1Vybk1hdGNoKHUpO1xuICAgIH0pO1xuICB9XG4gIGlzSHR0cE1hdGNoKHVybCkge1xuICAgIHJldHVybiB1cmwucHJvdG9jb2wgPT09IFwiaHR0cDpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xuICB9XG4gIGlzSHR0cHNNYXRjaCh1cmwpIHtcbiAgICByZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHBzOlwiICYmIHRoaXMuaXNIb3N0UGF0aE1hdGNoKHVybCk7XG4gIH1cbiAgaXNIb3N0UGF0aE1hdGNoKHVybCkge1xuICAgIGlmICghdGhpcy5ob3N0bmFtZU1hdGNoIHx8ICF0aGlzLnBhdGhuYW1lTWF0Y2gpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaG9zdG5hbWVNYXRjaFJlZ2V4cyA9IFtcbiAgICAgIHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMuaG9zdG5hbWVNYXRjaCksXG4gICAgICB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gucmVwbGFjZSgvXlxcKlxcLi8sIFwiXCIpKVxuICAgIF07XG4gICAgY29uc3QgcGF0aG5hbWVNYXRjaFJlZ2V4ID0gdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5wYXRobmFtZU1hdGNoKTtcbiAgICByZXR1cm4gISFob3N0bmFtZU1hdGNoUmVnZXhzLmZpbmQoKHJlZ2V4KSA9PiByZWdleC50ZXN0KHVybC5ob3N0bmFtZSkpICYmIHBhdGhuYW1lTWF0Y2hSZWdleC50ZXN0KHVybC5wYXRobmFtZSk7XG4gIH1cbiAgaXNGaWxlTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IGZpbGU6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuICB9XG4gIGlzRnRwTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IGZ0cDovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XG4gIH1cbiAgaXNVcm5NYXRjaCh1cmwpIHtcbiAgICB0aHJvdyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZDogdXJuOi8vIHBhdHRlcm4gbWF0Y2hpbmcuIE9wZW4gYSBQUiB0byBhZGQgc3VwcG9ydFwiKTtcbiAgfVxuICBjb252ZXJ0UGF0dGVyblRvUmVnZXgocGF0dGVybikge1xuICAgIGNvbnN0IGVzY2FwZWQgPSB0aGlzLmVzY2FwZUZvclJlZ2V4KHBhdHRlcm4pO1xuICAgIGNvbnN0IHN0YXJzUmVwbGFjZWQgPSBlc2NhcGVkLnJlcGxhY2UoL1xcXFxcXCovZywgXCIuKlwiKTtcbiAgICByZXR1cm4gUmVnRXhwKGBeJHtzdGFyc1JlcGxhY2VkfSRgKTtcbiAgfVxuICBlc2NhcGVGb3JSZWdleChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgfVxufTtcbnZhciBNYXRjaFBhdHRlcm4gPSBfTWF0Y2hQYXR0ZXJuO1xuTWF0Y2hQYXR0ZXJuLlBST1RPQ09MUyA9IFtcImh0dHBcIiwgXCJodHRwc1wiLCBcImZpbGVcIiwgXCJmdHBcIiwgXCJ1cm5cIl07XG52YXIgSW52YWxpZE1hdGNoUGF0dGVybiA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtYXRjaFBhdHRlcm4sIHJlYXNvbikge1xuICAgIHN1cGVyKGBJbnZhbGlkIG1hdGNoIHBhdHRlcm4gXCIke21hdGNoUGF0dGVybn1cIjogJHtyZWFzb259YCk7XG4gIH1cbn07XG5mdW5jdGlvbiB2YWxpZGF0ZVByb3RvY29sKG1hdGNoUGF0dGVybiwgcHJvdG9jb2wpIHtcbiAgaWYgKCFNYXRjaFBhdHRlcm4uUFJPVE9DT0xTLmluY2x1ZGVzKHByb3RvY29sKSAmJiBwcm90b2NvbCAhPT0gXCIqXCIpXG4gICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4oXG4gICAgICBtYXRjaFBhdHRlcm4sXG4gICAgICBgJHtwcm90b2NvbH0gbm90IGEgdmFsaWQgcHJvdG9jb2wgKCR7TWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5qb2luKFwiLCBcIil9KWBcbiAgICApO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVIb3N0bmFtZShtYXRjaFBhdHRlcm4sIGhvc3RuYW1lKSB7XG4gIGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIjpcIikpXG4gICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBgSG9zdG5hbWUgY2Fubm90IGluY2x1ZGUgYSBwb3J0YCk7XG4gIGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIipcIikgJiYgaG9zdG5hbWUubGVuZ3RoID4gMSAmJiAhaG9zdG5hbWUuc3RhcnRzV2l0aChcIiouXCIpKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKFxuICAgICAgbWF0Y2hQYXR0ZXJuLFxuICAgICAgYElmIHVzaW5nIGEgd2lsZGNhcmQgKCopLCBpdCBtdXN0IGdvIGF0IHRoZSBzdGFydCBvZiB0aGUgaG9zdG5hbWVgXG4gICAgKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlUGF0aG5hbWUobWF0Y2hQYXR0ZXJuLCBwYXRobmFtZSkge1xuICByZXR1cm47XG59XG5leHBvcnQge1xuICBJbnZhbGlkTWF0Y2hQYXR0ZXJuLFxuICBNYXRjaFBhdHRlcm5cbn07XG4iLCJleHBvcnQgY29uc3QgYnJvd3NlciA9IChcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBnbG9iYWxUaGlzLmJyb3dzZXI/LnJ1bnRpbWU/LmlkID09IG51bGwgPyBnbG9iYWxUaGlzLmNocm9tZSA6IChcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgZ2xvYmFsVGhpcy5icm93c2VyXG4gIClcbik7XG4iLCJ2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlcXVhbChmb28sIGJhcikge1xuXHR2YXIgY3RvciwgbGVuO1xuXHRpZiAoZm9vID09PSBiYXIpIHJldHVybiB0cnVlO1xuXG5cdGlmIChmb28gJiYgYmFyICYmIChjdG9yPWZvby5jb25zdHJ1Y3RvcikgPT09IGJhci5jb25zdHJ1Y3Rvcikge1xuXHRcdGlmIChjdG9yID09PSBEYXRlKSByZXR1cm4gZm9vLmdldFRpbWUoKSA9PT0gYmFyLmdldFRpbWUoKTtcblx0XHRpZiAoY3RvciA9PT0gUmVnRXhwKSByZXR1cm4gZm9vLnRvU3RyaW5nKCkgPT09IGJhci50b1N0cmluZygpO1xuXG5cdFx0aWYgKGN0b3IgPT09IEFycmF5KSB7XG5cdFx0XHRpZiAoKGxlbj1mb28ubGVuZ3RoKSA9PT0gYmFyLmxlbmd0aCkge1xuXHRcdFx0XHR3aGlsZSAobGVuLS0gJiYgZGVxdWFsKGZvb1tsZW5dLCBiYXJbbGVuXSkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGxlbiA9PT0gLTE7XG5cdFx0fVxuXG5cdFx0aWYgKCFjdG9yIHx8IHR5cGVvZiBmb28gPT09ICdvYmplY3QnKSB7XG5cdFx0XHRsZW4gPSAwO1xuXHRcdFx0Zm9yIChjdG9yIGluIGZvbykge1xuXHRcdFx0XHRpZiAoaGFzLmNhbGwoZm9vLCBjdG9yKSAmJiArK2xlbiAmJiAhaGFzLmNhbGwoYmFyLCBjdG9yKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZiAoIShjdG9yIGluIGJhcikgfHwgIWRlcXVhbChmb29bY3Rvcl0sIGJhcltjdG9yXSkpIHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBPYmplY3Qua2V5cyhiYXIpLmxlbmd0aCA9PT0gbGVuO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBmb28gIT09IGZvbyAmJiBiYXIgIT09IGJhcjtcbn1cbiIsImNvbnN0IEVfVElNRU9VVCA9IG5ldyBFcnJvcigndGltZW91dCB3aGlsZSB3YWl0aW5nIGZvciBtdXRleCB0byBiZWNvbWUgYXZhaWxhYmxlJyk7XG5jb25zdCBFX0FMUkVBRFlfTE9DS0VEID0gbmV3IEVycm9yKCdtdXRleCBhbHJlYWR5IGxvY2tlZCcpO1xuY29uc3QgRV9DQU5DRUxFRCA9IG5ldyBFcnJvcigncmVxdWVzdCBmb3IgbG9jayBjYW5jZWxlZCcpO1xuXG52YXIgX19hd2FpdGVyJDIgPSAodW5kZWZpbmVkICYmIHVuZGVmaW5lZC5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmNsYXNzIFNlbWFwaG9yZSB7XG4gICAgY29uc3RydWN0b3IoX3ZhbHVlLCBfY2FuY2VsRXJyb3IgPSBFX0NBTkNFTEVEKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gX3ZhbHVlO1xuICAgICAgICB0aGlzLl9jYW5jZWxFcnJvciA9IF9jYW5jZWxFcnJvcjtcbiAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzID0gW107XG4gICAgfVxuICAgIGFjcXVpcmUod2VpZ2h0ID0gMSwgcHJpb3JpdHkgPSAwKSB7XG4gICAgICAgIGlmICh3ZWlnaHQgPD0gMClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCB3ZWlnaHQgJHt3ZWlnaHR9OiBtdXN0IGJlIHBvc2l0aXZlYCk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0YXNrID0geyByZXNvbHZlLCByZWplY3QsIHdlaWdodCwgcHJpb3JpdHkgfTtcbiAgICAgICAgICAgIGNvbnN0IGkgPSBmaW5kSW5kZXhGcm9tRW5kKHRoaXMuX3F1ZXVlLCAob3RoZXIpID0+IHByaW9yaXR5IDw9IG90aGVyLnByaW9yaXR5KTtcbiAgICAgICAgICAgIGlmIChpID09PSAtMSAmJiB3ZWlnaHQgPD0gdGhpcy5fdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBOZWVkcyBpbW1lZGlhdGUgZGlzcGF0Y2gsIHNraXAgdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzcGF0Y2hJdGVtKHRhc2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcXVldWUuc3BsaWNlKGkgKyAxLCAwLCB0YXNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJ1bkV4Y2x1c2l2ZShjYWxsYmFja18xKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIkMih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qIChjYWxsYmFjaywgd2VpZ2h0ID0gMSwgcHJpb3JpdHkgPSAwKSB7XG4gICAgICAgICAgICBjb25zdCBbdmFsdWUsIHJlbGVhc2VdID0geWllbGQgdGhpcy5hY3F1aXJlKHdlaWdodCwgcHJpb3JpdHkpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQgY2FsbGJhY2sodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgcmVsZWFzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgd2FpdEZvclVubG9jayh3ZWlnaHQgPSAxLCBwcmlvcml0eSA9IDApIHtcbiAgICAgICAgaWYgKHdlaWdodCA8PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHdlaWdodCAke3dlaWdodH06IG11c3QgYmUgcG9zaXRpdmVgKTtcbiAgICAgICAgaWYgKHRoaXMuX2NvdWxkTG9ja0ltbWVkaWF0ZWx5KHdlaWdodCwgcHJpb3JpdHkpKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3dlaWdodGVkV2FpdGVyc1t3ZWlnaHQgLSAxXSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdID0gW107XG4gICAgICAgICAgICAgICAgaW5zZXJ0U29ydGVkKHRoaXMuX3dlaWdodGVkV2FpdGVyc1t3ZWlnaHQgLSAxXSwgeyByZXNvbHZlLCBwcmlvcml0eSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlzTG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWUgPD0gMDtcbiAgICB9XG4gICAgZ2V0VmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fZGlzcGF0Y2hRdWV1ZSgpO1xuICAgIH1cbiAgICByZWxlYXNlKHdlaWdodCA9IDEpIHtcbiAgICAgICAgaWYgKHdlaWdodCA8PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHdlaWdodCAke3dlaWdodH06IG11c3QgYmUgcG9zaXRpdmVgKTtcbiAgICAgICAgdGhpcy5fdmFsdWUgKz0gd2VpZ2h0O1xuICAgICAgICB0aGlzLl9kaXNwYXRjaFF1ZXVlKCk7XG4gICAgfVxuICAgIGNhbmNlbCgpIHtcbiAgICAgICAgdGhpcy5fcXVldWUuZm9yRWFjaCgoZW50cnkpID0+IGVudHJ5LnJlamVjdCh0aGlzLl9jYW5jZWxFcnJvcikpO1xuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICAgIH1cbiAgICBfZGlzcGF0Y2hRdWV1ZSgpIHtcbiAgICAgICAgdGhpcy5fZHJhaW5VbmxvY2tXYWl0ZXJzKCk7XG4gICAgICAgIHdoaWxlICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwICYmIHRoaXMuX3F1ZXVlWzBdLndlaWdodCA8PSB0aGlzLl92YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fZGlzcGF0Y2hJdGVtKHRoaXMuX3F1ZXVlLnNoaWZ0KCkpO1xuICAgICAgICAgICAgdGhpcy5fZHJhaW5VbmxvY2tXYWl0ZXJzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2Rpc3BhdGNoSXRlbShpdGVtKSB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzVmFsdWUgPSB0aGlzLl92YWx1ZTtcbiAgICAgICAgdGhpcy5fdmFsdWUgLT0gaXRlbS53ZWlnaHQ7XG4gICAgICAgIGl0ZW0ucmVzb2x2ZShbcHJldmlvdXNWYWx1ZSwgdGhpcy5fbmV3UmVsZWFzZXIoaXRlbS53ZWlnaHQpXSk7XG4gICAgfVxuICAgIF9uZXdSZWxlYXNlcih3ZWlnaHQpIHtcbiAgICAgICAgbGV0IGNhbGxlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNhbGxlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZWxlYXNlKHdlaWdodCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIF9kcmFpblVubG9ja1dhaXRlcnMoKSB7XG4gICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGZvciAobGV0IHdlaWdodCA9IHRoaXMuX3ZhbHVlOyB3ZWlnaHQgPiAwOyB3ZWlnaHQtLSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRlcnMgPSB0aGlzLl93ZWlnaHRlZFdhaXRlcnNbd2VpZ2h0IC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKCF3YWl0ZXJzKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB3YWl0ZXJzLmZvckVhY2goKHdhaXRlcikgPT4gd2FpdGVyLnJlc29sdmUoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBxdWV1ZWRQcmlvcml0eSA9IHRoaXMuX3F1ZXVlWzBdLnByaW9yaXR5O1xuICAgICAgICAgICAgZm9yIChsZXQgd2VpZ2h0ID0gdGhpcy5fdmFsdWU7IHdlaWdodCA+IDA7IHdlaWdodC0tKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FpdGVycyA9IHRoaXMuX3dlaWdodGVkV2FpdGVyc1t3ZWlnaHQgLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAoIXdhaXRlcnMpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGkgPSB3YWl0ZXJzLmZpbmRJbmRleCgod2FpdGVyKSA9PiB3YWl0ZXIucHJpb3JpdHkgPD0gcXVldWVkUHJpb3JpdHkpO1xuICAgICAgICAgICAgICAgIChpID09PSAtMSA/IHdhaXRlcnMgOiB3YWl0ZXJzLnNwbGljZSgwLCBpKSlcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKHdhaXRlciA9PiB3YWl0ZXIucmVzb2x2ZSgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2NvdWxkTG9ja0ltbWVkaWF0ZWx5KHdlaWdodCwgcHJpb3JpdHkpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9xdWV1ZS5sZW5ndGggPT09IDAgfHwgdGhpcy5fcXVldWVbMF0ucHJpb3JpdHkgPCBwcmlvcml0eSkgJiZcbiAgICAgICAgICAgIHdlaWdodCA8PSB0aGlzLl92YWx1ZTtcbiAgICB9XG59XG5mdW5jdGlvbiBpbnNlcnRTb3J0ZWQoYSwgdikge1xuICAgIGNvbnN0IGkgPSBmaW5kSW5kZXhGcm9tRW5kKGEsIChvdGhlcikgPT4gdi5wcmlvcml0eSA8PSBvdGhlci5wcmlvcml0eSk7XG4gICAgYS5zcGxpY2UoaSArIDEsIDAsIHYpO1xufVxuZnVuY3Rpb24gZmluZEluZGV4RnJvbUVuZChhLCBwcmVkaWNhdGUpIHtcbiAgICBmb3IgKGxldCBpID0gYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAocHJlZGljYXRlKGFbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5cbnZhciBfX2F3YWl0ZXIkMSA9ICh1bmRlZmluZWQgJiYgdW5kZWZpbmVkLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuY2xhc3MgTXV0ZXgge1xuICAgIGNvbnN0cnVjdG9yKGNhbmNlbEVycm9yKSB7XG4gICAgICAgIHRoaXMuX3NlbWFwaG9yZSA9IG5ldyBTZW1hcGhvcmUoMSwgY2FuY2VsRXJyb3IpO1xuICAgIH1cbiAgICBhY3F1aXJlKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyJDEodGhpcywgYXJndW1lbnRzLCB2b2lkIDAsIGZ1bmN0aW9uKiAocHJpb3JpdHkgPSAwKSB7XG4gICAgICAgICAgICBjb25zdCBbLCByZWxlYXNlcl0gPSB5aWVsZCB0aGlzLl9zZW1hcGhvcmUuYWNxdWlyZSgxLCBwcmlvcml0eSk7XG4gICAgICAgICAgICByZXR1cm4gcmVsZWFzZXI7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBydW5FeGNsdXNpdmUoY2FsbGJhY2ssIHByaW9yaXR5ID0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VtYXBob3JlLnJ1bkV4Y2x1c2l2ZSgoKSA9PiBjYWxsYmFjaygpLCAxLCBwcmlvcml0eSk7XG4gICAgfVxuICAgIGlzTG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VtYXBob3JlLmlzTG9ja2VkKCk7XG4gICAgfVxuICAgIHdhaXRGb3JVbmxvY2socHJpb3JpdHkgPSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW1hcGhvcmUud2FpdEZvclVubG9jaygxLCBwcmlvcml0eSk7XG4gICAgfVxuICAgIHJlbGVhc2UoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZW1hcGhvcmUuaXNMb2NrZWQoKSlcbiAgICAgICAgICAgIHRoaXMuX3NlbWFwaG9yZS5yZWxlYXNlKCk7XG4gICAgfVxuICAgIGNhbmNlbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbWFwaG9yZS5jYW5jZWwoKTtcbiAgICB9XG59XG5cbnZhciBfX2F3YWl0ZXIgPSAodW5kZWZpbmVkICYmIHVuZGVmaW5lZC5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmZ1bmN0aW9uIHdpdGhUaW1lb3V0KHN5bmMsIHRpbWVvdXQsIHRpbWVvdXRFcnJvciA9IEVfVElNRU9VVCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFjcXVpcmU6ICh3ZWlnaHRPclByaW9yaXR5LCBwcmlvcml0eSkgPT4ge1xuICAgICAgICAgICAgbGV0IHdlaWdodDtcbiAgICAgICAgICAgIGlmIChpc1NlbWFwaG9yZShzeW5jKSkge1xuICAgICAgICAgICAgICAgIHdlaWdodCA9IHdlaWdodE9yUHJpb3JpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB3ZWlnaHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgcHJpb3JpdHkgPSB3ZWlnaHRPclByaW9yaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHdlaWdodCAhPT0gdW5kZWZpbmVkICYmIHdlaWdodCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHdlaWdodCAke3dlaWdodH06IG11c3QgYmUgcG9zaXRpdmVgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlzVGltZW91dCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpc1RpbWVvdXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QodGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aWNrZXQgPSB5aWVsZCAoaXNTZW1hcGhvcmUoc3luYylcbiAgICAgICAgICAgICAgICAgICAgICAgID8gc3luYy5hY3F1aXJlKHdlaWdodCwgcHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHN5bmMuYWNxdWlyZShwcmlvcml0eSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWxlYXNlID0gQXJyYXkuaXNBcnJheSh0aWNrZXQpID8gdGlja2V0WzFdIDogdGlja2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRpY2tldCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1RpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChoYW5kbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LFxuICAgICAgICBydW5FeGNsdXNpdmUoY2FsbGJhY2ssIHdlaWdodCwgcHJpb3JpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlbGVhc2UgPSAoKSA9PiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGlja2V0ID0geWllbGQgdGhpcy5hY3F1aXJlKHdlaWdodCwgcHJpb3JpdHkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aWNrZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlID0gdGlja2V0WzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkIGNhbGxiYWNrKHRpY2tldFswXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlID0gdGlja2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbGVhc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVsZWFzZSh3ZWlnaHQpIHtcbiAgICAgICAgICAgIHN5bmMucmVsZWFzZSh3ZWlnaHQpO1xuICAgICAgICB9LFxuICAgICAgICBjYW5jZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gc3luYy5jYW5jZWwoKTtcbiAgICAgICAgfSxcbiAgICAgICAgd2FpdEZvclVubG9jazogKHdlaWdodE9yUHJpb3JpdHksIHByaW9yaXR5KSA9PiB7XG4gICAgICAgICAgICBsZXQgd2VpZ2h0O1xuICAgICAgICAgICAgaWYgKGlzU2VtYXBob3JlKHN5bmMpKSB7XG4gICAgICAgICAgICAgICAgd2VpZ2h0ID0gd2VpZ2h0T3JQcmlvcml0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHdlaWdodCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBwcmlvcml0eSA9IHdlaWdodE9yUHJpb3JpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAod2VpZ2h0ICE9PSB1bmRlZmluZWQgJiYgd2VpZ2h0IDw9IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgd2VpZ2h0ICR7d2VpZ2h0fTogbXVzdCBiZSBwb3NpdGl2ZWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHJlamVjdCh0aW1lb3V0RXJyb3IpLCB0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICAoaXNTZW1hcGhvcmUoc3luYylcbiAgICAgICAgICAgICAgICAgICAgPyBzeW5jLndhaXRGb3JVbmxvY2sod2VpZ2h0LCBwcmlvcml0eSlcbiAgICAgICAgICAgICAgICAgICAgOiBzeW5jLndhaXRGb3JVbmxvY2socHJpb3JpdHkpKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBpc0xvY2tlZDogKCkgPT4gc3luYy5pc0xvY2tlZCgpLFxuICAgICAgICBnZXRWYWx1ZTogKCkgPT4gc3luYy5nZXRWYWx1ZSgpLFxuICAgICAgICBzZXRWYWx1ZTogKHZhbHVlKSA9PiBzeW5jLnNldFZhbHVlKHZhbHVlKSxcbiAgICB9O1xufVxuZnVuY3Rpb24gaXNTZW1hcGhvcmUoc3luYykge1xuICAgIHJldHVybiBzeW5jLmdldFZhbHVlICE9PSB1bmRlZmluZWQ7XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGlzbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1vZHVsZS1ib3VuZGFyeS10eXBlc1xuZnVuY3Rpb24gdHJ5QWNxdWlyZShzeW5jLCBhbHJlYWR5QWNxdWlyZWRFcnJvciA9IEVfQUxSRUFEWV9MT0NLRUQpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIHJldHVybiB3aXRoVGltZW91dChzeW5jLCAwLCBhbHJlYWR5QWNxdWlyZWRFcnJvcik7XG59XG5cbmV4cG9ydCB7IEVfQUxSRUFEWV9MT0NLRUQsIEVfQ0FOQ0VMRUQsIEVfVElNRU9VVCwgTXV0ZXgsIFNlbWFwaG9yZSwgdHJ5QWNxdWlyZSwgd2l0aFRpbWVvdXQgfTtcbiIsImltcG9ydCB7IGRlcXVhbCB9IGZyb20gJ2RlcXVhbC9saXRlJztcbmltcG9ydCB7IE11dGV4IH0gZnJvbSAnYXN5bmMtbXV0ZXgnO1xuXG5jb25zdCBicm93c2VyID0gKFxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGdsb2JhbFRoaXMuYnJvd3Nlcj8ucnVudGltZT8uaWQgPT0gbnVsbCA/IGdsb2JhbFRoaXMuY2hyb21lIDogKFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBnbG9iYWxUaGlzLmJyb3dzZXJcbiAgKVxuKTtcbmNvbnN0IHN0b3JhZ2UgPSBjcmVhdGVTdG9yYWdlKCk7XG5mdW5jdGlvbiBjcmVhdGVTdG9yYWdlKCkge1xuICBjb25zdCBkcml2ZXJzID0ge1xuICAgIGxvY2FsOiBjcmVhdGVEcml2ZXIoXCJsb2NhbFwiKSxcbiAgICBzZXNzaW9uOiBjcmVhdGVEcml2ZXIoXCJzZXNzaW9uXCIpLFxuICAgIHN5bmM6IGNyZWF0ZURyaXZlcihcInN5bmNcIiksXG4gICAgbWFuYWdlZDogY3JlYXRlRHJpdmVyKFwibWFuYWdlZFwiKVxuICB9O1xuICBjb25zdCBnZXREcml2ZXIgPSAoYXJlYSkgPT4ge1xuICAgIGNvbnN0IGRyaXZlciA9IGRyaXZlcnNbYXJlYV07XG4gICAgaWYgKGRyaXZlciA9PSBudWxsKSB7XG4gICAgICBjb25zdCBhcmVhTmFtZXMgPSBPYmplY3Qua2V5cyhkcml2ZXJzKS5qb2luKFwiLCBcIik7XG4gICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBhcmVhIFwiJHthcmVhfVwiLiBPcHRpb25zOiAke2FyZWFOYW1lc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIGRyaXZlcjtcbiAgfTtcbiAgY29uc3QgcmVzb2x2ZUtleSA9IChrZXkpID0+IHtcbiAgICBjb25zdCBkZWxpbWluYXRvckluZGV4ID0ga2V5LmluZGV4T2YoXCI6XCIpO1xuICAgIGNvbnN0IGRyaXZlckFyZWEgPSBrZXkuc3Vic3RyaW5nKDAsIGRlbGltaW5hdG9ySW5kZXgpO1xuICAgIGNvbnN0IGRyaXZlcktleSA9IGtleS5zdWJzdHJpbmcoZGVsaW1pbmF0b3JJbmRleCArIDEpO1xuICAgIGlmIChkcml2ZXJLZXkgPT0gbnVsbClcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBgU3RvcmFnZSBrZXkgc2hvdWxkIGJlIGluIHRoZSBmb3JtIG9mIFwiYXJlYTprZXlcIiwgYnV0IHJlY2VpdmVkIFwiJHtrZXl9XCJgXG4gICAgICApO1xuICAgIHJldHVybiB7XG4gICAgICBkcml2ZXJBcmVhLFxuICAgICAgZHJpdmVyS2V5LFxuICAgICAgZHJpdmVyOiBnZXREcml2ZXIoZHJpdmVyQXJlYSlcbiAgICB9O1xuICB9O1xuICBjb25zdCBnZXRNZXRhS2V5ID0gKGtleSkgPT4ga2V5ICsgXCIkXCI7XG4gIGNvbnN0IG1lcmdlTWV0YSA9IChvbGRNZXRhLCBuZXdNZXRhKSA9PiB7XG4gICAgY29uc3QgbmV3RmllbGRzID0geyAuLi5vbGRNZXRhIH07XG4gICAgT2JqZWN0LmVudHJpZXMobmV3TWV0YSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgZGVsZXRlIG5ld0ZpZWxkc1trZXldO1xuICAgICAgZWxzZVxuICAgICAgICBuZXdGaWVsZHNba2V5XSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXdGaWVsZHM7XG4gIH07XG4gIGNvbnN0IGdldFZhbHVlT3JGYWxsYmFjayA9ICh2YWx1ZSwgZmFsbGJhY2spID0+IHZhbHVlID8/IGZhbGxiYWNrID8/IG51bGw7XG4gIGNvbnN0IGdldE1ldGFWYWx1ZSA9IChwcm9wZXJ0aWVzKSA9PiB0eXBlb2YgcHJvcGVydGllcyA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzKSA/IHByb3BlcnRpZXMgOiB7fTtcbiAgY29uc3QgZ2V0SXRlbSA9IGFzeW5jIChkcml2ZXIsIGRyaXZlcktleSwgb3B0cykgPT4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGRyaXZlci5nZXRJdGVtKGRyaXZlcktleSk7XG4gICAgcmV0dXJuIGdldFZhbHVlT3JGYWxsYmFjayhyZXMsIG9wdHM/LmZhbGxiYWNrID8/IG9wdHM/LmRlZmF1bHRWYWx1ZSk7XG4gIH07XG4gIGNvbnN0IGdldE1ldGEgPSBhc3luYyAoZHJpdmVyLCBkcml2ZXJLZXkpID0+IHtcbiAgICBjb25zdCBtZXRhS2V5ID0gZ2V0TWV0YUtleShkcml2ZXJLZXkpO1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGRyaXZlci5nZXRJdGVtKG1ldGFLZXkpO1xuICAgIHJldHVybiBnZXRNZXRhVmFsdWUocmVzKTtcbiAgfTtcbiAgY29uc3Qgc2V0SXRlbSA9IGFzeW5jIChkcml2ZXIsIGRyaXZlcktleSwgdmFsdWUpID0+IHtcbiAgICBhd2FpdCBkcml2ZXIuc2V0SXRlbShkcml2ZXJLZXksIHZhbHVlID8/IG51bGwpO1xuICB9O1xuICBjb25zdCBzZXRNZXRhID0gYXN5bmMgKGRyaXZlciwgZHJpdmVyS2V5LCBwcm9wZXJ0aWVzKSA9PiB7XG4gICAgY29uc3QgbWV0YUtleSA9IGdldE1ldGFLZXkoZHJpdmVyS2V5KTtcbiAgICBjb25zdCBleGlzdGluZ0ZpZWxkcyA9IGdldE1ldGFWYWx1ZShhd2FpdCBkcml2ZXIuZ2V0SXRlbShtZXRhS2V5KSk7XG4gICAgYXdhaXQgZHJpdmVyLnNldEl0ZW0obWV0YUtleSwgbWVyZ2VNZXRhKGV4aXN0aW5nRmllbGRzLCBwcm9wZXJ0aWVzKSk7XG4gIH07XG4gIGNvbnN0IHJlbW92ZUl0ZW0gPSBhc3luYyAoZHJpdmVyLCBkcml2ZXJLZXksIG9wdHMpID0+IHtcbiAgICBhd2FpdCBkcml2ZXIucmVtb3ZlSXRlbShkcml2ZXJLZXkpO1xuICAgIGlmIChvcHRzPy5yZW1vdmVNZXRhKSB7XG4gICAgICBjb25zdCBtZXRhS2V5ID0gZ2V0TWV0YUtleShkcml2ZXJLZXkpO1xuICAgICAgYXdhaXQgZHJpdmVyLnJlbW92ZUl0ZW0obWV0YUtleSk7XG4gICAgfVxuICB9O1xuICBjb25zdCByZW1vdmVNZXRhID0gYXN5bmMgKGRyaXZlciwgZHJpdmVyS2V5LCBwcm9wZXJ0aWVzKSA9PiB7XG4gICAgY29uc3QgbWV0YUtleSA9IGdldE1ldGFLZXkoZHJpdmVyS2V5KTtcbiAgICBpZiAocHJvcGVydGllcyA9PSBudWxsKSB7XG4gICAgICBhd2FpdCBkcml2ZXIucmVtb3ZlSXRlbShtZXRhS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbmV3RmllbGRzID0gZ2V0TWV0YVZhbHVlKGF3YWl0IGRyaXZlci5nZXRJdGVtKG1ldGFLZXkpKTtcbiAgICAgIFtwcm9wZXJ0aWVzXS5mbGF0KCkuZm9yRWFjaCgoZmllbGQpID0+IGRlbGV0ZSBuZXdGaWVsZHNbZmllbGRdKTtcbiAgICAgIGF3YWl0IGRyaXZlci5zZXRJdGVtKG1ldGFLZXksIG5ld0ZpZWxkcyk7XG4gICAgfVxuICB9O1xuICBjb25zdCB3YXRjaCA9IChkcml2ZXIsIGRyaXZlcktleSwgY2IpID0+IHtcbiAgICByZXR1cm4gZHJpdmVyLndhdGNoKGRyaXZlcktleSwgY2IpO1xuICB9O1xuICBjb25zdCBzdG9yYWdlMiA9IHtcbiAgICBnZXRJdGVtOiBhc3luYyAoa2V5LCBvcHRzKSA9PiB7XG4gICAgICBjb25zdCB7IGRyaXZlciwgZHJpdmVyS2V5IH0gPSByZXNvbHZlS2V5KGtleSk7XG4gICAgICByZXR1cm4gYXdhaXQgZ2V0SXRlbShkcml2ZXIsIGRyaXZlcktleSwgb3B0cyk7XG4gICAgfSxcbiAgICBnZXRJdGVtczogYXN5bmMgKGtleXMpID0+IHtcbiAgICAgIGNvbnN0IGFyZWFUb0tleU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgICBjb25zdCBrZXlUb09wdHNNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgY29uc3Qgb3JkZXJlZEtleXMgPSBbXTtcbiAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGxldCBrZXlTdHI7XG4gICAgICAgIGxldCBvcHRzO1xuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGtleVN0ciA9IGtleTtcbiAgICAgICAgfSBlbHNlIGlmIChcImdldFZhbHVlXCIgaW4ga2V5KSB7XG4gICAgICAgICAga2V5U3RyID0ga2V5LmtleTtcbiAgICAgICAgICBvcHRzID0geyBmYWxsYmFjazoga2V5LmZhbGxiYWNrIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAga2V5U3RyID0ga2V5LmtleTtcbiAgICAgICAgICBvcHRzID0ga2V5Lm9wdGlvbnM7XG4gICAgICAgIH1cbiAgICAgICAgb3JkZXJlZEtleXMucHVzaChrZXlTdHIpO1xuICAgICAgICBjb25zdCB7IGRyaXZlckFyZWEsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXlTdHIpO1xuICAgICAgICBjb25zdCBhcmVhS2V5cyA9IGFyZWFUb0tleU1hcC5nZXQoZHJpdmVyQXJlYSkgPz8gW107XG4gICAgICAgIGFyZWFUb0tleU1hcC5zZXQoZHJpdmVyQXJlYSwgYXJlYUtleXMuY29uY2F0KGRyaXZlcktleSkpO1xuICAgICAgICBrZXlUb09wdHNNYXAuc2V0KGtleVN0ciwgb3B0cyk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJlc3VsdHNNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIEFycmF5LmZyb20oYXJlYVRvS2V5TWFwLmVudHJpZXMoKSkubWFwKGFzeW5jIChbZHJpdmVyQXJlYSwga2V5czJdKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJpdmVyUmVzdWx0cyA9IGF3YWl0IGRyaXZlcnNbZHJpdmVyQXJlYV0uZ2V0SXRlbXMoa2V5czIpO1xuICAgICAgICAgIGRyaXZlclJlc3VsdHMuZm9yRWFjaCgoZHJpdmVyUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtkcml2ZXJBcmVhfToke2RyaXZlclJlc3VsdC5rZXl9YDtcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSBrZXlUb09wdHNNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFZhbHVlT3JGYWxsYmFjayhcbiAgICAgICAgICAgICAgZHJpdmVyUmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICBvcHRzPy5mYWxsYmFjayA/PyBvcHRzPy5kZWZhdWx0VmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXN1bHRzTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICByZXR1cm4gb3JkZXJlZEtleXMubWFwKChrZXkpID0+ICh7XG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWU6IHJlc3VsdHNNYXAuZ2V0KGtleSlcbiAgICAgIH0pKTtcbiAgICB9LFxuICAgIGdldE1ldGE6IGFzeW5jIChrZXkpID0+IHtcbiAgICAgIGNvbnN0IHsgZHJpdmVyLCBkcml2ZXJLZXkgfSA9IHJlc29sdmVLZXkoa2V5KTtcbiAgICAgIHJldHVybiBhd2FpdCBnZXRNZXRhKGRyaXZlciwgZHJpdmVyS2V5KTtcbiAgICB9LFxuICAgIGdldE1ldGFzOiBhc3luYyAoYXJncykgPT4ge1xuICAgICAgY29uc3Qga2V5cyA9IGFyZ3MubWFwKChhcmcpID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gdHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIiA/IGFyZyA6IGFyZy5rZXk7XG4gICAgICAgIGNvbnN0IHsgZHJpdmVyQXJlYSwgZHJpdmVyS2V5IH0gPSByZXNvbHZlS2V5KGtleSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAga2V5LFxuICAgICAgICAgIGRyaXZlckFyZWEsXG4gICAgICAgICAgZHJpdmVyS2V5LFxuICAgICAgICAgIGRyaXZlck1ldGFLZXk6IGdldE1ldGFLZXkoZHJpdmVyS2V5KVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBjb25zdCBhcmVhVG9Ecml2ZXJNZXRhS2V5c01hcCA9IGtleXMucmVkdWNlKChtYXAsIGtleSkgPT4ge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIG1hcFtfYSA9IGtleS5kcml2ZXJBcmVhXSA/PyAobWFwW19hXSA9IFtdKTtcbiAgICAgICAgbWFwW2tleS5kcml2ZXJBcmVhXS5wdXNoKGtleSk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgICB9LCB7fSk7XG4gICAgICBjb25zdCByZXN1bHRzTWFwID0ge307XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYXJlYVRvRHJpdmVyTWV0YUtleXNNYXApLm1hcChhc3luYyAoW2FyZWEsIGtleXMyXSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGFyZWFSZXMgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2VbYXJlYV0uZ2V0KFxuICAgICAgICAgICAga2V5czIubWFwKChrZXkpID0+IGtleS5kcml2ZXJNZXRhS2V5KVxuICAgICAgICAgICk7XG4gICAgICAgICAga2V5czIuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXN1bHRzTWFwW2tleS5rZXldID0gYXJlYVJlc1trZXkuZHJpdmVyTWV0YUtleV0gPz8ge307XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgcmV0dXJuIGtleXMubWFwKChrZXkpID0+ICh7XG4gICAgICAgIGtleToga2V5LmtleSxcbiAgICAgICAgbWV0YTogcmVzdWx0c01hcFtrZXkua2V5XVxuICAgICAgfSkpO1xuICAgIH0sXG4gICAgc2V0SXRlbTogYXN5bmMgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgIGNvbnN0IHsgZHJpdmVyLCBkcml2ZXJLZXkgfSA9IHJlc29sdmVLZXkoa2V5KTtcbiAgICAgIGF3YWl0IHNldEl0ZW0oZHJpdmVyLCBkcml2ZXJLZXksIHZhbHVlKTtcbiAgICB9LFxuICAgIHNldEl0ZW1zOiBhc3luYyAoaXRlbXMpID0+IHtcbiAgICAgIGNvbnN0IGFyZWFUb0tleVZhbHVlTWFwID0ge307XG4gICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgZHJpdmVyQXJlYSwgZHJpdmVyS2V5IH0gPSByZXNvbHZlS2V5KFxuICAgICAgICAgIFwia2V5XCIgaW4gaXRlbSA/IGl0ZW0ua2V5IDogaXRlbS5pdGVtLmtleVxuICAgICAgICApO1xuICAgICAgICBhcmVhVG9LZXlWYWx1ZU1hcFtkcml2ZXJBcmVhXSA/PyAoYXJlYVRvS2V5VmFsdWVNYXBbZHJpdmVyQXJlYV0gPSBbXSk7XG4gICAgICAgIGFyZWFUb0tleVZhbHVlTWFwW2RyaXZlckFyZWFdLnB1c2goe1xuICAgICAgICAgIGtleTogZHJpdmVyS2V5LFxuICAgICAgICAgIHZhbHVlOiBpdGVtLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYXJlYVRvS2V5VmFsdWVNYXApLm1hcChhc3luYyAoW2RyaXZlckFyZWEsIHZhbHVlc10pID0+IHtcbiAgICAgICAgICBjb25zdCBkcml2ZXIgPSBnZXREcml2ZXIoZHJpdmVyQXJlYSk7XG4gICAgICAgICAgYXdhaXQgZHJpdmVyLnNldEl0ZW1zKHZhbHVlcyk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0sXG4gICAgc2V0TWV0YTogYXN5bmMgKGtleSwgcHJvcGVydGllcykgPT4ge1xuICAgICAgY29uc3QgeyBkcml2ZXIsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXkpO1xuICAgICAgYXdhaXQgc2V0TWV0YShkcml2ZXIsIGRyaXZlcktleSwgcHJvcGVydGllcyk7XG4gICAgfSxcbiAgICBzZXRNZXRhczogYXN5bmMgKGl0ZW1zKSA9PiB7XG4gICAgICBjb25zdCBhcmVhVG9NZXRhVXBkYXRlc01hcCA9IHt9O1xuICAgICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCB7IGRyaXZlckFyZWEsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShcbiAgICAgICAgICBcImtleVwiIGluIGl0ZW0gPyBpdGVtLmtleSA6IGl0ZW0uaXRlbS5rZXlcbiAgICAgICAgKTtcbiAgICAgICAgYXJlYVRvTWV0YVVwZGF0ZXNNYXBbZHJpdmVyQXJlYV0gPz8gKGFyZWFUb01ldGFVcGRhdGVzTWFwW2RyaXZlckFyZWFdID0gW10pO1xuICAgICAgICBhcmVhVG9NZXRhVXBkYXRlc01hcFtkcml2ZXJBcmVhXS5wdXNoKHtcbiAgICAgICAgICBrZXk6IGRyaXZlcktleSxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiBpdGVtLm1ldGFcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICBPYmplY3QuZW50cmllcyhhcmVhVG9NZXRhVXBkYXRlc01hcCkubWFwKFxuICAgICAgICAgIGFzeW5jIChbc3RvcmFnZUFyZWEsIHVwZGF0ZXNdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkcml2ZXIgPSBnZXREcml2ZXIoc3RvcmFnZUFyZWEpO1xuICAgICAgICAgICAgY29uc3QgbWV0YUtleXMgPSB1cGRhdGVzLm1hcCgoeyBrZXkgfSkgPT4gZ2V0TWV0YUtleShrZXkpKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0b3JhZ2VBcmVhLCBtZXRhS2V5cyk7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ01ldGFzID0gYXdhaXQgZHJpdmVyLmdldEl0ZW1zKG1ldGFLZXlzKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nTWV0YU1hcCA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgZXhpc3RpbmdNZXRhcy5tYXAoKHsga2V5LCB2YWx1ZSB9KSA9PiBba2V5LCBnZXRNZXRhVmFsdWUodmFsdWUpXSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBtZXRhVXBkYXRlcyA9IHVwZGF0ZXMubWFwKCh7IGtleSwgcHJvcGVydGllcyB9KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG1ldGFLZXkgPSBnZXRNZXRhS2V5KGtleSk7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBtZXRhS2V5LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBtZXJnZU1ldGEoZXhpc3RpbmdNZXRhTWFwW21ldGFLZXldID8/IHt9LCBwcm9wZXJ0aWVzKVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCBkcml2ZXIuc2V0SXRlbXMobWV0YVVwZGF0ZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuICAgIHJlbW92ZUl0ZW06IGFzeW5jIChrZXksIG9wdHMpID0+IHtcbiAgICAgIGNvbnN0IHsgZHJpdmVyLCBkcml2ZXJLZXkgfSA9IHJlc29sdmVLZXkoa2V5KTtcbiAgICAgIGF3YWl0IHJlbW92ZUl0ZW0oZHJpdmVyLCBkcml2ZXJLZXksIG9wdHMpO1xuICAgIH0sXG4gICAgcmVtb3ZlSXRlbXM6IGFzeW5jIChrZXlzKSA9PiB7XG4gICAgICBjb25zdCBhcmVhVG9LZXlzTWFwID0ge307XG4gICAgICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBsZXQga2V5U3RyO1xuICAgICAgICBsZXQgb3B0cztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBrZXlTdHIgPSBrZXk7XG4gICAgICAgIH0gZWxzZSBpZiAoXCJnZXRWYWx1ZVwiIGluIGtleSkge1xuICAgICAgICAgIGtleVN0ciA9IGtleS5rZXk7XG4gICAgICAgIH0gZWxzZSBpZiAoXCJpdGVtXCIgaW4ga2V5KSB7XG4gICAgICAgICAga2V5U3RyID0ga2V5Lml0ZW0ua2V5O1xuICAgICAgICAgIG9wdHMgPSBrZXkub3B0aW9ucztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBrZXlTdHIgPSBrZXkua2V5O1xuICAgICAgICAgIG9wdHMgPSBrZXkub3B0aW9ucztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGRyaXZlckFyZWEsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXlTdHIpO1xuICAgICAgICBhcmVhVG9LZXlzTWFwW2RyaXZlckFyZWFdID8/IChhcmVhVG9LZXlzTWFwW2RyaXZlckFyZWFdID0gW10pO1xuICAgICAgICBhcmVhVG9LZXlzTWFwW2RyaXZlckFyZWFdLnB1c2goZHJpdmVyS2V5KTtcbiAgICAgICAgaWYgKG9wdHM/LnJlbW92ZU1ldGEpIHtcbiAgICAgICAgICBhcmVhVG9LZXlzTWFwW2RyaXZlckFyZWFdLnB1c2goZ2V0TWV0YUtleShkcml2ZXJLZXkpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYXJlYVRvS2V5c01hcCkubWFwKGFzeW5jIChbZHJpdmVyQXJlYSwga2V5czJdKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJpdmVyID0gZ2V0RHJpdmVyKGRyaXZlckFyZWEpO1xuICAgICAgICAgIGF3YWl0IGRyaXZlci5yZW1vdmVJdGVtcyhrZXlzMik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0sXG4gICAgY2xlYXI6IGFzeW5jIChiYXNlKSA9PiB7XG4gICAgICBjb25zdCBkcml2ZXIgPSBnZXREcml2ZXIoYmFzZSk7XG4gICAgICBhd2FpdCBkcml2ZXIuY2xlYXIoKTtcbiAgICB9LFxuICAgIHJlbW92ZU1ldGE6IGFzeW5jIChrZXksIHByb3BlcnRpZXMpID0+IHtcbiAgICAgIGNvbnN0IHsgZHJpdmVyLCBkcml2ZXJLZXkgfSA9IHJlc29sdmVLZXkoa2V5KTtcbiAgICAgIGF3YWl0IHJlbW92ZU1ldGEoZHJpdmVyLCBkcml2ZXJLZXksIHByb3BlcnRpZXMpO1xuICAgIH0sXG4gICAgc25hcHNob3Q6IGFzeW5jIChiYXNlLCBvcHRzKSA9PiB7XG4gICAgICBjb25zdCBkcml2ZXIgPSBnZXREcml2ZXIoYmFzZSk7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgZHJpdmVyLnNuYXBzaG90KCk7XG4gICAgICBvcHRzPy5leGNsdWRlS2V5cz8uZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGRlbGV0ZSBkYXRhW2tleV07XG4gICAgICAgIGRlbGV0ZSBkYXRhW2dldE1ldGFLZXkoa2V5KV07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG4gICAgcmVzdG9yZVNuYXBzaG90OiBhc3luYyAoYmFzZSwgZGF0YSkgPT4ge1xuICAgICAgY29uc3QgZHJpdmVyID0gZ2V0RHJpdmVyKGJhc2UpO1xuICAgICAgYXdhaXQgZHJpdmVyLnJlc3RvcmVTbmFwc2hvdChkYXRhKTtcbiAgICB9LFxuICAgIHdhdGNoOiAoa2V5LCBjYikgPT4ge1xuICAgICAgY29uc3QgeyBkcml2ZXIsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXkpO1xuICAgICAgcmV0dXJuIHdhdGNoKGRyaXZlciwgZHJpdmVyS2V5LCBjYik7XG4gICAgfSxcbiAgICB1bndhdGNoKCkge1xuICAgICAgT2JqZWN0LnZhbHVlcyhkcml2ZXJzKS5mb3JFYWNoKChkcml2ZXIpID0+IHtcbiAgICAgICAgZHJpdmVyLnVud2F0Y2goKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVmaW5lSXRlbTogKGtleSwgb3B0cykgPT4ge1xuICAgICAgY29uc3QgeyBkcml2ZXIsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXkpO1xuICAgICAgY29uc3QgeyB2ZXJzaW9uOiB0YXJnZXRWZXJzaW9uID0gMSwgbWlncmF0aW9ucyA9IHt9IH0gPSBvcHRzID8/IHt9O1xuICAgICAgaWYgKHRhcmdldFZlcnNpb24gPCAxKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIFwiU3RvcmFnZSBpdGVtIHZlcnNpb24gY2Fubm90IGJlIGxlc3MgdGhhbiAxLiBJbml0aWFsIHZlcnNpb25zIHNob3VsZCBiZSBzZXQgdG8gMSwgbm90IDAuXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1pZ3JhdGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRyaXZlck1ldGFLZXkgPSBnZXRNZXRhS2V5KGRyaXZlcktleSk7XG4gICAgICAgIGNvbnN0IFt7IHZhbHVlIH0sIHsgdmFsdWU6IG1ldGEgfV0gPSBhd2FpdCBkcml2ZXIuZ2V0SXRlbXMoW1xuICAgICAgICAgIGRyaXZlcktleSxcbiAgICAgICAgICBkcml2ZXJNZXRhS2V5XG4gICAgICAgIF0pO1xuICAgICAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWZXJzaW9uID0gbWV0YT8udiA/PyAxO1xuICAgICAgICBpZiAoY3VycmVudFZlcnNpb24gPiB0YXJnZXRWZXJzaW9uKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICBgVmVyc2lvbiBkb3duZ3JhZGUgZGV0ZWN0ZWQgKHYke2N1cnJlbnRWZXJzaW9ufSAtPiB2JHt0YXJnZXRWZXJzaW9ufSkgZm9yIFwiJHtrZXl9XCJgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmRlYnVnKFxuICAgICAgICAgIGBbQHd4dC1kZXYvc3RvcmFnZV0gUnVubmluZyBzdG9yYWdlIG1pZ3JhdGlvbiBmb3IgJHtrZXl9OiB2JHtjdXJyZW50VmVyc2lvbn0gLT4gdiR7dGFyZ2V0VmVyc2lvbn1gXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IG1pZ3JhdGlvbnNUb1J1biA9IEFycmF5LmZyb20oXG4gICAgICAgICAgeyBsZW5ndGg6IHRhcmdldFZlcnNpb24gLSBjdXJyZW50VmVyc2lvbiB9LFxuICAgICAgICAgIChfLCBpKSA9PiBjdXJyZW50VmVyc2lvbiArIGkgKyAxXG4gICAgICAgICk7XG4gICAgICAgIGxldCBtaWdyYXRlZFZhbHVlID0gdmFsdWU7XG4gICAgICAgIGZvciAoY29uc3QgbWlncmF0ZVRvVmVyc2lvbiBvZiBtaWdyYXRpb25zVG9SdW4pIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbWlncmF0ZWRWYWx1ZSA9IGF3YWl0IG1pZ3JhdGlvbnM/LlttaWdyYXRlVG9WZXJzaW9uXT8uKG1pZ3JhdGVkVmFsdWUpID8/IG1pZ3JhdGVkVmFsdWU7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihgdiR7bWlncmF0ZVRvVmVyc2lvbn0gbWlncmF0aW9uIGZhaWxlZCBmb3IgXCIke2tleX1cImAsIHtcbiAgICAgICAgICAgICAgY2F1c2U6IGVyclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGRyaXZlci5zZXRJdGVtcyhbXG4gICAgICAgICAgeyBrZXk6IGRyaXZlcktleSwgdmFsdWU6IG1pZ3JhdGVkVmFsdWUgfSxcbiAgICAgICAgICB7IGtleTogZHJpdmVyTWV0YUtleSwgdmFsdWU6IHsgLi4ubWV0YSwgdjogdGFyZ2V0VmVyc2lvbiB9IH1cbiAgICAgICAgXSk7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXG4gICAgICAgICAgYFtAd3h0LWRldi9zdG9yYWdlXSBTdG9yYWdlIG1pZ3JhdGlvbiBjb21wbGV0ZWQgZm9yICR7a2V5fSB2JHt0YXJnZXRWZXJzaW9ufWAsXG4gICAgICAgICAgeyBtaWdyYXRlZFZhbHVlIH1cbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBtaWdyYXRpb25zRG9uZSA9IG9wdHM/Lm1pZ3JhdGlvbnMgPT0gbnVsbCA/IFByb21pc2UucmVzb2x2ZSgpIDogbWlncmF0ZSgpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBgW0B3eHQtZGV2L3N0b3JhZ2VdIE1pZ3JhdGlvbiBmYWlsZWQgZm9yICR7a2V5fWAsXG4gICAgICAgICAgZXJyXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGluaXRNdXRleCA9IG5ldyBNdXRleCgpO1xuICAgICAgY29uc3QgZ2V0RmFsbGJhY2sgPSAoKSA9PiBvcHRzPy5mYWxsYmFjayA/PyBvcHRzPy5kZWZhdWx0VmFsdWUgPz8gbnVsbDtcbiAgICAgIGNvbnN0IGdldE9ySW5pdFZhbHVlID0gKCkgPT4gaW5pdE11dGV4LnJ1bkV4Y2x1c2l2ZShhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgZHJpdmVyLmdldEl0ZW0oZHJpdmVyS2V5KTtcbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwgfHwgb3B0cz8uaW5pdCA9PSBudWxsKVxuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBhd2FpdCBvcHRzLmluaXQoKTtcbiAgICAgICAgYXdhaXQgZHJpdmVyLnNldEl0ZW0oZHJpdmVyS2V5LCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICAgIH0pO1xuICAgICAgbWlncmF0aW9uc0RvbmUudGhlbihnZXRPckluaXRWYWx1ZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBrZXksXG4gICAgICAgIGdldCBkZWZhdWx0VmFsdWUoKSB7XG4gICAgICAgICAgcmV0dXJuIGdldEZhbGxiYWNrKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCBmYWxsYmFjaygpIHtcbiAgICAgICAgICByZXR1cm4gZ2V0RmFsbGJhY2soKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0VmFsdWU6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBtaWdyYXRpb25zRG9uZTtcbiAgICAgICAgICBpZiAob3B0cz8uaW5pdCkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGdldE9ySW5pdFZhbHVlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBnZXRJdGVtKGRyaXZlciwgZHJpdmVyS2V5LCBvcHRzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldE1ldGE6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBtaWdyYXRpb25zRG9uZTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0TWV0YShkcml2ZXIsIGRyaXZlcktleSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldFZhbHVlOiBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICBhd2FpdCBtaWdyYXRpb25zRG9uZTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgc2V0SXRlbShkcml2ZXIsIGRyaXZlcktleSwgdmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRNZXRhOiBhc3luYyAocHJvcGVydGllcykgPT4ge1xuICAgICAgICAgIGF3YWl0IG1pZ3JhdGlvbnNEb25lO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBzZXRNZXRhKGRyaXZlciwgZHJpdmVyS2V5LCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlVmFsdWU6IGFzeW5jIChvcHRzMikgPT4ge1xuICAgICAgICAgIGF3YWl0IG1pZ3JhdGlvbnNEb25lO1xuICAgICAgICAgIHJldHVybiBhd2FpdCByZW1vdmVJdGVtKGRyaXZlciwgZHJpdmVyS2V5LCBvcHRzMik7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZU1ldGE6IGFzeW5jIChwcm9wZXJ0aWVzKSA9PiB7XG4gICAgICAgICAgYXdhaXQgbWlncmF0aW9uc0RvbmU7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHJlbW92ZU1ldGEoZHJpdmVyLCBkcml2ZXJLZXksIHByb3BlcnRpZXMpO1xuICAgICAgICB9LFxuICAgICAgICB3YXRjaDogKGNiKSA9PiB3YXRjaChcbiAgICAgICAgICBkcml2ZXIsXG4gICAgICAgICAgZHJpdmVyS2V5LFxuICAgICAgICAgIChuZXdWYWx1ZSwgb2xkVmFsdWUpID0+IGNiKG5ld1ZhbHVlID8/IGdldEZhbGxiYWNrKCksIG9sZFZhbHVlID8/IGdldEZhbGxiYWNrKCkpXG4gICAgICAgICksXG4gICAgICAgIG1pZ3JhdGVcbiAgICAgIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gc3RvcmFnZTI7XG59XG5mdW5jdGlvbiBjcmVhdGVEcml2ZXIoc3RvcmFnZUFyZWEpIHtcbiAgY29uc3QgZ2V0U3RvcmFnZUFyZWEgPSAoKSA9PiB7XG4gICAgaWYgKGJyb3dzZXIucnVudGltZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgW1xuICAgICAgICAgIFwiJ3d4dC9zdG9yYWdlJyBtdXN0IGJlIGxvYWRlZCBpbiBhIHdlYiBleHRlbnNpb24gZW52aXJvbm1lbnRcIixcbiAgICAgICAgICBcIlxcbiAtIElmIHRocm93biBkdXJpbmcgYSBidWlsZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93eHQtZGV2L3d4dC9pc3N1ZXMvMzcxXCIsXG4gICAgICAgICAgXCIgLSBJZiB0aHJvd24gZHVyaW5nIHRlc3RzLCBtb2NrICd3eHQvYnJvd3NlcicgY29ycmVjdGx5LiBTZWUgaHR0cHM6Ly93eHQuZGV2L2d1aWRlL2dvLWZ1cnRoZXIvdGVzdGluZy5odG1sXFxuXCJcbiAgICAgICAgXS5qb2luKFwiXFxuXCIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoYnJvd3Nlci5zdG9yYWdlID09IG51bGwpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBcIllvdSBtdXN0IGFkZCB0aGUgJ3N0b3JhZ2UnIHBlcm1pc3Npb24gdG8geW91ciBtYW5pZmVzdCB0byB1c2UgJ3d4dC9zdG9yYWdlJ1wiXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBhcmVhID0gYnJvd3Nlci5zdG9yYWdlW3N0b3JhZ2VBcmVhXTtcbiAgICBpZiAoYXJlYSA9PSBudWxsKVxuICAgICAgdGhyb3cgRXJyb3IoYFwiYnJvd3Nlci5zdG9yYWdlLiR7c3RvcmFnZUFyZWF9XCIgaXMgdW5kZWZpbmVkYCk7XG4gICAgcmV0dXJuIGFyZWE7XG4gIH07XG4gIGNvbnN0IHdhdGNoTGlzdGVuZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgcmV0dXJuIHtcbiAgICBnZXRJdGVtOiBhc3luYyAoa2V5KSA9PiB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBnZXRTdG9yYWdlQXJlYSgpLmdldChrZXkpO1xuICAgICAgcmV0dXJuIHJlc1trZXldO1xuICAgIH0sXG4gICAgZ2V0SXRlbXM6IGFzeW5jIChrZXlzKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZXRTdG9yYWdlQXJlYSgpLmdldChrZXlzKTtcbiAgICAgIHJldHVybiBrZXlzLm1hcCgoa2V5KSA9PiAoeyBrZXksIHZhbHVlOiByZXN1bHRba2V5XSA/PyBudWxsIH0pKTtcbiAgICB9LFxuICAgIHNldEl0ZW06IGFzeW5jIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICBhd2FpdCBnZXRTdG9yYWdlQXJlYSgpLnJlbW92ZShrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgZ2V0U3RvcmFnZUFyZWEoKS5zZXQoeyBba2V5XTogdmFsdWUgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXRJdGVtczogYXN5bmMgKHZhbHVlcykgPT4ge1xuICAgICAgY29uc3QgbWFwID0gdmFsdWVzLnJlZHVjZShcbiAgICAgICAgKG1hcDIsIHsga2V5LCB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgbWFwMltrZXldID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIG1hcDI7XG4gICAgICAgIH0sXG4gICAgICAgIHt9XG4gICAgICApO1xuICAgICAgYXdhaXQgZ2V0U3RvcmFnZUFyZWEoKS5zZXQobWFwKTtcbiAgICB9LFxuICAgIHJlbW92ZUl0ZW06IGFzeW5jIChrZXkpID0+IHtcbiAgICAgIGF3YWl0IGdldFN0b3JhZ2VBcmVhKCkucmVtb3ZlKGtleSk7XG4gICAgfSxcbiAgICByZW1vdmVJdGVtczogYXN5bmMgKGtleXMpID0+IHtcbiAgICAgIGF3YWl0IGdldFN0b3JhZ2VBcmVhKCkucmVtb3ZlKGtleXMpO1xuICAgIH0sXG4gICAgY2xlYXI6IGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGdldFN0b3JhZ2VBcmVhKCkuY2xlYXIoKTtcbiAgICB9LFxuICAgIHNuYXBzaG90OiBhc3luYyAoKSA9PiB7XG4gICAgICByZXR1cm4gYXdhaXQgZ2V0U3RvcmFnZUFyZWEoKS5nZXQoKTtcbiAgICB9LFxuICAgIHJlc3RvcmVTbmFwc2hvdDogYXN5bmMgKGRhdGEpID0+IHtcbiAgICAgIGF3YWl0IGdldFN0b3JhZ2VBcmVhKCkuc2V0KGRhdGEpO1xuICAgIH0sXG4gICAgd2F0Y2goa2V5LCBjYikge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSAoY2hhbmdlcykgPT4ge1xuICAgICAgICBjb25zdCBjaGFuZ2UgPSBjaGFuZ2VzW2tleV07XG4gICAgICAgIGlmIChjaGFuZ2UgPT0gbnVsbClcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChkZXF1YWwoY2hhbmdlLm5ld1ZhbHVlLCBjaGFuZ2Uub2xkVmFsdWUpKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2IoY2hhbmdlLm5ld1ZhbHVlID8/IG51bGwsIGNoYW5nZS5vbGRWYWx1ZSA/PyBudWxsKTtcbiAgICAgIH07XG4gICAgICBnZXRTdG9yYWdlQXJlYSgpLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICB3YXRjaExpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZ2V0U3RvcmFnZUFyZWEoKS5vbkNoYW5nZWQucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICB3YXRjaExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIHVud2F0Y2goKSB7XG4gICAgICB3YXRjaExpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgICBnZXRTdG9yYWdlQXJlYSgpLm9uQ2hhbmdlZC5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICB9KTtcbiAgICAgIHdhdGNoTGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgfVxuICB9O1xufVxuY2xhc3MgTWlncmF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGtleSwgdmVyc2lvbiwgb3B0aW9ucykge1xuICAgIHN1cGVyKGB2JHt2ZXJzaW9ufSBtaWdyYXRpb24gZmFpbGVkIGZvciBcIiR7a2V5fVwiYCwgb3B0aW9ucyk7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvbjtcbiAgfVxufVxuXG5leHBvcnQgeyBNaWdyYXRpb25FcnJvciwgc3RvcmFnZSB9O1xuIiwiaW1wb3J0IHR5cGUgeyBHYW1lVHlwZSwgVXBkYXRlVHlwZSB9IGZyb20gJ0AvbGliL3NjaGVtYXMnO1xuaW1wb3J0IHsgc3RvcmFnZSB9IGZyb20gJ3d4dC9zdG9yYWdlJztcblxuLy8gYmlvbWUtaWdub3JlIGxpbnQvY29ycmVjdG5lc3Mvbm9VbmRlY2xhcmVkVmFyaWFibGVzOiBkZWZpbmUgZnVuY3Rpb25cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUJhY2tncm91bmQoYXN5bmMgKCkgPT4ge1xuICBjb25zdCBkYXRhID0gYXdhaXQgZGF0YUluaXQoKTtcblxuICBpZiAoZGF0YSkgYXdhaXQgYmFkZ2VTdGF0ZShkYXRhKTtcbn0pO1xuXG5pbnRlcmZhY2UgVXBkYXRlRGF0YSB7XG4gIGRhdGU6IFVwZGF0ZVR5cGVbJ2RhdGUnXTtcbiAgdHlwZTogVXBkYXRlVHlwZVsndHlwZSddO1xuICBuYW1lczogR2FtZVR5cGVbJ25hbWUnXVtdO1xufVxuXG5pbnRlcmZhY2UgRGF0YSB7XG4gIHVwZGF0ZXM6IFVwZGF0ZURhdGFbXTtcbiAgZ2FtZXM6IEdhbWVUeXBlW107XG59XG5cbmNvbnN0IGJhZGdlU3RhdGUgPSBhc3luYyAoZGF0YTogRGF0YSkgPT4ge1xuICBpZiAoIWRhdGEgfHwgZGF0YS51cGRhdGVzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdkYXRhIG5vdCBkZWZpbmVkIG9yIGVtcHR5Jyk7XG5cbiAgY29uc3QgdXBkYXRlc0RhdGEgPSBkYXRhLnVwZGF0ZXM7XG4gIGNvbnN0IGJhZGdlID0gKGF3YWl0IHN0b3JhZ2UuZ2V0SXRlbTxVcGRhdGVEYXRhW10+KCdsb2NhbDpmOTVsaXN0X2V4dF9iYWRnZScpKSA/PyBbXTtcblxuICBsZXQgaW5kZXggPSAwO1xuXG4gIHVwZGF0ZXNEYXRhPy5ldmVyeSgodXBkYXRlRGF0YTogVXBkYXRlRGF0YSkgPT4ge1xuICAgIGlmIChiYWRnZVswXSAmJiB1cGRhdGVEYXRhLmRhdGUgPCBiYWRnZVswXS5kYXRlKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpbmRleCArPSB1cGRhdGVEYXRhLm5hbWVzLmxlbmd0aDtcblxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcblxuICBiYWRnZS5tYXAoKHVwZGF0ZTogVXBkYXRlRGF0YSkgPT4ge1xuICAgIGluZGV4IC09IHVwZGF0ZS5uYW1lcy5sZW5ndGg7XG4gIH0pO1xuXG4gIGNvbnN0IGRlZmluZWRBY3Rpb24gPSBicm93c2VyLmJyb3dzZXJBY3Rpb24gPz8gYnJvd3Nlci5hY3Rpb247XG4gIGRlZmluZWRBY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogaW5kZXggPT09IDAgPyBudWxsIDogaW5kZXgudG9TdHJpbmcoKSB9KTtcbiAgZGVmaW5lZEFjdGlvbi5zZXRCYWRnZUJhY2tncm91bmRDb2xvcih7IGNvbG9yOiAnI0NDMDAwMCcgfSk7XG59O1xuXG5jb25zdCBiYWRnZVJlc2V0ID0gYXN5bmMgKGRhdGE6IERhdGEpID0+IHtcbiAgaWYgKCFkYXRhIHx8IGRhdGEudXBkYXRlcy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignZGF0YSBub3QgZGVmaW5lZCBvciBlbXB0eScpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgdXBkYXRlcyA9IFtkYXRhLnVwZGF0ZXNbMF1dO1xuXG4gICAgaWYgKGRhdGEudXBkYXRlc1swXS5kYXRlID09PSBkYXRhLnVwZGF0ZXNbMV0uZGF0ZSkgdXBkYXRlcy5wdXNoKGRhdGEudXBkYXRlc1sxXSk7XG5cbiAgICBhd2FpdCBzdG9yYWdlLnNldEl0ZW0oJ2xvY2FsOmY5NWxpc3RfZXh0X2JhZGdlJywgdXBkYXRlcyk7XG4gICAgYXdhaXQgYmFkZ2VTdGF0ZShkYXRhKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgfVxufTtcblxubGV0IHdhaXQgPSBmYWxzZTtcbmNvbnN0IHNsZWVwID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG5cbmNvbnN0IGRhdGFJbml0ID0gYXN5bmMgKCk6IFByb21pc2U8RGF0YSB8IG51bGw+ID0+IHtcbiAgd2hpbGUgKHdhaXQpIHtcbiAgICBhd2FpdCBzbGVlcCgxMDAwKTsgLy8gMSBzZWNvbmRcbiAgfVxuXG4gIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXRJdGVtPERhdGE+KCdsb2NhbDpmOTVsaXN0X2V4dF9kYXRhJyk7XG5cbiAgaWYgKHdhaXQpIHJldHVybiBudWxsO1xuICB3YWl0ID0gdHJ1ZTtcblxuICBjb25zdCBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIGNvbnN0IHRpbWUgPSAoYXdhaXQgc3RvcmFnZS5nZXRJdGVtPG51bWJlcj4oJ2xvY2FsOmY5NWxpc3RfZXh0X3RpbWUnKSkgPz8gMDtcblxuICBpZiAoZGF0YSAmJiBkYXRlIDwgdGltZSkge1xuICAgIHdhaXQgPSBmYWxzZTtcblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgZGF0YSA9IGF3YWl0IHF1ZXJ5KCk7XG5cbiAgaWYgKCFkYXRhKSB0aHJvdyBuZXcgRXJyb3IoJ2RhdGEgbm90IGZvdW5kJyk7XG5cbiAgYXdhaXQgc3RvcmFnZS5zZXRJdGVtKCdsb2NhbDpmOTVsaXN0X2V4dF90aW1lJywgZGF0ZSArIDEwMDAgKiA2MCAqIDYwICogMik7IC8vIDIgaG91cnNcbiAgYXdhaXQgc3RvcmFnZS5zZXRJdGVtKCdsb2NhbDpmOTVsaXN0X2V4dF9kYXRhJywgZGF0YSk7XG5cbiAgYXdhaXQgYmFkZ2VTdGF0ZShkYXRhKTtcblxuICB3YWl0ID0gZmFsc2U7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuXG5icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBfc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgY29uc29sZS5pbmZvKG1lc3NhZ2UpO1xuXG4gIChhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGRhdGFJbml0KCk7XG4gICAgY29uc29sZS5sb2coJ/CfmoAgfiBkYXRhOicsIGRhdGEpO1xuXG4gICAgaWYgKCFkYXRhIHx8IHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykge1xuICAgICAgY29uc29sZS5lcnJvcignZGF0YSBub3QgZm91bmQnKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN3aXRjaCAobWVzc2FnZSkge1xuICAgICAgY2FzZSAnZjk1bGlzdC1zY3JpcHQnOiB7XG4gICAgICAgIGNvbnN0IGludGVncmF0ZSA9IGF3YWl0IHN0b3JhZ2UuZ2V0SXRlbTxib29sZWFuPignbG9jYWw6Zjk1bGlzdF9leHRfaW50ZWdyYXRlJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5qAIH4gaW50ZWdyYXRlOicsIGludGVncmF0ZSk7XG5cbiAgICAgICAgaWYgKGludGVncmF0ZSA9PT0gdW5kZWZpbmVkKSBzdG9yYWdlLnNldEl0ZW0oJ2xvY2FsOmY5NWxpc3RfZXh0X2ludGVncmF0ZScsIHRydWUpO1xuICAgICAgICBlbHNlIGlmICghaW50ZWdyYXRlKSBicmVhaztcblxuICAgICAgICBzZW5kUmVzcG9uc2UoZGF0YS5nYW1lcyk7XG5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdmOTVsaXN0LWV4dCc6XG4gICAgICAgIHNlbmRSZXNwb25zZShkYXRhKTtcblxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Y5NWxpc3QtYmFkZ2UnOlxuICAgICAgICBhd2FpdCBiYWRnZVJlc2V0KGRhdGEpO1xuXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBtZXNzYWdlLnN0YXJ0c1dpdGgoJ2Y5NWxpc3QtaW50ZWdyYXRlJykgPyBtZXNzYWdlIDogJ2Y5NWxpc3QtaW50ZWdyYXRlJzpcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXRJdGVtKCdsb2NhbDpmOTVsaXN0X2V4dF9pbnRlZ3JhdGUnLCBtZXNzYWdlLmVuZHNXaXRoKCd0cnVlJykpO1xuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSkoKTtcblxuICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5jb25zdCBxdWVyeSA9IGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmluZm8oJ/CfmoAgfiBxdWVyeTogfiBmZXRjaCcpO1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcbiAgICAgICdodHRwczovL3NjcmlwdC5nb29nbGUuY29tL21hY3Jvcy9zL0FLZnljYnlidnJGeTZCMkw3cmtMV0pucndSSGhQMEY2U3YwdWs2Vjl6VVRaaWJ3RXpVaktYZi1hYk9LX042alVocUZQczlVUy9leGVjJyxcbiAgICApO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cbiAgICBpZiAoIWRhdGE/LmRhdGEpIHRocm93IG5ldyBFcnJvcignZmV0Y2ggbm90IGRhdGEnKTtcblxuICAgIHJldHVybiBkYXRhLmRhdGE7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnJvcik7XG5cbiAgICBhd2FpdCBzdG9yYWdlLnNldEl0ZW0oJ2xvY2FsOmY5NWxpc3RfZXh0X3RpbWUnLCAwKTtcblxuICAgIHdhaXQgPSBmYWxzZTtcbiAgfVxufTtcbiJdLCJuYW1lcyI6WyJicm93c2VyIiwicmVzdWx0IiwiX2EiXSwibWFwcGluZ3MiOiI7OztBQUFPLFdBQVMsaUJBQWlCLEtBQUs7QUFDcEMsUUFBSSxPQUFPLFFBQVEsT0FBTyxRQUFRLFdBQVksUUFBTyxFQUFFLE1BQU0sSUFBSztBQUNsRSxXQUFPO0FBQUEsRUFDVDtBQ0ZBLE1BQUksZ0JBQWdCLE1BQU07QUFBQSxJQUN4QixZQUFZLGNBQWM7QUFDeEIsVUFBSSxp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QUEsU0FBQSxTQUFBLGlCQUFBO0FBQ0UsWUFBQSxLQUFBLE9BQUE7QUFFQSxLQUFBLFlBQUE7QUFDRSxZQUFBLE9BQUEsTUFBQSxTQUFBO0FBQ0EsY0FBQSxJQUFBLGNBQUEsSUFBQTtBQUVBLFVBQUEsQ0FBQSxRQUFBLE9BQUEsWUFBQSxVQUFBO0FBQ0UsZ0JBQUEsTUFBQSxnQkFBQTtBQUVBLGVBQUE7QUFBQSxNQUFPO0FBR1QsY0FBQSxTQUFBO0FBQUEsUUFBaUIsS0FBQSxrQkFBQTtBQUViLGdCQUFBLFlBQUEsTUFBQSxRQUFBLFFBQUEsNkJBQUE7QUFDQSxrQkFBQSxJQUFBLG1CQUFBLFNBQUE7QUFFQSxjQUFBLGNBQUEsT0FBQSxTQUFBLFFBQUEsK0JBQUEsSUFBQTtBQUFBLG1CQUFnRixDQUFBLFVBQUE7QUFHaEYsdUJBQUEsS0FBQSxLQUFBO0FBRUE7QUFBQSxRQUFBO0FBQUEsUUFDRixLQUFBO0FBRUUsdUJBQUEsSUFBQTtBQUVBO0FBQUEsUUFBQSxLQUFBO0FBRUEsZ0JBQUEsV0FBQSxJQUFBO0FBRUE7QUFBQSxRQUFBLE1BQUEsUUFBQSxXQUFBLG1CQUFBLElBQUEsVUFBQTtBQUVBLGdCQUFBLFFBQUEsUUFBQSwrQkFBQSxRQUFBLFNBQUEsTUFBQSxDQUFBO0FBRUE7QUFBQSxNQUFBO0FBQUEsSUFDSixHQUFBO0FBR0YsV0FBQTtBQUFBLEVBQ0YsQ0FBQTtBQUVBLFFBQUEsUUFBQSxZQUFBO0FBQ0UsUUFBQTtBQUNFLGNBQUEsS0FBQSxxQkFBQTtBQUVBLFlBQUEsV0FBQSxNQUFBO0FBQUEsUUFBdUI7QUFBQSxNQUNyQjtBQUVGLFlBQUEsT0FBQSxNQUFBLFNBQUEsS0FBQTtBQUVBLFVBQUEsRUFBQSw2QkFBQSxNQUFBLE9BQUEsSUFBQSxNQUFBLGdCQUFBO0FBRUEsYUFBQSxLQUFBO0FBQUEsSUFBWSxTQUFBLE9BQUE7QUFFWixjQUFBLE1BQUEsS0FBQTtBQUVBLFlBQUEsUUFBQSxRQUFBLDBCQUFBLENBQUE7QUFFQSxhQUFBO0FBQUEsSUFBTztBQUFBLEVBRVg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiwzLDQsNV19
