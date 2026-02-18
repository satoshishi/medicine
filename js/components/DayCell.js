// DayCell.js - カレンダーの1日セル

import { getMedDotClass } from '../utils.js';

export default {
  name: 'DayCell',

  props: {
    dateString: { type: String, required: true },
    day: { type: Number, required: true },
    isCurrentMonth: { type: Boolean, default: true },
    isToday: { type: Boolean, default: false },
    dayOfWeek: { type: Number, required: true }, // 0=日 〜 6=土
    record: { type: Object, default: null },
  },

  emits: ['select'],

  computed: {
    cellClass() {
      return {
        'day-cell': true,
        'other-month': !this.isCurrentMonth,
        'today': this.isToday,
        'sunday': this.dayOfWeek === 0,
        'saturday': this.dayOfWeek === 6,
      };
    },

    morningDotClass() {
      const taken = this.record?.medications?.morning ?? null;
      if (!this.isCurrentMonth) return 'none';
      return getMedDotClass(taken, this.dateString);
    },

    eveningDotClass() {
      const taken = this.record?.medications?.evening ?? null;
      if (!this.isCurrentMonth) return 'none';
      return getMedDotClass(taken, this.dateString);
    },

    hasHospitalVisit() {
      return !!this.record?.hospitalVisit;
    },

    showDots() {
      return this.isCurrentMonth;
    },
  },

  methods: {
    onTap() {
      if (!this.isCurrentMonth) return;
      this.$emit('select', this.dateString);
    },
  },

  template: `
    <div :class="cellClass" @click="onTap">
      <div class="day-number">{{ day }}</div>

      <div v-if="showDots" class="med-dots">
        <div :class="['med-dot', morningDotClass]"></div>
        <div :class="['med-dot', eveningDotClass]"></div>
      </div>

      <div v-if="hasHospitalVisit" class="hospital-badge" title="通院">🏥</div>
    </div>
  `,
};
