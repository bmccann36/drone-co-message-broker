module.exports = class ContentRepository {
  constructor(docClient) {
    this.docClient = docClient;
    this.contentTableName = process.env.CONTENT_TABLE;
    this.mappingTableName = process.env.MSG_MAPPING_TABLE;
  }

  async getMessages(userId) {
    const dynamoRes = await this.getUnreadMsgMappings(userId);
    if (dynamoRes.Count == 0) {
      return [];
    }
    const responseMap = this.mapDynamoResToResponseMap(dynamoRes);
    const dynamoTemplatesRes = await this.getMessageTemplates(dynamoRes);
    const responseList = dynamoTemplatesRes.Responses[this.contentTableName];
    if (responseList.length == 0) {
      return [];
    }
    return this.combineMapingWithTemplates(dynamoTemplatesRes, responseMap);
  }

  combineMapingWithTemplates(dynamoTemplatesRes, responseMap) {
    const listOfTemplates = dynamoTemplatesRes.Responses[this.contentTableName];

    listOfTemplates.forEach((template) => {
      const templId = template.contentId;
      responseMap[templId] = template;
    });
    return Object.keys(responseMap).map((key) => {
      return responseMap[key];
    });
  }

  async getMessageTemplates(dynamoRes) {
    const contentIdKeys = dynamoRes.Items.map((msg) => {
      return { contentId: msg.contentId };
    });
    const batchGetParams = {
      RequestItems: {
        [this.contentTableName]: {
          Keys: contentIdKeys,
        },
      },
      ReturnConsumedCapacity: "TOTAL"
    };
    const res = await this.docClient.batchGet(batchGetParams).promise();
    console.log("get message templates consumed capacity: ");
    console.log(res.ConsumedCapacity);
    return res;
  }

  mapDynamoResToResponseMap(dynamoRes) {
    let responseMap = {};
    dynamoRes.Items.forEach((item) => {
      responseMap[item.contentId] = {};
    });
    return responseMap;
  }

  async getUnreadMsgMappings(userId) {
    const params = {
      TableName: this.mappingTableName,
      KeyConditionExpression: "recipientId = :recipientId",
      ExpressionAttributeValues: {
        ":recipientId": userId,
      },
      FilterExpression: "attribute_not_exists(msgRead)", // ! for future use (no "read" attribute currently)
      ReturnConsumedCapacity: "TOTAL"
    };
    const res = await this.docClient.query(params).promise();
    console.log("get unread mappings consumed capacity: ");
    console.log(res.ConsumedCapacity);
    return res;
  }

  putMessageContent(msgContent) {
    const params = {
      TableName: this.contentTableName,
      Item: msgContent,
    };
    return this.docClient.put(params).promise();
  }
};
