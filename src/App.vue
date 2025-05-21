<script setup lang="ts">
import Form from '@/components/Form.vue';
import Display from '@/components/Display.vue';
</script>

<template>
  <aside class="form-wrapper">
    <Form />
  </aside>
  <main class="display-wrapper">
    <Display />
  </main>
</template>

<style scoped lang="scss">
$form-width: 35%;

.form-wrapper {
  width: $form-width;
  height: 100%;
  padding: 16px 10px 16px 20px;
}
.display-wrapper {
  width: calc(100% - $form-width);
  height: 100%;
  padding: 16px 20px 16px 10px;
}
</style>
