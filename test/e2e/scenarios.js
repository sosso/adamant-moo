'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('App', function () {

    describe('View', function () {

        var actual, expected;

        beforeEach(function () {
            browser.get('app/');
            actual = element(by.css('#actual-input'));
            expected = element(by.css('#expected-input'));
        });

        afterEach(function () {
            actual.clear();
            expected.clear();
        });

        it('Should not allow values outside of [0, 1.0]', function () {
            var actual = element(by.css('#actual-input')); // issues when using by model
            actual.click().clear().then(function () {
                actual.sendKeys(.2);
                actual.getAttribute('value').then(function (value) {
                    expect(parseFloat(value)).toBe(0.2);
                });
            });

            [-7, NaN, 'a'].forEach(function (value) {
                //Clear to 0
                actual.sendKeys(protractor.Key.BACK_SPACE);
                actual.sendKeys(protractor.Key.BACK_SPACE);

                actual.sendKeys(value);
                actual.getAttribute('value').then(function (value) {
                    expect(parseInt(value)).toBe(0);
                });
            });

        });

        it('Should have green rings when expected - actual <= .25', function () {
            var arc = element.all(by.css('path')).get(1);

            expected.click().clear().then(function () {
                expected.sendKeys(0.25)
            });

            actual.click().clear().then(function () {
                actual.sendKeys(0.25)
                element(by.css('.progress-text')).getText().then(function (text) {
                    expect(text).toBe('25% Progress');
                });
            });


            browser.driver.sleep(1000);
            arc.getAttribute('fill').then(function (rgb) {
                expect(rgb.substring(1, 3)).toEqual('00');
                expect(rgb.substring(3, 5)).toEqual('bf');
                expect(rgb.substring(5, 7)).toEqual('00');
            });
        });

        it('Should have orange outer ring when actual between 25 and 50% behind expected', function () {
            var arc = element.all(by.css('path')).get(1);

            expected.click().clear().then(function () {
                expected.sendKeys(0.5);
            });
            actual.click().clear().then(function () {
                actual.sendKeys(0.25);
                element(by.css('.progress-text')).getText().then(function (text) {
                    expect(text).toBe('25% Progress');
                });
            });

            browser.driver.sleep(1000);
            arc.getAttribute('fill').then(function (rgb) {
                expect(rgb.substring(1, 3)).toEqual('ff');
                expect(rgb.substring(3, 5)).toEqual('8c');
                expect(rgb.substring(5, 7)).toEqual('00');
            });
        });

        it('Should have orange red ring when actual more than 50% behind expected', function () {
            var arc = element.all(by.css('path')).get(1);

            expected.click().clear().then(function () {
                expected.sendKeys(0.80);
            });
            actual.click().clear().then(function () {
                actual.sendKeys(0.25);
                element(by.css('.progress-text')).getText().then(function (text) {
                    expect(text).toBe('25% Progress');
                });
            });

            browser.driver.sleep(1000);
            arc.getAttribute('fill').then(function (rgb) {
                expect(rgb.substring(1, 3)).toEqual('ff');
                expect(rgb.substring(3, 5)).toEqual('00');
                expect(rgb.substring(5, 7)).toEqual('00');
            });
        });

    });
});
