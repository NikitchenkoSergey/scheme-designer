var assert = require('assert');

var fs = require('fs');
var vm = require('vm');
var path = './dist/scheme-designer.min.js';

var code = fs.readFileSync(path);
vm.runInThisContext(code);

describe('configure()', function() {
    it('should return object with configure properties', function() {
        var obj = {
            default: 2,
            changed: 3,
            setChanged: function(value) {
                obj.changed = value;
            },
            setDefault: function(value) {
                obj.default = value;
            }
        };

        SchemeDesigner.Tools.configure(obj, {
            changed: 4
        });
        assert.equal(obj.default, 2);
        assert.equal(obj.changed, 4);
    });
});

describe('capitalizeFirstLetter()', function() {
    it('should return string with capitalized first letter', function() {
        var string = 'test test test';
        string = SchemeDesigner.Tools.capitalizeFirstLetter(string);
        assert.equal(string, 'Test test test');
    });
});

describe('pointInRect()', function() {
    it('should return true if point in rect', function() {
        var point = {x: 10, y: 20};
        var rect1 = {left: 5, top: 5, right: 15, bottom: 22};
        var result1 = SchemeDesigner.Tools.pointInRect(point, rect1);
        assert.equal(result1, true);

        var rect2 = {left: 5, top: 5, right: 15, bottom: 15};
        var result2 = SchemeDesigner.Tools.pointInRect(point, rect2);
        assert.equal(result2, false);

        var result3 = SchemeDesigner.Tools.pointInRect(point, rect1, 90);
        assert.equal(result3, false);
    });
});
