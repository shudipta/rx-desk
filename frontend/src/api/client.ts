const API_BASE_URL = ''

const inflight = new Map<string, Promise<unknown>>()

export async function apiGet<T>(path: string): Promise<T> {
  const key = `GET ${path}`
  const existing = inflight.get(key)
  if (existing) return existing as Promise<T>
  const promise = fetch(`${API_BASE_URL}${path}`).then(async (response) => {
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return response.json()
  }).finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, promise)
  return promise
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
}
