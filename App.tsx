import React, { useState, useCallback } from 'react';
import { analyzeWorkflow, AnalysisResult } from './services/geminiService';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { Loader } from './components/Loader';
import Chatbot from './components/Chatbot';
import { StakeholderPanel } from './components/StakeholderPanel';
import { BrainCircuit, MessageSquare, X } from 'lucide-react';

interface WorkflowExample {
  department: string;
  name: string;
  workflow: string;
  stakeholders: string[];
}

const examples: WorkflowExample[] = [
  {
    department: 'Content Moderation',
    name: 'T1/T2 Escalation Failure',
    workflow: `
**SOP Document Snippet: Content Moderation Tier 1**
- When a user flags a post, a ticket is created in Zendesk.
- T1 moderator opens the ticket and reviews the post against the Community Guidelines v2.3.
- If it's a clear violation (spam, harassment), moderator applies the 'Violating Content' macro in Zendesk, which suspends the user for 24 hours and sends them a templated email.
- If unclear, escalate to T2 by assigning the ticket to the 'Tier 2 Review' group.

**Email from a user:**
Subject: URGENT - Graphic Content not removed
To: support@example.com
Body: I reported a post 3 hours ago showing horrible violence and it's STILL UP. My ticket is #8675309. Your platform is unsafe! What are you doing about this??

**Slack Transcript: #moderation_escalations**
**Anna (T2 Mod):** Hey @channel, I've got ticket #8675309. The user is right, this is really bad. T1 mod on the ticket was Raj. He's new. He escalated it correctly but the SLA for T2 pickup is 4 hours and we're swamped.
**Ben (Team Lead):** I'll take it. But this is the third time this week a new T1 has hesitated on a clear-cut graphic content violation. The Zendesk macro is supposed to be easy. Is the training doc not clear? We're risking major brand safety issues if these things stay live for hours. We need a better system than just "escalate and wait".
    `,
    stakeholders: ['Raj (T1 Moderator)', 'Anna (T2 Moderator)', 'Ben (Team Lead)', 'End User (content reporter)'],
  },
  {
    department: 'Sales & Onboarding',
    name: 'Sales to Onboarding Handoff Friction',
    workflow: `
**Email Chain:**
From: Sales-Bot <sales@example.com>
To: charlie.d@example.com
Subject: New Lead: Acme Corp

A new lead has been assigned to you.
Name: Jane Smith
Company: Acme Corp
Email: jane.s@acmecorp.com
Notes: Interested in Enterprise Plan.

---
From: charlie.d@example.com
To: onboarding-team@example.com
Subject: Fwd: New Lead: Acme Corp

Hey team, just closed Jane from Acme Corp! Deal is signed. Can you get them set up? I've attached the signed PDF.

---
From: priya.k@example.com
To: charlie.d@example.com
Subject: Re: New Lead: Acme Corp

Hi Charlie, congrats on the close! To start onboarding, I need you to fill out the "New Customer Onboarding Form" on Confluence with their technical contact info, success goals, and which data center they need to be provisioned in. I can't start without that form. Link: [confluence link]

**Transcript of Sales-to-Onboarding Handoff Meeting Notes:**
- Priya (Onboarding): The biggest issue is getting complete info from Sales. We often have to go back and forth for days just to get the basic technical details.
- Charlie (Sales): The Confluence form is clunky and asks for stuff I don't always have. I just want to close the deal and pass it over.
- Priya: But if we don't get the data center right, the customer's latency is terrible and they churn. We need that info upfront.
- Charlie: Can't we just have a kickoff call with the customer to get it?
- Priya: That delays the start by a week and looks unprofessional. There has to be a better way to capture this info when the deal is signed. Maybe something in Salesforce?
    `,
    stakeholders: ['Charlie (Sales)', 'Priya (Onboarding)', 'Jane Smith (New Customer)'],
  },
  {
    department: 'IT Support',
    name: 'Shared Drive Access Issue',
    workflow: `
**IT Support Ticket #T9908:**
User: David Rose
Subject: Can't access the shared drive

My computer won't let me open the Marketing folder on the Z: drive. It was working yesterday. I get an "Access Denied" error. My project deadline is today, I need these files ASAP.

**Automated Alert Email:**
From: AD-Monitor <alerts@example.com>
To: it-security-team@example.com
Subject: Alert: Multiple Failed Login Attempts for user 'drose'

Active Directory Monitor has detected 7 failed login attempts for the user 'drose' from IP address 123.45.67.89 in the last 15 minutes. The account has been automatically locked for security purposes.

**Help Desk Internal Chat Log (ServiceNow):**
**Tier 1 (Kevin):** User drose can't access Z drive. I checked his permissions in AD, looks like his group membership for 'Marketing-Full-Access' is missing. I don't have rights to add it back. Escalating to Tier 2. Ticket #T9908.
**Tier 2 (Maria):** Picking up #T9908. Saw the security alert. His account is locked. Unlocking it first. Now checking group membership... yeah, it's gone. Weird. I'll re-add him to 'Marketing-Full-Access'. Should fix it.
**Tier 2 (Maria):** Reached out to David, he confirms he can access the drive now. But why did his group membership just disappear? And was the account lockout related or a separate issue? This feels like something that will happen again. We spent 45 minutes on what should have been a 5-minute fix.
    `,
    stakeholders: ['David Rose (User)', 'Kevin (Tier 1 Support)', 'Maria (Tier 2 Support)', 'IT Security Team'],
  },
  {
    department: 'Engineering',
    name: 'Bug Triage & Hotfix Chaos',
    workflow: `
**Jira Ticket P1-1234: "Checkout button broken on Safari"**
Reporter: Customer Support
Description: Multiple customers on Safari are reporting that the final checkout button is greyed out. This is a P1 Sev-1 issue.

**Slack Channel: #eng-frontend**
**PM (Sarah):** @oncall-frontend we have a P1 blocking all Safari revenue. See P1-1234. Who can take this?
**Lead Eng (Mike):** I'm on it. Looks like the latest deployment for the new analytics tracking broke a CSS rule on Safari. Reverting the change now.
**(20 minutes later)**
**Lead Eng (Mike):** Okay, hotfix is deployed. Checkout should be working.
**QA (Tom):** The checkout button works, but now the Google Analytics dashboard isn't receiving any data for *any* browser. The hotfix broke tracking. We need to do a proper fix, not just a revert. This is what happens when we don't have a dedicated hotfix process.
    `,
    stakeholders: ['Sarah (Product Manager)', 'Mike (Lead Engineer)', 'Tom (QA Engineer)', 'Customer Support'],
  },
  {
    department: 'Finance',
    name: 'Monthly Expense Report Delays',
    workflow: `
**Company Policy Snippet (Confluence):**
To claim expenses, please download the "Expense-Report-Q3.xlsx" template, fill it out, and email it to your direct manager for approval with the subject line "Expense Report - [Your Name] - [Month]". Attach all receipts as scanned PDFs.

**Email from Employee to Manager:**
From: alex.w@example.com
To: jenna.h@example.com
Subject: Expense Report - Alex W - August
Hi Jenna, please see my attached expense report for last month. I've attached the 12 receipts as PDFs. Thanks!

**Email from Manager to Finance:**
From: jenna.h@example.com
To: finance-team@example.com
Subject: Fwd: Expense Report - Alex W - August
Approved.

**Slack DM: Finance to Employee**
**Frank (Finance):** Hey Alex, looking at your August expenses. The receipt for the "Team Dinner" on the 15th is over the $50/person limit. We can only reimburse for that amount. Also, you're missing a receipt for the Uber trip on the 22nd. I can't process this until I have that receipt.
    `,
    stakeholders: ['Alex (Employee)', 'Jenna (Manager)', 'Frank (Finance Clerk)'],
  },
  {
    department: 'Accounting',
    name: 'Vendor Invoice Payment Friction',
    workflow: `
**Email from Vendor:**
From: billing@designservices.co
To: accounts.payable@example.com
Subject: Invoice #DS-456 Due

Hi team, please find attached our invoice #DS-456 for the new website design project, due in 15 days. Thank you!
[Attached: invoice_DS-456.pdf]

**Internal Accounting Checklist (Printed on paper):**
1. Receive invoice via email.
2. Print invoice.
3. Manually enter invoice details into NetSuite (Vendor, Amount, Due Date).
4. Identify the internal owner who approved the work. (Looks like this was for Marketing).
5. Walk over to the Marketing Director's desk to get a physical signature on the printed invoice.
6. Scan the signed invoice.
7. Schedule payment in NetSuite for the due date.
8. File physical copy in "Paid Invoices" cabinet.

**Email from Marketing Director:**
From: director.mktg@example.com
To: accounts.payable@example.com
Subject: Re: Approval for invoice #DS-456?
I was out of office last week, sorry for the delay. Yes, this is approved. But can you check if they've delivered the final mobile mockups? I don't want to pay until we have them.
    `,
    stakeholders: ['Vendor (Design Services)', 'AP Clerk', 'Marketing Director'],
  },
  {
    department: 'HR',
    name: 'New Hire Onboarding Inefficiency',
    workflow: `
**Email from HR to IT:**
From: hr@example.com
To: it-support@example.com
Subject: New Hire Laptop Request - Jane Doe

Hi IT, we have a new hire, Jane Doe, starting next Monday. She is a Senior Software Engineer. Please provision her with a new Macbook Pro.

**Email from HR to Hiring Manager:**
From: hr@example.com
To: eng-manager@example.com
Subject: Your New Hire Starts Monday!
Hi, as a reminder, Jane Doe starts on Monday. Please make sure you have a first-day plan for her, add her to the team's recurring meetings, and assign her a buddy.

**New Hire's Day 1 Experience (as told to a friend):**
"My first day was a mess. My laptop wasn't ready until 3 PM, so I couldn't do anything. I got like 15 separate emails with links to set up accounts for HR, payroll, benefits, the wiki, our code repository... it was overwhelming. My manager was triple-booked so I just read documentation all day. I'm still not sure I have access to everything I need."
    `,
    stakeholders: ['Jane Doe (New Hire)', 'HR Specialist', 'IT Support Tech', 'Hiring Manager'],
  },
];

