import { constColorClasses, constColors, svgCar, svgPinDriver, svgRunningCar, svgStop } from "./constants"
import { SideBarService } from '../../js/sidebar-service';
let sideBarService = new SideBarService();
/*************************************************** BASIC FUNCTIONS [START] ***************************************************/

function calc(a, b) {
    return Math.hypot(a.lat() - b.lat(), a.lng() - b.lng());
}

function findMarkerById(id) {
    return markers.filter((item) => item.id == id)[0];
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
/*************************************************** BASIC FUNCTIONS [END] ***************************************************/


(function () {
    d3.timeline = function () {
        var DISPLAY_TYPES = ["circle", "rect"];

        var hover = function () {},
            mouseover = function () {},
            mouseout = function () {},
            click = function () {},
            scroll = function () {},
            labelFunction = function (label) {
                return label;
            },
            navigateLeft = function () {},
            navigateRight = function () {},
            orient = "bottom",
            width = null,
            height = null,
            rowSeparatorsColor = null,
            backgroundColor = null,
            tickFormat = {
                format: d3.time.format("%I %p"),
                tickTime: d3.time.hours,
                tickInterval: 1,
                tickSize: 6,
                tickValues: null,
            },
            colorCycle = d3.scale.category20(),
            colorPropertyName = null,
            display = "rect",
            beginning = 0,
            labelMargin = 0,
            ending = 0,
            margin = { left: 30, right: 30, top: 30, bottom: 30 },
            stacked = false,
            rotateTicks = false,
            timeIsRelative = false,
            fullLengthBackgrounds = false,
            itemHeight = 10,
            itemMargin = 25,
            navMargin = 60,
            showTimeAxis = true,
            showAxisTop = false,
            showTodayLine = false,
            timeAxisTick = false,
            timeAxisTickFormat = {
                stroke: "stroke-dasharray",
                spacing: "4 10",
            },
            showTodayFormat = {
                marginTop: 25,
                marginBottom: 0,
                width: 1,
                color: colorCycle,
            },
            showBorderLine = false,
            showBorderFormat = {
                marginTop: 25,
                marginBottom: 0,
                width: 1,
                color: colorCycle,
            },
            showAxisHeaderBackground = false,
            showAxisNav = false,
            showAxisCalendarYear = false,
            axisBgColor = "white",
            chartData = {};
        var appendTimeAxis = function (g, xAxis, yPosition) {
            if (showAxisHeaderBackground) {
                appendAxisHeaderBackground(g, 0, 0);
            }

            if (showAxisNav) {
                appendTimeAxisNav(g);
            }

            var axis = g
                .append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + 0 + "," + yPosition + ")")
                .call(xAxis);
        };

        var appendTimeAxisCalendarYear = function (nav) {
            var calendarLabel = beginning.getFullYear();

            if (beginning.getFullYear() != ending.getFullYear()) {
                calendarLabel =
                    beginning.getFullYear() + "-" + ending.getFullYear();
            }

            nav.append("text")
                .attr("transform", "translate(" + 20 + ", 0)")
                .attr("x", 0)
                .attr("y", 14)
                .attr("class", "calendarYear")
                .text(calendarLabel);
        };
        var appendTimeAxisNav = function (g) {
            var timelineBlocks = 6;
            var leftNavMargin = margin.left - navMargin;
            var incrementValue = (width - margin.left) / timelineBlocks;
            var rightNavMargin =
                width - margin.right - incrementValue + navMargin;

            var nav = g
                .append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0, 20)");
            if (showAxisCalendarYear) {
                appendTimeAxisCalendarYear(nav);
            }

            nav.append("text")
                .attr("transform", "translate(" + leftNavMargin + ", 0)")
                .attr("x", 0)
                .attr("y", 14)
                .attr("class", "chevron")
                .text("<")
                .on("click", function () {
                    return navigateLeft(beginning, chartData);
                });

            nav.append("text")
                .attr("transform", "translate(" + rightNavMargin + ", 0)")
                .attr("x", 0)
                .attr("y", 14)
                .attr("class", "chevron")
                .text(">")
                .on("click", function () {
                    return navigateRight(ending, chartData);
                });
        };

        var appendAxisHeaderBackground = function (g, xAxis, yAxis) {
            g.insert("rect")
                .attr("class", "row-green-bar")
                .attr("x", xAxis)
                .attr("width", width)
                .attr("y", yAxis)
                .attr("height", itemHeight)
                .attr("fill", axisBgColor);
        };

        var appendTimeAxisTick = function (g, xAxis, maxStack) {
            g.append("g")
                .attr("class", "axis")
                .attr(
                    "transform",
                    "translate(" +
                    0 +
                    "," +
                    (margin.top + (itemHeight + itemMargin) * maxStack) +
                    ")"
                )
                .attr(timeAxisTickFormat.stroke, timeAxisTickFormat.spacing)
                .call(
                    xAxis
                        .tickFormat("")
                        .tickSize(
                            -(
                                margin.top +
                                (itemHeight + itemMargin) * (maxStack - 1) +
                                3
                            ),
                            0,
                            0
                        )
                );
        };

        var appendBackgroundBar = function (
            yAxisMapping,
            index,
            g,
            data,
            datum
        ) {
            var greenbarYAxis =
                (itemHeight + itemMargin) * yAxisMapping[index] + margin.top;
            g.selectAll("svg")
                .data(data)
                .enter()
                .insert("rect")
                .attr("class", "row-green-bar")
                .attr("x", fullLengthBackgrounds ? 0 : margin.left)
                .attr(
                    "width",
                    fullLengthBackgrounds
                        ? width
                        : width - margin.right - margin.left
                )
                .attr("y", greenbarYAxis)
                .attr("height", itemHeight)
                .attr(
                    "fill",
                    backgroundColor instanceof Function
                        ? backgroundColor(datum, index)
                        : backgroundColor
                );
        };

        var appendLabel = function (
            gParent,
            yAxisMapping,
            index,
            hasLabel,
            datum
        ) {
            var fullItemHeight = itemHeight + itemMargin;
            var rowsDown =
                margin.top +
                fullItemHeight / 2 +
                fullItemHeight * (yAxisMapping[index] || 1);

            gParent
                .append("text")
                .attr("class", "timeline-label")
                .attr(
                    "transform",
                    "translate(" + labelMargin + "," + rowsDown + ")"
                )
                .text(hasLabel ? labelFunction(datum.label) : datum.id)
                .on("click", function (d, i) {
                    click(d, index, datum);
                });
        };

        function timeline(gParent) {
            var g = gParent.append("g");
            var gParentSize = gParent[0][0].getBoundingClientRect();

            var gParentItem = d3.select(gParent[0][0]);

            var yAxisMapping = {},
                maxStack = 1,
                minTime = 0,
                maxTime = 0;

            setWidth();

            // check if the user wants relative time
            // if so, substract the first timestamp from each subsequent timestamps
            if (timeIsRelative) {
                g.each(function (d, i) {
                    d.forEach(function (datum, index) {
                        datum.times.forEach(function (time, j) {
                            if (index === 0 && j === 0) {
                                originTime = time.starting_time; //Store the timestamp that will serve as origin
                                time.starting_time = 0; //Set the origin
                                time.ending_time =
                                    time.ending_time - originTime; //Store the relative time (millis)
                            } else {
                                time.starting_time =
                                    time.starting_time - originTime;
                                time.ending_time =
                                    time.ending_time - originTime;
                            }
                        });
                    });
                });
            }

            // check how many stacks we're gonna need
            // do this here so that we can draw the axis before the graph
            if (stacked || ending === 0 || beginning === 0) {
                g.each(function (d, i) {
                    d.forEach(function (datum, index) {
                        // create y mapping for stacked graph
                        if (
                            stacked &&
                            Object.keys(yAxisMapping).indexOf(index) == -1
                        ) {
                            yAxisMapping[index] = maxStack;
                            maxStack++;
                        }

                        // figure out beginning and ending times if they are unspecified
                        datum.times.forEach(function (time, i) {
                            if (beginning === 0)
                                if (
                                    time.starting_time < minTime ||
                                    (minTime === 0 && timeIsRelative === false)
                                )
                                    minTime = time.starting_time;
                            if (ending === 0)
                                if (time.ending_time > maxTime)
                                    maxTime = time.ending_time;
                        });
                    });
                });

                if (ending === 0) {
                    ending = maxTime;
                }
                if (beginning === 0) {
                    beginning = minTime;
                }
            }

            var scaleFactor =
                (1 / (ending - beginning)) *
                (width - margin.left - margin.right);

            // draw the axis
            var xScale = d3.time
                .scale()
                .domain([beginning, ending])
                .range([margin.left, width - margin.right]);

            var xAxis = d3.svg
                .axis()
                .scale(xScale)
                .orient(orient)
                .tickFormat(tickFormat.format)
                .tickSize(tickFormat.tickSize);

            if (tickFormat.tickValues != null) {
                xAxis.tickValues(tickFormat.tickValues);
            } else {
                xAxis.ticks(
                    tickFormat.numTicks || tickFormat.tickTime,
                    tickFormat.tickInterval
                );
            }

            // draw the chart
            g.each(function (d, i) {
                chartData = d;
                d.forEach(function (datum, index) {
                    var data = datum.times;
                    var hasLabel = typeof datum.label != "undefined";

                    // issue warning about using id per data set. Ids should be individual to data elements
                    if (typeof datum.id != "undefined") {
                        console.warn(
                            "d3Timeline Warning: Ids per dataset is deprecated in favor of a 'class' key. Ids are now per data element."
                        );
                    }

                    if (backgroundColor) {
                        appendBackgroundBar(
                            yAxisMapping,
                            index,
                            g,
                            data,
                            datum
                        );
                    }

                    g.append("g")
                        .classed(`driver-${datum.label}`, true)
                        .selectAll("svg")
                        .data(data)
                        .enter()
                        .append(function (d, i) {
                            return document.createElementNS(
                                d3.ns.prefix.svg,
                                "display" in d ? d.display : display
                            );
                        })
                        .attr("x", getXPos)
                        .attr("y", getStackPosition)
                        .attr("width", function (d, i) {
                            return (
                                (d.ending_time - d.starting_time) * scaleFactor
                            );
                        })
                        .attr("cy", function (d, i) {
                            return getStackPosition(d, i) + itemHeight / 2;
                        })
                        .attr("cx", getXPos)
                        .attr("r", itemHeight / 2)
                        .attr("height", itemHeight)
                        .style("fill", function (d, i) {
                            var dColorPropName;
                            if (d.color) return d.color;
                            if (colorPropertyName) {
                                dColorPropName = d[colorPropertyName];
                                if (dColorPropName) {
                                    return colorCycle(dColorPropName);
                                } else {
                                    return colorCycle(datum[colorPropertyName]);
                                }
                            }
                            return colorCycle(index);
                        })
                        .on("mousemove", function (d, i) {
                            hover(d, index, datum);
                        })
                        .on("mouseover", function (d, i) {
                            mouseover(d, i, datum);
                        })
                        .on("mouseout", function (d, i) {
                            mouseout(d, i, datum);
                        })
                        .on("click", function (d, i) {
                            click(d, index, datum);
                        })
                        .attr("class", function (d, i) {
                            return datum.class
                                ? "timelineSeries_" + datum.class
                                : "timelineSeries_" + index;
                        })
                        .attr("id", function (d, i) {
                            // use deprecated id field
                            if (datum.id && !d.id) {
                                return "timelineItem_" + datum.id;
                            }

                            return d.id
                                ? d.id
                                : "timelineItem_" + index + "_" + i;
                        });

                    let res = g
                        .select(`.driver-${datum.label}`)
                        .append("g")
                        .selectAll("svg")
                        .data(data)
                        .enter()
                        .append("g")
                        .attr("transform", function (d) {
                            return `translate(${
                                getXPos(d) - 10
                            }, ${getStackPosition(d) - 10})`;
                        });

                    res.append("rect")
                        .attr("width", 30)
                        .attr("height", 30)
                        .attr("rx", 5)
                        .attr("ry", 5)
                        .attr("fill", (d) => (d.label == 0 ? d.color : "white"))
                        .style("stroke-opacity", 0.2)
                        .style("stroke-width", 1)
                        .style("stroke", "black")
                        .on("hover", function (d, i) {
                            hover(d, i, datum);
                        })
                        .on("mouseover", function (d, i) {
                            mouseover(d, i, datum);
                        })
                        .on("mouseout", function (d, i) {
                            mouseout(d, i, datum);
                        })
                        .on("click", function (d, i) {
                            click(d, index, datum);
                        });

                    res.append("g")
                        .classed("depot-bullet", true)
                        .attr("transform", (d) =>
                            d.label == 0
                                ? "translate(5, 5)"
                                : d.label == -1
                                ? "translate(-3, 0)"
                                : "translate(10, 20)"
                        )
                        .attr("fill", (d) => (d.label != 0 ? d.color : "white"))
                        .html(function (d) {
                            if (d.label == 0) return svgCar;
                            else if (d.label == -1) return svgRunningCar;
                            return `<text>${d.label}</text>`;
                        });

                    res.selectAll(".depot-bullet svg")
                        .attr("width", 20)
                        .attr("height", 20);
                    res.selectAll(".depot-bullet .running-car")
                        .attr("width", 40)
                        .attr("height", 50);

                    if (rowSeparatorsColor) {
                        var lineYAxis =
                            itemHeight +
                            itemMargin / 2 +
                            margin.top +
                            (itemHeight + itemMargin) * yAxisMapping[index];
                        gParent
                            .append("svg:line")
                            .attr("class", "row-separator")
                            .attr("x1", 0 + margin.left)
                            .attr("x2", width - margin.right)
                            .attr("y1", lineYAxis)
                            .attr("y2", lineYAxis)
                            .attr("stroke-width", 1)
                            .attr("stroke", rowSeparatorsColor);
                    }

                    // add the label
                    if (hasLabel) {
                        appendLabel(
                            gParent,
                            yAxisMapping,
                            index,
                            hasLabel,
                            datum
                        );
                    }

                    if (typeof datum.icon !== "undefined") {
                        gParent
                            .append("image")
                            .attr("class", "timeline-label")
                            .attr(
                                "transform",
                                "translate(" +
                                0 +
                                "," +
                                (margin.top +
                                    (itemHeight + itemMargin) *
                                    yAxisMapping[index]) +
                                ")"
                            )
                            .attr("xlink:href", datum.icon)
                            .attr("width", margin.left)
                            .attr("height", itemHeight);
                    }

                    function getStackPosition(d, i) {
                        if (stacked) {
                            return (
                                margin.top +
                                (itemHeight + itemMargin) * yAxisMapping[index]
                            );
                        }
                        return margin.top;
                    }
                    function getStackTextPosition(d, i) {
                        if (stacked) {
                            return (
                                margin.top +
                                (itemHeight + itemMargin) *
                                yAxisMapping[index] +
                                itemHeight * 0.75
                            );
                        }
                        return margin.top + itemHeight * 0.75;
                    }
                });
            });

            var belowLastItem =
                margin.top + (itemHeight + itemMargin) * maxStack;
            var aboveFirstItem = margin.top;
            var timeAxisYPosition = showAxisTop
                ? aboveFirstItem
                : belowLastItem;
            if (showTimeAxis) {
                appendTimeAxis(g, xAxis, timeAxisYPosition);
            }
            if (timeAxisTick) {
                appendTimeAxisTick(g, xAxis, maxStack);
            }

            if (width > gParentSize.width) {
                var move = function () {
                    var x = Math.min(
                        60,
                        Math.max(
                            gParentSize.width - width,
                            d3.event.translate[0]
                        )
                    );
                    zoom.translate([x, 0]);
                    g.attr("transform", "translate(" + x + ",0)");
                    scroll(Math.min(x * scaleFactor, xScale));
                };

                var zoom = d3.behavior.zoom().x(xScale).on("zoom", move);

                gParent.attr("class", "scrollable").call(zoom);
            }

            if (rotateTicks) {
                g.selectAll(".tick text").attr("transform", function (d) {
                    return (
                        "rotate(" +
                        rotateTicks +
                        ")translate(" +
                        (this.getBBox().width / 2 + 10) +
                        "," + // TODO: change this 10
                        this.getBBox().height / 2 +
                        ")"
                    );
                });
            }

            var gSize = g[0][0].getBoundingClientRect();
            setHeight();

            if (showBorderLine) {
                g.each(function (d, i) {
                    d.forEach(function (datum) {
                        var times = datum.times;
                        times.forEach(function (time) {
                            appendLine(
                                xScale(time.starting_time),
                                showBorderFormat
                            );
                            appendLine(
                                xScale(time.ending_time),
                                showBorderFormat
                            );
                        });
                    });
                });
            }

            if (showTodayLine) {
                var todayLine = xScale(new Date());
                appendLine(todayLine, showTodayFormat);
            }

            function getXPos(d, i) {
                return (
                    margin.left + (d.starting_time - beginning) * scaleFactor
                );
            }

            function getXTextPos(d, i) {
                return (
                    margin.left +
                    (d.starting_time - beginning) * scaleFactor +
                    5
                );
            }

            function setHeight() {
                if (!height && !gParentItem.attr("height")) {
                    if (itemHeight) {
                        // set height based off of item height
                        height = gSize.height + gSize.top - gParentSize.top;
                        // set bounding rectangle height
                        d3.select(gParent[0][0]).attr("height", height);
                    } else {
                        throw "height of the timeline is not set";
                    }
                } else {
                    if (!height) {
                        height = gParentItem.attr("height");
                    } else {
                        gParentItem.attr("height", height);
                    }
                }
            }

            function setWidth() {
                if (!width && !gParentSize.width) {
                    try {
                        width = gParentItem.attr("width");
                        if (!width) {
                            throw "width of the timeline is not set. As of Firefox 27, timeline().with(x) needs to be explicitly set in order to render";
                        }
                    } catch (err) {
                    }
                } else if (!(width && gParentSize.width)) {
                    try {
                        width = gParentItem.attr("width");
                    } catch (err) {
                    }
                }
                // if both are set, do nothing
            }

            function appendLine(lineScale, lineFormat) {
                gParent
                    .append("svg:line")
                    .attr("x1", lineScale)
                    .attr("y1", lineFormat.marginTop)
                    .attr("x2", lineScale)
                    .attr("y2", height - lineFormat.marginBottom)
                    .style("stroke", lineFormat.color) //"rgb(6,120,155)")
                    .style("stroke-width", lineFormat.width);
            }
        }

        // SETTINGS

        timeline.margin = function (p) {
            if (!arguments.length) return margin;
            margin = p;
            return timeline;
        };

        timeline.orient = function (orientation) {
            if (!arguments.length) return orient;
            orient = orientation;
            return timeline;
        };

        timeline.itemHeight = function (h) {
            if (!arguments.length) return itemHeight;
            itemHeight = h;
            return timeline;
        };

        timeline.itemMargin = function (h) {
            if (!arguments.length) return itemMargin;
            itemMargin = h;
            return timeline;
        };

        timeline.navMargin = function (h) {
            if (!arguments.length) return navMargin;
            navMargin = h;
            return timeline;
        };

        timeline.height = function (h) {
            if (!arguments.length) return height;
            height = h;
            return timeline;
        };

        timeline.width = function (w) {
            if (!arguments.length) return width;
            width = w;
            return timeline;
        };

        timeline.display = function (displayType) {
            if (!arguments.length || DISPLAY_TYPES.indexOf(displayType) == -1)
                return display;
            display = displayType;
            return timeline;
        };

        timeline.labelFormat = function (f) {
            if (!arguments.length) return labelFunction;
            labelFunction = f;
            return timeline;
        };

        timeline.tickFormat = function (format) {
            if (!arguments.length) return tickFormat;
            tickFormat = format;
            return timeline;
        };

        timeline.hover = function (hoverFunc) {
            if (!arguments.length) return hover;
            hover = hoverFunc;
            return timeline;
        };

        timeline.mouseover = function (mouseoverFunc) {
            if (!arguments.length) return mouseover;
            mouseover = mouseoverFunc;
            return timeline;
        };

        timeline.mouseout = function (mouseoutFunc) {
            if (!arguments.length) return mouseout;
            mouseout = mouseoutFunc;
            return timeline;
        };

        timeline.click = function (clickFunc) {
            if (!arguments.length) return click;
            click = clickFunc;
            return timeline;
        };

        timeline.scroll = function (scrollFunc) {
            if (!arguments.length) return scroll;
            scroll = scrollFunc;
            return timeline;
        };

        timeline.colors = function (colorFormat) {
            if (!arguments.length) return colorCycle;
            colorCycle = colorFormat;
            return timeline;
        };

        timeline.beginning = function (b) {
            if (!arguments.length) return beginning;
            beginning = b;
            return timeline;
        };

        timeline.ending = function (e) {
            if (!arguments.length) return ending;
            ending = e;
            return timeline;
        };

        timeline.labelMargin = function (m) {
            if (!arguments.length) return labelMargin;
            labelMargin = m;
            return timeline;
        };

        timeline.rotateTicks = function (degrees) {
            if (!arguments.length) return rotateTicks;
            rotateTicks = degrees;
            return timeline;
        };

        timeline.stack = function () {
            stacked = !stacked;
            return timeline;
        };

        timeline.relativeTime = function () {
            timeIsRelative = !timeIsRelative;
            return timeline;
        };

        timeline.showBorderLine = function () {
            showBorderLine = !showBorderLine;
            return timeline;
        };

        timeline.showBorderFormat = function (borderFormat) {
            if (!arguments.length) return showBorderFormat;
            showBorderFormat = borderFormat;
            return timeline;
        };

        timeline.showToday = function () {
            showTodayLine = !showTodayLine;
            return timeline;
        };

        timeline.showTodayFormat = function (todayFormat) {
            if (!arguments.length) return showTodayFormat;
            showTodayFormat = todayFormat;
            return timeline;
        };

        timeline.colorProperty = function (colorProp) {
            if (!arguments.length) return colorPropertyName;
            colorPropertyName = colorProp;
            return timeline;
        };

        timeline.rowSeparators = function (color) {
            if (!arguments.length) return rowSeparatorsColor;
            rowSeparatorsColor = color;
            return timeline;
        };

        timeline.background = function (color) {
            if (!arguments.length) return backgroundColor;
            backgroundColor = color;
            return timeline;
        };

        timeline.showTimeAxis = function () {
            showTimeAxis = !showTimeAxis;
            return timeline;
        };

        timeline.showAxisTop = function () {
            showAxisTop = !showAxisTop;
            return timeline;
        };

        timeline.showAxisCalendarYear = function () {
            showAxisCalendarYear = !showAxisCalendarYear;
            return timeline;
        };

        timeline.showTimeAxisTick = function () {
            timeAxisTick = !timeAxisTick;
            return timeline;
        };

        timeline.fullLengthBackgrounds = function () {
            fullLengthBackgrounds = !fullLengthBackgrounds;
            return timeline;
        };

        timeline.showTimeAxisTickFormat = function (format) {
            if (!arguments.length) return timeAxisTickFormat;
            timeAxisTickFormat = format;
            return timeline;
        };

        timeline.showAxisHeaderBackground = function (bgColor) {
            showAxisHeaderBackground = !showAxisHeaderBackground;
            if (bgColor) {
                axisBgColor = bgColor;
            }
            return timeline;
        };

        timeline.navigate = function (navigateBackwards, navigateForwards) {
            if (!arguments.length) return [navigateLeft, navigateRight];
            navigateLeft = navigateBackwards;
            navigateRight = navigateForwards;
            showAxisNav = !showAxisNav;
            return timeline;
        };

        return timeline;
    };
})();

