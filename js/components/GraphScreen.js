// GraphScreen.js - グラフ画面

import BpChart from './BpChart.js';
import SaltChart from './SaltChart.js';
import { formatMonthJa, prevMonth, nextMonth, today, buildCalendarGrid } from '../utils.js';
import { store } from '../store.js';

export default {
  name: 'GraphScreen',

  components: { BpChart, SaltChart },

  data() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      records: [],
      filters: {
        showMorningBp: true,
        showEveningBp: true,
        showSystolic: true,
        showDiastolic: true,
        showPulse: true,
        showHospital: true,
        showSalt: true,
      },
    };
  },

  created() {
    this.loadData();
  },

  computed: {
    monthTitle() {
      return formatMonthJa(this.year, this.month);
    },

    // 服薬統計
    stats() {
      const todayStr = today();
      const pastRecords = this.records.filter(r => r.date <= todayStr);
      const total = pastRecords.length;
      if (total === 0) return { morningRate: null, eveningRate: null, bothRate: null };

      const morningTaken = pastRecords.filter(r => r.medications.morning === true).length;
      const eveningTaken = pastRecords.filter(r => r.medications.evening === true).length;
      const bothTaken = pastRecords.filter(r =>
        r.medications.morning === true && r.medications.evening === true
      ).length;

      return {
        morningRate: Math.round((morningTaken / total) * 100),
        eveningRate: Math.round((eveningTaken / total) * 100),
        bothRate: Math.round((bothTaken / total) * 100),
        total,
      };
    },

    // ヒートマップ用セル（カレンダー形式）
    heatmapCells() {
      const todayStr = today();
      const grid = buildCalendarGrid(this.year, this.month);
      const recordMap = {};
      for (const r of this.records) recordMap[r.date] = r;

      return grid.map(cell => {
        const r = recordMap[cell.dateString];
        let status = 'empty';

        if (!cell.isCurrentMonth) {
          status = 'empty';
        } else if (cell.dateString > todayStr) {
          status = 'future';
        } else if (!r || (r.medications.morning === null && r.medications.evening === null)) {
          status = 'no-data';
        } else {
          const morning = r.medications.morning === true;
          const evening = r.medications.evening === true;
          if (morning && evening) status = 'both-taken';
          else if (morning || evening) status = 'one-taken';
          else status = 'none-taken';
        }

        return {
          ...cell,
          status,
          hasHospital: !!(r?.hospitalVisit),
        };
      });
    },
  },

  methods: {
    loadData() {
      this.records = store.getMonth(this.year, this.month);
    },

    goToPrevMonth() {
      const p = prevMonth(this.year, this.month);
      this.year = p.year;
      this.month = p.month;
      this.loadData();
    },

    goToNextMonth() {
      const n = nextMonth(this.year, this.month);
      this.year = n.year;
      this.month = n.month;
      this.loadData();
    },

    toggleFilter(key) {
      this.filters[key] = !this.filters[key];
    },

    heatmapCellClass(cell) {
      return {
        'heatmap-cell': true,
        [cell.status]: true,
      };
    },
  },

  template: `
    <div class="screen graph-screen">
      <!-- 月ナビゲーション -->
      <div class="month-nav">
        <button class="month-nav-btn" @click="goToPrevMonth" aria-label="前月">‹</button>
        <div class="month-nav-title">{{ monthTitle }}</div>
        <button class="month-nav-btn" @click="goToNextMonth" aria-label="翌月">›</button>
      </div>

      <!-- 服薬統計サマリー -->
      <div v-if="stats.total" class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.morningRate }}%</div>
          <div class="stat-label">朝の服薬率</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.eveningRate }}%</div>
          <div class="stat-label">夜の服薬率</div>
        </div>
      </div>

      <!-- フィルターチップ -->
      <div class="filter-bar">
        <button
          :class="['filter-chip', 'systolic', { active: filters.showMorningBp }]"
          @click="toggleFilter('showMorningBp')"
        >🌅 朝</button>
        <button
          :class="['filter-chip', 'diastolic', { active: filters.showEveningBp }]"
          @click="toggleFilter('showEveningBp')"
        >🌙 夜</button>
        <button
          :class="['filter-chip', 'systolic', { active: filters.showSystolic }]"
          @click="toggleFilter('showSystolic')"
        >収縮期</button>
        <button
          :class="['filter-chip', 'diastolic', { active: filters.showDiastolic }]"
          @click="toggleFilter('showDiastolic')"
        >拡張期</button>
        <button
          :class="['filter-chip', 'pulse', { active: filters.showPulse }]"
          @click="toggleFilter('showPulse')"
        >脈拍</button>
        <button
          :class="['filter-chip', 'hospital', { active: filters.showHospital }]"
          @click="toggleFilter('showHospital')"
        >通院日</button>
        <button
          :class="['filter-chip', 'salt', { active: filters.showSalt }]"
          @click="toggleFilter('showSalt')"
        >🧂 塩分</button>
      </div>

      <!-- 血圧グラフ -->
      <div class="chart-card">
        <div class="chart-title">血圧・脈拍</div>
        <BpChart
          :key="year + '-' + month"
          :records="records"
          :filters="filters"
        />
      </div>

      <!-- 塩分グラフ -->
      <div class="chart-card" v-if="filters.showSalt">
        <div class="chart-title">摂取塩分量（1日合計）</div>
        <SaltChart
          :key="'salt-' + year + '-' + month"
          :records="records"
          :filters="filters"
        />
      </div>

      <!-- 服薬ヒートマップ -->
      <div class="chart-card">
        <div class="chart-title">服薬状況</div>

        <!-- 曜日ヘッダー -->
        <div class="heatmap-grid" style="margin-bottom:4px;">
          <div class="heatmap-weekday" v-for="w in ['日','月','火','水','木','金','土']" :key="w">{{ w }}</div>
        </div>

        <!-- グリッド -->
        <div class="heatmap-grid">
          <div
            v-for="cell in heatmapCells"
            :key="cell.dateString"
            :class="heatmapCellClass(cell)"
          >
            <span v-if="cell.isCurrentMonth" class="heatmap-day-num">{{ cell.day }}</span>
            <span v-if="cell.hasHospital && cell.isCurrentMonth" class="heatmap-hospital-dot">🏥</span>
          </div>
        </div>

        <!-- 凡例 -->
        <div class="legend">
          <div class="legend-item">
            <div class="legend-dot" style="background:#27ae60;"></div>両方服用
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background:#f39c12;"></div>片方服用
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background:#e74c3c;"></div>未服用
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background:#f0f2f5;border:1px solid #e8ecf0;"></div>未記録
          </div>
        </div>
      </div>
    </div>
  `,
};
