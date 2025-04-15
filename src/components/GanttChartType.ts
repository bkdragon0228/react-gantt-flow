import { ReactNode } from "react";

export interface GanttChartData {
    id: string | number;
    startDate: string | Date;
    endDate: string | Date;
    title: string;
    color?: string;
    children?: GanttChartData[];
}

export type GanttChartViewMode = "month" | "week" | "day" | "hour";

export type CellAlignment = "left" | "center" | "right";

export type BeFlat<T> = T & {
    parentId?: string | number;
    level: number;
    rowIndex: number;
};

export interface GanttColumnRenderProps<T> {
    value: any;
    row: BeFlat<T>;
    rowIndex: number;
    column: GanttColumn<T>;
    api: {
        toggleTask: (taskId: string | number) => void;
        isExpanded: () => boolean;
    };
}

export interface GanttColumn<T> {
    field: keyof T | string;
    headerName: string;
    width?: number;
    minWidth?: number;
    flex?: number;
    align?: CellAlignment;
    headerAlign?: CellAlignment;

    renderCell?: (props: GanttColumnRenderProps<T>) => ReactNode;
    renderHeader?: (column: GanttColumn<T>) => ReactNode;
    valueGetter?: (row: T) => any;
    /**
     * default: "string"
     */
    type?: "date" | "datetime" | "string" | "number" | "boolean";
    /**
     * default: false
     */
    editable?: boolean;
}

export type GanttChartLocale = "en" | "ko" | "ja" | "zh" | "es";

export interface GanttChartLocaleResources {
    search: {
        placeholder: string;
        field: string;
    };
    viewMode: {
        month: string;
        week: string;
        day: string;
        hour: string;
    };
    year: string;
    timeline: {
        month: string;
        week: string;
        day: string;
        hour: string;
        year: string;
        today: string;
        format: {
            month: string;
            week: string;
            day: string;
            hour: string;
        };
        subFormat: {
            month: string;
            week: string;
            day: string;
            hour: string;
        };
    };
}

export interface GanttChartProps<T extends GanttChartData>
    extends GanttChartHandler<T>,
        GanntChartDataProps<T>,
        GanttChartColumnProps<T> {
    viewMode?: GanttChartViewMode;
    rowHeight?: number;
    taskBarHeight?: number;
    defaultGridSectionWidth?: number;
    defaultExpanded?: boolean;
    locale?: GanttChartLocale;
}

export interface GanttChartHandler<T extends GanttChartData> {
    onDataUpdate?: (newData: T, oldData: T) => void;

    onTaskClick?: (taskId: string | number, task: BeFlat<T>) => void;
    onTaskDoubleClick?: (taskId: string | number, task: BeFlat<T>) => void;

    onTaskRowClick?: (taskId: string | number, task: BeFlat<T>) => void;
    onTaskRowDoubleClick?: (taskId: string | number, task: BeFlat<T>) => void;

    onGroupClick?: (groupId: string | number, group: RowType<T>) => void;
    onGroupDoubleClick?: (groupId: string | number, group: RowType<T>) => void;
}

export interface GanntChartDataProps<T extends GanttChartData> {
    data: T[];
    isLoading?: boolean;
    isError?: boolean;
}

export interface GanttChartColumnProps<T extends GanttChartData> {
    columns: GanttColumn<T>[];
    groupingColumn?: {
        field: keyof T;
        headerGetter?: (value: any, { row }: { row: RowType<T> }) => string;
        height?: number;
    };
}

export type RowType<T> =
    | {
          type: "task";
          id: string | number;
          data: T;
          height: number;
          groupId?: string | number;
      }
    | {
          type: "group";
          id: string | number;
          groupValue?: any;
          height: number;
      };
