// Mini-apps import storage from here and nowhere else.
import { indexedDbStorage } from './indexeddb'

export type { Collection, NewRecord, Storage, StoredRecord } from './types'
export { newId } from './id'

export const storage = indexedDbStorage

/** Ask the browser not to evict our data under storage pressure. Best effort. */
export function requestPersistence(): void {
  navigator.storage?.persist?.().catch(() => {})
}
