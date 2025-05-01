import { useCallback, useMemo, useState, useRef, useEffect, Fragment, use } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";

import { ko, ja, es, zhCN } from "date-fns/locale";

import {
    format,
    addDays,
    eachDayOfInterval,
    startOfDay,
    startOfMonth,
    endOfMonth,
    addMonths,
    getYear,
    eachWeekOfInterval,
    eachMonthOfInterval,
    startOfWeek,
    endOfWeek,
    differenceInMonths,
    addHours,
    format as dateFormat,
    getHours,
    startOfHour,
    endOfHour,
    eachHourOfInterval,
    endOfDay,
    differenceInDays,
    addMinutes,
} from "date-fns";

import {
    GanttChartData,
    GanttChartViewMode,
    BeFlat,
    GanttColumn,
    GanttChartProps,
    RowType,
    GanttChartLocaleResources,
    GanttChartLocale,
} from "./GanttChartType";
import { BsFillCaretDownFill } from "react-icons/bs";

const localeResources: Record<GanttChartLocale, GanttChartLocaleResources> = {
    en: {
        search: {
            placeholder: "Enter search term",
            field: "Search field",
        },
        viewMode: {
            month: "Month",
            week: "Week",
            day: "Day",
            hour: "Hour",
        },
        year: "Year",
        timeline: {
            month: "Month",
            week: "Week",
            day: "Day",
            hour: "Hour",
            year: "Year",
            today: "Today",
            format: {
                month: "yyyy",
                week: "w 'week'",
                day: "M/d",
                hour: "M/d",
            },
            subFormat: {
                month: "M 'month'",
                week: "M/d",
                day: "EEE",
                hour: "HH:mm",
            },
        },
    },
    ko: {
        search: {
            placeholder: "검색어를 입력하세요",
            field: "검색 필드",
        },
        viewMode: {
            month: "월",
            week: "주",
            day: "일",
            hour: "시간",
        },
        year: "년",
        timeline: {
            month: "월",
            week: "주",
            day: "일",
            hour: "시간",
            year: "년",
            today: "오늘",
            format: {
                month: "yyyy",
                week: "w '주'",
                day: "M/d",
                hour: "M/d",
            },
            subFormat: {
                month: "M '월'",
                week: "M/d",
                day: "EEE",
                hour: "HH:mm",
            },
        },
    },
    ja: {
        search: {
            placeholder: "検索語を入力してください",
            field: "検索フィールド",
        },
        viewMode: {
            month: "月",
            week: "週",
            day: "日",
            hour: "時間",
        },
        year: "年",
        timeline: {
            month: "月",
            week: "週",
            day: "日",
            hour: "時間",
            year: "年",
            today: "今日",
            format: {
                month: "yyyy",
                week: "w '週'",
                day: "M/d",
                hour: "M/d",
            },
            subFormat: {
                month: "M '月'",
                week: "M/d",
                day: "EEE",
                hour: "HH:mm",
            },
        },
    },
    zh: {
        search: {
            placeholder: "请输入搜索词",
            field: "搜索字段",
        },
        viewMode: {
            month: "月",
            week: "周",
            day: "日",
            hour: "小时",
        },
        year: "年",
        timeline: {
            month: "月",
            week: "周",
            day: "日",
            hour: "小时",
            year: "年",
            today: "今天",
            format: {
                month: "yyyy",
                week: "w '週'",
                day: "M/d",
                hour: "M/d",
            },
            subFormat: {
                month: "M '月'",
                week: "M/d",
                day: "EEE",
                hour: "HH:mm",
            },
        },
    },
    es: {
        search: {
            placeholder: "Ingrese término de búsqueda",
            field: "Campo de búsqueda",
        },
        viewMode: {
            month: "Mes",
            week: "Semana",
            day: "Día",
            hour: "Hora",
        },
        year: "Año",
        timeline: {
            month: "Mes",
            week: "Semana",
            day: "Día",
            hour: "Hora",
            year: "Año",
            today: "Hoy",
            format: {
                month: "yyyy",
                week: "w 'semana'",
                day: "M/d",
                hour: "HH:mm",
            },
            subFormat: {
                month: "M 'mes'",
                week: "M/d",
                day: "EEE",
                hour: "HH:mm",
            },
        },
    },
};

/**
 * @author
 * @function GanttChart
 **/

