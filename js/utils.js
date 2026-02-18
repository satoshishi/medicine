// utils.js - 日付ヘルパー、カレンダーグリッド生成

export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * Date -> "YYYY-MM-DD"
 */
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * "YYYY-MM-DD" -> Date
 */
export function parseDate(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 今日の日付文字列 "YYYY-MM-DD" を返す
 */
export function today() {
  return formatDate(new Date());
}

/**
 * 日付文字列が今日以前か判定
 */
export function isPastOrToday(dateString) {
  return dateString <= today();
}

/**
 * 月の日数を返す (month: 1-indexed)
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * 月の1日の曜日インデックスを返す (0=日, 1=月, ..., 6=土)
 */
export function getFirstDayOfWeek(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * カレンダーグリッド用の日付オブジェクト配列を返す
 * 各要素: { dateString, day, isCurrentMonth, isToday, dayOfWeek }
 * 前月・翌月の日も含めた35または42要素
 *
 * @param {number} year
 * @param {number} month - 1-indexed
 * @returns {Array}
 */
export function buildCalendarGrid(year, month) {
  const firstDow = getFirstDayOfWeek(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const todayStr = today();

  const cells = [];

  // 前月の日
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateString = `${String(prevYear).padStart(4,'0')}-${String(prevMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({
      dateString,
      day: d,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      dayOfWeek: cells.length % 7,
    });
  }

  // 当月の日
  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({
      dateString,
      day: d,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      dayOfWeek: cells.length % 7,
    });
  }

  // 翌月の日
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const totalCells = cells.length <= 35 ? 35 : 42;
  let nextDay = 1;
  while (cells.length < totalCells) {
    const dateString = `${String(nextYear).padStart(4,'0')}-${String(nextMonth).padStart(2,'0')}-${String(nextDay).padStart(2,'0')}`;
    cells.push({
      dateString,
      day: nextDay,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      dayOfWeek: cells.length % 7,
    });
    nextDay++;
  }

  return cells;
}

/**
 * 服薬ドットのスタイルクラスを返す
 * taken: true | false | null
 * dateString: "YYYY-MM-DD"
 */
export function getMedDotClass(taken, dateString) {
  if (taken === true) return 'taken';
  if (taken === false) return 'missed';
  if (dateString < today()) return 'unrecorded';
  return 'future';
}

/**
 * 服薬状態の表示テキスト
 */
export function getMedStatusText(taken) {
  if (taken === true) return '服用済み ✓';
  if (taken === false) return '未服用';
  return '未記録';
}

/**
 * 服薬トグルの次の状態
 * null -> true -> false -> null
 */
export function nextMedState(current) {
  if (current === null) return true;
  if (current === true) return false;
  return null;
}

/**
 * 日付文字列を日本語表示に変換
 * "2026-02-18" -> "2026年2月18日（水）"
 */
export function formatDateJa(dateString) {
  const date = parseDate(dateString);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = WEEKDAYS[date.getDay()];
  return `${y}年${m}月${d}日（${dow}）`;
}

/**
 * 月を日本語表示に変換
 * (2026, 2) -> "2026年2月"
 */
export function formatMonthJa(year, month) {
  return `${year}年${month}月`;
}

/**
 * 指定月の前の月を返す
 * @returns {{ year, month }}
 */
export function prevMonth(year, month) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

/**
 * 指定月の次の月を返す
 * @returns {{ year, month }}
 */
export function nextMonth(year, month) {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

/**
 * 全localStorageキーを返す（medtracker_day_プレフィックスのもの）
 */
export function getAllDayKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('medtracker_day_')) keys.push(k);
  }
  return keys;
}
