const pptxgen = require('pptxgenjs');

// 1. Initialize Presentation
let pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// 2. Define Theme Colors (Hex codes without '#')
const BG_COLOR = '0F172A';       // Deep Slate Dark
const CARD_BG = '1E293B';        // Slightly lighter Slate for cards
const BORDER_COLOR = '334155';   // Border lines
const TEXT_TITLE = 'F8FAFC';     // White/Off-white
const TEXT_MUTED = '94A3B8';     // Gray
const ACCENT_TEAL = '0D9488';    // Teal
const ACCENT_VIOLET = '8B5CF6';  // Violet
const ACCENT_GREEN = '10B981';   // Emerald Green
const ACCENT_RED = 'EF4444';     // Red

// Helper to create standard slide template
function addSlideTemplate(title, category) {
    let slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    
    // Category / Breadcrumb Tracker
    slide.addText(category.toUpperCase(), {
        x: 0.8, y: 0.4, w: 10, h: 0.3,
        fontSize: 10, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
    });
    
    // Slide Header Title
    slide.addText(title, {
        x: 0.8, y: 0.7, w: 11.7, h: 0.7,
        fontSize: 26, bold: true, color: TEXT_TITLE, fontFace: 'Arial'
    });
    
    // Bottom Footer
    slide.addText("ShopGenius Enterprise E-Commerce Platform", {
        x: 0.8, y: 7.0, w: 8, h: 0.3,
        fontSize: 9, color: '475569', fontFace: 'Arial'
    });
    
    return slide;
}

// ========================================================
// SLIDE 1: Title Slide (Cover)
// ========================================================
let slide1 = pptx.addSlide();
slide1.background = { color: BG_COLOR };

// Decorative Background Accents (Simulating gradients/glows)
slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.2, h: 7.5, fill: { color: ACCENT_TEAL }
});
slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0.2, y: 0, w: 0.1, h: 7.5, fill: { color: ACCENT_VIOLET }
});

// Main Title text
slide1.addText([
    { text: 'ShopGenius', options: { fontSize: 64, bold: true, color: TEXT_TITLE } },
    { text: '.', options: { fontSize: 64, bold: true, color: ACCENT_TEAL } }
], { x: 1.0, y: 2.2, w: 10, h: 1.2, fontFace: 'Arial' });

// Subtitle
slide1.addText("Next-Generation Smart E-Commerce Platform", {
    x: 1.0, y: 3.5, w: 10, h: 0.5,
    fontSize: 20, color: ACCENT_VIOLET, fontFace: 'Arial', bold: true
});

// Description & Subtopics
slide1.addText("AI Price Negotiation  |  Algorithmic Fraud Scoring  |  Smart Recovery Logs", {
    x: 1.0, y: 4.1, w: 10, h: 0.4,
    fontSize: 13, color: TEXT_MUTED, fontFace: 'Arial'
});

// Technical footer details
slide1.addText([
    { text: "Core Architecture:\n", options: { bold: true, color: ACCENT_TEAL } },
    { text: "Java 21  •  Spring Boot 3.x  •  PostgreSQL & Redis  •  Vanilla JS client", options: { color: TEXT_MUTED } }
], {
    x: 1.0, y: 5.3, w: 10, h: 0.8,
    fontSize: 11, fontFace: 'Arial'
});


// ========================================================
// SLIDE 2: Problem Space vs Solution
// ========================================================
let slide2 = addSlideTemplate("Bridging the Gap in Modern Retail", "Executive Summary");

// Column 1: The Challenges (Card Layout)
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.6, w: 5.6, h: 4.9, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
});
slide2.addText("THE E-COMMERCE LANDSCAPE CHALLENGES", {
    x: 1.1, y: 1.9, w: 5.0, h: 0.4, fontSize: 13, bold: true, color: ACCENT_RED, fontFace: 'Arial'
});
slide2.addText([
    { text: "• Static Pricing Model: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Fixed pricing fails to capture price-sensitive segments, hurting conversion.\n\n", options: { color: TEXT_MUTED } },
    { text: "• High Cart Abandonment: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Up to 70% of shopping carts are abandoned without proactive recovery hooks.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Payment Fraud & Bots: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Standard stores are vulnerable to credential testing and checkout fraud.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Heavy Client Load: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Over-bloated framework bundles delay page rendering and lower search ranking.", options: { color: TEXT_MUTED } }
], { x: 1.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 11.5, fontFace: 'Arial' });

