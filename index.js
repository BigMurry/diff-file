const { spawn } = require('child_process');
const md5 = require('md5');
const split = require('split2');
const ACTIONS = {
  CREATE: 1,
  UPDATE: 2,
  DELETE: 3
};

function diffFile (newFile, oldFile, getId = md5) {
  const out = spawn('diff', [newFile, oldFile]);
  return new Promise((resolve, reject) => {
    const result = {
      raw: {
        new: [],
        old: []
      },
      trans: {}
    };
    out.stdout.pipe(split()).on('data', line => {
      const str = line.toString();
      if (!/^(:?>|<)/.test(str)) {
        return;
      }
      const content = str.substr(2);
      const id = getId(content);
      let action = ACTIONS.CREATE;
      if (/^</.test(str)) {
        result.raw.new.push(content);
        if (result.trans[id] && result.trans[id].action === ACTIONS.DELETE) {
          action = ACTIONS.UPDATE;
        } else {
          action = result.trans[id] && result.trans[id].action ? result.trans[id].action : ACTIONS.CREATE;
        }
        result.trans[id] = {
          action,
          content
        };
      } else if (/^>/.test(str)) {
        result.raw.old.push(content);
        if (result.trans[id] && result.trans[id].action === ACTIONS.CREATE) {
          result.trans[id].action = ACTIONS.UPDATE;
        } else if (!result.trans[id]) {
          result.trans[id] = {
            action: ACTIONS.DELETE,
            content
          };
        }
      }
    });
    out.stderr.on('data', err => {
      console.log(err.toString());
    });
    out.on('close', code => {
      /*
       * 0: no differencies were found
       * 1: differencies were found
       * 2: have trouble
       */
      if (code > 1) {
        reject(new Error(`diff files error, with exit code ${code}`));
        return;
      }
      resolve(result);
    });
  });
}
module.exports = diffFile;
module.exports.ACTIONS = ACTIONS;
