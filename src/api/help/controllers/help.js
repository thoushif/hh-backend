"use strict";
const sw = require("stopword");
const { getQueryJson } = require("../../../utils/common-util");
const customStopwords = [
  ...sw.en,
  "need",
  "want",
  "require",
  "please",
  "kind",
  "kindly",
  "help",
];

/**
 *  help controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::help.help", ({ strapi }) => ({
  // Create user event----------------------------------------
  async create(ctx) {
    let entity;
    console.log(ctx.state.user);
    if (!ctx.state.user) {
      return ctx.unauthorized(`No token provided`);
    }
    ctx.request.body.data.owner = ctx.state.user;
    console.log(ctx.request.body);
    entity = await strapi.service("api::help.help").create(ctx.request.body);
    return entity;
  },

  async findOne(ctx) {
    let entity;
    const { id } = ctx.params;
    // if (!ctx.state.user) {
    //   return ctx.unauthorized(`No token provided`);
    // }
    const query = {
      filters: {
        id: id,
        // owner: { id: ctx.state.user.id },
      },
    };
    const helps = await this.find({ query: query });
    if (!helps.data || !helps.data.length) {
      return ctx.unauthorized(`You can't access this entry`);
    }
    const sanitizedEntity = await this.sanitizeOutput(helps, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // Update user event----------------------------------------
  async update(ctx) {
    let entity;
    const { id } = ctx.params;
    if (!ctx.state.user) {
      return ctx.unauthorized(`No token provided`);
    }
    const query = {
      filters: {
        id: id,
        owner: { id: ctx.state.user.id },
      },
    };
    const helps = await this.find({ query: query });
    console.log(helps);
    if (!helps.data || !helps.data.length) {
      return ctx.unauthorized(`You can't update this entry`);
    }
    entity = await super.update(ctx);
    return entity;
  },
  // Delete a user event----------------------------------------
  async delete(ctx) {
    const { id } = ctx.params;
    if (!ctx.state.user) {
      return ctx.unauthorized(`No token provided`);
    }
    const query = {
      filters: {
        id: id,
        owner: { id: ctx.state.user.id },
      },
    };
    const helps = await this.find({ query: query });
    if (!helps.data || !helps.data.length) {
      return ctx.unauthorized(`You can't delete this entry`);
    }
    const response = await super.delete(ctx);
    return response;
  },
  async findSuggestionsByHelpId(ctx) {
    const user = ctx.state.user;
    ctx.query = { ...ctx.query, filters: { user: { id: user.id } } };

    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: "No user found" }] }]);
    }

    const { slug } = ctx.query;
    console.log("finding slug", slug);
    if (!ctx.state.user) {
      return ctx.unauthorized(`No token provided`);
    }
    const query = {
      filters: {
        slug: slug,
        owner: { id: ctx.state.user.id },
      },
    };
    const helps = await this.find({ query: query });

    if (!helps.data) {
      return ctx.notFound(null, [{ messages: [{ id: "No help found" }] }]);
    }
    //get data from help
    console.log(helps);
    const helpId = helps.data[0].id;
    const helpName = helps.data[0].attributes.name.split(" ");
    const helpDescription = helps.data[0].attributes.description.split(" ");
    const helpIsAskMode = helps.data[0].attributes.is_ask;
    let helpKeywords = sw.removeStopwords(helpName, customStopwords);
    helpKeywords.push(...sw.removeStopwords(helpDescription, customStopwords));
    helpKeywords = [...new Set(helpKeywords)];

    // console.log(helpKeywords);

    // loop through hekeywords and create json query
    const queryJson = getQueryJson(helpKeywords);

    console.log(queryJson);
    const entity = await strapi.entityService.findMany("api::help.help", {
      start: 0,
      limit: 5,
      fields: ["name", "description", "updatedAt", "is_ask"],
      populate: {
        owner: {
          fields: ["username"],
        },
      },
      filters: {
        $and: [
          {
            $or: [...queryJson],
          },
          {
            id: { $ne: helpId },
          },
          {
            verified: { $eq: true },
          },
          {
            is_ask: { $ne: helpIsAskMode },
          },
        ],
        owner: {
          id: { $ne: ctx.state.user.id },
        },
      },
      sort: { updatedAt: "desc" },
    });

    return entity;
    // return this.transformResponse(sanitizedEntity);
  },
  async searchHelps(ctx) {
    const { isAskMode } = ctx.params;
    const { term } = ctx.params;
    // get categories from body
    let { categories } = ctx.params;
    categories = categories && categories.split(",");

    const queryJson = getQueryJson(term.split(" "));

    console.log(queryJson);
    const entity = await strapi.entityService.findMany("api::help.help", {
      start: 0,
      limit: 5,
      populate: {
        categories: {
          fields: ["name"],
        },
      },
      filters: {
        $and: [
          {
            $or: [...queryJson],
            ...(!(categories.includes("0") && categories.length === 1) && {
              categories: {
                id: { $in: categories },
              },
            }), // if categories is not empty
            // categories: {
            //   id: { $in: categories },
            // },
          },
        ],
        // ...(user && isAskMode !== "all" && { is_ask: isAskMode }), //if there is no user or isAskMode all, then it is not an ask mode
        is_ask: isAskMode,
      },
    });

    if (!entity) {
      return ctx.notFound(null, [{ messages: [{ id: "No help found" }] }]);
    }
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },
  async findHelpsByUser(ctx) {
    const user = ctx.state.user;
    ctx.query = { ...ctx.query, filters: { user: { id: user.id } } };
    const { isAskMode } = ctx.params;
    console.log("isAskMode", isAskMode);
    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: "No user found" }] }]);
    }

    const entity = await strapi.entityService.findMany("api::help.help", {
      filters: {
        owner: user.id,
        is_ask: { $eq: isAskMode },
      },
    });

    if (!entity) {
      return ctx.notFound(null, [{ messages: [{ id: "No help found" }] }]);
    }
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async count(ctx) {
    const entity = await strapi.query("api::help.help").count(ctx.params);
    // const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return entity;
  },
}));
