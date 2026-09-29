/* Catalog as of the path-and-timeframe pass. The live page is HTML in
   roadmap.html; this file is the same node list for later reuse. */
window.ROADMAP = {
  nodes: [
    {
      id: "start",
      title: "Start",
      stage: "start",
      x: 48,
      y: 220,
      kinds: ["skill"],
      tracks: [],
      level: "beginner",
      briefing: "Order matters. The gate cert, then a practical cert, then a project.",
      why: "Order matters. The gate cert, then a practical cert, then a project.",
      next: ["security-plus"],
      links: []
    },
    {
      id: "security-plus",
      title: "Security+",
      stage: "certs",
      x: 320,
      y: 220,
      kinds: ["cert"],
      tracks: [],
      level: "beginner",
      briefing: "The gate cert. Broad vocabulary across threats, controls, and operations. Plan on 1 to 3 months.",
      why: "Gate cert first. Not a specialty, and not the last cert.",
      next: ["practical-cert"],
      links: [{ label: "CompTIA Security+", href: "https://www.comptia.org/certifications/security" }]
    },
    {
      id: "practical-cert",
      title: "Practical certification",
      stage: "certs",
      x: 600,
      y: 220,
      kinds: ["cert"],
      tracks: [],
      level: "intermediate",
      briefing: "Hands-on certs that test doing, not memorizing. Two ways forward: Certified CyberDefenders Level 1 and Blue Team Level 1. Plan on 3 to 6 months.",
      why: "You already have Security+. Do not sit another trivia exam.",
      next: ["ccd-l1", "btl1"],
      links: []
    },
    {
      id: "ccd-l1",
      title: "Certified CyberDefenders Level 1",
      stage: "certs",
      x: 900,
      y: 40,
      kinds: ["cert"],
      tracks: ["soc"],
      level: "intermediate",
      briefing: "Certified CyberDefenders Level 1. Practical blue-team work: investigations, detections, and labs that score what you can do.",
      why: "One of the practical paths after Security+.",
      next: ["projects"],
      links: [{ label: "CyberDefenders", href: "https://cyberdefenders.org/" }]
    },
    {
      id: "btl1",
      title: "Blue Team Level 1",
      stage: "certs",
      x: 900,
      y: 400,
      kinds: ["cert"],
      tracks: ["soc"],
      level: "intermediate",
      briefing: "Blue Team Level 1. A hands-on defensive cert. Labs, not trivia.",
      why: "One of the practical paths after Security+.",
      next: ["projects"],
      links: [{ label: "Blue Team Level 1", href: "https://www.securityblue.team/why-btl1/" }]
    },
    {
      id: "projects",
      title: "Projects",
      stage: "break-in",
      x: 1220,
      y: 220,
      kinds: ["project"],
      tracks: [],
      level: "intermediate",
      briefing: "One project, written up. Something a hiring manager can read in five minutes.",
      why: "Proof of work. Certs without a writeup do not travel.",
      next: [],
      links: []
    }
  ],
  edges: [
    { from: "start", to: "security-plus" },
    { from: "security-plus", to: "practical-cert" },
    { from: "practical-cert", to: "ccd-l1" },
    { from: "practical-cert", to: "btl1" },
    { from: "ccd-l1", to: "projects" },
    { from: "btl1", to: "projects" }
  ],
  labels: [
    {
      id: "choose-practical",
      text: "Choose one",
      between: ["ccd-l1", "btl1"]
    }
  ],
  timeline: {
    maxMonths: 6,
    bands: [
      {
        id: "security-plus-time",
        label: "1–3 months",
        startMonth: 1,
        endMonth: 3,
        nodeIds: ["security-plus"]
      },
      {
        id: "practical-time",
        label: "3–6 months",
        startMonth: 3,
        endMonth: 6,
        nodeIds: ["practical-cert"]
      }
    ]
  }
};
