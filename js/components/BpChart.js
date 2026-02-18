// BpChart.js - Chart.js血圧ラインチャートラッパー

export default {
  name: 'BpChart',

  props: {
    records: { type: Array, required: true },   // DayRecord[]（月全日数分）
    filters: { type: Object, required: true },   // { showMorningBp, showEveningBp, showSystolic, showDiastolic, showPulse, showHospital }
  },

  data() {
    return {
      chartInstance: null,
    };
  },

  mounted() {
    this.createChart();
  },

  unmounted() {
    this.destroyChart();
  },

  watch: {
    records: {
      handler() { this.recreateChart(); },
      deep: true,
    },
    filters: {
      handler() { this.recreateChart(); },
      deep: true,
    },
  },

  computed: {
    hasData() {
      return this.records.some(r =>
        r.bloodPressure?.morning !== null && r.bloodPressure?.morning !== undefined ||
        r.bloodPressure?.evening !== null && r.bloodPressure?.evening !== undefined
      );
    },

    labels() {
      return this.records.map(r => {
        const d = parseInt(r.date.split('-')[2]);
        return d;
      });
    },

    chartConfig() {
      const datasets = [];

      // 朝 収縮期（赤・実線）
      if (this.filters.showMorningBp && this.filters.showSystolic) {
        datasets.push({
          label: '朝 収縮期（上）',
          data: this.records.map(r => r.bloodPressure?.morning?.systolic ?? null),
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231,76,60,0.08)',
          pointBackgroundColor: '#e74c3c',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          spanGaps: true,
          tension: 0.3,
        });
      }

      // 夜 収縮期（赤・点線）
      if (this.filters.showEveningBp && this.filters.showSystolic) {
        datasets.push({
          label: '夜 収縮期（上）',
          data: this.records.map(r => r.bloodPressure?.evening?.systolic ?? null),
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231,76,60,0.04)',
          pointBackgroundColor: '#e74c3c',
          pointStyle: 'rectRot',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          borderDash: [6, 3],
          spanGaps: true,
          tension: 0.3,
        });
      }

      // 朝 拡張期（青・実線）
      if (this.filters.showMorningBp && this.filters.showDiastolic) {
        datasets.push({
          label: '朝 拡張期（下）',
          data: this.records.map(r => r.bloodPressure?.morning?.diastolic ?? null),
          borderColor: '#3498db',
          backgroundColor: 'rgba(52,152,219,0.08)',
          pointBackgroundColor: '#3498db',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          spanGaps: true,
          tension: 0.3,
        });
      }

      // 夜 拡張期（青・点線）
      if (this.filters.showEveningBp && this.filters.showDiastolic) {
        datasets.push({
          label: '夜 拡張期（下）',
          data: this.records.map(r => r.bloodPressure?.evening?.diastolic ?? null),
          borderColor: '#3498db',
          backgroundColor: 'rgba(52,152,219,0.04)',
          pointBackgroundColor: '#3498db',
          pointStyle: 'rectRot',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          borderDash: [6, 3],
          spanGaps: true,
          tension: 0.3,
        });
      }

      // 朝 脈拍（緑・実線）
      if (this.filters.showMorningBp && this.filters.showPulse) {
        datasets.push({
          label: '朝 脈拍',
          data: this.records.map(r => r.bloodPressure?.morning?.pulse ?? null),
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39,174,96,0.08)',
          pointBackgroundColor: '#27ae60',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          borderDash: [5, 5],
          spanGaps: true,
          tension: 0.3,
        });
      }

      // 夜 脈拍（緑・点線）
      if (this.filters.showEveningBp && this.filters.showPulse) {
        datasets.push({
          label: '夜 脈拍',
          data: this.records.map(r => r.bloodPressure?.evening?.pulse ?? null),
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39,174,96,0.04)',
          pointBackgroundColor: '#27ae60',
          pointStyle: 'rectRot',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          borderDash: [2, 4],
          spanGaps: true,
          tension: 0.3,
        });
      }

      // 通院日を縦マーカー（scatter）として表示
      if (this.filters.showHospital) {
        const hospitalPoints = this.records
          .filter(r => r.hospitalVisit)
          .map(r => {
            const day = parseInt(r.date.split('-')[2]);
            // グラフ上でX軸の位置を揃えるためdayのインデックスを使う
            const idx = this.labels.indexOf(day);
            return { x: idx, y: null }; // nullにしてX軸のみマーク
          });

        if (hospitalPoints.length > 0) {
          datasets.push({
            label: '通院日',
            data: this.records.map((r, i) => {
              if (!r.hospitalVisit) return null;
              return { x: this.labels[i], y: this.getMaxY() };
            }),
            type: 'scatter',
            pointBackgroundColor: '#e74c3c',
            pointStyle: 'triangle',
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false,
          });
        }
      }

      return {
        type: 'line',
        data: {
          labels: this.labels,
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 300 },
          scales: {
            x: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { size: 11 },
                color: '#7f8c8d',
                maxTicksLimit: 10,
              },
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { size: 11 },
                color: '#7f8c8d',
              },
              min: 40,
            },
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { size: 11 },
                boxWidth: 16,
                padding: 12,
              },
            },
            tooltip: {
              callbacks: {
                label(ctx) {
                  const val = ctx.raw;
                  if (val === null || val === undefined) return null;
                  if (typeof val === 'object') return `通院日 ${ctx.dataset.label}`;
                  const unit = ctx.dataset.label.includes('脈拍') ? ' bpm' : ' mmHg';
                  return `${ctx.dataset.label}: ${val}${unit}`;
                },
              },
            },
          },
        },
      };
    },
  },

  methods: {
    getMaxY() {
      let max = 200;
      for (const r of this.records) {
        if (r.bloodPressure?.morning?.systolic) max = Math.max(max, r.bloodPressure.morning.systolic + 20);
        if (r.bloodPressure?.evening?.systolic) max = Math.max(max, r.bloodPressure.evening.systolic + 20);
      }
      return max;
    },

    createChart() {
      if (!this.hasData) return;
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      if (typeof Chart === 'undefined') {
        console.warn('Chart.js が読み込まれていません');
        return;
      }
      this.chartInstance = new Chart(canvas, this.chartConfig);
    },

    destroyChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    },

    recreateChart() {
      this.destroyChart();
      this.$nextTick(() => this.createChart());
    },
  },

  template: `
    <div>
      <div v-if="!hasData" class="no-data-msg">
        この月の血圧データはありません
      </div>
      <div v-else class="chart-canvas-wrapper">
        <canvas ref="canvas"></canvas>
      </div>
    </div>
  `,
};
