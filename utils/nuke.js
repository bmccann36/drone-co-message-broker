
const DynamoDB = require('aws-sdk/clients/dynamodb')
const docClient = new DynamoDB.DocumentClient();

// ! WARNING
/**  
DynamoTruncate
this will delete everything in your table. This is not recommended for tables with 500,000 + items because it will use a lot of RCUs if your table is that big you're better off deleting the table, if not this will save you some time

works by performing parallel scans on specified table then deleting every item by key that it finds more on parallel scans https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html#Scan.ParallelScan

the default number of threads it will use to scan and delete is 6, you can specify a different number via cli flag --segments more segments = faster deleting

since it is an npm script you need to include an additonal -- to pass the arguments across the bridge. See example usage below

example usage

node nuke --tableName myTable \
--partitionKey riverCode \
--sortKey riverLocation
sort key is only required if your table has one
** addittional optional params ** 
--segments 8
*/


const cliArgs = process.argv;
const tableNameIdx = cliArgs.indexOf('--tableName') + 1;
const pkIdx = cliArgs.indexOf('--partitionKey') + 1;
const segmentsIdx = cliArgs.indexOf('--segments') + 1;
const skIdx = cliArgs.indexOf('--sortKey') + 1;

if (tableNameIdx === 0 || pkIdx === 0) {
  throw new Error('you must supply a tablename and a partition key');
}

const TABLE_NAME = cliArgs[tableNameIdx];
const PK = cliArgs[pkIdx];
let TOTAL_SEGMENTS = 6;
let SK = false;


if (segmentsIdx) {
  TOTAL_SEGMENTS = +cliArgs[segmentsIdx];
}
if (skIdx) {
  SK = cliArgs[skIdx];
}

console.log('tableName = ', TABLE_NAME);
console.log('partitionKey = ', PK);
console.log('sortKey = ', SK);
console.log('segments = ', TOTAL_SEGMENTS);

const pendingScans = [];
initiateParallelThreads();

/**
 * see README for usage notes
 */
async function initiateParallelThreads() {
  for (let i = 0; i < TOTAL_SEGMENTS; i++) {
    pendingScans.push(scanSegment(i, TOTAL_SEGMENTS));
  }
  await Promise.all(pendingScans);
  console.log('sleeping 2 seconds');
  await sleep(2000);
  console.log('threads complete checking for remaining items');
  const itemsExist = await checkForRemaining();
  if (itemsExist) {
    console.log('restarting to clear out remaining items');
    initiateParallelThreads();
  }
}


async function scanSegment(segmentNum, totalSegments) {
  let itemsExist = true;
  let nextStartPoint;
  let totalForSeg = 0;
  const segmentItems = [];
  const params = {
    TableName: TABLE_NAME,
    Segment: segmentNum,
    TotalSegments: totalSegments,
  };
  while (itemsExist) {
    // set start point if it isn't the first scan
    if (nextStartPoint) {
      params.ExclusiveStartKey = nextStartPoint;
    }
    const batch = await docClient.scan(params).promise();
    if (!batch.Items.length) {
      itemsExist = false;
      console.log('NO MORE ITEMS');
      return segmentItems;
    }
    if (nextStartPoint === batch.LastEvaluatedKey) {
      console.log(`scan for segment ${segmentNum} done`);
      deleteBatch(batch);
      itemsExist = false;
      return segmentItems;
    } else {
      totalForSeg += batch.Items.length;
      console.log(`total found in segment number ${segmentNum}: `, totalForSeg);
      deleteBatch(batch);
      nextStartPoint = batch.LastEvaluatedKey;
    }
  }
}

function deleteBatch(batch) {
  console.log('deleting', batch.Items.length)
  const deleteArr = batch.Items.map(item => {
    const deleteReq = {
      DeleteRequest: {
        Key: {
          [PK]: item[PK],
        },
      },
    };
    if (SK) {
      deleteReq.DeleteRequest.Key[SK] = item[SK];
    }
    return deleteReq;
  });
  // iterate over long array and make a promise.all or 25 item batches
  const pendingBatches = [];
  for (let i = 0; i <= deleteArr.length; i = i + 25) {
    // construct a delete 25 item promise
    const slicedBatch = deleteArr.slice(i, i + 25);
    // if no batch return
    if (!slicedBatch.length) {
      return;
    }
    // construct delete params
    const deleteParams = {
      RequestItems: {
        [TABLE_NAME]: slicedBatch,
      },
    };
    // add to array the delete 25 promise batch
    pendingBatches.push(
      docClient.batchWrite(deleteParams).promise(),
    );
  }
  return Promise.all(pendingBatches);
}

async function checkForRemaining() {
  const params = {
    TableName: TABLE_NAME,
    Limit: 10,
  };
  const batch = await docClient.scan(params).promise();
  return !!batch.Items.length;
}


function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
