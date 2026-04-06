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
    console.log("🔍 Fetching projects from old Sanity...");
    const oldProjects = await oldClient.fetch('*[_type == "project"]');
    console.log(`📦 Found ${oldProjects.length} projects to migrate.`);

    for (const oldProj of oldProjects) {
      console.log(`🚀 Migrating: ${oldProj.title}`);

      // 1. Map basic fields
      const newProj = {
        _type: "project",
        _id: `migrated-project-${oldProj._id}`, // Stable ID to prevent duplicates
        title: oldProj.title,
        slug: oldProj.slug,
        description: oldProj.description, // Now matches (array of blocks)
        techStack: oldProj.tags || [],
        externalLink: oldProj.site,
        isFeatured: false, // Default to false
      };

      // 2. Migrate cover image if it exists
      if (oldProj.coverImage && oldProj.coverImage.asset) {
        const migratedImg = await migrateImage(oldProj.coverImage.asset._ref);
        if (migratedImg) {
          newProj.image = migratedImg;
        }
      }

      // 3. Upsert to new Sanity
      await newClient.createOrReplace(newProj);
      console.log(`✅ Project "${oldProj.title}" migrated successfully.`);
    }

    console.log("🎊 Migration completed! All projects are now in the new monorepo.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }
}

migrateProjects();
