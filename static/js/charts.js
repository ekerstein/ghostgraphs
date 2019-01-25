const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//////////////////////////////////////////////////////////////////////////////////////
// DASHBOARD

$('#dash-posts').text(api_data.length) // Set dashboard posts

//////////////////////////////////////////////////////////////////////////////////////
// MAKE DATA

var colors = ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"];

// Function to sort array
function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

// Sort by published
api_data = sortByKey(api_data, 'published');

// Set dash
$('#dash-lastpost').text(moment().diff(moment(api_data[api_data.length - 1].published), 'days')) // Set last post

// Make data object
var data = {
    'dash-authors': [],
    'dash-tags': [],
    'total-words': 0,
    'words': [],
    'cumu-words': [],
    'time': [],
    'count': [],
    'months': {
        'dates': [],
        'totals': []
    }
}

// Create month array
// Add first month
var month = moment(api_data[0].published);
data.months.dates.push(month.format('YYYY-MM'))
data.months.totals.push(0);

// Loop forward through all months
while (month.format('YYYY-MM') != moment(api_data[api_data.length - 1].published).format('YYYY-MM')) {
    month.add(1, 'month');
    data.months.dates.push(month.format('YYYY-MM')) 
    data.months.totals.push(0);
}

// Iterate through data
for (i = 0; i < api_data.length; i++) {
    // For each author
    for (j = 0; j < api_data[i].authors.length; j++) {
        var author = api_data[i].authors[j]
        if (!data["dash-authors"].includes(author)) {
            data["dash-authors"].push(author);
        }
    }
    // For each tag
    for (j = 0; j < api_data[i].tags.length; j++) {
        var tag = api_data[i].tags[j]
        if (!data["dash-tags"].includes(tag)) {
            data["dash-tags"].push(tag);
        }
    }
    // Words per post
    data.words.push(api_data[i].words);
    data["total-words"] += api_data[i].words;
    data["cumu-words"].push(data["total-words"]);
    // Time and count
    data.time.push(moment(api_data[i].published));
    data.count.push(i + 1);
    // Count monthly posts
    var month = moment(api_data[i].published).format('YYYY-MM');
    data.months.totals[data.months.dates.indexOf(month)] += 1;

}

console.log(data)

// Add final point for time, count, and words
data.time.push(moment());
data.count.push(data.count.length);
data["cumu-words"].push(data["total-words"]);

//////////////////////////////////////////////////////////////////////////////////////
// DASHBOARD

// Words
if (data["total-words"] / 1e3 >= 1000) {
    $('#dash-words').text((data["total-words"] / 1e6).toFixed(2) + "M") // total words dash, >1M
} else {
    $('#dash-words').text((data["total-words"] / 1e3).toFixed() + "k") // total words dash, <1M
}
$('#dash-avgwords').text(numberWithCommas((data["total-words"] / api_data.length).toFixed())) // total words / posts

$('#dash-authors').text(data["dash-authors"].length) // Set dashboard authors
$('#dash-tags').text(data["dash-tags"].length) // Set dashboard tags

//////////////////////////////////////////////////////////////////////////////////////
// GLOBAL CHARTJS OPTIONS

