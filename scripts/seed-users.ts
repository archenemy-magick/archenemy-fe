import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅" : "❌");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedUsers() {
  console.log("🌱 Seeding users...");

  // Create Liliana
  const { data: lilianaAuth, error: lilianaError } =
    await supabase.auth.admin.createUser({
      email: "liliana@archenemy.io",
      password: "securepassword",
      email_confirm: true,
      user_metadata: {
        username: "the_necromancer",
        firstName: "Liliana",
        lastName: "Vess",
      },
    });

  if (lilianaError) {
    console.error("❌ Error creating Liliana:", lilianaError);
  } else {
    console.log("✅ Created Liliana:", lilianaAuth.user.id);
  }

  // Create Windgrace
  const { data: windgraceAuth, error: windgraceError } =
    await supabase.auth.admin.createUser({
      email: "windgrace@archenemy.io",
      password: "anothersecurepassword",
      email_confirm: true,
      user_metadata: {
        username: "the_land_kitty",
        firstName: "Lord",
        lastName: "Windgrace",
      },
    });

  if (windgraceError) {
    console.error("❌ Error creating Windgrace:", windgraceError);
  } else {
    console.log("✅ Created Windgrace:", windgraceAuth.user.id);
  }

  // Show created profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("email", ["liliana@archenemy.io", "windgrace@archenemy.io"]);

  console.log("\n📋 Created profiles:");
  profiles?.forEach((p) => {
    console.log(`  - ${p.username} (${p.email}): ${p.id}`);
  });

  console.log("\n✨ Seeding complete!");
}

seedUsers().catch(console.error);