var testData = [
    {
        times: [
            { starting_time: 1355752800000, ending_time: 1355759900000 },
            { starting_time: 1355767900000, ending_time: 1355774400000 },
        ],
    },
    { times: [{ starting_time: 1355759910000, ending_time: 1355761900000 }] },
    { times: [{ starting_time: 1355761910000, ending_time: 1355763910000 }] },
];
var labelTestData = [
    {
        class: "jackie",
        // icon: "svg-pin-driver.svg",
        label: "person a",
        times: [
            {
                starting_time: 1355752800000,
                ending_time: 1355759900000,
                label: "Weeee",
            },
            { starting_time: 1355767900000, ending_time: 1355774400000 },
        ],
    },
    {
        class: "jackie",
        // icon: "svg-pin-driver.svg",
        label: "person b",
        times: [{ starting_time: 1355759910000, ending_time: 1355761900000 }],
    },
    {
        class: "jackie",
        // icon: "svg-pin-driver.svg",
        label: "person c",
        times: [{ starting_time: 1355761910000, ending_time: 1355763910000 }],
    },
];
var width = window.innerWidth;
window.onresize = (...a) => (width = window.innerWidth);

export function timelineHover(routeData) {
    function findMarkerIndexByLocation(markerIndex, label) {
        let route = routeData.filter(
            ([_markersIndex, _colorIndex, _route]) =>
                _markersIndex == markerIndex
        )[0][2];
        if (label == 0) return markerIndex;
        let mini = 0;
        --label;
        for (let i = 0; i < markers.length; ++i)
            if (
                calc(
                    route.routes[0].legs[label].end_location,
                    markers[i].location
                ) <
                calc(
                    markers[mini].location,
                    route.routes[0].legs[label].end_location
                )
            )
                mini = i;
        return mini;
    }

    let labelTestData = routeData.map(([markersIndex, colorIndex, route]) => {
        let startingTime = new Date(
            Math.max(
                markers[markersIndex].info.shift[0].getTime(),
                dispatchedDate || new Date().getTime()
            )
        );
        let results = {
            label: markers[markersIndex].info.name,
            times: [
                ...route.routes[0].legs.map((eachLeg, i) => {
                    // startingTime.setTime(
                    //     startingTime.getTime() + 10 * 60 * 1000
                    // );
                    let result = startingTime.getTime();
                    startingTime.setTime(
                        result + eachLeg.duration.value * 1000
                    );
                    let currentTime = new Date().getTime();
                    if (currentTime > result && currentTime < startingTime) {
                        return [
                            {
                                starting_time: result,
                                ending_time: currentTime,
                                color: constColors[colorIndex],
                                markerIndex: markersIndex,
                                label: i,
                            },
                            {
                                starting_time: currentTime,
                                ending_time: startingTime.getTime(),
                                color: constColors[colorIndex],
                                markerIndex: markersIndex,
                                label: -1,
                            },
                        ];
                    } else
                        return {
                            starting_time: result,
                            ending_time: startingTime.getTime(),
                            color: constColors[colorIndex],
                            markerIndex: markersIndex,
                            label: i,
                        };
                }),
            ].reduce((sum, current) => {
                if (current.length) return [...sum, ...current];
                else return [...sum, current];
            }, []),
        };
        results.times.push({
            starting_time: startingTime.getTime(),
            ending_time: startingTime.getTime(),
            color: constColors[colorIndex],
            markerIndex: markersIndex,
            label: 0,
        });
        return results;
    });

    var chart = d3
        .timeline()
        .width(width)
        .stack()
        .margin({ left: 70, right: 30, top: 0, bottom: 0 })
        .showTimeAxisTick()
        .showToday()
        // .beginning(getTime(8, 0))
        // .ending(getTime(20, 0))
        .showTodayFormat({
            marginTop: 25,
            marginBottom: 0,
            width: 2.5,
            color: "blue",
        })
        .hover(function (d, i, datum) {
            // d is the current rendering object
            // i is the index during d3 rendering
            // datum is the id object
            // $(markers[markers[d.markerIndex]].advancedMarkerView).trigger("click");
            var div = $("#hoverRes");
            var colors = chart.colors();
            div.find(".coloredDiv").css("background-color", colors(i));
            div.find("#name").text(JSON.stringify(d));
        })
        .click(function (d, i, datum) {
            routeData.filter((item) => item[0] == d.markerIndex)[0][2];

            let res = findMarkerIndexByLocation(d.markerIndex, d.label);
            $(markers[res].advancedMarkerView.element).trigger("click");
            map.setCenter(markers[res].location);
            // $(markers[markers[d.markerIndex]].advancedMarkerView).trigger("click");
            // alert(
            //     JSON.stringify(datum) +
            //         "\n" +
            //         JSON.stringify(d) +
            //         "\n" +
            //         JSON.stringify(i)
            // );
        })
        // .relativeTime()
        .tickFormat({
            format: function (d) {
                return d3.time.format("%H:%M")(d);
            },
            tickTime: d3.time.minutes,
            tickInterval: parseInt($("[name='tick-interval']").val()) || 60,
            tickSize: 30,
        });
    // .scroll(function (x, scale) {
    //     $("#scrolled_date")
    //         .text
    //         // scale.invert(x) + " to " + scale.invert(x + width)
    //         ();
    // });
    d3.select("#timeline3").selectAll("svg").remove();
    var svg = d3
        .select("#timeline3")
        .append("svg")
        .attr("width", width)
        .datum(labelTestData)
        .call(chart);
}

