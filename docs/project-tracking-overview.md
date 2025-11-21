## **Project Tracking & Monitoring Business Process**

### **Phase 1: Project Creation (Initial Setup)**

The administrator creates a new project through a multi-tab form interface with the following components:

#### **1. Basic Information Tab**

Establishes the project foundation:

- **Project Identity**: Title, description, category (Infrastructure, Agriculture, Education, Health, etc.)
- **Location Linkage**: Links the project to a specific **Sitio** (community), establishing beneficiary context
- **Timeline**: Start date, end date, and project year
- **Budget & Impact**: Total budget and estimated number of beneficiaries
- **Status**: Initial status (planning, in-progress, completed, suspended)
- **Partners**: Implementing partner organizations (if applicable)

**Relevance**: This data defines _what_ the project is, _where_ it operates, _who_ it benefits, and provides the scope for all future tracking.

#### **2. Baseline Tab**

Captures the **original approved plan** for variance analysis:

- **Original Planned Start/End Dates**: The baseline timeline
- **Original Duration**: Planned number of days
- **Original Budget**: The approved budget at project initiation

**Relevance**: Critical for accountability—the baseline serves as the immutable reference point to measure delays (schedule variance) and cost overruns (budget variance). This enables the CATCH-UP mechanism to identify slippage.

#### **3. Accountability Tab**

Establishes **who is responsible**:

- **Key Personnel**: Project Manager, PM Agency, Technical Lead, Contractor
- **Oversight Committee**: Multiple members who monitor the project
- **Escalation Contacts**: Technical and administrative contacts for issue resolution

**Relevance**: Ensures clear ownership and enables rapid escalation when delays occur. This is essential for the CATCH-UP mechanism's accountability framework.

#### **4. Milestones Tab**

Breaks the project into trackable **phases and deliverables**:

- Each milestone has: name, description, dates, status, completion %, owner, approver, budget allocation
- Milestones can be in states: not_started, in_progress, completed, delayed
- Linked to delays when targets are missed

**Relevance**: Provides granular checkpoints for progress monitoring. When a milestone is delayed, it triggers the CATCH-UP delay reporting and recovery action process.

#### **5. Monitoring Tab**

The **most frequently updated** section for ongoing tracking:

**Financial Monitoring:**

- Allocated budget + supplemental budget = total budget
- Released amount (actual funds released)
- Obligations and contract cost

**Physical Progress:**

- Plan percentage vs. Actual percentage = **Slippage** (the variance indicator)
- This slippage metric is central to the CATCH-UP mechanism

**Employment Impact:**

- Male and female employment generated (tracks socio-economic impact)

**Contract Details:**

- Duration, delivery dates, extensions

**Status Summary:**

- Current stage description
- Issues encountered
- Recommendations for action
- **Catch-Up Plan**: Active mitigation strategies

**Relevance**: This is the operational heartbeat of the system—administrators regularly update these fields to reflect real-time project status. The slippage calculation automatically flags projects falling behind schedule.

---

### **Phase 2: Ongoing Tracking & Updates**

#### **Quick Update Mode**

For rapid status updates, administrators can use a streamlined form that focuses on:

- Project status change
- Physical progress percentage
- Status stage, issues, recommendations
- Catch-up plan updates
- Employment figures

**Relevance**: Reduces administrative burden for routine updates while maintaining visibility into critical metrics.

#### **Full Edit Mode**

Provides access to all project fields for comprehensive revisions when needed.

---

### **Phase 3: Delay Management (CATCH-UP Mechanism)**

When milestones are delayed or slippage is detected:

#### **Delay Reporting**

Administrators create a `Delay` record with:

- **Root Cause Analysis**: Weather, material shortage, permit issues, utility coordination, etc.
- **Contributing Factors**: Multiple factors that led to the delay
- **Accountability**: Responsible party and whether the delay was preventable
- **Impact Assessment**:
  - Schedule impact (days)
  - Cost impact (PHP)
  - Whether it affects the critical path
  - Impact on beneficiaries
- **Severity Rating**: Low, medium, high, critical

**Relevance**: Provides structured analysis to understand _why_ delays happen and _who_ is responsible, enabling evidence-based decision-making.

#### **Recovery Actions (Catch-Up Plans)**

For each delay, administrators define:

- **Action Items**: Specific steps to recover from the delay
- **Ownership**: Person responsible and supporting parties
- **Timeline**: Planned start, target completion, actual completion
- **Progress Tracking**: Status and progress percentage
- **Expected vs. Actual Recovery**: How many days will be recovered vs. actual recovery
- **Effectiveness Rating**: Post-action evaluation
- **Cost Tracking**: Estimated vs. actual costs of recovery

**Relevance**: Transforms delay identification into actionable remediation. The effectiveness tracking creates institutional learning—future projects can learn from past recovery strategies.

---

### **Phase 4: Transparency & Public Access**

While administrators manage the detailed tracking, the public can view:

- Project locations on an interactive map
- Project status and progress
- Delays and recovery actions (fostering accountability)
- Analytics dashboards showing program-wide performance

**Relevance**: Creates public pressure for project completion and demonstrates government transparency.

---

## **Data Flow Summary**

```
1. PROJECT CREATION
   └─ Basic Info + Baseline + Accountability → Establishes scope & reference point

2. MILESTONE PLANNING
   └─ Break project into phases with target dates → Creates checkpoints

3. ONGOING MONITORING (Regular Updates)
   └─ Update physical progress, finances, employment → Track actual vs. plan
   └─ Calculate slippage = Plan % - Actual % → Identify variance

4. DELAY DETECTION
   └─ Slippage > threshold OR milestone missed → Trigger CATCH-UP

5. DELAY ANALYSIS
   └─ Create Delay record → Root cause + Impact + Responsible party

6. RECOVERY PLANNING
   └─ Create Recovery Actions → Define catch-up plan with targets

7. RECOVERY EXECUTION & TRACKING
   └─ Update recovery action progress → Monitor effectiveness

8. PROJECT COMPLETION
   └─ Mark milestones complete → Update final status → Archive lessons learned
```

---

## **Key Metrics for Admin Tracking**

1. **Schedule Variance**: Current date vs. baseline end date
2. **Physical Slippage**: Planned progress % - Actual progress %
3. **Budget Variance**: Original budget vs. total expenditures
4. **Milestone Health**: % of milestones on track vs. delayed
5. **Recovery Effectiveness**: % of delays successfully mitigated
6. **Beneficiary Impact**: Households/population affected by delays

---

This system provides **end-to-end visibility** from project inception through completion, with built-in accountability mechanisms that ensure delays are not just identified but actively addressed through structured recovery plans.
