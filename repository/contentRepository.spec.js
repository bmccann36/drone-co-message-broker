require("dotenv").config();
const ContentRepository = require("../repository/contentRepository");
const Dynamo = require("aws-sdk/clients/dynamodb");

const docClient = new Dynamo.DocumentClient();
const target = new ContentRepository(docClient);

it("writes an item", () => {
  const mockPayload = {
    contentId: "101",
    messageContent: "check out the firmware upgrade for your drone",
  };
  target.putMessageContent(mockPayload);
});
