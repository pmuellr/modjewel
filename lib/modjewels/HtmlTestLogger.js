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

oo = require("oo")

require("es5-compat")

//----------------------------------------------------------------------------
// a test logger which generates/manipulates HTML
//----------------------------------------------------------------------------
function HtmlTestLogger(element) {
    if (!(element instanceof HTMLElement)) throw new Error("element must be an HTMLElement")
    
    this.element = element
}

//----------------------------------------------------------------------------
// export class
//----------------------------------------------------------------------------
oo.exportSingletonClass(module, exports, HtmlTestLogger)

//----------------------------------------------------------------------------
// run before all tests
//----------------------------------------------------------------------------
oo.addMethod(HtmlTestLogger, function beforeAll(tests){
    this.timeStarted = new Date()
    
    var document = this.element.ownerDocument
    
    this.document    = document
    this.table       = document.createElement("table")
    
    // timing elements
    this.spanTimeElapsed  = createTimeStructureHTML(this.element, "time elapsed")
    this.spanTimeStarted  = createTimeStructureHTML(this.element, "time started")
    this.spanTimeFinished = createTimeStructureHTML(this.element, "time finished")

    this.spanTimeStarted.innerHTML = this.timeStarted.toLocaleDateString()
    
    var self = this
    this.updateElapsedInterval = setInterval(function(self.updateElapsed) {}, 500)
    
    // build table
    tests.forEach(function(test, index) {
        var row = document.createElement("tr")
        this.table.appendChild(row)
        
        var nameCell = document.createElement("td")
        row.appendChild(nameCell)
        
        var statusCell = document.createElement("td")
        row.appendChild(statusCell)
        
        nameCell.innerHTML   = test.name
        statusCell.innerHTML = test.state
        
        test.htmlRow    = row
        test.htmlStatus = statusCell
    })
    
    // remove element's children
    while (this.element.childNodes.length) {
        this.element.removeChild(this.element.childNodes[i])
    }
    
    // add the table to the element
    this.element.appendChild(this.table)
})

//----------------------------------------------------------------------------
// run after all tests
//----------------------------------------------------------------------------
oo.addMethod(HtmlTestLogger, function afterAll(tests){
    this.timeFinished = new Date()
    
    this.spanTimeFinished.innerHTML = this.timeFinished.toLocaleDateString()
    clearInterval(this.updateElapsedInterval)
    
})

//----------------------------------------------------------------------------
// run before one test
//----------------------------------------------------------------------------
oo.addMethod(HtmlTestLogger, function beforeOne(test){
    test.htmlStatus.innerHTML = "... running ..."
    test.htmlRow.style.backgroundColor = "#FF0"
})

//----------------------------------------------------------------------------
// run after one test
//----------------------------------------------------------------------------
oo.addMethod(HtmlTestLogger, function afterOne(test){
    test.htmlStatus.innerHTML = test.state
    
    colors = {
        passed:    "#7F7",
        failed:    "#F77",
        exception: "#FF7"
    }
    
    color = colors[test.state]
    if (color) test.htmlRow.style.backgroundColor = color
})

//----------------------------------------------------------------------------
// update the elapsed time text
//----------------------------------------------------------------------------
oo.addMethod(HtmlTestLogger, function updateElapsed() {
    this.spanTimeElapsed.innerHTML = Math.round(
        new Date().getTime() - this.timeStarted.getTime()
    )
})

//----------------------------------------------------------------------------
// create an HTML time structure
//----------------------------------------------------------------------------
function createTimeStructureHTML(parentElement, label) {
    var para = document.createElement("p")
    var text = document.createTextNode(label)
    var span = document.createElement("span")
    
    para.appendChild(text)
    para.appendChild(span)
    parentElement.appendChild(para)
    
    return span
}



//----------------------------------------------------------------------------
// test objects are used throughout this module.  A test object models an 
// individual test function and has the following properties:
//
//    name:      name of the test function 
//    func:      the actual test function
//    container: object that contains the test function
//    state:     state of the test ("waiting", "passed", "failed", "exception")
//    exception: exception that occurred while running the test
//----------------------------------------------------------------------------
