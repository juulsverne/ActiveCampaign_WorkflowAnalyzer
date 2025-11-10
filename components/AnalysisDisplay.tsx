import React, { useEffect, useRef } from 'react';
import { Link } from 'lucide-react';

interface AnalysisDisplayProps {
  content: string;
  sources: any[];
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ content, sources }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!content) {
      containerRef.current.innerHTML = '';
      return;
    }

    const marked = (window as any).marked;
    const mermaidAPI = (window as any).mermaid;

    if (!marked || !mermaidAPI) {
      console.error("Required libraries (Marked.js or Mermaid.js) not found.");
      containerRef.current.innerText = "Error: A required library for rendering is not available.";
      return;
    }

    let processedContent = content;
    const roiPlaceholderId = 'roi-placeholder';
    const mermaidPlaceholderId = 'mermaid-placeholder';

    // 1. Isolate and prepare ROI section
    const roiRegex = /```json\n([\s\S]*?)```/;
    const roiMatch = processedContent.match(roiRegex);
    let roiTools: any[] | null = null;
    if (roiMatch && roiMatch[1]) {
      try {
        roiTools = JSON.parse(roiMatch[1]);
        // Replace the JSON block with a placeholder for our custom HTML
        processedContent = processedContent.replace(roiMatch[0], `<div id="${roiPlaceholderId}" class="my-6"></div>`);
      } catch (e) {
        console.error("Failed to parse ROI JSON:", e);
        // If JSON is invalid, leave it in the markdown to be displayed as a code block.
      }
    }
    
    // 2. Isolate and prepare Mermaid section
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/;
    const mermaidMatch = processedContent.match(mermaidRegex);
    let mermaidCode = '';
    if (mermaidMatch && mermaidMatch[1]) {
      mermaidCode = mermaidMatch[1];
      processedContent = processedContent.replace(mermaidMatch[0], `<div id="${mermaidPlaceholderId}"></div>`);
    }

    // 3. Render the main markdown content
    containerRef.current.innerHTML = marked.parse(processedContent);

    // 4. Inject custom ROI HTML
    if (roiTools) {
      const roiPlaceholder = containerRef.current.querySelector(`#${roiPlaceholderId}`);
      if (roiPlaceholder) {
        const briefcaseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-3 text-cyan-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
        const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-3 text-slate-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
        const dollarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-3 text-slate-400"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
        const zapIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-3 text-slate-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
        
        const roiHtml = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
            ${roiTools.map(tool => `
              <div class="bg-slate-700/50 rounded-lg p-6 border border-slate-600 flex flex-col">
                <h4 class="text-xl font-bold text-slate-100 mb-2 flex items-center">
                  ${briefcaseIcon}
                  ${tool.tool || ''}
                </h4>
                <p class="text-slate-300 text-sm mb-6 flex-grow">${tool.helps || ''}</p>
                <div class="space-y-4 text-sm mt-auto">
                  <div class="flex items-center">
                    ${clockIcon}
                    <div>
                      <span class="font-semibold text-slate-200">Est. Time Saved:</span>
                      <span class="text-slate-300 ml-2">${tool.timeSaved || 'N/A'}</span>
                    </div>
                  </div>
                  <div class="flex items-center">
                    ${dollarIcon}
                    <div>
                      <span class="font-semibold text-slate-200">Est. Cost:</span>
                      <span class="text-slate-300 ml-2">${tool.cost || 'N/A'}</span>
                    </div>
                  </div>
                  <div class="flex items-center">
                    ${zapIcon}
                    <div>
                      <span class="font-semibold text-slate-200">Payback Period:</span>
                      <span class="text-slate-300 ml-2">${tool.payback || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        roiPlaceholder.innerHTML = roiHtml;
      }
    }

    // 5. Inject and render Mermaid
    const mermaidPlaceholder = containerRef.current.querySelector(`#${mermaidPlaceholderId}`);
    if (mermaidPlaceholder && mermaidCode) {
      const details = document.createElement('details');
      details.open = true;
      details.className = 'group my-4';

      const summary = document.createElement('summary');
      summary.className = 'flex items-center gap-2 cursor-pointer list-none text-slate-300 hover:text-white transition-colors py-2';
      summary.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 transition-transform group-open:rotate-180"><polyline points="6 9 12 15 18 9"></polyline></svg>
        <span class="font-semibold">Toggle Process Map View</span>
      `;

      const mermaidContainer = document.createElement('div');
      mermaidContainer.className = 'mermaid flex justify-center p-4 bg-slate-900 rounded-lg my-4 min-h-[200px] items-center';
      mermaidContainer.textContent = mermaidCode;

      details.appendChild(summary);
      details.appendChild(mermaidContainer);
      mermaidPlaceholder.replaceWith(details);

      try {
        mermaidAPI.run({
          nodes: details.querySelectorAll('.mermaid'),
        });
      } catch (e) {
        console.error('Mermaid.run() failed:', e);
        const invalidCode = mermaidContainer.textContent || 'Could not retrieve Mermaid code.';
        const escapedInvalidCode = invalidCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        mermaidContainer.innerHTML = `
          <div class="text-red-400 p-4 border border-red-600 bg-red-900/20 rounded-lg w-full">
            <p class="font-bold mb-2">Error: Failed to render process map.</p>
            <p class="text-sm mb-2">The AI generated invalid Mermaid.js syntax. Here is the problematic code:</p>
            <pre class="bg-slate-950 p-2 rounded text-xs text-slate-300 overflow-x-auto"><code>${escapedInvalidCode}</code></pre>
          </div>
        `;
      }
    } else if (mermaidPlaceholder) {
      mermaidPlaceholder.remove();
    }
  }, [content]);

  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
      <div
        ref={containerRef}
        className="prose prose-invert prose-slate max-w-none p-6
                   /* Section Headers & Dividers */
                   prose-h2:text-cyan-300 prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-6
                   prose-hr:my-10 prose-hr:border-slate-600
                   /* General Typography */
                   prose-strong:text-slate-100
                   prose-blockquote:border-l-cyan-500 prose-blockquote:text-slate-300
                   prose-ul:list-disc prose-li:marker:text-cyan-400
                   prose-code:bg-slate-700 prose-code:rounded prose-code:px-1 prose-code:font-mono prose-code:text-sm
                   /* Table Styles */
                   prose-table:w-full prose-table:my-6 prose-table:border-collapse
                   prose-thead:bg-slate-700/50
                   prose-th:border prose-th:border-slate-500 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-slate-200
                   prose-td:border prose-td:border-slate-600 prose-td:px-4 prose-td:py-3 prose-td:align-top prose-td:text-slate-400
                   "
      />
      {sources && sources.length > 0 && (
        <div className="p-6 border-t border-slate-700">
          <h4 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
            <Link className="w-4 h-4 mr-2" />
            Sources from Google Search
          </h4>
          <ul className="space-y-2">
            {sources.map((source, index) =>
              source.web ? (
                <li key={index}>
                  <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors text-sm break-all"
                  >
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}
    </div>
  );
};