// type MyMarkerInfo {
//   id: Number,
//   location: {
//     lat: Number,
//     lng: Number,
//   },
//   isStop: Boolean,
//   geocodeInfo: any,
//   info: any,
//   colorIndex: Number
//   mustDriver: Number,      //for stop
//   waypoints:     [Number], //for driver
// }

let map, infoWindow;
let selectedMarker;

//optimization global variable
let isOptimized = false;
//for rendering optimized routes
let directionsRendererArray = [],
    optimizedRoutes = [];
let markers = [];
let dispatchedDate;

//polygon select & reassign variables
let polyselects = [],
    currentPoly;

function getTime(hour, min) {
    //    return moment(`${hour}-${min}`, "h:m")
    let a = new Date();
    a.setHours(hour, min, 0, 0);
    return a;
}

function getTodayStops(dateFrom, dateTo, ignoreDate = false) {
    return new Promise((resolve, reject) => {
        getVS1Data('TInvoiceList').then(function (dataObject) {
//        if (dataObject.length == 0) {
            sideBarService.getAllTInvoiceListData(moment().format("YYYY-MM-DD"), moment().add(1, "d").format("YYYY-MM-DD"), false, 25, 0, null).then(function (data) {
                resolve(data.tinvoicelist.map(item => ({
                    address:
                        "Australian Passport Office, Charlotte Street, Brisbane QLD, Australia",//item["ShipTo"],
                    name: item["CustomerName"],
                    time: null,
                    email: null,
                    status: null,
                    duration: 10,
                    load: 1,
                    mobile: null,
                    type: null,
                })))
                // await addVS1Data('TInvoiceList', JSON.stringify(data));
                //
            }).catch(function (err) {
                resolve([]);
            });
            // } else {
            //     let data = JSON.parse(dataObject[0].data);
            // }
        }).catch(function (err) {
            resolve([])
        });
    })
}

