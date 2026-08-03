import type { Meta, StoryObj } from '@storybook/react';
import { K12StandardsInterface } from './K12StandardsInterface';
import { K12StandardsList } from './K12StandardsList';
import { K12ClassList } from './K12ClassList';
import { K12StudentGrid } from './K12StudentGrid';
import { K12CohortFilter } from './K12CohortFilter';
import { mockK12Data } from './K12StandardsInterface.mockData';

// ============================================================
// K12 STANDARDS INTERFACE (Main Component)
// ============================================================

const metaInterface: Meta<typeof K12StandardsInterface> = {
  title: 'K12/Standards Interface',
  component: K12StandardsInterface,
  tags: ['autodocs'],
};

export default metaInterface;

export const DefaultView: StoryObj<typeof K12StandardsInterface> = {
  args: {
    data: mockK12Data,
  },
  render: (args) => <K12StandardsInterface {...args} />,
};

export const WithOrgId: StoryObj<typeof K12StandardsInterface> = {
  args: {
    orgId: 'org-match-charter',
    data: mockK12Data,
  },
};

// ============================================================
// K12 STANDARDS LIST
// ============================================================

const metaStandardsList: Meta<typeof K12StandardsList> = {
  title: 'K12/Standards List',
  component: K12StandardsList,
  tags: ['autodocs'],
};

export const StandardsListStory = () => (
  <K12StandardsList standards={mockK12Data.standards} />
);

StandardsListStory.meta = metaStandardsList;
StandardsListStory.storyName = 'All Standards';

export const StandardsListFiltered = () => (
  <K12StandardsList
    standards={mockK12Data.standards}
    selectedDomain="us_history"
    onDomainChange={(domain) => console.log(`Filter by: ${domain}`)}
  />
);

StandardsListFiltered.meta = metaStandardsList;
StandardsListFiltered.storyName = 'Filtered by Domain';

export const StandardsListEmpty = () => (
  <K12StandardsList
    standards={[]}
    onDomainChange={(domain) => console.log(`Filter by: ${domain}`)}
  />
);

StandardsListEmpty.meta = metaStandardsList;
StandardsListEmpty.storyName = 'Empty State';

// ============================================================
// K12 CLASS LIST
// ============================================================

const metaClassList: Meta<typeof K12ClassList> = {
  title: 'K12/Class List',
  component: K12ClassList,
  tags: ['autodocs'],
};

export const ClassListStory = () => (
  <K12ClassList classes={mockK12Data.classes} />
);

ClassListStory.meta = metaClassList;
ClassListStory.storyName = 'Default View';

export const ClassListSortedByMastery = () => {
  const [sortBy, setSortBy] = React.useState<'name' | 'students' | 'mastery'>(
    'mastery'
  );

  return (
    <div>
      <K12ClassList
        classes={mockK12Data.classes.sort(
          (a, b) => b.avgMasteryLevel - a.avgMasteryLevel
        )}
      />
      <p style={{ marginTop: '1rem', fontSize: '12px', color: '#999' }}>
        Pre-sorted by average mastery level
      </p>
    </div>
  );
};

ClassListSortedByMastery.meta = metaClassList;
ClassListSortedByMastery.storyName = 'Sorted by Mastery';

export const ClassListEmpty = () => <K12ClassList classes={[]} />;

ClassListEmpty.meta = metaClassList;
ClassListEmpty.storyName = 'Empty State';

// ============================================================
// K12 STUDENT GRID
// ============================================================

const metaStudentGrid: Meta<typeof K12StudentGrid> = {
  title: 'K12/Student Grid',
  component: K12StudentGrid,
  tags: ['autodocs'],
};

const standardIds = mockK12Data.standards.slice(0, 5).map((s) => s.id);
const standardNames = Object.fromEntries(
  mockK12Data.standards.map((s) => [s.id, s.name])
);

export const StudentGridStory = () => (
  <K12StudentGrid
    students={mockK12Data.studentProgress}
    standardIds={standardIds}
    standardNames={standardNames}
    className="AP US History Period 3"
  />
);

StudentGridStory.meta = metaStudentGrid;
StudentGridStory.storyName = 'Default View';

export const StudentGridAllStandards = () => (
  <K12StudentGrid
    students={mockK12Data.studentProgress}
    standardIds={mockK12Data.standards.map((s) => s.id)}
    standardNames={standardNames}
    className="AP US History Period 3"
  />
);

StudentGridAllStandards.meta = metaStudentGrid;
StudentGridAllStandards.storyName = 'All Standards (Scrollable)';

export const StudentGridEmpty = () => (
  <K12StudentGrid
    students={[]}
    standardIds={standardIds}
    standardNames={standardNames}
  />
);

StudentGridEmpty.meta = metaStudentGrid;
StudentGridEmpty.storyName = 'Empty State';

// ============================================================
// K12 COHORT FILTER
// ============================================================

const metaCohortFilter: Meta<typeof K12CohortFilter> = {
  title: 'K12/Cohort Filter',
  component: K12CohortFilter,
  tags: ['autodocs'],
};

export const CohortFilterStory = () => (
  <K12CohortFilter
    cohorts={mockK12Data.cohorts}
    students={mockK12Data.studentProgress}
    standardIds={standardIds}
    standardNames={standardNames}
  />
);

CohortFilterStory.meta = metaCohortFilter;
CohortFilterStory.storyName = 'Default View';

export const CohortFilterAllStandards = () => (
  <K12CohortFilter
    cohorts={mockK12Data.cohorts}
    students={mockK12Data.studentProgress}
    standardIds={mockK12Data.standards.map((s) => s.id)}
    standardNames={standardNames}
  />
);

CohortFilterAllStandards.meta = metaCohortFilter;
CohortFilterAllStandards.storyName = 'All Standards';

export const CohortFilterEmpty = () => (
  <K12CohortFilter
    cohorts={[]}
    students={[]}
    standardIds={standardIds}
    standardNames={standardNames}
  />
);

CohortFilterEmpty.meta = metaCohortFilter;
CohortFilterEmpty.storyName = 'Empty State';

// ============================================================
// HELPER IMPORTS
// ============================================================

import React from 'react';
