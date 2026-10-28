// The one storage API every mini-app uses. Keep it backend-agnostic:
// today it is IndexedDB on the device; later a sync layer can sit behind it.

/** Every stored record carries these fields so a future sync can merge by id + updatedAt. */
export interface StoredRecord {
  id: string
  /** ms since epoch, set by the storage layer on every write */
  updatedAt: number
  /** soft delete (tombstone) so deletions can sync; list() hides these */
  deleted?: boolean
}

/** What a caller passes to put(): id optional (generated), updatedAt is managed. */
export type NewRecord<T extends StoredRecord> = Omit<T, 'id' | 'updatedAt' | 'deleted'> & { id?: string }

export interface Collection<T extends StoredRecord> {
  get(id: string): Promise<T | undefined>
  /** All live (non-deleted) records, in no particular order. */
  list(): Promise<T[]>
  /** Insert or replace. Returns the stored record with id and updatedAt filled in. */
  put(record: NewRecord<T>): Promise<T>
  delete(id: string): Promise<void>
}

export interface Storage {
  /**
   * A named collection owned by one mini-app, e.g. collection<Card>('flashcards', 'cards').
   * Collections are namespaced by appId so mini-apps never collide.
   */
  collection<T extends StoredRecord>(appId: string, name: string): Collection<T>
}
