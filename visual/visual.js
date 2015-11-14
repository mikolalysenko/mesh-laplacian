'use strict'

var viewer = require('mesh-viewer')()
var bunny = require('bunny')
bunny = require('refine-mesh')(
  bunny.cells,
  bunny.positions,
  require('angle-normals')(
    bunny.cells,
    bunny.positions),
  {
    edgeLength: 0.1
  })
var lapList = require('../laplacian')(bunny.cells, bunny.positions)
var laplacian = require('csr-matrix').fromList(lapList)

var mesh

viewer.on('viewer-init', function() {

  var transpose = [
    new Array(bunny.positions.length),
    new Array(bunny.positions.length),
    new Array(bunny.positions.length) ]

  for(var i=0; i<bunny.positions.length; ++i) {
    for(var j=0; j<3; ++j) {
      transpose[j][i] = bunny.positions[i][j]
    }
  }

  var curvature = new Array(bunny.positions.length)
  for(var i=0; i<bunny.positions.length; ++i) {
    curvature[i] = 0
  }

  var scratch = [
    new Array(bunny.positions.length),
    new Array(bunny.positions.length),
    new Array(bunny.positions.length) ]
  for(var i=0; i<3; ++i) {
    laplacian.apply(transpose[i], scratch[i])
    for(var j=0; j<bunny.positions.length; ++j) {
      curvature[j] += Math.pow(scratch[i][j], 2)
    }
  }

  mesh = viewer.createMesh({
    cells: bunny.cells,
    positions: bunny.positions,
    vertexColors: curvature.map(function(intensity, i) {
      return [
        Math.sqrt(intensity),
        0,
        0,
        1]
    }),
    ambientLight: [0.5,0.5,0.5,1]
  })
})

viewer.on('gl-render', function() {
  mesh.draw()
})