function getDrivers() {
    return new Promise((resolve, reject) => {
        getVS1Data('TInvoiceList').then(function (dataObject) {
//        if (dataObject.length == 0) {
            sideBarService.getAllTEmployeeList(20, 0, false).then(data => {
                resolve(data["temployeelist"].map(item => ({
                    position: {},
                    startAddress: item.StartLocations || "Australian Passport Office, Charlotte Street, Brisbane QLD, Australia",
                    endAddress: null,
                    name: `${item.FirstName} ${item.LastName}`,
                    shift: [getTime(13, 0), getTime(22, 0)],
                    mobile: item.Phone,
                    capacity: 1000,
                    type: null,
                    drivingSpeed: 100,
                    lunchBreak: null,

                })));
            }).catch(err => {
                resolve([]);
            })
            // } else {
            //     let data = JSON.parse(dataObject[0].data);
            // }
        }).catch(function (err) {
            resolve([])
        });
    })
}


/*************************************************** INTERFACE TO OTHERS [START] ***************************************************/
async function getStopsWithAddress() {
    const tourStops = await getTodayStops(getTime(0, 0), getTime(23, 59));
    const _testTourStops = [
        {
            address:
                "Lucid Studio Vancouver, 701 W Georgia St, Vancouver, BC, Canada",
            name: "Pacfic Centre",
            time: null,
            email: null,
            status: null,
            duration: 10,
            load: 1,
            mobile: null,
            type: null,
        },
        {
            address:
                "Scotiabank Theatre Vancouver, 900 Burrard St, Vancouver, BC, Canada",
            name: "Scotiabank",
            time: null,
            email: null,
            status: null,
            duration: 10,
            load: 1,
            mobile: null,
            type: null,
        },
        {
            address:
                "St. Paul's Hospital, 1081 Burrard St, Vancouver, BC, Canada",
            name: "St. Paul's Hospital",
            time: null,
            email: null,
            status: null,
            duration: 10,
            load: 1,
            mobile: null,
            type: null,
        },
        {
            address:
                "Vancouver Salt Co. Ltd., 85 W 1st Ave, Vancouver, BC, Canada",
            name: "CRAFT BeN",
            time: null,
            email: null,
            status: null,
            duration: 10,
            load: 1,
            mobile: null,
            type: null,
        },
        {
            address:
                "Vancouver Civic Theatres, Cambie St, Vancouver, BC, Canada",
            name: "Milestones",
            time: null,
            email: null,
            status: null,
            duration: 10,
            load: 1,
            mobile: null,
            type: null,
        },
        {
            address:
                "Canada Post Mail Box, Johnston Street, Vancouver, BC, Canada",
            name: "Edible Canada",
            time: null,
            email: null,
            status: null,
            duration: 10,
            load: 1,
            mobile: null,
            type: null,
        },
        {
            address:
                "Yoga Commercial Drive, Commercial Dr, Vancouver, BC, Canada",
            name: "La Mercaleria",
            time: null,
            email: null,
            status: null,
            duration: 10,
            load: 1,
            mobile: null,
            type: null,
        },
        {
            address: "Vancouver Volkswagen, Main St, Vancouver, BC, Canada",
            name: "MeeT on Main",
            time: null,
            email: null,
            status: null,
            duration: 10,
            load: 1,
            mobile: null,
            type: null,
        },
    ];
    return _testTourStops;
}

