const test = require('tap').test;
const md5 = require('md5');
const path = require('path');
const diffFile = require('../');
const ACTIONS = diffFile.ACTIONS;

test('md5', async (t) => {
  t.plan(1);
  const result = await diffFile(path.join(__dirname, 'new.txt'), path.join(__dirname, 'old.txt'), md5);
  const expected = {
    raw: {
      new: [
        'I need to wash the car.',
        'I need to get the dog detailed.'
      ],
      old: [
        'This the line deleted.',
        'I need to run the laundry.',
        'I need to wash the dog.'
      ]
    },
    trans: {
      [md5('I need to wash the car.')]: {
        action: ACTIONS.CREATE,
        content: 'I need to wash the car.'
      },
      [md5('I need to get the dog detailed.')]: {
        action: ACTIONS.CREATE,
        content: 'I need to get the dog detailed.'
      },
      [md5('This the line deleted.')]: {
        action: ACTIONS.DELETE,
        content: 'This the line deleted.'
      },
      [md5('I need to run the laundry.')]: {
        action: ACTIONS.DELETE,
        content: 'I need to run the laundry.'
      },
      [md5('I need to wash the dog.')]: {
        action: ACTIONS.DELETE,
        content: 'I need to wash the dog.'
      }
    }
  };
  t.deepEqual(expected, result);
});

test('customize getId', async (t) => {
  t.plan(1);
  const result = await diffFile(
    path.join(__dirname, 'new2.txt'),
    path.join(__dirname, 'old2.txt'),
    str => {
      return str.replace(/^.+'\{(.+)\}'.+$/, (m, $1) => $1);
    });
  const expected = {
    raw: {
      new: [
        "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E8}', 12345, 'LABEL-1');",
        "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E7}', 12346, 'LABEL-2');",
        "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E9}', 12347, 'LABEL-3');"
      ],
      old: [
        "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E8}', 12325, 'LABEL-1');",
        "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E7}', 12326, 'LABEL-2');",
        "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E6}', 12327, 'LABEL-3');"
      ]
    },
    trans: {
      '003687D3-7C30-486A-8771-3268828AB1E8': {
        action: ACTIONS.UPDATE,
        content: "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E8}', 12345, 'LABEL-1');"
      },
      '003687D3-7C30-486A-8771-3268828AB1E7': {
        action: ACTIONS.UPDATE,
        content: "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E7}', 12346, 'LABEL-2');"
      },
      '003687D3-7C30-486A-8771-3268828AB1E9': {
        action: ACTIONS.CREATE,
        content: "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E9}', 12347, 'LABEL-3');"
      },
      '003687D3-7C30-486A-8771-3268828AB1E6': {
        action: ACTIONS.DELETE,
        content: "INSERT INTO `SomeTable` (`OBJECT_ID`, `VALUE`, `LABEL`) VALUES ('{003687D3-7C30-486A-8771-3268828AB1E6}', 12327, 'LABEL-3');"
      }
    }
  };
  t.deepEqual(expected, result);
});