Chart.defaults.global.defaultFontSize = 11.44;
Chart.defaults.global.defaultFontColor = 'black';
//
Chart.defaults.global.title.display = false;
Chart.defaults.global.legend.display = false;
Chart.defaults.global.legend.onClick = null; // disable clickable legend
Chart.defaults.global.layout.padding = 0;
//
Chart.defaults.global.tooltips.enabled = true;
Chart.defaults.global.tooltips.mode = 'index';
Chart.defaults.global.tooltips.intersect = false;
Chart.Tooltip.positioners.custom = function (elements, position) {
    // If no elements, no tooltip
    if (!elements.length) {
        return false;
    }

    var i, len;
    var x = 0;
    var y = 0;
    for (i = 0, len = elements.length; i < len; ++i) {
        var el = elements[i];
        // for each data element, check if exists and has value
        if (el && el.hasValue()) {
            var pos = el.tooltipPosition();
            x = pos.x; // x value of element (should all be the same)
            y = 0; // bottom of chart (el._yScale.bottom)
        }
    }

    return {
        x: x,
        y: y
    };
}
Chart.defaults.global.tooltips.position = 'custom';
//
Chart.defaults.global.animation.duration = 0; // general animation time
Chart.defaults.global.hover.animationDuration = 0; // duration of animations when hovering an item
Chart.defaults.global.responsive = true;
Chart.defaults.global.responsiveAnimationDuration = 0; // animation duration after a resize
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.events = ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"]; // remove tooltip on mobile touchend
//
Chart.scaleService.updateScaleDefaults('linear', {
    gridLines: {
        drawOnChartArea: false,
        color: 'rgba(0, 0, 0, 1)',
        lineWidth: 0.5,
    },
    ticks: {
        maxTicksLimit: 4,
    }
});
Chart.scaleService.updateScaleDefaults('logarithmic', {
    gridLines: {
        drawOnChartArea: false,
        color: 'rgba(0, 0, 0, 1)',
        lineWidth: 0.5,
    },
    ticks: {
        maxTicksLimit: 4,
    }
});
Chart.scaleService.updateScaleDefaults('time', {
    gridLines: {
        drawOnChartArea: false,
        color: 'rgba(0, 0, 0, 1)',
        lineWidth: 0.5,
    },
});

//////////////////////////////////////////////////////////////////////////////////////
// MAKE HISTOGRAM

function histogram(data) {

    // sort data ascending
    data.sort(function (a, b) {
        return a - b;
    });

    // Quantile function
    function quantile(p) {
        var index = 1 + (data.length - 1) * p,
            low = Math.floor(index),
            high = Math.ceil(index),
            hh = index - low;
        return (1 - hh) * data[low] + hh * data[high];
    }

    function freedmanDiaconis() {
        // Interquartile range
        var iqr = quantile(0.75) - quantile(0.25);
        return 2 * iqr * Math.pow(data.length, -1 / 3);
    }

    // Make bins round
    function pretty(x) {
        var scale = Math.pow(10, Math.floor(Math.log(x / 10) / Math.LN10)),
            err = 10 / x * scale;
        if (err <= 0.15) scale *= 10;
        else if (err <= 0.35) scale *= 5;
        else if (err <= 0.75) scale *= 2;
        return scale * 10;
    }

    var bin_size = freedmanDiaconis();
    bin_size = pretty(bin_size);

    function bucket(d) {
        return bin_size * Math.floor(d / bin_size);
    }

    function tickRange(n) {
        var extent = [bucket(data[0]), bin_size + bucket(data[data.length - 1])],
            buckets = Math.round((extent[1] - extent[0]) / bin_size),
            step = buckets > n ? Math.round(buckets / n) : 1,
            pad = buckets % step; // to center whole step markings
        return [extent[0] + bin_size * Math.floor(pad / 2),
        extent[1] - bin_size * Math.ceil(pad / 2) + bin_size * 0.5, // pad upper extent for d3.range
        bin_size * step
        ];
    }

    return {
        size: bin_size,
        fun: bucket,
        tickRange: tickRange
    };
};

function range(start, end, step = 1) {
    const len = Math.floor((end - start) / step) + 1
    return Array(len).fill().map((_, idx) => start + (idx * step))
}

var hist_data = data.words;
var hist = histogram(hist_data);

var binRange = hist.tickRange();


// Make x axis bins, start, end, step
var hist_x = range(binRange[0], Math.round(binRange[1]), binRange[2]);

// Make and fill y axis incidence
var hist_y = Array(hist_x.length).fill(0)
for (var i = 0; i < hist_data.length; i++) {
    var value = hist_data[i];
    var index = hist_x.indexOf(hist.fun(value));
    hist_y[index] = hist_y[index] + 1;
}

// amount of each bin increment
var hist_step = hist.size; 

//////////////////////////////////////////////////////////////////////////////////////
// CHART 1

