function getSuccessRes(statusMessage) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
  };
  // Return status code 200 and the newly created item
  const response = {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({ status: statusMessage }),
  };
  return response;
}
function marshallResponse(responsePojo) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
  };
  // Return status code 200 and the newly created item
  const response = {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(responsePojo),
  };
  return response;
}

module.exports = { getSuccessRes, marshallResponse };
