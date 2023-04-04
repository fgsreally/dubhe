// vite.config.ts
import vue from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+@vitejs+plugin-vue@4.0.0_vite@4.1.1_vue@3.2.47/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { Sub } from "file:///D:/MyProject/3/test/dubhe/packages/sub/dist/vite.mjs";
import { DubheResolver } from "file:///D:/MyProject/3/test/dubhe/packages/sub/dist/index.mjs";
import AutoImport from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+unplugin-auto-import@0.14.2/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+unplugin-vue-components@0.22.12_rollup@2.78.1_vue@3.2.47/node_modules/unplugin-vue-components/dist/vite.mjs";
import { ElementPlusResolver } from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+unplugin-vue-components@0.22.12_rollup@2.78.1_vue@3.2.47/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import { visualizer } from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+rollup-plugin-visualizer@5.9.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import Inspect from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+vite-plugin-inspect@0.7.15_vite@4.1.1/node_modules/vite-plugin-inspect/dist/index.mjs";

// dubhe.config.ts
var dubhe_config_default = {
  remote: {
    viteout: {
      url: "http://127.0.0.1:8080",
      mode: process.env.HOTBUILD ? "hot" : "cold"
    },
    // remote static server
    esbuildpub: {
      url: "http://127.0.0.1:8081",
      mode: process.env.HOTBUILD ? "hot" : "cold"
    }
  },
  externals: (id) => {
    if (process.env.TEST) {
      if (id === "vue" || id.includes("element-plus")) {
        return {
          esm: `dubhe:${id}`,
          // only work for test
          systemjs: `dubhe:${id}`
          // only work for test
        };
      }
    }
  },
  injectHtml: true,
  systemjs: true,
  cache: false,
  types: true,
  info: false,
  polyfill: {
    importMap: true
  }
};