async function getDriversWithAddress() {
    const driverLoc = await getDrivers();
    const _testDriverLoc = [
        {
            position: {},
            startAddress: "555 W Hastings St, Vancouver, BC V6B 4N4, Canada",
            endAddress: null,
            name: "Pam",
            shift: [getTime(13, 0), getTime(22, 0)],
            mobile: null,
            capacity: 1000,
            type: null,
            drivingSpeed: 100,
            lunchBreak: null,
        },
        {
            position: {},
            startAddress: "Merchandise Mart, Chicaco, 11., United States",
            endAddress: null,
            name: "Emma",
            shift: [getTime(9, 0), getTime(16, 0)],
            mobile: null,
            capacity: 1000,
            type: null,
            drivingSpeed: 100,
            lunchBreak: null,
        },
        {
            position: {},
            startAddress: "Merchandise Martt Chicago. 11., United States",
            endAddress: null,
            name: "Chris",
            shift: [getTime(9, 0), getTime(15, 0)],
            mobile: null,
            capacity: 1000,
            type: null,
            drivingSpeed: 100,
            lunchBreak: null,
        },
        {
            position: {},
            startAddress: "Merchandise Martt Chicago. 11., United States",
            endAddress: null,
            name: "John",
            shift: [getTime(9, 0), getTime(16, 0)],
            mobile: null,
            capacity: 1000,
            type: null,
            drivingSpeed: 100,
            lunchBreak: null,
        },
        {
            position: {},
            startAddress: "555 W Hastings St, Vancouver, BC V6B 4N4, Canada",
            endAddress: null,
            name: "Marc",
            shift: [getTime(13, 15), getTime(22, 0)],
            mobile: null,
            capacity: 1000,
            type: null,
            drivingSpeed: 100,
            lunchBreak: null,
        },
        {
            position: {},
            startAddress: "626 W Pender St, #100 Vancouver, BC V6B 1V9, Canada",
            endAddress: null,
            name: "Suzimine",
            shift: [getTime(13, 15), getTime(22, 0)],
            mobile: null,
            capacity: 1000,
            type: null,
            drivingSpeed: 100,
            lunchBreak: null,
        },
    ];
    return _testDriverLoc;
}

