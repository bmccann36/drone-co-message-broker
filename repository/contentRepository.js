module.exports = class ContentRepository {
  constructor(docClient) {
    this.docClient = docClient;
    this.tableName = process.env.CONTENT_TABLE;
  }

  putMessageContent(msgContent) {
    const params = {
      TableName: this.tableName,
      Item: msgContent,
    };
    return this.docClient.put(params).promise();
  }
};
