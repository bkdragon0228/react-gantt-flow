# React Gantt Chart Flow

A powerful and customizable Gantt Chart component built with React, TypeScript, and Tailwind CSS.

![React Gantt Chart Flow Demo](https://github.com/user-attachments/assets/0a56c9c7-6867-401a-b5e0-6e5bfda404a5)


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
            projectId: "1-project",
            title: "Task 1",
            startDate: new Date("2025-04-01T00:00:00"),
            endDate: new Date("2025-04-05T23:59:59"),
            status: "진행중",
            children: [
                {
                    id: 11,
                    projectId: "1-project",
                    title: "Sub Task 1",
                    startDate: new Date("2025-04-06T00:00:00"),
                    endDate: new Date("2025-04-07T23:59:59"),
                    status: "진행중",
                },
            ],
        },
    ];

    const columns = [
        {
            field: "title",
            headerName: "Task Name",
            flex: 1,
        },
        {
            field: "status",
            headerName: "Status",
            width: 200,
            align: "center",
        },
        {
            field: "startDate",
            headerName: "Start Date",
            width: 300,
            align: "center",
            editable: true,
            type: "datetime",
            valueGetter: (row) => row.startDate.toISOString(),
        },
        {
            field: "endDate",
            headerName: "End Date",
            width: 300,
            align: "center",
            valueGetter: (row) => row.endDate.toISOString(),
            editable: true,
        },
    ];

    return (
        <GanttChart
            data={data}
            columns={columns}
            viewMode="day"
            defaultGridSectionWidth={597}
            defaultExpanded
            onTaskClick={(taskId, task) => console.log("Task clicked:", taskId, task)}
            onTaskDoubleClick={(taskId, task) => console.log("Task double clicked:", taskId, task)}
            onDataUpdate={(newData, oldData) => console.log("Data updated:", newData, oldData)}
        />
    );
};
```

## Advanced Usage

### Grouping Tasks

```tsx
<GanttChart
    {...props}
    groupingColumn={{
        field: "projectId",
    }}
/>
```

### Localization

```tsx
<GanttChart
    {...props}
    locale="ko" // Supports "en", "ko", "ja", "zh", "es"
/>
```

### Custom Row Height

```tsx
<GanttChart {...props} rowHeight={100} taskBarHeight={80} />
```

### Loading State

```tsx
<GanttChart {...props} isLoading={true} />
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
