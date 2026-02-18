// CalendarScreen.js - 月カレンダー表示

import DayCell from './DayCell.js';
import DayModal from './DayModal.js';
import { buildCalendarGrid, formatMonthJa, prevMonth, nextMonth, WEEKDAYS } from '../utils.js';
import { store } from '../store.js';

export default {
  name: 'CalendarScreen',

  components: { DayCell, DayModal },

  props: {
    settings: { type: Object, required: true },
  },

  emits: ['settings-change'],

  data() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      monthData: {},        // { "YYYY-MM-DD": DayRecord }
      selectedDate: null,
      showModal: false,
    };
  },

  created() {
    this.loadMonthData();
  },

  computed: {
    monthTitle() {
      return formatMonthJa(this.year, this.month);
    },

    calendarCells() {
      return buildCalendarGrid(this.year, this.month);
    },

    weekdayLabels() {
      return WEEKDAYS;
    },
  },

  methods: {
    loadMonthData() {
      const records = store.getMonth(this.year, this.month);
      const map = {};
      for (const r of records) {
        map[r.date] = r;
      }
      this.monthData = map;
    },

    goToPrevMonth() {
      const p = prevMonth(this.year, this.month);
      this.year = p.year;
      this.month = p.month;
      this.loadMonthData();
    },

    goToNextMonth() {
      const n = nextMonth(this.year, this.month);
      this.year = n.year;
      this.month = n.month;
      this.loadMonthData();
    },

    goToToday() {
      const now = new Date();
      this.year = now.getFullYear();
      this.month = now.getMonth() + 1;
      this.loadMonthData();
    },

    onDaySelect(dateString) {
      this.selectedDate = dateString;
      this.showModal = true;
    },

    onModalClose() {
      this.showModal = false;
      this.selectedDate = null;
    },

    onModalUpdated(dateString) {
      // 更新された日のデータを再読込
      const updated = store.getDay(dateString);
      this.monthData = { ...this.monthData, [dateString]: updated };
    },
  },

  template: `
    <div class="screen calendar-screen">
      <!-- 月ナビゲーション -->
      <div class="month-nav">
        <button class="month-nav-btn" @click="goToPrevMonth" aria-label="前月">‹</button>
        <div class="month-nav-title" @click="goToToday" title="今月に戻る" style="cursor:pointer">
          {{ monthTitle }}
        </div>
        <button class="month-nav-btn" @click="goToNextMonth" aria-label="翌月">›</button>
      </div>

      <!-- 曜日ヘッダー -->
      <div class="weekday-header">
        <div
          v-for="(w, i) in weekdayLabels"
          :key="w"
          :class="['weekday-label', i === 0 ? 'sunday' : '', i === 6 ? 'saturday' : '']"
        >{{ w }}</div>
      </div>

      <!-- カレンダーグリッド -->
      <div class="calendar-grid">
        <DayCell
          v-for="cell in calendarCells"
          :key="cell.dateString"
          :dateString="cell.dateString"
          :day="cell.day"
          :isCurrentMonth="cell.isCurrentMonth"
          :isToday="cell.isToday"
          :dayOfWeek="cell.dayOfWeek"
          :record="monthData[cell.dateString] || null"
          @select="onDaySelect"
        />
      </div>

      <!-- 凡例 -->
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; padding: 0 4px;">
        <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:#7f8c8d;">
          <div style="width:8px;height:8px;border-radius:50%;background:#27ae60;"></div>服用済み
        </div>
        <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:#7f8c8d;">
          <div style="width:8px;height:8px;border-radius:50%;background:#e74c3c;"></div>未服用
        </div>
        <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:#7f8c8d;">
          <div style="width:8px;height:8px;border-radius:50%;background:#e67e22;"></div>未記録（過去）
        </div>
        <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:#7f8c8d;">
          🏥 通院
        </div>
      </div>
    </div>

    <!-- 日付詳細モーダル -->
    <Teleport to="body">
      <Transition name="slide-up">
        <DayModal
          v-if="showModal && selectedDate"
          :dateString="selectedDate"
          :settings="settings"
          @close="onModalClose"
          @updated="onModalUpdated"
        />
      </Transition>
    </Teleport>
  `,
};