var chart1 = new Chart($("#chart1"), {
    type: 'line',
    data: {
        labels: data.time,
        datasets: [
            {
                label: "Posts",
                yAxisID: 'posts',
                data: data.count,
                steppedLine: true,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: colors[1],
                borderWidth: 1.5,
                pointRadius: 0,
                pointHoverRadius: 0,
                showLine: true,
                lineTension: 0, // straight lines
            },
            {
                label: "Words",
                yAxisID: 'words',
                data: data["cumu-words"],
                steppedLine: true,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: colors[6],
                borderWidth: 1.5,
                pointRadius: 0,
                pointHoverRadius: 0,
                showLine: true,
                lineTension: 0, // straight lines
            }
        ]
    },
    options: {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    // if !NaN
                    if (tooltipItem.yLabel) {
                        return data.datasets[tooltipItem.datasetIndex].label + ': ' + numberWithCommas(tooltipItem.yLabel.toFixed(0)) + '';
                    }
                }
            }
        },
        scales: {
            xAxes: [{
                display: true,
                type: 'time',
                time: {
                    tooltipFormat: 'll hh:mm A', //'ll HH:mm'
                    //unit: 'month', // always display this
                    displayFormats: {
                        //day: 'MMM',
                        month: 'YYYY'
                    }
                }
            }],
            yAxes: [{
                display: true,
                id: "posts",
                position: "left",
                scaleLabel: {
                    display: true,
                    labelString: "Posts"
                },    
                ticks: {
                    callback: function (value, index, values) {
                        return (value).toFixed(0);
                    }
                }
            }, {
                display: true,
                id: "words",
                position: "right",
                scaleLabel: {
                    display: true,
                    labelString: "Words"
                },
                ticks: {
                    callback: function (value, index, values) {
                        if (value >= 1e6) {
                            // if whole
                            if (value / 1e6 % 1 == 0) {
                                return (value / 1e6).toFixed(0) + 'M';
                            } else {
                                return (value / 1e6).toFixed(1) + 'M';
                            }  
                        } 
                        else if (value >= 1e3) {
                            return (value / 1e3).toFixed(0) + 'k';
                        }
                        else {
                            return (value).toFixed(0) + '';
                        }
                    }
                }
            }]
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////////
// CHART 2

var chart2 = new Chart($("#chart2"), {
    type: 'bar',
    data: {
        labels: hist_x,
        datasets: [
            {
                label: "Posts",
                data: hist_y,
                backgroundColor: colors[3],
            }
        ]
    },
    options: {
        tooltips: {
            callbacks: {
                title: function (tooltipItem, data) {
                    return data.labels[tooltipItem[0].index] + " - " + (data.labels[tooltipItem[0].index] + hist_step);
                },
                label: function (tooltipItem, data) {
                    // if !NaN
                    if (tooltipItem.yLabel) {
                        return data.datasets[tooltipItem.datasetIndex].label + ': ' + numberWithCommas(tooltipItem.yLabel.toFixed(0)) + '';
                    }
                }
            }
        },
        scales: {
            xAxes: [{
                display: true,
                categoryPercentage: 1.0,
                barPercentage: 1.0
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: "Posts"
                }, 
            }]
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////////
// CHART 3

var chart3 = new Chart($("#chart3"), {
    type: 'bar',
    data: {
        labels: data.months.dates,
        datasets: [
            {
                label: "Posts",
                data: data.months.totals,
                backgroundColor: colors[2],
            }
        ]
    },
    options: {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    // if !NaN
                    return data.datasets[tooltipItem.datasetIndex].label + ': ' + numberWithCommas(tooltipItem.yLabel.toFixed(0)) + '';
                }
            }
        },
        scales: {
            xAxes: [{
                display: true,
                type: 'time',
                offset: true,
                //categoryPercentage: 1,
                barPercentage: 1,
                time: {
                    tooltipFormat: 'MMM YYYY',
                    //unit: 'month', // always display this
                    displayFormats: {
                        day: 'MMM',
                        month: 'YYYY'
                    }
                },
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: "Posts"
                }, 
            }]
        }
    }
});