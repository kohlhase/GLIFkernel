import {parser as glifcmdParser} from "./glifcmd.grammar"
import {LRLanguage, LanguageSupport} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const GLIFlanguage = LRLanguage.define({
  parser: glifcmdParser.configure({
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

export function GLIF() {
  return new LanguageSupport(GLIFlanguage)
}
