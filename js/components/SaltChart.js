// SaltChart.js - 1日合計塩分量折れ線グラフ

export default {
  name: 'SaltChart',

  props: {
    records: { type: Array, required: true },  // DayRecord[]（月全日数分）
    filters: { type: Object, required: true },
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
      return this.records.some(r => {
        const s = r.salt;
        return s && (s.breakfast !== null || s.lunch !== null || s.dinner !== null);
      });
    },

    labels() {
      return this.records.map(r => parseInt(r.date.split('-')[2]));
    },

    chartConfig() {
      const dailyTotals = this.records.map(r => {
        const s = r.salt;
        if (!s) return null;
        const vals = [s.breakfast, s.lunch, s.dinner].filter(v => v !== null);
        return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) * 10) / 10 : null;
      });

      return {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [{
            label: '塩分合計',
            data: dailyTotals,
            borderColor: '#9b59b6',
            backgroundColor: 'rgba(155,89,182,0.08)',
            pointBackgroundColor: '#9b59b6',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            spanGaps: true,
            tension: 0.3,
            fill: true,
          }],
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
              min: 0,
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
                  return `塩分合計: ${val} g`;
                },
              },
            },
          },
        },
      };
    },
  },

  methods: {
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
        この月の塩分データはありません
      </div>
      <div v-else class="chart-canvas-wrapper">
        <canvas ref="canvas"></canvas>
      </div>
    </div>
  `,
};
