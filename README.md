# mesh-laplacian
Computes the Laplacian of a mesh.

## Install

```
npm i mesh-laplacian
```

## Example

```javascript
var bunny   = require('bunny')
var lapList = require('mesh-laplacian')(bunny.cells, bunny.positions)
var lapMat  = require('csr-matrix').fromList(lapList)
```

## API

#### `var mat = require('mesh-laplacian')(cells, positions)`
Constructs the mesh Laplacian for a given surface mesh using barycentric cotangent weights.

* `cells` are the faces of the mesh
* `positions` are the coordinates of the vertices of the mesh

**Returns** A list of entries of the form `[vi,vj,w]` representing the entries
of the Laplaican matrix for the mesh.

## Credits
(c) 2015 Mikola Lysenko. MIT License
