import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import serve from "rollup-plugin-serve";
import copy from "rollup-plugin-copy";

const dev = process.env.ROLLUP_WATCH;
const name = "responsive-video";

export default [
  {
    input: "src/responsive-video.js",
    output: {
      file: `dist/${name}.esm.js`,
      format: "es",
      sourcemap: true,
    },
    plugins: [resolve()],
  },
  {
    input: "src/responsive-video.js",
    output: {
      file: `dist/${name}.cjs.js`,
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    plugins: [resolve()],
  },
  {
    input: "src/responsive-video.js",
    output: {
      file: `dist/${name}.js`,
      format: "umd",
      name: "ResponsiveVideo",
      sourcemap: true,
    },
    plugins: [resolve()],
  },
  {
    input: "src/responsive-video.js",
    output: {
      file: `dist/${name}.min.js`,
      format: "umd",
      name: "ResponsiveVideo",
      sourcemap: false,
    },
    plugins: [
      resolve(),
      terser({
        keep_classnames: true,
        format: { comments: false },
      }),
    ],
  },
  ...(dev
    ? [
        {
          input: "src/responsive-video.js",
          output: {
            file: `dist/${name}.esm.js`,
            format: "es",
            sourcemap: true,
          },
          plugins: [
            resolve(),
            serve({
              contentBase: ["dist", "demo"],
              open: true,
              port: 3006,
            }),
            copy({
              targets: [
                { src: `dist/${name}.esm.js`, dest: "demo" },
                { src: `dist/${name}.esm.js.map`, dest: "demo" },
              ],
              hook: "writeBundle",
            }),
          ],
        },
      ]
    : []),
];
