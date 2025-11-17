# Test Plan Documentation Template

## Test Plan Structure

Every feature requires a comprehensive test plan that includes the following sections:

### 1. Feature Overview
- **Feature Name**: [Name of the feature being tested]
- **Description**: [Brief description of what the feature does]
- **Blackboard Feature Category**: [e.g., Gradebook, Discussion Forums, etc.]
- **Priority**: [Critical/High/Medium/Low]

### 2. Test Scope
- **In Scope**: [What will be tested]
- **Out of Scope**: [What will not be tested]
- **Prerequisites**: [Requirements before testing can begin]

### 3. Test Scenarios (Given/When/Then)

This section forms the foundation for both test execution and risk analysis. Each scenario should follow the Given/When/Then format:

#### Example Scenario:
- **Given**: An instructor has entered a grade into the gradebook cell
- **When**: They hit enter or click away from the cell
- **Then**: The grade is saved to the database and displayed correctly

#### Template for Additional Scenarios:
- **Given**: [Initial condition or context]
- **When**: [Action or trigger]
- **Then**: [Expected outcome]

### 4. Test Cases
Detailed test cases derived from the Given/When/Then scenarios above.

### 5. Risk Analysis Integration

Each Given/When/Then scenario from this test plan will be imported into the Risk Analysis section where:

1. Each G/W/T scenario becomes a "Workflow" in the risk analysis
2. Workflows are grouped by User Story ID for traceability
3. QA team assigns Impact scores (1-4, where 1 = Critical impact)
4. QA team assigns Likelihood scores (1-4, where 1 = Most likely to fail)
5. Risk Factor is calculated (Impact × Likelihood)
6. Testing tier is determined based on risk factor
7. Required deliverables are specified

### Risk Analysis Table Format:

The Risk Analysis view displays workflows grouped by:
- **Level 1**: User Story ID (for ADO traceability)
- **Level 2**: Each G/W/T scenario becomes a separate workflow

| G/W/T Workflow | **I** Impact (1-4) | **L** Likelihood (1-4) | **Risk Factor (I x L)** | **Mandatory Testing Tier** | **Deliverables Commitment** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Given an instructor has entered a grade, When they hit enter, Then the grade is saved to the database** | 1 (Critical) | 2 (High Prob) | **2** | **Tier 1: CRITICAL** | Unit Test, UIA, ET Notes |
| **1. [G/W/T Workflow]** | [Manual Score] | [Manual Score] | [Manual Calculation] | [Tier 1 / 2 / 3] | [List required deliverables] |
| **2. ...** | ... | ... | ... | ... | ... |

### Testing Tiers:
- **Tier 1 (Risk Factor 1-4)**: Critical - Requires comprehensive testing including Unit Tests, UI Automation, and Exploratory Testing
- **Tier 2 (Risk Factor 5-8)**: High - Requires UI Automation and Exploratory Testing  
- **Tier 3 (Risk Factor 9-16)**: Medium/Low - Manual testing sufficient

### 6. Test Environment Requirements
- [List of environment needs]

### 7. Test Data Requirements
- [Test data that needs to be prepared]

### 8. Success Criteria
- [Criteria for considering testing complete and successful]

---

## Integration with QA Commander System

This test plan template integrates with the QA Commander system as follows:

1. **Test Plans Section**: Use this template to create structured test plans with G/W/T scenarios
2. **Risk Analysis Section**: Import G/W/T scenarios directly as workflows (each scenario becomes one workflow)
   - Workflows are grouped by User Story ID for traceability to ADO
   - Each G/W/T workflow is the atomic unit for risk assessment
3. **Test Case Management (TCM)**: Tier 1 and Tier 2 workflows automatically flow into TCM for execution
   - TCM test cases preserve the G/W/T format from the original scenario
   - Test cases include user story linkage for full traceability

### Flow Summary:
**Test Plan → Risk Analysis → TCM**
- Test Plan creates G/W/T scenarios with User Story IDs
- G/W/T scenarios transfer to Risk Analysis as workflows
- Risk Analysis groups workflows by User Story, then displays G/W/T details
- Tier 1/2 workflows transfer to TCM with full G/W/T context