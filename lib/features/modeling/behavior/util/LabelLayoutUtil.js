'use strict';

var GeometricUtil = require('./GeometricUtil');

var reduce = require('lodash/collection/reduce');

var LABEL_LINE_BOUNDS = 120;

module.exports.LABEL_LINE_BOUNDS = LABEL_LINE_BOUNDS;

function distanceMin(d, last) {
  return d.distance < last.distance ? d : last;
}

function getMinDistanceLineIndex(label, waypoints) {

  var distances = [];

  for (var i=0; i<waypoints.length-1; i++) {

    var line = [ waypoints[i], waypoints[i+1] ];

    var distance = GeometricUtil.getDistancePointLine(label, line);

    if (labelInBounds(label, line)) distances.push({ idx: i, distance: distance });
  }

  var min = reduce(distances, distanceMin);

  if (min) return min.idx;

  else return null;
}


function labelInBounds(label, line) {

  var pfPoint = GeometricUtil.perpendicularFoot(label, line),
      distance = GeometricUtil.getDistancePointLine(label, line);

  var a = line[0],
      b = line[1];

  var r;

  // vertical line
  if (a.x === b.x) r = ( pfPoint.y - a.y ) / ( b.y-a.y );

  // horizontal and other lines
  else r = ( pfPoint.x - a.x ) / ( b.x-a.x );

  // inBounds if r between 0,1 and distance to label lower then bound
  return 0 < r && r < 1 && distance < LABEL_LINE_BOUNDS ? true : false;
}

module.exports.labelInBounds = labelInBounds;

function findNewLabelLineStartIndex(oldWaypoints, newWaypoints, index, hints) {

  var offset = newWaypoints.length - oldWaypoints.length;

  // segmentMove happend
  if (hints.segmentMove) {

    var oldSegmentStartIndex = hints.segmentMove.segmentStartIndex,
        newSegmentStartIndex = hints.segmentMove.newSegmentStartIndex;

    // if label was on moved segment return new segment index
    if (index === oldSegmentStartIndex)
      return newSegmentStartIndex;

    // label is after new segment index
    if (index >= newSegmentStartIndex)
      return (index+offset < newSegmentStartIndex) ? newSegmentStartIndex : index+offset;

    // if label is before new segment index
    else
      return index;
  }

  // bendpointMove happend
  if (hints.bendpointMove) {

    var insert = hints.bendpointMove.insert,
        bendpointIndex = hints.bendpointMove.bendpointIndex;

    // waypoints length didnt change
    if (offset === 0) return index;

    else {

      // label before new/removed bendpoint
      if (index < bendpointIndex) return index;

      // label behind new/removed bendpoint
      else return insert ? index + 1 : index - 1;
    }
  }

  // start/end changed
  if (offset === 0) return index;

  if (hints.startChanged) {
    return (index === 0) ? 0 : null;
  }

  if (hints.endChanged) {
    return (index === oldWaypoints.length - 2) ? newWaypoints.length - 2 : null;
  }

  return null;
}

module.exports.findNewLabelLineStartIndex = findNewLabelLineStartIndex;

function rotary(vector, angle) {
  return (!angle) ? vector : {
    x: Math.cos(angle) * vector.x - Math.sin(angle) * vector.y,
    y: Math.sin(angle) * vector.x + Math.cos(angle) * vector.y
  };
}

function getOptiomalLabelPosition(label, newWaypoints, oldWaypoints, hints) {

  var labelPosition = {
    x: label.x + label.width / 2,
    y: label.y + label.height / 2
  };

  var oldLabelLineIndex = getMinDistanceLineIndex(labelPosition, oldWaypoints);

  var x = 0, y = 0;

  if (oldLabelLineIndex === null) {
    return { x: x, y: y };
  }

  var oldLabelLine = [ oldWaypoints[oldLabelLineIndex], oldWaypoints[oldLabelLineIndex+1] ],
      oldFoot = GeometricUtil.perpendicularFoot(labelPosition, oldLabelLine);


  var segmentLength = GeometricUtil.getDistancePointPoint(oldLabelLine[0], oldLabelLine[1]),
      segemntStartFootLength = GeometricUtil.getDistancePointPoint(oldLabelLine[0], oldFoot),
      percentage = segemntStartFootLength / segmentLength;

  var newLabelLineIndex = findNewLabelLineStartIndex(oldWaypoints, newWaypoints, oldLabelLineIndex, hints);

  if (newLabelLineIndex < 0 || newLabelLineIndex > newWaypoints.length-2) {
    newLabelLineIndex = null;
  }

  if (newLabelLineIndex !== null) {

    var newLabelLine = [ newWaypoints[newLabelLineIndex], newWaypoints[newLabelLineIndex+1] ];


    // console.log(GeometricUtil.pointInBounds(labelPosition, oldLabelLine), oldLabelLineIndex);

    var oldAngle = Math.atan( (oldLabelLine[1].y - oldLabelLine[0].y) / (oldLabelLine[1].x - oldLabelLine[0].x) );
    var newAngle = Math.atan( (newLabelLine[1].y - newLabelLine[0].y) / (newLabelLine[1].x - newLabelLine[0].x) );

    var angle = newAngle - oldAngle;


    var newFoot = {
      x: (newLabelLine[1].x - newLabelLine[0].x) * percentage + newLabelLine[0].x,
      y: (newLabelLine[1].y - newLabelLine[0].y) * percentage + newLabelLine[0].y
    };

    var labelVector = {
      x: labelPosition.x - oldFoot.x,
      y: labelPosition.y - oldFoot.y
    };

    labelVector = rotary(labelVector, angle);

    x = newFoot.x + labelVector.x - labelPosition.x;
    y = newFoot.y + labelVector.y - labelPosition.y;

  }

  return { x: x, y: y };
}

module.exports.getOptiomalLabelPosition = getOptiomalLabelPosition;
