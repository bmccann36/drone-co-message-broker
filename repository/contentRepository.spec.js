require("dotenv").config();
const ContentRepository = require("../repository/contentRepository");
const Dynamo = require("aws-sdk/clients/dynamodb");

const docClient = new Dynamo.DocumentClient();
const target = new ContentRepository(docClient);

xit("writes an item", () => {
  const mockPayload = {
    contentId: "101",
    messageContent: "check out the firmware upgrade for your drone",
  };
  target.putMessageContent(mockPayload);
});

it("gets a user's messages", async () => {
  const res = await target.getMessages("1");
  console.log(res);
});
