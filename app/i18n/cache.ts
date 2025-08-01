/**
 * i18n Translation Caching Strategy
 *
 * Efficient in-memory caching for translations with intelligent
 * memory management and performance optimization.
 */

interface CacheEntry<T> {
  value: T
  timestamp: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  memoryUsage: number
  languages: string[]
}

class TranslationCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    memoryUsage: 0,
    languages: [],
  }

  // Cache configuration
  private readonly MAX_SIZE = 10 // Max languages to cache
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour

  constructor() {
    // Periodic cleanup in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL)
    }
  }

  /**
   * Get translation from cache
   */
  get(language: string): T | null {
    const entry = this.cache.get(language)

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(language)
      this.updateStats()
      this.stats.misses++
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()

    this.stats.hits++
    return entry.value
  }

  /**
   * Store translation in cache
   */
  set(language: string, value: T): void {
    // Enforce size limit with LRU eviction
    if (this.cache.size >= this.MAX_SIZE && !this.cache.has(language)) {
      this.evictLeastRecentlyUsed()
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    }

    this.cache.set(language, entry)
    this.updateStats()
  }

  /**
   * Check if translation is cached and valid
   */
  has(language: string): boolean {
    const entry = this.cache.get(language)
    if (!entry) return false

    // Check expiration
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(language)
      this.updateStats()
      return false
    }

    return true
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Get hit rate percentage
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  /**
   * Clear specific language or entire cache
   */
  clear(language?: string): void {
    if (language) {
      this.cache.delete(language)
    } else {
      this.cache.clear()
      this.stats = {
        hits: 0,
        misses: 0,
        size: 0,
        memoryUsage: 0,
        languages: [],
      }
    }
    this.updateStats()
  }

  /**
   * Preload translations for critical languages
   */
  async preload(
    languages: string[],
    loader: (lang: string) => Promise<T>
  ): Promise<void> {
    const promises = languages.map(async lang => {
      if (!this.has(lang)) {
        try {
          const translationData = await loader(lang)
          this.set(lang, translationData)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Failed to preload language ${lang}:`, error)
        }
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Private: Evict least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      // eslint-disable-next-line no-console
      console.log(`Evicted translation cache for language: ${oldestKey}`)
    }
  }

  /**
   * Private: Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const expired: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        expired.push(key)
      }
    }

    expired.forEach(key => this.cache.delete(key))

    if (expired.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`Cleaned up ${expired.length} expired translation cache entries`)
      this.updateStats()
    }
  }

  /**
   * Private: Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size
    this.stats.languages = Array.from(this.cache.keys())

    // Rough memory usage calculation
    this.stats.memoryUsage = JSON.stringify(
      Array.from(this.cache.values()).map(entry => entry.value)
    ).length
  }
}

// Singleton instance
export const translationCache = new TranslationCache<unknown>()

/**
 * Cached translation loader
 */
export async function loadTranslationCached<T>(
  language: string,
  loader: (lang: string) => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = translationCache.get(language)
  if (cached) {
    return cached as T
  }

  // Load and cache
  try {
    const translationData = await loader(language)
    translationCache.set(language, translationData)
    return translationData
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load translation for ${language}:`, error)
    throw error
  }
}

/**
 * Cache warming for critical languages
 */
export const warmCache = <T>(
  languages: string[],
  loader: (lang: string) => Promise<T>
): Promise<void> => translationCache.preload(languages, loader)

/**
 * Development utilities
 */
if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error - Global for debugging
  globalThis.__translationCache__ = {
    instance: translationCache,
    stats: () => translationCache.getStats(),
    hitRate: () => translationCache.getHitRate(),
    clear: (lang?: string) => translationCache.clear(lang),
  }
}
