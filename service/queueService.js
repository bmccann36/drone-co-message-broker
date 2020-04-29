const uuid = require("uuidv4").uuid;

module.exports = class QueueService {
  constructor(sqsClient) {
    this.sqsClient = sqsClient;
    this.queueUrl = process.env.QUEUE_URL;
  }

  async addMappingsToQueue(msgContentId, recipientIds) {
    // break input into batches
    const pendingWrites = [];
    let batchOfTen = [];
    for (let i = 0; i < recipientIds.length; i++) {
      const entry = this.generateSingleSqsMessage(
        msgContentId,
        recipientIds[i],
      );
      batchOfTen.push(entry);
      // check if we won't hit 10 this round
      if (i == recipientIds.length - 1) {
        console.log("generating last batch");
        const params = {
          Entries: batchOfTen,
          QueueUrl: this.queueUrl,
        };
        pendingWrites.push(this.sqsClient.sendMessageBatch(params).promise());
      }
      // check if we've hit 10
      else if (i % 10 == 0) {
        // console.log("hit divisible by ten");
        const params = {
          Entries: batchOfTen,
          QueueUrl: this.queueUrl,
        };
        pendingWrites.push(this.sqsClient.sendMessageBatch(params).promise());
        batchOfTen = []; // RESET the container of messages
      }
    }
    return Promise.all(pendingWrites);
  }

  generateSingleSqsMessage(contentId, recipientId) {
    return {
      Id: uuid(),
      MessageBody: JSON.stringify({
        contentId,
        recipientId,
      }),
      MessageAttributes: {
        messageType: {
          DataType: "String",
          StringValue: "msg-recipient-mapping",
        },
      },
    };
  }
};
