'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */


var coreModule = require('lib/core'),
    bendpointsModule = require('diagram-js/lib/features/bendpoints'),
    modelingModule = require('lib/features/modeling'),
    labelEditingModule = require('lib/features/label-editing');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

var testModules = [
  coreModule,
  modelingModule,
  labelEditingModule,
  bendpointsModule
];


describe('modeling - label layouting', function() {

  describe('should create label', function() {

    var diagramXML = require('./LabelLayouting.initial.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('horizontal', inject(function(modeling, elementRegistry) {

      // given
      var element1 = elementRegistry.get('StartEvent_1'),
          element2 = elementRegistry.get('ExclusiveGateway_2');

      // when
      var connection = modeling.connect(element1, element2);

      // then
      expect(connection.label.x).to.be.equal(427);
      expect(connection.label.y).to.be.equal(332);
    }));


    it('vertical', inject(function(modeling, elementRegistry) {

      // given
      var element1 = elementRegistry.get('StartEvent_1'),
          element2 = elementRegistry.get('ExclusiveGateway_1');

      // when
      var connection = modeling.connect(element1, element2);

      // then
      expect(connection.label.x).to.be.equal(292);
      expect(connection.label.y).to.be.equal(219.5);
    }));

  });


  describe('should move label', function() {

    var diagramXML = require('./LabelLayouting.move.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    describe('on segment move', function() {

      it('left - no relayout', inject(function(elementRegistry, connectionSegmentMove, dragging) {

        // given
        var connection = elementRegistry.get('SequenceFlow_B'),
            labelPosition = getLabelPosition(connection);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);

        dragging.move(canvasEvent({ x: -30, y: 0 }));

        dragging.end();

        // then
        expectLabelMoved(connection, labelPosition, { x: -30, y: 0 });
      }));


      it('left - remove bendpoint', inject(function(elementRegistry, connectionSegmentMove, dragging) {

        // given
        var connection = elementRegistry.get('SequenceFlow_B'),
            labelPosition = getLabelPosition(connection);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);

        dragging.move(canvasEvent({ x: -70, y: 0 }));

        dragging.end();

        // then
        expectLabelMoved(connection, labelPosition, { x: -70, y: 0 });
      }));


      it('right - no relayout', inject(function(elementRegistry, connectionSegmentMove, dragging) {

        // given
        var connection = elementRegistry.get('SequenceFlow_B'),
            labelPosition = getLabelPosition(connection);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);

        dragging.move(canvasEvent({ x: 30, y: 0 }));

        dragging.end();

        // then
        expectLabelMoved(connection, labelPosition, { x: 30, y: 0 });
      }));


      it('right - remove bendpoint', inject(function(elementRegistry, connectionSegmentMove, dragging) {

        // given
        var connection = elementRegistry.get('SequenceFlow_B'),
            labelPosition = getLabelPosition(connection);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);

        dragging.move(canvasEvent({ x: 70, y: 0 }));

        dragging.end();

        // then
        expectLabelMoved(connection, labelPosition, { x: 70, y: 0 });
      }));


      it.only('down', inject(function(elementRegistry, connectionSegmentMove, dragging) {

        // given
        var connection = elementRegistry.get('SequenceFlow_C'),
            labelPosition = getLabelPosition(connection);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);

        dragging.move(canvasEvent({ x: 0, y: 70 }));

        dragging.end();

        // then
        expectLabelMoved(connection, labelPosition, { x: 0, y: 70 });

      }));


      it('up - remove two bendpoints', inject(function(elementRegistry, connectionSegmentMove, dragging) {

        // given
        var connection = elementRegistry.get('SequenceFlow_C'),
            labelPosition = getLabelPosition(connection);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);

        dragging.move(canvasEvent({ x: 0, y: -90 }));

        dragging.end();

        // then
        expectLabelMoved(connection, labelPosition, { x: 0, y: -85 });

      }));

    });

    describe('on reconnect', function() {

      it('start', inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('SequenceFlow_D'),
            shape = elementRegistry.get('Task_1');

        // when
        modeling.reconnectStart(connection, shape, { x: 0, y: 0 });

        // then
        expect(Math.round(connection.label.x)).to.be.equal(647);
        expect(Math.round(connection.label.y)).to.be.equal(160);

      }));


      it('end', inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('SequenceFlow_A'),
            shape = elementRegistry.get('Task_2');

        // when
        modeling.reconnectEnd(connection, shape, { x: 294, y: 270 });

        // then
        expect(Math.round(connection.label.x)).to.be.equal(169);
        expect(Math.round(connection.label.y)).to.be.equal(105);

      }));

    });

    describe('on shape move', function() {

      it('down', inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('SequenceFlow_E'),
            shape = elementRegistry.get('Task_4'),
            labelPosition = getLabelPosition(connection);

        // when
        modeling.moveShape(shape, { x: 0, y: 100 });

        // then
        expectLabelMoved(connection, labelPosition, { x: 0, y: 100 });

      }));

    });

    describe('on bendpoint add/delete/moving', function() {

      it('moving', inject(function(elementRegistry, bendpointMove, dragging) {

        // given
        var connection = elementRegistry.get('SequenceFlow_B');

        // when
        bendpointMove.start(canvasEvent({ x: 0, y: 0 }), connection, 1);

        dragging.move(canvasEvent({ x: 455 + 50, y: 120 }));

        dragging.end();

        // then
        expect(Math.round(connection.label.x)).to.be.equal(453);
        expect(Math.round(connection.label.y)).to.be.equal(179);

      }));


      it('remove', inject(function(elementRegistry, bendpointMove, dragging) {

        // given
        var connection = elementRegistry.get('SequenceFlow_B');

        // when
        bendpointMove.start(canvasEvent({ x: 0, y: 0 }), connection, 1);

        dragging.move(canvasEvent({ x: 455, y: 120 + 160 }));

        dragging.end();

        // then
        expect(Math.round(connection.label.x)).to.be.equal(401);
        expect(Math.round(connection.label.y)).to.be.equal(187);

      }));


      it('add', inject(function(elementRegistry, bendpointMove, dragging, canvas) {

        // given
        var connection = elementRegistry.get('SequenceFlow_B');

        // when
        bendpointMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2, true);

        dragging.hover({
          element: connection,
          gfx: canvas.getGraphics(connection)
        });

        dragging.move(canvasEvent({ x: 600, y: 200 }));

        dragging.end();

        // then
        expect(Math.round(connection.label.x)).to.be.equal(464);
        expect(Math.round(connection.label.y)).to.be.equal(132);

      }));

    });

    describe('special cases', function() {

    });

  });

});



function getLabelPosition(connection) {

  var label = connection.label;

  var mid = {
    x: label.x + (label.width / 2),
    y: label.y + (label.height / 2)
  };

  return mid;
}


function expectLabelMoved(connection, oldPosition, expectedDelta) {

  var newPosition = getLabelPosition(connection);

  var delta = {
    x: newPosition.x - oldPosition.x,
    y: newPosition.y - oldPosition.y
  };

  expect(delta).to.eql(expectedDelta);
}
