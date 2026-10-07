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
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
          contact_email VARCHAR(255) DEFAULT 'rohanmia.org@gmail.com',
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
    })().catch((err) => {
      portfolioTablesReady = null;
      throw err;
    });
  }
  return portfolioTablesReady;
}
