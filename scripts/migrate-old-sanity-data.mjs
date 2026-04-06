import { createClient } from "@sanity/client";
import fetch from "node-fetch";

/**
 * Migrate projects from old Sanity dataset to the new monorepo dataset.
 * Includes image asset migration (download & re-upload).
 */

// Old Sanity (Read-only)
const oldClient = createClient({
  projectId: "r3ayluym",
  dataset: "production",
  useCdn: false,
  apiVersion: "2021-10-21",
});

// New Sanity (Write access required)
const newClient = createClient({
  projectId: "73v5iufs",
  dataset: "production",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN, 
  apiVersion: "2024-04-05",
});

async function migrateImage(assetRef) {
  try {
    // Get the image URL from the old Sanity
    const asset = await oldClient.getDocument(assetRef);
    if (!asset || !asset.url) return null;

    console.log(`🖼️  Migrating image: ${asset.url}`);

    // Download the image
    const response = await fetch(asset.url);
    const buffer = await response.arrayBuffer();

    // Upload to new Sanity
    const newAsset = await newClient.assets.upload('image', Buffer.from(buffer), {
      filename: asset.originalFilename || 'migrated-image',
    });

    return {
      _type: 'image',
      asset: {
        _ref: newAsset._id,
        _type: 'reference',
      },
    };
  } catch (err) {
    console.error(`❌ Image migration failed for ${assetRef}:`, err.message);
    return null;
  }
}
async function migrateProjects() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error("❌ Error: SANITY_WRITE_TOKEN is missing.");
    return;
  }

  try {
    console.log("🔍 Fetching documents from old Sanity (projects and works)...");
    const oldDocs = await oldClient.fetch('*[_type in ["project", "works"]]');
    console.log(`📦 Found ${oldDocs.length} documents to migrate.`);

    for (const oldDoc of oldDocs) {
      console.log(`🚀 Migrating: ${oldDoc.title}`);

      // 1. Map fields based on document type
      const isWorksType = oldDoc._type === "works";

      const newProj = {
        _type: "project",
        _id: `migrated-${oldDoc._type}-${oldDoc._id}`, 
        title: oldDoc.title,
        slug: oldDoc.slug || { _type: 'slug', current: oldDoc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        // If it's a string, wrap it in a block for Portable Text
        description: typeof oldDoc.description === 'string' 
          ? [{ _type: 'block', children: [{ _type: 'span', text: oldDoc.description }], markDefs: [], style: 'normal' }]
          : oldDoc.description,
        techStack: oldDoc.tags || [],
        externalLink: isWorksType ? oldDoc.projectLink : oldDoc.site,
        isFeatured: false,
      };

      // 2. Migrate image if it exists (coverImage or imgUrl)
      const imageAsset = isWorksType ? oldDoc.imgUrl : oldDoc.coverImage;
      if (imageAsset && imageAsset.asset) {
        const migratedImg = await migrateImage(imageAsset.asset._ref);
        if (migratedImg) {
          newProj.image = migratedImg;
        }
      }

      // 3. Upsert to new Sanity
      await newClient.createOrReplace(newProj);
      console.log(`✅ Document "${oldDoc.title}" migrated successfully.`);
    }

    console.log("🎊 Full migration completed! All works and projects are now in the new monorepo.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }
}

migrateProjects();
