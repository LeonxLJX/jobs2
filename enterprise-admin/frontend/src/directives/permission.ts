import type { Directive, DirectiveBinding } from 'vue';
import { usePermissionStore } from '@/stores/permission';

// 按钮级权限指令 v-permission / Button-level permission directive
// 用法 / Usage: v-permission="'system:user:add'" 或 / or v-permission="['system:user:add','system:user:edit']"
const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    if (!value) return;

    const permissionStore = usePermissionStore();
    const codes = Array.isArray(value) ? value : [value];
    // 满足任意一个权限码即显示 / Show if any code matches
    const hasAuth = codes.some((code: string) => permissionStore.hasPermission(code));

    if (!hasAuth) {
      // 移除元素 / Remove element
      el.parentNode?.removeChild(el);
    }
  },
};

export default permissionDirective;
