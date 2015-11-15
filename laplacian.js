'use strict'

var pool = require('typedarray-pool')

module.exports = meshLaplacian

function hypot(x, y, z) {
  return Math.sqrt(
    Math.pow(x, 2) +
    Math.pow(y, 2) +
    Math.pow(z, 2))
}

function compareEntry(a, b) {
  return (a[0]-b[0]) || (a[1]-b[1])
}

function meshLaplacian(cells, positions) {
  var numVerts = positions.length
  var numCells = cells.length

  var areas = pool.mallocDouble(numVerts)
  for(var i=0; i<numVerts; ++i) {
    areas[i] = 0
  }

  var entries = []
  for(var i=0; i<numCells; ++i) {
    var cell = cells[i]
    var ia = cell[0]
    var ib = cell[1]
    var ic = cell[2]

    var a  = positions[ia]
    var b  = positions[ib]
    var c  = positions[ic]

    var abx = a[0] - b[0]
    var aby = a[1] - b[1]
    var abz = a[2] - b[2]

    var bcx = b[0] - c[0]
    var bcy = b[1] - c[1]
    var bcz = b[2] - c[2]

    var cax = c[0] - a[0]
    var cay = c[1] - a[1]
    var caz = c[2] - a[2]

    var area = 0.5 * hypot(
      aby * caz - abz * cay,
      abz * cax - abx * caz,
      abx * cay - aby * cax)

    //Skip thin triangles
    if(area < 1e-8) {
      continue
    }

    var w = -0.5 / area
    var wa = w * (abx * cax + aby * cay + abz * caz)
    var wb = w * (bcx * abx + bcy * aby + bcz * abz)
    var wc = w * (cax * bcx + cay * bcy + caz * bcz)

    var varea = area / 3
    areas[ia] += varea
    areas[ib] += varea
    areas[ic] += varea

    entries.push(
      [ib,ic,wa],
      [ic,ib,wa],
      [ic,ia,wb],
      [ia,ic,wb],
      [ia,ib,wc],
      [ib,ia,wc]
    )
  }

  var weights = pool.mallocDouble(numVerts)
  for(var i=0; i<numVerts; ++i) {
    weights[i] = 0
  }

  entries.sort(compareEntry)

  var ptr = 0
  for(var i=0; i<entries.length; ) {
    var entry = entries[i++]
    while(
      i < entries.length &&
      entries[i][0] === entry[0] &&
      entries[i][1] === entry[1] ) {
        entry[2] += entries[i++][2]
    }
    entry[2] /= areas[entry[0]]
    weights[entry[0]] += entry[2]
    entries[ptr++] = entry
  }
  entries.length = ptr

  for(var i=0; i<numVerts; ++i) {
    entries.push([i, i, -weights[i]])
  }

  pool.free(areas)
  pool.free(weights)

  return entries
}
