// store.js - localStorageの読み書きAPI

import { getDaysInMonth, getAllDayKeys } from './utils.js';

const DAY_PREFIX = 'medtracker_day_';
const SETTINGS_KEY = 'medtracker_settings';

/**
 * 空のDayRecordのデフォルト値を返す
 */
function defaultDayRecord(dateString) {
  return {
    date: dateString,
    medications: {
      morning: null,
      evening: null,
    },
    bloodPressure: null,   // { morning: {systolic,diastolic,pulse}|null, evening: ... }|null
    hospitalVisit: null,
  };
}

/**
 * 旧形式の bloodPressure（フラットな {systolic,diastolic,pulse}）を
 * 新形式（{morning,evening} の入れ子）にマイグレーションする
 */
function migrateBp(bp) {
  if (!bp) return null;
  // 新形式はそのまま返す
  if ('morning' in bp || 'evening' in bp) return bp;
  // 旧形式 → 朝のデータとして移行
  return {
    morning: {
      systolic: bp.systolic ?? null,
      diastolic: bp.diastolic ?? null,
      pulse: bp.pulse ?? null,
    },
    evening: null,
  };
}

/**
 * デフォルトのSettings
 */
function defaultSettings() {
  return {
    medicationNames: {
      morning: '朝の薬',
      evening: '夜の薬',
    },
  };
}

export const store = {
  /**
   * 特定日のDayRecordを取得する
   * 存在しない場合はデフォルト値を返す
   * @param {string} dateString - "YYYY-MM-DD"
   * @returns {object} DayRecord
   */
  getDay(dateString) {
    try {
      const raw = localStorage.getItem(DAY_PREFIX + dateString);
      if (!raw) return defaultDayRecord(dateString);
      const parsed = JSON.parse(raw);
      // デフォルト値とマージしてフィールド不足に対応
      return {
        ...defaultDayRecord(dateString),
        ...parsed,
        medications: { morning: null, evening: null, ...(parsed.medications || {}) },
        bloodPressure: migrateBp(parsed.bloodPressure),
      };
    } catch {
      return defaultDayRecord(dateString);
    }
  },

  /**
   * DayRecordを保存する
   * @param {object} record - DayRecord
   */
  saveDay(record) {
    localStorage.setItem(DAY_PREFIX + record.date, JSON.stringify(record));
  },

  /**
   * 指定月の全DayRecordを返す（記録がない日はデフォルト値）
   * @param {number} year
   * @param {number} month - 1-indexed
   * @returns {object[]} DayRecord配列 (月の日数分)
   */
  getMonth(year, month) {
    const days = getDaysInMonth(year, month);
    const records = [];
    for (let d = 1; d <= days; d++) {
      const dateString = `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      records.push(this.getDay(dateString));
    }
    return records;
  },

  /**
   * Settingsを取得する
   * @returns {object} Settings
   */
  getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return defaultSettings();
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings(),
        ...parsed,
        medicationNames: {
          ...defaultSettings().medicationNames,
          ...(parsed.medicationNames || {}),
        },
      };
    } catch {
      return defaultSettings();
    }
  },

  /**
   * Settingsを保存する
   * @param {object} settings
   */
  saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  /**
   * 全データをエクスポート用オブジェクトとして返す
   */
  exportAll() {
    const data = {
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      days: {},
    };
    const keys = getAllDayKeys();
    for (const key of keys) {
      const dateString = key.replace(DAY_PREFIX, '');
      data.days[dateString] = this.getDay(dateString);
    }
    return data;
  },

  /**
   * エクスポートデータをインポートする（既存データを上書き）
   * @param {object} data - exportAll()の戻り値と同じ形式
   */
  importAll(data) {
    if (data.settings) this.saveSettings(data.settings);
    if (data.days) {
      for (const [dateString, record] of Object.entries(data.days)) {
        this.saveDay({ ...defaultDayRecord(dateString), ...record });
      }
    }
  },
};
