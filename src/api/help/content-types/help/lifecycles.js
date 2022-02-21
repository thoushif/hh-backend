module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    if (data.name) {
      // data.slug = slugify(data.name, { lower: true });
      data.slug = await strapi.plugins[
        "content-manager"
      ].services.uid.generateUIDField({
        contentTypeUID: "api::help.help",
        field: "slug",
        data,
      });
    }
  },
  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.name) {
      // data.slug = slugify(data.name, { lower: true });
      data.slug = await strapi.plugins[
        "content-manager"
      ].services.uid.generateUIDField({
        contentTypeUID: "api::help.help",
        field: "slug",
        data,
      });
    }
  },
};