// Column 2: The Solution (Card Layout)
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: 1.6, w: 5.7, h: 4.9, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
});
slide2.addText("THE SHOPGENIUS SOLUTION", {
    x: 7.1, y: 1.9, w: 5.0, h: 0.4, fontSize: 13, bold: true, color: ACCENT_GREEN, fontFace: 'Arial'
});
slide2.addText([
    { text: "• AI Price Negotiation Engine: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Gamified bargaining portal converts passive sessions to immediate sales.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Smart Analytics Watchers: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Automated recovery logs and user-defined price watch subscriptions.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Algorithmic Fraud Scoring: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Evaluates and blocks bad-faith checkout activities in real time.\n\n", options: { color: TEXT_MUTED } },
    { text: "• High Performance Vanilla Stack: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Direct DOM logic, vanilla JS assets, and semantic SEO layouts.", options: { color: TEXT_MUTED } }
], { x: 7.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 11.5, fontFace: 'Arial' });


// ========================================================
// SLIDE 3: AI Price Negotiation Engine
// ========================================================
let slide3 = addSlideTemplate("Transforming Static Sales into Dynamic Conversations", "Core Features");

// Horizontal Flow cards
const flowSteps = [
    { num: "01", title: "User Submits Bid", desc: "Customers enter their custom target offer price inside the details sidebar chat modal." },
    { num: "02", title: "Backend Math Evaluation", desc: "The AI checks the bid against cost margins, active inventory counts, and user loyalty points." },
    { num: "03", title: "Bargain Result Logic", desc: "The bot accepts the bid, proposes a compromise counter-offer, or triggers final offer constraints." }
];

flowSteps.forEach((step, i) => {
    let xPos = 0.8 + (i * 4.0);
    
    // Background card
    slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: 1.8, w: 3.7, h: 3.2, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
    });
    
    // Card Step Number
    slide3.addText(step.num, {
        x: xPos + 0.3, y: 2.1, w: 1.0, h: 0.5, fontSize: 24, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
    });
    
    // Card Title
    slide3.addText(step.title, {
        x: xPos + 0.3, y: 2.6, w: 3.1, h: 0.4, fontSize: 14, bold: true, color: TEXT_TITLE, fontFace: 'Arial'
    });
    
    // Card Desc
    slide3.addText(step.desc, {
        x: xPos + 0.3, y: 3.1, w: 3.1, h: 1.6, fontSize: 11.5, color: TEXT_MUTED, fontFace: 'Arial'
    });
});

// Value Callout Box
slide3.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8, y: 5.3, w: 11.7, h: 1.1, fill: { color: CARD_BG }, line: { color: ACCENT_VIOLET, width: 1 }
});
slide3.addText("BUSINESS VALUE:", {
    x: 1.1, y: 5.5, w: 2.0, h: 0.3, fontSize: 12, bold: true, color: ACCENT_VIOLET, fontFace: 'Arial'
});
slide3.addText("Gamifies the shopping experience to capture bargain-hunting consumers, increases average order values, and enables price flexibility without diluting brand value across the public catalog.", {
    x: 1.1, y: 5.8, w: 11.1, h: 0.5, fontSize: 11.5, color: TEXT_MUTED, fontFace: 'Arial'
});


// ========================================================
// SLIDE 4: Security Engine: Algorithmic Fraud Scoring
// ========================================================
let slide4 = addSlideTemplate("Proactive Security and Margin Risk Management", "Core Features");

// Split layout
// Left Card: Scoring parameters
slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.7, w: 6.8, h: 4.8, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
});
slide4.addText("REAL-TIME BEHAVIORAL SCORING METRICS", {
    x: 1.1, y: 2.0, w: 6.2, h: 0.4, fontSize: 13, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
});
slide4.addText([
    { text: "• Velocity Metrics: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Tracks request frequencies and multiple checkout sessions to identify automated scripts.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Transaction Size Audits: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Flags order totals that deviate significantly from standard account averages.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Geolocation & Session Risk: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Evaluates logins and actions across conflicting local parameters.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Smart Action Gates: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Fails, holds, or tags checkouts exceeding a safety score boundary for admin review.", options: { color: TEXT_MUTED } }
], { x: 1.1, y: 2.5, w: 6.2, h: 3.7, fontSize: 12, fontFace: 'Arial' });

// Right Columns: Levels
const risks = [
    { label: "LOW RISK", color: ACCENT_GREEN, desc: "Order processed immediately with automated verification." },
    { label: "MEDIUM RISK", color: 'EAB308', desc: "Requires manual administrative audit. Notification triggered." },
    { label: "HIGH RISK", color: ACCENT_RED, desc: "Order auto-cancelled and security token suspended." }
];

