const axios = require("axios").default;
const uuid = require("uuidv4").uuid;
const sizeof = require("object-sizeof");

const userIds = [];
for (let i = 0; i < 10000; i++) {
  userIds.push(uuid());
}

const GATEWAY_URL =
  "https://828jc96lqg.execute-api.us-east-1.amazonaws.com/dev/messageContent";

// const GATEWAY_URL = "http://localhost:3000/dev/messageContent"

callEp(userIds.slice(0,10)).then((res) => console.log(res.data));

function callEp(listOfIds) {
  const fakeInput = {
    messageContentId: "101",
    recipientIds: listOfIds,
  };
  return axios.post(GATEWAY_URL, fakeInput);
}

function sendTenReqs() {
  let pendingReqs = [];

  for (let i = 0; i < 10; i++) {
    const startSlice = i * 1000;
    const endSlice = startSlice + 1000;
    const idList = userIds.slice(startSlice, endSlice);
    pendingReqs.push(callEp(idList));
  }
  return Promise.all(pendingReqs);
}
