<script setup lang="ts">
import { computed, ref } from 'vue';
import { useThemeManager } from '../composables/useThemeManager';
import {
  Check,
  Delete,
  Edit,
  Search,
  Star,
  View,
} from '@element-plus/icons-vue';

// Using theme manager
const { themeColorsRgba, isDarkMode, getThemeStyles } = useThemeManager();

// Calculate theme styles for components
const themeStyles = computed(() => {
  return getThemeStyles();
});

// Form data
const input = ref('');
const textarea = ref('');
const select = ref('');
const switch1 = ref(true);
const switch2 = ref(false);
const slider = ref(70);
const rate = ref(3.5);
const date = ref('');
const progress = ref(80);
const checkbox1 = ref(true);
const checkbox2 = ref(false);
const radio = ref('1');
const activeCollapse = ref(['1']);

// Table data
const tableData = [
  {
    date: '2023-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2023-05-02',
    name: 'John',
    address: 'No. 189, Grove St, Los Angeles',
  },
];

// Tags data
const tags = ['Tag One', 'Tag Two', 'Tag Three', 'Tag Four', 'Tag Five'];
</script>

<template>
  <div class="render-ui" :style="themeStyles">
    <div class="render-ui-waterfall">
      <!-- Form components -->
      <div class="render-ui-item">
        <h3>Form Components</h3>
        <el-form label-position="top">
          <el-form-item label="Input">
            <el-input
              v-model="input"
              placeholder="Please input content"
            ></el-input>
          </el-form-item>
          <el-form-item label="Select">
            <el-select v-model="select" placeholder="Please select">
              <el-option label="Option 1" value="1"></el-option>
              <el-option label="Option 2" value="2"></el-option>
              <el-option label="Option 3" value="3"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Buttons showcase -->
      <div class="render-ui-item">
        <h3>Button Types</h3>
        <div class="render-ui-buttons-grid">
          <el-button>Default Button</el-button>
          <el-button type="primary">Primary Button</el-button>
          <el-button type="success">Success Button</el-button>
          <el-button type="warning">Warning Button</el-button>
          <el-button type="danger">Danger Button</el-button>
          <el-button type="info">Info Button</el-button>
        </div>
      </div>

      <!-- Progress bars -->
      <div class="render-ui-item">
        <h3>Progress Indicators</h3>
        <div class="render-ui-flex-column">
          <el-progress :percentage="progress" :stroke-width="16"></el-progress>
          <el-progress
            :percentage="progress"
            :stroke-width="16"
            status="success"
          ></el-progress>
          <el-progress
            :percentage="progress"
            :stroke-width="16"
            status="warning"
          ></el-progress>
          <el-progress
            :percentage="progress"
            :stroke-width="16"
            status="exception"
          ></el-progress>
        </div>
      </div>

      <!-- Tags -->
      <div class="render-ui-item">
        <h3>Tags Display</h3>
        <div class="render-ui-flex-wrap">
          <el-tag>Tag One</el-tag>
          <el-tag type="success">Tag Two</el-tag>
          <el-tag type="info">Tag Three</el-tag>
          <el-tag type="warning">Tag Four</el-tag>
          <el-tag type="danger">Tag Five</el-tag>
        </div>
      </div>

      <!-- Interactive Components -->
      <div class="render-ui-item">
        <h3>Interactive Components</h3>
        <div class="render-ui-flex-column">
          <div class="render-ui-flex-row">
            <span>Switch:</span>
            <el-switch v-model="switch1" />
          </div>
          <div class="render-ui-flex-row">
            <span>Slider:</span>
            <el-slider v-model="slider" />
          </div>
          <div class="render-ui-flex-row">
            <span>Rating:</span>
            <el-rate v-model="rate" />
          </div>
        </div>
      </div>

      <!-- Alert messages -->
      <div class="render-ui-item">
        <h3>Alert Messages</h3>
        <div class="render-ui-flex-column">
          <el-alert title="Success alert message" type="success" />
          <el-alert title="Warning alert message" type="warning" />
          <el-alert title="Error alert message" type="error" />
          <el-alert title="Info alert message" type="info" />
        </div>
      </div>

      <!-- Icons display -->
      <div class="render-ui-item">
        <h3>Icons Display</h3>
        <div class="render-ui-icons-content">
          <el-button type="primary" circle
            ><el-icon><Edit /></el-icon
          ></el-button>
          <el-button type="danger" circle
            ><el-icon><Delete /></el-icon
          ></el-button>
          <el-button type="success" circle
            ><el-icon><Check /></el-icon
          ></el-button>
          <el-button type="info" circle
            ><el-icon><Search /></el-icon
          ></el-button>
          <el-button type="warning" circle
            ><el-icon><Star /></el-icon
          ></el-button>
          <el-button type="primary" circle
            ><el-icon><View /></el-icon
          ></el-button>
        </div>
      </div>

      <!-- Data table -->
      <div class="render-ui-item">
        <h3>Data Table</h3>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="date" label="Date" width="120" />
          <el-table-column prop="name" label="Name" width="120" />
          <el-table-column prop="address" label="Address" />
        </el-table>
      </div>

      <!-- Timeline -->
      <div class="render-ui-item">
        <h3>Timeline</h3>
        <el-timeline>
          <el-timeline-item timestamp="2023/4/12" placement="top">
            <el-card>
              <h4>Updated Github Template</h4>
              <p>Tom Smith submitted at 2023/4/12 20:46</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2023/4/3" placement="top">
            <el-card>
              <h4>Updated Github Template</h4>
              <p>Tom Smith submitted at 2023/4/3 20:46</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Variables - matching Form.vue patterns
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-lg: 16px;
$box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s ease;
$border-color: #d9d9d9;

.render-ui {
  width: 100%;
  height: 100%;
  background-color: var(--theme-surface);
  color: var(--theme-on-surface);
  border-radius: $border-radius-lg;
  box-shadow: var(--theme-box-shadow-light);
  padding: 20px;
  transition: $transition-base;
  overflow: auto;

  // Waterfall layout using CSS columns
  &-waterfall {
    column-count: 3;
    column-gap: 16px;

    // Responsive adjustments
    @media (max-width: 1200px) {
      column-count: 2;
    }

    @media (max-width: 768px) {
      column-count: 1;
    }
  }

  &-item {
    break-inside: avoid; // Prevent items from breaking across columns
    display: inline-block; // Required for proper column flow
    width: 100%;
    margin-bottom: 16px;
    background-color: var(--theme-surface-variant);
    color: var(--theme-on-surface-variant);
    border-radius: $border-radius-md;
    padding: 16px;
    box-shadow: var(--theme-box-shadow-light);
    transition: $transition-base;

    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      color: var(--theme-primary);
      font-size: 1.1rem;
    }

    // Ensure table doesn't overflow
    .el-table {
      max-width: 100%;
    }
  }

  // Flexible layout helpers
  &-flex {
    &-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    &-column {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    &-row {
      display: flex;
      align-items: center;
      gap: 16px;

      span {
        min-width: 60px;
      }

      .el-slider {
        flex: 1;
        max-width: calc(100% - 76px);
      }
    }
  }

  // Buttons grid layout
  &-buttons-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;

    .el-button {
      width: 100%;
      justify-content: center;
      text-align: center;
      margin-left: 0 !important; /* Override Element Plus default margin */
    }

    /* Fix any other buttons that might appear in other contexts */
    .el-button + .el-button {
      margin-left: 0 !important;
    }
  }

  // Icons styling
  &-icons-content {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;

    .el-button.is-circle {
      margin: 4px;
    }

    .el-icon {
      font-size: 18px;
    }
  }

  .el-alert {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
