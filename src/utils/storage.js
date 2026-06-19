/**
 * 本地存储工具函数
 */

const STORAGE_PREFIX = 'oms_'

/**
 * 设置存储项
 * @param {string} key - 键名
 * @param {any} value - 值
 */
export const setStorage = (key, value) => {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(STORAGE_PREFIX + key, serialized)
  } catch (error) {
    console.error('存储失败:', error)
  }
}

/**
 * 获取存储项
 * @param {string} key - 键名
 * @param {any} defaultValue - 默认值
 * @returns {any}
 */
export const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item)
  } catch (error) {
    console.error('读取存储失败:', error)
    return defaultValue
  }
}

/**
 * 检查存储项是否存在（即使值为 null/空数组/空对象也返回 true）
 * @param {string} key - 键名
 * @returns {boolean}
 */
export const hasStorage = (key) => {
  return localStorage.getItem(STORAGE_PREFIX + key) !== null
}

/**
 * 移除存储项
 * @param {string} key - 键名
 */
export const removeStorage = (key) => {
  localStorage.removeItem(STORAGE_PREFIX + key)
}

/**
 * 清除所有存储项
 */
export const clearStorage = () => {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))
}
