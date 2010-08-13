//----------------------------------------------------------------------------
// The MIT License
// 
// Copyright (c) 2009, 2010 Patrick Mueller
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//----------------------------------------------------------------------------

module.setExports(Table)

var oo = require("modjewels/oo")

//----------------------------------------------------------------------------
function Table(document, rows, cols) {
    this._trElements   = []
    this._tdElements   = []
    this._tableElement = null
    
    this._documentFragment = document.createDocumentFragment()
    this._tableElement     = document.createElement("table")
    this._documentFragment.appendChild(this._tableElement)
    
    this._rows = 0
    this._cows = 0

    if (!rows || !cols) return
    
    this.rows(rows)
    this.cows(cols)
}

//----------------------------------------------------------------------------
oo.addMethod(Table, function td(row, col) {
    return this._tdElements[row][col]
})

//----------------------------------------------------------------------------
oo.addMethod(Table, function tr(row) {
    return this._trElements[row]
})

//----------------------------------------------------------------------------
oo.addMethod(Table, function documentFragment() {
    return this._documentFragment
})

//----------------------------------------------------------------------------
oo.addMethod(Table, function table() {
    return this._tableElement
})

//----------------------------------------------------------------------------
oo.addMethod(Table, function rows(rows) {
    if (!arguments.length)  return this._rows
    if (rows == this._rows) return this._rows
    
    var diff
    var tr
    var td
    
    // add rows
    if (rows > this._rows) {
        var diff = rows - this._rows
        for (var i=0; i<diff; i++) {
            
        }
    }
    
    // remove rows
    else {
        var diff = this._rows - rows
        for (var i=0; i<diff; i++) {
          tr = 
        }
    }
    
    this._rows = rows
})

//----------------------------------------------------------------------------
oo.addMethod(Table, function cols(cols) {
    if (!arguments.length)  return this._cols
    if (cols == this._cols) return this._cols
})

