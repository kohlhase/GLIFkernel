import {parser as glifscriptParser} from "./glifscript.grammar"
import {parser as glifcellParser} from "./glifcell.grammar"
import {parser as gfParser} from "./gf.grammar"
import {parser as mmtParser} from "./mmt.grammar"
import {parser as elpiParser} from "./elpi.grammar.js"
import {TypingPred, ModulePred, ElpiKeyword, other_token} from "./elpi.grammar.terms.js"
import {specialize_elpi_ident} from "./elpitokens"

import {LRLanguage, LanguageSupport, indentNodeProp, continuedIndent, delimitedIndent} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"
import {parseMixed} from "@lezer/common"


// GLIF SCRIPT

export const GLIFScriptLanguage = LRLanguage.define({
    parser: glifscriptParser.configure({
        props: [
            indentNodeProp.add({
                Command: continuedIndent(),
                SingleCommand: continuedIndent(),
            }),
            styleTags({
                CommandName: t.keyword,
                String: t.string,
                LineComment: t.lineComment,
                // Pipe: t.controlOperator,
                ArgName: t.propertyName,
                // Keywordval: t.labelName,
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
            indentNodeProp.add({
                Section: continuedIndent(),   // todo: while typing, it always assumes we are done with the section and de-dents
                MainModBody: delimitedIndent({closing: "}"}),
                BlockComment: delimitedIndent({closing: "-}"}),
                BracketedPattern: delimitedIndent({closing: ")"}),
                ParenExpr: delimitedIndent({closing: ")"}),
                RecordExpr: delimitedIndent({closing: "}"}),
                TupleExpr: delimitedIndent({closing: ">"}),
            }),
            styleTags({
                String: t.string,
                LineComment: t.lineComment,
                KeyWord: t.keyword,
                GrammarModifier: t.keyword,
                GrammarType: t.keyword,
                GrammarName: t.className,
                Pragma: t.special(t.lineComment),
                BlockComment: t.blockComment,
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


// MMT

export const MMTLanguage = LRLanguage.define({
    parser: mmtParser.configure({
        props: [
            indentNodeProp.add({
                Module: delimitedIndent({closing: "❚"}),
                Declaration: delimitedIndent({closing: "❙"}),
                Object: delimitedIndent({closing: "❘"}),
                DeclarationComment: delimitedIndent({closing: "❙"}),
                ModuleComment: delimitedIndent({closing: "❚"}),
            }),
            styleTags({
                KeyWord: t.keyword,
                ModuleComment: t.blockComment,
                DeclarationComment: t.blockComment,
                ModuleName: t.definition(t.className),
                NotationObject: t.regexp,
                TypeObject: t.typeName,
                ModuleRef: t.name,
                OD: t.punctuation,
                DD: t.punctuation,
                MD: t.punctuation,
            })
        ]
    })
})

export function MMT() {
    return new LanguageSupport(MMTLanguage)
}


// ELPI

export const ELPILanguage = LRLanguage.define({
    parser: elpiParser.configure({
        props: [
            indentNodeProp.add({
                Rule: delimitedIndent({closing: ".", align: false}),
            }),
            styleTags({
                LineComment: t.lineComment,
                BlockComment: t.blockComment,
                String: t.string,
                Int: t.integer,
                TypingPred: t.keyword,
                ModulePred: t.keyword,
                Variable: t.propertyName,    // t.variableName typically has no highlighting
                Discard_variable: t.propertyName,
            })
        ],
        specializers: [{
            from: specialize_elpi_ident,
            to: value => {
                if (value == "kind" || value == "type" || value == "pred") { return TypingPred; }
                if (value == "accumulate") { return ModulePred; }
                if (value == "pi") { return ElpiKeyword; }
                return other_token;
            }
        }]
    })
})

export function ELPI() {
    return new LanguageSupport(ELPILanguage)
}


// GLIF CELL

export const GLIFCellLanguage = LRLanguage.define({
    parser: glifcellParser.configure({
        props: [
            styleTags({
                ElpiHeader: t.documentMeta,
                MmtHeader: t.documentMeta,
                ScriptHeader: t.documentMeta,
                GfHeader: t.documentMeta,
                LineComment: t.lineComment,
                BlockComment: t.blockComment,
            })
        ],
        wrap: parseMixed(node => {
            if (node.name == "MatchedGfContent" || node.name == "UnmatchedGfContent") {
                // console.log("GF CONTENT");
                return {parser: GFLanguage.parser};
            }
            if (node.name == "MatchedMmtContent" || node.name == "UnmatchedMmtContent") {
                // console.log("MMT CONTENT");
                return {parser: MMTLanguage.parser};
            }
            if (node.name == "MatchedElpiContent" || node.name == "UnmatchedElpiContent") {
                // console.log("ELPI CONTENT");
                return {parser: ELPILanguage.parser};
            }
            if (node.name == "MatchedScriptContent" || node.name == "UnmatchedScriptContent") {
                // console.log("SCRIPT CONTENT");
                return {parser: GLIFScriptLanguage.parser};
            }
            return null;
        }),
    })
})


export function GLIFCell() {
    return new LanguageSupport(GLIFCellLanguage)
}
