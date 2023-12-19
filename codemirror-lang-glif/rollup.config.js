import typescript from "rollup-plugin-ts"
import {lezer} from "@lezer/generator/rollup"

export default {
  input: "src/index.ts",
  external: id => id != "tslib" && !/^(\.?\/|\w:)/.test(id),
  output: [
    {file: "dist/index.cjs", format: "cjs"},
    {dir: "./dist", format: "es"}
  ],
  plugins: [lezer(), typescript()]
}

/*
import {lezer} from "@lezer/generator/rollup"
import typescript from "rollup-plugin-ts"

export default {
    input: "./src/index.ts",
    output: [{
        format: "es",
        file: "./dist/index.js"
    }, {
        format: "cjs",
        file: "./dist/index.cjs"
    }],
    external: ["@lezer/lr", "@lezer/highlight"],
    plugins: [lezer(), typescript()]
}

*/
