"use strict";

module.exports = {
  routes: [
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/helps/suggestions",
      handler: "help.findSuggestionsByHelpId",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/helps/me/:isAskMode(true|false)",
      handler: "help.findHelpsByUser",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/helps/count",
      handler: "help.count",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/helps/search/:isAskMode(true|false|all)/:term/:categories",
      handler: "help.searchHelps",
    },
  ],
};
