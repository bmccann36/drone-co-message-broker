
module.exports = class MessageMappingRepository {
  constructor(docClient) {
    this.docClient = docClient;
    this.tableName = process.env.MSG_MAPPING_TABLE;
  }

  async registerQueueMessages(msgArray) {

    const pendingWrites = [];
    for (let i = 0; i < msgArray.length; i = i + 25) {
      // construct a delete 25 item promise
      const batchOfMessages = msgArray.slice(i, i + 25);
      // construct write params
      const formatted = this.formatMsgBatch(
        this.tableName,
        batchOfMessages,
      );
      const pendingBatch = this.docClient.batchWrite(formatted).promise();
      pendingWrites.push(pendingBatch);
    }
    return Promise.all(pendingWrites);
  }

  formatMsgBatch(tableName, batch) {
    const batchOfPuts = batch.map((msg) => {
      return {
        PutRequest: {
          Item: msg
        },
      };
    });
    return {
      RequestItems: {
        [tableName]: batchOfPuts,
      },
    };
  }

  async registerMessages(messageContentId, recipientIds) {

    const pendingWrites = [];
    for (let i = 0; i < recipientIds.length; i = i + 25) {
      // construct a delete 25 item promise
      const batchOfIds = recipientIds.slice(i, i + 25);

      // construct write params
      const formatted = this.formatBulkRequest(
        this.tableName,
        batchOfIds,
        messageContentId,
      );
      const pendingBatch = this.docClient.batchWrite(formatted).promise();
      pendingWrites.push(pendingBatch);
    }
    return Promise.all(pendingWrites);
  }

  formatBulkRequest(tableName, batch, contentId) {
    const batchOfPuts = batch.map((recipientId) => {
      return {
        PutRequest: {
          Item: {
            contentId: contentId,
            recipientId: recipientId,
          },
        },
      };
    });
    return {
      RequestItems: {
        [tableName]: batchOfPuts,
      },
    };
  }
};
