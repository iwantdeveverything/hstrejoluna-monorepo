import { createClient } from "@sanity/client";

/**
 * Data migration script to move from flat strings to localized objects
 * for i18n support in the hstrejoluna-monorepo.
 */

const client = createClient({
  projectId: "73v5iufs",
  dataset: "production",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: "2024-04-05",
});

async function migrateDocuments() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("❌ Error: SANITY_API_WRITE_TOKEN is missing.");
    return;
  }

  try {
    console.log("🔍 Fetching documents to migrate...");
    
    // 1. Projects
    const projects = await client.fetch('*[_type == "project"]');
    for (const doc of projects) {
      if (typeof doc.title === 'string') {
        console.log(`🚀 Migrating project: ${doc.title}`);
        await client
          .patch(doc._id)
          .set({
            title: { en: doc.title, es: doc.title },
            description: { en: doc.description, es: doc.description }
          })
          .commit();
      }
    }

    // 2. Experiences
    const experiences = await client.fetch('*[_type == "experience"]');
    for (const doc of experiences) {
      if (typeof doc.role === 'string') {
        console.log(`🚀 Migrating experience: ${doc.company} - ${doc.role}`);
        await client
          .patch(doc._id)
          .set({
            role: { en: doc.role, es: doc.role },
            description: { en: doc.description, es: doc.description }
          })
          .commit();
      }
    }

    // 3. Certificates
    const certificates = await client.fetch('*[_type == "certificate"]');
    for (const doc of certificates) {
      if (typeof doc.name === 'string') {
        console.log(`🚀 Migrating certificate: ${doc.name}`);
        await client
          .patch(doc._id)
          .set({
            name: { en: doc.name, es: doc.name }
          })
          .commit();
      }
    }

    // 4. Skills
    const skills = await client.fetch('*[_type == "skill"]');
    for (const doc of skills) {
      if (typeof doc.name === 'string') {
        console.log(`🚀 Migrating skill: ${doc.name}`);
        await client
          .patch(doc._id)
          .set({
            name: { en: doc.name, es: doc.name }
          })
          .commit();
      }
    }

    // 5. Profile (Document-level i18n)
    const profiles = await client.fetch('*[_type == "profile"]');
    for (const doc of profiles) {
      if (!doc.language) {
        console.log(`🚀 Migrating profile: ${doc.name}`);
        await client
          .patch(doc._id)
          .set({ language: 'en' })
          .commit();
      }
    }

    console.log("🎊 Data migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }
}

migrateDocuments();
