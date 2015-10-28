(function () {
        var arcMin = 75;        // inner radius of the first arc
        var arcWidth = 10;      // width
        var arcPad = 3;         // padding between arcs
        var greenTranslate = "translate(200, 200)";
        var textTranslate = "translate(155, 200)";
        var RED = "rgb(255,0,0)";
        var ORANGE = "rgb(255,140,0)";
        var PI = Math.PI;
        var width = window.innerWidth,
            height = window.innerHeight;

        var filterFloat = function (value) {
            if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
                    .test(value))
            var result = Number(value);
            if (result >= 0 && result <= 1) {
                return Number(value);
            }

            return NaN;
        };

        var dataset = [];

        var getColor = function(d) {
            // we need to redefine the fills as well since we have new data,
            //  otherwise the colors would no longer be relative to the data
            //  values (and arc length). if your fills weren't relative to
            //  the data, this would not be necessary
            var grn = Math.floor((1 - d / 60) * 255);

            if (dataset.length > 0 && d == dataset[1]) {
                if (dataset[1] + 30 <= dataset[0]) {
                    return RED;
                } else if (dataset[1] + 15 <= dataset[0]) {
                    return ORANGE;
                }
            }
            return "rgb(0, " + grn + ", 0)";
        };

        angular.module('app', []).controller('ctrl', function ($scope) {
            $scope.expected = 0;
            $scope.actual = 0;
        }).
            directive('indicator', function () {
                return {
                    restrict: 'E',
                    require: 'ngModel',
                    template: 'Actual: <input type="number" id="actual-input" ng-model="actual" ng-init="actual=0"/>' +
                    'Expected: <input type="number" id="expected-input" ng-model="expected" ng-init="expected=0"/>' +
                    '<div class="chart"></div>',
                    link: function (scope, element, attrs, ngModel) {

                        // append svg to the DIV
                        d3.select(".chart").append("svg:svg")
                            .attr("width", width)
                            .attr("height", height);

                        var render = function () {
                            vis = d3.select("svg");   // select the svg
                            dataset = [scope.expected * 60, scope.actual * 60]; //scale is in minutes

                            // arc accessor
                            //  d and i are automatically passed to accessor functions,
                            //  with d being the data and i the index of the data
                            var drawArc = d3.svg.arc()
                                .innerRadius(function (d, i) {
                                    result = arcMin + i * (arcWidth) + arcPad;
                                    return result;
                                })
                                .outerRadius(function (d, i) {
                                    result = arcMin + (1.25 * i + 1) * (arcWidth);
                                    return result;
                                })
                                .startAngle(0 * (PI / 180))
                                .endAngle(function (d, i) {
                                    return Math.floor((d * 6 * (PI / 180)) * 1000) / 1000;
                                });

                            // bind the data
                            var arcs = vis.selectAll("path.arc-path").data(dataset);

                            // update green arcs (the naive way)
                            arcs.transition()         // adding a transition
                                .duration(300)
                                .attr("fill", function (d) {
                                    return getColor(d);
                                })
                                .attr("d", drawArc);    // this will only work when the difference between the old
                                                        //  and new values between two isn't too great. otherwise
                                                        //  the arc will be drawn using the shortest-path. see below
                                                        //  for the custom arc2Tween function called by attrTween

                            // draw green arcs for new data
                            arcs.enter().append("svg:path")
                                .attr("class", "arc-path")                  // assigns a class for easier selecting
                                .attr("transform", greenTranslate)
                                .attr("fill", function (d) {
                                    return getColor(d);
                                })
                                .attr("d", drawArc); // draw the arc

                            updateProgressText();

                        };

                        function updateProgressText() {
                            if (!(d3.selectAll('text.progress-text')[0].length)) {
                                d3.select("svg")
                                    .append('text')
                                    .attr("class", "progress-text")
                                    .attr("transform", textTranslate)
                                    .attr('fill', 'black')
                            }

                            d3.select('text.progress-text').text(scope.actual * 100 + '%\n Progress');
                        }

                        scope.$watch('actual', function (newValue, oldValue) {
                            newValue = filterFloat(newValue);
                            if (newValue !== oldValue) {
                                if (!isNaN(newValue)) {
                                    render();
                                } else {
                                    scope.actual = oldValue;
                                }
                            }
                        });

                        scope.$watch('expected', function (newValue, oldValue) {
                            newValue = filterFloat(newValue);
                            if (newValue !== oldValue) {
                                if (!isNaN(newValue)) {
                                    render();
                                } else {
                                    scope.expected = oldValue;
                                }
                            }
                        });

                        var initialize = function () {
                            render();

                            if (!d3.selectAll("circle.click-circle")[0].length) {    // if there is no click area..
                                d3.select("svg").append("circle")
                                    .attr("class", 'click-circle')
                                    .attr("transform", greenTranslate)
                                    .attr("r", arcMin * 0.85)
                                    .attr("fill", "rgba(201, 201, 201, 0.25)");
                            }
                            updateProgressText();
                        };

                        initialize();
                    }
                };
            });
    }.call(this)
);