const App: React.FC = () => {
  const [workflowInput, setWorkflowInput] = useState<string>('');
  const [stakeholders, setStakeholders] = useState<string[]>([]);
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const handleSelectExample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedExample(selectedName);

    if (!selectedName) {
      setWorkflowInput('');
      setStakeholders([]);
      return;
    }

    const example = examples.find(ex => ex.name === selectedName);
    if (example) {
      setWorkflowInput(example.workflow.trim());
      setStakeholders(example.stakeholders);
    }
  };

  const handleAddStakeholder = (name: string) => {
    if (name && !stakeholders.includes(name)) {
      setStakeholders([...stakeholders, name]);
    }
  };

  const handleRemoveStakeholder = (index: number) => {
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };
  
  const handleAnalyze = useCallback(async () => {
    if (!workflowInput.trim()) {
      setError('Please enter a workflow description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult('');
    setSources([]);

    const fullPromptInput = `
---
INVOLVED STAKEHOLDERS:
---
${stakeholders.join('\n')}

---
MESSY WORKFLOW DESCRIPTION:
---
${workflowInput}
    `;

    try {
      const result: AnalysisResult = await analyzeWorkflow(fullPromptInput);
      setAnalysisResult(result.text);
      setSources(result.sources);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate analysis. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [workflowInput, stakeholders]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BrainCircuit className="w-10 h-10 text-cyan-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 tracking-tight">
              Active Campaign workflow analyzer demo
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Transform messy process notes into actionable AI transformation plans for Active Campaign. Describe your workflow and add the stakeholders involved to get started.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-800/50 rounded-lg shadow-lg p-6 border border-slate-700">
              <label htmlFor="workflow-input" className="block text-sm font-medium text-slate-300 mb-2">
                Workflow Description
              </label>
              <textarea
                id="workflow-input"
                value={workflowInput}
                onChange={(e) => setWorkflowInput(e.target.value)}
                placeholder="Paste your process description, emails, transcripts, or SOPs here..."
                className="w-full h-96 p-3 bg-slate-900 border border-slate-600 rounded-md resize-y focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 text-slate-300 placeholder-slate-500"
                disabled={isLoading}
              />
            </div>
            
            <div className="lg:col-span-1">
                <StakeholderPanel 
                    stakeholders={stakeholders}
                    onAddStakeholder={handleAddStakeholder}
                    onRemoveStakeholder={handleRemoveStakeholder}
                />
            </div>
          </div>
          
           <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                <select
                  value={selectedExample}
                  onChange={handleSelectExample}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">Select an Example by Department</option>
                  {Object.entries(
                    examples.reduce((acc, ex) => {
                      if (!acc[ex.department]) {
                        acc[ex.department] = [];
                      }
                      acc[ex.department].push(ex);
                      return acc;
                    }, {} as Record<string, WorkflowExample[]>)
                  ).map(([department, exs]) => (
                    <optgroup label={department} key={department}>
                      {exs.map(e => (
                        <option key={e.name} value={e.name}>{e.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !workflowInput.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader />
                    Analyzing...
                  </>
                ) : (
                  'Generate Analysis'
                )}
              </button>
            </div>


          <div className="mt-8">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {(analysisResult || sources.length > 0) && !isLoading && <AnalysisDisplay content={analysisResult} sources={sources} />}
          </div>
        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all transform hover:scale-110"
            aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
        >
            {isChatOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        </button>
      </div>

      {isChatOpen && <Chatbot />}
    </div>
  );
};

export default App;