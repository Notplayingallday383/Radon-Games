import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import million from "million/compiler";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: `${libcurlPath}/**/*`.replace(/\\/g, "/"),
          dest: "libcurl",
          overwrite: false
        },
        {
          src: `${baremuxPath}/**/*`.replace(/\\/g, "/"),
          dest: "baremux",
          overwrite: false
        }
      ]
    }),
    {
      name: 'vite-wisp-server',
      configureServer(server) {
        server.httpServer?.on('upgrade', (req, socket, head) =>
          req.url?.startsWith('/wisp')
            ? wisp.routeRequest(req, socket, head)
            : undefined,
        );
      },
    },
    million.vite({ mode: "preact" })
  ],
  server: {
    headers: {
      "X-Frame-Options": "SAMEORIGIN"
    },
    proxy: {
      "/cdn": {
        target: "https://cdn.radon.games",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, ""),
        headers: {
          referer: "https://cdn.radon.games"
        }
      },
      "/api": {
        target: "https://api.radon.games",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        headers: {
          referer: "https://api.radon.games"
        }
      }
    }
  }
});
