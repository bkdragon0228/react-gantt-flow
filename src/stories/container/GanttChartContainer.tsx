import React, { FC, useState } from "react";

import { GanttChartData, GanttChartProps } from "../../components/GanttChartType";
import { GanttChart } from "../../components/GanttChart";

interface GanttChartContainerProps extends GanttChartProps<GanttChartData> {}

/**
 * @author
 * @function GanttChartContainer
 **/

export const GanttChartContainer: FC<GanttChartContainerProps> = (props) => {
    const [data, setData] = useState(props.data);

    return (
        <div className="w-full h-full">
            <GanttChart {...props} data={data} />
        </div>
    );
};