export const GanttChart = <T extends GanttChartData>({
    // DataProps
    data: defaultData,
    isLoading,
    isError,

    // ColumnProps
    columns,
    groupingColumn,

    // HandlerProps
    onDataUpdate,
    onTaskClick,
    onTaskDoubleClick,
    onTaskRowClick,
    onTaskRowDoubleClick,
    onGroupClick,
    onGroupDoubleClick,

    // DefaultProps
    viewMode: defaultViewMode,
    defaultGridSectionWidth = 500,
    defaultExpanded = false,
    locale = "en",
    rowHeight = 50,
    taskBarHeight = 30,
}: GanttChartProps<T>) => {
    const [data, setData] = useState<T[]>(defaultData);

    useEffect(() => {
        setData(defaultData);
    }, [defaultData]);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [viewMode, setViewMode] = useState<GanttChartViewMode>(defaultViewMode || "day");
    const [searchText, setSearchText] = useState("");
    const [searchField, setSearchField] = useState<string>(columns[0]?.field.toString() || "");
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
    const [expandedTasks, setExpandedTasks] = useState<Set<string | number>>(() => {
        if (defaultExpanded) {
            const allTaskIds = new Set<string | number>();
            const collectTaskIds = (tasks: GanttChartData[]) => {
                tasks.forEach((task) => {
                    allTaskIds.add(task.id);
                    if (task.children?.length) {
                        collectTaskIds(task.children);
                    }
                });
            };
            collectTaskIds(data);
            return allTaskIds;
        }
        return new Set();
    });

    const [reducedGroups, setReducedGroups] = useState<Set<string | number>>(() => {
        return new Set();
    });

    const [gridWidth, setGridWidth] = useState(defaultGridSectionWidth);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStartX = useRef<number>(0);
    const resizeStartWidth = useRef<number>(0);

    const [isInitialized, setIsInitialized] = useState(false);

    const initialExpanded = useCallback(() => {
        if (defaultExpanded) {
            const allTaskIds = new Set<string | number>();
            const collectTaskIds = (tasks: GanttChartData[]) => {
                tasks.forEach((task) => {
                    allTaskIds.add(task.id);
                    if (task.children?.length) {
                        collectTaskIds(task.children);
                    }
                });
            };
            collectTaskIds(data);
            setExpandedTasks(allTaskIds);
        } else {
            setExpandedTasks(new Set());
        }
    }, [defaultExpanded, data]);

    const initalProps = useCallback(() => {
        setViewMode(defaultViewMode || "day");
        setSearchText("");
        setSearchField(columns[0]?.field.toString() || "");
        setGridWidth(defaultGridSectionWidth);
        setSelectedYear(new Date().getFullYear());
    }, [defaultViewMode, columns, defaultGridSectionWidth]);

    useEffect(() => {
        if (!isLoading && data.length > 0 && !isInitialized) {
            initialExpanded();
            initalProps();
            setIsInitialized(true);
        }
    }, [isLoading, data, isInitialized, initialExpanded, initalProps]);

    // 버퍼 크기 설정 (보이는 영역의 앞뒤로 추가할 셀 수)
    const BUFFER_SIZE = 5;

    const { dayWidth, format, subFormat, dates } = useMemo(() => {
        const yearStart = new Date(selectedYear, 0, 1);
        const yearEnd = new Date(selectedYear, 11, 31);
        switch (viewMode) {
            case "hour":
                const hours = eachHourOfInterval({ start: startOfDay(yearStart), end: endOfDay(yearEnd) });
                return {
                    dayWidth: 80,
                    format: localeResources[locale].timeline.format.hour,
                    subFormat: localeResources[locale].timeline.subFormat.hour,
                    dates: hours,
                };
            case "day":
                const days = eachDayOfInterval({ start: yearStart, end: yearEnd });
                return {
                    dayWidth: 40,
                    format: localeResources[locale].timeline.format.day,
                    subFormat: localeResources[locale].timeline.subFormat.day,
                    dates: days,
                };
            case "week":
                const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd });
                return {
                    dayWidth: 100,
                    format: localeResources[locale].timeline.format.week,
                    subFormat: localeResources[locale].timeline.subFormat.week,
                    dates: weeks,
                };
            case "month":
                const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
                return {
                    dayWidth: 120,
                    format: localeResources[locale].timeline.format.month,
                    subFormat: localeResources[locale].timeline.subFormat.month,
                    dates: months,
                };
            default:
                return {
                    dayWidth: 40,
                    format: localeResources[locale].timeline.format.day,
                    subFormat: localeResources[locale].timeline.subFormat.day,
                    dates: [],
                };
        }
    }, [viewMode, selectedYear, locale]);

    const ganttTotalWidth = useMemo(() => {
        return dates.length * dayWidth;
    }, [dates, dayWidth]);

    const getDateIndex = useCallback(
        (date: Date): number => {
            switch (viewMode) {
                case "hour":
                    return dates.findIndex((d) => startOfHour(d).getTime() === startOfHour(date).getTime());
                case "day":
                    return dates.findIndex((d) => startOfDay(d).getTime() === startOfDay(date).getTime());
                case "week":
                    return dates.findIndex(
                        (d) => startOfWeek(d).getTime() <= date.getTime() && endOfWeek(d).getTime() >= date.getTime()
                    );
                case "month":
                    return dates.findIndex(
                        (d) => startOfMonth(d).getTime() <= date.getTime() && endOfMonth(d).getTime() >= date.getTime()
                    );
            }
        },
        [viewMode, dates]
    );

    const getDuration = useCallback((startDate: Date, endDate: Date) => {
        const durationInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
        return durationInMinutes / 60;
    }, []);

    const handleScrollGanttContainer = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;

        // 현재 보이는 영역의 시작/끝 인덱스 계산
        const startIndex = Math.max(0, Math.floor(scrollLeft / dayWidth) - BUFFER_SIZE);
        const endIndex = Math.min(dates.length - 1, Math.ceil((scrollLeft + containerWidth) / dayWidth) + BUFFER_SIZE);

        setVisibleRange({ start: startIndex, end: endIndex });
    }, [dayWidth, dates.length]);

    const flattenTasks = useCallback(
        (tasks: T[], parentId?: string | number, level = 0, startIndex = 0): BeFlat<T>[] => {
            return tasks.reduce((acc, task, index) => {
                const flatTask: BeFlat<T> = {
                    ...task,
                    parentId,
                    level,
                    rowIndex: startIndex + index,
                };

                const children = task.children
                    ? flattenTasks(task.children as unknown as T[], task.id, level + 1, startIndex + index + 1)
                    : [];

                return [...acc, flatTask, ...children];
            }, [] as BeFlat<T>[]);
        },
        []
    );

    const toggleTask = useCallback((taskId: string | number) => {
        setExpandedTasks((prev) => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return next;
        });
    }, []);

    const toggleGroup = useCallback((groupId: string | number) => {
        setReducedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    }, []);

    const filteredTasks = useCallback(
        (tasks: BeFlat<T>[], searchText: string, searchField: string, columns: GanttColumn<T>[]) => {
            if (!searchText) return tasks;
            const searchLower = searchText.toLowerCase();
            const filtereds = tasks.filter((task) => {
                const value =
                    columns.find((col) => col.field === searchField)?.valueGetter?.(task as unknown as T) ??
                    task[searchField];
                const match = String(value).toLowerCase().includes(searchLower);
                return match;
            });
            return filtereds;
        },
        []
    );

    const filteredTasksByYear = useCallback((tasks: BeFlat<T>[], year: number) => {
        return tasks.filter((task) => {
            const startYear = new Date(task.startDate).getFullYear();
            const endYear = new Date(task.endDate).getFullYear();
            return startYear === year || endYear === year || (startYear < year && endYear > year);
        });
    }, []);

    const visibleTasks = useMemo(() => {
        const flattened = flattenTasks(data);
        const filteredFirst = filteredTasks(flattened, searchText, searchField, columns);
        const filtered = filteredTasksByYear(filteredFirst, selectedYear);

        const isAllParentsExpanded = (task: BeFlat<T>): boolean => {
            if (!task.parentId) return true;
            if (!expandedTasks.has(task.parentId)) return false;
            const parentTask = flattened.find((t) => t.id === task.parentId);
            if (!parentTask) return true;
            return isAllParentsExpanded(parentTask);
        };

        return filtered.filter((task) => {
            return isAllParentsExpanded(task);
        });
    }, [filteredTasks, expandedTasks, flattenTasks, data, searchText, searchField, columns, selectedYear]);

    // const [initialScrollDone, setInitialScrollDone] = useState(false);

    useEffect(() => {
        if (!containerRef.current || isLoading) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const today = new Date();
        const todayIndex = getDateIndex(today);

        const visibleDatesCount = Math.ceil(containerWidth / dayWidth); // 화면에 보여지는 날짜수

        // 중앙을 기준으로 시작/끝 인덱스 계산
        const startIndex = Math.max(0, todayIndex - Math.floor(visibleDatesCount / 2));
        const endIndex = Math.min(dates.length - 1, startIndex + visibleDatesCount - 1);

        setVisibleRange({ start: startIndex, end: endIndex });

        // 스크롤 위치를 오늘 날짜가 중앙에 오도록 설정
        const scrollLeft = (todayIndex - Math.floor(visibleDatesCount / 2)) * dayWidth;
        container.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: "smooth",
        });
    }, [dayWidth, dates.length, getDateIndex, isLoading]);

    const handleResizeStart = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setIsResizing(true);
            resizeStartX.current = e.clientX;
            resizeStartWidth.current = gridWidth;
        },
        [gridWidth]
    );

    const handleResizeMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing) return;
            const delta = e.clientX - resizeStartX.current;
            const newWidth = Math.max(200, resizeStartWidth.current + delta); // 최소 너비 200px
            setGridWidth(newWidth);
        },
        [isResizing]
    );

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleResizeMove);
            window.addEventListener("mouseup", handleResizeEnd);
            return () => {
                window.removeEventListener("mousemove", handleResizeMove);
                window.removeEventListener("mouseup", handleResizeEnd);
            };
        }
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    // 그룹화된 행 데이터 생성
    const rows: RowType<BeFlat<T>>[] = useMemo(() => {
        if (!groupingColumn) {
            return visibleTasks.map((task) => ({
                type: "task" as const,
                id: task.id,
                height: rowHeight,
                data: task as unknown as BeFlat<T>,
            }));
        }

        // groupingColumn의 field로 정렬
        const sortedTasks = [...visibleTasks].sort((a, b) => {
            const aValue = a[groupingColumn.field as keyof BeFlat<T>];
            const bValue = b[groupingColumn.field as keyof BeFlat<T>];
            return String(aValue).localeCompare(String(bValue));
        });

        const result: RowType<BeFlat<T>>[] = [];
        let currentGroup: any = null;

        sortedTasks.forEach((task) => {
            const groupValue = task[groupingColumn.field as keyof BeFlat<T>];

            if (groupValue !== currentGroup) {
                result.push({
                    type: "group",
                    id: `group-${groupValue}`,
                    height: rowHeight,
                    groupValue,
                });
                currentGroup = groupValue;
            }

            result.push({
                type: "task",
                id: task.id,
                height: rowHeight,
                groupId: `group-${groupValue}`,
                data: task as unknown as BeFlat<T>,
            });
        });

        return result.filter((row) => {
            if (row.type === "task" && row.groupId) {
                return !reducedGroups.has(row.groupId);
            }
            return true;
        });
    }, [visibleTasks, groupingColumn, rowHeight, reducedGroups]);

    // console.log(rows, "rows");

    const handleScroll = useCallback(
        (event: React.UIEvent<HTMLDivElement>) => {
            const target = event.currentTarget;
            const scrollTop = target.scrollTop;

            // 스크롤 이벤트가 발생한 div가 어느 쪽인지 확인하고 다른 쪽의 스크롤을 동기화
            if (target === containerRef.current && gridRef.current) {
                gridRef.current.scrollTop = scrollTop;
            } else if (target === gridRef.current && containerRef.current) {
                containerRef.current.scrollTop = scrollTop;
            }

            // 기존의 가로 스크롤 핸들링
            if (target === containerRef.current) {
                handleScrollGanttContainer();
            }
        },
        [handleScrollGanttContainer]
    );

    const isTaskInVisibleRange = useCallback(
        (row: BeFlat<T>) => {
            const { startDate, endDate } = row;
            const startIndex = getDateIndex(new Date(startDate));
            const endIndex = getDateIndex(new Date(endDate));
            if (startIndex >= visibleRange.start && endIndex <= visibleRange.end) {
                return true;
            }
            return false;
        },
        [getDateIndex, visibleRange]
    );

    type TaskVisibilityStatus = "before" | "after" | "visible";

    const getTaskVisibilityStatus = useCallback(
        (row: BeFlat<T>): TaskVisibilityStatus => {
            const { startDate, endDate } = row;
            const startIndex = getDateIndex(new Date(startDate));
            const endIndex = getDateIndex(new Date(endDate));

            if (endIndex < visibleRange.start) {
                return "before"; // Task가 현재 보이는 범위보다 이전에 있음
            }
            if (startIndex > visibleRange.end) {
                return "after"; // Task가 현재 보이는 범위보다 이후에 있음
            }
            return "visible"; // Task가 현재 보이는 범위 안에 있음
        },
        [getDateIndex, visibleRange]
    );
    const moveToDate = useCallback(
        (date: string | Date) => {
            if (!containerRef.current) return;
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const dateIndex = getDateIndex(new Date(date));

            const visibleDatesCount = Math.ceil(containerWidth / dayWidth); // 화면에 보여지는 날짜수
            const startIndex = Math.max(0, dateIndex - Math.floor(visibleDatesCount / 2));
            const endIndex = Math.min(dates.length - 1, startIndex + visibleDatesCount - 1);

            setVisibleRange({ start: startIndex, end: endIndex });
            const scrollLeft = (dateIndex - Math.floor(visibleDatesCount / 2)) * dayWidth;
            container.scrollTo({
                left: Math.max(0, scrollLeft),
                behavior: "smooth",
            });
        },
        [getDateIndex, visibleRange, dayWidth]
    );

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex items-center justify-end gap-4 p-4 border-b">
                {/* Search Section */}
                <div className="flex items-center gap-2 mr-auto">
                    <Menu as="div" className="relative">
                        <Menu.Button className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                            {columns.find((col) => col.field.toString() === searchField)?.headerName || ""}
                            <HiChevronDown className="w-4 h-4" />
                        </Menu.Button>
                        <Menu.Items className="absolute left-0 z-[1000] w-40 mt-2 bg-white rounded-md shadow-lg ring-1 ring-gray-300 ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                {columns.map((column) => (
                                    <Menu.Item key={column.field.toString()}>
                                        {({ active }) => (
                                            <button
                                                onClick={() => setSearchField(column.field.toString())}
                                                className={`${
                                                    active ? "bg-gray-100" : ""
                                                } block w-full px-4 py-2 text-left text-sm ${
                                                    searchField === column.field
                                                        ? "text-blue-600 font-medium"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {column.headerName}
                                            </button>
                                        )}
                                    </Menu.Item>
                                ))}
                            </div>
                        </Menu.Items>
                    </Menu>
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder={localeResources[locale].search.placeholder}
                        className="px-3 py-1 text-sm border rounded focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Menu as="div" className="relative">
                        <Menu.Button className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                            {localeResources[locale].viewMode[viewMode]}
                            <HiChevronDown className="w-4 h-4" />
                        </Menu.Button>
                        <Menu.Items className="absolute left-0 z-[1000] w-32 mt-2 bg-white rounded-md shadow-lg ring-1 ring-gray-300 ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => setViewMode("month")}
                                            className={`${
                                                active ? "bg-gray-100" : ""
                                            } block w-full px-4 py-2 text-left text-sm ${
                                                viewMode === "month" ? "text-blue-600 font-medium" : "text-gray-700"
                                            }`}
                                        >
                                            {localeResources[locale].viewMode.month}
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => setViewMode("week")}
                                            className={`${
                                                active ? "bg-gray-100" : ""
                                            } block w-full px-4 py-2 text-left text-sm ${
                                                viewMode === "week" ? "text-blue-600 font-medium" : "text-gray-700"
                                            }`}
                                        >
                                            {localeResources[locale].viewMode.week}
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => setViewMode("day")}
                                            className={`${
                                                active ? "bg-gray-100" : ""
                                            } block w-full px-4 py-2 text-left text-sm ${
                                                viewMode === "day" ? "text-blue-600 font-medium" : "text-gray-700"
                                            }`}
                                        >
                                            {localeResources[locale].viewMode.day}
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => setViewMode("hour")}
                                            className={`${
                                                active ? "bg-gray-100" : ""
                                            } block w-full px-4 py-2 text-left text-sm ${
                                                viewMode === "hour" ? "text-blue-600 font-medium" : "text-gray-700"
                                            }`}
                                        >
                                            {localeResources[locale].viewMode.hour}
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Menu>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedYear((prev) => prev - 1)}
                        className="p-2 rounded hover:bg-gray-200"
                    >
                        ←
                    </button>
                    <span className="text-lg font-semibold">
                        {selectedYear}
                        {localeResources[locale].year}
                    </span>
                    <button
                        onClick={() => setSelectedYear((prev) => prev + 1)}
                        className="p-2 rounded hover:bg-gray-200"
                    >
                        →
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center flex-1 overflow-hidden overflow-y-auto basis-0">
                    <div className="relative inline-flex">
                        {/* 외부 원 */}
                        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin" />
                        {/* 내부 색상 원 */}
                        <div
                            className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin"
                            style={{
                                borderRightColor: "transparent",
                                borderBottomColor: "transparent",
                                animationDuration: "0.6s",
                            }}
                        />
                    </div>
                </div>
            )}
            {isError && (
                <div className="flex items-center justify-center flex-1 overflow-hidden overflow-y-auto basis-0">
                    Error...
                </div>
            )}
            {!isLoading && !isError && (
                <div className="flex flex-1 overflow-hidden overflow-y-auto basis-0">
                    <div
                        className="relative flex flex-col border-r border-gray-200"
                        style={{ width: `${gridWidth}px` }}
                    >
                        <div className="flex border-b border-gray-200">
                            {columns.map((column, index) => {
                                const width = column.width || 100;
                                const align = column.headerAlign || column.align || "left";

                                return (
                                    <div
                                        key={column.field.toString()}
                                        className="p-2 text-sm font-medium text-gray-700"
                                        style={{
                                            width: column.flex ? `${column.flex * 100}%` : `${width}px`,
                                            height: 40,
                                            minWidth: column.minWidth,
                                            textAlign: align,
                                        }}
                                    >
                                        {column.renderHeader ? column.renderHeader(column) : column.headerName}
                                    </div>
                                );
                            })}
                        </div>

                        <div ref={gridRef} className="flex-1 overflow-y-auto scrollbar-hide" onScroll={handleScroll}>
                            {rows.map((row) => {
                                if (row.type === "group") {
                                    const isReduced = reducedGroups.has(row.id);
                                    return (
                                        <div
                                            key={row.id}
                                            className="flex items-center px-4 font-medium bg-gray-100"
                                            style={{ height: row.height }} // 고정 높이
                                            onClick={() => onGroupClick?.(row.id, row)}
                                            onDoubleClick={() => onGroupDoubleClick?.(row.id, row)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleGroup(row.id);
                                                    }}
                                                >
                                                    {isReduced ? "▶" : "▼"}
                                                </button>
                                                {groupingColumn!.headerGetter?.(row.groupValue, { row: row }) ||
                                                    row.groupValue}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={row.id}
                                        className="flex items-center"
                                        style={{ height: row.height }} // 고정 높이
                                        onClick={() => onTaskRowClick?.(row.id, row.data)}
                                        onDoubleClick={() => onTaskRowDoubleClick?.(row.id, row.data)}
                                    >
                                        {columns.map((column) => {
                                            return (
                                                <RowTaskCell
                                                    key={column.field.toString()}
                                                    row={row}
                                                    rowIndex={rows.indexOf(row)}
                                                    column={column as GanttColumn<T>}
                                                    onUpdate={(taskId, newValue) => {
                                                        console.log(taskId, newValue);
                                                    }}
                                                    api={{
                                                        toggleTask: () => toggleTask(row.data!.id),
                                                        isExpanded: () => expandedTasks.has(row.data!.id),
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Resize handle */}
                        <div
                            className="absolute top-0 right-0 w-1 h-full transition-colors cursor-col-resize hover:bg-blue-400"
                            onMouseDown={handleResizeStart}
                            style={{
                                backgroundColor: isResizing ? "rgb(96 165 250)" : "transparent",
                            }}
                        />
                    </div>

                    <div
                        ref={containerRef}
                        className="relative flex-1 overflow-auto scrollbar-hide"
                        onScroll={handleScroll}
                    >
                        <div className="sticky top-0 z-10 bg-white">
                            <svg width={ganttTotalWidth} height={40}>
                                {/* Timeline Header Background */}
                                <rect width={ganttTotalWidth} height={40} fill="white" />
                                <g className="timeline-header">
                                    {dates.slice(visibleRange.start, visibleRange.end + 1).map((date, index) => {
                                        const globalIndex = visibleRange.start + index;
                                        const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime();

                                        const localeMap = {
                                            en: undefined,
                                            ko: ko,
                                            ja: ja,
                                            es: es,
                                            zh: zhCN,
                                        };

                                        return (
                                            <g key={date.toString()}>
                                                {isToday && (
                                                    <rect
                                                        x={globalIndex * dayWidth}
                                                        y={0}
                                                        width={dayWidth}
                                                        height={40}
                                                        fill="#E3F2FD"
                                                        rx={4}
                                                    />
                                                )}
                                                <line
                                                    x1={globalIndex * dayWidth}
                                                    y1={0}
                                                    x2={globalIndex * dayWidth}
                                                    y2={40}
                                                    stroke="#e5e7eb"
                                                    strokeWidth={1}
                                                />

                                                {isToday && (
                                                    <line
                                                        x1={globalIndex * dayWidth + dayWidth / 2}
                                                        y1={40}
                                                        x2={globalIndex * dayWidth + dayWidth / 2}
                                                        y2={rows.length * rowHeight}
                                                        stroke="#E3F2FD"
                                                        strokeWidth={2}
                                                    />
                                                )}

                                                <foreignObject
                                                    x={globalIndex * dayWidth}
                                                    y={0}
                                                    width={dayWidth}
                                                    height={40}
                                                >
                                                    <div className="flex flex-col items-center justify-center w-full h-full">
                                                        <text
                                                            x={globalIndex * dayWidth + 5}
                                                            y={20}
                                                            className={`text-xs ${
                                                                isToday ? "font-bold text-blue-600" : ""
                                                            }`}
                                                        >
                                                            {dateFormat(date, format, { locale: localeMap[locale] })}
                                                        </text>
                                                        <text
                                                            x={globalIndex * dayWidth + 5}
                                                            y={35}
                                                            className={`text-xs ${
                                                                isToday ? "font-bold text-blue-600" : ""
                                                            }`}
                                                        >
                                                            {dateFormat(date, subFormat, { locale: localeMap[locale] })}
                                                        </text>
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        );
                                    })}
                                </g>
                            </svg>
                        </div>
                        <svg width={ganttTotalWidth} height={rows.length * rowHeight}>
                            {/* 차트 영역 */}
                            <g>
                                {/* 수평 그리드 라인 */}
                                {Array.from({ length: rows.length + 1 }).map((_, index) => (
                                    <line
                                        key={index}
                                        x1={visibleRange.start * dayWidth}
                                        y1={index * rowHeight}
                                        x2={(visibleRange.end + 1) * dayWidth}
                                        y2={index * rowHeight}
                                        stroke="#e5e7eb"
                                        strokeWidth={1}
                                    />
                                ))}

                                {dates.slice(visibleRange.start, visibleRange.end + 1).map((date, index) => {
                                    const globalIndex = visibleRange.start + index;
                                    return (
                                        <line
                                            key={globalIndex}
                                            x1={globalIndex * dayWidth}
                                            y1={0}
                                            x2={globalIndex * dayWidth}
                                            y2="100%"
                                            stroke="#e5e7eb"
                                            strokeWidth={1}
                                        />
                                    );
                                })}

                                {/* 작업 바 */}
                                {(() => {
                                    let currentY = 0;
                                    return rows.map((row, index) => {
                                        const element =
                                            row.type === "group" ? (
                                                <g
                                                    key={row.id}
                                                    onClick={() => onGroupClick?.(row.id, row)}
                                                    onDoubleClick={() => onGroupDoubleClick?.(row.id, row)}
                                                >
                                                    <rect
                                                        x={visibleRange.start * dayWidth}
                                                        y={currentY}
                                                        width={(visibleRange.end - visibleRange.start + 1) * dayWidth}
                                                        height={row.height}
                                                        fill="#f3f4f6"
                                                    />
                                                </g>
                                            ) : (
                                                <g key={row.id}>
                                                    {[getTaskVisibilityStatus(row.data!)].map((status) => {
                                                        if (status === "visible") {
                                                            return null;
                                                        }

                                                        const height = 30;
                                                        const x =
                                                            status === "after"
                                                                ? (visibleRange.start + (BUFFER_SIZE + 1)) * dayWidth
                                                                : (visibleRange.end - (BUFFER_SIZE + 2)) * dayWidth;

                                                        const buttonText = status === "after" ? "▶" : "◀";

                                                        return (
                                                            <foreignObject
                                                                x={x}
                                                                y={currentY + (row.height - height) / 2}
                                                                width={height}
                                                                height={height}
                                                            >
                                                                <button
                                                                    className="flex items-center justify-center w-full h-full bg-gray-100 rounded-full cursor-pointer"
                                                                    onClick={() => moveToDate(row.data!.startDate)}
                                                                >
                                                                    {buttonText}
                                                                </button>
                                                            </foreignObject>
                                                        );
                                                    })}

                                                    <TaskBar
                                                        key={row.id}
                                                        task={row.data!}
                                                        index={index}
                                                        dayWidth={dayWidth}
                                                        getDateIndex={getDateIndex}
                                                        isExpanded={expandedTasks.has(row.data!.id)}
                                                        onToggle={() => toggleTask(row.data!.id)}
                                                        viewMode={viewMode}
                                                        onTaskUpdate={(taskId, newStartDate, newEndDate) => {
                                                            const updateTaskInTree = (tasks: T[]): T[] => {
                                                                return tasks.map((task) => {
                                                                    if (task.id === taskId) {
                                                                        const newData = {
                                                                            ...task,
                                                                            startDate: newStartDate,
                                                                            endDate: newEndDate,
                                                                        };
                                                                        return newData;
                                                                    }
                                                                    if (task.children) {
                                                                        return {
                                                                            ...task,
                                                                            children: updateTaskInTree(
                                                                                task.children as T[]
                                                                            ),
                                                                        };
                                                                    }
                                                                    return task;
                                                                });
                                                            };
                                                            setData((prev) => updateTaskInTree(prev));
                                                        }}
                                                        onTaskClick={onTaskClick}
                                                        onTaskDoubleClick={onTaskDoubleClick}
                                                        onDataUpdate={onDataUpdate}
                                                        y={currentY + (row.height - taskBarHeight) / 2}
                                                        height={taskBarHeight}
                                                    />
                                                </g>
                                            );
                                        currentY += row.height;
                                        return element;
                                    });
                                })()}

                                {dates.slice(visibleRange.start, visibleRange.end + 1).map((date, index) => {
                                    const globalIndex = visibleRange.start + index;
                                    const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime();
                                    return (
                                        <>
                                            {isToday && viewMode === "day" && (
                                                <line
                                                    x1={globalIndex * dayWidth + dayWidth / 2}
                                                    y1={0}
                                                    x2={globalIndex * dayWidth + dayWidth / 2}
                                                    y2={rows.length * rowHeight}
                                                    stroke="#0095ff"
                                                    strokeWidth={2}
                                                    z={10000}
                                                />
                                            )}
                                        </>
                                    );
                                })}
                            </g>
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

interface TaskBarProps<T> {
    task: BeFlat<T>;
    index: number;
    dayWidth: number;
    getDateIndex: (date: Date) => number;
    isExpanded: boolean;
    onToggle: () => void;
    viewMode: GanttChartViewMode;
    onTaskUpdate?: (taskId: string | number, newStartDate: Date, newEndDate: Date) => void;
    onTaskClick?: (taskId: string | number, task: BeFlat<T>) => void;
    onTaskDoubleClick?: (taskId: string | number, task: BeFlat<T>) => void;
    onDataUpdate?: (newData: T, oldData: T) => void;
    y: number;
    height?: number;
}

const TaskBar = <T extends GanttChartData>({
    task,
    dayWidth,
    getDateIndex,
    isExpanded,
    onToggle,
    viewMode,
    onTaskUpdate,
    onTaskClick,
    onTaskDoubleClick,
    onDataUpdate,
    y,
    height = 30,
}: TaskBarProps<T>) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<"start" | "end" | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [originalStartDate, setOriginalStartDate] = useState<Date | null>(null);
    const [originalEndDate, setOriginalEndDate] = useState<Date | null>(null);

    const [originalTask, setOriginalTask] = useState<T | null>(null);

    const getTimeRatio = useCallback(
        (date: Date): number => {
            switch (viewMode) {
                case "month":
                    return date.getDate() / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                case "week":
                    return date.getDay() / 7 + date.getHours() / (24 * 7);
                case "day":
                    return date.getHours() / 24 + date.getMinutes() / (24 * 60);
                case "hour":
                    return date.getMinutes() / 60;
                default:
                    return 0;
            }
        },
        [viewMode]
    );

    const getTimeFromRatio = useCallback(
        (ratio: number, baseDate: Date): Date => {
            const newDate = new Date(baseDate);
            switch (viewMode) {
                case "month":
                    const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
                    newDate.setDate(Math.floor(ratio * daysInMonth) + 1);
                    newDate.setHours(baseDate.getHours(), baseDate.getMinutes());
                    break;
                case "week":
                    const days = Math.floor(ratio * 7);
                    const hours = Math.floor((ratio * 7 - days) * 24);
                    newDate.setDate(baseDate.getDate() - baseDate.getDay() + days);
                    newDate.setHours(hours, baseDate.getMinutes());
                    break;
                case "day":
                    const dayHours = Math.floor(ratio * 24);
                    const minutes = Math.floor((ratio * 24 - dayHours) * 60);
                    newDate.setHours(dayHours, minutes);
                    break;
                case "hour":
                    newDate.setMinutes(Math.floor(ratio * 60));
                    break;
            }
            return newDate;
        },
        [viewMode]
    );

    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);

    const startIndex = getDateIndex(startDate);
    const endIndex = getDateIndex(endDate);

    const startRatio = getTimeRatio(startDate);
    const endRatio = getTimeRatio(endDate);

    const x = startIndex * dayWidth + startRatio * dayWidth;
    const width = (endIndex - startIndex) * dayWidth + (endRatio - startRatio) * dayWidth;

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setIsDragging(true);
            setDragStartX(e.clientX);
            setOriginalStartDate(startDate);
            setOriginalEndDate(endDate);

            setOriginalTask(task);
        },
        [startDate, endDate, task]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !originalStartDate || !originalEndDate) return;

            const deltaX = e.clientX - dragStartX;
            const deltaRatio = deltaX / dayWidth;

            const duration = endDate.getTime() - startDate.getTime();
            const newStartDate = getTimeFromRatio(getTimeRatio(originalStartDate) + deltaRatio, originalStartDate);
            const newEndDate = new Date(newStartDate.getTime() + duration);

            if (onTaskUpdate) {
                onTaskUpdate(task.id, newStartDate, newEndDate);
            }
        },
        [
            isDragging,
            dragStartX,
            originalStartDate,
            originalEndDate,
            dayWidth,
            viewMode,
            task.id,
            onTaskUpdate,
            getTimeRatio,
            getTimeFromRatio,
            startDate,
            endDate,
        ]
    );

    const handleMouseUp = useCallback(() => {
        if (originalTask && isDragging) {
            onDataUpdate?.(task, originalTask);
        }
        setIsDragging(false);
        setDragStartX(0);
        setOriginalStartDate(null);
        setOriginalEndDate(null);

        setOriginalTask(null);
    }, [originalTask, isDragging, onDataUpdate, task]);

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, type: "start" | "end") => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(type);
            setDragStartX(e.clientX);
            setOriginalStartDate(startDate);
            setOriginalEndDate(endDate);

            setOriginalTask(task);
        },
        [startDate, endDate, task]
    );

    const handleResizeMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !originalStartDate || !originalEndDate) return;

            const deltaX = e.clientX - dragStartX;
            const deltaRatio = deltaX / dayWidth;

            if (isResizing === "start") {
                const newStartDate = getTimeFromRatio(getTimeRatio(originalStartDate) + deltaRatio, originalStartDate);

                // 시작일이 종료일보다 늦어지지 않도록
                if (newStartDate < endDate) {
                    onTaskUpdate?.(task.id, newStartDate, endDate);
                }
            } else {
                const newEndDate = getTimeFromRatio(getTimeRatio(originalEndDate) + deltaRatio, originalEndDate);

                // 종료일이 시작일보다 빨라지지 않도록
                if (newEndDate > startDate) {
                    onTaskUpdate?.(task.id, startDate, newEndDate);
                }
            }
        },
        [
            isResizing,
            dragStartX,
            originalStartDate,
            originalEndDate,
            dayWidth,
            task.id,
            onTaskUpdate,
            getTimeRatio,
            getTimeFromRatio,
            startDate,
            endDate,
        ]
    );

    const handleResizeEnd = useCallback(() => {
        if (originalTask && isResizing) {
            onDataUpdate?.(task, originalTask);
        }

        setIsResizing(null);
        setDragStartX(0);
        setOriginalStartDate(null);
        setOriginalEndDate(null);

        setOriginalTask(null);
    }, [originalTask, isResizing, onDataUpdate, task]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleResizeMove);
            window.addEventListener("mouseup", handleResizeEnd);
            return () => {
                window.removeEventListener("mousemove", handleResizeMove);
                window.removeEventListener("mouseup", handleResizeEnd);
            };
        }
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    return (
        <g
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onTaskClick?.(task.id, task)}
            onDoubleClick={() => onTaskDoubleClick?.(task.id, task)}
            className={`transition-transform duration-150 ${isHovered ? "scale-y-110" : ""}`}
            style={{ transformOrigin: `${x}px ${y + height / 2}px` }}
        >
            {isHovered && (
                <rect x={x - 4} y={y - 2} width={width + 8} height={height + 4} fill="rgba(79, 70, 229, 0.1)" rx={6} />
            )}

            {/* 메인 작업 바 */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={task.color || "#4F46E5"}
                rx={4}
                className={`transition-opacity cursor-move hover:opacity-80 ${
                    isDragging || isResizing ? "opacity-90" : ""
                }`}
                onMouseDown={!isResizing ? handleMouseDown : undefined}
            />

            {/* 리사이즈 핸들 */}
            {isHovered && (
                <>
                    {/* 왼쪽 리사이즈 핸들 */}
                    <g className="cursor-col-resize" onMouseDown={(e) => handleResizeStart(e, "start")}>
                        <rect
                            x={x - 3}
                            y={y + 2}
                            width={6}
                            height={height - 4}
                            fill="white"
                            rx={2}
                            className="drop-shadow-md"
                        />
                        <rect x={x - 1} y={y + 6} width={2} height={height - 12} fill={task.color || "#4F46E5"} />
                    </g>

                    {/* 오른쪽 리사이즈 핸들 */}
                    <g className="cursor-col-resize" onMouseDown={(e) => handleResizeStart(e, "end")}>
                        <rect
                            x={x + width - 3}
                            y={y + 2}
                            width={6}
                            height={height - 4}
                            fill="white"
                            rx={2}
                            className="drop-shadow-md"
                        />
                        <rect
                            x={x + width - 1}
                            y={y + 6}
                            width={2}
                            height={height - 12}
                            fill={task.color || "#4F46E5"}
                        />
                    </g>
                </>
            )}

            {/* 확장/축소 버튼 */}
            {task.children && task.children.length > 0 && (
                <text
                    x={x + width - 20}
                    y={y + height / 2}
                    className="text-xs cursor-pointer select-none fill-white"
                    dominantBaseline="middle"
                    onClick={onToggle}
                >
                    {isExpanded ? "▼" : "▶"}
                </text>
            )}
        </g>
    );
};

interface RowTaskCellProps<T extends GanttChartData> {
    row: RowType<T>;
    rowIndex: number;
    column: GanttColumn<T>;
    onUpdate: (taskId: string | number, newValue: any) => void;
    api: {
        toggleTask: (taskId: string | number) => void;
        isExpanded: () => boolean;
    };
}

const RowTaskCell = <T extends GanttChartData>({ row, rowIndex, column, onUpdate, api }: RowTaskCellProps<T>) => {
    if (row.type === "group") {
        return null;
    }

    const width = column.width || 100;
    const align = column.align || "left";

    const originalValue = row.data![column.field as keyof typeof row.data];

    const value = column.valueGetter
        ? column.valueGetter(row.data as unknown as T)
        : row.data![column.field as keyof typeof row.data];

    const valueType = column.type || "string";
    const isEditable = column.editable || false;
    const [editedValue, setEditedValue] = useState(originalValue);

    useEffect(() => {
        setEditedValue(originalValue);
    }, [originalValue]);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(row.data!.id, editedValue);
        }
    };

    return (
        <div
            className="h-full p-2 text-sm text-gray-900"
            style={{
                width: column.flex ? `${column.flex * 100}%` : `${width}px`,
                minWidth: column.minWidth,
                display: "flex",
                alignItems: "center",
                justifyContent: align,
            }}
        >
            {column.renderCell ? (
                column.renderCell({
                    value,
                    row: row.data as unknown as BeFlat<T>,
                    rowIndex: rowIndex,
                    column,
                    api,
                })
            ) : (
                <>{value?.toString()}</>
            )}
        </div>
    );
};
