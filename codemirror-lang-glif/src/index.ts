import {parser as glifscriptParser} from "./glifscript.grammar"
import {parser as glifcellParser} from "./glifcell.grammar"
import {parser as gfParser} from "./gf.grammar"
import {LRLanguage, LanguageSupport} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"
import {parseMixed} from "@lezer/common"


// GLIF SCRIPT

export const GLIFScriptLanguage = LRLanguage.define({
    parser: glifscriptParser.configure({
        props: [
            styleTags({
                CommandName: t.keyword,
                String: t.string,
                LineComment: t.lineComment,
                Pipe: t.controlOperator,
                ArgName: t.propertyName,
                Keywordval: t.labelName,
            })
        ]
    }),
    languageData: {
        commentTokens: {line: "#"}
    }
})

export function GLIFScript() {
    return new LanguageSupport(GLIFScriptLanguage)
}


// GF

export const GFLanguage = LRLanguage.define({
    parser: gfParser.configure({
        props: [
            styleTags({
                String: t.string,
                LineComment: t.lineComment,
                KeyWord: t.keyword,
                GrammarModifier: t.keyword,
                GrammarType: t.keyword,
                GrammarName: t.className,
            })
        ]
    }),
    languageData: {
        commentTokens: {line: "--"}
    }
})

export function GF() {
    return new LanguageSupport(GFLanguage)
}


// GLIF CELL

export const GLIFCellLanguage = LRLanguage.define({
    parser: glifcellParser.configure({
        props: [
            styleTags({
                Header: t.documentMeta,
            })
        ],
        wrap: parseMixed(node => {
            if (node.name == "MatchedGfContent" || node.name == "UnmatchedGfContent ") {
                console.log("GF CONTENT");
                return {parser: GFLanguage.parser};
            }
            if (node.name == "MatchedScriptContent" || node.name == "UnmatchedScriptContent") {
                console.log("SCRIPT CONTENT");
                return {parser: GLIFScriptLanguage.parser};
            }
            return null;
        })
    })
})


export function GLIFCell() {
    return new LanguageSupport(GLIFCellLanguage)
}
