
module.exports = class MessageMappingRepository {
  constructor(docClient) {
    this.docClient = docClient;
    this.tableName = process.env.MSG_MAPPING_TABLE;
  }

  async registerMessages(messageContentId, recipientIds) {

    const pendingWrites = [];
    for (let i = 0; i < recipientIds.length; i = i + 25) {
      // construct a delete 25 item promise
      const batchOfIds = recipientIds.slice(i, i + 25);

      // construct write params
      const formatted = this.formatBatch(
        this.tableName,
        batchOfIds,
        messageContentId,
      );
      const pendingBatch = this.docClient.batchWrite(formatted).promise();
      pendingWrites.push(pendingBatch);
    }
    return Promise.all(pendingWrites);
  }

  formatBatch(tableName, batch, contentId) {
    const batchOfPuts = batch.map((recipientId) => {
      return {
        PutRequest: {
          Item: {
            messageContentId: contentId,
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
