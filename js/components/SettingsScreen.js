// SettingsScreen.js - 設定画面

import { store } from '../store.js';

export default {
  name: 'SettingsScreen',

  props: {
    settings: { type: Object, required: true },
  },

  emits: ['settings-updated'],

  data() {
    return {
      morningName: this.settings.medicationNames.morning,
      eveningName: this.settings.medicationNames.evening,
      importError: null,
      importSuccess: false,
    };
  },

  watch: {
    settings: {
      handler(val) {
        this.morningName = val.medicationNames.morning;
        this.eveningName = val.medicationNames.evening;
      },
      deep: true,
    },
  },

  methods: {
    saveMorningName() {
      const newSettings = {
        ...this.settings,
        medicationNames: {
          ...this.settings.medicationNames,
          morning: this.morningName || '朝の薬',
        },
      };
      store.saveSettings(newSettings);
      this.$emit('settings-updated', newSettings);
    },

    saveEveningName() {
      const newSettings = {
        ...this.settings,
        medicationNames: {
          ...this.settings.medicationNames,
          evening: this.eveningName || '夜の薬',
        },
      };
      store.saveSettings(newSettings);
      this.$emit('settings-updated', newSettings);
    },

    exportData() {
      const data = store.exportAll();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `medtracker-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    onImportFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.importError = null;
      this.importSuccess = false;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (!data.days) throw new Error('バックアップファイルの形式が正しくありません');
          store.importAll(data);
          this.importSuccess = true;
          // 設定も反映
          const newSettings = store.getSettings();
          this.$emit('settings-updated', newSettings);
          // ファイル入力をリセット
          e.target.value = '';
        } catch (err) {
          this.importError = err.message || 'ファイルの読み込みに失敗しました';
        }
      };
      reader.readAsText(file);
    },
  },

  template: `
    <div class="screen">
      <div class="section-header" style="margin-bottom:20px;">
        <div class="section-title">設定</div>
      </div>

      <!-- 薬の名前カスタマイズ -->
      <div class="card">
        <div style="font-size:14px;font-weight:600;color:#2c3e50;margin-bottom:12px;">薬の名前</div>

        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <div style="font-size:12px;color:#7f8c8d;margin-bottom:4px;">朝の薬</div>
            <input
              type="text"
              v-model="morningName"
              @blur="saveMorningName"
              @keydown.enter="saveMorningName"
              placeholder="朝の薬"
              style="width:100%;height:44px;border:2px solid #e8ecf0;border-radius:8px;padding:0 12px;font-size:16px;color:#2c3e50;background:#f5f7fa;"
            />
          </div>
          <div>
            <div style="font-size:12px;color:#7f8c8d;margin-bottom:4px;">夜の薬</div>
            <input
              type="text"
              v-model="eveningName"
              @blur="saveEveningName"
              @keydown.enter="saveEveningName"
              placeholder="夜の薬"
              style="width:100%;height:44px;border:2px solid #e8ecf0;border-radius:8px;padding:0 12px;font-size:16px;color:#2c3e50;background:#f5f7fa;"
            />
          </div>
        </div>
      </div>

      <!-- データ管理 -->
      <div class="card">
        <div style="font-size:14px;font-weight:600;color:#2c3e50;margin-bottom:12px;">データ管理</div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          <!-- エクスポート -->
          <button
            @click="exportData"
            style="width:100%;height:48px;background:#4a90d9;color:white;border-radius:10px;font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;"
          >
            📥 データをエクスポート（バックアップ）
          </button>

          <!-- インポート -->
          <label style="width:100%;height:48px;background:#f5f7fa;border:2px solid #e8ecf0;color:#2c3e50;border-radius:10px;font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;">
            📤 データをインポート（復元）
            <input type="file" accept=".json" style="display:none;" @change="onImportFileChange" />
          </label>

          <div v-if="importError" style="color:#e74c3c;font-size:13px;padding:8px;background:#fdf0ee;border-radius:6px;">
            ⚠️ {{ importError }}
          </div>
          <div v-if="importSuccess" style="color:#27ae60;font-size:13px;padding:8px;background:#eafaf1;border-radius:6px;">
            ✅ データのインポートが完了しました
          </div>
        </div>
      </div>

      <!-- 使い方ヒント -->
      <div class="card">
        <div style="font-size:14px;font-weight:600;color:#2c3e50;margin-bottom:8px;">使い方</div>
        <div style="font-size:13px;color:#7f8c8d;line-height:1.7;">
          <div>📅 カレンダー：日付をタップして服薬・血圧を記録</div>
          <div>📊 グラフ：月ごとの血圧・服薬状況を確認</div>
          <div>⬜ → ✅ → ❌：タップで服薬状態を切り替え</div>
          <div>💾 データは端末に保存されます（サーバー不要）</div>
        </div>
      </div>
    </div>
  `,
};
