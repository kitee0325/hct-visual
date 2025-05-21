<script setup lang="ts">
import RenderChart from '@/components/RenderChart.vue';
import RenderUI from '@/components/RenderUI.vue';
import Hct from '@/components/Hct.vue';
</script>

<template>
  <div class="display">
    <section class="display-hct">
      <Hct />
    </section>

    <section class="display-render">
      <div class="display-render-chart">
        <RenderChart />
      </div>
      <div class="display-render-ui">
        <RenderUI />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.display {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  $hct-height: 50%;
  $render-height: 50%;

  &-hct {
    height: $hct-height;
  }

  &-render {
    height: calc(100% - $hct-height);
    display: flex;
    gap: 16px;

    &-chart,
    &-ui {
      width: 50%;
      height: 100%;
    }
  }
}
</style>
