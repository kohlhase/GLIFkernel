import {GLIFCellLanguage} from "../dist/index.js"
import {fileTests} from "@lezer/generator/test"
import { fileURLToPath } from 'url';
import {readdirSync, readFileSync} from "fs"
import {join, dirname} from "path"

function parseTests(dir) {
    for (let file of readdirSync(dir)) {
        if (!/\.testcase$/.test(file)) continue
        let tests = fileTests(readFileSync(join(dir, file), "utf8"), file)
        describe(file, () => {
            for (let {name, run} of tests) it(name, () => run(GLIFCellLanguage.parser))
        })
    }
}


parseTests(dirname(fileURLToPath(import.meta.url)))