risks.forEach((risk, i) => {
    let yPos = 1.7 + (i * 1.67);
    slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 7.8, y: yPos, w: 4.7, h: 1.46, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
    });
    slide4.addText(risk.label, {
        x: 8.1, y: yPos + 0.2, w: 3.0, h: 0.3, fontSize: 12, bold: true, color: risk.color, fontFace: 'Arial'
    });
    slide4.addText(risk.desc, {
        x: 8.1, y: yPos + 0.5, w: 4.1, h: 0.7, fontSize: 10.5, color: TEXT_MUTED, fontFace: 'Arial'
    });
});


// ========================================================
// SLIDE 5: Personalization & Smart Analytics
// ========================================================
let slide5 = addSlideTemplate("Automated Re-engagement and Custom Alerts", "Core Features");

// 3 Column Layout
const features = [
    { title: "Cart Recovery Logs", label: "RETENTION ENGINE", desc: "Background listeners flag abandoned active baskets. The system schedules recovery actions and injects customized incentive codes (e.g. 'RECOVERY15') into client logs." },
    { title: "Price Drop Watchers", label: "ALERT SYSTEM", desc: "Users subscribe to target price thresholds on their favorite products. If the store's catalog price drops below the trigger point, immediate user alerts are dispatched." },
    { title: "Sustainability Sorting", label: "VALUE COMMERCE", desc: "Integrates green consumer psychology by calculating a product Eco Score. The catalog uses a high-performance score filter to spotlight green products." }
];

features.forEach((feat, i) => {
    let xPos = 0.8 + (i * 4.0);
    slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: 1.8, w: 3.7, h: 4.6, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
    });
    slide5.addText(feat.label, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.3, fontSize: 10, bold: true, color: ACCENT_VIOLET, fontFace: 'Arial'
    });
    slide5.addText(feat.title, {
        x: xPos + 0.3, y: 2.5, w: 3.1, h: 0.4, fontSize: 16, bold: true, color: TEXT_TITLE, fontFace: 'Arial'
    });
    slide5.addText(feat.desc, {
        x: xPos + 0.3, y: 3.1, w: 3.1, h: 3.0, fontSize: 11.5, color: TEXT_MUTED, fontFace: 'Arial'
    });
});


// ========================================================
// SLIDE 6: Backend Tech Stack & Architecture
// ========================================================
let slide6 = addSlideTemplate("High-Performance Java & Spring Boot Core", "Architecture");

// Stack Grid (4 items)
const backendGrid = [
    { tech: "Java 21 & Spring Boot 3.x", sub: "Enterprise foundation with virtual threads, package-by-feature architecture, and SOLID design patterns." },
    { tech: "Spring Data JPA & PostgreSQL", sub: "Robust data access, relational integrity checks, index optimizations, and Flyway automated schema management." },
    { tech: "Redis Session Caching", sub: "High-speed memory cache for user session persistence, active cart values, and security token blacklist states." },
    { tech: "Unified Error Handling", sub: "Global translation controllers wrapping exceptions into unified API payloads and standard HTTP statuses." }
];

backendGrid.forEach((item, i) => {
    let xPos = 0.8 + (i % 2) * 6.0;
    let yPos = 1.8 + Math.floor(i / 2) * 2.5;
    
    slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: yPos, w: 5.7, h: 2.2, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
    });
    
    slide6.addText(item.tech, {
        x: xPos + 0.3, y: yPos + 0.3, w: 5.1, h: 0.4, fontSize: 15, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
    });
    
    slide6.addText(item.sub, {
        x: xPos + 0.3, y: yPos + 0.8, w: 5.1, h: 1.1, fontSize: 11.5, color: TEXT_MUTED, fontFace: 'Arial'
    });
});


// ========================================================
// SLIDE 7: Frontend Tech Stack & Performance
// ========================================================
let slide7 = addSlideTemplate("Zero-Bloat and High-Speed User Experience", "Architecture");

// Left Column: Main concepts
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.8, w: 6.8, h: 4.6, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
});
slide7.addText("PERFORMANCE DRIVEN CLIENT SHELL", {
    x: 1.1, y: 2.1, w: 6.2, h: 0.4, fontSize: 13, bold: true, color: ACCENT_VIOLET, fontFace: 'Arial'
});
slide7.addText([
    { text: "• Vanilla Javascript Implementation: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Direct DOM actions avoid heavy layout reconciliation steps, maximizing responsiveness.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Single Page Application (SPA): ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Simulates routes locally using URL hash states, preventing server-side render delays.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Custom CSS Grid Layouts: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Modern responsive grid system with typography (Plus Jakarta Sans) and glassmorphism card skins.", options: { color: TEXT_MUTED } }
], { x: 1.1, y: 2.6, w: 6.2, h: 3.5, fontSize: 12, fontFace: 'Arial' });

