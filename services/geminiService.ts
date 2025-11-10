import { GoogleGenAI } from "@google/genai";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface AnalysisResult {
    text: string;
    sources: any[];
}

export const analyzeWorkflow = async (workflowDescription: string): Promise<AnalysisResult> => {
    const prompt = `
You are an expert Senior AI Analyst & Automation Consultant specializing in optimizing workflows for users of Active Campaign.

Your job is to transform the following messy workflow description—which includes a list of involved stakeholders—into a clear, actionable AI transformation plan.

Generate a response in the requested sections using Markdown. Use H2 markdown headers (##) for each section title, including an emoji.

## 📝 Executive Synthesis (TL;DR)

- **Process Name:** [Professional name for the mess]
- **Current Status:** [1 sentence summary of the chaos]
- **Operational Risk:** [What breaks if this fails? e.g., "High churn risk due to slow response"]
- **Quick Win:** [The single easiest thing to fix immediately]

---

## 🗺️ Visual Process Map (Mermaid.js)

Generate a valid Mermaid.js flowchart (graph TD) representing the current state.
- **THE SINGLE MOST IMPORTANT RULE:** EVERY node label (the text part) MUST be enclosed in double quotes. This is non-negotiable and the most common source of errors.
  - **Correct:** \`A["Label with spaces, (parentheses), and special characters"]\`
  - **INCORRECT:** \`A[Label without quotes]\`
- **Other CRITICAL SYNTAX RULES:**
  - **Node IDs:** Use simple, single-word alphanumeric IDs (e.g., \`A\`, \`B\`, \`C1\`, \`Step1\`). **DO NOT** use special characters, spaces, or hyphens in node IDs.
  - **Time Estimates:** Each process node label MUST include an estimated time duration, e.g., \`"Review Ticket (Est: 5 mins)"\`.
  - **Stakeholder Association:** For each process step, add the responsible stakeholder on a new line inside the node label using a \`<br>\` tag. Use the stakeholder names as provided in the input. Example: \`"<br>By: Jenna (Manager)"\`.
  - **Code Block:** The response for this section MUST ONLY contain the Mermaid code inside a single \`\`\`mermaid code block. Do not add any text before or after it.
  - **Styling:** To style a node as a bottleneck, use the format: \`style NODE_ID fill:#ffcccc,stroke:#ff0000,stroke-width:2px,color:#000\`.
- **Final Check:** Before outputting the code, re-read the rules above—especially the double-quotes rule—and confirm your chart is 100% valid.
- **VALID EXAMPLE:**
  \`\`\`mermaid
  graph TD
      A["Start (Est: 1 min)<br>By: Alex"] --> B{"Manager Approval (Est: 5 mins)<br>By: Jenna (Manager)"};
      B -->|Approved| C["Forward to Finance (Est: 1 min)<br>By: Jenna (Manager)"];
      B -->|Rejected| D["Revise Report (Est: 15 mins)<br>By: Alex"];
      C --> E["Finance Review (Est: 20 mins)<br>By: Frank"];
      D --> A;
      E --> F["End"];
      style E fill:#ffcccc,stroke:#ff0000,stroke-width:2px,color:#000
  \`\`\`
- **YOUR TASK:** Generate the Mermaid.js chart based on the user's workflow.

---

## 🔴 Bottleneck Diagnosis (Top 3)

Identify the top 3 issues. Assign a "Pain Score" (1-10) to each.
- **[Score 8-10] CRITICAL BLOCKER:** [Stops the entire process]
- **[Score 5-7] FRICTION POINT:** [Manual handoff, re-keying data, waiting on slack]
- **[Score 1-4] TOIL:** [Annoying but functional manual work]
*(Include 1 sentence of evidence from the text for each)*

---

## ✨ AI Opportunity & Prioritization

Identify the 2 highest-impact AI opportunities. Place them in a text-based 2x2 matrix:
> **STRATEGIC INITIATIVE (High Value / High Effort):**
> * [Opportunity Name] - [Brief rationale]
>
> **QUICK WIN (High Value / Low Effort):**
> * [Opportunity Name] - [Brief rationale]

---

## 🛡️ Risk Register & Guardrails

(Crucial for Analyst role: Show you don't blindly trust AI)
- **Implementation Risk:** [e.g., "Stakeholder resistance from Finance team"]
- **AI Guardrail Needed:** [e.g., "Human-in-the-loop required before sending final email to customer"]

---

## 🛠️ Recommended AI Stack & ROI (Powered by Google Search)

**CRITICAL:** You MUST use the Google Search tool to research and recommend 2 modern AI-powered or automation tools that solve the user's problem. Do not invent tools or data.

**RESPONSE FORMATTING:** Your response for this section MUST ONLY contain a JSON code block with an array of tool objects. Each object must have the following keys: "tool", "helps", "timeSaved", "cost", "payback".
- The "helps" value MUST be a single, short sentence.
- The sources for your research will be automatically displayed to the user.
- Do not add any text before or after the JSON code block.

**VALID EXAMPLE:**
\`\`\`json
[
  {
    "tool": "Workato",
    "helps": "Automates new hire provisioning by connecting HR and IT systems.",
    "timeSaved": "30-40 hours/month",
    "cost": "Starts at ~$10,000/year",
    "payback": "Under 3 months"
  },
  {
    "tool": "Zluri",
    "helps": "Specializes in HR-driven IT provisioning to grant secure app access from day one.",
    "timeSaved": "20-30 hours/month",
    "cost": "Contact for Quote",
    "payback": "Under 6 months"
  }
]
\`\`\`

---

## ⚖️ Build vs. Buy Analysis

Provide a balanced analysis of building a custom solution vs. buying a third-party tool.
- **Path 1: Buy a Third-Party Tool**
  - **Pros:** [e.g., "Faster implementation", "Lower upfront cost", "Predictable pricing"]
  - **Cons:** [e.g., "May not fit exact needs", "Data security concerns", "Subscription costs add up"]
- **Path 2: Build an Internal Solution**
  - **Pros:** [e.g., "Perfectly tailored to workflow", "Own the intellectual property", "Deeper integration potential"]
  - **Cons:** [e.g., "High upfront development cost", "Longer time-to-value", "Requires ongoing maintenance resources"]

---

## 👥 Stakeholder Impact Analysis

Based on the provided stakeholder list and workflow, analyze the human element.
- **[Stakeholder Name/Role]:** [1-2 sentences on how the current process negatively impacts them (e.g., "Wastes time on manual data entry").]
- **[Stakeholder Name/Role]:** [1-2 sentences on how the proposed AI/automation changes will positively affect them (e.g., "Frees up 5 hours a week to focus on high-value tasks").]
- *Repeat for all key stakeholders.*

---

**CRITICAL INSTRUCTIONS:**
- You MUST generate a response for ALL sections in the template.
- You MUST use the Google Search tool to find real-world tools for the "Recommended AI Stack & ROI" section. Do not use placeholder information.
- You MUST place a Markdown horizontal rule (\`---\`) between each major H2 section for clear visual separation.
- Be concise. Use bullet points over paragraphs.
- If data is missing from the user's input to complete a section, state "DATA NEEDED" instead of fabricating information.
- Use the provided Stakeholder list as a primary input for your analysis, especially for the Stakeholder Impact Analysis section.

---
USER-PROVIDED INPUT:
---
${workflowDescription}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    
    const candidate = response.candidates?.[0];

    // If there's no candidate, return an error message.
    if (!candidate) {
      return { text: 'An error occurred while generating the analysis. No content was returned from the AI.', sources: [] };
    }

    // Explicitly build the text from parts and get sources separately
    // to ensure reliability when grounding is used.
    const text = candidate.content?.parts.map(p => p.text).join('') ?? '';
    const sources = candidate.groundingMetadata?.groundingChunks ?? [];
    
    return { text, sources };

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`Error interacting with Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling the Gemini API.");
  }
};