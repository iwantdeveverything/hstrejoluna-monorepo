import { defineField, defineType } from "sanity";

export default defineType({
  name: "certificate",
  title: "Certificate",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Certificate Name",
      type: "localizedString",
    }),
    defineField({
      name: "issuer",
      title: "Issuer",
      type: "string",
    }),
    defineField({
      name: "issueDate",
      title: "Issue Date",
      type: "date",
    }),
    defineField({
      name: "expiryDate",
      title: "Expiry Date",
      type: "date",
    }),
    defineField({
      name: "credentialId",
      title: "Credential ID",
      type: "string",
    }),
    defineField({
      name: "credentialUrl",
      title: "Credential URL",
      type: "url",
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: [{ title: "LinkedIn", value: "linkedin" }],
      },
      initialValue: "linkedin",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name.en",
      subtitle: "issuer",
    },
  },
});