/*************************************************** INTERFACE TO OTHERS [END] ***************************************************/

/*************************************************** FUNDAMENTAL FUNCTIONS [START] ***************************************************/
function getLocation(address) {
    return new Promise((resolve, reject) => {
        var geocoder = new google.maps.Geocoder();
        geocoder
            .geocode({ address })
            .then(({ results }) => resolve(results[0]))
            .catch((err) => reject(`Geocode was not successful ${err}`));
    });
}

function buildContent(marker) {
    let { isStop, info, geocodeInfo, colorIndex } = marker;
    if (isOptimized == false)
        return `
<div style="max-width: 230px;white-space: nowrap;overflow: hidden;">
    <h5>${isStop ? `${info.name}` : `${info.name} - Start Address`}</h5>
    <p style="margin-top: 10px; text-overflow: ellipsis ellipsis;">${
            geocodeInfo.formatted_address
        }</p>
    ${
            !isStop
                ? `<p>Availability: ${formatTime(info.shift[0])} to ${formatTime(
                info.shift[1]
                )}</p>`
                : `<p>Duration: ${info.duration} minutes</p>
        <p>Duration: ${info.load} units</p>`
        }
</div>
`;
    if (isStop == true) {
        return `
      <div class="header unserved ${constColorClasses[colorIndex]}" style="width:100%;">
        <div class="stop-name">${marker.info.name}</div>
        <div class="close-button" onclick='$(".hud-side-panel .content-info").css({ display: "none" })'></div>
      </div>
      <div class="content">
          <div class="info-view">
              <ul class="detail">
              <li>
                  <div class="detail-title">Name</div>
                  <div class="detail-text">${marker.info.name}</div>
              </li>
              <li>
                  <div class="detail-title">Address</div>
                  <div class="detail-text">${geocodeInfo.formatted_address}</div>
              </li>
              <li>
                  <div class="detail-title">Duration</div>
                  <div class="detail-text">${marker.info.duration}</div>
              </li>
              <li>
                  <div class="detail-title">Load</div>
                  <div class="detail-text">${marker.info.load}</div>
              </li>
          </ul>
      </div>
  </div>
    `;
    }
    return `
    <div class="header unserved driver" style="width:100%;">
      <div class="driver-icon ${constColorClasses[colorIndex]}">${" " || svgCar}</div>
      <div class="stop-name">${marker.info.name} - Start Address</div>
      <div class="close-button" onclick='$(".hud-side-panel .content-info").css({ display: "none" })'></div>
    </div>
    <div class="content">
        <div class="info-view">
            <ul class="detail">
                <li>
                    <div class="detail-title">Driver Name</div>
                    <div class="detail-text">${marker.info.name}</div>
                </li>
                <li>
                    <div class="detail-title">Start Address</div>
                    <div class="detail-text">${
        geocodeInfo.formatted_address
    }</div>
                </li>
                <li>
                    <div class="detail-title">Availability</div>
                    <div class="detail-text">${formatTime(
        info.shift[0]
    )} to ${formatTime(info.shift[1])}</div>
                </li>
        </ul>
    </div>
</div>
  `;
}

