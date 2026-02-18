// app.js - Vueアプリのルート

import CalendarScreen from './components/CalendarScreen.js';
import GraphScreen from './components/GraphScreen.js';
import SettingsScreen from './components/SettingsScreen.js';
import { store } from './store.js';

const { createApp, ref } = Vue;

const App = {
  components: { CalendarScreen, GraphScreen, SettingsScreen },

  setup() {
    const activeTab = ref('calendar');
    const settings = ref(store.getSettings());

    function setTab(tab) {
      activeTab.value = tab;
    }

    function onSettingsUpdated(newSettings) {
      settings.value = newSettings;
    }

    return {
      activeTab,
      settings,
      setTab,
      onSettingsUpdated,
    };
  },

  template: `
    <div id="app-inner">
      <!-- スクリーンコンテナ -->
      <div class="screen-container">
        <CalendarScreen
          v-if="activeTab === 'calendar'"
          :settings="settings"
        />
        <GraphScreen
          v-if="activeTab === 'graph'"
        />
        <SettingsScreen
          v-if="activeTab === 'settings'"
          :settings="settings"
          @settings-updated="onSettingsUpdated"
        />
      </div>

      <!-- ボトムナビゲーション -->
      <nav class="bottom-nav">
        <button
          :class="['nav-item', activeTab === 'calendar' ? 'active' : '']"
          @click="setTab('calendar')"
          aria-label="カレンダー"
        >
          <span class="nav-icon">📅</span>
          <span class="nav-label">カレンダー</span>
        </button>

        <button
          :class="['nav-item', activeTab === 'graph' ? 'active' : '']"
          @click="setTab('graph')"
          aria-label="グラフ"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label">グラフ</span>
        </button>

        <button
          :class="['nav-item', activeTab === 'settings' ? 'active' : '']"
          @click="setTab('settings')"
          aria-label="設定"
        >
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">設定</span>
        </button>
      </nav>
    </div>
  `,
};

createApp(App).mount('#app');
