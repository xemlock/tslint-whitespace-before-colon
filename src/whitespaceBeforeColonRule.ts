import * as ts from 'typescript';
import * as Lint from 'tslint';

type Option = 'nospace' | 'onespace' | 'space';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'whitespace-before-colon',
    description: Lint.Utils.dedent`
      Determines if a space is required or not before the colon in object literals
      and destructuring assignments.

      If a newline character (\`"\\n"\`) is present, the rule validates regardless
      of the configured option, just as \`typedef-whitespace\` rule does.
    `,
    rationale: Lint.Utils.dedent`
      TSLint provides no means of controlling spaces before colon in object literals
      and destructuring assignments. \`whitespace.check-type\` checks only for space
      after colon, and \`typedef-whitespace\` works only for type definitions.

      Related to [palantir/tslint#991](https://github.com/palantir/tslint/issues/991).
    `,
    optionsDescription: Lint.Utils.dedent`
      An option indicating the required number of spaces before colon must be provided:

      * \`"nospace"\` requires no space
      * \`"onespace"\` requires exactly one space
      * \`"space"\` requires one or more spaces
    `,
    options: {
      type: 'string',
      enum: ['nospace', 'onespace', 'space'],
    },
    optionExamples: [
      [true, 'onespace'],
    ],
    type: 'style',
    typescriptOnly: false,
    hasFix: true,
  };

  public static FAILURE_STRING(option: string) {
    return `expected ${option} before colon`;
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new RuleWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class RuleWalker extends Lint.RuleWalker {
  private option?: Option;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    const [option] = this.getOptions();

    if (['nospace', 'onespace', 'space'].indexOf(option) !== -1) {
      this.option = option;
    }
  }

  public visitNode(node: ts.Node) {
    if (
      node.kind === ts.SyntaxKind.PropertyAssignment ||
      node.kind === ts.SyntaxKind.BindingElement
    ) {
      for (const child of node.getChildren()) {
        if (child.kind === ts.SyntaxKind.ColonToken) {
          this.checkWhitespace(child);
        }
      }
    }
    super.visitNode(node);
  }

  private checkWhitespace(colon: ts.Node) {
    const start = colon.pos; // position of whitespace before ':' in ColonToken
    const end = colon.end; // position of ':'
    const text = this.getSourceFile().text.substring(start, end);

    const match = text.match(/^(\s+)/);
    const whitespace = match && match[1] || '';

    if (whitespace.includes('\n')) {
      return;
    }

    const { option } = this;

    if (!option || option === 'space' && whitespace.length) {
      return;
    }

    const requiredLength = option === 'nospace' ? 0 : 1;

    if (whitespace.length !== requiredLength) {
      this.addFailureAt(
        start,
        whitespace.length,
        Rule.FAILURE_STRING(option),
        Lint.Replacement.replaceFromTo(start, start + whitespace.length, ' '.repeat(requiredLength))
      );
    }
  }
}