// Right Column: KPIs
const kpis = [
    { value: "< 100ms", label: "LCP", desc: "Largest Contentful Paint ensures instantaneous page loads." },
    { value: "0ms", label: "FID", desc: "First Input Delay for rapid button interactions." },
    { value: "100%", label: "SEO Score", desc: "Perfect score due to semantic HTML layouts." }
];

kpis.forEach((kpi, i) => {
    let yPos = 1.8 + (i * 1.6);
    slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 7.8, y: yPos, w: 4.7, h: 1.4, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
    });
    
    slide7.addText(kpi.value, {
        x: 8.1, y: yPos + 0.2, w: 1.8, h: 0.4, fontSize: 20, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
    });
    slide7.addText(kpi.label, {
        x: 8.1, y: yPos + 0.6, w: 1.8, h: 0.3, fontSize: 10, bold: true, color: TEXT_TITLE, fontFace: 'Arial'
    });
    slide7.addText(kpi.desc, {
        x: 9.8, y: yPos + 0.2, w: 2.5, h: 1.0, fontSize: 10, color: TEXT_MUTED, fontFace: 'Arial'
    });
});


// ========================================================
// SLIDE 8: Local Infrastructure: Caching and Containers
// ========================================================
let slide8 = addSlideTemplate("Consistent Containerized Services", "Infrastructure");

// Diagram Boxes
const containers = [
    { title: "Maven Build Runner", sub: "COMPILER", desc: "Compiles Spring Boot 3 dependencies, runs local verification test units, and packages into a thin JAR." },
    { title: "PostgreSQL Database", sub: "PRIMARY DATA", desc: "Dedicated instance containing users, orders, items, and log records, structured with tables and foreign keys." },
    { title: "Redis Cache Store", sub: "SESSION STORAGE", desc: "High-speed key-value cache cluster that keeps active carts and user session tokens off the database." }
];

containers.forEach((box, i) => {
    let xPos = 0.8 + (i * 4.0);
    
    slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: 1.8, w: 3.7, h: 3.2, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
    });
    
    slide8.addText(box.sub, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.3, fontSize: 9, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
    });
    
    slide8.addText(box.title, {
        x: xPos + 0.3, y: 2.5, w: 3.1, h: 0.4, fontSize: 14, bold: true, color: TEXT_TITLE, fontFace: 'Arial'
    });
    
    slide8.addText(box.desc, {
        x: xPos + 0.3, y: 3.0, w: 3.1, h: 1.8, fontSize: 10.5, color: TEXT_MUTED, fontFace: 'Arial'
    });
});

// Docker Compose block at bottom
slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 5.3, w: 11.7, h: 1.2, fill: { color: CARD_BG }, line: { color: ACCENT_VIOLET, width: 1 }
});
slide8.addText("LOCAL DEVELOPER ORCHESTRATION:", {
    x: 1.1, y: 5.5, w: 3.0, h: 0.3, fontSize: 11, bold: true, color: ACCENT_VIOLET, fontFace: 'Arial'
});
slide8.addText("Managed entirely via 'docker-compose.yml'. Developers can spin up the full multi-container databases and caching nodes in seconds, guaranteeing development parity with production cloud settings.", {
    x: 1.1, y: 5.8, w: 11.1, h: 0.6, fontSize: 11, color: TEXT_MUTED, fontFace: 'Arial'
});


// ========================================================
// SLIDE 9: DevOps & Cloud Orchestration
// ========================================================
let slide9 = addSlideTemplate("Automated Pipelines and Infrastructure as Code", "DevOps");

// Horizontal pipeline cards
const pipeSteps = [
    { title: "GitHub Sync", desc: "Commit to main repository triggers automated git webhooks." },
    { title: "Render Build", desc: "YAML file compiles backend JAR and deploys assets." },
    { title: "Flyway Migration", desc: "Versioned SQL runs on startup to update tables safely." },
    { title: "Zero-Downtime Live", desc: "Health checks verify success before switching traffic." }
];