function updateIndividual(marker) {
    let {
        advancedMarkerView,
        colorIndex,
        isStop,
        location,
        info,
        geocodeInfo,
    } = marker;

    if (marker.advancedMarkerView) {
        let markerView = advancedMarkerView;
        if (isStop) {
            $(markerView.content)
                .find(".pin-visit")
                .css(
                    "fill",
                    colorIndex == null ? "none" : constColors[colorIndex]
                );
        } else {
            if (colorIndex == null) {
                for (let i = 0; i < constColorClasses.length; ++i)
                    $(markerView.content)
                        .parent()
                        .removeClass(constColorClasses[i]);
                return;
            }
            $(markerView.content)
                .parent()
                .addClass(constColorClasses[colorIndex]);
        }
        return marker;
    }

    //Clone svg element
    const parser = new DOMParser();
    // A marker with a custom inline SVG.
    const pinSvgString = isStop ? svgStop : svgPinDriver;
    const pinSvgElement = parser.parseFromString(
        pinSvgString,
        "image/svg+xml"
    ).documentElement;

    //Make Google Map Marker
    advancedMarkerView = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map,
        title: geocodeInfo.formatted_address,
        content: pinSvgElement,
    });

    $(advancedMarkerView.content).parent().addClass("marker"); //.classList.add("marker");
    $(advancedMarkerView.content).css({
        width: "40.8px",
        height: "53.6px",
    });

    function highlight(markerView) {
        $(markerView.content).parent().addClass("selected");
        markerView.element.style.zIndex = 1;

        if (selectedMarker) unhighlight(selectedMarker);

        selectedMarker = markerView;
        if (isOptimized == false) {
            infoWindow.setContent(buildContent(marker));
            infoWindow.open(advancedMarkerView.map, advancedMarkerView);
        } else {
            $(".hud-side-panel .content-info").html(buildContent(marker));
            $(".hud-side-panel .content-info").css({ display: "block" });
        }
        // map.setCenter(location);
    }

    function unhighlight(markerView) {
        $(markerView.content).parent().removeClass("selected");
        markerView.element.style.zIndex = "";

        selectedMarker = null;
        if (isOptimized == false) {
            infoWindow.close();
        } else {
            $(".hud-side-panel .content-info").css({ display: "none" });
        }
    }

    const element = advancedMarkerView.element;

    ["focus", "pointerenter"].forEach((event) => {
        element.addEventListener(event, () => {
            // !selectedMarker && highlight(advancedMarkerView);
        });
    });
    ["blur", "pointerleave"].forEach((event) => {
        element.addEventListener(event, () => {
            // !selectedMarker && unhighlight(advancedMarkerView);
        });
    });

    advancedMarkerView.addListener("click", (event) => {
        if (selectedMarker == advancedMarkerView)
            unhighlight(advancedMarkerView);
        else highlight(advancedMarkerView);
    });
    marker.advancedMarkerView = advancedMarkerView;
    return marker;
}

function updateMarkers() {
    markers.forEach((marker, i) => updateIndividual(marker));
}

async function getDistanceMatrix(addresses) {
    const service = new google.maps.DistanceMatrixService();
    // build request
    const request = {
        origins: [],
        destinations: [],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
    };

    let result = [];
    for (let i = 0; i < addresses.length; ++i) {
        result.push([]);
        for (let j = 0; j < addresses.length; ++j) {
            if (i == j) result[i].push(0);
            else {
                let _request = {
                    ...request,
                    origins: [addresses[i]],
                    destinations: [addresses[j]],
                };
                result[i].push(
                    await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            service
                                .getDistanceMatrix(_request)
                                .then(({ rows }) =>
                                    resolve(rows[0]["elements"][0])
                                )
                                .catch((err) => resolve({}));
                        }, 500);
                    })
                );
            }
        }
    }
}

async function importLibrary() {
    //@ts-ignore
    await google.maps.importLibrary("maps");
    await google.maps.importLibrary("marker");
    await google.maps.importLibrary("places");
    await google.maps.importLibrary("drawing");
}

