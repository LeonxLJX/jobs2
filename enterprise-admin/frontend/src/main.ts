import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import permissionDirective from './directives/permission';
import './styles/index.css';

const app = createApp(App);

// 注册 Element Plus 图标 / Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component as any);
}

app.use(createPinia());
app.use(router);
app.use(ElementPlus, { size: 'default' });

// 注册权限指令 / Register permission directive
app.directive('permission', permissionDirective);

app.mount('#app');
