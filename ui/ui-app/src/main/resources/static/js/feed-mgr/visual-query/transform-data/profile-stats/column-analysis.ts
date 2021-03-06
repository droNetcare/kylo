import {Component, Input, OnInit} from "@angular/core";
import * as angular from "angular";
import * as d3 from "d3";

@Component({
    selector: "column-analysis",
    styleUrls: ["js/feed-mgr/visual-query/transform-data/profile-stats/column-analysis.css"],
    templateUrl: "js/feed-mgr/visual-query/transform-data/profile-stats/column-analysis.html"
})
export class ColumnAnalysisController implements OnInit {

    data: Array<any> = [];
    @Input() profile: any;
    @Input() field: string;
    totalCount: string;
    unique: string;
    maxLen: string;
    minLen: string;
    percUnique: number;
    percEmpty: number;
    emptyCount: string;
    columnDataType: string;
    nullCount: string;
    percNull: number;
    max: string;
    min: string;
    sum: string;
    mean: string;
    stddev: string;
    variance: string;
    histo: object;
    validCount: number;
    invalidCount: string;
    showValid: boolean = false;

    ngOnInit(): void {
        this.show();
    }

    show(): void {
        this.initializeStats();

        // populate metrics
        if (this.data && this.data.length > 0) {
            this.data.sort(this.compare);

            // rescale bar
            let total: number = parseInt(this.totalCount);
            let scaleFactor: number = (1 / (this.data[0].count / total));
            let cummCount: number = 0;
            this.data.forEach(item => {
                let frequency = (item.count / total);
                item.frequency = frequency * 100;
                cummCount += item.frequency;
                item.cumm = cummCount;
                item.width = item.frequency * scaleFactor;
            });
        }
    }

    initializeStats(): void {
        var self = this;
        angular.forEach(self.profile, function (value: any) {
            if (value.columnName == self.field) {

                switch (value.metricType) {
                    case 'TOP_N_VALUES':
                        let values = value.metricValue.split("^B");
                        angular.forEach(values, function (item: string) {
                            if (item != '') {
                                let e = item.split("^A");
                                self.data.push({domain: e[1], count: parseInt(e[2])});
                            }
                        });
                        break;
                    case 'TOTAL_COUNT':
                        self.totalCount = value.metricValue;
                        break;
                    case 'UNIQUE_COUNT':
                        self.unique = value.metricValue;
                        break;
                    case 'EMPTY_COUNT':
                        self.emptyCount = value.metricValue;
                        break;
                    case 'NULL_COUNT':
                        self.nullCount = value.metricValue;
                        break;
                    case 'COLUMN_DATATYPE':
                        self.columnDataType = value.metricValue;
                        break;
                    case 'MAX_LENGTH':
                        self.maxLen = value.metricValue;
                        break;
                    case 'MIN_LENGTH':
                        self.minLen = value.metricValue;
                        break;
                    case 'MAX':
                        self.max = value.metricValue;
                        break;
                    case 'MIN':
                        self.min = value.metricValue;
                        break;
                    case 'SUM':
                        self.sum = value.metricValue;
                        break;
                    case 'MEAN':
                        self.mean = value.metricValue;
                        break;
                    case 'STDDEV':
                        self.stddev = value.metricValue;
                        break;
                    case 'VARIANCE':
                        self.variance = value.metricValue;
                        break;
                    case 'HISTO':
                        self.histo = angular.fromJson(value.metricValue);
                        break;
                    case 'VALID_COUNT':
                        self.validCount = value.metricValue;
                        self.showValid = true;
                        break;
                    case 'INVALID_COUNT':
                        self.invalidCount = value.metricValue;
                        self.showValid = true;
                        break;
                }
            }
        });
        if (this.unique != null) {
            this.percUnique = (parseInt(this.unique) / parseInt(this.totalCount))
        }
        if (this.emptyCount != null) {
            this.percEmpty = (parseInt(this.emptyCount) / parseInt(this.totalCount));
        }
        if (this.nullCount != null) {
            this.percNull = (parseInt(this.nullCount) / parseInt(this.totalCount));
        }
        if (this.showValid) {
            this.validCount = (parseInt(this.totalCount) - parseInt(this.invalidCount));
        }
    }

    /**
     * Comparator function for model reverse sort
     */
    compare(a: any, b: any): number {
        if (a.count < b.count)
            return 1;
        if (a.count > b.count)
            return -1;
        return 0;
    }
}

@Component(({
    selector: "column-histogram",
    template: `
      <nvd3 [options]="chartOptions" [data]="chartData"></nvd3>`
}))
export class HistogramController implements OnInit {

    tooltipData: any;
    @Input("chart-data") chartData: any;
    chartApi: any;
    chartOptions: any = {
        "chart": {
            "type": "multiBarChart",
            "height": 315,
            "width": 700,
            "margin": {
                "top": 20,
                "right": 20,
                "bottom": 45,
                "left": 45
            },
            "clipEdge": true,
            "duration": 250,
            "stacked": false,
            "xAxis": {
                "axisLabel": "Value",
                "showMaxMin": true,
                "tickFormat": function (d: number) {
                    return d3.format('0f')(d)
                }
            },
            "yAxis": {
                "axisLabel": "Count",
                "axisLabelDistance": -20,
                "tickFormat": function (d: number) {
                    return d3.format('0f')(d)
                }
            },
            "showControls": false,
            "showLegend": false,
            tooltip: {
                contentGenerator: function (e: any) {
                    const data = e.data;
                    if (data === null) return;
                    return `<table><tbody>` +
                        `<tr><td class="key">Min</td><td>${data.min}</td></tr>` +
                        `<tr><td class="key">Max</td><td>${data.max}</td></tr>` +
                        `<tr><td class="key">Count</td><td>${data.y}</td></tr>` +
                        `</tbody></table>`;
                }
            }


        }
    };

    formatData() {
        const xAxis = this.chartData._1;
        const yAxis = this.chartData._2;

        const data = [];
        for (let i = 0; i < xAxis.length - 1; i++) {
            data.push({min: xAxis[i], max: xAxis[i + 1], x: (xAxis[i] + xAxis[i + 1]) / 2, y: yAxis[i]});
        }
        this.tooltipData = data;
        return [{
            key: 'Count',
            color: '#bcbd22',
            values: data
        }];
    }

    ngOnInit() {
        this.chartData = this.formatData();
    }
}