function calculateAndDisplayRoute(markerIndex, colorIndex) {
    let origin = markers[markerIndex].location;
    let destination = markers[markerIndex].location;
    let waypoints = markers[markerIndex].waypoints.map(
        (id) => findMarkerById(id).location
    );
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: constColors[colorIndex],
            strokeWeight: 4,
        },
    });
    directionsRenderer.setMap(map);

    const waypts = [];
    const checkboxArray = []; //document.getElementById("waypoints");

    for (let i = 0; i < waypoints.length; ++i)
        waypts.push({
            location: waypoints[i],
            stopover: true,
        });

    for (let i = 0; i < checkboxArray.length; i++) {
        if (checkboxArray.options[i].selected) {
            waypts.push({
                location: checkboxArray[i].value,
                stopover: true,
            });
        }
    }

    directionsService
        .route({
            origin,
            destination,
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((response) => {
            directionsRenderer.setDirections(response);
            optimizedRoutes.push([markerIndex, colorIndex, response]);
            if (optimizedRoutes.length == directionsRendererArray.length) {
                timelineHover(optimizedRoutes);
            }
            return;

            const route = response.routes[0];
            const summaryPanel = document.getElementById("directions-panel");

            summaryPanel.innerHTML = "";

            // For each route, display summary information.
            for (let i = 0; i < route.legs.length; i++) {
                const routeSegment = i + 1;

                summaryPanel.innerHTML +=
                    "<b>Route Segment: " + routeSegment + "</b><br>";
                summaryPanel.innerHTML += route.legs[i].start_address + " to ";
                summaryPanel.innerHTML += route.legs[i].end_address + "<br>";
                summaryPanel.innerHTML +=
                    route.legs[i].distance.text + "<br><br>";
            }
        });
    // .catch((e) => window.alert("Directions request failed due to " + e));
    return directionsRenderer;
}

/*************************************************** FUNDAMENTAL FUNCTIONS [START] ***************************************************/
function createCenterControl() {
    const controlButton = document.createElement("button");

    // Set CSS for the control.
    controlButton.style.backgroundColor = "#fff";
    controlButton.style.border = "2px solid #fff";
    controlButton.style.borderRadius = "3px";
    controlButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlButton.style.color = "rgb(25,25,25)";
    controlButton.style.cursor = "pointer";
    controlButton.style.fontFamily = "Roboto,Arial,sans-serif";
    controlButton.style.fontSize = "16px";
    controlButton.style.lineHeight = "38px";
    controlButton.style.margin = "8px 0 22px";
    controlButton.style.padding = "0 5px";
    controlButton.style.textAlign = "center";

    controlButton.textContent = "Optimize Route!";
    controlButton.title = "Select at least one driver";
    controlButton.type = "button";

    $(controlButton).on("click", () => {});

    // Create a DIV to attach the control UI to the Map.
    const centerControlDiv = document.createElement("div");

    // Append the control to the DIV.
    centerControlDiv.appendChild(controlButton);

    // Add the control to the map at a designated control position
    // by pushing it on the position's array. This code will
    // implicitly add the control to the DOM, through the Map
    // object. You should not attach the control manually.
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(
        centerControlDiv
    );

    // Setup the click event listeners: simply set the map to Chicago.
    //controlButton.addEventListener("click", () => {
    // map.setCenter(chicago);
    //});

    return centerControlDiv;
}

export default async function initMap() {
    await importLibrary();

    const MAP_CONTROL_POSITION = google.maps.ControlPosition.TOP_LEFT;

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: 34.84555, lng: -111.8035 },
        mapId: "4504f8b37365c3d0",
        // keyboardShortcuts: false,
        draggable: true,
        mapTypeControl: false,
        panControl: true,
        zoomControl: true,
        scaleControl: false,
        streetViewControl: false,
        scrollWheelZoom: "center",
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: MAP_CONTROL_POSITION,
        },
        panControlOptions: {
            position: MAP_CONTROL_POSITION,
        },
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: MAP_CONTROL_POSITION,
        },
        clickableIcons: false,
        styles: MapStyleC,
    });
    infoWindow = new google.maps.InfoWindow();

    let addresses = [];

    /*************************************************** GEOCODING SERVICE [START] ***************************************************/

    (await getStopsWithAddress()).forEach(async (stopInfo, i) => {
        let geocodeInfo = await getLocation(stopInfo.address);
        let location = geocodeInfo.geometry.location;
        markers.push(
            updateIndividual({
                id: markers.length,
                location,
                geocodeInfo,
                info: stopInfo,
                isStop: true,
                mustDriver: -1,
                routeDriver: -1,
            })
        );
        addresses.push(stopInfo.address);
        if (i == 0) map.setCenter(location);
    });

    (await getDriversWithAddress()).forEach(async (driverInfo, i) => {
        let geocodeInfo = await getLocation(driverInfo.startAddress);
        let location = geocodeInfo.geometry.location;
        markers.push(
            updateIndividual({
                id: markers.length,
                location,
                geocodeInfo,
                info: driverInfo,
                isStop: false,
            })
        );
        addresses.push(driverInfo.startAddress);
    });

    /*************************************************** GEOCODING SERVICE [END] ***************************************************/

    /*************************************************** DRAWING SERVICE [START] ***************************************************/
    const drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: !0,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
            fillColor: "#000",
            fillOpacity: 0.2,
            strokeColor: "#2c3b4d",
            strokeWeight: 5,
            clickable: !0,
            editable: !0,
            draggable: !1,
            zIndex: 1,
        },
    });

    drawingManager.setMap(map);

    google.maps.event.addListener(
        drawingManager,
        "polygoncomplete",
        function (poly) {
            function E(poly) {
                currentPoly = poly;
                polyselects = [];
                let result = [];
                for (let i = 0; i < markers.length; ++i) {
                    if (
                        markers[i].isStop == true &&
                        google.maps.geometry.poly.containsLocation(
                            markers[i].location,
                            poly
                        )
                    ) {
                        polyselects.push(markers[i].id);
                    }
                }
                //Display the Reassign popup window
                $(".content-reassign").css({ display: "block" });
                $(".content-reassign #selected-stops").html(polyselects.length);
                $(".content-reassign .form-select").html(
                    markers
                        .filter((item) => item.isStop == false)
                        .map(
                            (driverMarker) =>
                                `<option value=${driverMarker.id}>${driverMarker.info.name}</option>`
                        )
                        .join(" ")
                );

                $(".content-reassign #button-reassign").on("click", () => {
                    polyselects.forEach(
                        (index) =>
                            (markers[index].mustDriver = $(
                                ".content-reassign .form-select"
                            ).val())
                    );
                    $(".content-reassign").css({ display: "none" });
                    poly.setMap(null);
                });
            }
            return (
                E(poly),
                    google.maps.event.addListener(poly.getPath(), "set_at", () =>
                        E(poly)
                    ) //,
                // google.maps.event.addListener(poly.getPath(), "insert_at", () =>
                //     E(poly)
                // ),
                // google.maps.event.addListener(poly.getPath(), "remove_at", () =>
                //     E(poly)
                // )
            );
        }
    );
    /*************************************************** DRAWING SERVICE [END] ***************************************************/

    let optimizeButton = createCenterControl();

    function optimize() {
        let drivers = [],
            stops = [],
            flag = {};
        let i, j, k;
        for (i = 0; i < markers.length; ++i)
            if (markers[i].isStop == false) {
                drivers.push(markers[i]);
                flag[markers[i].id] = markers[i].id;
            } else stops.push(markers[i]);

        let dist = [];
        for (i = 0; i < markers.length; ++i) {
            dist.push([]);
            for (j = 0; j < markers.length; ++j)
                dist[i].push(calc(markers[i].location, markers[j].location));
        }

        while (1) {
            for (i = 0; i < stops.length; ++i)
                if (flag[stops[i].id] == null) break;
            if (i == stops.length) break;

            let outOne,
                inOne,
                dist = 1e10;
            for (i = 0; i < stops.length; ++i) {
                //if this stop is already visited
                if (flag[stops[i].id] != null) continue;

                let mustDriver = stops[i].mustDriver;
                for (j = 0; j < drivers.length; ++j) {
                    //if this stop is assigned to a specific driver
                    if (mustDriver >= 0 && mustDriver != drivers[j].id)
                        continue;

                    let curDist = calc(
                        stops[i].location,
                        findMarkerById(flag[drivers[j].id]).location
                    );
                    if (dist > curDist)
                        (outOne = stops[i].id),
                            (inOne = drivers[j].id),
                            (dist = curDist);
                }
            }
            flag[outOne] = inOne;
            flag[inOne] = outOne;
        }
        return flag;
    }

    let optimizeFlow = () => {
        $(".hud-sub-nav").css({ display: "block" });
        directionsRendererArray.forEach((item) => item.setMap(null));
        directionsRendererArray = [];
        optimizedRoutes = [];

        let flag = optimize();

        for (let i = 0; i < markers.length; ++i)
            if (markers[i].isStop == false) markers[i].waypoints = [];
        for (let i = 0; i < markers.length; ++i)
            if (markers[i].isStop == true) {
                findMarkerById(flag[markers[i].id]).waypoints.push(
                    markers[i].id
                );
            }
        let colorIndex = 0;
        for (let i = 0; i < markers.length; ++i) markers[i].colorIndex = null;
        for (let i = 0; i < markers.length; ++i)
            if (markers[i].isStop == false && markers[i].waypoints.length > 0) {
                directionsRendererArray.push(
                    calculateAndDisplayRoute(i, colorIndex)
                );
                markers[i].waypoints.forEach(
                    (id) => (findMarkerById(id).colorIndex = colorIndex)
                );
                markers[i].colorIndex = colorIndex;
                colorIndex += 1;
            }
        isOptimized = true;

        updateMarkers();
    };

    $(".onboarding-target-reoptimize-btn").on("click", optimizeFlow);
    $(optimizeButton).on("click", optimizeFlow);

    $(".onboarding-target-dispatch-btn").on("click", () => {
        if (confirm("Dispatch to Drivers?") == true) {
            dispatchedDate = new Date();
            alert("Successfully dispatched!");
        }
    });
    $(".content-reassign .close-button").on("click", () => {
        $(".hud-side-panel .content-reassign").css({ display: "none" });
        currentPoly.setMap(null);
    });

    $(".hud-sub-nav [title='Expand Chart']").on("click", () => {
        $(".gantt-container").parent().height("310.5px");
    });
    $(".hud-sub-nav [title='Collapse Chart']").on("click", () => {
        $(".gantt-container").parent().height("90px");
    });
    $(".hud-sub-nav [title='Refresh Chart']").on("click", () => {
        timelineHover(optimizedRoutes);
    });

    $("[name='tick-interval']").on("keydown", function (e) {
        if (e.keyCode == 13) timelineHover(optimizedRoutes);
    });
}