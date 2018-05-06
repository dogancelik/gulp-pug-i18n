# gulp-pug-i18n

*i18n* library for [Pug](https://github.com/pugjs/pug) (previously Jade). This plugin extends *gulp-pug* with i18n functionality.

## How to use?

```js
var gulp = require('gulp');
var pug = require('gulp-pug-i18n');

gulp.task('default', function () {
  /*  input:
      - input/index.pug
      - input/about.pug
  */

  gulp.src('input/*.pug')
    .pipe(pug({
      i18n: {
        locales: 'locale/*' // locales: en.yml, de.json,
        filename: '{{basename}}.{{lang}}.html'
      },
      pretty: true // Pug option
    }))
    .pipe(gulp.dest('output/'));

  /*  output:
      - output/index.en.html
      - output/index.de.html
      - output/about.en.html
      - output/about.de.html
  */
});
```

## Configuration

Module function takes an object for configuration.

### *(optional)* `data` object

Pass additional data (including functions) to Pug.

**Example:** A *Markdown* function to use in template: `{ md: require('marked') }`

### `i18n` object

#### *(required)* `locales`

Path to search for i18n files. Supports glob patterns.

**Example:** `src/locale/*.{yml,json}`

#### *(optional)* `namespace`

**Default value:** `$i18n`

Set to *null* to use root scope.

#### *(optional)* `default`

Specify a default locale.
Plugin will remove single curly braces if it matches the current locale to the default locale that is set.
For more information check [Advanced Usage](#advanced-usage) below.

#### *(optional)* `filename`

How to name rendered Pug (Jade) files. Supports directories.

**Available variables:**

* Filename related: `basename`, `origname`, `origext`
* Locale related: `lang`, `script`, `region`, `sort`

*Note:* Add `_lower` to variable for lowercase, `_upper` for uppercase.

**Default value:** `{{basename}}.{{lang}}.html`

##### Advanced usage

Using single curly braces outside a double braces will make that variable only show if it's not empty.

For example if we use `{{basename}}{.{{lang}}}{-{{region}}}.html`, *lang* or *region* will be printed only if they are not empty.

1. `en_US` → `index.en-US.html`
1. `en` → `index.en.html`
1. `de_DE` → `index.de-DE.html`
1. `_DE` → `index-DE.html` (we are using this only to show this example, don't use like this)

Another example: `{{basename}}{-{{lang}}}{-{{region}}}.html`, default locale is `en`

1. `en` → `index.html`
1. `tr` → `index-tr.html`
