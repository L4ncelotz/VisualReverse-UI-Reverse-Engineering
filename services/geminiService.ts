import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an expert UI/UX reverse engineer and React developer.

When the user uploads an image of a user interface, your task is to:
1. Analyze all UI components (buttons, cards, inputs, navigation, icons)
2. Detect layout structure (flexbox, grid, positioning, responsive behavior)
3. Extract colors, typography, spacing, and shadows
4. Generate production-ready React + TypeScript + Tailwind CSS code

**TECHNICAL REQUIREMENTS:**
-   **Tech Stack:** React 18+ (Functional Components), TypeScript, Tailwind CSS.
-   **Icons:** Use 'lucide-react' for all icons. Import them like: \`import { Search, Menu, User } from 'lucide-react';\`.
-   **Single File:** Return a SINGLE file containing the full component and any sub-components. Export the main component as default.
-   **No Markdown:** Return ONLY the raw code string. Do NOT wrap it in markdown code blocks (e.g., \`\`\`tsx ... \`\`\`).

**DESIGN & ACCESSIBILITY REQUIREMENTS:**
✅ **Fully Responsive:** Use \`sm:\`, \`md:\`, \`lg:\`, \`xl:\` breakpoints. Ensure the layout adapts gracefully from mobile to desktop.
✅ **Strict Accessibility Standards:**
    -   **Semantic HTML:** Use proper tags (\`nav\`, \`main\`, \`header\`, \`footer\`, \`section\`, \`article\`) instead of generic divs where appropriate.
    -   **ARIA Attributes:** Add \`aria-label\` for icon-only buttons and \`aria-expanded\` for toggleable elements.
    -   **Focus Management:** Ensure visible focus states (\`focus:ring-2\`, \`focus:ring-offset-2\`) for keyboard navigation.
    -   **Dynamic Content:** YOU MUST use \`aria-live="polite"\` or \`aria-live="assertive"\` for regions that update dynamically (e.g., error messages, notification toasts, search results).
    -   **Forms:** All inputs must have associated \`htmlFor\` labels or \`aria-label\` attributes.
✅ **Interactivity:** Add hover states (\`hover:bg-...\`, \`hover:scale-...\`) and active states. Use \`transition-all\` for smoothness.
✅ **Visual Fidelity:** Replicate the visual design (colors, spacing, radius, shadows) as closely as possible using Tailwind classes.

**DESIGN TOKENS:**
At the very end of the code, you MUST add a comment block with the extracted design tokens in this exact format:

/*
 * DESIGN_TOKENS:
 * {
 *   "color_palette": { "primary": "...", "secondary": "...", "background": "..." },
 *   "typography": { "font_family": "...", "headings": "...", "body": "..." },
 *   "animation_constants": { "transition": "all 0.3s ease" }
 * }
 */

Make the code beautiful, clean, and ready to use.
`;

export const generateCodeFromImage = async (
  imageFile: File
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing in environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Convert file to base64
    const base64Data = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data,
            },
          },
          {
            text: "Reverse engineer this UI into a single production-ready React + Tailwind component. Focus heavily on accessibility (ARIA, focus states) and responsiveness.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, // Low temperature for precise code generation
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No code generated.");
    }

    // Clean up if the model accidentally included markdown backticks despite instructions
    let cleanText = text.trim();
    if (cleanText.startsWith("```tsx")) {
      cleanText = cleanText.replace(/^```tsx\n/, "").replace(/\n```$/, "");
    } else if (cleanText.startsWith("```typescript")) {
      cleanText = cleanText.replace(/^```typescript\n/, "").replace(/\n```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    return cleanText;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};