# React Gantt Chart Component

A powerful and customizable Gantt Chart component built with React, TypeScript, and Tailwind CSS.

## Features

-   **Multiple View Modes**: Supports month, week, day, and hour views
-   **Interactive Timeline**: Drag and resize tasks directly on the timeline
-   **Task Hierarchy**: Support for parent-child task relationships
-   **Search Functionality**: Search tasks across different fields
-   **Localization**: Built-in support for multiple languages (English, Korean, Japanese, Chinese, Spanish)
-   **Responsive Design**: Adapts to different screen sizes
-   **Customizable Columns**: Flexible column configuration with custom rendering
-   **Task Grouping**: Group tasks by specific fields
-   **Year Navigation**: Easy navigation between different years

## Planned Features

-   **Group Toggle**: Expand/collapse functionality for grouped tasks
-   **Column Editing**: Inline editing capabilities for task columns

## Installation

```bash
npm install react-gantt-flow
# or
yarn add react-gantt-flow
```

## Basic Usage

```tsx
import { GanttChart } from "react-gantt-flow";

const MyGanttChart = () => {
    const data = [
        {
            id: 1,
            title: "Task 1",
            startDate: "2024-01-01",
            endDate: "2024-01-05",
            children: [
                {
                    id: 2,
                    title: "Subtask 1",
                    startDate: "2024-01-01",
                    endDate: "2024-01-03",
                },
            ],
        },
    ];

    const columns = [
        { field: "title", headerName: "Task Name", width: 200 },
        { field: "startDate", headerName: "Start Date", width: 150 },
        { field: "endDate", headerName: "End Date", width: 150 },
    ];

    return <GanttChart data={data} columns={columns} viewMode="day" defaultGridSectionWidth={500} />;
};
```

## Props

| Prop                    | Type                                   | Description                                 |
| ----------------------- | -------------------------------------- | ------------------------------------------- |
| data                    | `GanttChartData[]`                     | Array of tasks with their properties        |
| columns                 | `GanttColumn[]`                        | Configuration for the grid columns          |
| viewMode                | `"month" \| "week" \| "day" \| "hour"` | Default view mode                           |
| defaultGridSectionWidth | `number`                               | Initial width of the grid section           |
| defaultExpanded         | `boolean`                              | Whether tasks should be expanded by default |
| locale                  | `"en" \| "ko" \| "ja" \| "zh" \| "es"` | Language for the component                  |

## License

MIT
