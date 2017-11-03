# diff-file
[![js-semistandard-style](https://cdn.rawgit.com/flet/semistandard/master/badge.svg)](https://github.com/Flet/semistandard)

Get linux file diff results

```js
const fileDiff = require('diff-file');
const getId = require('md5');
const result = await fileDiff(path.join(__dirname, 'newfile.txt', path.join(__dirname, 'oldfile.txt')), getId);

/*
  result = {
    raw: {
      new: [],
      old: []
    },
    trans: {
      id: {
        action,
        content
      }
    }
  };

*/
```
