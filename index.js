const csv = require('csvtojson');
const { json2csvAsync: json2csv } = require('json-2-csv');
const metadata = require('./metadata.json');
const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');

const main = async () => {
  try {
    const { inputs, delimiter, output, type, column } = metadata;

    if (fs.existsSync(output)) fs.unlinkSync(output);

    const [data, filters] = await Promise.all([
      ...inputs.map((path) => csv({ delimiter }).fromFile(path)),
    ]);

    let fn;
    switch (type) {
      case 'eq':
        fn = 'intersectionBy';
        break;
      case 'neq':
        fn = 'differenceBy';
        break;
      case 'uni':
        fn = 'unionBy';
        break;
      default:
        throw new Error('Do not have any type of comparison');
    }

    const result = _[fn](data, filters, column);

    const csvFile = await json2csv(result, {});

    const dateTime = moment().format('YYYY.MM.DD HH.mm.ss');
    const filename = output.replace('date', dateTime);
    fs.writeFileSync(filename, csvFile, 'utf8');
  } catch (err) {
    console.error(err);
  }
};

main();
