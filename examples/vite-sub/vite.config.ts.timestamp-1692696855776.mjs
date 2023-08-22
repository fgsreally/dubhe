// vite.config.ts
import vue from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+@vitejs+plugin-vue@4.0.0_vite@4.1.1_vue@3.2.47/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { Sub } from "file:///D:/MyProject/3/test/dubhe/packages/sub/dist/vite.mjs";
import { Pub } from "file:///D:/MyProject/3/test/dubhe/packages/pub/dist/vite.mjs";
import { DubheResolver } from "file:///D:/MyProject/3/test/dubhe/packages/sub/dist/index.mjs";
import AutoImport from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+unplugin-auto-import@0.14.2/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+unplugin-vue-components@0.22.12_vue@3.2.47/node_modules/unplugin-vue-components/dist/vite.mjs";
import { ElementPlusResolver } from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+unplugin-vue-components@0.22.12_vue@3.2.47/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import { visualizer } from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+rollup-plugin-visualizer@5.9.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import Inspect from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+vite-plugin-inspect@0.7.15_vite@4.1.1/node_modules/vite-plugin-inspect/dist/index.mjs";
import Legacy from "file:///D:/MyProject/3/test/dubhe/node_modules/.pnpm/registry.npmmirror.com+@vitejs+plugin-legacy@4.0.1_vite@4.1.1/node_modules/@vitejs/plugin-legacy/dist/index.mjs";

// dubhe.config.ts
var dubhe_config_default = {
  project: "vitesub",
  remote: {
    viteout: {
      url: "http://127.0.0.1:8080",
      mode: process.env.HOTBUILD ? "hot" : "cold"
    }
    // remote static server
  },
  externals: (id) => {
    if (id === "vue") {
      return {
        esm: "./vue.js"
        // only work for test
      };
    }
    if (id.includes("element-plus"))
      return { esm: "./element-plus.js" };
  },
  // injectOpts: {
  //   importmap: 'link',
  //   systemjs: 'link',
  // },
  cache: !process.env.CI,
  types: true,
  info: false,
  polyfill: {
    importMap: true
  }
};

