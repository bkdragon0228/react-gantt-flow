import type { Meta, StoryObj } from "@storybook/react";
import { GanttChart } from "../components/GanttChart";
import { BsFillCaretDownFill, BsFillCaretRightFill } from "react-icons/bs";
import { GanttChartContainer } from "./container/GanttChartContainer";

const meta: Meta<typeof GanttChart> = {
    title: "GanttChart",
    component: GanttChart,
    tags: ["autodocs", "beta"],
    parameters: {
        layout: "fullscreen",
        controls: {
            exclude: [
                "data",
                "columns",
                "onDataUpdate",
                "groupingColumn",
                "locale",
                "viewMode",
                "defaultExpanded",
                "defaultGridSectionWidth",
                "onTaskClick",
                "onTaskDoubleClick",
                "onTaskRowClick",
                "onTaskRowDoubleClick",
                "onGroupClick",
                "onGroupDoubleClick",
            ],
        },
    },
    argTypes: {
        // viewMode: {
        //     control: "select",
        //     options: ["day", "week", "month", "hour"],
        //     defaultValue: "day",
        // },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        viewMode: "day",
        columns: [
            {
                field: "title",
                headerName: "title",
                headerAlign: "center" as const,
                flex: 1,
                renderCell: ({ row, api }) => {
                    const isExpanded = api.isExpanded();
                    const hasChildren = row.children && row.children.length > 0;
                    const isChild = !!row?.parentId;
                    const isCompleted = row.status === "완료";
                    return (
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            style={{
                                color: isCompleted ? "lightgray" : "#000",
                                textDecoration: isCompleted ? "line-through" : "none",
                            }}
                        >
                            {hasChildren && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        api.toggleTask(row.id);
                                    }}
                                    className="flex items-center justify-center w-4 h-4 mr-1 border border-gray-400 rounded-md"
                                >
                                    {isExpanded ? (
                                        <BsFillCaretDownFill className="w-2 h-2 text-gray-600" />
                                    ) : (
                                        <BsFillCaretRightFill className="w-2 h-2 text-gray-600" />
                                    )}
                                </button>
                            )}
                            {isChild && !hasChildren && (
                                <svg
                                    width="20"
                                    height="32"
                                    viewBox="0 0 20 32"
                                    fill="none"
                                    style={{
                                        marginRight: "4px",
                                    }}
                                    className="pointer-events-none"
                                >
                                    <path d="M0 0V16H20" stroke="gray" strokeWidth="1" />
                                </svg>
                            )}
                            {row.title + " " + (row.children?.length ? `(${row.children?.length})` : "")}
                        </div>
                    );
                },
            },
            {
                field: "statusName",
                headerName: "status",
                width: 200,
                align: "center" as const,
            },
            {
                field: "startDate",
                headerName: "startDate",
                width: 300,
                align: "center" as const,
                editable: true,
                type: "datetime",
                // flex: 1,
                valueGetter: (row) => row.startDate.toISOString(),
            },
            {
                field: "endDate",
                headerName: "endDate",
                width: 300,
                align: "center" as const,
                // flex: 1,
                valueGetter: (row) => row.endDate.toISOString(),
                editable: true,
            },
        ],
        defaultExpanded: true,
        defaultGridSectionWidth: 597,
        data: [
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
                    {
                        id: 12,
                        projectId: "1-project",
                        title: "Sub Task 2",
                        startDate: new Date("2025-04-08T00:00:00"),
                        endDate: new Date("2025-04-09T23:59:59"),
                        status: "진행중",
                    },
                ],
            },
            {
                id: 2,
                projectId: "2-project2",
                title: "Task 2",
                startDate: new Date("2025-04-06T00:00:00"),
                endDate: new Date("2025-04-10T23:59:59"),
                status: "진행중",
            },
            {
                id: 3,
                projectId: "3-project3",
                title: "Task 3",
                startDate: new Date("2025-04-11T00:00:00"),
                endDate: new Date("2025-04-15T23:59:59"),
                status: "진행중",
            },
        ],
        onTaskClick: (taskId, task) => {
            // console.log("taskId", taskId);
            // console.log("task", task);
        },
        onTaskDoubleClick: (taskId, task) => {
            // console.log("taskId", taskId);
        },
        onTaskRowClick: (taskId, task) => {
            // console.log("taskId", taskId);
            // console.log("task", task);
        },
        onTaskRowDoubleClick: (taskId, task) => {
            // console.log("taskId", taskId);
        },
        onGroupClick: (groupId, group) => {
            // console.log("groupId", groupId);
            // console.log("group", group);
        },
        onGroupDoubleClick: (groupId, group) => {
            // console.log("groupId", groupId);
        },
        onDataUpdate: (newData, oldData) => {
            // alert("데이터를 변경하시겠습니까?");
            console.log("newData", newData);
            console.log("oldData", oldData);
        },
    },
    render: (args) => {
        const { data, columns, ...rest } = args;
        return (
            <div className="w-screen h-screen">
                <GanttChartContainer {...rest} data={data} columns={columns} />
            </div>
        );
    },
};

export const Grouping: Story = {
    args: {
        ...Default.args,
        groupingColumn: {
            field: "projectId",
        },
    },
    render: (args) => {
        const { data, columns, ...rest } = args;
        return (
            <div className="w-screen h-screen">
                <GanttChartContainer {...rest} data={data} columns={columns} />
            </div>
        );
    },
};

export const Korean: Story = {
    args: {
        ...Default.args,
        locale: "ko",
    },
    render: (args) => {
        const { data, columns, ...rest } = args;
        return (
            <div className="w-screen h-screen">
                <GanttChartContainer {...rest} data={data} columns={columns} />
            </div>
        );
    },
};

export const Japanese: Story = {
    args: {
        ...Default.args,
        locale: "ja",
    },
    render: (args) => {
        const { data, columns, ...rest } = args;
        return (
            <div className="w-screen h-screen">
                <GanttChartContainer {...rest} data={data} columns={columns} />
            </div>
        );
    },
};

export const Loading: Story = {
    args: {
        ...Default.args,
        isLoading: true,
    },
    render: (args) => {
        const { data, columns, ...rest } = args;
        return (
            <div className="w-screen h-screen">
                <GanttChartContainer {...rest} data={data} columns={columns} />
            </div>
        );
    },
};