// vite.config.ts
var vite_config_default = () => {
  return {
    optimizeDeps: {
      exclude: []
      // it doesn't work
    },
    build: {
      outDir: process.env.HOTBUILD ? "dist/hot" : "dist/cold"
    },
    server: {
      port: 4100
    },
    plugins: [
      Inspect(),
      visualizer(),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver(), DubheResolver(dubhe_config_default)]
      }),
      Components({
        resolvers: [ElementPlusResolver(), DubheResolver(dubhe_config_default)]
      }),
      Sub(dubhe_config_default)
    ]
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiZHViaGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcTXlQcm9qZWN0XFxcXDNcXFxcdGVzdFxcXFxkdWJoZVxcXFxleGFtcGxlc1xcXFx2aXRlLXN1YlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcTXlQcm9qZWN0XFxcXDNcXFxcdGVzdFxcXFxkdWJoZVxcXFxleGFtcGxlc1xcXFx2aXRlLXN1YlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovTXlQcm9qZWN0LzMvdGVzdC9kdWJoZS9leGFtcGxlcy92aXRlLXN1Yi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB7IFN1YiB9IGZyb20gJ2R1YmhlLXN1Yi92aXRlJ1xuaW1wb3J0IHsgRHViaGVSZXNvbHZlciB9IGZyb20gJ2R1YmhlLXN1YidcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXG5pbXBvcnQgSW5zcGVjdCBmcm9tICd2aXRlLXBsdWdpbi1pbnNwZWN0J1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2R1YmhlLmNvbmZpZydcbmV4cG9ydCBkZWZhdWx0ICgpOiBVc2VyQ29uZmlnID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGV4Y2x1ZGU6IFtdLCAvLyBpdCBkb2Vzbid0IHdvcmtcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IHByb2Nlc3MuZW52LkhPVEJVSUxEID8gJ2Rpc3QvaG90JyA6ICdkaXN0L2NvbGQnLFxuXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDQxMDAsXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICBJbnNwZWN0KCksXG4gICAgICB2aXN1YWxpemVyKCksXG4gICAgICB2dWUoKSxcbiAgICAgIEF1dG9JbXBvcnQoe1xuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCksIER1YmhlUmVzb2x2ZXIoY29uZmlnKV0sXG4gICAgICB9KSxcbiAgICAgIENvbXBvbmVudHMoe1xuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCksIER1YmhlUmVzb2x2ZXIoY29uZmlnKV0sXG4gICAgICB9KSxcbiAgICAgIFN1Yihjb25maWcpLFxuICAgIF0sXG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcTXlQcm9qZWN0XFxcXDNcXFxcdGVzdFxcXFxkdWJoZVxcXFxleGFtcGxlc1xcXFx2aXRlLXN1YlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcTXlQcm9qZWN0XFxcXDNcXFxcdGVzdFxcXFxkdWJoZVxcXFxleGFtcGxlc1xcXFx2aXRlLXN1YlxcXFxkdWJoZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L015UHJvamVjdC8zL3Rlc3QvZHViaGUvZXhhbXBsZXMvdml0ZS1zdWIvZHViaGUuY29uZmlnLnRzXCI7aW1wb3J0IHR5cGUgeyBTdWJDb25maWcgfSBmcm9tICdkdWJoZS1zdWInXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbW90ZToge1xuICAgIHZpdGVvdXQ6IHtcbiAgICAgIHVybDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODA4MCcsXG4gICAgICBtb2RlOiBwcm9jZXNzLmVudi5IT1RCVUlMRCA/ICdob3QnIDogJ2NvbGQnLFxuICAgIH0sIC8vIHJlbW90ZSBzdGF0aWMgc2VydmVyXG4gICAgZXNidWlsZHB1Yjoge1xuICAgICAgdXJsOiAnaHR0cDovLzEyNy4wLjAuMTo4MDgxJyxcbiAgICAgIG1vZGU6IHByb2Nlc3MuZW52LkhPVEJVSUxEID8gJ2hvdCcgOiAnY29sZCcsXG4gICAgfSxcbiAgfSxcbiAgZXh0ZXJuYWxzOiAoaWQpID0+IHtcbiAgICBpZihwcm9jZXNzLmVudi5URVNUKXtcbiAgICAgIGlmIChpZCA9PT0gJ3Z1ZScgfHwgaWQuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXNtOiBgZHViaGU6JHtpZH1gLC8vIG9ubHkgd29yayBmb3IgdGVzdFxuICAgICAgICAgIHN5c3RlbWpzOiBgZHViaGU6JHtpZH1gLC8vIG9ubHkgd29yayBmb3IgdGVzdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuIFxuICB9LFxuICBpbmplY3RIdG1sOiB0cnVlLFxuICBzeXN0ZW1qczogdHJ1ZSxcbiAgY2FjaGU6IGZhbHNlLFxuICB0eXBlczogdHJ1ZSxcbiAgaW5mbzogZmFsc2UsXG4gIHBvbHlmaWxsOiB7XG4gICAgaW1wb3J0TWFwOiB0cnVlLFxuICB9LFxufSBhcyBTdWJDb25maWdcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFNBQVM7QUFDaEIsU0FBUyxXQUFXO0FBQ3BCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBQ3BDLFNBQVMsa0JBQWtCO0FBQzNCLE9BQU8sYUFBYTs7O0FDUHBCLElBQU8sdUJBQVE7QUFBQSxFQUNiLFFBQVE7QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNQLEtBQUs7QUFBQSxNQUNMLE1BQU0sUUFBUSxJQUFJLFdBQVcsUUFBUTtBQUFBLElBQ3ZDO0FBQUE7QUFBQSxJQUNBLFlBQVk7QUFBQSxNQUNWLEtBQUs7QUFBQSxNQUNMLE1BQU0sUUFBUSxJQUFJLFdBQVcsUUFBUTtBQUFBLElBQ3ZDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsV0FBVyxDQUFDLE9BQU87QUFDakIsUUFBRyxRQUFRLElBQUksTUFBSztBQUNsQixVQUFJLE9BQU8sU0FBUyxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9DLGVBQU87QUFBQSxVQUNMLEtBQUssU0FBUztBQUFBO0FBQUEsVUFDZCxVQUFVLFNBQVM7QUFBQTtBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUVGO0FBQUEsRUFDQSxZQUFZO0FBQUEsRUFDWixVQUFVO0FBQUEsRUFDVixPQUFPO0FBQUEsRUFDUCxPQUFPO0FBQUEsRUFDUCxNQUFNO0FBQUEsRUFDTixVQUFVO0FBQUEsSUFDUixXQUFXO0FBQUEsRUFDYjtBQUNGOzs7QURyQkEsSUFBTyxzQkFBUSxNQUFrQjtBQUMvQixTQUFPO0FBQUEsSUFDTCxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUM7QUFBQTtBQUFBLElBQ1o7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVEsUUFBUSxJQUFJLFdBQVcsYUFBYTtBQUFBLElBRTlDO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsSUFBSTtBQUFBLE1BQ0osV0FBVztBQUFBLFFBQ1QsV0FBVyxDQUFDLG9CQUFvQixHQUFHLGNBQWMsb0JBQU0sQ0FBQztBQUFBLE1BQzFELENBQUM7QUFBQSxNQUNELFdBQVc7QUFBQSxRQUNULFdBQVcsQ0FBQyxvQkFBb0IsR0FBRyxjQUFjLG9CQUFNLENBQUM7QUFBQSxNQUMxRCxDQUFDO0FBQUEsTUFDRCxJQUFJLG9CQUFNO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