// vite.config.ts
var pubConfig = {
  project: "vitesub",
  entry: {
    app: "./src/App.vue"
  },
  types: true,
  // limit: 1000,
  externals: (id) => {
    if (id.startsWith("element-plus") || id === "vue")
      return true;
  },
  app: true,
  outDir: process.env.HOTBUILD ? "dist/hot" : "dist/cold",
  source: false
};
var vite_config_default = () => {
  return {
    optimizeDeps: {
      exclude: []
      // it doesn't work
    },
    build: {
      sourcemap: true
    },
    server: {
      port: 4100
    },
    plugins: [
      Inspect(),
      Legacy(),
      visualizer(),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver(), DubheResolver(dubhe_config_default)]
      }),
      Components({
        resolvers: [ElementPlusResolver(), DubheResolver(dubhe_config_default)]
      }),
      Sub(dubhe_config_default),
      Pub(pubConfig)
    ]
  };
};
export {
  vite_config_default as default,
  pubConfig
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiZHViaGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcTXlQcm9qZWN0XFxcXDNcXFxcdGVzdFxcXFxkdWJoZVxcXFxleGFtcGxlc1xcXFx2aXRlLXN1YlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcTXlQcm9qZWN0XFxcXDNcXFxcdGVzdFxcXFxkdWJoZVxcXFxleGFtcGxlc1xcXFx2aXRlLXN1YlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovTXlQcm9qZWN0LzMvdGVzdC9kdWJoZS9leGFtcGxlcy92aXRlLXN1Yi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB7IFN1YiB9IGZyb20gJ2R1YmhlLXN1Yi92aXRlJ1xuaW1wb3J0IHsgUHViIH0gZnJvbSAnZHViaGUtcHViL3ZpdGUnXG5pbXBvcnQgeyBEdWJoZVJlc29sdmVyIH0gZnJvbSAnZHViaGUtc3ViJ1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJ1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcbmltcG9ydCBJbnNwZWN0IGZyb20gJ3ZpdGUtcGx1Z2luLWluc3BlY3QnXG5pbXBvcnQgTGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSdcbmltcG9ydCBjb25maWcgZnJvbSAnLi9kdWJoZS5jb25maWcnXG5leHBvcnQgY29uc3QgcHViQ29uZmlnID0ge1xuICBwcm9qZWN0OiAndml0ZXN1YicsXG4gIGVudHJ5OiB7XG4gICAgYXBwOiAnLi9zcmMvQXBwLnZ1ZScsXG4gIH0sXG4gIHR5cGVzOiB0cnVlLFxuICAvLyBsaW1pdDogMTAwMCxcbiAgZXh0ZXJuYWxzOiAoaWQpID0+IHtcbiAgICBpZiAoaWQuc3RhcnRzV2l0aCgnZWxlbWVudC1wbHVzJykgfHwgaWQgPT09ICd2dWUnKVxuICAgICAgcmV0dXJuIHRydWVcbiAgfSxcbiAgYXBwOiB0cnVlLFxuICBvdXREaXI6IHByb2Nlc3MuZW52LkhPVEJVSUxEID8gJ2Rpc3QvaG90JyA6ICdkaXN0L2NvbGQnLFxuICBzb3VyY2U6IGZhbHNlLFxufSBhcyBQdWJDb25maWdcbmV4cG9ydCBkZWZhdWx0ICgpOiBVc2VyQ29uZmlnID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGV4Y2x1ZGU6IFtdLCAvLyBpdCBkb2Vzbid0IHdvcmtcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG5cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogNDEwMCxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIEluc3BlY3QoKSxcbiAgICAgIExlZ2FjeSgpLFxuICAgICAgdmlzdWFsaXplcigpLFxuICAgICAgdnVlKCksXG4gICAgICBBdXRvSW1wb3J0KHtcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpLCBEdWJoZVJlc29sdmVyKGNvbmZpZyldLFxuICAgICAgfSksXG4gICAgICBDb21wb25lbnRzKHtcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpLCBEdWJoZVJlc29sdmVyKGNvbmZpZyldLFxuICAgICAgfSksXG4gICAgICBTdWIoY29uZmlnKSxcbiAgICAgIFB1YihwdWJDb25maWcpLFxuICAgIF0sXG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcTXlQcm9qZWN0XFxcXDNcXFxcdGVzdFxcXFxkdWJoZVxcXFxleGFtcGxlc1xcXFx2aXRlLXN1YlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcTXlQcm9qZWN0XFxcXDNcXFxcdGVzdFxcXFxkdWJoZVxcXFxleGFtcGxlc1xcXFx2aXRlLXN1YlxcXFxkdWJoZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L015UHJvamVjdC8zL3Rlc3QvZHViaGUvZXhhbXBsZXMvdml0ZS1zdWIvZHViaGUuY29uZmlnLnRzXCI7aW1wb3J0IHR5cGUgeyBTdWJDb25maWcgfSBmcm9tICdkdWJoZS1zdWInXG5leHBvcnQgZGVmYXVsdCB7XG4gIHByb2plY3Q6ICd2aXRlc3ViJyxcbiAgcmVtb3RlOiB7XG4gICAgdml0ZW91dDoge1xuICAgICAgdXJsOiAnaHR0cDovLzEyNy4wLjAuMTo4MDgwJyxcbiAgICAgIG1vZGU6IHByb2Nlc3MuZW52LkhPVEJVSUxEID8gJ2hvdCcgOiAnY29sZCcsXG4gICAgfSwgLy8gcmVtb3RlIHN0YXRpYyBzZXJ2ZXJcblxuICB9LFxuICBleHRlcm5hbHM6IChpZCkgPT4ge1xuICAgIGlmIChpZCA9PT0gJ3Z1ZScpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVzbTogJy4vdnVlLmpzJywgLy8gb25seSB3b3JrIGZvciB0ZXN0XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpZC5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykpXG4gICAgICByZXR1cm4geyBlc206ICcuL2VsZW1lbnQtcGx1cy5qcycgfVxuICB9LFxuICAvLyBpbmplY3RPcHRzOiB7XG4gIC8vICAgaW1wb3J0bWFwOiAnbGluaycsXG4gIC8vICAgc3lzdGVtanM6ICdsaW5rJyxcbiAgLy8gfSxcbiAgY2FjaGU6ICFwcm9jZXNzLmVudi5DSSxcbiAgdHlwZXM6IHRydWUsXG4gIGluZm86IGZhbHNlLFxuICBwb2x5ZmlsbDoge1xuICAgIGltcG9ydE1hcDogdHJ1ZSxcbiAgfSxcbn0gYXMgU3ViQ29uZmlnXG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFNBQVM7QUFDaEIsU0FBUyxXQUFXO0FBQ3BCLFNBQVMsV0FBVztBQUNwQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLDJCQUEyQjtBQUNwQyxTQUFTLGtCQUFrQjtBQUMzQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxZQUFZOzs7QUNUbkIsSUFBTyx1QkFBUTtBQUFBLEVBQ2IsU0FBUztBQUFBLEVBQ1QsUUFBUTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsS0FBSztBQUFBLE1BQ0wsTUFBTSxRQUFRLElBQUksV0FBVyxRQUFRO0FBQUEsSUFDdkM7QUFBQTtBQUFBLEVBRUY7QUFBQSxFQUNBLFdBQVcsQ0FBQyxPQUFPO0FBQ2pCLFFBQUksT0FBTyxPQUFPO0FBQ2hCLGFBQU87QUFBQSxRQUNMLEtBQUs7QUFBQTtBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQ0EsUUFBSSxHQUFHLFNBQVMsY0FBYztBQUM1QixhQUFPLEVBQUUsS0FBSyxvQkFBb0I7QUFBQSxFQUN0QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLQSxPQUFPLENBQUMsUUFBUSxJQUFJO0FBQUEsRUFDcEIsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sVUFBVTtBQUFBLElBQ1IsV0FBVztBQUFBLEVBQ2I7QUFDRjs7O0FEakJPLElBQU0sWUFBWTtBQUFBLEVBQ3ZCLFNBQVM7QUFBQSxFQUNULE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxFQUNQO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxFQUVQLFdBQVcsQ0FBQyxPQUFPO0FBQ2pCLFFBQUksR0FBRyxXQUFXLGNBQWMsS0FBSyxPQUFPO0FBQzFDLGFBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxLQUFLO0FBQUEsRUFDTCxRQUFRLFFBQVEsSUFBSSxXQUFXLGFBQWE7QUFBQSxFQUM1QyxRQUFRO0FBQ1Y7QUFDQSxJQUFPLHNCQUFRLE1BQWtCO0FBQy9CLFNBQU87QUFBQSxJQUNMLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQztBQUFBO0FBQUEsSUFDWjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBLElBRWI7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsTUFDWCxJQUFJO0FBQUEsTUFDSixXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLEdBQUcsY0FBYyxvQkFBTSxDQUFDO0FBQUEsTUFDMUQsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLFFBQ1QsV0FBVyxDQUFDLG9CQUFvQixHQUFHLGNBQWMsb0JBQU0sQ0FBQztBQUFBLE1BQzFELENBQUM7QUFBQSxNQUNELElBQUksb0JBQU07QUFBQSxNQUNWLElBQUksU0FBUztBQUFBLElBQ2Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
