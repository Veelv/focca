export interface ICache {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, expirationInSeconds?: number): Promise<void>;
  clear(): void;
}
