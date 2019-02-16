# TSLint Rule: whitespace-before-colon

TSLint provides no means of controlling spaces before colon in object literals and destructuring assignments. `whitespace.check-type` checks only for space after colon, and `typedef-whitespace` works only for type definitions.

This rules determines if a space is required or not before the colon in object literals and destructuring assignments.

Related to [palantir/tslint#991](https://github.com/palantir/tslint/issues/991).

## Usage

Install with NPM or Yarn to your dev dependencies:

```
npm install --save-dev tslint-whitespace-before-colon
```

and enable it in your project's `tslint.json` file:

```json
{
  "extends": [
    "tslint-whitespace-before-colon"
  ],
  "rules": {
    "whitespace-before-colon": [true, "nospace"]
  }
}
```

## Configuration

Rule expects a single string option indicating the required number of spaces before colon:

* `"nospace"` requires no space
* `"onespace"` requires exactly one space
* `"space"` requires one or more spaces

If none of the above is provided, the rule will have no effect.

If a newline character (`"\n"`) is present, the rule validates regardless of the configured option, just as `typedef-whitespace` rule does.

## License

MIT
