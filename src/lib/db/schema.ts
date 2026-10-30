import { executeSql } from "@/lib/postgres";

let portfolioTablesReady: Promise<void> | null = null;
let guestbookTableReady: Promise<void> | null = null;
let contactBookingTablesReady: Promise<void> | null = null;

/**
 * Initialize guestbook_entries table
 */
export function ensureGuestbookTable(): Promise<void> {
  if (!guestbookTableReady) {
    guestbookTableReady = (async () => {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS guestbook_entries (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          avatar TEXT,
          provider VARCHAR(32) DEFAULT 'google',
          theme VARCHAR(32) NOT NULL DEFAULT 'violet',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          likes INT DEFAULT 0,
          is_read BOOLEAN DEFAULT false
        );
      `);
      await executeSql(
        `ALTER TABLE guestbook_entries ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;`,
      );
    })().catch((err) => {
      guestbookTableReady = null;
      throw err;
    });
  }
  return guestbookTableReady;
}

/**
 * Initialize contact_messages & meeting_bookings tables
 */
export function ensureContactAndBookingTables(): Promise<void> {
  if (!contactBookingTablesReady) {
    contactBookingTablesReady = (async () => {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          topic VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(32) DEFAULT 'unread',
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await executeSql(`
        CREATE TABLE IF NOT EXISTS meeting_bookings (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          topic VARCHAR(255) NOT NULL,
          additional_notes TEXT,
          guests TEXT,
          date VARCHAR(32) NOT NULL,
          time_slot VARCHAR(32) NOT NULL,
          timezone VARCHAR(64) DEFAULT 'Asia/Dhaka',
          duration INT DEFAULT 30,
          status VARCHAR(32) DEFAULT 'confirmed',
          meet_link TEXT,
          cancellation_reason TEXT,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await executeSql(
        `ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;`,
      );
      await executeSql(
        `ALTER TABLE meeting_bookings ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;`,
      );
    })().catch((err) => {
      contactBookingTablesReady = null;
      throw err;
    });
  }
  return contactBookingTablesReady;
}

/**
 * Initialize CMS content tables
 */
export function ensurePortfolioTables(): Promise<void> {
  if (!portfolioTablesReady) {
    portfolioTablesReady = (async () => {
      const ddlStatements = [
        `CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(64) PRIMARY KEY,
          slug VARCHAR(128) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          tagline TEXT,
          category VARCHAR(64) DEFAULT 'Full Stack',
          featured BOOLEAN DEFAULT false,
          featured_sort_order INT DEFAULT 0,
          role VARCHAR(128),
          year VARCHAR(64),
          target_audience TEXT,
          why_i_built_this TEXT,
          overview TEXT,
          problem TEXT,
          solution TEXT,
          gradient TEXT,
          accent_color VARCHAR(32),
          preview_image TEXT,
          hover_image TEXT,
          github_url TEXT,
          client_url TEXT,
          server_url TEXT,
          live_url TEXT,
          tech_stack JSONB DEFAULT '[]'::jsonb,
          architecture JSONB DEFAULT '{}'::jsonb,
          system_breakdown JSONB DEFAULT '[]'::jsonb,
          challenges JSONB DEFAULT '[]'::jsonb,
          technical_decisions JSONB DEFAULT '[]'::jsonb,
          key_features JSONB DEFAULT '[]'::jsonb,
          metrics JSONB DEFAULT '[]'::jsonb,
          directory_tree TEXT,
          code_snippet JSONB DEFAULT '{}'::jsonb,
          backend_architecture JSONB DEFAULT '{}'::jsonb,
          what_i_learned JSONB DEFAULT '[]'::jsonb,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS tech_categories (
          id VARCHAR(64) PRIMARY KEY,
          number VARCHAR(16) NOT NULL,
          title VARCHAR(128) NOT NULL,
          subtitle VARCHAR(255),
          description TEXT,
          philosophy TEXT,
          badge VARCHAR(64),
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS tech_items (
          id VARCHAR(64) PRIMARY KEY,
          category_id VARCHAR(64) REFERENCES tech_categories(id) ON DELETE CASCADE,
          category_name VARCHAR(64) NOT NULL,
          name VARCHAR(128) NOT NULL,
          version VARCHAR(64),
          description TEXT,
          proficiency INT DEFAULT 90,
          is_core BOOLEAN DEFAULT false,
          use_case TEXT,
          production_project TEXT,
          docs_url TEXT,
          brand_color VARCHAR(32),
          icon_slug VARCHAR(128),
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS tech_catalog (
          slug VARCHAR(128) PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          category_name VARCHAR(64) NOT NULL,
          brand_color VARCHAR(32) NOT NULL,
          icon_slug VARCHAR(128) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS hero_content (
          id VARCHAR(64) PRIMARY KEY DEFAULT 'primary',
          greeting VARCHAR(64) DEFAULT 'Hi, I''m',
          name VARCHAR(128) DEFAULT 'Rohan',
          surname VARCHAR(128) DEFAULT 'Mia',
          bio TEXT,
          profile_image TEXT,
          resume_url TEXT,
          rotating_roles JSONB DEFAULT '[]'::jsonb,
          stats JSONB DEFAULT '[]'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS bento_content (
          id VARCHAR(64) PRIMARY KEY DEFAULT 'primary',
          badge VARCHAR(64) DEFAULT 'At A Glance',
          title VARCHAR(128) DEFAULT 'Overview & Work',
          cards JSONB DEFAULT '{}'::jsonb,
          tech_radar JSONB DEFAULT '[]'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS about_content (
          id VARCHAR(64) PRIMARY KEY DEFAULT 'primary',
          eyebrow VARCHAR(64) DEFAULT 'MORE ABOUT ME',
          heading_title VARCHAR(128) DEFAULT 'I''m Rohan, a',
          heading_highlight VARCHAR(128) DEFAULT 'creative engineer',
          bio_paragraphs JSONB DEFAULT '[]'::jsonb,
          career_experiences JSONB DEFAULT '[]'::jsonb,
          engineering_principles JSONB DEFAULT '[]'::jsonb,
          education JSONB DEFAULT '[]'::jsonb,
          core_competencies JSONB DEFAULT '[]'::jsonb,
          carousel_items JSONB DEFAULT '[]'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS gallery_photos (
          id VARCHAR(64) PRIMARY KEY,
          src TEXT NOT NULL,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(64) NOT NULL,
          caption TEXT,
          date VARCHAR(64),
          position VARCHAR(32) DEFAULT 'center',
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS gallery_categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(64) UNIQUE NOT NULL,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS featured_case_studies (
          id VARCHAR(64) PRIMARY KEY,
          slug VARCHAR(128) NOT NULL,
          title VARCHAR(128) NOT NULL,
          tagline VARCHAR(255) NOT NULL,
          category VARCHAR(64) DEFAULT 'Full Stack',
          year VARCHAR(32) DEFAULT '2026',
          preview_image TEXT NOT NULL,
          hover_image TEXT,
          gradient TEXT DEFAULT 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
          accent_color VARCHAR(32) DEFAULT '#6366f1',
          overview TEXT NOT NULL,
          key_features JSONB DEFAULT '[]'::jsonb,
          tech_stack JSONB DEFAULT '[]'::jsonb,
          live_url TEXT,
          github_url TEXT,
          client_url TEXT,
          server_url TEXT,
          sort_order INT DEFAULT 0,
          migrated_to_project BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS site_settings (
          id VARCHAR(64) PRIMARY KEY DEFAULT 'primary',
          site_title VARCHAR(255) DEFAULT 'MD Rohan Mia | Full-Stack Software Engineer',
          meta_description TEXT,
          contact_email VARCHAR(255) DEFAULT '',
          social_links JSONB DEFAULT '{}'::jsonb,
          resume_url TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS links (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(128) NOT NULL,
          handle VARCHAR(128),
          href TEXT NOT NULL,
          icon_name VARCHAR(64),
          category VARCHAR(64) DEFAULT 'connect',
          is_external BOOLEAN DEFAULT true,
          color VARCHAR(32),
          sort_order INT DEFAULT 0,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS analytics_events (
          id VARCHAR(64) PRIMARY KEY,
          path TEXT,
          visitor_id VARCHAR(128),
          device VARCHAR(64),
          browser VARCHAR(64),
          location VARCHAR(128),
          duration INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS ai_chat_logs (
          id VARCHAR(64) PRIMARY KEY,
          visitor_id VARCHAR(128) NOT NULL,
          messages JSONB DEFAULT '[]'::jsonb,
          last_interaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS leads (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128),
          email VARCHAR(255),
          phone VARCHAR(64),
          company VARCHAR(128),
          notes TEXT,
          source VARCHAR(64) DEFAULT 'chatbot',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS ai_system_config (
          id VARCHAR(64) PRIMARY KEY DEFAULT 'primary',
          visitor_prompt TEXT NOT NULL,
          admin_prompt TEXT NOT NULL,
          github_synth_prompt TEXT,
          skill_classifier_prompt TEXT,
          knowledge_base TEXT,
          avatar_url TEXT,
          tone_rules JSONB DEFAULT '{}'::jsonb,
          tools_config JSONB DEFAULT '{}'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
      ];

      const techItemsStatementIndex = ddlStatements.findIndex((sql) =>
        sql.includes("CREATE TABLE IF NOT EXISTS tech_items"),
      );
      const techItemsStatement = ddlStatements[techItemsStatementIndex];
      const independentStatements = ddlStatements.filter(
        (_, index) => index !== techItemsStatementIndex,
      );

      await Promise.all(independentStatements.map((sql) => executeSql(sql)));
      if (techItemsStatement) await executeSql(techItemsStatement);
      // Ensure recently added columns exist
      await executeSql(
        `ALTER TABLE about_content ADD COLUMN IF NOT EXISTS carousel_items JSONB DEFAULT '[]'::jsonb;`,
      );
      await executeSql(
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS why_i_built_this TEXT;`,
      );
      await executeSql(
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured_sort_order INT DEFAULT 0;`,
      );
      await executeSql(
        `ALTER TABLE featured_case_studies ADD COLUMN IF NOT EXISTS migrated_to_project BOOLEAN DEFAULT false;`,
      );
      await executeSql(
        `ALTER TABLE ai_system_config ADD COLUMN IF NOT EXISTS github_synth_prompt TEXT;`,
      );
      await executeSql(
        `ALTER TABLE ai_system_config ADD COLUMN IF NOT EXISTS skill_classifier_prompt TEXT;`,
      );
      await executeSql(
        `ALTER TABLE ai_system_config ADD COLUMN IF NOT EXISTS tools_config JSONB DEFAULT '{}'::jsonb;`,
      );
      await executeSql(
        `ALTER TABLE tech_items ADD COLUMN IF NOT EXISTS icon_slug VARCHAR(128);`,
      );
      await executeSql(`
        WITH pending AS (
          SELECT featured_case_studies.*,
            (ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC)
              + COALESCE((SELECT MAX(featured_sort_order) FROM projects WHERE featured = true), 0))::INT AS next_featured_order
          FROM featured_case_studies
          WHERE migrated_to_project = false
        )
        INSERT INTO projects (
          id, slug, title, tagline, category, featured, featured_sort_order,
          year, overview, gradient, accent_color, preview_image, hover_image,
          github_url, client_url, server_url, live_url, tech_stack, key_features,
          sort_order
        )
        SELECT
          'legacy_featured_' || id, slug, title, tagline, category, true,
          next_featured_order, year, overview, gradient, accent_color,
          preview_image, hover_image, github_url, client_url, server_url,
          live_url, tech_stack, key_features, sort_order
        FROM pending
        ON CONFLICT (slug) DO UPDATE SET
          featured = true,
          featured_sort_order = EXCLUDED.featured_sort_order;
      `);
      await executeSql(
        `UPDATE featured_case_studies SET migrated_to_project = true WHERE migrated_to_project = false;`,
      );

      // --- Dynamic SEO System Tables & Columns ---
      await executeSql(`
        CREATE TABLE IF NOT EXISTS seo_settings (
          id VARCHAR(64) PRIMARY KEY DEFAULT 'primary',
          primary_name VARCHAR(128) DEFAULT 'Md Rohan Mia',
          alternate_names JSONB DEFAULT '["Rohan Mia", "Bhau", "Rohan Bhau", "rohan-bhau"]'::jsonb,
          nickname VARCHAR(64) DEFAULT 'Bhau',
          professional_title VARCHAR(128) DEFAULT 'Full Stack Developer',
          location_locality VARCHAR(64) DEFAULT 'Dhaka',
          location_country VARCHAR(64) DEFAULT 'Bangladesh',
          short_bio TEXT DEFAULT 'Full Stack Developer specializing in Next.js, React, TypeScript, Node.js, Express.js, PostgreSQL, and MongoDB.',
          detailed_bio TEXT DEFAULT 'Md Rohan Mia (known as Rohan Bhau) is a full stack developer based in Dhaka, Bangladesh, building high-concurrency web applications, distributed APIs, and interactive digital experiences.',
          skills JSONB DEFAULT '["Next.js", "React", "TypeScript", "Node.js", "Express.js", "PostgreSQL", "MongoDB", "Tailwind CSS", "REST APIs", "Full Stack Development"]'::jsonb,
          canonical_base_url VARCHAR(255) DEFAULT '',
          default_meta_title VARCHAR(255) DEFAULT 'Md Rohan Mia | Full Stack Developer in Bangladesh',
          default_meta_description TEXT DEFAULT 'Portfolio of Md Rohan Mia (Rohan Bhau) - Full Stack Developer based in Dhaka, Bangladesh. Building production Next.js platforms, distributed backends, and responsive web applications.',
          default_og_title VARCHAR(255) DEFAULT 'Md Rohan Mia (Rohan Bhau) — Full Stack Developer',
          default_og_description TEXT DEFAULT 'Explore the personal portfolio, engineering case studies, and architecture projects of Md Rohan Mia, Full Stack Developer from Dhaka, Bangladesh.',
          default_og_image TEXT DEFAULT '',
          google_verification_token VARCHAR(255) DEFAULT 'yH9eJO5yYLc4wgh3jwtqR_QE28Vsc1SrST5teq331do',
          google_tag_id VARCHAR(64) DEFAULT 'G-4PP1H13CXG',
          default_robots_index BOOLEAN DEFAULT true,
          default_robots_follow BOOLEAN DEFAULT true,
          default_twitter_card VARCHAR(32) DEFAULT 'summary_large_image',
          profile_image_url TEXT DEFAULT '',
          profile_image_alt TEXT DEFAULT 'Md Rohan Mia (Rohan Bhau) — Full Stack Developer in Bangladesh',
          profile_image_title TEXT DEFAULT 'Md Rohan Mia - Professional Profile Photo',
          profile_image_caption TEXT DEFAULT 'Md Rohan Mia, Full Stack Developer based in Dhaka, Bangladesh',
          profile_image_variants JSONB DEFAULT '{}'::jsonb,
          social_profiles JSONB DEFAULT '["https://github.com/rohan-bhau", "https://www.linkedin.com/in/rohan-mia/", "https://x.com/_Rohan_Bhau", "https://www.facebook.com/bhau.rohan", "https://www.instagram.com/__rohan.bhau/"]'::jsonb,
          target_keywords JSONB DEFAULT '["Md Rohan Mia", "Rohan Mia", "Rohan Bhau", "Bhau developer", "Full stack developer in Bangladesh", "Full stack developer in Dhaka", "Next.js developer Bangladesh", "React developer Bangladesh"]'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await executeSql(`
        CREATE TABLE IF NOT EXISTS page_seo (
          page_path VARCHAR(128) PRIMARY KEY,
          title VARCHAR(255),
          description TEXT,
          canonical_url TEXT,
          og_title VARCHAR(255),
          og_description TEXT,
          og_image TEXT,
          og_image_alt TEXT,
          twitter_card VARCHAR(32) DEFAULT 'summary_large_image',
          robots_index BOOLEAN DEFAULT true,
          robots_follow BOOLEAN DEFAULT true,
          keywords JSONB DEFAULT '[]'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Add SEO columns to projects table
      await executeSql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);`);
      await executeSql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_description TEXT;`);
      await executeSql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS canonical_url TEXT;`);
      await executeSql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS og_image TEXT;`);
      await executeSql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS og_image_alt TEXT;`);
      await executeSql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS no_index BOOLEAN DEFAULT false;`);
      await executeSql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]'::jsonb;`);
      await executeSql(`ALTER TABLE seo_settings ADD COLUMN IF NOT EXISTS google_tag_id VARCHAR(64) DEFAULT 'G-4PP1H13CXG';`);

      // Seed initial seo_settings row if not exists, populating profile_image from hero_content if available
      await executeSql(`
        INSERT INTO seo_settings (id, profile_image_url, updated_at)
        SELECT 'primary', COALESCE((SELECT profile_image FROM hero_content WHERE id = 'primary' LIMIT 1), ''), CURRENT_TIMESTAMP
        ON CONFLICT (id) DO NOTHING;
      `);

      // Seed standard pages into page_seo if empty
      await executeSql(`
        INSERT INTO page_seo (page_path, title, description, og_title, og_description)
        VALUES
          ('/', 'Md Rohan Mia | Full Stack Developer in Bangladesh', 'Portfolio of Md Rohan Mia (Rohan Bhau) - Full Stack Developer based in Dhaka, Bangladesh. Building scalable web platforms, high-concurrency systems, and bespoke UI architectures.', 'Md Rohan Mia (Rohan Bhau) — Full Stack Developer', 'Explore the interactive portfolio and production case studies of Md Rohan Mia, Full Stack Engineer in Dhaka, Bangladesh.'),
          ('/about', 'About Md Rohan Mia (Rohan Bhau) | Full Stack Engineer', 'Learn about Md Rohan Mia (Bhau), a full stack developer and creative engineer based in Dhaka, Bangladesh. Engineering background, core principles, and technical proficiencies.', 'About Md Rohan Mia — Career & Engineering Journey', 'The story, engineering principles, and experience behind Md Rohan Mia (Rohan Bhau).'),
          ('/projects', 'Projects & Systems Architecture | Md Rohan Mia', 'A curated collection of production web applications, system architectures, and mobile software engineered by Md Rohan Mia (Rohan Bhau).', 'Projects & Production Architectures — Md Rohan Mia', 'Case studies and system breakdowns of production platforms engineered by Md Rohan Mia.'),
          ('/tech-stack', 'Tech Stack & Engineering Toolchain | Md Rohan Mia', 'The tools, frameworks, and architectural platforms powering high-performance systems engineered by Md Rohan Mia: Next.js, React, TypeScript, Node.js, PostgreSQL, MongoDB.', 'Tech Stack & Systems — Md Rohan Mia', 'Core competencies, frameworks, databases, and DevOps tools used by Md Rohan Mia.'),
          ('/gallery', 'Visual Chronicle & Gallery | Md Rohan Mia', 'Curated visual chronicle of personal milestones, travels, developer events, and memories by Md Rohan Mia.', 'Gallery & Visual Chronicle — Md Rohan Mia', 'Visual archive and memories from Md Rohan Mia.'),
          ('/guestbook', 'Guestbook & Community Wall | Md Rohan Mia', 'Leave a note, kind message, or feedback on Md Rohan Mia''s guestbook wall. Connected with developer peers across the globe.', 'Guestbook — Md Rohan Mia', 'Community messages and feedback on Md Rohan Mia''s portfolio.'),
          ('/links', 'Verified Links & Social Profiles | Md Rohan Mia', 'Verified links, social handles, code repositories, and direct contact channels for Md Rohan Mia (Rohan Bhau).', 'Verified Links & Social Identity — Md Rohan Mia', 'Connect with Md Rohan Mia across GitHub, LinkedIn, Twitter/X, and social channels.'),
          ('/contact', 'Contact & Work Inquiries | Md Rohan Mia', 'Get in touch with Md Rohan Mia for freelance contracts, full stack development projects, architecture consulting, or technical collaborations.', 'Contact Md Rohan Mia — Hire Full Stack Developer', 'Send an inquiry or schedule a meeting with Md Rohan Mia, Full Stack Developer in Dhaka, Bangladesh.')
        ON CONFLICT (page_path) DO NOTHING;
      `);
    })().catch((err) => {
      portfolioTablesReady = null;
      throw err;
    });
  }
  return portfolioTablesReady;
}
