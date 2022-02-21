module.exports = {
  getQueryJson(words) {
    let queryJson = [];
    words.forEach((keyword) => {
      if (keyword) {
        queryJson.push({
          description: { $contains: keyword },
        });
        queryJson.push({
          name: { $contains: keyword },
        });
      }
    });
    return queryJson;
  },
};
