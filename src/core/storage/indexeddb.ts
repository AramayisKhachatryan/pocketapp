// Minimal IndexedDB backend: one object store, records keyed by [scope, id]
// where scope = "<appId>/<collection>".
import type { Collection, NewRecord, Storage, StoredRecord } from './types'
import { newId } from './id'

const DB_NAME = 'hub'
const DB_VERSION = 1
const STORE = 'records'

interface Row {
  scope: string
  id: string
  value: StoredRecord
}

let dbPromise: Promise<IDBDatabase> | undefined

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, { keyPath: ['scope', 'id'] })
      store.createIndex('scope', 'scope')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return (await openDb()).transaction(STORE, mode).objectStore(STORE)
}

function collection<T extends StoredRecord>(appId: string, name: string): Collection<T> {
  const scope = `${appId}/${name}`

  async function write(value: T): Promise<T> {
    await request((await tx('readwrite')).put({ scope, id: value.id, value } satisfies Row))
    return value
  }

  return {
    async get(id) {
      const row = (await request((await tx('readonly')).get([scope, id]))) as Row | undefined
      return row && !row.value.deleted ? (row.value as T) : undefined
    },
    async list() {
      const rows = (await request((await tx('readonly')).index('scope').getAll(scope))) as Row[]
      return rows.map((r) => r.value as T).filter((v) => !v.deleted)
    },
    put(record: NewRecord<T>) {
      return write({ ...record, id: record.id ?? newId(), updatedAt: Date.now() } as unknown as T)
    },
    async delete(id) {
      const row = (await request((await tx('readonly')).get([scope, id]))) as Row | undefined
      if (row) await write({ ...(row.value as T), deleted: true, updatedAt: Date.now() })
    },
  }
}

export const indexedDbStorage: Storage = { collection }