pipeSteps.forEach((step, i) => {
    let xPos = 0.8 + (i * 2.925);
    
    slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: 2.0, w: 2.8, h: 2.8, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
    });
    
    slide9.addText("STEP 0" + (i+1), {
        x: xPos + 0.25, y: 2.2, w: 2.3, h: 0.3, fontSize: 10, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
    });
    
    slide9.addText(step.title, {
        x: xPos + 0.25, y: 2.6, w: 2.3, h: 0.4, fontSize: 13, bold: true, color: TEXT_TITLE, fontFace: 'Arial'
    });
    
    slide9.addText(step.desc, {
        x: xPos + 0.25, y: 3.1, w: 2.3, h: 1.5, fontSize: 10.5, color: TEXT_MUTED, fontFace: 'Arial'
    });
    
    // Draw arrows between boxes (except last one)
    if (i < 3) {
        slide9.addText("➔", {
            x: xPos + 2.75, y: 3.1, w: 0.3, h: 0.5, fontSize: 16, bold: true, color: ACCENT_VIOLET, fontFace: 'Arial'
        });
    }
});

// DevOps block at bottom
slide9.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8, y: 5.2, w: 11.7, h: 1.3, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
});
slide9.addText("INFRASTRUCTURE AS CODE Highlights", {
    x: 1.1, y: 5.4, w: 4.0, h: 0.3, fontSize: 11, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
});
slide9.addText([
    { text: "• render.yaml definition: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Coordinates the PostgreSQL service database and Java server automatically.\n", options: { color: TEXT_MUTED } },
    { text: "• Dynamic Environment Bindings: ", options: { bold: true, color: TEXT_TITLE } },
    { text: "Injects JWT secrets and PostgreSQL URLs directly to JVM variables, protecting keys.", options: { color: TEXT_MUTED } }
], { x: 1.1, y: 5.7, w: 11.1, h: 0.7, fontSize: 10.5, fontFace: 'Arial' });


// ========================================================
// SLIDE 10: Future Roadmap & Vision
// ========================================================
let slide10 = addSlideTemplate("Scaling ShopGenius to the Next Level", "Future Vision");

// 4 horizontal timeline points
const timeline = [
    { title: "Generative AI Agents", label: "PHASE 1", desc: "Upgrade the rule-based logic to an LLM-powered assistant (Gemini/GPT-4o via Spring AI) that handles fluid conversational bargaining." },
    { title: "Active Payments", label: "PHASE 2", desc: "Integrate official Stripe and PayPal checkout flows, replacing simulated payment endpoints with production APIs." },
    { title: "Logistics Carrier Sync", label: "PHASE 3", desc: "Establish direct connections to FedEx/UPS APIs for shipping estimations, delivery routes, and tracking maps." },
    { title: "Analytics Portal", label: "PHASE 4", desc: "Develop an advanced reporting interface for store admins to track profit margins and AI negotiation logs." }
];

timeline.forEach((point, i) => {
    let xPos = 0.8 + (i * 2.925);
    
    // Main Card
    slide10.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: 1.8, w: 2.8, h: 4.7, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }
    });
    
    // Timeline node circle
    slide10.addShape(pptx.shapes.OVAL, {
        x: xPos + 0.25, y: 2.1, w: 0.5, h: 0.5, fill: { color: ACCENT_TEAL }
    });
    slide10.addText((i + 1).toString(), {
        x: xPos + 0.25, y: 2.1, w: 0.5, h: 0.5, fontSize: 12, bold: true, color: TEXT_TITLE, align: 'center', fontFace: 'Arial'
    });
    
    // Phase Label
    slide10.addText(point.label, {
        x: xPos + 0.9, y: 2.2, w: 1.5, h: 0.3, fontSize: 10, bold: true, color: ACCENT_TEAL, fontFace: 'Arial'
    });
    
    // Title
    slide10.addText(point.title, {
        x: xPos + 0.25, y: 2.8, w: 2.3, h: 0.5, fontSize: 13, bold: true, color: TEXT_TITLE, fontFace: 'Arial'
    });
    
    // Desc
    slide10.addText(point.desc, {
        x: xPos + 0.25, y: 3.4, w: 2.3, h: 2.9, fontSize: 10.5, color: TEXT_MUTED, fontFace: 'Arial'
    });
});


// 4. Save/Write Presentation File
pptx.writeFile({ fileName: 'ShopGenius_Presentation.pptx' })
    .then(fileName => {
        console.log(`Successfully generated presentation: ${fileName}`);
    })
    .catch(err => {
        console.error(`Failed to generate presentation: ${err}`);
        process.exit(1);
    });
