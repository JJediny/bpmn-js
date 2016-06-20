'use strict';

require('../../../../../TestHelper');

var GeometricUtil = require('lib/features/modeling/behavior/util/GeometricUtil');


describe('modeling/behavior/util - GeometricUtil', function() {

  it('should calculate right horizontal-line/point distance', function() {

    // given
    var a = { x: 1, y: 1 },
        b = { x: 4, y: 1 };

    var point = { x: 2, y: 4 };

    // when
    var d = GeometricUtil.getDistancePointLine(point, [ a, b ]);

    // then
    expect(d).to.be.equal(3);

  });


  it('should calculate right perpendicular foot', function() {

    // given
    var a = { x: 1, y: 1 },
        b = { x: 1, y: 3 };

    var point = { x: 2, y: 2 };

    // when
    var pf = GeometricUtil.perpendicularFoot(point, [ a, b ]);

    // then
    expect(pf.x).to.be.eql(1);
    expect(pf.y).to.be.eql(2);
  });


  it('should calculate right distance', function() {

    // given
    var a = { x: 1, y: 1 },
        b = { x: 5, y: 1 };

    // when
    var d = GeometricUtil.getDistancePointPoint(a, b);

    // then
    expect(d).to.be.eql(4);

  });

  it('should calculate right bounds of line', function() {

    // given
    var line = [
      { x: 0, y: 0 },
      { x: 100, y: 100 }
    ];

    var testPoints = [
      { point: { x: 1, y: 1 }, inBounds: true },
      { point: { x: -1, y: -1 }, inBounds: false },
      { point: { x: 1, y: 1 }, inBounds: true },
      { point: { x: 1, y: 1 }, inBounds: true }
    ];

    for (var i=0; i<testPoints.length; i++) {

      // when
      var inBounds = GeometricUtil.pointInBounds(testPoints[i].point, line);

      // then
      expect(inBounds).to.be.equal(testPoints[i].inBounds);
    }

  });

});
