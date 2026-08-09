import type { AdminLog, Document, Profile, SchoolSetting, Student, UserRole } from "@/lib/types"
import type { AppUser } from "@/lib/auth/types"
import { getMockProfileByEmail, getMockUserByRole, mockDb, upsertMockProfile } from "./db"

type TableName = "profiles" | "students" | "documents" | "admin_logs" | "school_settings"
type Row = Profile | Student | Document | AdminLog | SchoolSetting

type Filter = { type: "eq" | "in"; column: string; value: unknown }
type Order = { column: string; ascending: boolean }

function asArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value]
}

function getTable(db: ReturnType<typeof mockDb>, table: TableName): Row[] {
  return db[table] as unknown as Row[]
}

function setTable(db: ReturnType<typeof mockDb>, table: TableName, rows: Row[]) {
  ;(db as any)[table] = rows
}

function applyFilters(rows: Row[], filters: Filter[]) {
  return rows.filter((row) => {
    return filters.every((f) => {
      const v = (row as any)[f.column]
      if (f.type === "eq") return v === f.value
      if (f.type === "in") return asArray(f.value).includes(v)
      return true
    })
  })
}

function applyOrder(rows: Row[], order?: Order) {
  if (!order) return rows
  const sorted = [...rows].sort((a: any, b: any) => {
    const av = a[order.column]
    const bv = b[order.column]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (av < bv) return -1
    if (av > bv) return 1
    return 0
  })
  return order.ascending ? sorted : sorted.reverse()
}

class MockQueryBuilder {
  private table: TableName
  private filters: Filter[] = []
  private orderBy?: Order
  private limitCount?: number
  private selectColumns: string | null = "*"
  private isSingle = false

  constructor(table: TableName) {
    this.table = table
  }

  select(columns: string = "*") {
    this.selectColumns = columns
    return this
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: "eq", column, value })
    return this
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ type: "in", column, value })
    return this
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: opts?.ascending ?? true }
    return this
  }

  limit(n: number) {
    this.limitCount = n
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  async then(resolve: any, reject: any) {
    try {
      const db = mockDb()
      let rows = getTable(db, this.table)
      rows = applyFilters(rows, this.filters)
      rows = applyOrder(rows, this.orderBy)
      if (this.limitCount != null) rows = rows.slice(0, this.limitCount)

      let data: any = rows
      if (this.isSingle) data = rows[0] ?? null
      resolve({ data, error: null, count: null })
    } catch (e) {
      reject(e)
    }
  }
}

class MockMutationBuilder {
  private table: TableName
  private mode: "insert" | "update" | "delete"
  private payload: any
  private filters: Filter[] = []
  private returning = false
  private isSingle = false

  constructor(table: TableName, mode: "insert" | "update" | "delete", payload?: any) {
    this.table = table
    this.mode = mode
    this.payload = payload
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: "eq", column, value })
    return this
  }

  select() {
    this.returning = true
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  async then(resolve: any, reject: any) {
    try {
      const db = mockDb()
      const rows = getTable(db, this.table)

      let resultRows: Row[] = []

      if (this.mode === "insert") {
        const inserted = asArray(this.payload).map((r) => r as Row)
        setTable(db, this.table, [...inserted, ...rows])
        resultRows = inserted
      } else if (this.mode === "update") {
        const updated = rows.map((r) => {
          const match = applyFilters([r], this.filters).length > 0
          if (!match) return r
          const next = { ...(r as any), ...(this.payload as any) }
          resultRows.push(next as Row)
          return next as Row
        })
        setTable(db, this.table, updated)
      } else if (this.mode === "delete") {
        const kept: Row[] = []
        rows.forEach((r) => {
          const match = applyFilters([r], this.filters).length > 0
          if (match) resultRows.push(r)
          else kept.push(r)
        })
        setTable(db, this.table, kept)
      }

      let data: any = this.returning ? resultRows : null
      if (this.isSingle) data = (this.returning ? resultRows[0] : null) ?? null
      resolve({ data, error: null })
    } catch (e) {
      reject(e)
    }
  }
}

function buildUserFromProfile(profile: Profile): AppUser {
  return {
    id: profile.id,
    email: profile.email,
  }
}

export type MockCookieAdapter = {
  get(name: string): string | undefined
  set(name: string, value: string): void
  remove(name: string): void
}

export function createMockClient(cookieAdapter: MockCookieAdapter) {
  const auth = {
    async getUser() {
      const uid = cookieAdapter.get("ppdb_mock_uid")
      if (!uid) return { data: { user: null as any }, error: null }
      const db = mockDb()
      const profile = db.profiles.find((p) => p.id === uid) || null
      return { data: { user: profile ? buildUserFromProfile(profile) : null }, error: null }
    },

    async signInWithPassword({ email }: { email: string; password: string }) {
      const profile = getMockProfileByEmail(email)
      if (!profile) {
        return { data: { user: null }, error: { message: "Invalid login credentials" } }
      }
      cookieAdapter.set("ppdb_mock_uid", profile.id)
      return { data: { user: buildUserFromProfile(profile) }, error: null }
    },

    async signUp({
      email,
      options,
    }: {
      email: string
      password: string
      options?: { data?: any }
    }) {
      const existing = getMockProfileByEmail(email)
      if (existing) {
        return { data: { user: null }, error: { message: "already registered" } }
      }
      const db = mockDb()
      const createdAt = new Date().toISOString()
      const id = `mock-${Math.random().toString(16).slice(2)}`
      const role: UserRole = options?.data?.role === "admin" || options?.data?.role === "superadmin" ? options.data.role : "siswa"
      const profile: Profile = {
        id,
        email,
        full_name: options?.data?.full_name ?? null,
        role,
        phone: options?.data?.phone ?? null,
        created_at: createdAt,
        updated_at: createdAt,
      }
      db.profiles.unshift(profile)
      upsertMockProfile(profile)
      cookieAdapter.set("ppdb_mock_uid", id)
      return { data: { user: buildUserFromProfile(profile) }, error: null }
    },

    async signOut() {
      cookieAdapter.remove("ppdb_mock_uid")
      return { error: null }
    },
  }

  function from(table: TableName) {
    return {
      select: (columns?: string) => new MockQueryBuilder(table).select(columns),
      insert: (payload: any) => new MockMutationBuilder(table, "insert", payload),
      update: (payload: any) => new MockMutationBuilder(table, "update", payload),
      delete: () => new MockMutationBuilder(table, "delete"),
    }
  }

  return { auth, from }
}

export function setMockRole(cookieAdapter: MockCookieAdapter, role: UserRole) {
  const p = getMockUserByRole(role)
  cookieAdapter.set("ppdb_mock_uid", p.id)
  return p
}
