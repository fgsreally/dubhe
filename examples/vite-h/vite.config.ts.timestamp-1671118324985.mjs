// vite.config.ts
import vue from "file:///D:/MyProject/11/tianshu/node_modules/.pnpm/registry.npmmirror.com+@vitejs+plugin-vue@3.2.0_vite@3.2.4+vue@3.2.45/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { Consumer } from "file:///D:/MyProject/11/tianshu/packages/core/dist/vite.mjs";
import { DubheResolver } from "file:///D:/MyProject/11/tianshu/packages/core/dist/index.mjs";
import AutoImport from "file:///D:/MyProject/11/tianshu/node_modules/.pnpm/registry.npmmirror.com+unplugin-auto-import@0.11.5/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/MyProject/11/tianshu/node_modules/.pnpm/registry.npmmirror.com+unplugin-vue-components@0.22.11_vue@3.2.45/node_modules/unplugin-vue-components/dist/vite.mjs";
import { ElementPlusResolver } from "file:///D:/MyProject/11/tianshu/node_modules/.pnpm/registry.npmmirror.com+unplugin-vue-components@0.22.11_vue@3.2.45/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import Inspect from "file:///D:/MyProject/11/tianshu/node_modules/.pnpm/registry.npmmirror.com+vite-plugin-inspect@0.7.9_vite@3.2.4/node_modules/vite-plugin-inspect/dist/index.mjs";
var vite_config_default = ({ mode }) => {
  return {
    optimizeDeps: {
      exclude: []
    },
    server: {
      port: 4100
    },
    plugins: [
      Inspect(),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver(), DubheResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver(), DubheResolver()]
      }),
      Consumer()
    ]
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxNeVByb2plY3RcXFxcMTFcXFxcdGlhbnNodVxcXFxleGFtcGxlc1xcXFx2aXRlLWhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXE15UHJvamVjdFxcXFwxMVxcXFx0aWFuc2h1XFxcXGV4YW1wbGVzXFxcXHZpdGUtaFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovTXlQcm9qZWN0LzExL3RpYW5zaHUvZXhhbXBsZXMvdml0ZS1oL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHR5cGUgeyBDb25maWdFbnYsIFVzZXJDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgeyBDb25zdW1lciB9IGZyb20gJ2R1YmhlL3ZpdGUnXG5pbXBvcnQgeyBEdWJoZVJlc29sdmVyIH0gZnJvbSAnZHViaGUnXG5cbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcbmltcG9ydCBJbnNwZWN0IGZyb20gJ3ZpdGUtcGx1Z2luLWluc3BlY3QnXG5leHBvcnQgZGVmYXVsdCAoeyBtb2RlIH06IENvbmZpZ0Vudik6IFVzZXJDb25maWcgPT4ge1xuICByZXR1cm4ge1xuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogW10sIC8vIGl0IGRvZXNuJ3Qgd29ya1xuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiA0MTAwLFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgSW5zcGVjdCgpLFxuICAgICAgdnVlKCksXG4gICAgICBBdXRvSW1wb3J0KHtcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpLCBEdWJoZVJlc29sdmVyKCldLFxuICAgICAgfSksXG4gICAgICBDb21wb25lbnRzKHtcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpLCBEdWJoZVJlc29sdmVyKCldLFxuICAgICAgfSksXG4gICAgICBDb25zdW1lcigpLFxuICAgIF0sXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFNBQVM7QUFDaEIsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxxQkFBcUI7QUFFOUIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFDcEMsT0FBTyxhQUFhO0FBQ3BCLElBQU8sc0JBQVEsQ0FBQyxFQUFFLEtBQUssTUFBNkI7QUFDbEQsU0FBTztBQUFBLElBQ0wsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDO0FBQUEsSUFDWjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFFBQVE7QUFBQSxNQUNSLElBQUk7QUFBQSxNQUNKLFdBQVc7QUFBQSxRQUNULFdBQVcsQ0FBQyxvQkFBb0IsR0FBRyxjQUFjLENBQUM7QUFBQSxNQUNwRCxDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLEdBQUcsY0FBYyxDQUFDO0FBQUEsTUFDcEQsQ0FBQztBQUFBLE1BQ0QsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
