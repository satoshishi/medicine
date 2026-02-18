// DayModal.js - 日付詳細モーダル（ボトムシート）

import { formatDateJa, getMedStatusText, nextMedState } from '../utils.js';
import { store } from '../store.js';

export default {
  name: 'DayModal',

  props: {
    dateString: { type: String, required: true },
    settings: { type: Object, required: true },
  },

  emits: ['close', 'updated'],

  data() {
    return {
      record: null,
    };
  },

  created() {
    this.loadRecord();
  },

  computed: {
    dateTitle() {
      return formatDateJa(this.dateString);
    },

    morningName() {
      return this.settings?.medicationNames?.morning || '朝の薬';
    },

    eveningName() {
      return this.settings?.medicationNames?.evening || '夜の薬';
    },

    morningStatus() {
      return getMedStatusText(this.record?.medications?.morning);
    },

    eveningStatus() {
      return getMedStatusText(this.record?.medications?.evening);
    },

    morningClass() {
      const t = this.record?.medications?.morning;
      if (t === true) return 'taken';
      if (t === false) return 'missed';
      return '';
    },

    eveningClass() {
      const t = this.record?.medications?.evening;
      if (t === true) return 'taken';
      if (t === false) return 'missed';
      return '';
    },

    morningIcon() {
      const t = this.record?.medications?.morning;
      if (t === true) return '✅';
      if (t === false) return '❌';
      return '⬜';
    },

    eveningIcon() {
      const t = this.record?.medications?.evening;
      if (t === true) return '✅';
      if (t === false) return '❌';
      return '⬜';
    },

    hasHospital: {
      get() { return !!this.record?.hospitalVisit; },
      set(val) {
        if (val) {
          this.record.hospitalVisit = { time: '', note: '' };
        } else {
          this.record.hospitalVisit = null;
        }
        this.save();
      },
    },

    hospitalTime: {
      get() { return this.record?.hospitalVisit?.time || ''; },
      set(val) {
        if (this.record.hospitalVisit) {
          this.record.hospitalVisit.time = val;
          this.save();
        }
      },
    },

    hospitalNote: {
      get() { return this.record?.hospitalVisit?.note || ''; },
      set(val) {
        if (this.record.hospitalVisit) {
          this.record.hospitalVisit.note = val;
          this.save();
        }
      },
    },

    // 朝 1回目
    morningFirstSystolic: {
      get() { return this.record?.bloodPressure?.morning?.first?.systolic ?? ''; },
      set(val) { this.setBp('morning', 'first', 'systolic', val); },
    },
    morningFirstDiastolic: {
      get() { return this.record?.bloodPressure?.morning?.first?.diastolic ?? ''; },
      set(val) { this.setBp('morning', 'first', 'diastolic', val); },
    },
    morningFirstPulse: {
      get() { return this.record?.bloodPressure?.morning?.first?.pulse ?? ''; },
      set(val) { this.setBp('morning', 'first', 'pulse', val); },
    },

    // 朝 2回目
    morningSecondSystolic: {
      get() { return this.record?.bloodPressure?.morning?.second?.systolic ?? ''; },
      set(val) { this.setBp('morning', 'second', 'systolic', val); },
    },
    morningSecondDiastolic: {
      get() { return this.record?.bloodPressure?.morning?.second?.diastolic ?? ''; },
      set(val) { this.setBp('morning', 'second', 'diastolic', val); },
    },
    morningSecondPulse: {
      get() { return this.record?.bloodPressure?.morning?.second?.pulse ?? ''; },
      set(val) { this.setBp('morning', 'second', 'pulse', val); },
    },

    // 夜 1回目
    eveningFirstSystolic: {
      get() { return this.record?.bloodPressure?.evening?.first?.systolic ?? ''; },
      set(val) { this.setBp('evening', 'first', 'systolic', val); },
    },
    eveningFirstDiastolic: {
      get() { return this.record?.bloodPressure?.evening?.first?.diastolic ?? ''; },
      set(val) { this.setBp('evening', 'first', 'diastolic', val); },
    },
    eveningFirstPulse: {
      get() { return this.record?.bloodPressure?.evening?.first?.pulse ?? ''; },
      set(val) { this.setBp('evening', 'first', 'pulse', val); },
    },

    // 夜 2回目
    eveningSecondSystolic: {
      get() { return this.record?.bloodPressure?.evening?.second?.systolic ?? ''; },
      set(val) { this.setBp('evening', 'second', 'systolic', val); },
    },
    eveningSecondDiastolic: {
      get() { return this.record?.bloodPressure?.evening?.second?.diastolic ?? ''; },
      set(val) { this.setBp('evening', 'second', 'diastolic', val); },
    },
    eveningSecondPulse: {
      get() { return this.record?.bloodPressure?.evening?.second?.pulse ?? ''; },
      set(val) { this.setBp('evening', 'second', 'pulse', val); },
    },

    // 塩分
    saltBreakfast: {
      get() { return this.record?.salt?.breakfast ?? ''; },
      set(val) { this.setSalt('breakfast', val); },
    },
    saltLunch: {
      get() { return this.record?.salt?.lunch ?? ''; },
      set(val) { this.setSalt('lunch', val); },
    },
    saltDinner: {
      get() { return this.record?.salt?.dinner ?? ''; },
      set(val) { this.setSalt('dinner', val); },
    },
    saltTotal() {
      const s = this.record?.salt;
      if (!s) return null;
      const vals = [s.breakfast, s.lunch, s.dinner].filter(v => v !== null);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : null;
    },
  },

  methods: {
    loadRecord() {
      this.record = store.getDay(this.dateString);
    },

    save() {
      store.saveDay(this.record);
      this.$emit('updated', this.dateString);
    },

    setSalt(meal, val) {
      const num = val === '' ? null : parseFloat(val);
      if (!this.record.salt) {
        this.record.salt = { breakfast: null, lunch: null, dinner: null };
      }
      this.record.salt[meal] = (num === null || isNaN(num)) ? null : num;
      // 全部nullならsaltをnullに
      const s = this.record.salt;
      if (s.breakfast === null && s.lunch === null && s.dinner === null) {
        this.record.salt = null;
      }
      this.save();
    },

    toggleMorning() {
      this.record.medications.morning = nextMedState(this.record.medications.morning);
      this.save();
    },

    toggleEvening() {
      this.record.medications.evening = nextMedState(this.record.medications.evening);
      this.save();
    },

    setBp(timeOfDay, measureNum, field, val) {
      const num = val === '' ? null : Number(val);

      // bloodPressureオブジェクトがなければ初期化
      if (!this.record.bloodPressure) {
        this.record.bloodPressure = { morning: null, evening: null };
      }
      // 朝/夜のスロットがなければ初期化
      if (!this.record.bloodPressure[timeOfDay]) {
        this.record.bloodPressure[timeOfDay] = { first: null, second: null };
      }
      // 1回目/2回目のスロットがなければ初期化
      if (!this.record.bloodPressure[timeOfDay][measureNum]) {
        this.record.bloodPressure[timeOfDay][measureNum] = { systolic: null, diastolic: null, pulse: null };
      }
      this.record.bloodPressure[timeOfDay][measureNum][field] = num;

      // measureNum 内が全null → null に
      const slot = this.record.bloodPressure[timeOfDay][measureNum];
      if (slot.systolic === null && slot.diastolic === null && slot.pulse === null) {
        this.record.bloodPressure[timeOfDay][measureNum] = null;
      }
      // timeOfDay 内が first/second 両方null → null に
      const tod = this.record.bloodPressure[timeOfDay];
      if (!tod.first && !tod.second) {
        this.record.bloodPressure[timeOfDay] = null;
      }
      // 朝夜両方nullならbloodPressure全体をnullに
      if (!this.record.bloodPressure.morning && !this.record.bloodPressure.evening) {
        this.record.bloodPressure = null;
      }
      this.save();
    },

    onOverlayClick(e) {
      if (e.target === e.currentTarget) {
        this.$emit('close');
      }
    },
  },

  template: `
    <div class="modal-overlay" @click="onOverlayClick">
      <div class="modal-sheet">
        <div class="sheet-handle"></div>

        <div class="modal-header">
          <div class="modal-date-title">{{ dateTitle }}</div>
          <button class="modal-close-btn" @click="$emit('close')" aria-label="閉じる">×</button>
        </div>

        <!-- 服薬セクション -->
        <div class="modal-section" v-if="record">
          <div class="modal-section-title">服薬記録</div>
          <div class="med-toggle-list">
            <button :class="['med-toggle-btn', morningClass]" @click="toggleMorning">
              <div class="med-toggle-info">
                <div class="med-toggle-name">{{ morningName }}</div>
                <div class="med-toggle-status">{{ morningStatus }}</div>
              </div>
              <div class="med-toggle-icon">{{ morningIcon }}</div>
            </button>

            <button :class="['med-toggle-btn', eveningClass]" @click="toggleEvening">
              <div class="med-toggle-info">
                <div class="med-toggle-name">{{ eveningName }}</div>
                <div class="med-toggle-status">{{ eveningStatus }}</div>
              </div>
              <div class="med-toggle-icon">{{ eveningIcon }}</div>
            </button>
          </div>
        </div>

        <!-- 血圧セクション -->
        <div class="modal-section" v-if="record">
          <div class="modal-section-title">血圧・脈拍（任意）</div>

          <!-- 朝の血圧 -->
          <div class="bp-time-label">🌅 朝</div>

          <div class="bp-measure-label">1回目</div>
          <div class="bp-input-grid">
            <div class="bp-input-group">
              <div class="bp-input-label">収縮期（上）</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="50" max="250"
                placeholder="---"
                :value="morningFirstSystolic"
                @input="morningFirstSystolic = $event.target.value"
              />
              <div class="bp-input-unit">mmHg</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">拡張期（下）</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="30" max="150"
                placeholder="---"
                :value="morningFirstDiastolic"
                @input="morningFirstDiastolic = $event.target.value"
              />
              <div class="bp-input-unit">mmHg</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">脈拍</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="30" max="250"
                placeholder="---"
                :value="morningFirstPulse"
                @input="morningFirstPulse = $event.target.value"
              />
              <div class="bp-input-unit">bpm</div>
            </div>
          </div>

          <div class="bp-measure-label">2回目</div>
          <div class="bp-input-grid">
            <div class="bp-input-group">
              <div class="bp-input-label">収縮期（上）</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="50" max="250"
                placeholder="---"
                :value="morningSecondSystolic"
                @input="morningSecondSystolic = $event.target.value"
              />
              <div class="bp-input-unit">mmHg</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">拡張期（下）</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="30" max="150"
                placeholder="---"
                :value="morningSecondDiastolic"
                @input="morningSecondDiastolic = $event.target.value"
              />
              <div class="bp-input-unit">mmHg</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">脈拍</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="30" max="250"
                placeholder="---"
                :value="morningSecondPulse"
                @input="morningSecondPulse = $event.target.value"
              />
              <div class="bp-input-unit">bpm</div>
            </div>
          </div>

          <!-- 夜の血圧 -->
          <div class="bp-time-label">🌙 夜</div>

          <div class="bp-measure-label">1回目</div>
          <div class="bp-input-grid">
            <div class="bp-input-group">
              <div class="bp-input-label">収縮期（上）</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="50" max="250"
                placeholder="---"
                :value="eveningFirstSystolic"
                @input="eveningFirstSystolic = $event.target.value"
              />
              <div class="bp-input-unit">mmHg</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">拡張期（下）</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="30" max="150"
                placeholder="---"
                :value="eveningFirstDiastolic"
                @input="eveningFirstDiastolic = $event.target.value"
              />
              <div class="bp-input-unit">mmHg</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">脈拍</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="30" max="250"
                placeholder="---"
                :value="eveningFirstPulse"
                @input="eveningFirstPulse = $event.target.value"
              />
              <div class="bp-input-unit">bpm</div>
            </div>
          </div>

          <div class="bp-measure-label">2回目</div>
          <div class="bp-input-grid">
            <div class="bp-input-group">
              <div class="bp-input-label">収縮期（上）</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="50" max="250"
                placeholder="---"
                :value="eveningSecondSystolic"
                @input="eveningSecondSystolic = $event.target.value"
              />
              <div class="bp-input-unit">mmHg</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">拡張期（下）</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="30" max="150"
                placeholder="---"
                :value="eveningSecondDiastolic"
                @input="eveningSecondDiastolic = $event.target.value"
              />
              <div class="bp-input-unit">mmHg</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">脈拍</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="numeric"
                min="30" max="250"
                placeholder="---"
                :value="eveningSecondPulse"
                @input="eveningSecondPulse = $event.target.value"
              />
              <div class="bp-input-unit">bpm</div>
            </div>
          </div>
        </div>

        <!-- 塩分セクション -->
        <div class="modal-section" v-if="record">
          <div class="modal-section-title">摂取塩分量（任意）</div>
          <div class="bp-input-grid">
            <div class="bp-input-group">
              <div class="bp-input-label">🌅 朝食</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="decimal"
                step="0.1"
                min="0"
                max="30"
                placeholder="---"
                :value="saltBreakfast"
                @input="saltBreakfast = $event.target.value"
              />
              <div class="bp-input-unit">g</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">☀️ 昼食</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="decimal"
                step="0.1"
                min="0"
                max="30"
                placeholder="---"
                :value="saltLunch"
                @input="saltLunch = $event.target.value"
              />
              <div class="bp-input-unit">g</div>
            </div>
            <div class="bp-input-group">
              <div class="bp-input-label">🌙 夕食</div>
              <input
                class="bp-input-field"
                type="number"
                inputmode="decimal"
                step="0.1"
                min="0"
                max="30"
                placeholder="---"
                :value="saltDinner"
                @input="saltDinner = $event.target.value"
              />
              <div class="bp-input-unit">g</div>
            </div>
          </div>
          <div v-if="saltTotal !== null" class="salt-total-row">
            合計 <strong>{{ saltTotal.toFixed(1) }} g</strong>
          </div>
        </div>

        <!-- 通院セクション -->
        <div class="modal-section" v-if="record">
          <div class="modal-section-title">通院記録（任意）</div>

          <div class="hospital-toggle-row">
            <div class="hospital-toggle-label">🏥 この日に通院した</div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="hasHospital" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div v-if="hasHospital" class="hospital-details">
            <div class="hospital-time-row">
              <div class="hospital-time-label">時間</div>
              <input
                class="hospital-time-input"
                type="time"
                v-model="hospitalTime"
              />
            </div>
            <input
              class="hospital-note-input"
              type="text"
              placeholder="メモ（任意）"
              v-model="hospitalNote"
            />
          </div>
        </div>
      </div>
    </div>
  `,
};
