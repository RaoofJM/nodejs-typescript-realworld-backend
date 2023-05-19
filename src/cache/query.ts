import cache from ".";
import { DynamicKeyType, Key } from "./keys";

export enum TYPES {
  LIST = "list",
  STRING = "string",
  HASH = "hash",
  ZSET = "zset",
  SET = "set",
}

export async function keyExists(...keys: string[]) {
  return (await cache.exists(keys)) ? true : false;
}

export async function setValue(
  key: Key | DynamicKeyType,
  value: string | number,
  expireAt?: number
) {
  const result = cache.set(key, `${value}`);
  if (expireAt) await expireInSeconds(key, expireAt);
  return result;
}

export async function getValue(key: Key | DynamicKeyType) {
  return cache.get(key);
}

export async function delByKey(key: Key | DynamicKeyType) {
  return cache.del(key);
}

export async function setJson(
  key: Key | DynamicKeyType,
  value: Record<string, unknown>,
  expireAt?: number
) {
  const json = JSON.stringify(value);
  const result = await setValue(key, json);
  if (expireAt) await expireInSeconds(key, expireAt);
  return result;
}

export async function getJson<T>(key: Key | DynamicKeyType) {
  const type = await cache.type(key);
  if (type !== TYPES.STRING) return null;

  const json = await getValue(key);
  if (json) return JSON.parse(json) as T;

  return null;
}

export async function setList(
  key: Key | DynamicKeyType,
  list: any[],
  expireAt: number
) {
  const multi = cache.multi();
  const values: any[] = [];
  for (const i in list) {
    values[i] = JSON.stringify(list[i]);
  }
  multi.del(key);
  multi.rPush(key, values);
  if (expireAt) multi.pExpireAt(key, 1000 * expireAt);
  return await multi.exec();
}

export async function addToList(key: Key | DynamicKeyType, value: any) {
  const type = await cache.type(key);
  if (type !== TYPES.LIST) return null;

  const item = JSON.stringify(value);
  return await cache.rPushX(key, item);
}

export async function getListRange<T>(
  key: Key | DynamicKeyType,
  start = 0,
  end = -1
) {
  const type = await cache.type(key);
  if (type !== TYPES.LIST) return null;

  const list = await cache.lRange(key, start, end);
  if (!list) return null;

  const data = list.map((entry) => JSON.parse(entry) as T);
  return data;
}

export async function watch(key: Key | DynamicKeyType) {
  return await cache.watch(key);
}

export async function unwatch() {
  return await cache.unwatch();
}

export async function expireInSeconds(
  key: Key | DynamicKeyType,
  seconds: number
) {
  return await cache.expire(key, seconds);
}

export async function expire(expireAt: Date, key: Key | DynamicKeyType) {
  return await cache.pExpireAt(key, expireAt.getTime());
}

export async function expireMany(expireAt: Date, ...keys: string[]) {
  let script = "";
  for (const key of keys) {
    script += `redis.call('pExpireAt', '${key}',${expireAt.getTime()})`;
  }
  return await cache.eval(script);
}
