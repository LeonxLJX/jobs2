/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 自动导入类型声明 / Auto import type declarations
declare module 'vue' {
  export interface ComponentCustomProperties {
    $message: any;
  }
}
